import { Queue, Worker } from 'bullmq'
import Redis from 'ioredis'
import { Effect } from 'effect'

/**
 * Approval job queue configuration for notifications, ECL calculations, and workflows
 */

// Redis connection
const redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
})

// Queue instances
export const approvalNotificationQueue = new Queue('approval-notifications', { connection: redis })
export const eclCalculationQueue = new Queue('ecl-calculations', { connection: redis })
export const complianceCheckQueue = new Queue('compliance-checks', { connection: redis })

// Job data types
export interface ApprovalNotificationJob {
    workflowId: string
    workflowName: string
    tenantId: string
    approvalRequestId: string
    action: 'APPROVED' | 'REJECTED' | 'REQUESTED_CHANGES'
    approverUserId: string
    notifyUser: string // userId to notify
    email?: string
    template: 'approval_pending' | 'approval_approved' | 'approval_rejected'
}

export interface ECLCalculationJob {
    workflowId: string
    tenantId: string
    entityId: string // e.g., loan ID, portfolio ID
    eclRunId?: string
    parameters?: Record<string, unknown> // ECL calculation params
    storedProcedure?: string // name of SP to run (e.g., 'calculate_expected_credit_loss')
}

export interface ComplianceCheckJob {
    workflowId: string
    tenantId: string
    entityId: string
    checkType: 'IFRS9' | 'AML' | 'SANCTIONS' | 'EXPOSURE_LIMIT'
    rules?: Record<string, unknown>
}

// Queue event listeners and setup
export async function setupQueues(): Promise<void> {
    console.log('🔧 Setting up Bull queues...')
    console.log('✅ Queues configured')
}

// Cleanup on shutdown
export async function closeQueues(): Promise<void> {
    await Promise.all([
        approvalNotificationQueue.close(),
        eclCalculationQueue.close(),
        complianceCheckQueue.close(),
        redis.quit(),
    ])
}

/**
 * Add job to approval notification queue
 */
export async function queueApprovalNotification(
    job: ApprovalNotificationJob
): Promise<string> {
    const queued = await approvalNotificationQueue.add(
        `approval-${job.action.toLowerCase()}`,
        job,
        {
            attempts: 3,
            backoff: {
                type: 'exponential',
                delay: 2000,
            },
            removeOnComplete: true,
            removeOnFail: false,
        }
    )
    return queued.id || ''
}

/**
 * Add job to ECL calculation queue
 */
export async function queueECLCalculation(job: ECLCalculationJob): Promise<string> {
    const queued = await eclCalculationQueue.add(
        `ecl-${job.storedProcedure || 'default'}`,
        job,
        {
            attempts: 5,
            backoff: {
                type: 'exponential',
                delay: 5000,
            },
            removeOnComplete: false, // keep for audit trail
            removeOnFail: false,
        }
    )
    return queued.id || ''
}

/**
 * Add job to compliance check queue
 */
export async function queueComplianceCheck(job: ComplianceCheckJob): Promise<string> {
    const queued = await complianceCheckQueue.add(
        `compliance-${job.checkType.toLowerCase()}`,
        job,
        {
            attempts: 3,
            backoff: {
                type: 'exponential',
                delay: 3000,
            },
            removeOnComplete: true,
            removeOnFail: false,
        }
    )
    return queued.id || ''
}
