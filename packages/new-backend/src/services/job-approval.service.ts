import { getDatabase, platformDb } from '../config/database'
import { approvalRequests, jobDefinitions, jobExecutions } from '../db/schema'
import { eq } from 'drizzle-orm'
import { Effect } from 'effect'
import { addJob } from './queue.service'
import * as approvalService from './approval.service'
import { ApprovalRepository } from '@/repositories/approval.repository'

export type JobApprovalPolicy = {
    impactLevel: 'low' | 'medium' | 'high' | 'critical'
    approvalsRequired: number
    slaHours: number
    escalationAfterHours: number
    requireDecisionComment: boolean
}

/**
 * Check if a job requires approval before execution.
 * 
 * @param jobDefinitionId - The ID of the job definition
 * @returns A Promise resolving to true if approval is required
 */
export const requiresApproval = async (jobDefinitionId: string, tenantId: string): Promise<boolean> => {
    const [definition] = await platformDb
        .select({ requiresApproval: jobDefinitions.requiresApproval })
        .from(jobDefinitions)
        .where(eq(jobDefinitions.id, jobDefinitionId))
        .limit(1)

    return definition?.requiresApproval ?? false
}

/**
 * Create an approval request for a job execution.
 * 
 * @param params - Parameters for creating the approval request
 * @param params.jobDefinitionId - The job definition ID
 * @param params.executionId - The job execution ID
 * @param params.triggeredBy - The user who triggered the job
 * @param params.tenantId - The tenant ID
 * @param params.parameters - Optional job parameters
 * @returns A Promise resolving to the created approval request or null if no approval needed
 * @throws Error if definition not found or matrix not configured
 */
export const createJobApprovalRequest = async (params: {
    jobDefinitionId: string
    executionId: string
    triggeredBy: string
    tenantId: string
    parameters?: any
    approvalPolicy?: JobApprovalPolicy
}) => {
    const { jobDefinitionId, executionId, triggeredBy, tenantId, parameters, approvalPolicy } = params
    const tenantDb = getDatabase(tenantId)

    // Get job definition (platform DB)
    const [definition] = await platformDb
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
    // Unwrap the effect since this service method is async and returns the result directly
    const impactLevel = approvalPolicy?.impactLevel
        || (definition.priority === 'CRITICAL' ? 'critical' :
            definition.priority === 'HIGH' ? 'high' : 'medium')

    const now = Date.now()
    const expiresAt = new Date(now + (approvalPolicy?.slaHours || 24) * 60 * 60 * 1000)
    const escalationAfterHours = approvalPolicy?.escalationAfterHours
        || Math.max(1, Math.floor((approvalPolicy?.slaHours || 24) / 2))

    const approvalRequest = await Effect.runPromise(approvalService.createApprovalRequest({
        tenantId,
        entityType: 'job_execution',
        entityId: executionId,
        title: `Execute Job: ${definition.name}`,
        description: `Requesting approval to execute ${definition.jobType}${parameters ? ` with parameters: ${JSON.stringify(parameters)}` : ''}`,
        requestedBy: triggeredBy,
        impactLevel,
        requestData: {
            jobDefinitionId,
            jobType: definition.jobType,
            approvalMatrixId: definition.approvalMatrixId, // Store in requestData
            parameters,
            jobApprovalPolicy: {
                impactLevel,
                approvalsRequired: approvalPolicy?.approvalsRequired || 1,
                slaHours: approvalPolicy?.slaHours || 24,
                escalationAfterHours,
                requireDecisionComment: approvalPolicy?.requireDecisionComment || false,
                escalationTriggeredAt: null,
                escalationCount: 0,
            },
        }
    }))

    const mergedRequestData = {
        ...(approvalRequest.requestData || {}),
        jobApprovalPolicy: {
            impactLevel,
            approvalsRequired: approvalPolicy?.approvalsRequired || 1,
            slaHours: approvalPolicy?.slaHours || 24,
            escalationAfterHours,
            requireDecisionComment: approvalPolicy?.requireDecisionComment || false,
            escalationTriggeredAt: null,
            escalationCount: 0,
        },
    }

    const [updated] = await tenantDb
        .update(approvalRequests)
        .set({
            impactLevel,
            approvalsRequired: approvalPolicy?.approvalsRequired || approvalRequest.approvalsRequired || 1,
            expiresAt,
            requestData: mergedRequestData,
        })
        .where(eq(approvalRequests.id, approvalRequest.id))
        .returning()

    return updated || approvalRequest
}

/**
 * Handle approval completion - queue the job if approved.
 * 
 * @param approvalRequestId - The approval request ID
 * @param status - The approval status ('approved' or 'rejected')
 * @param approvedBy - The user who approved/rejected
 * @returns A Promise resolving when handling is complete
 */
