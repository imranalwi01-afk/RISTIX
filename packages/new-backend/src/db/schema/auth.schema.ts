import {
    pgSchema,
    uuid,
    varchar,
    text,
    timestamp,
    boolean,
    index,
    uniqueIndex,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { users, tenants } from './core'

/**
 * Auth schema for authentication-related tables
 */
export const authSchema = pgSchema('auth')

// =============================================================================
// SESSIONS TABLE
// =============================================================================

/**
 * Sessions table definition.
 * Stores active user sessions, including device info and expiration.
 */
export const sessions = authSchema.table(
    'sessions',
    {
        id: uuid('id').primaryKey().defaultRandom(),
        userId: uuid('user_id')
            .notNull()
            .references(() => users.id, { onDelete: 'cascade' }),
        tenantId: uuid('tenant_id').references(() => tenants.id),

        // Token identifiers (jti - JWT ID)
        accessTokenId: uuid('access_token_id').notNull(),
        refreshTokenId: uuid('refresh_token_id').notNull(),

        // Device/client info
        userAgent: text('user_agent'),
        ipAddress: varchar('ip_address', { length: 45 }),
        deviceType: varchar('device_type', { length: 50 }),
        deviceName: varchar('device_name', { length: 100 }),

        // Session metadata
        isActive: boolean('is_active').notNull().default(true),
        lastActivityAt: timestamp('last_activity_at').notNull().defaultNow(),

        // Expiration
        expiresAt: timestamp('expires_at').notNull(),
        refreshExpiresAt: timestamp('refresh_expires_at').notNull(),

        // Timestamps
        createdAt: timestamp('created_at').notNull().defaultNow(),
        revokedAt: timestamp('revoked_at'),
        revokeReason: varchar('revoke_reason', { length: 100 }),
    },
    (table) => [
        index('sessions_user_idx').on(table.userId),
        index('sessions_tenant_idx').on(table.tenantId),
        uniqueIndex('sessions_access_token_idx').on(table.accessTokenId),
        uniqueIndex('sessions_refresh_token_idx').on(table.refreshTokenId),
        index('sessions_active_idx').on(table.isActive),
        index('sessions_expires_idx').on(table.expiresAt),
    ]
)

// =============================================================================
// PASSWORD RESET TOKENS TABLE
// =============================================================================

/**
 * Password reset tokens table definition.
 * Stores temporary tokens for identifying password reset requests.
 */
export const passwordResetTokens = authSchema.table(
    'password_reset_tokens',
    {
        id: uuid('id').primaryKey().defaultRandom(),
        userId: uuid('user_id')
            .notNull()
            .references(() => users.id, { onDelete: 'cascade' }),
        token: varchar('token', { length: 255 }).notNull(),
        expiresAt: timestamp('expires_at').notNull(),
        usedAt: timestamp('used_at'),
        createdAt: timestamp('created_at').notNull().defaultNow(),
    },
    (table) => [
        index('password_reset_user_idx').on(table.userId),
        uniqueIndex('password_reset_token_idx').on(table.token),
        index('password_reset_expires_idx').on(table.expiresAt),
    ]
)

// =============================================================================
// EMAIL VERIFICATION TOKENS TABLE
// =============================================================================

/**
 * Email verification tokens table definition.
 * Stores tokens for verifying new user email addresses.
 */
export const emailVerificationTokens = authSchema.table(
    'email_verification_tokens',
    {
        id: uuid('id').primaryKey().defaultRandom(),
        userId: uuid('user_id')
            .notNull()
            .references(() => users.id, { onDelete: 'cascade' }),
        token: varchar('token', { length: 255 }).notNull(),
        expiresAt: timestamp('expires_at').notNull(),
        verifiedAt: timestamp('verified_at'),
        createdAt: timestamp('created_at').notNull().defaultNow(),
    },
    (table) => [
        index('email_verification_user_idx').on(table.userId),
        uniqueIndex('email_verification_token_idx').on(table.token),
    ]
)

// =============================================================================
// RELATIONS
// =============================================================================

export const sessionsRelations = relations(sessions, ({ one }) => ({
    user: one(users, {
        fields: [sessions.userId],
        references: [users.id],
    }),
    tenant: one(tenants, {
        fields: [sessions.tenantId],
        references: [tenants.id],
    }),
}))

export const passwordResetTokensRelations = relations(passwordResetTokens, ({ one }) => ({
    user: one(users, {
        fields: [passwordResetTokens.userId],
        references: [users.id],
    }),
}))

export const emailVerificationTokensRelations = relations(emailVerificationTokens, ({ one }) => ({
    user: one(users, {
        fields: [emailVerificationTokens.userId],
        references: [users.id],
    }),
}))

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type Session = typeof sessions.$inferSelect
export type NewSession = typeof sessions.$inferInsert

export type PasswordResetToken = typeof passwordResetTokens.$inferSelect
export type NewPasswordResetToken = typeof passwordResetTokens.$inferInsert

export type EmailVerificationToken = typeof emailVerificationTokens.$inferSelect
export type NewEmailVerificationToken = typeof emailVerificationTokens.$inferInsert
