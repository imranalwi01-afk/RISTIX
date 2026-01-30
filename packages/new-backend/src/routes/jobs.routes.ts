import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { zValidator } from '@hono/zod-validator'
import type { AppContext } from '../app'
import { authMiddleware, tenantMiddleware } from '../middleware'
import { db } from '../config/database'
import { jobDefinitions, jobExecutions } from '../db/schema'
import { eq, desc, and, like, sql } from 'drizzle-orm'
import { addJob, getJob } from '../services/queue.service'

export const jobsRoutes = new OpenAPIHono<AppContext>()

// Apply auth middleware
jobsRoutes.use('*', authMiddleware)
jobsRoutes.use('*', tenantMiddleware)

// =============================================================================
// SCHEMA DEFINITIONS
// =============================================================================

const JobDefinitionSchema = z.object({
    id: z.string().openapi({ example: '123e4567-e89b-12d3-a456-426614174000' }),
    name: z.string().openapi({ example: 'End of Day Processing' }),
    description: z.string().nullable().optional(),
    jobType: z.string().openapi({ example: 'EOD' }),
    cronExpression: z.string().nullable().optional(),
    defaultParameters: z.any().optional(),
    priority: z.string().nullable().optional(),
    timeout: z.number().nullable().optional(),
    maxRetries: z.number().nullable().optional(),
    requiresApproval: z.boolean().optional(),
    isEnabled: z.boolean().optional(),
    tenantId: z.string().nullable().optional(),
    createdBy: z.string().nullable().optional(),
    createdAt: z.string().optional(), // Date -> string
    updatedAt: z.string().optional(),
}).openapi('JobDefinition')

const CreateJobDefinitionSchema = z.object({
    name: z.string(),
    description: z.string().optional(),
    jobType: z.string(),
    cronExpression: z.string().optional(),
    defaultParameters: z.any().optional(),
    priority: z.string().optional(),
    timeout: z.number().optional(),
    maxRetries: z.number().optional(),
}).openapi('CreateJobDefinitionInput')

const JobExecutionSchema = z.object({
    id: z.string().openapi({ example: '123e4567-e89b-12d3-a456-426614174000' }),
    jobDefinitionId: z.string(),
    jobName: z.string(),
    jobType: z.string(),
    status: z.string(),
    progress: z.number().nullable().optional(),
    parameters: z.any().optional(),
    triggeredBy: z.string().nullable().optional(),
    approvalRequestId: z.string().nullable().optional(),
    approvalStatus: z.string().nullable().optional(),
    startTime: z.string().nullable().optional(),
    endTime: z.string().nullable().optional(),
    result: z.any().optional(),
    error: z.string().nullable().optional(),
    tenantId: z.string().nullable().optional(),
}).openapi('JobExecution')

const JobControlSchema = z.object({
    action: z.enum(['pause', 'resume', 'stop'])
}).openapi('JobControlInput')

const MetricsSchema = z.object({
    activeJobs: z.number(),
    queuedJobs: z.number(),
    completedJobsToday: z.number(),
    failedJobsToday: z.number(),
    cpuUsage: z.number(),
    memoryUsage: z.number(),
    diskUsage: z.number(),
    averageExecutionTime: z.number(),
    throughputPerHour: z.number(),
}).openapi('JobMetrics')

// =============================================================================
// ROUTES
// =============================================================================

// =============================================================================
// JOB EXECUTIONS
// =============================================================================

/**
 * GET /executions - Get job execution history
 */
jobsRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/executions',
        tags: ['Jobs'],
        summary: 'List Job Executions',
        security: [{ BearerAuth: [] }],
        request: {
            query: z.object({
                page: z.string().optional().default('1').openapi({ example: '1' }),
                limit: z.string().optional().default('50').openapi({ example: '50' }),
                status: z.string().optional(),
                jobType: z.string().optional(),
            }) as any,
        },
        responses: {
            200: {
                content: {
                    'application/json': {
                        schema: z.array(JobExecutionSchema),
                    },
                },
                description: 'List of executions',
            },
        },
    }),
    async (c) => {
        const page = parseInt(c.req.query('page') || '1')
        const limit = parseInt(c.req.query('limit') || '50')
        const status = c.req.query('status')
        const jobType = c.req.query('jobType')
        const offset = (page - 1) * limit

        // Build where conditions
        const conditions = []
        if (status) { conditions.push(eq(jobExecutions.status, status)) }
        if (jobType) { conditions.push(eq(jobExecutions.jobType, jobType)) }

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined

        const executions = await db
            .select()
            .from(jobExecutions)
            .where(whereClause)
            .orderBy(desc(jobExecutions.startTime))
            .limit(limit)
            .offset(offset)

        return c.json(executions.map(e => ({
            ...e,
            startTime: e.startTime ? e.startTime.toISOString() : null,
            endTime: e.endTime ? e.endTime.toISOString() : null,
            progress: e.progress ?? null,
            error: e.error ?? null,
            result: e.result ?? null,
            parameters: e.parameters ?? null,
            approvalRequestId: e.approvalRequestId ?? null,
            approvalStatus: e.approvalStatus ?? null,
            triggeredBy: e.triggeredBy ?? null,
            tenantId: e.tenantId ?? null,
        }) as any))
    }
)

/**
 * GET /executions/:id - Get specific execution
 */
jobsRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/executions/{id}',
        tags: ['Jobs'],
        summary: 'Get Job Execution',
        security: [{ BearerAuth: [] }],
        request: {
            params: z.object({
                id: z.string().openapi({ param: { name: 'id', in: 'path' } }),
            }) as any,
        },
        responses: {
            200: {
                content: {
                    'application/json': {
                        schema: JobExecutionSchema,
                    },
                },
                description: 'Execution details',
            },
            404: { description: 'Execution not found' }
        },
    }),
    async (c) => {
        const id = c.req.param('id')!

        const execution = await db
            .select()
            .from(jobExecutions)
            .where(eq(jobExecutions.id, id))
            .limit(1)

        if (!execution.length) {
            return c.json({ error: 'Execution not found' } as any, 404)
        }

        const e = execution[0]
        return c.json({
            ...e,
            startTime: e.startTime ? e.startTime.toISOString() : null,
            endTime: e.endTime ? e.endTime.toISOString() : null,
            progress: e.progress ?? null,
            error: e.error ?? null,
            result: e.result ?? null,
            parameters: e.parameters ?? null,
            approvalRequestId: e.approvalRequestId ?? null,
            approvalStatus: e.approvalStatus ?? null,
            triggeredBy: e.triggeredBy ?? null,
            tenantId: e.tenantId ?? null,
        }) as any
    }
)

// =============================================================================
// JOB DEFINITIONS
// =============================================================================

/**
 * GET /definitions - Get job definitions
 */
jobsRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/definitions',
        tags: ['Jobs'],
        summary: 'List Job Definitions',
        security: [{ BearerAuth: [] }],
        responses: {
            200: {
                content: {
                    'application/json': {
                        schema: z.array(JobDefinitionSchema),
                    },
                },
                description: 'List of definitions',
            },
        },
    }),
    async (c) => {
        const definitions = await db
            .select()
            .from(jobDefinitions)
            .where(eq(jobDefinitions.isEnabled, true))
            .orderBy(jobDefinitions.name)

        return c.json(definitions.map(d => ({
            ...d,
            description: d.description ?? null,
            cronExpression: d.cronExpression ?? null,
            defaultParameters: d.defaultParameters ?? null,
            priority: d.priority ?? null,
            timeout: d.timeout ?? null,
            maxRetries: d.maxRetries ?? null,
            createdAt: d.createdAt?.toISOString() ?? new Date().toISOString(),
            updatedAt: d.updatedAt?.toISOString() ?? new Date().toISOString(),
            tenantId: d.tenantId ?? null,
            createdBy: d.createdBy ?? null,
        }) as any))
    }
)

/**
 * GET /definitions/:id - Get specific definition
 */
jobsRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/definitions/{id}',
        tags: ['Jobs'],
        summary: 'Get Job Definition',
        security: [{ BearerAuth: [] }],
        request: {
            params: z.object({
                id: z.string().openapi({ param: { name: 'id', in: 'path' } }),
            }) as any,
        },
        responses: {
            200: {
                content: {
                    'application/json': {
                        schema: JobDefinitionSchema,
                    },
                },
                description: 'Definition details',
            },
            404: { description: 'Definition not found' }
        },
    }),
    async (c) => {
        const id = c.req.param('id')!

        const definition = await db
            .select()
            .from(jobDefinitions)
            .where(eq(jobDefinitions.id, id))
            .limit(1)

        if (!definition.length) {
            return c.json({ error: 'Definition not found' } as any, 404)
        }

        const d = definition[0]
        return c.json({
            ...d,
            description: d.description ?? null,
            cronExpression: d.cronExpression ?? null,
            defaultParameters: d.defaultParameters ?? null,
            priority: d.priority ?? null,
            timeout: d.timeout ?? null,
            maxRetries: d.maxRetries ?? null,
            createdAt: d.createdAt?.toISOString() ?? new Date().toISOString(),
            updatedAt: d.updatedAt?.toISOString() ?? new Date().toISOString(),
            tenantId: d.tenantId ?? null,
            createdBy: d.createdBy ?? null,
        }) as any
    }
)

/**
 * POST /definitions - Create job definition
 */
jobsRoutes.openapi(
    createRoute({
        method: 'post',
        path: '/definitions',
        tags: ['Jobs'],
        summary: 'Create Job Definition',
        security: [{ BearerAuth: [] }],
        request: {
            body: {
                content: {
                    'application/json': {
                        schema: CreateJobDefinitionSchema,
                    },
                },
            },
        },
        responses: {
            201: {
                content: {
                    'application/json': {
                        schema: JobDefinitionSchema,
                    },
                },
                description: 'Job definition created',
            },
        },
    }),
    async (c) => {
        const tenantId = c.get('tenantId') || '00000000-0000-0000-0000-000000000000'
        const userId = c.get('userId')
        const body = c.req.valid('json')

        const [newDef] = await db
            .insert(jobDefinitions)
            .values({
                ...body,
                tenantId,
                createdBy: userId,
            })
            .returning() as any

        return c.json({
            ...newDef,
            description: newDef.description ?? null,
            cronExpression: newDef.cronExpression ?? null,
            defaultParameters: newDef.defaultParameters ?? null,
            priority: newDef.priority ?? null,
            timeout: newDef.timeout ?? null,
            maxRetries: newDef.maxRetries ?? null,
            createdAt: newDef.createdAt.toISOString(),
            updatedAt: newDef.updatedAt.toISOString(),
            tenantId: newDef.tenantId ?? null,
            createdBy: newDef.createdBy ?? null,
        }, 201) as any
    }
)

// =============================================================================
// JOB CONTROL
// =============================================================================

/**
 * POST /:id/run - Trigger a job (with approval support)
 */
jobsRoutes.openapi(
    createRoute({
        method: 'post',
        path: '/{id}/run',
        tags: ['Jobs'],
        summary: 'Run Job',
        security: [{ BearerAuth: [] }],
        request: {
            params: z.object({
                id: z.string().openapi({ param: { name: 'id', in: 'path' } }),
            }) as any,
        },
        responses: {
            200: {
                description: 'Job trigger result',
                content: {
                    'application/json': {
                        schema: z.object({
                            success: z.boolean(),
                            jobId: z.string().optional(),
                            executionId: z.string().optional(),
                            approvalRequestId: z.string().optional(),
                            status: z.string().optional(),
                            message: z.string().optional(),
                        }) as any
                    }
                }
            }
        },
    }),
    async (c) => {
        const id = c.req.param('id')!
        const userId = c.get('userId') || 'system'
        const tenantId = c.get('tenantId') || '00000000-0000-0000-0000-000000000000'

        // Get job definition
        const [definition] = await db
            .select()
            .from(jobDefinitions)
            .where(eq(jobDefinitions.id, id))
            .limit(1)

        if (!definition) {
            return c.json({ error: 'Job definition not found' } as any, 404)
        }

        if (!definition.isEnabled) {
            return c.json({ error: 'Job is disabled' } as any, 400)
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
                }) as any

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
                }) as any

                return c.json({
                    success: true,
                    status: 'pending_approval',
                    executionId,
                    approvalRequestId: approvalRequest!.id,
                    message: 'Approval request created. Job will execute after approval.'
                }) as any
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
        }) as any

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
        }) as any

        return c.json({
            success: true,
            jobId: job.id,
            executionId,
            message: 'Job queued successfully'
        }) as any
    }
)

