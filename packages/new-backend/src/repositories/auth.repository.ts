import { eq, and, or, asc, desc, count, ilike, sql, gte, isNull } from 'drizzle-orm'
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import * as schema from '@/db/schema'
import {
    users,
    platformUsers, // ✅ Import platformUsers
    sessions,
    passwordResetTokens,
    emailVerificationTokens,
    type NewUser,
    type NewSession,
    type NewPasswordResetToken,
    type NewEmailVerificationToken,
} from '@/db/schema'

// =============================================================================
// AUTH REPOSITORY - Domain: Authentication & Identity
// =============================================================================
// Handles: users, sessions, password_reset_tokens, email_verification_tokens
// =============================================================================

/**
 * @module AuthRepository
 * Data access layer for Authentication and Identity.
 * Handles database operations for users, sessions, and verification tokens.
 */

export type DrizzleDB = PostgresJsDatabase<typeof schema>

/**
 * Repository object containing all authentication-related data operations.
 */
export const AuthRepository = {
    // ---------------------------------------------------------------------------
    // USER OPERATIONS
    // ---------------------------------------------------------------------------

    /**
     * Find a user by their unique record ID.
     * 
     * @param db - Drizzle database instance
     * @param id - The user ID
     * @returns A promise that resolves to the User record or undefined
     */
    findUserById: (db: DrizzleDB, id: string) =>
        db.query.users.findFirst({
            where: eq(users.id, id),
        }),

    /**
     * Find a platform user by their unique record ID.
     *
     * Uses platform_admin.users (via platformUsers schema), not core.users.
     */
    findPlatformUserById: (db: DrizzleDB, id: string) =>
        db.query.platformUsers.findFirst({
            where: eq(platformUsers.id, id),
        }),

    /**
     * Find a user by their email address, optionally scoped to a tenant.
     * 
     * @param db - Drizzle database instance
     * @param email - The email address
     * @param tenantId - Optional tenant ID for scoping
     * @returns A promise that resolves to the User record or undefined
     */
    findUserByEmail: (db: DrizzleDB, email: string, tenantId?: string) =>
        db.query.users.findFirst({
            where: tenantId
                ? and(eq(users.email, email), eq(users.tenantId, tenantId))
                : eq(users.email, email),
        }),

    /**
     * Find a user by their username, optionally scoped to a tenant.
     * 
     * @param db - Drizzle database instance
     * @param username - The username
     * @param tenantId - Optional tenant ID for scoping
     * @returns A promise that resolves to the User record or undefined
     */
    findUserByUsername: (db: DrizzleDB, username: string, tenantId?: string) =>
        db.query.users.findFirst({
            where: tenantId
                ? and(eq(users.username, username), eq(users.tenantId, tenantId))
                : eq(users.username, username),
        }),

    /**
     * Find a platform user by email (using platformUsers schema)
     */
    findPlatformUserByEmail: (db: DrizzleDB, email: string) =>
        db.query.platformUsers.findFirst({
            where: eq(platformUsers.email, email),
        }),

    /**
     * Find all users belonging to a specific tenant with search and sorting.
     * 
     * @param db - Drizzle database instance
     * @param tenantId - The tenant ID
     * @param options - Query options including search, isActive, pagination, and sort
     * @returns A paginated result of User records
     */
    findUsersByTenant: async (db: DrizzleDB, tenantId: string, options?: {
        search?: string
        isActive?: boolean
        limit?: number
        offset?: number
        sort?: string
        order?: 'asc' | 'desc'
    }) => {
        const conditions = [eq(users.tenantId, tenantId)]

        if (options?.isActive !== undefined) {
            conditions.push(eq(users.isActive, options.isActive))
        }
        if (options?.search) {
            conditions.push(
                or(
                    ilike(users.email, `%${options.search}%`),
                    ilike(users.fullName, `%${options.search}%`)
                )!
            )
        }

        const whereClause = and(...conditions)
        const orderColumn = options?.sort ? (users as any)[options.sort] : users.email
        const orderDir = options?.order === 'desc' ? desc : asc

        const [data, countResult] = await Promise.all([
            db.query.users.findMany({
                where: whereClause,
                limit: options?.limit ?? 50,
                offset: options?.offset ?? 0,
                orderBy: [orderDir(orderColumn)],
            }),
            db.select({ count: count() }).from(users).where(whereClause),
        ])

        return { data, total: countResult[0]?.count ?? 0 }
    },

    /**
     * Create a new user record.
     * 
     * @param db - Drizzle database instance
     * @param data - The user data to insert
     * @returns The newly created User record
     */
    createUser: async (db: DrizzleDB, data: NewUser) => {
        const [user] = await db.insert(users).values({
            ...data,
            createdAt: new Date(),
            updatedAt: new Date(),
        }).returning()
        return user
    },

    /**
     * Update an existing user record.
     * 
     * @param db - Drizzle database instance
     * @param id - The user ID to update
     * @param data - Partial user data containing updates
     * @returns The updated User record
     */
    updateUser: async (db: DrizzleDB, id: string, data: Partial<NewUser>) => {
        const [user] = await db.update(users).set({
            ...data,
            updatedAt: new Date(),
        }).where(eq(users.id, id)).returning()
        return user
    },

    updatePassword: (db: DrizzleDB, id: string, passwordHash: string) =>
        db.update(users).set({
            passwordHash,
            updatedAt: new Date(),
        }).where(eq(users.id, id)),

    verifyEmail: (db: DrizzleDB, id: string) =>
        db.update(users).set({
            emailVerifiedAt: new Date(),
            updatedAt: new Date(),
        }).where(eq(users.id, id)),

    updateLastLogin: (db: DrizzleDB, id: string) =>
        db.update(users).set({
            lastLoginAt: new Date(),
            updatedAt: new Date(),
        }).where(eq(users.id, id)),

    updatePlatformUserLastLogin: (db: DrizzleDB, id: string) =>
        db.update(platformUsers).set({
            lastLoginAt: new Date(),
            updatedAt: new Date(),
        }).where(eq(platformUsers.id, id)),

    getUserStats: async (db: DrizzleDB, tenantId: string) => {
        const result = await db
            .select({
                total: count(),
                active: sql<number>`SUM(CASE WHEN is_active = true THEN 1 ELSE 0 END)`,
                inactive: sql<number>`SUM(CASE WHEN is_active = false THEN 1 ELSE 0 END)`,
                verifiedEmail: sql<number>`SUM(CASE WHEN email_verified_at IS NOT NULL THEN 1 ELSE 0 END)`,
            })
            .from(users)
            .where(eq(users.tenantId, tenantId))

        return {
            total: result[0]?.total ?? 0,
            active: Number(result[0]?.active ?? 0),
            inactive: Number(result[0]?.inactive ?? 0),
            verifiedEmail: Number(result[0]?.verifiedEmail ?? 0),
        }
    },

    // ---------------------------------------------------------------------------
    // SESSION OPERATIONS
    // ---------------------------------------------------------------------------

    /**
     * Find a session by its access token ID.
     * 
     * @param db - Drizzle database instance
     * @param tokenId - The unique identifier of the access token
     * @returns A promise that resolves to the Session if found and active
     */
    findSessionByTokenId: (db: DrizzleDB, tokenId: string) =>
        db.query.sessions.findFirst({
            where: and(eq(sessions.accessTokenId, tokenId), eq(sessions.isActive, true)),
        }),

    findActiveSessionsByUser: (db: DrizzleDB, userId: string) =>
        db.query.sessions.findMany({
            where: and(eq(sessions.userId, userId), eq(sessions.isActive, true)),
            orderBy: [desc(sessions.createdAt)],
        }),

    /**
     * Create a new session record.
     * 
     * @param db - Drizzle database instance
     * @param data - The session data to insert
     * @returns The newly created Session record
     */
    createSession: async (db: DrizzleDB, data: NewSession) => {
        const [session] = await db.insert(sessions).values(data).returning()
        return session
    },

    invalidateSession: (db: DrizzleDB, tokenId: string) =>
        db.update(sessions).set({ isActive: false }).where(eq(sessions.accessTokenId, tokenId)),

    invalidateAllUserSessions: (db: DrizzleDB, userId: string) =>
        db.update(sessions).set({ isActive: false }).where(eq(sessions.userId, userId)),

    cleanupExpiredSessions: (db: DrizzleDB) =>
        db.delete(sessions).where(
            and(
                eq(sessions.isActive, false),
                sql`${sessions.expiresAt} < NOW()`
            )
        ),

    // ---------------------------------------------------------------------------
    // PASSWORD RESET TOKEN OPERATIONS
    // ---------------------------------------------------------------------------

    findPasswordResetToken: (db: DrizzleDB, token: string) =>
        db.query.passwordResetTokens.findFirst({
            where: and(
                eq(passwordResetTokens.token, token),
                isNull(passwordResetTokens.usedAt),
                gte(passwordResetTokens.expiresAt, new Date())
            ),
        }),

    createPasswordResetToken: async (db: DrizzleDB, data: NewPasswordResetToken) => {
        const [token] = await db.insert(passwordResetTokens).values(data).returning()
        return token
    },

    markPasswordResetTokenUsed: (db: DrizzleDB, id: string) =>
        db.update(passwordResetTokens).set({ usedAt: new Date() }).where(eq(passwordResetTokens.id, id)),

    // ---------------------------------------------------------------------------
    // EMAIL VERIFICATION TOKEN OPERATIONS
    // ---------------------------------------------------------------------------

    findEmailVerificationToken: (db: DrizzleDB, token: string) =>
        db.query.emailVerificationTokens.findFirst({
            where: and(
                eq(emailVerificationTokens.token, token),
                isNull(emailVerificationTokens.verifiedAt),
                gte(emailVerificationTokens.expiresAt, new Date())
            ),
        }),

    createEmailVerificationToken: async (db: DrizzleDB, data: NewEmailVerificationToken) => {
        const [token] = await db.insert(emailVerificationTokens).values(data).returning()
        return token
    },

    markEmailVerificationTokenUsed: (db: DrizzleDB, id: string) =>
        db.update(emailVerificationTokens).set({ verifiedAt: new Date() }).where(eq(emailVerificationTokens.id, id)),
}

export type AuthRepositoryType = typeof AuthRepository
