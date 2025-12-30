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
    type CommonError,
} from '../errors'

/**
 * Run an Effect and convert the result to a Hono response
 */
export async function runEffect<A>(
    c: Context,
    effect: Effect.Effect<A, CommonError>
): Promise<Response> {
    const result = await Effect.runPromiseExit(effect)

    return result._tag === 'Success'
        ? c.json({ success: true, data: result.value })
        : handleEffectError(c, result.cause)
}

/**
 * Handle Effect errors and convert to HTTP responses
 */
function handleEffectError(c: Context, cause: unknown): Response {
    // Extract the actual error from the cause
    const error = extractError(cause)

    if (!error) {
        console.error('Unknown error:', cause)
        return c.json({ success: false, error: 'Internal server error' }, 500)
    }

    switch (error._tag) {
        case 'DatabaseError':
            console.error('Database error:', error)
            return c.json(
                { success: false, error: 'Database operation failed', code: 'DB_ERROR' },
                500
            )

        case 'ValidationError':
            return c.json(
                {
                    success: false,
                    error: error.message,
                    code: 'VALIDATION_ERROR',
                    details: { field: error.field, errors: error.errors },
                },
                400
            )

        case 'NotFoundError':
            return c.json(
                {
                    success: false,
                    error: `${error.resource} with id ${error.id} not found`,
                    code: 'NOT_FOUND',
                },
                404
            )

        case 'AuthenticationError':
            return c.json(
                { success: false, error: error.message, code: 'UNAUTHENTICATED' },
                401
            )

        case 'AuthorizationError':
            return c.json(
                { success: false, error: error.message, code: 'UNAUTHORIZED' },
                403
            )

        case 'BusinessError':
            return c.json(
                {
                    success: false,
                    error: error.message,
                    code: error.code,
                    details: error.details,
                },
                422
            )

        case 'RateLimitError':
            return c.json(
                { success: false, error: error.message, code: 'RATE_LIMITED' },
                429
            )

        default:
            console.error('Unhandled error:', error)
            return c.json({ success: false, error: 'Internal server error' }, 500)
    }
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
