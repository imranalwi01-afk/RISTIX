import { Effect } from 'effect'
import type { ApprovalRequest, ApprovalMatrix } from '@/db/schema'

/**
 * Approval Helper Utilities
 * Provides common functions for working with the approval workflow system
 */

// =============================================================================
// TYPES
// =============================================================================

export interface ApprovalCheckResult {
    requiresApproval: boolean
    canSelfApprove: boolean
    matrix?: ApprovalMatrix
    reason?: string
}

export interface ApprovalResponse {
    success: boolean
    approvalRequired: boolean
    requestId?: string
    data?: any
    message?: string
}

// =============================================================================
// APPROVAL STATUS HELPERS
// =============================================================================

/**
 * Get human-readable approval status
 */
export const getApprovalStatusLabel = (status: string): string => {
    const statusMap: Record<string, string> = {
        pending: 'Pending Approval',
        approved: 'Approved',
        rejected: 'Rejected',
        cancelled: 'Cancelled',
        expired: 'Expired',
    }
    return statusMap[status] || status
}

/**
 * Get approval status color for UI
 */
export const getApprovalStatusColor = (status: string): string => {
    const colorMap: Record<string, string> = {
        pending: 'warning',
        approved: 'success',
        rejected: 'error',
        cancelled: 'default',
        expired: 'error',
    }
    return colorMap[status] || 'default'
}

/**
 * Calculate approval progress percentage
 */
export const calculateApprovalProgress = (request: ApprovalRequest): number => {
    if (!request.approvalsRequired || request.approvalsRequired === 0) {
        return 0
    }
    const received = request.approvalsReceived || 0
    return Math.round((received / request.approvalsRequired) * 100)
}

// =============================================================================
// RESPONSE FORMATTERS
// =============================================================================

/**
 * Format response when approval is required
 */
export const formatApprovalRequiredResponse = (
    request: ApprovalRequest
): ApprovalResponse => {
    return {
        success: true,
        approvalRequired: true,
        requestId: request.id,
        message: `Approval request created. Requires ${request.approvalsRequired} approval(s).`,
        data: {
            requestId: request.id,
            status: request.status,
            currentLevel: request.currentLevel,
            approvalsRequired: request.approvalsRequired,
            approvalsReceived: request.approvalsReceived,
            progress: calculateApprovalProgress(request),
        },
    }
}

/**
 * Format response when operation is executed directly (no approval needed)
 */
export const formatDirectExecutionResponse = <T>(
    data: T,
    message?: string
): ApprovalResponse => {
    return {
        success: true,
        approvalRequired: false,
        data,
        message: message || 'Operation completed successfully',
    }
}

// =============================================================================
// DATA EXTRACTION
// =============================================================================

/**
 * Extract original request data from approval request
 */
export const extractPendingData = <T>(request: ApprovalRequest): T | null => {
    try {
        return (request.requestData as T) || null
    } catch (error) {
        console.error('Failed to extract pending data:', error)
        return null
    }
}

/**
 * Build approval request title
 */
export const buildApprovalTitle = (
    operation: 'create' | 'update' | 'delete',
    entityType: string,
    identifier?: string
): string => {
    const operationLabel = operation.charAt(0).toUpperCase() + operation.slice(1)
    const entityLabel = entityType.charAt(0).toUpperCase() + entityType.slice(1)

    if (identifier) {
        return `${operationLabel} ${entityLabel}: ${identifier}`
    }
    return `${operationLabel} ${entityLabel}`
}

/**
 * Build approval request description
 */
export const buildApprovalDescription = (
    operation: 'create' | 'update' | 'delete',
    entityType: string,
    data: Record<string, any>
): string => {
    const changes = Object.entries(data)
        .filter(([key]) => !['password', 'passwordHash', 'mfaSecret'].includes(key))
        .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
        .slice(0, 5) // Limit to first 5 fields
        .join(', ')

    return `${operation} ${entityType} with changes: ${changes}`
}

// =============================================================================
// PERMISSION HELPERS
// =============================================================================

/**
 * Build approval permission code from entity and operation
 * Example: 'user' + 'create' => 'approval.user.create'
 */
export const buildApprovalPermission = (
    entityType: string,
    operation: 'create' | 'update' | 'delete'
): string => {
    const entity = entityType.toLowerCase().replace(/[^a-z0-9_]/g, '_')
    return `approval.${entity}.${operation}`
}

/**
 * Build canonical banking CRUD permission code.
 * Example: 'product_parameter' + 'create' => 'banking.parameter.product.create'
 */
export const buildOperationPermission = (
    entityType: string,
    operation: 'create' | 'update' | 'delete'
): string => {
    const entity = entityType.toLowerCase().replace(/[^a-z0-9_]/g, '_')
    const entityPathMap: Record<string, string> = {
        parameter: 'parameter',
        product_parameter: 'parameter.product',
        journal_parameter: 'parameter.journal',
        segmentation: 'parameter.segmentation',
        rule_base_setting: 'collective.rule_base',
        bucket_parameter: 'collective.bucket',
        pd_configuration: 'collective.pd',
        lgd_configuration: 'collective.lgd',
        ead_configuration: 'collective.ead',
        ecl_configuration: 'collective.ecl',
        fl_scalar: 'collective.fl_scalar',
    }
    const permissionPath = entityPathMap[entity] || entity.replace(/_/g, '.')
    return `banking.${permissionPath}.${operation}`
}

/**
 * Check if user has approval permission
 */
