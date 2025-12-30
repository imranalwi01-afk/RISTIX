import type { Context } from 'hono'
import type { StatusCode } from 'hono/utils/http-status'
import { ZodError } from 'zod'

interface ErrorResponse {
    success: false
    error: string
    code: string
    details?: unknown
    stack?: string
}

/**
 * Global error handler for Hono
 */
export function errorHandler(err: Error, c: Context): Response {
    console.error('Unhandled error:', err)

    const isDev = process.env.NODE_ENV !== 'production'

    // Handle Zod validation errors
    if (err instanceof ZodError) {
        return c.json<ErrorResponse>(
            {
                success: false,
                error: 'Validation failed',
                code: 'VALIDATION_ERROR',
                details: err.errors.map((e) => ({
                    path: e.path.join('.'),
                    message: e.message,
                })),
            },
            400
        )
    }

    // Default error response
    const response: ErrorResponse = {
        success: false,
        error: isDev ? err.message : 'Internal server error',
        code: 'INTERNAL_ERROR',
    }

    if (isDev && err.stack) {
        response.stack = err.stack
    }

    return c.json(response, 500)
}
