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
import { tenants, users } from './core'

/**
 * Core schema for RBAC tables
 */
export const coreSchema = pgSchema('core')

// =============================================================================
// ROLES TABLE
// =============================================================================

export const roles = coreSchema.table(
    'roles',
    {
        id: uuid('id').primaryKey().defaultRandom(),
        legacyId: integer('legacy_id'),
        roleCode: varchar('role_code', { length: 50 }).notNull().unique(),
        roleName: varchar('role_name', { length: 100 }).notNull(),
        description: text('description'),
        permissions: jsonb('permissions').notNull().default({}),
        isActive: boolean('is_active').notNull().default(true),

        // Banking-specific role configuration
        bankingTypeSpecific: varchar('banking_type_specific', { length: 20 }),
        complianceLevel: varchar('compliance_level', { length: 50 }),
        hierarchyLevel: integer('hierarchy_level').notNull().default(1),

        // System roles (cannot be deleted/modified)
        isSystemRole: boolean('is_system_role').notNull().default(false),

        // Tenant isolation
        tenantId: uuid('tenant_id').references(() => tenants.id),

        // Audit fields
        createdAt: timestamp('created_at').notNull().defaultNow(),
        updatedAt: timestamp('updated_at').notNull().defaultNow(),
        createdBy: uuid('created_by'),
        updatedBy: uuid('updated_by'),
    },
    (table) => [
        uniqueIndex('roles_role_name_idx').on(table.roleName),
        index('roles_tenant_idx').on(table.tenantId),
        index('roles_active_idx').on(table.isActive),
        index('roles_hierarchy_idx').on(table.hierarchyLevel),
        index('roles_system_role_idx').on(table.isSystemRole),
    ]
)

// =============================================================================
// USER ROLES JUNCTION TABLE
// =============================================================================

export const userRoles = coreSchema.table(
    'user_roles',
    {
        id: uuid('id').primaryKey().defaultRandom(),
        userId: uuid('user_id')
            .notNull()
            .references(() => users.id, { onDelete: 'cascade' }),
        roleId: uuid('role_id')
            .notNull()
            .references(() => roles.id, { onDelete: 'cascade' }),

        // Assignment metadata
        assignedBy: uuid('assigned_by'),
        assignedAt: timestamp('assigned_at').notNull().defaultNow(),

        // Status and validity
        isActive: boolean('is_active').notNull().default(true),
        validFrom: timestamp('valid_from'),
        validUntil: timestamp('valid_until'),

        // Banking context
        bankingTypeRestriction: varchar('banking_type_restriction', { length: 20 }),

        // Temporary assignments
        isTemporary: boolean('is_temporary').notNull().default(false),
        temporaryReason: text('temporary_reason'),

        // Tenant isolation
        tenantId: uuid('tenant_id')
            .notNull()
            .references(() => tenants.id),

        // Timestamps
        createdAt: timestamp('created_at').notNull().defaultNow(),
        updatedAt: timestamp('updated_at').notNull().defaultNow(),
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
