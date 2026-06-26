import { Queue, Worker, Job } from 'bullmq'
import { trace, SpanStatusCode } from '@opentelemetry/api'
import { traceJobProcessor } from '../lib/job-tracing'

const tracer = trace.getTracer('ifrs9-backend')
import { env } from '../config/env'
import { getRedisConnectionOptions } from '../config/redis' // ✅ Centralized config
import { legacyDb, getDatabase } from '../config/database'
import { JobExecutorService } from './job-executor.service'
import { jobExecutions, jobDefinitions } from '../db/schema'
import { eq } from 'drizzle-orm'

// Constants
const QUEUE_NAME = 'jobs-queue' // Standard queue name
const redisOptions = getRedisConnectionOptions(parseInt(env.REDIS_QUEUE_DB))

// Debug logging (masked)
console.log(`[QueueService] Initializing Redis with host=${redisOptions.host} port=${redisOptions.port} db=${redisOptions.db} hasPassword=${!!redisOptions.password}`);

// =============================================================================
// QUEUE DEFINITION
// =============================================================================
export const jobsQueue = new Queue(QUEUE_NAME, {
    connection: redisOptions as any,
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

        const tenantExecutor = new JobExecutorService(targetDb, {
            onSqlRuntime: async (metadata) => {
                if (!job.id) return
                await updateExecutionStatus(String(job.id), 'active', tenantId || null, {
                    progress: 0,
                    clearError: true,
                    tagsMerge: metadata,
                })
            }
        })

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

const normalizeExecutionStatus = (status: string): string => {
    switch ((status || '').toLowerCase()) {
        case 'waiting':
        case 'queued':
        case 'delayed':
        case 'prioritized':
            return 'pending'
        case 'running':
            return 'active'
        default:
            return status.toLowerCase()
    }
}

// Helper to update execution status in DB
const updateExecutionStatus = async (jobId: string, status: string, tenantId: string | null, data?: any) => {
    try {
        const targetDb = getDatabase(tenantId || 'public') // Ensure we have a DB connection
        const normalizedStatus = normalizeExecutionStatus(status)
        const isTerminal = ['completed', 'failed', 'cancelled'].includes(normalizedStatus)
        const durationMs = data?.durationMs
            ?? (data?.finishedOn && data?.processedOn ? Math.max(0, data.finishedOn - data.processedOn) : undefined)
        let mergedTags: any = undefined

        if (data?.tagsMerge && typeof data.tagsMerge === 'object') {
            const [existingExecution] = await targetDb
                .select({ tags: jobExecutions.tags })
                .from(jobExecutions)
                .where(eq(jobExecutions.id, jobId))
                .limit(1)

            const existingTags = existingExecution?.tags && typeof existingExecution.tags === 'object' && !Array.isArray(existingExecution.tags)
                ? existingExecution.tags
                : {}

            mergedTags = {
                ...existingTags,
                ...data.tagsMerge,
            }
        }

        const patch: Record<string, unknown> = {
            status: normalizedStatus,
        }
        if (typeof data?.progress === 'number') patch.progress = data.progress
        if (Object.prototype.hasOwnProperty.call(data || {}, 'result')) patch.result = data.result
        if (Object.prototype.hasOwnProperty.call(data || {}, 'error')) patch.error = data.error
        if (data?.clearError) patch.error = null
        if (typeof durationMs === 'number') patch.duration = Math.round(durationMs)
        if (mergedTags !== undefined) patch.tags = mergedTags
        if (isTerminal) patch.endTime = new Date()

        await targetDb.update(jobExecutions)
            .set(patch)
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
        case 'queued':
        case 'pending':
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
export const jobsWorker = new Worker(QUEUE_NAME, traceJobProcessor(QUEUE_NAME, processor), {
    connection: redisOptions as any, // Worker needs its own connection (blocking)
    concurrency: 5
})

// Event Listeners
jobsWorker.on('active', (job) => {
    if (!job) return
    console.log(`[Worker] Job ${job.id} active`)
    updateExecutionStatus(job.id!, 'active', job.data.tenantId, { clearError: true, progress: 0 })
    updateDefinitionStatus(job.data.definitionId, job.data.tenantId, 'active')
})

jobsWorker.on('completed', (job, result) => {
    if (!job) return
    console.log(`[Worker] Job ${job.id} completed`)
    if (job.id) updateExecutionStatus(job.id, 'completed', job.data.tenantId, {
        clearError: true,
        progress: 100,
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
    const attemptsMade = Number(job.attemptsMade || 0)
    const maxAttempts = Number(job.opts?.attempts || 1)
    const hasRemainingRetries = attemptsMade < maxAttempts

    if (hasRemainingRetries) {
        if (job.id) updateExecutionStatus(job.id, 'pending', job.data.tenantId, {
            progress: 0,
            error: `Attempt ${attemptsMade}/${maxAttempts} failed. Retrying.\n\n${verboseError}`,
        })
        updateDefinitionStatus(job.data.definitionId, job.data.tenantId, 'waiting')
        return
    }

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

    const span = tracer.startSpan('job.enqueue', {
        attributes: {
            'messaging.system': 'bullmq',
            'messaging.destination': QUEUE_NAME,
            'messaging.operation': 'send',
            'job.name': name,
            'job.id': opts?.jobId ?? '',
            'tenant_id': data?.tenantId ?? '',
        },
    })

    try {
        const job = await jobsQueue.add(name, data, opts)
        span.setAttribute('messaging.message_id', job.id ?? '')
        span.end()
        return job
    } catch (error) {
        span.setStatus({ code: SpanStatusCode.ERROR, message: (error as Error)?.message || String(error) })
        span.end()
        throw error
    }
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
