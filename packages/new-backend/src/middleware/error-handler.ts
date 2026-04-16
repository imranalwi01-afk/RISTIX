import type { Context } from 'hono'
import type { StatusCode } from 'hono/utils/http-status'
import { ZodError } from 'zod'
import { logger as baseLogger, withRequestIds } from '../lib/logger'
import { sendDiscordAlert } from '../services/discord-alert.service'
import { buildErrorResponse } from '../lib/http/error-response'

interface ErrorResponse {
    success: false
    error: string
    message?: string
    code: string
    requestId?: string | null
    timestamp?: string
    details?: unknown
    stack?: string
}

/**
 * Global error handler for Hono
 */
export function errorHandler(err: Error, c: Context): Response {
    const requestId = c.get('requestId')
    const tenantId = c.get('tenantId')
    const userId = c.get('userId')
    const log = (c.get && c.get('logger')) || withRequestIds({ requestId, tenantId }) || baseLogger

    log.error({ err, path: c.req?.path, method: c.req?.method, requestId, tenantId }, 'Unhandled error')

    const isDev = process.env.NODE_ENV !== 'production'

    // Handle Zod validation errors
    if (err instanceof ZodError) {
        return c.json<ErrorResponse>(
            buildErrorResponse(c, {
                success: false,
                error: 'Validation failed',
                message: 'Validation failed',
                code: 'VALIDATION_ERROR',
                details: err.errors.map((e) => ({
                    path: e.path.join('.'),
                    message: e.message,
                })),
            }) as unknown as ErrorResponse,
            400
        )
    }

    void sendDiscordAlert({
        source: 'backend',
        severity: 'error',
        event: 'http_unhandled_error',
        message: err.message || 'Unhandled backend error',
        requestId,
        tenantId,
        userId,
        context: {
            path: c.req?.path,
            method: c.req?.method,
            stack: err.stack ? String(err.stack).split('\n').slice(0, 6).join(' | ') : undefined,
        },
    })

    // Default error response
    const response: ErrorResponse = buildErrorResponse(c, {
        error: isDev ? err.message : 'Internal server error',
        message: isDev ? err.message : 'Internal server error',
        code: 'INTERNAL_ERROR',
    }) as unknown as ErrorResponse

    if (isDev && err.stack) {
        response.stack = err.stack
    }

    return c.json(response, 500)
}
