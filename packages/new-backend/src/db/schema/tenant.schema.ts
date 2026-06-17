// Core tenant-facing schemas (exclude core.tenants and all legacy tables)
export { coreSchema, users, type User, type NewUser } from './core'
export * from './consultants.schema'

// Exclude coreSchema from RBAC exports to avoid duplicate symbol conflicts.
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
    tenantMenuPermissionsRelations,
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
    tenantMenuPermissions,
    type TenantMenuPermission,
    type NewTenantMenuPermission,
} from './rbac.schema'

export * from './audit.schema'
export * from './auth.schema'
export * from './approval.schema'
export * from './jobs.schema'
export * from './workflows.schema'
