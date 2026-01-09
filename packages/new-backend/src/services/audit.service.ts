import { db } from '../config/database'
import { auditLogs, userActivityLogs, dataAccessLogs, calculationAuditLogs } from '../db/schema'
import type { NewAuditLog, NewUserActivityLog, NewDataAccessLog, NewCalculationAuditLog } from '../db/schema'

/**
 * Core audit logging function
 */
export const logAuditEvent = async (params: Partial<NewAuditLog>): Promise<void> => {
    try {
        await db.insert(auditLogs).values({
            eventType: params.eventType || 'unknown',
            action: params.action || 'unknown',
            ...params
        })
    } catch (error) {
        // Don't throw - audit logging should never break the main flow
        console.error('[Audit] Failed to log event:', error)
    }
}

/**
 * Log user activity
 */
export const logUserActivity = async (params: Partial<NewUserActivityLog>): Promise<void> => {
    try {
        await db.insert(userActivityLogs).values({
            userId: params.userId!,
            activityType: params.activityType!,
            ...params
        })
    } catch (error) {
        console.error('[Audit] Failed to log user activity:', error)
    }
}

/**
 * Log data access
 */
export const logDataAccess = async (params: Partial<NewDataAccessLog>): Promise<void> => {
    try {
        await db.insert(dataAccessLogs).values({
            userId: params.userId!,
            accessType: params.accessType!,
            resourceType: params.resourceType!,
            ...params
        })
    } catch (error) {
        console.error('[Audit] Failed to log data access:', error)
    }
}

/**
 * Log calculation execution
 */
export const logCalculation = async (params: Partial<NewCalculationAuditLog>): Promise<void> => {
    try {
        await db.insert(calculationAuditLogs).values({
            userId: params.userId!,
            calculationType: params.calculationType!,
            calculationDate: params.calculationDate!,
            status: params.status!,
            ...params
        })
    } catch (error) {
        console.error('[Audit] Failed to log calculation:', error)
    }
}

// =============================================================================
// HELPER FUNCTIONS FOR COMMON EVENTS
// =============================================================================

/**
 * Log authentication events
 */
export const logAuth = {
    login: async (userId: string, tenantId: string, ipAddress?: string, userAgent?: string) => {
        await logAuditEvent({
            tenantId,
            userId,
            eventType: 'auth',
            action: 'login',
            description: 'User logged in successfully',
            ipAddress,
            userAgent,
            riskLevel: 'low'
        })
    },

    loginFailed: async (email: string, tenantId: string, ipAddress?: string, reason?: string) => {
        await logAuditEvent({
            tenantId,
            eventType: 'auth',
            action: 'login_failed',
            description: `Login failed for ${email}: ${reason || 'Invalid credentials'}`,
            ipAddress,
            riskLevel: 'medium',
            entityType: 'user',
            entityName: email
        })
    },

    logout: async (userId: string, tenantId: string, ipAddress?: string) => {
        await logAuditEvent({
            tenantId,
            userId,
            eventType: 'auth',
            action: 'logout',
            description: 'User logged out',
            ipAddress,
            riskLevel: 'low'
        })
    },

    sessionExpired: async (userId: string, tenantId: string) => {
        await logAuditEvent({
            tenantId,
            userId,
            eventType: 'auth',
            action: 'session_expired',
            description: 'User session expired',
            riskLevel: 'low'
        })
    }
}

/**
 * Log data modification events
 */
export const logDataChange = {
    create: async (
        resource: string,
        resourceId: string,
        newValues: any,
        userId: string,
        tenantId: string
    ) => {
        await logAuditEvent({
            tenantId,
            userId,
            eventType: 'data',
            action: 'create',
            entityType: resource,
            entityId: resourceId,
            newValues,
            description: `Created ${resource} ${resourceId}`,
            riskLevel: 'medium'
        })
    },

    update: async (
        resource: string,
        resourceId: string,
        oldValues: any,
        newValues: any,
        userId: string,
        tenantId: string
    ) => {
        const changedFields = Object.keys(newValues).filter(
            key => JSON.stringify(oldValues[key]) !== JSON.stringify(newValues[key])
        )

        await logAuditEvent({
            tenantId,
            userId,
            eventType: 'data',
            action: 'update',
            entityType: resource,
            entityId: resourceId,
            oldValues,
            newValues,
            changedFields,
            description: `Updated ${resource} ${resourceId} (${changedFields.length} fields changed)`,
            riskLevel: 'medium'
        })
    },

    delete: async (
        resource: string,
        resourceId: string,
        oldValues: any,
        userId: string,
        tenantId: string
    ) => {
        await logAuditEvent({
            tenantId,
            userId,
            eventType: 'data',
            action: 'delete',
            entityType: resource,
            entityId: resourceId,
            oldValues,
            description: `Deleted ${resource} ${resourceId}`,
            riskLevel: 'high'
        })
    }
}

/**
 * Log permission changes
 */
