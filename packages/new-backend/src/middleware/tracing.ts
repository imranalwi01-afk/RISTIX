import { createMiddleware } from 'hono/factory'
import type { AppContext } from '../app'
import { traceHonoRequest } from '../lib/telemetry'

/**
 * OpenTelemetry tracing middleware for Hono.
 * Creates a span for every request with method, path, status code, and user context.
 */
export const otelTracingMiddleware = createMiddleware<AppContext>(async (c, next) => {
    const spanName = `${c.req.method} ${c.req.path}`
    const { span, end } = traceHonoRequest(c, spanName)

    try {
        await next()
        end(c.res.status)
    } catch (error) {
        end(500)
        throw error
    }
})
