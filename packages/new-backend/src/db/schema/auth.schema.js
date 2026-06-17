"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailVerificationTokensRelations = exports.passwordResetTokensRelations = exports.sessionsRelations = exports.emailVerificationTokens = exports.passwordResetTokens = exports.sessions = exports.authSchema = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const core_1 = require("./core");
const platform_schema_1 = require("./platform.schema"); // ✅ Import tenants from platform schema
/**
 * Auth schema for authentication-related tables
 */
exports.authSchema = (0, pg_core_1.pgSchema)('auth');
// =============================================================================
// SESSIONS TABLE
// =============================================================================
/**
 * Sessions table definition.
 * Stores active user sessions, including device info and expiration.
 */
exports.sessions = exports.authSchema.table('sessions', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    userId: (0, pg_core_1.uuid)('user_id')
        .notNull()
        .references(() => core_1.users.id, { onDelete: 'cascade' }),
    tenantId: (0, pg_core_1.uuid)('tenant_id').references(() => platform_schema_1.tenants.id),
    // Token identifiers (jti - JWT ID)
    accessTokenId: (0, pg_core_1.uuid)('access_token_id').notNull(),
    refreshTokenId: (0, pg_core_1.uuid)('refresh_token_id').notNull(),
    // Device/client info
    userAgent: (0, pg_core_1.text)('user_agent'),
    ipAddress: (0, pg_core_1.varchar)('ip_address', { length: 45 }),
    deviceType: (0, pg_core_1.varchar)('device_type', { length: 50 }),
    deviceName: (0, pg_core_1.varchar)('device_name', { length: 100 }),
    // Session metadata
    isActive: (0, pg_core_1.boolean)('is_active').notNull().default(true),
    lastActivityAt: (0, pg_core_1.timestamp)('last_activity_at').notNull().defaultNow(),
    // Expiration
    expiresAt: (0, pg_core_1.timestamp)('expires_at').notNull(),
    refreshExpiresAt: (0, pg_core_1.timestamp)('refresh_expires_at').notNull(),
    // Timestamps
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
    revokedAt: (0, pg_core_1.timestamp)('revoked_at'),
    revokeReason: (0, pg_core_1.varchar)('revoke_reason', { length: 100 }),
}, (table) => [
    (0, pg_core_1.index)('sessions_user_idx').on(table.userId),
    (0, pg_core_1.index)('sessions_tenant_idx').on(table.tenantId),
    (0, pg_core_1.uniqueIndex)('sessions_access_token_idx').on(table.accessTokenId),
    (0, pg_core_1.uniqueIndex)('sessions_refresh_token_idx').on(table.refreshTokenId),
    (0, pg_core_1.index)('sessions_active_idx').on(table.isActive),
    (0, pg_core_1.index)('sessions_expires_idx').on(table.expiresAt),
]);
// =============================================================================
// PASSWORD RESET TOKENS TABLE
// =============================================================================
/**
 * Password reset tokens table definition.
 * Stores temporary tokens for identifying password reset requests.
 */
exports.passwordResetTokens = exports.authSchema.table('password_reset_tokens', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    userId: (0, pg_core_1.uuid)('user_id')
        .notNull()
        .references(() => core_1.users.id, { onDelete: 'cascade' }),
    token: (0, pg_core_1.varchar)('token', { length: 255 }).notNull(),
    expiresAt: (0, pg_core_1.timestamp)('expires_at').notNull(),
    usedAt: (0, pg_core_1.timestamp)('used_at'),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
}, (table) => [
    (0, pg_core_1.index)('password_reset_user_idx').on(table.userId),
    (0, pg_core_1.uniqueIndex)('password_reset_token_idx').on(table.token),
    (0, pg_core_1.index)('password_reset_expires_idx').on(table.expiresAt),
]);
// =============================================================================
// EMAIL VERIFICATION TOKENS TABLE
// =============================================================================
/**
 * Email verification tokens table definition.
 * Stores tokens for verifying new user email addresses.
 */
exports.emailVerificationTokens = exports.authSchema.table('email_verification_tokens', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    userId: (0, pg_core_1.uuid)('user_id')
        .notNull()
        .references(() => core_1.users.id, { onDelete: 'cascade' }),
    token: (0, pg_core_1.varchar)('token', { length: 255 }).notNull(),
    expiresAt: (0, pg_core_1.timestamp)('expires_at').notNull(),
    verifiedAt: (0, pg_core_1.timestamp)('verified_at'),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
}, (table) => [
    (0, pg_core_1.index)('email_verification_user_idx').on(table.userId),
    (0, pg_core_1.uniqueIndex)('email_verification_token_idx').on(table.token),
]);
// =============================================================================
// RELATIONS
// =============================================================================
exports.sessionsRelations = (0, drizzle_orm_1.relations)(exports.sessions, ({ one }) => ({
    user: one(core_1.users, {
        fields: [exports.sessions.userId],
        references: [core_1.users.id],
    }),
    tenant: one(platform_schema_1.tenants, {
        fields: [exports.sessions.tenantId],
        references: [platform_schema_1.tenants.id],
    }),
}));
exports.passwordResetTokensRelations = (0, drizzle_orm_1.relations)(exports.passwordResetTokens, ({ one }) => ({
    user: one(core_1.users, {
        fields: [exports.passwordResetTokens.userId],
        references: [core_1.users.id],
    }),
}));
exports.emailVerificationTokensRelations = (0, drizzle_orm_1.relations)(exports.emailVerificationTokens, ({ one }) => ({
    user: one(core_1.users, {
        fields: [exports.emailVerificationTokens.userId],
        references: [core_1.users.id],
    }),
}));
