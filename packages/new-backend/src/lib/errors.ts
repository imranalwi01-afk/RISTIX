import { Data } from 'effect'

/**
 * Base application error - all errors extend from this
 */
export class AppError extends Data.TaggedError('AppError')<{
    readonly message: string
    readonly code: string
    readonly cause?: unknown
}> { }

/**
 * Database operation errors
 */
export class DatabaseError extends Data.TaggedError('DatabaseError')<{
    readonly message: string
    readonly operation: 'query' | 'insert' | 'update' | 'delete' | 'upsert' | 'transaction'
    readonly cause?: unknown
}> { }

/**
 * Validation errors from Zod or business rules
 */
export class ValidationError extends Data.TaggedError('ValidationError')<{
    readonly message: string
    readonly field?: string
    readonly errors: readonly string[]
}> { }

/**
 * Resource not found error
 */
export class NotFoundError extends Data.TaggedError('NotFoundError')<{
    readonly resource: string
    readonly id: string | number
}> { }

/**
 * Authentication error - token invalid or missing
 */
export class AuthenticationError extends Data.TaggedError('AuthenticationError')<{
    readonly message: string
    readonly reason: 'missing_token' | 'invalid_token' | 'expired_token' | 'invalid_credentials' | 'refactor_pending' | 'unexpected_error'
    readonly code?: string
}> { }

/**
 * Authorization error - user lacks permission
 */
export class AuthorizationError extends Data.TaggedError('AuthorizationError')<{
    readonly message: string
    readonly requiredPermission: string
    readonly userId?: string
}> { }

/**
 * Business rule violation
 */
export class BusinessError extends Data.TaggedError('BusinessError')<{
    readonly message: string
    readonly code: string
    readonly details?: Record<string, unknown>
}> { }

/**
 * Rate limit exceeded
 */
export class RateLimitError extends Data.TaggedError('RateLimitError')<{
    readonly message: string
    readonly retryAfter: number
}> { }

/**
 * Conflict error - duplicate resource or version mismatch
 */
export class ConflictError extends Data.TaggedError('ConflictError')<{
    readonly message: string
    readonly resource: string
    readonly field?: string
    readonly value?: unknown
}> { }

/**
 * Type alias for common error union
 */
export type CommonError =
    | DatabaseError
    | ValidationError
    | NotFoundError
    | AuthenticationError
    | AuthorizationError
    | BusinessError
    | ConflictError
