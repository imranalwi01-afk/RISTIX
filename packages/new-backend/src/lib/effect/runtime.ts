import { Effect, pipe, Either, Option } from 'effect'
import type { Context } from 'hono'
import {
    DatabaseError,
    ValidationError,
    NotFoundError,
    AuthenticationError,
    AuthorizationError,
    BusinessError,
    RateLimitError,
    ConflictError,
    type CommonError,
} from '@lib/errors'
import { sendDiscordAlert } from '@/services/discord-alert.service'
import { buildErrorResponse } from '@/lib/http/error-response'

/**
 * Run an Effect and convert the result to a Hono response
 */
export async function runEffect<A>(
    c: Context,
    effect: Effect.Effect<A, CommonError>,
    successStatus?: number | ((value: A) => number)
): Promise<any> {
    const result = await Effect.runPromiseExit(effect)

    if (result._tag === 'Success') {
        const status = typeof successStatus === 'function' ? successStatus(result.value) : successStatus
        const value = result.value as any
        const payload =
            value && typeof value === 'object' && typeof value.success === 'boolean'
                ? value
                : ({ success: true, data: value } as any)

        if (typeof status === 'number') {
            return c.json(payload, status as any)
        }

        return c.json(payload)
    }

    return handleEffectError(c, result.cause) as any
}

/**
 * Handle Effect errors and convert to HTTP responses
 */
export function handleEffectError(c: Context, cause: unknown): Response {
    // Extract the actual error from the cause
    const error = extractError(cause)

    if (!error) {
        console.error('Unknown error:', cause)
        return c.json(buildErrorResponse(c, { error: 'Internal server error', message: 'Internal server error' }) as any, 500)
    }

    switch (error._tag) {
        case 'DatabaseError':
            console.error('Database error:', error)
            return c.json(
                buildErrorResponse(c, {
                    error: error.message || 'Database operation failed',
                    message: error.message || 'Database operation failed',
                    code: 'DB_ERROR',
                    details: {
                        operation: error.operation,
                    },
                }) as any,
                500
            )

        case 'ValidationError':
            return c.json(
                buildErrorResponse(c, {
                    success: false,
                    error: error.message,
                    message: error.message, // Standardize with frontend expectations
                    code: 'VALIDATION_ERROR',
                    details: { field: error.field, errors: error.errors },
                }) as any,
                400
            )

        case 'NotFoundError':
            {
                const message = `${error.resource} with id ${error.id} not found`
                return c.json(
                    buildErrorResponse(c, {
                        success: false,
                        error: message,
                        message,
                        code: 'NOT_FOUND',
                    }) as any,
                    404
                )
            }

        case 'AuthenticationError':
            return c.json(
                buildErrorResponse(c, { success: false, error: error.message, message: error.message, code: 'UNAUTHENTICATED' }) as any,
                401
            )

        case 'AuthorizationError':
            void maybeSendDiscordAlert(c, error, 403, {
                code: 'UNAUTHORIZED',
                details: error.details,
                requiredPermission: error.requiredPermission,
            })
            return c.json(
                buildErrorResponse(c, {
                    success: false,
                    error: error.message,
                    message: error.message,
                    code: 'UNAUTHORIZED',
                    details: error.details,
                    requiredPermission: error.requiredPermission,
                }) as any,
                403
            )

        case 'BusinessError':
            {
                const conflictCodes = new Set([
                    'REQUEST_NOT_PENDING',
                    'REQUEST_NOT_CANCELLABLE',
                    'APPROVER_ALREADY_ACTED',
                    'APPROVER_ALREADY_APPROVED_LEVEL',
                ])
                const status = conflictCodes.has(error.code) ? 409 : 422
            if (status === 409 && shouldAlertStatus(c.req.path, status)) {
                void maybeSendDiscordAlert(c, error, status, {
                    code: error.code,
                    details: error.details,
                })
            }
            return c.json(
                buildErrorResponse(c, {
                    success: false,
                    error: error.message,
                    message: error.message,
                    code: error.code,
                    details: error.details,
                }) as any,
                status as any
            )
            }

        case 'RateLimitError':
            return c.json(
                buildErrorResponse(c, { success: false, error: error.message, message: error.message, code: 'RATE_LIMITED' }) as any,
                429
            )

        case 'ConflictError':
            void maybeSendDiscordAlert(c, error, 409, {
                code: 'CONFLICT',
                resource: error.resource,
                field: error.field,
                value: error.value,
                details: error.details,
            })
            return c.json(
                buildErrorResponse(c, {
                    success: false,
                    error: error.message,
                    message: error.message, // Standardize with frontend expectations
                    code: 'CONFLICT',
                    details: { resource: error.resource, field: error.field, value: error.value, ...(error.details || {}) },
                }) as any,
                409
            )

        default:
            console.error('Unhandled error:', error)
            void maybeSendDiscordAlert(c, error as any, 500, { code: 'INTERNAL_ERROR' })
            return c.json(buildErrorResponse(c, { success: false, error: 'Internal server error', message: 'Internal server error' }) as any, 500)
    }
}

