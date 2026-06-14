"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userTableViews = exports.tenantsRelations = exports.tenants = exports.users = exports.coreSchema = void 0;
var pg_core_1 = require("drizzle-orm/pg-core");
var drizzle_orm_1 = require("drizzle-orm");
/**
 * Core schema namespace
 */
exports.coreSchema = (0, pg_core_1.pgSchema)('core');
// =============================================================================
// USERS TABLE
// =============================================================================
/**
 * Users table definition.
 * Stores user identity, profile information, and security settings.
 * Synchronized with IAF Tenant Database schema (ifrspro_tenant_iaf)
 */
exports.users = exports.coreSchema.table('users', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    tenantId: (0, pg_core_1.varchar)('tenant_id', { length: 100 }).default('dana'),
    // Basic info
    username: (0, pg_core_1.varchar)('username', { length: 100 }).notNull(),
    email: (0, pg_core_1.varchar)('email', { length: 255 }).notNull(),
    passwordHash: (0, pg_core_1.varchar)('password_hash', { length: 255 }).notNull(),
    fullName: (0, pg_core_1.varchar)('full_name', { length: 200 }).notNull(),
    // Profile info
    phone: (0, pg_core_1.varchar)('phone', { length: 50 }),
    department: (0, pg_core_1.varchar)('department', { length: 100 }),
    position: (0, pg_core_1.varchar)('position', { length: 100 }),
    employeeId: (0, pg_core_1.varchar)('employee_id', { length: 50 }),
    bankId: (0, pg_core_1.varchar)('bank_id', { length: 50 }),
    // Status & Perms
    isActive: (0, pg_core_1.boolean)('is_active').default(true),
    isVerified: (0, pg_core_1.boolean)('is_verified').default(false),
    // Security & MFA
    mfaEnabled: (0, pg_core_1.boolean)('mfa_enabled').default(false),
    mfaSecret: (0, pg_core_1.varchar)('mfa_secret', { length: 255 }),
    backupCodes: (0, pg_core_1.text)('backup_codes').array(),
    forcePasswordChange: (0, pg_core_1.boolean)('force_password_change').default(false),
    // Activity
    loginCount: (0, pg_core_1.integer)('login_count').default(0),
    failedLoginAttempts: (0, pg_core_1.integer)('failed_login_attempts').default(0),
    lastLoginAt: (0, pg_core_1.timestamp)('last_login_at', { withTimezone: true }),
    passwordChangedAt: (0, pg_core_1.timestamp)('password_changed_at'),
    emailVerifiedAt: (0, pg_core_1.timestamp)('email_verified_at'),
    // Timestamps
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at', { withTimezone: true }).defaultNow(),
}, function (table) { return [
    (0, pg_core_1.index)('idx_dana_users_active').on(table.isActive),
    (0, pg_core_1.index)('idx_dana_users_tenant_id').on(table.tenantId),
    (0, pg_core_1.index)('idx_dana_users_username').on(table.username),
    (0, pg_core_1.index)('idx_dana_users_email').on(table.email),
    (0, pg_core_1.index)('idx_dana_users_employee_id').on(table.employeeId),
    (0, pg_core_1.index)('idx_dana_users_login_count').on(table.loginCount),
    (0, pg_core_1.index)('idx_dana_users_failed_attempts').on(table.failedLoginAttempts),
]; });
// =============================================================================
// TENANTS TABLE
// =============================================================================
/**
 * Tenants table definition.
 * Stores multi-tenancy configuration and details.
 */
exports.tenants = exports.coreSchema.table('tenants', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    code: (0, pg_core_1.varchar)('code', { length: 50 }).notNull(),
    name: (0, pg_core_1.varchar)('name', { length: 255 }).notNull(),
    slug: (0, pg_core_1.varchar)('slug', { length: 100 }),
    description: (0, pg_core_1.text)('description'),
    type: (0, pg_core_1.varchar)('type', { length: 50 }).default('banking'),
    bankingMode: (0, pg_core_1.varchar)('banking_mode', { length: 20 }).default('conventional'),
    settings: (0, pg_core_1.jsonb)('settings').default({}),
    isActive: (0, pg_core_1.boolean)('is_active').notNull().default(true),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').notNull().defaultNow(),
}, function (table) { return [
    (0, pg_core_1.uniqueIndex)('tenants_code_idx').on(table.code),
    (0, pg_core_1.index)('tenants_slug_idx').on(table.slug),
    (0, pg_core_1.index)('tenants_active_idx').on(table.isActive),
]; });
exports.tenantsRelations = (0, drizzle_orm_1.relations)(exports.tenants, function (_a) {
    var many = _a.many;
    return ({
    // Relational query support
    });
});
// =============================================================================
// USER TABLE VIEWS
// =============================================================================
/**
 * Persisted enterprise table views per user and page scope.
 * Stores column visibility, filters, sort, density, page size, and default view state.
 */
exports.userTableViews = exports.coreSchema.table('user_table_views', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    tenantId: (0, pg_core_1.varchar)('tenant_id', { length: 100 }).notNull(),
    userId: (0, pg_core_1.uuid)('user_id').notNull(),
    scope: (0, pg_core_1.varchar)('scope', { length: 160 }).notNull(),
    viewKey: (0, pg_core_1.varchar)('view_key', { length: 160 }).notNull(),
    name: (0, pg_core_1.varchar)('name', { length: 160 }),
    isDefault: (0, pg_core_1.boolean)('is_default').notNull().default(false),
    state: (0, pg_core_1.jsonb)('state').notNull().default({}),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at', { withTimezone: true }).defaultNow(),
}, function (table) { return [
    (0, pg_core_1.uniqueIndex)('user_table_views_tenant_user_scope_key_idx').on(table.tenantId, table.userId, table.scope, table.viewKey),
    (0, pg_core_1.index)('user_table_views_tenant_user_scope_idx').on(table.tenantId, table.userId, table.scope),
    (0, pg_core_1.index)('user_table_views_default_idx').on(table.tenantId, table.userId, table.scope, table.isDefault),
]; });
