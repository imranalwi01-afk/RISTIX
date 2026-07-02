import { Effect, pipe } from 'effect'
import { getDatabase } from '@/config/database'
import { users, type User, type NewUser } from '@/db/schema'
import { DatabaseError, NotFoundError, ValidationError } from '@/lib/errors'
import { AuthRepository } from '@/repositories/auth.repository'
import { hashPassword } from './auth.service'
import { validatePasswordPolicy } from '@/lib/password-policy'

// =============================================================================
// TYPES
// =============================================================================

export interface CreateUserInput {
    email: string
    password: string
    fullName?: string
    username?: string
    employeeId?: string
    phone?: string
    department?: string
    position?: string
    tenantId: string
    isPlatformAdmin?: boolean
    sendWelcomeEmail?: boolean
    sendWelcomeWhatsApp?: boolean
}

export interface UpdateUserInput {
    fullName?: string
    username?: string
    email?: string
    employeeId?: string
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
 * Get users with pagination and filtering.
 * 
 * @param tenantId - The tenant ID
 * @param options - Query options including search, active status, pagination, and sorting
 * @returns An Effect resolving to paginated user results
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
 * Get user by ID.
 * 
 * @param userId - The user ID
 * @param tenantId - Optional tenant ID to pick the database
 * @returns An Effect resolving to the user or NotFoundError
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
                : Effect.fail(new NotFoundError({ message: 'User not found', resource: 'User', id: userId }))
        )
    )

/**
 * Get user by email.
 * 
 * @param email - The email address
 * @param tenantId - Optional tenant ID
 * @returns An Effect resolving to the user or undefined
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
 * Get user statistics.
 * 
 * @param tenantId - The tenant ID
 * @returns An Effect resolving to user statistics
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
 * Create a new user.
 * Hashes the password and creates the user record.
 * 
 * @param input - The user creation data
 * @returns An Effect resolving to the created User or an error (DatabaseError/ValidationError)
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
        // Check if username already exists
        Effect.flatMap(() =>
            Effect.tryPromise({
                try: () => {
                    const db = getDatabase(input.tenantId)
                    const username = input.username || input.email.split('@')[0]
                    return AuthRepository.findUserByUsername(db, username, input.tenantId)
                },
                catch: (error) => new DatabaseError({ operation: 'query', message: String(error) })
            })
        ),
        Effect.flatMap((existingUsername) =>
            existingUsername
                ? Effect.fail(
                    new ValidationError({
                        message: 'User with this username already exists',
                        field: 'username',
                        errors: ['Username must be unique within tenant'],
                    })
                )
                : Effect.succeed(undefined)
        ),
        // Validate password policy
        Effect.flatMap(() => validatePasswordPolicy(input.password, input.tenantId)),
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
                        username: input.username || input.email.split('@')[0],
                        passwordHash,
                        fullName: input.fullName || input.email.split('@')[0],
                        employeeId: input.employeeId,
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
        ),
        Effect.tap((user) => Effect.sync(() => {
            if (input.sendWelcomeEmail) {
                import('./notification.service').then(({ sendEmailNotification }) => {
                    import('../config/env').then(({ env: config }) => {
                        const loginUrl = `${(config as any).FRONTEND_URL || 'http://localhost:4231'}/login`;
                        const job = { template: 'welcome_email' } as any;
                        Effect.runPromise(sendEmailNotification).then(sendFn => {
                            sendFn(job, input.email, {
                                fullName: input.fullName || input.email.split('@')[0],
                                username: input.username || input.email.split('@')[0],
                                password: input.password,
                                loginUrl,
                            }).catch(e => console.error('Failed to send welcome email', e));
                        });
                    });
                });
            }
            const phone = input.phone
            if (input.sendWelcomeWhatsApp && phone) {
                import('./notification.service').then(({ sendWhatsAppFonnte }) => {
                    import('../config/env').then(({ env: config }) => {
                        const loginUrl = `${(config as any).FRONTEND_URL || 'http://localhost:4231'}/login`;
                        const message = `*Welcome to IFRS 9 Platform*\n\nHi *${input.fullName || input.email.split('@')[0]}*,\n\nYour account has been created. Here are your login credentials:\n\nUsername: *${input.username || input.email.split('@')[0]}*\nPassword: *${input.password}*\n\nLogin here: ${loginUrl}\n\nPlease change your password after logging in.`;
                        sendWhatsAppFonnte(phone, message).catch(e => console.error('Failed to send welcome WhatsApp', e));
                    });
                });
            }
        }))
    )

/**
 * Update a user.
 * 
 * @param userId - The user ID
 * @param input - The data to update
 * @returns An Effect resolving to the updated User or error
 */
