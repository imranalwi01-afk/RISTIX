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
exports.jobExecutions = exports.jobDefinitions = exports.individualImpairmentScenarios = exports.tenantsRelations = exports.tenants = exports.platformSettings = exports.platformUsers = exports.platformSchema = exports.notificationPreferencesRelations = exports.notificationDeliveriesRelations = exports.notificationsRelations = exports.approvalActionsRelations = exports.approvalRequestsRelations = exports.approvalLevelsRelations = exports.approvalMatricesRelations = exports.notificationPreferences = exports.notificationDeliveries = exports.notifications = exports.approvalActions = exports.approvalRequests = exports.approvalLevels = exports.approvalMatrices = exports.approvalSchema = exports.emailVerificationTokensRelations = exports.passwordResetTokensRelations = exports.sessionsRelations = exports.emailVerificationTokens = exports.passwordResetTokens = exports.sessions = exports.authSchema = exports.auditSchema = exports.userActivityLogsRelations = exports.auditLogsRelations = exports.calculationAuditLogs = exports.dataAccessLogs = exports.userActivityLogs = exports.auditLogs = exports.permissionApprovalPoliciesRelations = exports.rolePermissionsRelations = exports.permissionsRelations = exports.userRolesRelations = exports.rolesRelations = exports.permissionApprovalPolicies = exports.rolePermissions = exports.permissions = exports.userRoles = exports.roles = void 0;
// Core entities
__exportStar(require("./core"), exports);
__exportStar(require("./consultants.schema"), exports);
// RBAC (Role-Based Access Control) - excluding coreSchema which is already exported from core
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
// Audit logging
var audit_schema_1 = require("./audit.schema");
Object.defineProperty(exports, "auditLogs", { enumerable: true, get: function () { return audit_schema_1.auditLogs; } });
Object.defineProperty(exports, "userActivityLogs", { enumerable: true, get: function () { return audit_schema_1.userActivityLogs; } });
Object.defineProperty(exports, "dataAccessLogs", { enumerable: true, get: function () { return audit_schema_1.dataAccessLogs; } });
Object.defineProperty(exports, "calculationAuditLogs", { enumerable: true, get: function () { return audit_schema_1.calculationAuditLogs; } });
Object.defineProperty(exports, "auditLogsRelations", { enumerable: true, get: function () { return audit_schema_1.auditLogsRelations; } });
Object.defineProperty(exports, "userActivityLogsRelations", { enumerable: true, get: function () { return audit_schema_1.userActivityLogsRelations; } });
Object.defineProperty(exports, "auditSchema", { enumerable: true, get: function () { return audit_schema_1.auditSchema; } });
// Auth (sessions, tokens)
var auth_schema_1 = require("./auth.schema");
Object.defineProperty(exports, "authSchema", { enumerable: true, get: function () { return auth_schema_1.authSchema; } });
Object.defineProperty(exports, "sessions", { enumerable: true, get: function () { return auth_schema_1.sessions; } });
Object.defineProperty(exports, "passwordResetTokens", { enumerable: true, get: function () { return auth_schema_1.passwordResetTokens; } });
Object.defineProperty(exports, "emailVerificationTokens", { enumerable: true, get: function () { return auth_schema_1.emailVerificationTokens; } });
Object.defineProperty(exports, "sessionsRelations", { enumerable: true, get: function () { return auth_schema_1.sessionsRelations; } });
Object.defineProperty(exports, "passwordResetTokensRelations", { enumerable: true, get: function () { return auth_schema_1.passwordResetTokensRelations; } });
Object.defineProperty(exports, "emailVerificationTokensRelations", { enumerable: true, get: function () { return auth_schema_1.emailVerificationTokensRelations; } });
// Approval (multi-level workflow)
var approval_schema_1 = require("./approval.schema");
Object.defineProperty(exports, "approvalSchema", { enumerable: true, get: function () { return approval_schema_1.approvalSchema; } });
Object.defineProperty(exports, "approvalMatrices", { enumerable: true, get: function () { return approval_schema_1.approvalMatrices; } });
Object.defineProperty(exports, "approvalLevels", { enumerable: true, get: function () { return approval_schema_1.approvalLevels; } });
Object.defineProperty(exports, "approvalRequests", { enumerable: true, get: function () { return approval_schema_1.approvalRequests; } });
Object.defineProperty(exports, "approvalActions", { enumerable: true, get: function () { return approval_schema_1.approvalActions; } });
Object.defineProperty(exports, "notifications", { enumerable: true, get: function () { return approval_schema_1.notifications; } });
Object.defineProperty(exports, "notificationDeliveries", { enumerable: true, get: function () { return approval_schema_1.notificationDeliveries; } });
Object.defineProperty(exports, "notificationPreferences", { enumerable: true, get: function () { return approval_schema_1.notificationPreferences; } });
Object.defineProperty(exports, "approvalMatricesRelations", { enumerable: true, get: function () { return approval_schema_1.approvalMatricesRelations; } });
Object.defineProperty(exports, "approvalLevelsRelations", { enumerable: true, get: function () { return approval_schema_1.approvalLevelsRelations; } });
Object.defineProperty(exports, "approvalRequestsRelations", { enumerable: true, get: function () { return approval_schema_1.approvalRequestsRelations; } });
Object.defineProperty(exports, "approvalActionsRelations", { enumerable: true, get: function () { return approval_schema_1.approvalActionsRelations; } });
Object.defineProperty(exports, "notificationsRelations", { enumerable: true, get: function () { return approval_schema_1.notificationsRelations; } });
Object.defineProperty(exports, "notificationDeliveriesRelations", { enumerable: true, get: function () { return approval_schema_1.notificationDeliveriesRelations; } });
Object.defineProperty(exports, "notificationPreferencesRelations", { enumerable: true, get: function () { return approval_schema_1.notificationPreferencesRelations; } });
// IFRS9 (Banking-specific tables) - Replaced by legacy schema
__exportStar(require("./legacy"), exports);
// Platform Admin Schema
var platform_schema_1 = require("./platform.schema");
Object.defineProperty(exports, "platformSchema", { enumerable: true, get: function () { return platform_schema_1.platformSchema; } });
Object.defineProperty(exports, "platformUsers", { enumerable: true, get: function () { return platform_schema_1.platformUsers; } });
Object.defineProperty(exports, "platformSettings", { enumerable: true, get: function () { return platform_schema_1.platformSettings; } });
Object.defineProperty(exports, "tenants", { enumerable: true, get: function () { return platform_schema_1.tenants; } });
Object.defineProperty(exports, "tenantsRelations", { enumerable: true, get: function () { return platform_schema_1.tenantsRelations; } });
// Individual Impairment
var individual_impairment_schema_1 = require("./individual-impairment.schema");
Object.defineProperty(exports, "individualImpairmentScenarios", { enumerable: true, get: function () { return individual_impairment_schema_1.individualImpairmentScenarios; } });
// Jobs / Queue
var jobs_schema_1 = require("./jobs.schema");
Object.defineProperty(exports, "jobDefinitions", { enumerable: true, get: function () { return jobs_schema_1.jobDefinitions; } });
Object.defineProperty(exports, "jobExecutions", { enumerable: true, get: function () { return jobs_schema_1.jobExecutions; } });
