import { Worker } from 'bullmq'
import { ApprovalNotificationJob, ECLCalculationJob, enqueueDeadLetter } from '../queue/bull-setup'
import { getNotificationSocket } from '../socket/notification.socket'
import * as NotificationService from '../services/notification.service'
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import * as schema from '../db/schema'
import { logger, withRequestIds } from '../lib/logger'

import { getRedisConnectionOptions } from '../config/redis'
import { env } from '../config/env'
import { traceJobProcessor } from '../lib/job-tracing'

const connectionOptions = getRedisConnectionOptions(parseInt(env.REDIS_QUEUE_DB))
console.log('Worker Redis Options:', JSON.stringify(connectionOptions, null, 2)) // DEBUG

/**
 * Approval Notification Worker
 * Processes approval notifications: pending, approved, rejected
 */
export function setupApprovalNotificationWorker(db: PostgresJsDatabase<typeof schema>) {
    const worker = new Worker<ApprovalNotificationJob>(
        'approval-notifications',
        traceJobProcessor<ApprovalNotificationJob>('approval-notifications', async (job) => {
            withRequestIds({ tenantId: job.data.tenantId }).info({ jobId: job.id }, 'Processing approval notification job')

            const { action, notifyUser, email, template, workflowId, workflowName } = job.data

            try {
                // Build template context (in production, fetch actual user data from DB)
                const templateContext = {
                    approverName: 'John Approver', // TODO: fetch from DB
                    requesterName: 'Jane Requester', // TODO: fetch from DB
                    workflowName,
                    approvalUrl: `${process.env.APP_URL}/approvals/${workflowId}`,
                }

                // Send email
                if (email) {
                    const emailService = await NotificationService.sendEmailNotification

                    // Invoke the Effect program
                    const emailServiceFn = emailService as unknown as (
                        job: ApprovalNotificationJob,
                        toEmail: string,
                        context: Record<string, unknown>
                    ) => Promise<string>

                    const messageId = await emailServiceFn(job.data, email, templateContext)
                    withRequestIds({ tenantId: job.data.tenantId }).info({ jobId: job.id, messageId }, 'Email notification sent')
                }

                // Create in-app notification
                const inAppService = await NotificationService.createInAppNotification
                const inAppServiceFn = inAppService as unknown as (
                    job: ApprovalNotificationJob,
                    title: string,
                    message: string,
                    userId: string,
                    actionUrl?: string
                ) => Promise<void>

                const title = {
                    approval_pending: '⏳ New Approval Request',
                    approval_approved: '✅ Approval Granted',
                    approval_rejected: '❌ Approval Rejected',
                }[template]

                const message = {
                    approval_pending: `New approval request: ${workflowName}`,
                    approval_approved: `Your approval request has been approved`,
                    approval_rejected: `Your approval request has been rejected`,
                }[template]

                await inAppServiceFn(
                    job.data,
                    title,
                    message,
                    notifyUser,
                    `${process.env.APP_URL}/approvals/${workflowId}`
                )

                withRequestIds({ tenantId: job.data.tenantId }).info({ jobId: job.id }, 'Approval notification job completed')
                return { success: true, jobId: job.id }
            } catch (err) {
                withRequestIds({ tenantId: job.data.tenantId }).error({ jobId: job.id, err }, 'Approval notification job failed')
                throw err
            }
        }),
        { connection: connectionOptions as any, concurrency: 5, lockDuration: 60000 }
    )

    worker.on('completed', (job) => {
        withRequestIds({ tenantId: job.data?.tenantId }).info({ jobId: job.id }, 'Approval job completed')
    })

    worker.on('failed', (job, err) => {
        withRequestIds({ tenantId: job?.data?.tenantId }).error({ jobId: job?.id, err }, 'Approval job failed')
        if (job) {
            const jobId: string = job.id ? String(job.id) : 'unknown'
            const payloadData = job.data as unknown as Record<string, unknown>
            const severity: 'error' = 'error'

            enqueueDeadLetter('approval-notifications', {
                originalQueue: 'approval-notifications',
                originalJobId: jobId,
                name: job.name,
                data: payloadData,
                failedReason: err?.message,
                failedAt: new Date().toISOString(),
            }).catch((dlqErr) => withRequestIds({ tenantId }).error({ dlqErr }, 'Failed to enqueue DLQ for approval job'))

            // Broadcast alert to admins of the tenant
            const tenantId = job.data.tenantId || 'tenant-id'
            try {
                getNotificationSocket().broadcastComplianceAlert(
                    tenantId,
                    severity,
                    `Approval notification job failed (${jobId}): ${err.message}`,
                    {
                        queue: 'approval-notifications',
                        jobId,
                        name: job.name,
                        data: payloadData,
                        failedAt: new Date().toISOString(),
                    }
                )
            } catch (broadcastErr) {
                withRequestIds({ tenantId }).error({ broadcastErr }, 'Failed to broadcast approval job failure')
            }
        }
    })

    return worker
}

