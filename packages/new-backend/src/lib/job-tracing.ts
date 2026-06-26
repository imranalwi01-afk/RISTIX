import { trace, SpanStatusCode } from '@opentelemetry/api'
import type { Job } from 'bullmq'

const tracer = trace.getTracer('ifrs9-backend')

/**
 * Wrap a BullMQ worker processor so every job execution creates an OTel span.
 *
 * Spans are named `job.process.{queueName}` with attributes for queue, job name,
 * job id, attempt count, duration, tenant id, and error status.
 */
export function traceJobProcessor<T = unknown>(
  queueName: string,
  processor: (job: Job<T>) => Promise<unknown>,
): (job: Job<T>) => Promise<unknown> {
  return async (job: Job<T>) => {
    const span = tracer.startSpan(`job.process.${queueName}`, {
      attributes: {
        'messaging.system': 'bullmq',
        'messaging.destination': queueName,
        'messaging.message_id': job.id ?? '',
        'messaging.operation': 'process',
        'job.name': job.name,
        'job.attempts_made': job.attemptsMade,
        'tenant_id': (job.data as Record<string, unknown>)?.tenantId as string ?? '',
      },
    })

    const start = performance.now()
    try {
      const result = await processor(job)
      span.setAttribute('job.duration_ms', (performance.now() - start).toFixed(2))
      span.end()
      return result
    } catch (error) {
      span.setAttribute('job.duration_ms', (performance.now() - start).toFixed(2))
      span.setStatus({ code: SpanStatusCode.ERROR, message: (error as Error)?.message || String(error) })
      span.end()
      throw error
    }
  }
}
