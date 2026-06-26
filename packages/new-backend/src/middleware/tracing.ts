import { createMiddleware } from 'hono/factory'
import type { AppContext } from '../app'
import { trace, SpanStatusCode } from '@opentelemetry/api'
import { SERVICE_NAME } from '../lib/telemetry'

/**
 * OpenTelemetry tracing middleware for Hono.
 * Uses startActiveSpan so DB query spans are correctly parented.
 */
export const otelTracingMiddleware = createMiddleware<AppContext>(async (c, next) => {
    const tracer = trace.getTracer(SERVICE_NAME)
    const spanName = `${c.req.method} ${c.req.path}`

    await tracer.startActiveSpan(spanName, async (span) => {
        span.setAttributes({
            'http.method': c.req.method,
            'http.url': c.req.url,
            'http.path': c.req.path,
            'tenant_id': (c.get('tenantId') as string) || '',
            'user_id': (c.get('userId') as string) || '',
        })

        try {
            await next()
            const status = c.res.status
            span.setAttribute('http.status_code', status)
            if (status >= 400) span.setStatus({ code: SpanStatusCode.ERROR })
        } catch (error) {
            span.setAttribute('http.status_code', 500)
            span.setStatus({ code: SpanStatusCode.ERROR })
            throw error
        } finally {
            span.end()
        }
    })
})