/**
 * POST /:id/control - Control job (pause/resume/stop)
 */
jobsRoutes.openapi(
    createRoute({
        method: 'post',
        path: '/{id}/control',
        tags: ['Jobs'],
        summary: 'Control Job',
        security: [{ BearerAuth: [] }],
        request: {
            params: z.object({
                id: z.string().openapi({ param: { name: 'id', in: 'path' } }),
            }) as any,
            body: {
                content: {
                    'application/json': {
                        schema: JobControlSchema,
                    },
                },
            },
        },
        responses: {
            200: {
                description: 'Control signal sent',
                content: {
                    'application/json': {
                        schema: z.object({
                            success: z.boolean(),
                            message: z.string(),
                        }) as any
                    }
                }
            },
            404: { description: 'Job not found' }
        },
    }),
    async (c) => {
        const id = c.req.param('id')!
        const { action } = c.req.valid('json')

        const job = await getJob(id)

        if (!job) {
            return c.json({ error: 'Job not found' } as any, 404)
        }

        // Control actions would be implemented here
        return c.json({
            success: true,
            message: `Job ${action} signal sent`
        }) as any
    }
)

/**
 * POST /:id/toggle - Toggle job definition enabled status
 */
jobsRoutes.openapi(
    createRoute({
        method: 'post',
        path: '/{id}/toggle',
        tags: ['Jobs'],
        summary: 'Toggle Job',
        security: [{ BearerAuth: [] }],
        request: {
            params: z.object({
                id: z.string().openapi({ param: { name: 'id', in: 'path' } }),
            }) as any,
        },
        responses: {
            200: {
                content: {
                    'application/json': {
                        schema: z.object({
                            success: z.boolean(),
                            isEnabled: z.boolean(),
                        }) as any
                    }
                },
                description: 'Job toggled',
            },
            404: { description: 'Job definition not found' }
        },
    }),
    async (c) => {
        const id = c.req.param('id')!

        const [definition] = await db
            .select()
            .from(jobDefinitions)
            .where(eq(jobDefinitions.id, id))
            .limit(1)

        if (!definition) {
            return c.json({ error: 'Job definition not found' } as any, 404)
        }

        const [updated] = await db
            .update(jobDefinitions)
            .set({ isEnabled: !definition.isEnabled })
            .where(eq(jobDefinitions.id, id))
            .returning()

        return c.json({
            success: true,
            isEnabled: updated.isEnabled
        }) as any
    }
)

// =============================================================================
// APPROVAL INTEGRATION
// =============================================================================

/**
 * GET /executions/pending-approval - Get job executions awaiting approval
 */
jobsRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/executions/pending-approval',
        tags: ['Jobs'],
        summary: 'Pending Approvals',
        security: [{ BearerAuth: [] }],
        responses: {
            200: {
                content: {
                    'application/json': {
                        schema: z.array(JobExecutionSchema),
                    },
                },
                description: 'List of pending executions',
            },
        },
    }),
    async (c) => {
        const tenantId = c.get('tenantId') || '00000000-0000-0000-0000-000000000000'

        const pending = await db
            .select()
            .from(jobExecutions)
            .where(and(
                eq(jobExecutions.tenantId, tenantId),
                eq(jobExecutions.approvalStatus, 'pending')
            ))
            .orderBy(desc(jobExecutions.startTime))

        return c.json(pending.map(e => ({
            ...e,
            startTime: e.startTime ? e.startTime.toISOString() : null,
            endTime: e.endTime ? e.endTime.toISOString() : null,
            progress: e.progress ?? null,
            error: e.error ?? null,
            result: e.result ?? null,
            parameters: e.parameters ?? null,
            approvalRequestId: e.approvalRequestId ?? null,
            approvalStatus: e.approvalStatus ?? null,
            triggeredBy: e.triggeredBy ?? null,
            tenantId: e.tenantId ?? null,
        }) as any))
    }
)