export const updateUser = (
    userId: string,
    input: UpdateUserInput
): Effect.Effect<User, DatabaseError | NotFoundError | ValidationError> =>
    pipe(
        // Check if email already exists on another user
        Effect.tryPromise({
            try: async () => {
                if (!input.email) return null
                const db = getDatabase(input.tenantId)
                const existing = await AuthRepository.findUserByEmail(db, input.email, input.tenantId)
                console.log('🔍 [updateUser] Email Check:', { userId, existingId: existing?.id, match: existing?.id === userId })
                return existing && existing.id !== userId ? existing : null
            },
            catch: (error) => new DatabaseError({ operation: 'query', message: String(error) })
        }),
        Effect.flatMap((existingEmail) =>
            existingEmail
                ? Effect.fail(
                    new ValidationError({
                        message: 'User with this email already exists',
                        field: 'email',
                        errors: ['Email must be unique within tenant'],
                    })
                )
                : Effect.succeed(undefined)
        ),
        // Check if username already exists on another user
        Effect.flatMap(() =>
            Effect.tryPromise({
                try: async () => {
                    if (!input.username) return null
                    const db = getDatabase(input.tenantId)
                    const existing = await AuthRepository.findUserByUsername(db, input.username, input.tenantId)
                    console.log('🔍 [updateUser] Username Check:', { userId, existingId: existing?.id, match: existing?.id === userId })
                    return existing && existing.id !== userId ? existing : null
                },
                catch: (error) => new DatabaseError({ operation: 'query', message: String(error) })
            })
        ),
        Effect.flatMap((existingUsername) =>
            existingUsername
                ? Effect.fail(
                    new ValidationError({
                        message: 'User with this username already exists',
                        field: 'username',
                        errors: ['Username must be unique within tenant'],
                    })
                )
                : Effect.succeed(undefined)
        ),
        // Perform actual update
        Effect.flatMap(() =>
            Effect.tryPromise({
                try: () => {
                    const db = getDatabase(input.tenantId)
                    return AuthRepository.updateUser(db, userId, input)
                },
                catch: (error) => new DatabaseError({ operation: 'update', message: String(error) })
            })
        )
    )

/**
 * Delete a user (soft delete).
 * Sets isActive to false.
 * 
 * @param userId - The user ID
 * @param tenantId - Optional tenant ID
 * @returns An Effect resolving to the updated user
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
 * Update user password.
 * Hashes the new password before updating.
 * 
 * @param userId - The user ID
 * @param newPassword - The new password
 * @param tenantId - Optional tenant ID
 * @returns An Effect resolving to the updated user
 */
export const updatePassword = (
    userId: string,
    newPassword: string,
    tenantId?: string
): Effect.Effect<User, DatabaseError | NotFoundError | ValidationError> =>
    pipe(
        // Validate password policy
        validatePasswordPolicy(newPassword, tenantId || 'dana'),
        Effect.flatMap(() =>
            Effect.tryPromise({
                try: () => hashPassword(newPassword),
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
                    const db = getDatabase(tenantId)
                    return AuthRepository.updatePassword(db, userId, passwordHash)
                },
                catch: (error) => new DatabaseError({ operation: 'update', message: String(error) })
            })
        ),
        Effect.flatMap(() => getUserById(userId, tenantId)) // Return updated user
    )

/**
 * Administrative password reset with optional force-change-on-login.
 */
export const resetPassword = (
    userId: string,
    newPassword: string,
    tenantId: string,
    options?: { forcePasswordChange?: boolean }
): Effect.Effect<User, DatabaseError | NotFoundError | ValidationError> =>
    pipe(
        // Validate password policy
        validatePasswordPolicy(newPassword, tenantId),
        Effect.flatMap(() =>
            Effect.tryPromise({
                try: () => hashPassword(newPassword),
                catch: (error) =>
                    new DatabaseError({
                        operation: 'query',
                        message: `Failed to hash password: ${error}`,
                    }),
            })
        ),
        Effect.flatMap((passwordHash) =>
            Effect.tryPromise({
                try: async () => {
                    const db = getDatabase(tenantId)
                    await AuthRepository.updateUser(db, userId, {
                        passwordHash,
                        forcePasswordChange: options?.forcePasswordChange ?? true,
                        passwordChangedAt: new Date(),
                        failedLoginAttempts: 0,
                    } as any)
                    return true
                },
                catch: (error) => new DatabaseError({ operation: 'update', message: String(error) })
            })
        ),
        Effect.flatMap(() => getUserById(userId, tenantId))
    )

/**
 * Enable a user.
 * Sets isActive to true.
 * 
 * @param userId - The user ID
 * @param tenantId - Optional tenant ID
 * @returns An Effect resolving to the updated user
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
 * Disable a user.
 * Sets isActive to false.
 * 
 * @param userId - The user ID
 * @param tenantId - Optional tenant ID
 * @returns An Effect resolving to the updated user
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
 * Mark email as verified.
 * 
 * @param userId - The user ID
 * @param tenantId - Optional tenant ID
 * @returns An Effect resolving to the updated user
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
