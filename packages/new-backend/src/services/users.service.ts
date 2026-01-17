import { Effect, pipe } from 'effect'
import { getDatabase } from '@/config/database'
import { users, type User, type NewUser } from '@/db/schema'
import { DatabaseError, NotFoundError, ValidationError } from '@/lib/errors'
import { AuthRepository } from '@/repositories/auth.repository'
import { hashPassword } from './auth.service'

// =============================================================================
// TYPES
// =============================================================================

export interface CreateUserInput {
    email: string
    password: string
    firstName?: string
    lastName?: string
    phone?: string
    department?: string
    position?: string
    tenantId: string
    isPlatformAdmin?: boolean
}

export interface UpdateUserInput {
    firstName?: string
    lastName?: string
    phone?: string
    department?: string
    position?: string
    isActive?: boolean
    tenantId?: string // Needed to pick DB
}

// =============================================================================
// QUERY FUNCTIONS (Read Operations)
// =============================================================================

/**
 * Get users with pagination and filtering
 */
export const getUsers = (tenantId: string, options?: { search?: string; isActive?: boolean; limit?: number; offset?: number; sort?: string; order?: 'asc' | 'desc' }) =>
    Effect.tryPromise({
        try: () => {
            const db = getDatabase(tenantId)
            return AuthRepository.findUsersByTenant(db, tenantId, options)
        },
        catch: (error) => new DatabaseError({ operation: 'query', message: String(error) })
    })

/**
 * Get user by ID
 */
export const getUserById = (userId: string, tenantId?: string) =>
    Effect.tryPromise({
        try: () => {
            const db = getDatabase(tenantId)
            return AuthRepository.findUserById(db, userId)
        },
        catch: (error) => new DatabaseError({ operation: 'query', message: String(error) })
    }).pipe(
        Effect.flatMap((user) =>
            user
                ? Effect.succeed(user)
                : Effect.fail(new NotFoundError({ resource: 'User', id: userId }))
        )
    )

/**
 * Get user by email
 */
export const getUserByEmail = (email: string, tenantId?: string) =>
    Effect.tryPromise({
        try: () => {
            const db = getDatabase(tenantId)
            return AuthRepository.findUserByEmail(db, email, tenantId)
        },
        catch: (error) => new DatabaseError({ operation: 'query', message: String(error) })
    })

/**
 * Get user statistics
 */
export const getUserStats = (tenantId: string) =>
    Effect.tryPromise({
        try: () => {
            const db = getDatabase(tenantId)
            return AuthRepository.getUserStats(db, tenantId)
        },
        catch: (error) => new DatabaseError({ operation: 'query', message: String(error) })
    })

// =============================================================================
// COMMAND FUNCTIONS (Write Operations)
// =============================================================================

/**
 * Create a new user
 */
export const createUser = (
    input: CreateUserInput
): Effect.Effect<User, DatabaseError | ValidationError> =>
    pipe(
        // Check if email already exists
        Effect.tryPromise({
            try: () => {
                const db = getDatabase(input.tenantId)
                return AuthRepository.findUserByEmail(db, input.email, input.tenantId)
            },
            catch: (error) => new DatabaseError({ operation: 'query', message: String(error) })
        }),
        Effect.flatMap((existing) =>
            existing
                ? Effect.fail(
                    new ValidationError({
                        message: 'User with this email already exists',
                        field: 'email',
                        errors: ['Email must be unique within tenant'],
                    })
                )
                : Effect.succeed(undefined)
        ),
        // Hash password and create user
        Effect.flatMap(() =>
            Effect.tryPromise({
                try: async () => {
                    const passwordHash = await hashPassword(input.password)
                    return passwordHash
                },
                catch: (error) =>
                    new DatabaseError({
                        operation: 'query',
                        message: `Failed to hash password: ${error}`,
                    }),
            })
        ),
        Effect.flatMap((passwordHash) =>
            Effect.tryPromise({
                try: () => {
                    const db = getDatabase(input.tenantId)
                    return AuthRepository.createUser(db, {
                        email: input.email,
                        username: input.email.split('@')[0],
                        passwordHash,
                        fullName: `${input.firstName || ''} ${input.lastName || ''}`.trim() || input.email.split('@')[0],
                        phone: input.phone,
                        department: input.department,
                        position: input.position,
                        tenantId: input.tenantId,
                        isActive: true, // Default to true?
                        emailVerifiedAt: null,
                    })
                },
                catch: (error) => new DatabaseError({ operation: 'insert', message: String(error) })
            })
        )
    )

/**
 * Update a user
 */
export const updateUser = (
    userId: string,
    input: UpdateUserInput
): Effect.Effect<User, DatabaseError | NotFoundError> =>
    Effect.tryPromise({
        try: () => {
            const db = getDatabase(input.tenantId)
            return AuthRepository.updateUser(db, userId, input)
        },
        catch: (error) => new DatabaseError({ operation: 'update', message: String(error) })
    }).pipe(
        Effect.map((result) => result)
    )

/**
 * Delete a user (soft delete)
 */
export const deleteUser = (
    userId: string,
    tenantId?: string
): Effect.Effect<User, DatabaseError | NotFoundError> =>
    Effect.tryPromise({
        try: () => {
            const db = getDatabase(tenantId)
            return AuthRepository.updateUser(db, userId, { isActive: false })
        },
        catch: (error) => new DatabaseError({ operation: 'update', message: String(error) })
    }).pipe(
        Effect.map((result) => result)
    )

/**
 * Update user password
 */
export const updatePassword = (
    userId: string,
    newPassword: string,
    tenantId?: string
): Effect.Effect<User, DatabaseError | NotFoundError> =>
    pipe(
        Effect.tryPromise({
            try: () => hashPassword(newPassword),
            catch: (error) =>
                new DatabaseError({
                    operation: 'query',
                    message: `Failed to hash password: ${error}`,
                }),
        }),
        Effect.flatMap((passwordHash) =>
            Effect.tryPromise({
                try: () => {
                    const db = getDatabase(tenantId)
                    return AuthRepository.updatePassword(db, userId, passwordHash)
                },
                catch: (error) => new DatabaseError({ operation: 'update', message: String(error) })
            })
        ),
        Effect.flatMap(() => getUserById(userId, tenantId)) // Return updated user
    )

/**
 * Enable a user
 */
export const enableUser = (userId: string, tenantId?: string): Effect.Effect<User, DatabaseError | NotFoundError> =>
    Effect.tryPromise({
        try: () => {
            const db = getDatabase(tenantId)
            return AuthRepository.updateUser(db, userId, { isActive: true })
        },
        catch: (error) => new DatabaseError({ operation: 'update', message: String(error) })
    })

/**
 * Disable a user
 */
export const disableUser = (userId: string, tenantId?: string): Effect.Effect<User, DatabaseError | NotFoundError> =>
    Effect.tryPromise({
        try: () => {
            const db = getDatabase(tenantId)
            return AuthRepository.updateUser(db, userId, { isActive: false })
        },
        catch: (error) => new DatabaseError({ operation: 'update', message: String(error) })
    })

/**
 * Mark email as verified
 */
export const verifyEmail = (userId: string, tenantId?: string): Effect.Effect<User, DatabaseError | NotFoundError> =>
    Effect.tryPromise({
        try: () => {
            const db = getDatabase(tenantId)
            return AuthRepository.verifyEmail(db, userId)
        },
        catch: (error) => new DatabaseError({ operation: 'update', message: String(error) })
    }).pipe(
        Effect.flatMap(() => getUserById(userId, tenantId)) // Return updated user
    )
