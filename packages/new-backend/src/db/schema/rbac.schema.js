"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.permissionApprovalPoliciesRelations = exports.rolePermissionsRelations = exports.permissionsRelations = exports.userRolesRelations = exports.rolesRelations = exports.permissionApprovalPolicies = exports.rolePermissions = exports.permissions = exports.userRoles = exports.roles = exports.approvalPolicySchema = exports.coreSchema = void 0;
var pg_core_1 = require("drizzle-orm/pg-core");
var drizzle_orm_1 = require("drizzle-orm");
var core_1 = require("./core");
/**
 * Core schema for RBAC tables
 */
exports.coreSchema = (0, pg_core_1.pgSchema)('core');
exports.approvalPolicySchema = (0, pg_core_1.pgSchema)('approval');
// =============================================================================
// ROLES TABLE
// =============================================================================
/**
 * Roles table definition.
 * Defines available roles within the system, including system and custom roles.
 */
exports.roles = exports.coreSchema.table('roles', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    roleCode: (0, pg_core_1.varchar)('role_code', { length: 50 }).notNull().unique(),
    roleName: (0, pg_core_1.varchar)('role_name', { length: 100 }).notNull(),
    description: (0, pg_core_1.text)('description'),
    isActive: (0, pg_core_1.boolean)('is_active').default(true),
    complianceLevel: (0, pg_core_1.varchar)('compliance_level', { length: 50 }),
    hierarchyLevel: (0, pg_core_1.integer)('hierarchy_level').notNull().default(1),
    // System roles (cannot be deleted/modified)
    isSystemRole: (0, pg_core_1.boolean)('is_system_role').default(false),
    // Tenant isolation
    tenantId: (0, pg_core_1.uuid)('tenant_id'),
    // Timestamps
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: false }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at', { withTimezone: false }).defaultNow(),
    createdBy: (0, pg_core_1.uuid)('created_by'),
    updatedBy: (0, pg_core_1.uuid)('updated_by'),
    // Legacy tenant-specific fields (keeping for compatibility)
    // level: integer('level'),
    // supportsConventional: varchar('supports_conventional', { length: 100 }),
    // supportsSyariah: varchar('supports_syariah', { length: 100 }),
}, function (table) { return [
    (0, pg_core_1.uniqueIndex)('roles_role_name_idx').on(table.roleName),
    (0, pg_core_1.index)('roles_tenant_idx').on(table.tenantId),
    (0, pg_core_1.index)('roles_active_idx').on(table.isActive),
    (0, pg_core_1.index)('roles_system_role_idx').on(table.isSystemRole),
]; });
// =============================================================================
// USER ROLES JUNCTION TABLE
// =============================================================================
/**
 * User roles junction table definition.
 * Maps users to roles, supporting temporary and permanent assignments.
 */
exports.userRoles = exports.coreSchema.table('user_roles', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    userId: (0, pg_core_1.uuid)('user_id').notNull(),
    roleId: (0, pg_core_1.uuid)('role_id').notNull(),
    // Assignment metadata
    assignedBy: (0, pg_core_1.uuid)('assigned_by'),
    assignedAt: (0, pg_core_1.timestamp)('assigned_at', { withTimezone: false }).defaultNow(),
    // Status and validity
    isActive: (0, pg_core_1.boolean)('is_active').default(true),
    validFrom: (0, pg_core_1.timestamp)('valid_from', { withTimezone: false }),
    validUntil: (0, pg_core_1.timestamp)('valid_until', { withTimezone: false }),
    // Banking-specific restrictions
    bankingTypeRestriction: (0, pg_core_1.varchar)('banking_type_restriction', { length: 20 }),
    // Temporary assignments
    isTemporary: (0, pg_core_1.boolean)('is_temporary').default(false),
    temporaryReason: (0, pg_core_1.text)('temporary_reason'),
    // Tenant isolation
    tenantId: (0, pg_core_1.uuid)('tenant_id').notNull(),
    // Timestamps
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: false }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at', { withTimezone: false }).defaultNow(),
    // Legacy field
    // level: integer('level'),
}, function (table) { return [
    (0, pg_core_1.uniqueIndex)('user_role_unique_idx').on(table.userId, table.roleId),
    (0, pg_core_1.index)('user_roles_user_idx').on(table.userId),
    (0, pg_core_1.index)('user_roles_role_idx').on(table.roleId),
    (0, pg_core_1.index)('user_roles_tenant_idx').on(table.tenantId),
    (0, pg_core_1.index)('user_roles_active_idx').on(table.isActive),
    (0, pg_core_1.index)('user_roles_valid_from_idx').on(table.validFrom),
    (0, pg_core_1.index)('user_roles_valid_until_idx').on(table.validUntil),
]; });
// =============================================================================
// PERMISSIONS TABLE (for granular permission management)
// =============================================================================
/**
 * Permissions table definition.
 * Defines atomic actions and resources for granular access control.
 */