/**
 * POST /executions/:id/approve - Approve a pending job execution
 */
jobsRoutes.openapi(
    createRoute({
        method: 'post',
        path: '/executions/{id}/approve',
        tags: ['Jobs'],
        summary: 'Approve Job',
        security: [{ BearerAuth: [] }],
        request: {
            params: z.object({
                id: z.string().openapi({ param: { name: 'id', in: 'path' } }),
            }) as any,
        },
        responses: {
            200: {
                content: {
                    'application/json': {
                        schema: z.object({
                            success: z.boolean(),
                            message: z.string(),
                        }) as any
                    }
                },
                description: 'Job approved',
            },
            404: { description: 'Execution not found' }
        },
    }),
    async (c) => {
        const id = c.req.param('id')!
        const userId = c.get('userId') || 'system'

        const [execution] = await db
            .select()
            .from(jobExecutions)
            .where(eq(jobExecutions.id, id))
            .limit(1)

        if (!execution) {
            return c.json({ error: 'Execution not found' } as any, 404)
        }

        if (execution.approvalStatus !== 'pending') {
            return c.json({ error: 'Execution is not pending approval' } as any, 400)
        }

        const jobApprovalService = await import('../services/job-approval.service')
        await jobApprovalService.handleJobApprovalComplete(
            execution.approvalRequestId!,
            'approved',
            userId
        )

        return c.json({
            success: true,
            message: 'Job approved and queued for execution'
        }) as any
    }
)

/**
 * POST /executions/:id/reject - Reject a pending job execution
 */
jobsRoutes.openapi(
    createRoute({
        method: 'post',
        path: '/executions/{id}/reject',
        tags: ['Jobs'],
        summary: 'Reject Job',
        security: [{ BearerAuth: [] }],
        request: {
            params: z.object({
                id: z.string().openapi({ param: { name: 'id', in: 'path' } }),
            }) as any,
        },
        responses: {
            200: {
                content: {
                    'application/json': {
                        schema: z.object({
                            success: z.boolean(),
                            message: z.string(),
                        }) as any
                    }
                },
                description: 'Job rejected',
            },
            404: { description: 'Execution not found' }
        },
    }),
    async (c) => {
        const id = c.req.param('id')!
        const userId = c.get('userId') || 'system'

        const [execution] = await db
            .select()
            .from(jobExecutions)
            .where(eq(jobExecutions.id, id))
            .limit(1)

        if (!execution) {
            return c.json({ error: 'Execution not found' } as any, 404)
        }

        if (execution.approvalStatus !== 'pending') {
            return c.json({ error: 'Execution is not pending approval' } as any, 400)
        }

        const jobApprovalService = await import('../services/job-approval.service')
        await jobApprovalService.handleJobApprovalComplete(
            execution.approvalRequestId!,
            'rejected',
            userId
        )

        return c.json({
            success: true,
            message: 'Job execution rejected'
        }) as any
    }
)

// =============================================================================
// METRICS
// =============================================================================

/**
 * GET /metrics - Get system metrics
 */
jobsRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/metrics',
        tags: ['Jobs'],
        summary: 'Job Metrics',
        security: [{ BearerAuth: [] }],
        responses: {
            200: {
                content: {
                    'application/json': {
                        schema: MetricsSchema,
                    },
                },
                description: 'System metrics',
            },
        },
    }),
    async (c) => {
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
            cpuUsage: 0,
            memoryUsage: 0,
            diskUsage: 0,
            averageExecutionTime: 0,
            throughputPerHour: 0,
        }) as any
    }
)