export const handleJobApprovalComplete = async (
    approvalRequestId: string,
    status: 'approved' | 'rejected',
    approvedBy?: string,
    input?: { comment?: string }
) => {
    if (!approvedBy) {
        throw new Error('Approver user ID is required')
    }

    console.log(`[JobApproval] Handling approval ${approvalRequestId} - status: ${status}`)

    const request = await ApprovalRepository.findRequestById(approvalRequestId)
    if (!request) {
        throw new Error(`Approval request ${approvalRequestId} not found`)
    }

    const tenantDb = getDatabase(request.tenantId || null)
    const policy = request.requestData && typeof request.requestData === 'object'
        ? (request.requestData as any).jobApprovalPolicy
        : undefined

    if (policy?.requireDecisionComment && !(input?.comment || '').trim()) {
        throw new Error('Comment is required to approve or reject this job')
    }

    const now = new Date()
    if (request.status === 'pending' && request.expiresAt && new Date(request.expiresAt).getTime() <= now.getTime()) {
        await tenantDb.update(approvalRequests)
            .set({
                status: 'expired',
                completedAt: now,
            })
            .where(eq(approvalRequests.id, approvalRequestId))

        await platformDb.update(jobExecutions)
            .set({
                status: 'failed',
                approvalStatus: 'rejected',
                endTime: now,
                error: 'Approval SLA expired before required approvals were collected',
            })
            .where(eq(jobExecutions.approvalRequestId, approvalRequestId))

        return {
            completed: true,
            status: 'expired',
            queued: false,
            approvalsRequired: Number(request.approvalsRequired || 1),
            approvalsReceived: Number(request.approvalsReceived || 0),
            remainingApprovals: 0,
        }
    }

    const action = status === 'approved' ? 'approve' : 'reject'
    const actionResult = await Effect.runPromise(approvalService.processApprovalAction({
        requestId: approvalRequestId,
        approverId: approvedBy,
        action,
        comment: input?.comment,
    }))

    const latestRequest = await ApprovalRepository.findRequestById(approvalRequestId)

    // Find job execution linked to this approval (platform DB)
    const [execution] = await platformDb
        .select()
        .from(jobExecutions)
        .where(eq(jobExecutions.approvalRequestId, approvalRequestId))
        .limit(1)

    if (!execution) {
        console.warn(`[JobApproval] No job execution found for approval ${approvalRequestId}`)
        return {
            completed: actionResult.completed,
            status: actionResult.status,
            queued: false,
            approvalsRequired: Number(latestRequest?.approvalsRequired || request.approvalsRequired || 1),
            approvalsReceived: Number(latestRequest?.approvalsReceived || request.approvalsReceived || 0),
            remainingApprovals: Math.max(0, Number(latestRequest?.approvalsRequired || 1) - Number(latestRequest?.approvalsReceived || 0)),
        }
    }

    if (status === 'approved' && actionResult.completed) {
        console.log(`[JobApproval] Queueing job ${execution.id}`)

        // Queue the job to BullMQ
        const job = await addJob(execution.jobType, {
            definitionId: execution.jobDefinitionId,
            tenantId: execution.tenantId,
            parameters: execution.parameters || {},
        }, {
            jobId: execution.id, // Use execution ID as job ID for tracking
            priority: 1, // High priority for approved jobs
        })

        // Update execution status (platform DB)
        await platformDb.update(jobExecutions)
            .set({
                status: 'pending',
                approvalStatus: 'approved',
                approvedAt: new Date(),
                approvedBy: approvedBy || null,
                error: null,
            })
            .where(eq(jobExecutions.id, execution.id))

        console.log(`[JobApproval] Job ${execution.id} queued successfully`)
        return {
            completed: true,
            status: 'approved',
            queued: true,
            approvalsRequired: Number(latestRequest?.approvalsRequired || request.approvalsRequired || 1),
            approvalsReceived: Number(latestRequest?.approvalsReceived || request.approvalsReceived || 1),
            remainingApprovals: 0,
        }
    } else if (status === 'approved' && !actionResult.completed) {
        await platformDb.update(jobExecutions)
            .set({
                status: 'pending_approval',
                approvalStatus: 'pending',
            })
            .where(eq(jobExecutions.id, execution.id))

        return {
            completed: false,
            status: 'pending',
            queued: false,
            approvalsRequired: Number(latestRequest?.approvalsRequired || request.approvalsRequired || 1),
            approvalsReceived: Number(latestRequest?.approvalsReceived || request.approvalsReceived || 0),
            remainingApprovals: Math.max(0, Number(latestRequest?.approvalsRequired || 1) - Number(latestRequest?.approvalsReceived || 0)),
        }
    } else {
        console.log(`[JobApproval] Job ${execution.id} rejected`)

        // Mark as rejected (platform DB)
        await platformDb.update(jobExecutions)
            .set({
                status: 'rejected',
                approvalStatus: 'rejected',
                endTime: new Date(),
                error: input?.comment ? `Rejected: ${input.comment}` : 'Rejected by approver',
            })
            .where(eq(jobExecutions.id, execution.id))

        return {
            completed: true,
            status: 'rejected',
            queued: false,
            approvalsRequired: Number(latestRequest?.approvalsRequired || request.approvalsRequired || 1),
            approvalsReceived: Number(latestRequest?.approvalsReceived || request.approvalsReceived || 0),
            remainingApprovals: 0,
        }
    }
}

/**
 * Get pending job executions awaiting approval.
 * 
 * @param tenantId - The tenant ID
 * @returns A Promise resolving to an array of pending job executions
 */
export const getPendingJobApprovals = async (tenantId: string) => {
    return await getDatabase(tenantId)
        .select()
        .from(jobExecutions)
        .where(eq(jobExecutions.approvalStatus, 'pending'))
        .orderBy(jobExecutions.startTime)
}

/**
 * Check auto-approval conditions.
 * Returns true if the job can be auto-approved based on conditions.
 * 
 * @param jobDefinitionId - The job definition ID
 * @param triggeredBy - The user who triggered the job
 * @param parameters - Job parameters
 * @returns A Promise resolving to true if auto-approval conditions are met
 */
export const checkAutoApprovalConditions = async (
    jobDefinitionId: string,
    tenantId: string,
    triggeredBy: string,
    parameters?: any
): Promise<boolean> => {
    const [definition] = await platformDb
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