/**
 * ECL Calculation Worker
 * Processes ECL calculations: calls stored procedure, updates workflow, triggers compliance checks
 */
export function setupECLCalculationWorker(db: PostgresJsDatabase<typeof schema>) {
    const worker = new Worker<ECLCalculationJob>(
        'ecl-calculations',
        traceJobProcessor<ECLCalculationJob>('ecl-calculations', async (job) => {
            withRequestIds({ tenantId: job.data.tenantId }).info({ jobId: job.id }, 'Processing ECL calculation job')

            const { workflowId, tenantId, entityId, storedProcedure, parameters } = job.data

            try {
                // Call stored procedure (example: calculate_expected_credit_loss)
                const spName = storedProcedure || 'calculate_expected_credit_loss'

                withRequestIds({ tenantId: tenantId }).info({ spName, entityId }, 'Calling stored procedure')

                // Execute stored procedure and get result
                // In production, replace with actual SP call
                const result = await callStoredProcedure(db, spName, {
                    entityId,
                    tenantId,
                    parameters,
                })

                withRequestIds({ tenantId }).info({ spName, result }, 'Stored procedure completed')

                // Update workflow with result (via stored procedure handler)
                // In production: call core.handle_ecl_job_result
                withRequestIds({ tenantId }).info({ workflowId }, 'Updating workflow with ECL result')

                // Mark workflow as completed
                // UPDATE core.workflows SET current_state = 'COMPLETED', metadata['ecl_result'] = result WHERE id = workflow_id

                return { success: true, jobId: job.id, result }
            } catch (err) {
                withRequestIds({ tenantId }).error({ jobId: job.id, err }, 'ECL calculation job failed')
                throw err
            }
        }),
        { connection: connectionOptions as any, concurrency: 2, lockDuration: 120000 } // Lower concurrency for heavy calculations
    )

    worker.on('completed', (job) => {
        withRequestIds({ tenantId: job.data?.tenantId }).info({ jobId: job.id }, 'ECL job completed')
    })

    worker.on('failed', (job, err) => {
        withRequestIds({ tenantId: job?.data?.tenantId }).error({ jobId: job?.id, err }, 'ECL job failed')
        if (job) {
            const jobId: string = job.id ? String(job.id) : 'unknown'
            const payloadData = job.data as unknown as Record<string, unknown>
            const severity: 'error' = 'error'

            enqueueDeadLetter('ecl-calculations', {
                originalQueue: 'ecl-calculations',
                originalJobId: jobId,
                name: job.name,
                data: payloadData,
                failedReason: err?.message,
                failedAt: new Date().toISOString(),
            }).catch((dlqErr) => withRequestIds({ tenantId }).error({ dlqErr }, 'Failed to enqueue DLQ for ECL job'))

            // Broadcast alert to admins of the tenant
            const tenantId = job.data.tenantId || 'tenant-id'
            try {
                getNotificationSocket().broadcastComplianceAlert(
                    tenantId,
                    severity,
                    `ECL calculation job failed (${jobId}): ${err.message}`,
                    {
                        queue: 'ecl-calculations',
                        jobId,
                        name: job.name,
                        data: payloadData,
                        failedAt: new Date().toISOString(),
                    }
                )
            } catch (broadcastErr) {
                withRequestIds({ tenantId }).error({ broadcastErr }, 'Failed to broadcast ECL job failure')
            }
        }
    })

    return worker
}

/**
 * Helper: Call stored procedure (placeholder implementation)
 */
async function callStoredProcedure(
    db: PostgresJsDatabase<typeof schema>,
    spName: string,
    params: Record<string, unknown>
): Promise<Record<string, unknown>> {
    // TODO: Implement actual SP call using db.execute() or raw query
    // This is a placeholder showing the pattern

    if (spName === 'calculate_expected_credit_loss') {
        // SELECT ecl.calculate_expected_credit_loss(...)
        withRequestIds({ tenantId: params.tenantId as string | undefined }).info({ spName, params }, 'Executing stored procedure')

        // Mock result for now
        return {
            entity_id: params.entityId,
            total_ecl: 1500.5,
            ecl_percentage: 3.75,
            passes_ifrs9: true,
            calculated_at: new Date().toISOString(),
        }
    }

    throw new Error(`Unknown stored procedure: ${spName}`)
}

/**
 * Setup all workers
 */
export async function setupAllWorkers(db: PostgresJsDatabase<typeof schema>) {
    logger.info('Setting up Bull workers...')

    const approvalWorker = setupApprovalNotificationWorker(db)
    const eclWorker = setupECLCalculationWorker(db)

    logger.info('All workers ready')

    return { approvalWorker, eclWorker }
}
