import type { Context } from 'hono'

export type ErrorResponsePayload = {
    success?: false
    error: string
    message?: string
    code?: string
    details?: unknown
    path?: string
    stack?: string
    [key: string]: unknown
}

export function buildErrorResponse(
    c: Context,
    payload: ErrorResponsePayload
): Record<string, unknown> {
    return {
        success: false,
        requestId: c.get('requestId') || null,
        timestamp: new Date().toISOString(),
        ...payload,
    }
}
