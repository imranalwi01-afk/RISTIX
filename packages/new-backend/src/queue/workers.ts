import { Worker } from 'bullmq'
import Redis from 'ioredis'
import { ApprovalNotificationJob, ECLCalculationJob, enqueueDeadLetter } from '../queue/bull-setup'
import { getNotificationSocket } from '../socket/notification.socket'
import * as NotificationService from '../services/notification.service'
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import * as schema from '../db/schema'

const redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    maxRetriesPerRequest: null,
})

/**
 * Approval Notification Worker
 * Processes approval notifications: pending, approved, rejected
 */
export function setupApprovalNotificationWorker(db: PostgresJsDatabase<typeof schema>) {
    const worker = new Worker<ApprovalNotificationJob>(
        'approval-notifications',
        async (job) => {
            console.log(`🔄 Processing approval notification job ${job.id}`)

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
                    console.log(`✉️ Email notification sent: ${messageId}`)
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

                console.log(`✅ Approval notification job ${job.id} completed`)
                return { success: true, jobId: job.id }
            } catch (err) {
                console.error(`❌ Approval notification job ${job.id} failed: ${err}`)
                throw err
            }
        },
        { connection: redis, concurrency: 5 }
    )

    worker.on('completed', (job) => {
        console.log(`✅ Job ${job.id} completed`)
    })

    worker.on('failed', (job, err) => {
        console.error(`❌ Job ${job?.id} failed: ${err.message}`)
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
            }).catch((dlqErr) => console.error('❌ Failed to enqueue DLQ for approval job', dlqErr))

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
                console.error('❌ Failed to broadcast approval job failure', broadcastErr)
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
        async (job) => {
            console.log(`🔄 Processing ECL calculation job ${job.id}`)

            const { workflowId, tenantId, entityId, storedProcedure, parameters } = job.data

            try {
                // Call stored procedure (example: calculate_expected_credit_loss)
                const spName = storedProcedure || 'calculate_expected_credit_loss'

                console.log(`📞 Calling SP: ${spName} for entity ${entityId}`)

                // Execute stored procedure and get result
                // In production, replace with actual SP call
                const result = await callStoredProcedure(db, spName, {
                    entityId,
                    tenantId,
                    parameters,
                })

                console.log(`✅ SP ${spName} completed. Result:`, result)

                // Update workflow with result (via stored procedure handler)
                // In production: call core.handle_ecl_job_result
                console.log(`📝 Updating workflow ${workflowId} with ECL result`)

                // Mark workflow as completed
                // UPDATE core.workflows SET current_state = 'COMPLETED', metadata['ecl_result'] = result WHERE id = workflow_id

                return { success: true, jobId: job.id, result }
            } catch (err) {
                console.error(`❌ ECL calculation job ${job.id} failed: ${err}`)
                throw err
            }
        },
        { connection: redis, concurrency: 2 } // Lower concurrency for heavy calculations
    )

    worker.on('completed', (job) => {
        console.log(`✅ ECL job ${job.id} completed`)
    })

    worker.on('failed', (job, err) => {
        console.error(`❌ ECL job ${job?.id} failed: ${err.message}`)
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
            }).catch((dlqErr) => console.error('❌ Failed to enqueue DLQ for ECL job', dlqErr))

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
                console.error('❌ Failed to broadcast ECL job failure', broadcastErr)
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
        console.log(`Executing ${spName} with params:`, params)

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
    console.log('🚀 Setting up Bull workers...')

    const approvalWorker = setupApprovalNotificationWorker(db)
    const eclWorker = setupECLCalculationWorker(db)

    console.log('✅ All workers ready')

    return { approvalWorker, eclWorker }
}
