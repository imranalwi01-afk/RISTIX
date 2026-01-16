import { Queue, Worker, Job, QueueEvents } from 'bullmq'
import { env } from '../config/env'
import { db } from '../config/database'
import { jobExecutions } from '../db/schema'
import { eq } from 'drizzle-orm'
import IORedis from 'ioredis'

// Redis connection - handle optional REDIS_URL
const redisUrl = env.REDIS_URL || 'redis://localhost:6379'

const connection = new IORedis(redisUrl, {
    maxRetriesPerRequest: null,
})

// Queue Name
const QUEUE_NAME = 'ifrs9-jobs'

// 1. Queue Producer
export const jobsQueue = new Queue(QUEUE_NAME, { connection })

// 2. Queue Events (Global listener)
const queueEvents = new QueueEvents(QUEUE_NAME, { connection })

// 3. Worker (Consumer)
// We will define processors in a registry or switch case
const processor = async (job: Job) => {
    // TODO: Implement actual job logic dispatch
    console.log(`[Worker] Processing job ${job.id} (${job.name})`)

    // Simulate work
    await new Promise(resolve => setTimeout(resolve, 5000))

    // Return result
    return { success: true, processedAt: new Date() }
}

export const jobsWorker = new Worker(QUEUE_NAME, processor, {
    connection,
    concurrency: 5
})

// =============================================================================
// SYNC LOGIC: Redis -> Postgres
// =============================================================================

// Helper to update execution status in DB
const updateExecutionStatus = async (jobId: string, status: string, data?: any) => {
    try {
        await db.update(jobExecutions)
            .set({
                status,
                progress: data?.progress,
                result: data?.result,
                error: data?.error,
                endTime: ['completed', 'failed'].includes(status) ? new Date() : undefined
            })
            .where(eq(jobExecutions.id, jobId))
    } catch (err) {
        console.error(`[QueueService] Failed to sync status ${status} for job ${jobId}`, err)
    }
}

// Event Listeners
jobsWorker.on('active', (job) => {
    if (!job) return
    console.log(`[Worker] Job ${job.id} active`)
    updateExecutionStatus(job.id!, 'active')
})

jobsWorker.on('completed', (job, result) => {
    if (!job) return
    console.log(`[Worker] Job ${job.id} completed`)
    updateExecutionStatus(job.id!, 'completed', { result })
})

jobsWorker.on('failed', (job, err) => {
    if (!job) return
    console.error(`[Worker] Job ${job.id} failed`, err)
    updateExecutionStatus(job.id!, 'failed', { error: err.message })
})

jobsWorker.on('progress', (job, progress) => {
    // Optional: Throttle DB updates for progress
    // updateExecutionStatus(job.id!, 'active', { progress })
})

// =============================================================================
// PUBLIC API
// =============================================================================

export const addJob = async (name: string, data: any, opts?: any) => {
    return await jobsQueue.add(name, data, opts)
}

export const getJob = async (jobId: string) => {
    return await jobsQueue.getJob(jobId)
}
