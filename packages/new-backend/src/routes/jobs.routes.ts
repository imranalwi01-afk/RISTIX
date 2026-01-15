import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { Effect } from 'effect'
import type { AppContext } from '../app'
import { authMiddleware, tenantMiddleware } from '../middleware'
import { db } from '../config/database'
import { jobDefinitions, jobExecutions } from '../db/schema'
import { eq, desc, and, like, sql } from 'drizzle-orm'
import { addJob, getJob } from '../services/queue.service'

const app = new Hono<AppContext>()

// Apply auth middleware (optional - comment out for testing)
// app.use('*', authMiddleware)
// app.use('*', tenantMiddleware)

// =============================================================================
// JOB EXECUTIONS
// =============================================================================

// GET /executions - Get job execution history
app.get('/executions', async (c) => {
    const page = parseInt(c.req.query('page') || '1')
    const limit = parseInt(c.req.query('limit') || '50')
    const status = c.req.query('status')
    const jobType = c.req.query('jobType')

    const offset = (page - 1) * limit

    // Build where conditions
    const conditions = []
    if (status) {
        conditions.push(eq(jobExecutions.status, status))
    }
    if (jobType) {
        conditions.push(eq(jobExecutions.jobType, jobType))
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined

    const executions = await db
        .select()
        .from(jobExecutions)
        .where(whereClause)
        .orderBy(desc(jobExecutions.startTime))
        .limit(limit)
        .offset(offset)

    return c.json(executions)
})

// GET /executions/:id - Get specific execution
app.get('/executions/:id', async (c) => {
    const { id } = c.req.param()

    const execution = await db
        .select()
        .from(jobExecutions)
        .where(eq(jobExecutions.id, id))
        .limit(1)

    if (!execution.length) {
        return c.json({ error: 'Execution not found' }, 404)
    }

    return c.json(execution[0])
})

// =============================================================================
// JOB DEFINITIONS
// =============================================================================

// GET /definitions - Get job definitions
app.get('/definitions', async (c) => {
    const definitions = await db
        .select()
        .from(jobDefinitions)
        .where(eq(jobDefinitions.isEnabled, true))
        .orderBy(jobDefinitions.name)

    return c.json(definitions)
})

// GET /definitions/:id - Get specific definition
app.get('/definitions/:id', async (c) => {
    const { id } = c.req.param()

    const definition = await db
        .select()
        .from(jobDefinitions)
        .where(eq(jobDefinitions.id, id))
        .limit(1)

    if (!definition.length) {
        return c.json({ error: 'Definition not found' }, 404)
    }

    return c.json(definition[0])
})

// POST /definitions - Create job definition
app.post('/definitions', zValidator('json', z.object({
    name: z.string(),
    description: z.string().optional(),
    jobType: z.string(),
    cronExpression: z.string().optional(),
    defaultParameters: z.any().optional(),
    priority: z.string().optional(),
    timeout: z.number().optional(),
    maxRetries: z.number().optional(),
})), async (c) => {
    const tenantId = c.get('tenantId') || '00000000-0000-0000-0000-000000000000' // Fallback for testing
    const userId = c.get('userId')
    const body = c.req.valid('json')

    const [newDef] = await db
        .insert(jobDefinitions)
        .values({
            ...body,
            tenantId,
            createdBy: userId,
        })
        .returning()

    return c.json(newDef, 201)
})

// =============================================================================
// JOB CONTROL
// =============================================================================

// POST /:id/run - Trigger a job (with approval support)
app.post('/:id/run', async (c) => {
    const { id } = c.req.param()
    const userId = c.get('userId') || 'system'
    const tenantId = c.get('tenantId') || '00000000-0000-0000-0000-000000000000'

    // Get job definition
    const [definition] = await db
        .select()
        .from(jobDefinitions)
        .where(eq(jobDefinitions.id, id))
        .limit(1)

    if (!definition) {
        return c.json({ error: 'Job definition not found' }, 404)
    }

    if (!definition.isEnabled) {
        return c.json({ error: 'Job is disabled' }, 400)
    }

    // Generate execution ID
    const executionId = crypto.randomUUID()

    // Check if approval is required
    if (definition.requiresApproval) {
        // Import approval service
        const jobApprovalService = await import('../services/job-approval.service')

        // Check auto-approval conditions
        const canAutoApprove = await jobApprovalService.checkAutoApprovalConditions(
            definition.id,
            userId,
            definition.defaultParameters
        )

        if (!canAutoApprove) {
            // Create approval request
            const approvalRequest = await jobApprovalService.createJobApprovalRequest({
                jobDefinitionId: definition.id,
                executionId,
                triggeredBy: userId,
                tenantId,
                parameters: definition.defaultParameters
            })

            // Create execution record in pending_approval state
            await db.insert(jobExecutions).values({
                id: executionId,
                jobDefinitionId: definition.id,
                tenantId,
                jobName: definition.name,
                jobType: definition.jobType,
                status: 'pending_approval',
                progress: 0,
                parameters: definition.defaultParameters,
                triggeredBy: userId,
                approvalRequestId: approvalRequest!.id,
                approvalStatus: 'pending',
                startTime: new Date()
            })

            return c.json({
                success: true,
                status: 'pending_approval',
                executionId,
                approvalRequestId: approvalRequest!.id,
                message: 'Approval request created. Job will execute after approval.'
            })
        }
    }

    // No approval required or auto-approved - queue immediately
    const job = await addJob(definition.jobType, {
        definitionId: definition.id,
        tenantId,
        parameters: definition.defaultParameters,
    }, {
        jobId: executionId,
        priority: definition.priority === 'HIGH' ? 1 : definition.priority === 'CRITICAL' ? 0 : 5,
        attempts: (definition.maxRetries || 0) + 1,
        timeout: (definition.timeout || 3600) * 1000,
    })

    // Create execution record
    await db.insert(jobExecutions).values({
        id: executionId,
        jobDefinitionId: definition.id,
        tenantId,
        jobName: definition.name,
        jobType: definition.jobType,
        status: 'waiting',
        progress: 0,
        parameters: definition.defaultParameters,
        triggeredBy: userId,
        approvalStatus: 'not_required',
        startTime: new Date()
    })

    return c.json({
        success: true,
        jobId: job.id,
        executionId,
        message: 'Job queued successfully'
    })
})

// POST /:id/control - Control job (pause/resume/stop)
app.post('/:id/control', zValidator('json', z.object({
    action: z.enum(['pause', 'resume', 'stop'])
})), async (c) => {
    const { id } = c.req.param()
    const { action } = c.req.valid('json')

    const job = await getJob(id)

    if (!job) {
        return c.json({ error: 'Job not found' }, 404)
    }

    // Control actions would be implemented here
    // For now, just acknowledge
    return c.json({
        success: true,
        message: `Job ${action} signal sent`
    })
})

// POST /:id/toggle - Toggle job definition enabled status
app.post('/:id/toggle', async (c) => {
    const { id } = c.req.param()

    const [definition] = await db
        .select()
        .from(jobDefinitions)
        .where(eq(jobDefinitions.id, id))
        .limit(1)

    if (!definition) {
        return c.json({ error: 'Job definition not found' }, 404)
    }

    const [updated] = await db
        .update(jobDefinitions)
        .set({ isEnabled: !definition.isEnabled })
        .where(eq(jobDefinitions.id, id))
        .returning()

    return c.json({
        success: true,
        isEnabled: updated.isEnabled
    })
})

// =============================================================================
// APPROVAL INTEGRATION
// =============================================================================

// GET /executions/pending-approval - Get job executions awaiting approval
app.get('/executions/pending-approval', async (c) => {
    const tenantId = c.get('tenantId') || '00000000-0000-0000-0000-000000000000'

    const pending = await db
        .select()
        .from(jobExecutions)
        .where(and(
            eq(jobExecutions.tenantId, tenantId),
            eq(jobExecutions.approvalStatus, 'pending')
        ))
        .orderBy(desc(jobExecutions.startTime))

    return c.json(pending)
})

// POST /executions/:id/approve - Approve a pending job execution
app.post('/executions/:id/approve', async (c) => {
    const { id } = c.req.param()
    const userId = c.get('userId') || 'system'

    const [execution] = await db
        .select()
        .from(jobExecutions)
        .where(eq(jobExecutions.id, id))
        .limit(1)

    if (!execution) {
        return c.json({ error: 'Execution not found' }, 404)
    }

    if (execution.approvalStatus !== 'pending') {
        return c.json({ error: 'Execution is not pending approval' }, 400)
    }

    // Import and use approval service
    const jobApprovalService = await import('../services/job-approval.service')
    await jobApprovalService.handleJobApprovalComplete(
        execution.approvalRequestId!,
        'approved',
        userId
    )

    return c.json({
        success: true,
        message: 'Job approved and queued for execution'
    })
})

// POST /executions/:id/reject - Reject a pending job execution
app.post('/executions/:id/reject', async (c) => {
    const { id } = c.req.param()
    const userId = c.get('userId') || 'system'

    const [execution] = await db
        .select()
        .from(jobExecutions)
        .where(eq(jobExecutions.id, id))
        .limit(1)

    if (!execution) {
        return c.json({ error: 'Execution not found' }, 404)
    }

    if (execution.approvalStatus !== 'pending') {
        return c.json({ error: 'Execution is not pending approval' }, 400)
    }

    // Import and use approval service
    const jobApprovalService = await import('../services/job-approval.service')
    await jobApprovalService.handleJobApprovalComplete(
        execution.approvalRequestId!,
        'rejected',
        userId
    )

    return c.json({
        success: true,
        message: 'Job execution rejected'
    })
})

// =============================================================================
// METRICS
// =============================================================================

// GET /metrics - Get system metrics
app.get('/metrics', async (c) => {
    const [activeJobs] = await db
        .select({ count: sql<number>`count(*)` })
        .from(jobExecutions)
        .where(eq(jobExecutions.status, 'active'))

    const [queuedJobs] = await db
        .select({ count: sql<number>`count(*)` })
        .from(jobExecutions)
        .where(eq(jobExecutions.status, 'waiting'))

    const [completedToday] = await db
        .select({ count: sql<number>`count(*)` })
        .from(jobExecutions)
        .where(and(
            eq(jobExecutions.status, 'completed'),
            sql`${jobExecutions.startTime} >= CURRENT_DATE`
        ))

    const [failedToday] = await db
        .select({ count: sql<number>`count(*)` })
        .from(jobExecutions)
        .where(and(
            eq(jobExecutions.status, 'failed'),
            sql`${jobExecutions.startTime} >= CURRENT_DATE`
        ))

    return c.json({
        activeJobs: Number(activeJobs.count) || 0,
        queuedJobs: Number(queuedJobs.count) || 0,
        completedJobsToday: Number(completedToday.count) || 0,
        failedJobsToday: Number(failedToday.count) || 0,
        cpuUsage: 0, // TODO: Implement real metrics
        memoryUsage: 0,
        diskUsage: 0,
        averageExecutionTime: 0,
        throughputPerHour: 0,
    })
})

export default app