export const hasApprovalPermission = (
    userPermissions: string[],
    entityType: string,
    operation: 'create' | 'update' | 'delete'
): boolean => {
    const approvalPerm = buildApprovalPermission(entityType, operation)
    return userPermissions.includes(approvalPerm) || userPermissions.includes('approval.all')
}

/**
 * Check if user has operation permission
 */
export const hasOperationPermission = (
    userPermissions: string[],
    entityType: string,
    operation: 'create' | 'update' | 'delete'
): boolean => {
    const entity = entityType.toLowerCase().replace(/[^a-z0-9_]/g, '_')
    const operationPerm = buildOperationPermission(entityType, operation)
    const legacyOperationPerm = `operation.${entity}.${operation}`
    return userPermissions.includes(operationPerm) || userPermissions.includes(legacyOperationPerm)
}

// =============================================================================
// VALIDATION HELPERS
// =============================================================================

/**
 * Validate that approver is not the requester
 */
export const validateApproverNotRequester = (
    approverId: string,
    requesterId: string
): boolean => {
    return approverId !== requesterId
}

/**
 * Check if approval request has expired
 */
export const isApprovalExpired = (request: ApprovalRequest): boolean => {
    if (!request.expiresAt) return false
    return new Date(request.expiresAt) < new Date()
}

/**
 * Check if approval can be processed
 */
export const canProcessApproval = (request: ApprovalRequest): {
    canProcess: boolean
    reason?: string
} => {
    if (request.status !== 'pending') {
        return {
            canProcess: false,
            reason: `Request is already ${request.status}`,
        }
    }

    if (isApprovalExpired(request)) {
        return {
            canProcess: false,
            reason: 'Request has expired',
        }
    }

    return { canProcess: true }
}

// =============================================================================
// AUTO-APPROVAL HELPERS
// =============================================================================

/**
 * Determine if auto-approval should apply based on matrix rules
 */
export const shouldAutoApprove = (
    matrix: ApprovalMatrix | null | undefined,
    userPermissions: string[],
    entityType: string,
    operation: 'create' | 'update' | 'delete',
    impactLevel?: string
): boolean => {
    if (requiresStrictFourEyes(entityType)) {
        return false
    }

    // No matrix means no approval required
    if (!matrix) return true

    // Check if matrix has auto-approval rules
    const autoRules = matrix.autoApprovalRules as any
    if (autoRules) {
        // Check if user has bypass permission
        if (autoRules.bypassPermissions) {
            const hasBypass = (autoRules.bypassPermissions as string[]).some(
                perm => userPermissions.includes(perm)
            )
            if (hasBypass) return true
        }

        // Check if impact level allows auto-approval
        if (autoRules.autoApproveImpactLevels && impactLevel) {
            const allowedLevels = autoRules.autoApproveImpactLevels as string[]
            if (allowedLevels.includes(impactLevel)) return true
        }
    }

    // Check if user has approval permission (can self-approve)
    return hasApprovalPermission(userPermissions, entityType, operation)
}

const STRICT_FOUR_EYES_ENTITIES = new Set([
    'user',
    'role',
    'role_permission',
    'role_permissions',
    'role_assignment',
    'user_status',
])

export interface ApprovalRoutingLevel {
    level: number
    name: string
    requiredRoleCodes: string[]
    requiredPermissionCodes: string[]
    roleMatchMode: 'ANY' | 'ALL'
    permissionMatchMode: 'ANY' | 'ALL'
    requiredCount: number
    timeoutHours?: number
}

/**
 * Strict 4-eyes mode can be disabled explicitly for lower environments.
 * By default it is enabled to prevent self-approval bypass for privileged entities.
 */
export const requiresStrictFourEyes = (entityType: string): boolean => {
    const strictModeEnabled = (process.env.APPROVAL_STRICT_FOUR_EYES ?? 'true').toLowerCase() !== 'false'
    if (!strictModeEnabled) return false
    const normalized = String(entityType || '').trim().toLowerCase()
    return STRICT_FOUR_EYES_ENTITIES.has(normalized)
}

/**
 * Default fallback routing for strict entities when matrix data is missing.
 * This keeps approval eligibility deterministic and visible.
 */
export const buildDefaultFourEyesRouting = (_entityType: string): ApprovalRoutingLevel[] => ([
    {
        level: 1,
        name: 'Checker Review',
        requiredRoleCodes: ['CHECKER'],
        requiredPermissionCodes: ['approval.requests.approve'],
        roleMatchMode: 'ANY',
        permissionMatchMode: 'ANY',
        requiredCount: 1,
        timeoutHours: 24,
    },
    {
        level: 2,
        name: 'Final Approval',
        requiredRoleCodes: ['APPROVER', 'SUPER_ADMIN', 'IAF_TENANT_SUPER_ADMIN'],
        requiredPermissionCodes: ['approval.requests.approve', 'approval.all', 'admin.super_admin'],
        roleMatchMode: 'ANY',
        permissionMatchMode: 'ANY',
        requiredCount: 1,
        timeoutHours: 24,
    },
])

/**
 * Get required approval level for operation
 */
export const getRequiredApprovalLevel = (
    matrix: ApprovalMatrix | null | undefined,
    impactLevel?: string
): number => {
    if (!matrix) return 1

    // Matrix levels are loaded via relations, check if available
    const levels = (matrix as any).levels as any[] | undefined
    if (!levels || levels.length === 0) return 1

    // If impact level is specified, use it to determine required levels
    if (impactLevel) {
        const levelMap: Record<string, number> = {
            low: 1,
            medium: 2,
            high: 3,
            critical: levels.length,
        }
        return levelMap[impactLevel] || 2
    }

    return levels.length
}
