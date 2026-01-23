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

// Default queue options (env-tunable)
const queueDefaults = {
    approval: {
        attempts: parseInt(process.env.BULL_APPROVAL_ATTEMPTS || '3'),
        backoff: {
            type: 'exponential' as const,
            delay: parseInt(process.env.BULL_APPROVAL_BACKOFF_MS || '2000'),
        },
        timeout: parseInt(process.env.BULL_APPROVAL_TIMEOUT_MS || '30000'),
    },
    ecl: {
        attempts: parseInt(process.env.BULL_ECL_ATTEMPTS || '5'),
        backoff: {
            type: 'exponential' as const,
            delay: parseInt(process.env.BULL_ECL_BACKOFF_MS || '5000'),
        },
        timeout: parseInt(process.env.BULL_ECL_TIMEOUT_MS || '60000'),
    },
    compliance: {
        attempts: parseInt(process.env.BULL_COMPLIANCE_ATTEMPTS || '3'),
        backoff: {
            type: 'exponential' as const,
            delay: parseInt(process.env.BULL_COMPLIANCE_BACKOFF_MS || '3000'),
        },
        timeout: parseInt(process.env.BULL_COMPLIANCE_TIMEOUT_MS || '30000'),
    },
}

// Queue instances with defaults
export const approvalNotificationQueue = new Queue('approval-notifications', {
    connection: redis,
})
export const eclCalculationQueue = new Queue('ecl-calculations', {
    connection: redis,
})
export const complianceCheckQueue = new Queue('compliance-checks', {
    connection: redis,
})
// Dead-letter queues (DLQ)
export const approvalDLQ = new Queue('approval-notifications-dlq', { connection: redis })
export const eclDLQ = new Queue('ecl-calculations-dlq', { connection: redis })
export const complianceDLQ = new Queue('compliance-checks-dlq', { connection: redis })

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

export interface DeadLetterJob {
    originalQueue: string
    originalJobId: string | number
    name: string
    data: Record<string, unknown>
    failedReason?: string
    failedAt: string
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
        approvalDLQ.close(),
        eclDLQ.close(),
        complianceDLQ.close(),
        redis.quit(),
    ])
}

/**
 * Move a failed job payload to the corresponding dead-letter queue
 */
export async function enqueueDeadLetter(queueName: string, payload: DeadLetterJob): Promise<void> {
    switch (queueName) {
        case 'approval-notifications':
            await approvalDLQ.add('dead-letter', payload, { removeOnComplete: false, removeOnFail: false })
            return
        case 'ecl-calculations':
            await eclDLQ.add('dead-letter', payload, { removeOnComplete: false, removeOnFail: false })
            return
        case 'compliance-checks':
            await complianceDLQ.add('dead-letter', payload, { removeOnComplete: false, removeOnFail: false })
            return
        default:
            console.warn(`Unknown queue for DLQ: ${queueName}`)
    }
}

/**
 * Lightweight queue health snapshot (use in /health or dashboards)
 */
export async function getQueueMetrics() {
    const [approvalCounts, eclCounts, complianceCounts, approvalDLQCount, eclDLQCount, complianceDLQCount] = await Promise.all([
        approvalNotificationQueue.getJobCounts(),
        eclCalculationQueue.getJobCounts(),
        complianceCheckQueue.getJobCounts(),
        approvalDLQ.count(),
        eclDLQ.count(),
        complianceDLQ.count(),
    ])

    return {
        approval: { ...approvalCounts, dlq: approvalDLQCount },
        ecl: { ...eclCounts, dlq: eclDLQCount },
        compliance: { ...complianceCounts, dlq: complianceDLQCount },
    }
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
            attempts: queueDefaults.approval.attempts,
            backoff: queueDefaults.approval.backoff,
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
            attempts: queueDefaults.ecl.attempts,
            backoff: queueDefaults.ecl.backoff,
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
            attempts: queueDefaults.compliance.attempts,
            backoff: queueDefaults.compliance.backoff,
            removeOnComplete: true,
            removeOnFail: false,
        }
    )
    return queued.id || ''
}
