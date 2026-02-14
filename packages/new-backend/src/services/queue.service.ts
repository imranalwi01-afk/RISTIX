import { Queue, Worker, Job } from 'bullmq'
import { env } from '../config/env'
import { getRedisConnectionOptions } from '../config/redis' // ✅ Centralized config
import { legacyDb, getDatabase } from '../config/database'
import { JobExecutorService } from './job-executor.service'
import { jobExecutions, jobDefinitions } from '../db/schema'
import { eq } from 'drizzle-orm'

import Redis from 'ioredis'

// Constants
const QUEUE_NAME = 'jobs-queue' // Standard queue name
const redisOptions = getRedisConnectionOptions(parseInt(env.REDIS_QUEUE_DB))

// Debug logging (masked)
console.log(`[QueueService] Initializing Redis with host=${redisOptions.host} port=${redisOptions.port} db=${redisOptions.db} hasPassword=${!!redisOptions.password}`);

const connection = new Redis(redisOptions as any)

// =============================================================================
// QUEUE DEFINITION
// =============================================================================
export const jobsQueue = new Queue(QUEUE_NAME, {
    connection
})

export const jobsQueueRef = jobsQueue;

// =============================================================================
// PROCESSOR
// =============================================================================
const processor = async (job: Job) => {
    const { tenantId, parameters } = job.data

    try {
        // Determine which DB to use
        const targetDatabase = parameters?.targetDatabase;
        let targetDb;

        if (targetDatabase === 'LEGACY') {
            console.log(`[Worker] Job ${job.id} using LEGACY database`);
            targetDb = legacyDb;
        } else {
            // Default to Tenant DB
            // If tenantId is missing, should we fail? Or assume system?
            // For now, assuming tenantId is provided for tenant-scope jobs.
            // If explicit system job, we might need handling.
            targetDb = getDatabase(tenantId || 'public'); // Fallback to public/default if needed, strict ideally
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

// =============================================================================
// SYNC LOGIC: Redis -> Postgres
// =============================================================================

// Helper to update execution status in DB
const updateExecutionStatus = async (jobId: string, status: string, tenantId: string | null, data?: any) => {
    try {
        const targetDb = getDatabase(tenantId || 'public') // Ensure we have a DB connection
        const isTerminal = ['completed', 'failed'].includes(status)
        const durationMs = data?.durationMs
            ?? (data?.finishedOn && data?.processedOn ? Math.max(0, data.finishedOn - data.processedOn) : undefined)

        await targetDb.update(jobExecutions)
            .set({
                status,
                progress: data?.progress,
                result: data?.result,
                error: data?.error,
                duration: typeof durationMs === 'number' ? Math.round(durationMs) : undefined,
                endTime: isTerminal ? new Date() : undefined
            })
            .where(eq(jobExecutions.id, jobId))
    } catch (err) {
        console.error(`[QueueService] Failed to sync status ${status} for job ${jobId} (Tenant: ${tenantId})`, err)
    }
}

const mapDefinitionStatus = (status: string): string => {
    switch (status) {
        case 'active':
            return 'RUNNING'
        case 'completed':
            return 'COMPLETED'
        case 'failed':
            return 'FAILED'
        case 'waiting':
            return 'PENDING'
        default:
            return status.toUpperCase()
    }
}

const updateDefinitionStatus = async (definitionId: string | null | undefined, tenantId: string | null, status: string) => {
    if (!definitionId) return
    try {
        const targetDb = getDatabase(tenantId || 'public')
        await targetDb.update(jobDefinitions)
            .set({
                lastRunStatus: mapDefinitionStatus(status),
                lastRunTime: new Date(),
                updatedAt: new Date(),
            })
            .where(eq(jobDefinitions.id, definitionId))
    } catch (err) {
        console.error(`[QueueService] Failed to sync definition status ${status} for definition ${definitionId} (Tenant: ${tenantId})`, err)
    }
}

// =============================================================================
// WORKER
// =============================================================================
export const jobsWorker = new Worker(QUEUE_NAME, processor, {
    connection: redisOptions as any, // Worker needs its own connection (blocking)
    concurrency: 5
})

// Event Listeners
jobsWorker.on('active', (job) => {
    if (!job) return
    console.log(`[Worker] Job ${job.id} active`)
    updateExecutionStatus(job.id!, 'active', job.data.tenantId)
    updateDefinitionStatus(job.data.definitionId, job.data.tenantId, 'active')
})

jobsWorker.on('completed', (job, result) => {
    if (!job) return
    console.log(`[Worker] Job ${job.id} completed`)
    if (job.id) updateExecutionStatus(job.id, 'completed', job.data.tenantId, {
        result,
        processedOn: job.processedOn,
        finishedOn: job.finishedOn,
    })
    updateDefinitionStatus(job.data.definitionId, job.data.tenantId, 'completed')
})

jobsWorker.on('failed', (job, err) => {
    if (!job || !err) return
    console.error(`[Worker] Job ${job.id} failed`, err)
    const verboseError = [err.message, err.stack].filter(Boolean).join('\n\n')
    if (job.id) updateExecutionStatus(job.id, 'failed', job.data.tenantId, {
        error: verboseError,
        processedOn: job.processedOn,
        finishedOn: job.finishedOn,
    })
    updateDefinitionStatus(job.data.definitionId, job.data.tenantId, 'failed')
})

jobsWorker.on('progress', (job, progress) => {
    // Optional: Throttle DB updates for progress
    // updateExecutionStatus(job.id!, 'active', job.data.tenantId, { progress })
})

jobsWorker.on('error', err => console.error('[Worker] Global Error:', err))
console.log(`[QueueService] Worker created and listening on ${QUEUE_NAME}`)

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
