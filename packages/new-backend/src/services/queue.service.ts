import { Queue, Worker, Job, QueueEvents } from 'bullmq'
import { env } from '../config/env'
import { db, legacyDb } from '../config/database'
import { getDatabase } from '../config/database'

// ... existing imports

// ...

try {
    // Determine which DB to use
    const targetDatabase = parameters?.targetDatabase;
    let targetDb;

    if (targetDatabase === 'LEGACY') {
        console.log(`[Worker] Job ${job.id} using LEGACY database`);
        targetDb = legacyDb;
    } else {
        // Default to Tenant DB
        targetDb = getDatabase(tenantId);
    }

    const tenantExecutor = new JobExecutorService(targetDb)

    const result = await tenantExecutor.execute(job.name, parameters)

    if (!result.success) {
        throw new Error(result.error || 'Unknown execution error')
    }

    return result
} catch (err: any) {
    console.error(`[Worker] Job ${job.id} failed:`, err)
    throw err
}
}

export const jobsWorker = new Worker(QUEUE_NAME, processor, {
    connection,
    concurrency: 5
})
jobsWorker.on('error', err => console.error('[Worker] Global Error:', err))
console.log(`[QueueService] Worker created and listening on ${QUEUE_NAME}`)

// =============================================================================
// SYNC LOGIC: Redis -> Postgres
// =============================================================================

// Helper to update execution status in DB
const updateExecutionStatus = async (jobId: string, status: string, tenantId: string | null, data?: any) => {
    try {
        const targetDb = getDatabase(tenantId)
        await targetDb.update(jobExecutions)
            .set({
                status,
                progress: data?.progress,
                result: data?.result,
                error: data?.error,
                endTime: ['completed', 'failed'].includes(status) ? new Date() : undefined
            })
            .where(eq(jobExecutions.id, jobId))
    } catch (err) {
        console.error(`[QueueService] Failed to sync status ${status} for job ${jobId} (Tenant: ${tenantId})`, err)
    }
}

// Event Listeners
jobsWorker.on('active', (job) => {
    if (!job) return
    console.log(`[Worker] Job ${job.id} active`)
    updateExecutionStatus(job.id!, 'active', job.data.tenantId)
})

jobsWorker.on('completed', (job, result) => {
    if (!job) return
    console.log(`[Worker] Job ${job.id} completed`)
    if (job.id) updateExecutionStatus(job.id, 'completed', job.data.tenantId, { result })
})

jobsWorker.on('failed', (job, err) => {
    if (!job || !err) return
    console.error(`[Worker] Job ${job.id} failed`, err)
    if (job.id) updateExecutionStatus(job.id, 'failed', job.data.tenantId, { error: err.message })
})

jobsWorker.on('progress', (job, progress) => {
    // Optional: Throttle DB updates for progress
    // updateExecutionStatus(job.id!, 'active', { progress })
})

// =============================================================================
// PUBLIC API
// =============================================================================

/**
 * Add a job to the queue.
 * 
 * @param name - The job name
 * @param data - The job data
 * @param opts - BullMQ job options
 * @returns A Promise resolving to the added job
 */
export const addJob = async (name: string, data: any, opts?: any) => {
    console.log(`[QueueService] Adding job: ${name} (ID: ${opts?.jobId})`)
    return await jobsQueue.add(name, data, opts)
}

/**
 * Get a job by ID.
 * 
 * @param jobId - The job ID
 * @returns A Promise resolving to the job or undefined
 */
export const getJob = async (jobId: string) => {
    return await jobsQueue.getJob(jobId)
}
