export * from './core'
export * from './menu.schema'
export * from './consultants.schema'

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
