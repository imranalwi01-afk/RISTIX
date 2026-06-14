"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.permissionApprovalPoliciesRelations = exports.rolePermissionsRelations = exports.permissionsRelations = exports.userRolesRelations = exports.rolesRelations = exports.permissionApprovalPolicies = exports.rolePermissions = exports.permissions = exports.userRoles = exports.roles = exports.platformUsers = exports.platformSettings = exports.platformTenantsRelations = exports.platformTenants = exports.platformSchema = void 0;
__exportStar(require("./core"), exports);
__exportStar(require("./consultants.schema"), exports);
var pg_core_1 = require("drizzle-orm/pg-core");
var drizzle_orm_1 = require("drizzle-orm");
/**
 * Platform schema namespace
 * Maps to the 'platform_admin' schema in the database (not 'core').
 */
exports.platformSchema = (0, pg_core_1.pgSchema)('platform_admin');
// =============================================================================
// PLATFORM TENANTS TABLE
// =============================================================================
/**
 * Platform Tenants table definition.
 * Maps tenant registry records in platform_admin.tenants.
 */
exports.platformTenants = exports.platformSchema.table('tenants', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    code: (0, pg_core_1.varchar)('code', { length: 50 }).notNull(),
    name: (0, pg_core_1.varchar)('name', { length: 255 }).notNull(),
    slug: (0, pg_core_1.varchar)('slug', { length: 100 }),
    description: (0, pg_core_1.text)('description'),
    type: (0, pg_core_1.varchar)('type', { length: 50 }).default('banking'),
    bankingMode: (0, pg_core_1.varchar)('banking_mode', { length: 20 }).default('conventional'),
    settings: (0, pg_core_1.text)('settings').default('{}'),
    isActive: (0, pg_core_1.boolean)('is_active').notNull().default(true),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, function (table) { return [
    (0, pg_core_1.uniqueIndex)('platform_tenants_code_idx').on(table.code),
    (0, pg_core_1.index)('platform_tenants_slug_idx').on(table.slug),
    (0, pg_core_1.index)('platform_tenants_active_idx').on(table.isActive),
]; });
exports.platformTenantsRelations = (0, drizzle_orm_1.relations)(exports.platformTenants, function (_a) {
    var many = _a.many;
    return ({
    // Relational query support
    });
});
// =============================================================================
// PLATFORM SETTINGS TABLE
// =============================================================================
/**
 * Platform Settings table definition.
 * Global Key-Value store for platform-wide configurations (e.g., branding, maintenance mode).
 */
exports.platformSettings = exports.platformSchema.table('settings', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    key: (0, pg_core_1.varchar)('key', { length: 100 }).notNull().unique(),
    value: (0, pg_core_1.jsonb)('value').notNull().default({}),
    description: (0, pg_core_1.text)('description'),
    updatedAt: (0, pg_core_1.timestamp)('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, function (table) { return [
    (0, pg_core_1.uniqueIndex)('platform_settings_key_idx').on(table.key),
]; });
// =============================================================================
// PLATFORM USERS TABLE
// =============================================================================
/**
 * Platform Users table definition.
 * Stores platform administrators and system operators.
 * Distinct from tenant users; no tenant_id column required.
 */
exports.platformUsers = exports.platformSchema.table('users', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    // Basic info
    username: (0, pg_core_1.varchar)('username', { length: 100 }).notNull(),
    email: (0, pg_core_1.varchar)('email', { length: 255 }).notNull(),
    passwordHash: (0, pg_core_1.varchar)('password_hash', { length: 255 }).notNull(),
    fullName: (0, pg_core_1.varchar)('full_name', { length: 200 }).notNull(),
    employeeId: (0, pg_core_1.varchar)('employee_id', { length: 50 }),
    role: (0, pg_core_1.varchar)('role', { length: 100 }).notNull(),
    // Security
    isActive: (0, pg_core_1.boolean)('is_active').default(true),
    // Activity tracking
    lastLoginAt: (0, pg_core_1.timestamp)('last_login_at', { withTimezone: true }),
    failedLoginAttempts: (0, pg_core_1.integer)('failed_login_attempts').default(0),
    // Timestamps
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at', { withTimezone: true }).defaultNow(),
    // New fields from DDL
    userRole: (0, pg_core_1.varchar)('user_role', { length: 100 }),
    tenantId: (0, pg_core_1.uuid)('tenant_id'), // Nullable
    tenantName: (0, pg_core_1.varchar)('tenant_name', { length: 255 }),
}, function (table) { return [
    (0, pg_core_1.index)('idx_users_role').on(table.role),
    (0, pg_core_1.index)('idx_users_last_login').on(table.lastLoginAt),
    (0, pg_core_1.index)('idx_users_is_active').on(table.isActive),
]; });
// =============================================================================
// TYPE EXPORTS
// =============================================================================
// Re-export specific RBAC items as in index.ts to avoid "coreSchema" conflict
var rbac_schema_1 = require("./rbac.schema");
Object.defineProperty(exports, "roles", { enumerable: true, get: function () { return rbac_schema_1.roles; } });
Object.defineProperty(exports, "userRoles", { enumerable: true, get: function () { return rbac_schema_1.userRoles; } });
Object.defineProperty(exports, "permissions", { enumerable: true, get: function () { return rbac_schema_1.permissions; } });
Object.defineProperty(exports, "rolePermissions", { enumerable: true, get: function () { return rbac_schema_1.rolePermissions; } });
Object.defineProperty(exports, "permissionApprovalPolicies", { enumerable: true, get: function () { return rbac_schema_1.permissionApprovalPolicies; } });
Object.defineProperty(exports, "rolesRelations", { enumerable: true, get: function () { return rbac_schema_1.rolesRelations; } });
Object.defineProperty(exports, "userRolesRelations", { enumerable: true, get: function () { return rbac_schema_1.userRolesRelations; } });
Object.defineProperty(exports, "permissionsRelations", { enumerable: true, get: function () { return rbac_schema_1.permissionsRelations; } });
Object.defineProperty(exports, "rolePermissionsRelations", { enumerable: true, get: function () { return rbac_schema_1.rolePermissionsRelations; } });
Object.defineProperty(exports, "permissionApprovalPoliciesRelations", { enumerable: true, get: function () { return rbac_schema_1.permissionApprovalPoliciesRelations; } });
__exportStar(require("./audit.schema"), exports);
__exportStar(require("./auth.schema"), exports);
__exportStar(require("./approval.schema"), exports);
__exportStar(require("./jobs.schema"), exports);
__exportStar(require("./workflows.schema"), exports);
