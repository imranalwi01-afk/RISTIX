import { eq, and, or, asc, desc, count, ilike, sql, gte, isNull } from 'drizzle-orm'
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import * as schema from '@/db/schema'
import {
    users,
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

type DrizzleDB = PostgresJsDatabase<typeof schema>

export const AuthRepository = {
    // ---------------------------------------------------------------------------
    // USER OPERATIONS
    // ---------------------------------------------------------------------------

    findUserById: (db: DrizzleDB, id: string) =>
        db.query.users.findFirst({
            where: eq(users.id, id),
        }),

    findUserByEmail: (db: DrizzleDB, email: string, tenantId?: string) =>
        db.query.users.findFirst({
            where: tenantId
                ? and(eq(users.email, email), eq(users.tenantId, tenantId))
                : eq(users.email, email),
        }),

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

    createUser: async (db: DrizzleDB, data: NewUser) => {
        const [user] = await db.insert(users).values({
            ...data,
            createdAt: new Date(),
            updatedAt: new Date(),
        }).returning()
        return user
    },

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

    getUserStats: async (db: DrizzleDB, tenantId: string) => {
        const result = await db
            .select({
                total: count(),
                active: sql<number>`SUM(CASE WHEN is_active = true THEN 1 ELSE 0 END)`,
                inactive: sql<number>`SUM(CASE WHEN is_active = false THEN 1 ELSE 0 END)`,
                verifiedEmail: sql<number>`SUM(CASE WHEN is_email_verified = true THEN 1 ELSE 0 END)`,
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

    findSessionByTokenId: (db: DrizzleDB, tokenId: string) =>
        db.query.sessions.findFirst({
            where: and(eq(sessions.accessTokenId, tokenId), eq(sessions.isActive, true)),
        }),

    findActiveSessionsByUser: (db: DrizzleDB, userId: string) =>
        db.query.sessions.findMany({
            where: and(eq(sessions.userId, userId), eq(sessions.isActive, true)),
            orderBy: [desc(sessions.createdAt)],
        }),

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