exports.permissions = exports.coreSchema.table('permissions', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    code: (0, pg_core_1.varchar)('code', { length: 100 }).notNull(),
    name: (0, pg_core_1.varchar)('name', { length: 255 }).notNull(),
    description: (0, pg_core_1.text)('description'),
    resource: (0, pg_core_1.varchar)('resource', { length: 100 }).notNull(),
    action: (0, pg_core_1.varchar)('action', { length: 50 }).notNull(),
    module: (0, pg_core_1.varchar)('module', { length: 50 }).notNull().default('core'),
    category: (0, pg_core_1.varchar)('category', { length: 100 }),
    isActive: (0, pg_core_1.boolean)('is_active').notNull().default(true),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
}, function (table) { return [
    (0, pg_core_1.uniqueIndex)('permissions_code_idx').on(table.code),
    (0, pg_core_1.index)('permissions_resource_action_idx').on(table.resource, table.action),
    (0, pg_core_1.index)('permissions_category_idx').on(table.category),
]; });
// =============================================================================
// ROLE PERMISSIONS JUNCTION TABLE
// =============================================================================
/**
 * Role permissions junction table definition.
 * Maps roles to permissions, defining what actions a role can perform.
 */
exports.rolePermissions = exports.coreSchema.table('role_permissions', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    roleId: (0, pg_core_1.uuid)('role_id')
        .notNull()
        .references(function () { return exports.roles.id; }, { onDelete: 'cascade' }),
    permissionId: (0, pg_core_1.uuid)('permission_id')
        .notNull()
        .references(function () { return exports.permissions.id; }, { onDelete: 'cascade' }),
    grantedBy: (0, pg_core_1.uuid)('granted_by'),
    grantedAt: (0, pg_core_1.timestamp)('granted_at').notNull().defaultNow(),
}, function (table) { return [
    (0, pg_core_1.uniqueIndex)('role_perm_unique_idx').on(table.roleId, table.permissionId),
    (0, pg_core_1.index)('role_permissions_role_idx').on(table.roleId),
    (0, pg_core_1.index)('role_permissions_perm_idx').on(table.permissionId),
]; });
// =============================================================================
// PERMISSION APPROVAL POLICIES TABLE
// =============================================================================
/**
 * Permission approval policies table definition.
 * Links permissions to approval requirements based on role hierarchy levels.
 */
exports.permissionApprovalPolicies = exports.approvalPolicySchema.table('permission_approval_policies', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    tenantId: (0, pg_core_1.uuid)('tenant_id').notNull(),
    permissionId: (0, pg_core_1.uuid)('permission_id').notNull(),
    // Approval requirement metadata
    requiresApproval: (0, pg_core_1.boolean)('requires_approval').notNull().default(false),
    minHierarchyLevel: (0, pg_core_1.integer)('min_hierarchy_level'),
    requiredApprovers: (0, pg_core_1.integer)('required_approvers').notNull().default(1),
    // Reference to complex approval flow (optional)
    matrixId: (0, pg_core_1.uuid)('matrix_id'),
    // Metadata
    description: (0, pg_core_1.text)('description'),
    isActive: (0, pg_core_1.boolean)('is_active').notNull().default(true),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, function (table) { return ({
    uniqueTenantPermission: (0, pg_core_1.uniqueIndex)('unique_tenant_permission').on(table.tenantId, table.permissionId),
    tenantIdx: (0, pg_core_1.index)('permission_policy_tenant_idx').on(table.tenantId),
    permissionIdx: (0, pg_core_1.index)('permission_policy_permission_idx').on(table.permissionId),
    matrixIdx: (0, pg_core_1.index)('permission_policy_matrix_idx').on(table.matrixId),
    hierarchyIdx: (0, pg_core_1.index)('permission_policy_hierarchy_idx').on(table.minHierarchyLevel),
}); });
// =============================================================================
// RELATIONS
// =============================================================================
exports.rolesRelations = (0, drizzle_orm_1.relations)(exports.roles, function (_a) {
    var one = _a.one, many = _a.many;
    return ({
        tenant: one(core_1.tenants, {
            fields: [exports.roles.tenantId],
            references: [core_1.tenants.id],
        }),
        userRoles: many(exports.userRoles),
        rolePermissions: many(exports.rolePermissions),
    });
});
exports.userRolesRelations = (0, drizzle_orm_1.relations)(exports.userRoles, function (_a) {
    var one = _a.one;
    return ({
        user: one(core_1.users, {
            fields: [exports.userRoles.userId],
            references: [core_1.users.id],
        }),
        role: one(exports.roles, {
            fields: [exports.userRoles.roleId],
            references: [exports.roles.id],
        }),
        tenant: one(core_1.tenants, {
            fields: [exports.userRoles.tenantId],
            references: [core_1.tenants.id],
        }),
    });
});
exports.permissionsRelations = (0, drizzle_orm_1.relations)(exports.permissions, function (_a) {
    var many = _a.many;
    return ({
        rolePermissions: many(exports.rolePermissions),
        approvalPolicies: many(exports.permissionApprovalPolicies),
    });
});
exports.rolePermissionsRelations = (0, drizzle_orm_1.relations)(exports.rolePermissions, function (_a) {
    var one = _a.one;
    return ({
        role: one(exports.roles, {
            fields: [exports.rolePermissions.roleId],
            references: [exports.roles.id],
        }),
        permission: one(exports.permissions, {
            fields: [exports.rolePermissions.permissionId],
            references: [exports.permissions.id],
        }),
    });
});
exports.permissionApprovalPoliciesRelations = (0, drizzle_orm_1.relations)(exports.permissionApprovalPolicies, function (_a) {
    var one = _a.one;
    return ({
        tenant: one(core_1.tenants, {
            fields: [exports.permissionApprovalPolicies.tenantId],
            references: [core_1.tenants.id],
        }),
        permission: one(exports.permissions, {
            fields: [exports.permissionApprovalPolicies.permissionId],
            references: [exports.permissions.id],
        }),
    });
});
