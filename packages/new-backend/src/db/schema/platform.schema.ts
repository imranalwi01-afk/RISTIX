export * from './core'

export * from './consultants.schema'

import {
    pgSchema,
    uuid,
    varchar,
    timestamp,
    boolean,
    integer,
    index,
    text,
    jsonb,
    uniqueIndex,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

/**
 * Platform schema namespace
 * Maps to the 'platform_admin' schema in the database (not 'core').
 */
export const platformSchema = pgSchema('platform_admin')

// =============================================================================
// PLATFORM USERS TABLE
// =============================================================================

/**
 * Platform Users table definition.
 * Stores platform administrators and system operators.
 * Distinct from tenant users; no tenant_id column required.
 */
export const platformUsers = platformSchema.table(
    'users',
    {
        id: uuid('id').primaryKey().defaultRandom(),

        // Basic info
        username: varchar('username', { length: 100 }).notNull(),
        email: varchar('email', { length: 255 }).notNull(),
        passwordHash: varchar('password_hash', { length: 255 }).notNull(),
        fullName: varchar('full_name', { length: 200 }).notNull(),

        employeeId: varchar('employee_id', { length: 50 }),
        role: varchar('role', { length: 100 }).notNull(),

        // Security
        isActive: boolean('is_active').default(true),

        // Activity tracking
        lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
        failedLoginAttempts: integer('failed_login_attempts').default(0),

        // Timestamps
        createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
        updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),

        // New fields from DDL
        userRole: varchar('user_role', { length: 100 }),
        tenantId: uuid('tenant_id'), // Nullable
        tenantName: varchar('tenant_name', { length: 255 }),
    },
    (table) => [
        index('idx_users_role').on(table.role),
        index('idx_users_last_login').on(table.lastLoginAt),
        index('idx_users_is_active').on(table.isActive),
    ]
)

export type PlatformUser = typeof platformUsers.$inferSelect
export type NewPlatformUser = typeof platformUsers.$inferInsert

// =============================================================================
// TYPE EXPORTS
// =============================================================================

// Re-export specific RBAC items as in index.ts to avoid "coreSchema" conflict
export {
    roles,
    userRoles,
    permissions,
    rolePermissions,
    permissionApprovalPolicies,
    rolesRelations,
    userRolesRelations,
    permissionsRelations,
    rolePermissionsRelations,
    permissionApprovalPoliciesRelations,
    type Role,
    type NewRole,
    type UserRole,
    type NewUserRole,
    type Permission,
    type NewPermission,
    type RolePermission,
    type NewRolePermission,
    type PermissionApprovalPolicy,
    type NewPermissionApprovalPolicy,
} from './rbac.schema'

export * from './audit.schema'
export * from './auth.schema'
export * from './approval.schema'
export * from './jobs.schema'
export * from './workflows.schema'
