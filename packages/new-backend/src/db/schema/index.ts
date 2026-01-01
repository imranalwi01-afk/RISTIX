// Core entities
export * from './core'
export * from './menu.schema'

// RBAC (Role-Based Access Control) - excluding coreSchema which is already exported from core
export {
    roles,
    userRoles,
    permissions,
    rolePermissions,
    rolesRelations,
    userRolesRelations,
    permissionsRelations,
    rolePermissionsRelations,
    type Role,
    type NewRole,
    type UserRole,
    type NewUserRole,
    type Permission,
    type NewPermission,
    type RolePermission,
    type NewRolePermission,
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
    approvalMatricesRelations,
    approvalLevelsRelations,
    approvalRequestsRelations,
    approvalActionsRelations,
    type ApprovalMatrix,
    type NewApprovalMatrix,
    type ApprovalLevel,
    type NewApprovalLevel,
    type ApprovalRequest,
    type NewApprovalRequest,
    type ApprovalAction,
    type NewApprovalAction,
} from './approval.schema'

// IFRS9 (Banking-specific tables)
export {
    ifrs9Schema,
    productSegments,
    productSegmentsRelations,
    ruleBaseSettingHeaders,
    ruleBaseSettingDetails,
    ruleBaseSettingHeadersRelations,
    ruleBaseSettingDetailsRelations,
    bucketParameters,
    bucketParametersRelations,
    bucketParameterDetails,
    bucketParameterDetailsRelations,
    pdConfigurations,
    pdConfigurationsRelations,
    populationSegments,
    lgdConfigurations,
    eadConfigurations,
} from './ifrs9.schema'

export * from './legacy'

export {
    frs9ParamProduct,
    frs9ParamJournal,
    frs9ParamSegmenth,
    frs9ParamSegmentd,
    frs9ParamScenarioRulesh,
    frs9ParamScenarioRulesd,
    frs9ParamBucketh,
    frs9ParamBucketd,
    frs9ImpCaPdConfig,
    frs9ImpCaFlScalarh,
    frs9ImpCaFlScalard,
    frs9ImpCaLgdConfig,
    frs9ImpCaEadConfig,
    frs9ImpCaEclConfigh,
    frs9ImpCaEclConfigd,
} from './introspected/schema'
