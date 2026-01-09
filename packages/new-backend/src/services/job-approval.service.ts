import { db } from '../config/database'
import { jobDefinitions, jobExecutions } from '../db/schema'
import { eq } from 'drizzle-orm'
import { addJob } from './queue.service'
import * as approvalService from './approval.service'

/**
 * Check if a job requires approval before execution
 */
export const requiresApproval = async (jobDefinitionId: string): Promise<boolean> => {
    const [definition] = await db
        .select({ requiresApproval: jobDefinitions.requiresApproval })
        .from(jobDefinitions)
        .where(eq(jobDefinitions.id, jobDefinitionId))
        .limit(1)

    return definition?.requiresApproval ?? false
}

/**
 * Create an approval request for a job execution
 */
export const createJobApprovalRequest = async (params: {
    jobDefinitionId: string
    executionId: string
    triggeredBy: string
    tenantId: string
    parameters?: any
}) => {
    const { jobDefinitionId, executionId, triggeredBy, tenantId, parameters } = params

    // Get job definition
    const [definition] = await db
        .select()
        .from(jobDefinitions)
        .where(eq(jobDefinitions.id, jobDefinitionId))
        .limit(1)

    if (!definition) {
        throw new Error(`Job definition ${jobDefinitionId} not found`)
    }

    if (!definition.requiresApproval) {
        return null // No approval needed
    }

    if (!definition.approvalMatrixId) {
        throw new Error(`Job ${definition.name} requires approval but no approval matrix is configured`)
    }

    // Create approval request
    const approvalRequest = await approvalService.createApprovalRequest({
        matrixId: definition.approvalMatrixId,
        tenantId,
        entityType: 'job_execution',
        entityId: executionId,
        title: `Execute Job: ${definition.name}`,
        description: `Requesting approval to execute ${definition.jobType}${parameters ? ` with parameters: ${JSON.stringify(parameters)}` : ''}`,
        requestedBy: triggeredBy,
        impactLevel: definition.priority === 'CRITICAL' ? 'critical' :
            definition.priority === 'HIGH' ? 'high' : 'medium',
        requestData: {
            jobDefinitionId,
            jobType: definition.jobType,
            parameters
        }
    })

    return approvalRequest
}

/**
 * Handle approval completion - queue the job if approved
 */
export const handleJobApprovalComplete = async (
    approvalRequestId: string,
    status: 'approved' | 'rejected',
    approvedBy?: string
) => {
    console.log(`[JobApproval] Handling approval ${approvalRequestId} - status: ${status}`)

    // Find job execution linked to this approval
    const [execution] = await db
        .select()
        .from(jobExecutions)
        .where(eq(jobExecutions.approvalRequestId, approvalRequestId))
        .limit(1)

    if (!execution) {
        console.warn(`[JobApproval] No job execution found for approval ${approvalRequestId}`)
        return
    }

    if (status === 'approved') {
        console.log(`[JobApproval] Queueing job ${execution.id}`)

        // Queue the job to BullMQ
        const job = await addJob(execution.jobType, execution.parameters || {}, {
            jobId: execution.id, // Use execution ID as job ID for tracking
            priority: 1, // High priority for approved jobs
        })

        // Update execution status
        await db.update(jobExecutions)
            .set({
                status: 'queued',
                approvalStatus: 'approved',
                approvedAt: new Date(),
                approvedBy: approvedBy || null
            })
            .where(eq(jobExecutions.id, execution.id))

        console.log(`[JobApproval] Job ${execution.id} queued successfully`)
    } else {
        console.log(`[JobApproval] Job ${execution.id} rejected`)

        // Mark as rejected
        await db.update(jobExecutions)
            .set({
                status: 'rejected',
                approvalStatus: 'rejected',
                endTime: new Date()
            })
            .where(eq(jobExecutions.id, execution.id))
    }
}

/**
 * Get pending job executions awaiting approval
 */
export const getPendingJobApprovals = async (tenantId: string) => {
    return await db
        .select()
        .from(jobExecutions)
        .where(eq(jobExecutions.approvalStatus, 'pending'))
        .orderBy(jobExecutions.startTime)
}

/**
 * Check auto-approval conditions
 * Returns true if the job can be auto-approved based on conditions
 */
export const checkAutoApprovalConditions = async (
    jobDefinitionId: string,
    triggeredBy: string,
    parameters?: any
): Promise<boolean> => {
    const [definition] = await db
        .select()
        .from(jobDefinitions)
        .where(eq(jobDefinitions.id, jobDefinitionId))
        .limit(1)

    if (!definition?.autoApproveConditions) {
        return false
    }

    const conditions = definition.autoApproveConditions as any

    // Example auto-approval rules:
    // 1. If triggered by system user
    if (conditions.allowSystemUser && triggeredBy === 'system') {
        return true
    }

    // 2. If parameters match certain criteria
    if (conditions.parameterRules) {
        // Implement parameter-based auto-approval logic
        // For now, return false
    }

    return false
}