function shouldAlertStatus(path: string | undefined, status: number): boolean {
    const normalizedPath = String(path || '')
    if (status >= 500) return true
    if (status === 403 || status === 409) {
        return normalizedPath.startsWith('/api/v1/approval')
            || normalizedPath.startsWith('/api/v1/approvals')
            || normalizedPath.startsWith('/api/v1/rbac')
            || normalizedPath.startsWith('/api/v1/users')
    }
    return false
}

async function maybeSendDiscordAlert(
    c: Context,
    error: { message?: string; details?: unknown; _tag?: string },
    status: number,
    extra?: Record<string, unknown>
): Promise<void> {
    if (!shouldAlertStatus(c.req.path, status)) return

    const severity = status >= 500 ? 'error' : 'warn'
    await sendDiscordAlert({
        source: 'backend',
        severity,
        event: `http_${status}_${String(error._tag || 'error').toLowerCase()}`,
        message: String(error.message || 'HTTP error'),
        requestId: c.get('requestId'),
        tenantId: c.get('tenantId'),
        userId: c.get('userId'),
        context: {
            path: c.req.path,
            method: c.req.method,
            status,
            ...extra,
        },
    })
}

/**
 * Extract error from Effect cause
 */
function extractError(cause: unknown): CommonError | RateLimitError | null {
    // Handle Effect cause structure
    if (cause && typeof cause === 'object') {
        if ('_tag' in cause && cause._tag === 'Fail' && 'error' in cause) {
            return cause.error as CommonError | RateLimitError
        }
        // Direct error object
        if ('_tag' in cause) {
            return cause as CommonError | RateLimitError
        }

        const nestedRecord = cause as Record<string, unknown>
        for (const key of ['error', 'cause', 'failure', 'defect']) {
            const nested = nestedRecord[key]
            const extracted = extractError(nested)
            if (extracted) return extracted
        }
    }

    if (cause instanceof Error) {
        const errorName = String(cause.name || '')
        const message = String(cause.message || 'Internal server error')

        // Effect.runPromise(...) throws FiberFailure wrappers. Recover the semantic error type from the wrapper name.
        if (errorName.includes('AuthorizationError')) {
            return new AuthorizationError({
                message,
                requiredPermission: 'unknown',
            })
        }

        if (errorName.includes('ConflictError')) {
            return new ConflictError({
                message,
                resource: 'unknown',
            })
        }

        if (errorName.includes('ValidationError')) {
            return new ValidationError({
                message,
                errors: [message],
            })
        }

        if (errorName.includes('NotFoundError')) {
            return new NotFoundError({
                message,
                resource: 'Unknown',
                id: 'unknown',
            })
        }

        if (errorName.includes('AuthenticationError')) {
            return new AuthenticationError({
                message,
                reason: 'unexpected_error',
            })
        }

        if (errorName.includes('BusinessError')) {
            return new BusinessError({
                message,
                code: 'BUSINESS_ERROR',
            })
        }
    }
    return null
}

/**
 * Wrap a database operation with proper error handling
 */
export function dbOperation<A>(
    operation: 'query' | 'insert' | 'update' | 'delete' | 'transaction',
    fn: () => Promise<A>
): Effect.Effect<A, DatabaseError> {
    return Effect.tryPromise({
        try: fn,
        catch: (error) =>
            new DatabaseError({
                message: error instanceof Error ? error.message : 'Database operation failed',
                operation,
                cause: error,
            }),
    })
}

/**
 * Validate data with Zod and return Effect
 */
export function validate<T>(
    schema: { safeParse: (data: unknown) => { success: boolean; data?: T; error?: { errors: { message: string; path: (string | number)[] }[] } } },
    data: unknown
): Effect.Effect<T, ValidationError> {
    return Effect.sync(() => {
        const result = schema.safeParse(data)
        if (result.success) {
            return result.data as T
        }
        const errors = result.error?.errors.map((e) => e.message) ?? ['Validation failed']
        throw new ValidationError({
            message: 'Validation failed',
            errors,
        })
    }).pipe(Effect.catchAll((e) => Effect.fail(e as ValidationError)))
}
