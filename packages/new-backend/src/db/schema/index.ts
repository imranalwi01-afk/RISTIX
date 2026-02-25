// Core entities
export * from './core'

export * from './consultants.schema'

// RBAC (Role-Based Access Control) - excluding coreSchema which is already exported from core
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

// Audit logging
export {
    auditLogs,
    userActivityLogs,
    dataAccessLogs,
    calculationAuditLogs,
    auditLogsRelations,
    userActivityLogsRelations,
    auditSchema,
    type AuditLog,
    type NewAuditLog,
    type UserActivityLog,
    type NewUserActivityLog,
    type DataAccessLog,
    type NewDataAccessLog,
    type CalculationAuditLog,
    type NewCalculationAuditLog,
} from './audit.schema'

// Auth (sessions, tokens)
export {
    authSchema,
    sessions,
    passwordResetTokens,
    emailVerificationTokens,
    sessionsRelations,
    passwordResetTokensRelations,
    emailVerificationTokensRelations,
    type Session,
    type NewSession,
    type PasswordResetToken,
    type NewPasswordResetToken,
    type EmailVerificationToken,
    type NewEmailVerificationToken,
} from './auth.schema'

// Approval (multi-level workflow)
export {
    approvalSchema,
    approvalMatrices,
    approvalLevels,
    approvalRequests,
    approvalActions,
    notifications,
    notificationDeliveries,
    notificationPreferences,
    approvalMatricesRelations,
    approvalLevelsRelations,
    approvalRequestsRelations,
    approvalActionsRelations,
    notificationsRelations,
    notificationDeliveriesRelations,
    notificationPreferencesRelations,
    type ApprovalMatrix,
    type NewApprovalMatrix,
    type ApprovalLevel,
    type NewApprovalLevel,
    type ApprovalRequest,
    type NewApprovalRequest,
    type ApprovalAction,
    type NewApprovalAction,
    type Notification,
    type NewNotification,
    type NotificationDelivery,
    type NewNotificationDelivery,
    type NotificationPreference,
    type NewNotificationPreference,
} from './approval.schema'

// IFRS9 (Banking-specific tables) - Replaced by legacy schema
export * from './legacy'



// Platform Admin Schema
export {
    platformSchema,
    platformUsers,
    tenants,
    tenantsRelations, // ✅ Export tenantsRelations
    type PlatformUser,
    type NewPlatformUser,
    type Tenant,
    type NewTenant,
} from './platform.schema'

// Jobs / Queue
export {
    jobDefinitions,
    jobExecutions,
} from './jobs.schema'
