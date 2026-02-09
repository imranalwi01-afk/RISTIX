import {
    pgSchema,
    uuid,
    varchar,
    text,
    boolean,
    integer,
    timestamp,
    jsonb,
    uniqueIndex,
    index,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { users } from './core'
import { tenants } from './platform.schema' // ✅ Import tenants from platform schema

/**
 * Core schema for RBAC tables
 */
export const coreSchema = pgSchema('core')

// =============================================================================
// ROLES TABLE
// =============================================================================

/**
 * Roles table definition.
 * Defines available roles within the system, including system and custom roles.
 */
export const roles = coreSchema.table(
    'roles',
    {
        id: uuid('id').primaryKey().defaultRandom(),
        legacyId: integer('legacy_id'),
        roleCode: varchar('role_code', { length: 50 }).notNull().unique(),
        roleName: varchar('role_name', { length: 100 }).notNull(),
        description: text('description'),
        permissions: jsonb('permissions').default('{}'),
        isActive: boolean('is_active').default(true),

        // Banking-specific fields
        bankingTypeSpecific: varchar('banking_type_specific', { length: 20 }),
        complianceLevel: varchar('compliance_level', { length: 50 }),
        hierarchyLevel: integer('hierarchy_level').notNull().default(1),

        // System roles (cannot be deleted/modified)
        isSystemRole: boolean('is_system_role').default(false),

        // Tenant isolation
        tenantId: uuid('tenant_id'),

        // Timestamps
        createdAt: timestamp('created_at', { withTimezone: false }).defaultNow(),
        updatedAt: timestamp('updated_at', { withTimezone: false }).defaultNow(),
        createdBy: uuid('created_by'),
        updatedBy: uuid('updated_by'),

        // Legacy tenant-specific fields (keeping for compatibility)
        level: integer('level'),
        supportsConventional: varchar('supports_conventional', { length: 100 }),
        supportsSyariah: varchar('supports_syariah', { length: 100 }),
    },
    (table) => [
        uniqueIndex('roles_role_name_idx').on(table.roleName),
        index('roles_tenant_idx').on(table.tenantId),
        index('roles_active_idx').on(table.isActive),
        index('roles_system_role_idx').on(table.isSystemRole),
    ]
)

// =============================================================================
// USER ROLES JUNCTION TABLE
// =============================================================================

/**
 * User roles junction table definition.
 * Maps users to roles, supporting temporary and permanent assignments.
 */
export const userRoles = coreSchema.table(
    'user_roles',
    {
        id: uuid('id').primaryKey().defaultRandom(),
        userId: uuid('user_id').notNull(),
        roleId: uuid('role_id').notNull(),

        // Assignment metadata
        assignedBy: uuid('assigned_by'),
        assignedAt: timestamp('assigned_at', { withTimezone: false }).defaultNow(),

        // Status and validity
        isActive: boolean('is_active').default(true),
        validFrom: timestamp('valid_from', { withTimezone: false }),
        validUntil: timestamp('valid_until', { withTimezone: false }),

        // Banking-specific restrictions
        bankingTypeRestriction: varchar('banking_type_restriction', { length: 20 }),

        // Temporary assignments
        isTemporary: boolean('is_temporary').default(false),
        temporaryReason: text('temporary_reason'),

        // Tenant isolation
        tenantId: uuid('tenant_id').notNull(),

        // Timestamps
        createdAt: timestamp('created_at', { withTimezone: false }).defaultNow(),
        updatedAt: timestamp('updated_at', { withTimezone: false }).defaultNow(),

        // Legacy field
        level: integer('level'),
    },
    (table) => [
        uniqueIndex('user_role_unique_idx').on(table.userId, table.roleId),
        index('user_roles_user_idx').on(table.userId),
        index('user_roles_role_idx').on(table.roleId),
        index('user_roles_tenant_idx').on(table.tenantId),
        index('user_roles_active_idx').on(table.isActive),
        index('user_roles_valid_from_idx').on(table.validFrom),
        index('user_roles_valid_until_idx').on(table.validUntil),
    ]
)

// =============================================================================
// PERMISSIONS TABLE (for granular permission management)
// =============================================================================

/**
 * Permissions table definition.
 * Defines atomic actions and resources for granular access control.
 */
export const permissions = coreSchema.table(
    'permissions',
    {
        id: uuid('id').primaryKey().defaultRandom(),
        code: varchar('code', { length: 100 }).notNull(),
        name: varchar('name', { length: 255 }).notNull(),
        description: text('description'),
        resource: varchar('resource', { length: 100 }).notNull(),
        action: varchar('action', { length: 50 }).notNull(),
        module: varchar('module', { length: 50 }).notNull().default('core'),
        category: varchar('category', { length: 100 }),
        isActive: boolean('is_active').notNull().default(true),
        createdAt: timestamp('created_at').notNull().defaultNow(),
    },
    (table) => [
        uniqueIndex('permissions_code_idx').on(table.code),
        index('permissions_resource_action_idx').on(table.resource, table.action),
        index('permissions_category_idx').on(table.category),
    ]
)

// =============================================================================
// ROLE PERMISSIONS JUNCTION TABLE
// =============================================================================

/**
 * Role permissions junction table definition.
 * Maps roles to permissions, defining what actions a role can perform.
 */
export const rolePermissions = coreSchema.table(
    'role_permissions',
    {
        id: uuid('id').primaryKey().defaultRandom(),
        roleId: uuid('role_id')
            .notNull()
            .references(() => roles.id, { onDelete: 'cascade' }),
        permissionId: uuid('permission_id')
            .notNull()
            .references(() => permissions.id, { onDelete: 'cascade' }),
        grantedBy: uuid('granted_by'),
        grantedAt: timestamp('granted_at').notNull().defaultNow(),
    },
    (table) => [
        uniqueIndex('role_perm_unique_idx').on(table.roleId, table.permissionId),
        index('role_permissions_role_idx').on(table.roleId),
        index('role_permissions_perm_idx').on(table.permissionId),
    ]
)

// =============================================================================
// PERMISSION APPROVAL POLICIES TABLE
// =============================================================================

/**
 * Permission approval policies table definition.
 * Links permissions to approval requirements based on role hierarchy levels.
 */
export const permissionApprovalPolicies = coreSchema.table(
    'permission_approval_policies',
    {
        id: uuid('id').primaryKey().defaultRandom(),
        tenantId: uuid('tenant_id').notNull(),
        permissionId: uuid('permission_id').notNull(),

        // Approval requirement metadata
        requiresApproval: boolean('requires_approval').notNull().default(false),
        minHierarchyLevel: integer('min_hierarchy_level'),
        requiredApprovers: integer('required_approvers').notNull().default(1),

        // Reference to complex approval flow (optional)
        matrixId: uuid('matrix_id'),

        // Metadata
        description: text('description'),
        isActive: boolean('is_active').notNull().default(true),
        createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
        updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    },
    (table) => ({
        uniqueTenantPermission: uniqueIndex('unique_tenant_permission').on(
            table.tenantId,
            table.permissionId
        ),
        tenantIdx: index('permission_policy_tenant_idx').on(table.tenantId),
        permissionIdx: index('permission_policy_permission_idx').on(table.permissionId),
        matrixIdx: index('permission_policy_matrix_idx').on(table.matrixId),
        hierarchyIdx: index('permission_policy_hierarchy_idx').on(table.minHierarchyLevel),
    })
)

// =============================================================================
// RELATIONS
// =============================================================================

export const rolesRelations = relations(roles, ({ one, many }) => ({
    tenant: one(tenants, {
        fields: [roles.tenantId],
        references: [tenants.id],
    }),
    userRoles: many(userRoles),
    rolePermissions: many(rolePermissions),
}))

export const userRolesRelations = relations(userRoles, ({ one }) => ({
    user: one(users, {
        fields: [userRoles.userId],
        references: [users.id],
    }),
    role: one(roles, {
        fields: [userRoles.roleId],
        references: [roles.id],
    }),
    tenant: one(tenants, {
        fields: [userRoles.tenantId],
        references: [tenants.id],
    }),
}))

export const permissionsRelations = relations(permissions, ({ many }) => ({
    rolePermissions: many(rolePermissions),
    approvalPolicies: many(permissionApprovalPolicies),
}))

export const rolePermissionsRelations = relations(rolePermissions, ({ one }) => ({
    role: one(roles, {
        fields: [rolePermissions.roleId],
        references: [roles.id],
    }),
    permission: one(permissions, {
        fields: [rolePermissions.permissionId],
        references: [permissions.id],
    }),
}))
export const permissionApprovalPoliciesRelations = relations(
    permissionApprovalPolicies,
    ({ one }) => ({
        tenant: one(tenants, {
            fields: [permissionApprovalPolicies.tenantId],
            references: [tenants.id],
        }),
        permission: one(permissions, {
            fields: [permissionApprovalPolicies.permissionId],
            references: [permissions.id],
        }),
    })
)


// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type Role = typeof roles.$inferSelect
export type NewRole = typeof roles.$inferInsert

export type UserRole = typeof userRoles.$inferSelect
export type NewUserRole = typeof userRoles.$inferInsert

export type Permission = typeof permissions.$inferSelect
export type NewPermission = typeof permissions.$inferInsert

export type RolePermission = typeof rolePermissions.$inferSelect
export type NewRolePermission = typeof rolePermissions.$inferInsert

export type PermissionApprovalPolicy = typeof permissionApprovalPolicies.$inferSelect
export type NewPermissionApprovalPolicy = typeof permissionApprovalPolicies.$inferInsert