export const logPermission = {
    roleAssigned: async (
        userId: string,
        roleId: string,
        roleName: string,
        assignedBy: string,
        tenantId: string
    ) => {
        await logAuditEvent({
            tenantId,
            userId: assignedBy,
            eventType: 'permission',
            action: 'role_assigned',
            entityType: 'user_role',
            entityId: userId,
            entityName: roleName,
            newValues: { userId, roleId, roleName },
            description: `Assigned role "${roleName}" to user`,
            riskLevel: 'high'
        })
    },

    roleRevoked: async (
        userId: string,
        roleId: string,
        roleName: string,
        revokedBy: string,
        tenantId: string
    ) => {
        await logAuditEvent({
            tenantId,
            userId: revokedBy,
            eventType: 'permission',
            action: 'role_revoked',
            entityType: 'user_role',
            entityId: userId,
            entityName: roleName,
            oldValues: { userId, roleId, roleName },
            description: `Revoked role "${roleName}" from user`,
            riskLevel: 'high'
        })
    },

    permissionsUpdated: async (
        roleId: string,
        roleName: string,
        oldPermissions: any,
        newPermissions: any,
        updatedBy: string,
        tenantId: string
    ) => {
        await logAuditEvent({
            tenantId,
            userId: updatedBy,
            eventType: 'permission',
            action: 'permissions_updated',
            entityType: 'role',
            entityId: roleId,
            entityName: roleName,
            oldValues: oldPermissions,
            newValues: newPermissions,
            description: `Updated permissions for role "${roleName}"`,
            riskLevel: 'critical'
        })
    }
}

/**
 * Log job events
 */
export const logJob = {
    created: async (jobId: string, jobName: string, jobType: string, userId: string, tenantId: string) => {
        await logAuditEvent({
            tenantId,
            userId,
            eventType: 'job',
            action: 'job_created',
            entityType: 'job_definition',
            entityId: jobId,
            entityName: jobName,
            newValues: { jobType },
            description: `Created job definition "${jobName}"`,
            riskLevel: 'medium'
        })
    },

    triggered: async (
        executionId: string,
        jobName: string,
        jobType: string,
        userId: string,
        tenantId: string,
        parameters?: any
    ) => {
        await logAuditEvent({
            tenantId,
            userId,
            eventType: 'job',
            action: 'job_triggered',
            entityType: 'job_execution',
            entityId: executionId,
            entityName: jobName,
            newValues: { jobType, parameters },
            description: `Triggered job "${jobName}"`,
            riskLevel: jobType.includes('ECL') ? 'high' : 'medium'
        })
    },

    completed: async (executionId: string, jobName: string, duration: number, tenantId: string) => {
        await logAuditEvent({
            tenantId,
            eventType: 'job',
            action: 'job_completed',
            entityType: 'job_execution',
            entityId: executionId,
            entityName: jobName,
            executionTimeMs: duration,
            description: `Job "${jobName}" completed successfully`,
            riskLevel: 'low'
        })
    },

    failed: async (executionId: string, jobName: string, error: string, tenantId: string) => {
        await logAuditEvent({
            tenantId,
            eventType: 'job',
            action: 'job_failed',
            entityType: 'job_execution',
            entityId: executionId,
            entityName: jobName,
            newValues: { error },
            description: `Job "${jobName}" failed: ${error}`,
            riskLevel: 'high'
        })
    }
}

/**
 * Log approval events
 */
export const logApproval = {
    requested: async (
        requestId: string,
        title: string,
        requestedBy: string,
        tenantId: string
    ) => {
        await logAuditEvent({
            tenantId,
            userId: requestedBy,
            eventType: 'approval',
            action: 'approval_requested',
            entityType: 'approval_request',
            entityId: requestId,
            entityName: title,
            description: `Created approval request: ${title}`,
            riskLevel: 'medium'
        })
    },

    approved: async (
        requestId: string,
        title: string,
        approvedBy: string,
        tenantId: string,
        comment?: string
    ) => {
        await logAuditEvent({
            tenantId,
            userId: approvedBy,
            eventType: 'approval',
            action: 'approval_granted',
            entityType: 'approval_request',
            entityId: requestId,
            entityName: title,
            newValues: { comment },
            description: `Approved: ${title}`,
            riskLevel: 'high'
        })
    },

    rejected: async (
        requestId: string,
        title: string,
        rejectedBy: string,
        tenantId: string,
        reason?: string
    ) => {
        await logAuditEvent({
            tenantId,
            userId: rejectedBy,
            eventType: 'approval',
            action: 'approval_rejected',
            entityType: 'approval_request',
            entityId: requestId,
            entityName: title,
            newValues: { reason },
            description: `Rejected: ${title}`,
            riskLevel: 'high'
        })
    }
}

/**
 * Log system events
 */
export const logSystem = {
    configChanged: async (
        configKey: string,
        oldValue: any,
        newValue: any,
        userId: string,
        tenantId: string
    ) => {
        await logAuditEvent({
            tenantId,
            userId,
            eventType: 'system',
            action: 'config_changed',
            entityType: 'system_config',
            entityId: configKey,
            oldValues: { [configKey]: oldValue },
            newValues: { [configKey]: newValue },
            description: `System configuration changed: ${configKey}`,
            riskLevel: 'critical'
        })
    },

    backupCreated: async (backupId: string, userId: string, tenantId: string) => {
        await logAuditEvent({
            tenantId,
            userId,
            eventType: 'system',
            action: 'backup_created',
            entityType: 'backup',
            entityId: backupId,
            description: 'Database backup created',
            riskLevel: 'medium'
        })
    }
}
