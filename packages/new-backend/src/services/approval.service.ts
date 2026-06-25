// @ts-nocheck
import { Effect, pipe } from 'effect'
import { and, eq, gte, inArray, isNull, lte, or, sql } from 'drizzle-orm'
import { ApprovalRepository } from '@/repositories/approval.repository'
import {
    type NewApprovalMatrix,
    type NewApprovalLevel,
    type ApprovalRequest,
    type ApprovalAction,
    type ApprovalLevel,
    userRoles,
} from '@/db/schema'
import { ConflictError, DatabaseError, NotFoundError, BusinessError, AuthorizationError } from '@/lib/errors'
import { dbOperation } from '@/lib/effect'
import { userRolesRepository } from '@/repositories/rbac.repository'
import { getDatabase } from '@/config/database'
import { buildDefaultFourEyesRouting } from '@/lib/approval-helpers'
import { 
    INDIVIDUAL_IMPAIRMENT_V2_ENTITY_TYPE, 
    INDIVIDUAL_IMPAIRMENT_V2_SUBTYPES,
    INDIVIDUAL_ASSESSMENT_CONSOLIDATED_ENTITY_TYPE 
} from '@/lib/individual-impairment-approval'
import { getNotificationSocket, type NotificationPayload } from '@/socket/notification.socket'
import { deriveNotificationCategory, filterNotificationRecipientsByPreferences, createNotification } from '@/services/notifications.service'

// =============================================================================
// TYPES
// =============================================================================

export interface CreateApprovalRequestInput {
    tenantId: string
    entityType: string
    entityId?: string
    title: string
    description?: string
    requestData?: Record<string, unknown>
    requestedBy: string
    impactLevel?: 'low' | 'medium' | 'high' | 'critical'
    bankingMode?: string
}

export interface ProcessApprovalInput {
    requestId: string
    approverId: string
    approverRole?: string
    action: 'approve' | 'reject' | 'request_info' | 'delegate'
    comment?: string
    conditions?: string
    delegatedTo?: string
    riskScore?: number
}

const SUPER_ADMIN_PERMISSION_CODE = 'admin.super_admin'
const SELF_APPROVAL_OVERRIDE_PERMISSION_CODE = 'approval.requests.self_approve_override'
const SELF_APPROVAL_OVERRIDE_SETTING_KEY = 'approval.self_approval_override.enabled'
const SELF_APPROVAL_BYPASS_ENV = 'APPROVAL_ALLOW_SUPERADMIN_SELF_APPROVAL'
const LEVEL_ROUTING_BYPASS_ENV = 'APPROVAL_ALLOW_SUPERADMIN_LEVEL_BYPASS'
const APPROVAL_COUNT_BYPASS_ENV = 'APPROVAL_ALLOW_SUPERADMIN_COUNT_BYPASS'
const SUPERADMIN_AUTO_APPROVE_REQUESTS_ENV = 'APPROVAL_AUTO_APPROVE_SUPERADMIN_REQUESTS'

const isSuperAdminSelfApprovalBypassEnabled = (): boolean =>
    String(process.env[SELF_APPROVAL_BYPASS_ENV] ?? 'true').trim().toLowerCase() === 'true'

const isSuperAdminLevelRoutingBypassEnabled = (): boolean =>
    String(process.env[LEVEL_ROUTING_BYPASS_ENV] ?? 'true').trim().toLowerCase() === 'true'

const isSuperAdminApprovalCountBypassEnabled = (): boolean =>
    String(process.env[APPROVAL_COUNT_BYPASS_ENV] ?? 'true').trim().toLowerCase() === 'true'

const isSuperAdminAutoApproveOnCreateEnabled = (): boolean =>
    String(process.env[SUPERADMIN_AUTO_APPROVE_REQUESTS_ENV] ?? 'false').trim().toLowerCase() === 'true'

const normalizeBooleanSetting = (value: unknown): boolean => {
    if (typeof value === 'boolean') return value
    if (typeof value === 'string') {
        const normalized = value.trim().toLowerCase()
        return normalized === 'true' || normalized === '1' || normalized === 'yes' || normalized === 'enabled'
    }
    if (value && typeof value === 'object') {
        const candidate = (value as Record<string, unknown>).enabled
            ?? (value as Record<string, unknown>).value
            ?? (value as Record<string, unknown>).allow
        return normalizeBooleanSetting(candidate)
    }
    return false
}

const isSelfApprovalOverrideSettingEnabled = async (): Promise<boolean> => {
    try {
        const database = getDatabase()
        const result = await database.execute(sql`
            SELECT value
            FROM platform_admin.settings
            WHERE key = ${SELF_APPROVAL_OVERRIDE_SETTING_KEY}
            LIMIT 1
        `)
        const rows = Array.isArray(result) ? result : (result?.rows ?? [])
        return normalizeBooleanSetting(rows[0]?.value)
    } catch (error) {
        console.warn('[Approval] Failed to read self-approval override setting; defaulting to disabled', error)
        return false
    }
}

export interface CancelApprovalRequestInput {
    requestId: string
    cancelledBy: string
    isSystemUser?: boolean
    reason?: string
}

export interface ApprovalRoutingCandidate {
    userId: string
    fullName: string
    email: string
    department: string | null
    position: string | null
    roleCodes: string[]
}

export interface ApprovalRoutingLevelOverview {
    level: number
    name: string
    requiredRoleCodes: string[]
    requiredPermissionCodes: string[]
    requiredCount: number
    timeoutHours?: number
    candidateCount: number
    candidates: ApprovalRoutingCandidate[]
}

export interface ApprovalRoutingOverview {
    entityType: string
    operationType: string
    matrixId: string | null
    matrixName: string
    isActive: boolean
    levels: ApprovalRoutingLevelOverview[]
}

// =============================================================================
// MATRIX QUERIES
// =============================================================================

// =============================================================================
// MATRIX QUERIES
// =============================================================================

/**
 * Get approval matrix for entity type.
 * 
 * @param tenantId - The tenant ID
 * @param entityType - The entity type
 * @param bankingMode - Optional banking mode filter
 * @returns An Effect resolving to the approval matrix or database error
 */
export const getApprovalMatrix = (
    tenantId: string,
    entityType: string,
    bankingMode?: string
): Effect.Effect<any, DatabaseError> =>
    dbOperation('query', () =>
        ApprovalRepository.findMatrixByEntityType(tenantId, entityType, bankingMode)
    )

/**
 * Get all matrices for a tenant.
 * 
 * @param tenantId - The tenant ID
 * @returns An Effect resolving to an array of approval matrices
 */
export const getApprovalMatrices = (
    tenantId: string
): Effect.Effect<any[], DatabaseError> =>
    dbOperation('query', () =>
        ApprovalRepository.findMatricesByTenant(tenantId)
    )

/**
 * Create an approval matrix.
 * 
 * @param data - The matrix data
 * @param levels - The levels data
 * @returns An Effect resolving to the created matrix
 */
export const createApprovalMatrix = (
    data: NewApprovalMatrix,
    levels: Omit<NewApprovalLevel, 'matrixId'>[]
): Effect.Effect<any, DatabaseError> =>
    dbOperation('transaction', () =>
        ApprovalRepository.createMatrix(data, levels)
    )

/**
 * Update an approval matrix and optionally replace its levels.
 */
export const updateApprovalMatrix = (
    tenantId: string,
    matrixId: string,
    data: Partial<NewApprovalMatrix>,
    levels?: Omit<NewApprovalLevel, 'matrixId'>[]
): Effect.Effect<any, DatabaseError | NotFoundError> =>
    Effect.tryPromise({
        try: async () => {
            const updated = await ApprovalRepository.updateMatrixWithLevels({
                tenantId,
                matrixId,
                data,
                levels,
            })

            if (!updated) {
                throw new NotFoundError({
                    message: 'Approval matrix not found',
                    resource: 'approval_matrix',
                    id: matrixId,
                })
            }

            return updated
        },
        catch: (error) =>
            error instanceof NotFoundError
                ? error
                : new DatabaseError({
                    message: error instanceof Error ? error.message : 'Failed to update approval matrix',
                    operation: 'transaction',
                    cause: error,
                }),
    })

// =============================================================================
// REQUEST COMMANDS
// =============================================================================

/**
 * Create a new approval request.
 * 
 * @param input - The request input data
 * @returns An Effect resolving to the created approval request
 */
export const createApprovalRequest = (
    input: CreateApprovalRequestInput
): Effect.Effect<ApprovalRequest, DatabaseError | ConflictError> =>
    Effect.tryPromise({
        try: async () => {
            const db = getDatabase(input.tenantId);
            return await db.transaction(async (tx) => {
                // ADVISORY LOCK: Prevent race conditions during duplicate check + creation
                // We use a hash of (tenantId, entityType, entityId) to create a unique lock key
                const lockStr = `${input.tenantId}-${input.entityType}-${input.entityId || 'none'}`;
                let hash = 0;
                for (let i = 0; i < lockStr.length; i++) {
                    hash = ((hash << 5) - hash) + lockStr.charCodeAt(i);
                    hash |= 0; // Convert to 32bit integer
                }
                const lockId = Math.abs(hash);
                await tx.execute(sql`SELECT pg_advisory_xact_lock(${lockId})`);

                const operation =
                    input.requestData && typeof input.requestData === 'object' && typeof (input.requestData as any).operation === 'string'
                        ? String((input.requestData as any).operation)
                        : undefined

                const existingPending = await ApprovalRepository.findDuplicatePendingRequest({
                    tenantId: input.tenantId,
                    entityType: input.entityType,
                    entityId: input.entityId,
                    requestedBy: input.requestedBy,
                    title: input.title,
                    operation,
                }, tx)

                if (existingPending) {
                    throw new ConflictError({
                        message: `A similar approval request is already pending for ${input.entityType} "${input.title}"`,
                        resource: 'approval_request',
                        field: input.entityId ? 'entity_id' : 'title',
                        value: input.entityId ?? input.title,
                        details: {
                            duplicateRequestId: existingPending.id,
                            entityType: input.entityType,
                            entityId: input.entityId ?? null,
                            title: input.title,
                            operation: operation ?? null,
                            requestedBy: input.requestedBy,
                            existingStatus: existingPending.status,
                            existingCreatedAt: existingPending.createdAt,
                        },
                    })
                }

                // Get matrix if available
                const matrix = await ApprovalRepository.findMatrixByEntityType(
                    input.tenantId,
                    input.entityType,
                    input.bankingMode
                )

                const approvalsRequired = calculateRequiredApprovals(input.impactLevel, matrix)
                const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)

                const request = await ApprovalRepository.createRequest({
                    matrixId: matrix?.id,
                    tenantId: input.tenantId,
                    entityType: input.entityType,
                    entityId: input.entityId,
                    title: input.title,
                    description: input.description,
                    requestData: input.requestData,
                    requestedBy: input.requestedBy,
                    impactLevel: input.impactLevel ?? 'medium',
                    approvalsRequired,
                    expiresAt,
                }, tx)
                
                return request;
            });
        },
        catch: (error) => {
            if (error instanceof ConflictError) {
                return error;
            }
            return new DatabaseError({
                message: error instanceof Error ? error.message : 'Failed to create approval request',
                operation: 'transaction',
                cause: error,
            });
        },
    })
    .pipe(
        Effect.andThen((request) =>
            Effect.tryPromise({
                try: async () => {
                    const hydratedRequest = await ApprovalRepository.findRequestById(request.id)

                    if (hydratedRequest && (await shouldAutoApproveCreatedRequest(hydratedRequest, input))) {
                        const autoApproved = await autoApproveCreatedRequest(hydratedRequest, input.requestedBy).catch(
                            (error) => {
                                console.warn('[ApprovalService] Failed to auto-approve newly created request:', error)
                                return null
                            }
                        )
                        if (autoApproved) {
                            return autoApproved as ApprovalRequest
                        }
                    }

                    // Emit asynchronous notifications for first-level approvers.
                    if (hydratedRequest) {
                        await notifyNextLevelApprovers(hydratedRequest).catch((error) => {
                            console.warn('[ApprovalService] Failed to notify next-level approvers:', error)
                        })
                    }

                    return request
                },
                catch: (error) =>
                    new DatabaseError({
                        message: `Failed to post-process approval request: ${error instanceof Error ? error.message : String(error)}`,
                        operation: 'query',
                        cause: error,
                    }),
            })
        )
    )



/**
 * Process an approval action (approve, reject, request_info, delegate).
 * 
 * @param input - The action input data
 * @returns An Effect resolving to the completion status
 * @throws NotFoundError if request not found
 * @throws BusinessError if request is not pending or other business rule violations
 */
export const processApprovalAction = (
    input: ProcessApprovalInput
): Effect.Effect<{ completed: boolean; status: string }, DatabaseError | NotFoundError | BusinessError | AuthorizationError> =>
    Effect.tryPromise({
        try: async () => {
            // Get the request
            const request = await ApprovalRepository.findRequestById(input.requestId)

            if (!request) {
                throw new NotFoundError({ resource: 'ApprovalRequest', id: input.requestId })
            }
            if (request.status !== 'pending') {
                throw new BusinessError({
                    message: `Request is already ${request.status}`,
                    code: 'REQUEST_NOT_PENDING',
                })
            }

            const existingActions = Array.isArray((request as any).actions) ? (request as any).actions : []
            let approverContext: ApproverContext | null = null
            let selfApprovalBypassMetadata: Record<string, unknown> | undefined
            let levelRoutingBypassMetadata: Record<string, unknown> | undefined
            let approvalCountBypassMetadata: Record<string, unknown> | undefined

            if (input.action === 'approve') {
                approverContext = await loadApproverContext(input.approverId, request.tenantId)
            }

            const isDev = String(process.env.NODE_ENV || '').toLowerCase() !== 'production'
            const hasSuperAdminBypass = Boolean(approverContext?.permissions.has(SUPER_ADMIN_PERMISSION_CODE))

            const canBypassApprovalCount = input.action === 'approve'
                && isSuperAdminApprovalCountBypassEnabled()
                && (hasSuperAdminBypass || isDev)

            const pendingApprovalsAfterCurrentAction = Math.max(
                0,
                Number(request.approvalsRequired || 1) - ((request.approvalsReceived || 0) + 1)
            )

            const shouldBypassApprovalCount = canBypassApprovalCount && pendingApprovalsAfterCurrentAction > 0

            if (shouldBypassApprovalCount) {
                approvalCountBypassMetadata = {
                    approvalCountBypass: true,
                    bypassedRule: 'APPROVAL_REQUIRED_COUNT',
                    policy: APPROVAL_COUNT_BYPASS_ENV,
                    approverPermission: SUPER_ADMIN_PERMISSION_CODE,
                    approvalsRequired: Number(request.approvalsRequired || 1),
                    approvalsReceivedBefore: Number(request.approvalsReceived || 0),
                    approvalsReceivedAfterAction: Number((request.approvalsReceived || 0) + 1),
                }
            }

            // Prevent users from approving their own requests unless explicit super-admin bypass is enabled.
            if (input.action === 'approve' && input.approverId === request.requestedBy) {
                const hasSuperAdminPermission = Boolean(
                    approverContext?.permissions.has(SUPER_ADMIN_PERMISSION_CODE)
                )
                const hasSelfApprovalOverridePermission = Boolean(
                    approverContext?.permissions.has(SELF_APPROVAL_OVERRIDE_PERMISSION_CODE)
                )
                const dbOverrideEnabled = await isSelfApprovalOverrideSettingEnabled()
                const envBypassEnabled = isSuperAdminSelfApprovalBypassEnabled()
                const canUseDbOverride = dbOverrideEnabled && hasSelfApprovalOverridePermission
                const canUseLegacyEnvBypass = envBypassEnabled && hasSuperAdminPermission
                const canBypass = canUseDbOverride || canUseLegacyEnvBypass

                if (!canBypass) {
                    throw new BusinessError({
                        message: `You cannot approve your own request. Self-approval override requires ${SELF_APPROVAL_OVERRIDE_PERMISSION_CODE} and ${SELF_APPROVAL_OVERRIDE_SETTING_KEY}=true.`,
                        code: 'SELF_APPROVAL_NOT_ALLOWED',
                    })
                }

                if (!String(input.comment || '').trim()) {
                    throw new BusinessError({
                        message: 'Self-approval override requires approval comment',
                        code: 'SELF_APPROVAL_BYPASS_COMMENT_REQUIRED',
                    })
                }

                selfApprovalBypassMetadata = {
                    selfApprovalBypass: true,
                    bypassedRule: 'SELF_APPROVAL_NOT_ALLOWED',
                    policy: canUseDbOverride ? SELF_APPROVAL_OVERRIDE_SETTING_KEY : SELF_APPROVAL_BYPASS_ENV,
                    approverPermission: canUseDbOverride
                        ? SELF_APPROVAL_OVERRIDE_PERMISSION_CODE
                        : SUPER_ADMIN_PERMISSION_CODE,
                    dbOverrideEnabled,
                    legacyEnvBypassEnabled: envBypassEnabled,
                    requestedBy: request.requestedBy,
                }
            }

            // Strict separation of duties:
            // One approver can only approve once in a request (cannot approve multiple levels).
            if (input.action === 'approve' && hasApproverApproved(existingActions, input.approverId)) {
                throw new BusinessError({
                    message: 'You have already approved this request and cannot approve another stage',
                    code: 'APPROVER_ALREADY_ACTED',
                })
            }

            const matrixLevels = resolveApprovalLevelsFromRequest(request)
            let currentLevelRequiredCount = 1
            let currentLevelApprovedBefore = countApprovedActions(existingActions, request.currentLevel)

            if (matrixLevels.length > 0 && input.action !== 'request_info') {
                const currentLevelConfig = matrixLevels.find((level) => level.level === request.currentLevel)
                if (!currentLevelConfig) {
                    throw new BusinessError({
                        message: `Approval level ${request.currentLevel} is not configured`,
                        code: 'APPROVAL_LEVEL_NOT_CONFIGURED',
                    })
                }

                const resolvedApproverContext = approverContext || await loadApproverContext(input.approverId, request.tenantId)
                const eligibleByRouting = matchesApprovalRequirements(
                    currentLevelConfig.requiredRoleCodes,
                    currentLevelConfig.requiredPermissionCodes,
                    resolvedApproverContext,
                    currentLevelConfig.roleMatchMode,
                    currentLevelConfig.permissionMatchMode
                )

                const canBypassLevelRouting = isSuperAdminLevelRoutingBypassEnabled()
                    && resolvedApproverContext.permissions.has(SUPER_ADMIN_PERMISSION_CODE)

                if (!eligibleByRouting && !canBypassLevelRouting) {
                    const userRoleCodes = Array.from(resolvedApproverContext.roleCodes).sort()
                    const userApprovalPermissions = Array.from(resolvedApproverContext.permissions)
                        .filter((permission) =>
                            permission === 'approval.requests.approve'
                            || permission === 'approval.all'
                            || permission === 'admin.super_admin'
                        )
                        .sort()

                    throw new AuthorizationError({
                        message: `You are not eligible to approve level ${request.currentLevel}. Required roles: ${currentLevelConfig.requiredRoleCodes.join(', ') || 'none'}. Required permissions: ${currentLevelConfig.requiredPermissionCodes.join(', ') || 'none'}. Your roles: ${userRoleCodes.join(', ') || 'none'}. Your approval permissions: ${userApprovalPermissions.join(', ') || 'none'}.`,
                        requiredPermission: `approval.level.${request.currentLevel}`,
                        userId: input.approverId,
                        details: {
                            requestId: request.id,
                            entityType: request.entityType,
                            currentLevel: request.currentLevel,
                            requiredRoleCodes: currentLevelConfig.requiredRoleCodes,
                            requiredPermissionCodes: currentLevelConfig.requiredPermissionCodes,
                            userRoleCodes,
                            userApprovalPermissions,
                            matrixId: request.matrixId ?? null,
                        },
                    })
                }

                if (!eligibleByRouting && canBypassLevelRouting) {
                    levelRoutingBypassMetadata = {
                        levelRoutingBypass: true,
                        bypassedRule: 'APPROVAL_LEVEL_ELIGIBILITY',
                        policy: LEVEL_ROUTING_BYPASS_ENV,
                        approverPermission: SUPER_ADMIN_PERMISSION_CODE,
                        level: request.currentLevel,
                        requiredRoleCodes: currentLevelConfig.requiredRoleCodes,
                        requiredPermissionCodes: currentLevelConfig.requiredPermissionCodes,
                    }
                }

                if (input.action === 'approve') {
                    if (hasApproverApprovedAtLevel(existingActions, input.approverId, request.currentLevel)) {
                        throw new BusinessError({
                            message: `You already approved level ${request.currentLevel}`,
                            code: 'APPROVER_ALREADY_APPROVED_LEVEL',
                        })
                    }

                    currentLevelRequiredCount = Math.max(1, currentLevelConfig.requiredCount || 1)
                    currentLevelApprovedBefore = countApprovedActions(existingActions, request.currentLevel)
                }
            }

            // Insert the action
            await ApprovalRepository.createAction({
                requestId: input.requestId,
                approverId: input.approverId,
                approverRole: input.approverRole,
                level: request.currentLevel,
                action: input.action,
                comment: input.comment,
                conditions: mergeActionConditions(input.conditions, {
                    ...(selfApprovalBypassMetadata || {}),
                    ...(levelRoutingBypassMetadata || {}),
                    ...(approvalCountBypassMetadata || {}),
                }),
                delegatedTo: input.delegatedTo,
                riskScore: input.riskScore,
            })

            // Handle based on action type
            if (input.action === 'approve') {
                const newReceived = (request.approvalsReceived || 0) + 1
                const currentLevelApprovedAfter = currentLevelApprovedBefore + 1

                if (matrixLevels.length > 0) {
                    const effectiveLevels = getEffectiveLevels(matrixLevels, request.approvalsRequired)
                    const currentLevelIdx = effectiveLevels.findIndex((level) => level.level === request.currentLevel)
                    if (currentLevelIdx < 0) {
                        throw new BusinessError({
                            message: `Current level ${request.currentLevel} is outside effective workflow`,
                            code: 'APPROVAL_LEVEL_OUTSIDE_WORKFLOW',
                        })
                    }
                    const forceCompleteByCountBypass = shouldBypassApprovalCount
                    const currentLevelComplete = forceCompleteByCountBypass
                        || currentLevelApprovedAfter >= currentLevelRequiredCount
                    const nextLevel = !forceCompleteByCountBypass && currentLevelComplete && currentLevelIdx >= 0
                        ? effectiveLevels[currentLevelIdx + 1]
                        : undefined
                    const isComplete = forceCompleteByCountBypass || (currentLevelComplete && !nextLevel)
                    const approvalsReceived = forceCompleteByCountBypass
                        ? Math.max(newReceived, Number(request.approvalsRequired || newReceived))
                        : newReceived

                    await ApprovalRepository.updateRequest(input.requestId, {
                        approvalsReceived,
                        status: isComplete ? 'approved' : 'pending',
                        currentLevel: isComplete ? request.currentLevel : (nextLevel?.level ?? request.currentLevel),
                        completedAt: isComplete ? new Date() : null,
                        completedBy: isComplete ? input.approverId : null,
                    })

                    if (isComplete) {
                        // Execute the approved action (e.g., create user, update config)
                        await executeApprovedAction(request, input.approverId)
                        await notifyApprovalCompletion(request, 'approved', input.approverId)
                    } else if (currentLevelComplete) {
                        // Only notify next level when current level has collected enough approvers.
                        await notifyNextLevelApprovers({ ...request, currentLevel: nextLevel?.level ?? request.currentLevel })
                    }

                    return { completed: isComplete, status: isComplete ? 'approved' : 'pending' }
                }

                const forceCompleteByCountBypass = shouldBypassApprovalCount
                const isComplete = forceCompleteByCountBypass || newReceived >= request.approvalsRequired
                const approvalsReceived = forceCompleteByCountBypass
                    ? Math.max(newReceived, Number(request.approvalsRequired || newReceived))
                    : newReceived

                await ApprovalRepository.updateRequest(input.requestId, {
                    approvalsReceived,
                    status: isComplete ? 'approved' : 'pending',
                    currentLevel: isComplete ? request.currentLevel : request.currentLevel + 1,
                    completedAt: isComplete ? new Date() : null,
                    completedBy: isComplete ? input.approverId : null,
                })

                if (isComplete) {
                    await executeApprovedAction(request, input.approverId)
                    await notifyApprovalCompletion(request, 'approved', input.approverId)
                } else {
                    await notifyNextLevelApprovers(request)
                }

                return { completed: isComplete, status: isComplete ? 'approved' : 'pending' }
            }

            if (input.action === 'reject') {
                await ApprovalRepository.updateRequest(input.requestId, {
                    status: 'rejected',
                    completedAt: new Date(),
                    completedBy: input.approverId,
                })

                // If this is an R Analytics approval request, trigger the rejected logic
                if (request.entityType === 'r_analytics_comprehensive') {
                    await executeRAnalyticsComprehensiveAction(request.requestData.operation, request.requestData, 'REJECTED')
                }

                await notifyApprovalCompletion(request, 'rejected', input.approverId)
                return { completed: true, status: 'rejected' }
            }

            if (input.action === 'request_info') {
                await ApprovalRepository.updateRequest(input.requestId, {
                    status: 'info_requested',
                })
                await notifyRequester(request, 'info_requested', input.comment)
                return { completed: false, status: 'info_requested' }
            }

            if (input.action === 'delegate') {
                if (!input.delegatedTo) {
                    throw new BusinessError({
                        message: 'Delegation target user ID is required',
                        code: 'DELEGATION_REQUIRED'
                    })
                }
                // Notify the delegated user
                await notifyApprover(input.delegatedTo, request, 'delegated')
                return { completed: false, status: 'pending' }
            }

            return { completed: false, status: 'pending' }
        },
        catch: (error) => {
            if (error instanceof NotFoundError || error instanceof BusinessError || error instanceof AuthorizationError) {
                return error
            }
            return new DatabaseError({
                message: error instanceof Error ? error.message : 'Database operation failed',
                operation: 'transaction',
                cause: error,
            })
        },
    })

/**
 * Cancel an existing approval request.
 * Requesters can cancel their own pending request; system users can cancel any.
 */
export const cancelApprovalRequest = (
    input: CancelApprovalRequestInput
): Effect.Effect<{ completed: boolean; status: string }, DatabaseError | NotFoundError | BusinessError> =>
    Effect.tryPromise({
        try: async () => {
            const request = await ApprovalRepository.findRequestById(input.requestId)

            if (!request) {
                throw new NotFoundError({ resource: 'ApprovalRequest', id: input.requestId })
            }

            if (request.status !== 'pending' && request.status !== 'info_requested' && request.status !== 'delegated') {
                throw new BusinessError({
                    message: `Request cannot be cancelled because it is already ${request.status}`,
                    code: 'REQUEST_NOT_CANCELLABLE',
                })
            }

            if (!input.isSystemUser && request.requestedBy !== input.cancelledBy) {
                throw new BusinessError({
                    message: 'Only the original requester can cancel this request',
                    code: 'CANCEL_NOT_ALLOWED',
                })
            }

            await ApprovalRepository.createAction({
                requestId: input.requestId,
                approverId: input.cancelledBy,
                approverRole: input.isSystemUser ? 'SYSTEM' : 'REQUESTER',
                level: request.currentLevel,
                action: 'cancel',
                comment: input.reason || 'Cancelled by requester',
            })

            await ApprovalRepository.updateRequest(input.requestId, {
                status: 'cancelled',
                completedAt: new Date(),
                completedBy: input.cancelledBy,
            })

            return { completed: true, status: 'cancelled' }
        },
        catch: (error) => {
            if (error instanceof NotFoundError || error instanceof BusinessError) {
                return error
            }
            return new DatabaseError({
                message: error instanceof Error ? error.message : 'Database operation failed',
                operation: 'transaction',
                cause: error,
            })
        },
    })

// =============================================================================
// INTERNAL HELPERS & PLACEHOLDERS
// =============================================================================

/**
 * Execute the actual logic that was requested once approved
 */
async function executeApprovedAction(request: any, approvedBy?: string): Promise<void> {
    console.log(`[ApprovalService] Executing approved action for ${request.entityType}:${request.entityId}`)

    const requestData = request.requestData as any
    if (!requestData || !requestData.operation) {
        console.error('[ApprovalService] Invalid request data structure')
        return
    }

    const { operation, entityType, data, oldValues } = requestData
    const tenantId = request.tenantId

    try {
        const requestEntityType = String(request?.entityType || '').trim()
        const normalizedRequestEntityType = requestEntityType.toLowerCase()
        const effectiveEntityTypeRaw = typeof entityType === 'string' && entityType.trim()
            ? entityType.trim()
            : (requestEntityType || '')
        const effectiveEntityType =
            effectiveEntityTypeRaw === 'individual_assessment_consolidated'
                ? INDIVIDUAL_ASSESSMENT_CONSOLIDATED_ENTITY_TYPE
                : effectiveEntityTypeRaw

        const effectiveData = data ?? (requestData.data ?? requestData)

        if (!entityType && normalizedRequestEntityType === 'individual_assessment_consolidated') {
            await executeIndividualAssessmentConsolidatedAction(
                operation,
                requestData.data ?? requestData,
                requestData.data ?? requestData,
                tenantId,
                request.requestedBy ?? approvedBy
            )
            return
        }

        // Map entity types to their service executors
        switch (effectiveEntityType) {
            case 'r_analytics_comprehensive':
                await executeRAnalyticsComprehensiveAction(operation, requestData, 'APPROVED')
                break
            case 'user':
                await executeUserAction(
                    operation,
                    operation === 'update' && request.entityId && !effectiveData?.id
                        ? { ...effectiveData, id: request.entityId }
                        : effectiveData,
                    tenantId
                )
                break

            case 'user_status':
                await executeUserStatusAction(operation, effectiveData, tenantId)
                break

            case 'role':
                await executeRoleAction(operation, effectiveData, tenantId)
                break

            case 'role_assignment':
                await executeRoleAssignmentAction(operation, effectiveData, tenantId)
                break

            case 'parameter':
            case 'app_setting':
            case 'business_setting':
                await executeParameterAction(operation, effectiveData, tenantId, effectiveEntityType, request.entityId, request.requestedBy ?? approvedBy)
                break

            case 'pd_configuration':
            case 'lgd_configuration':
            case 'ead_configuration':
            case 'ecl_configuration':
                await executeConfigurationAction(operation, effectiveData, tenantId, effectiveEntityType, request.entityId, request.requestedBy ?? approvedBy)
                break

            case 'bucket_parameter':
                await executeBucketParameterAction(operation, effectiveData, tenantId, request.entityId, request.requestedBy ?? approvedBy)
                break

            case 'rule_base_setting':
                await executeRuleBaseSettingAction(operation, effectiveData, tenantId, request.entityId, request.requestedBy ?? approvedBy)
                break

            case 'segmentation':
                await executeSegmentationAction(operation, effectiveData, tenantId, request.entityId, request.requestedBy ?? approvedBy)
                break

            case 'fl_scalar':
                await executeFlScalarAction(operation, effectiveData, tenantId, request.entityId, request.requestedBy ?? approvedBy)
                break

            case 'product_parameter':
                await executeProductParameterAction(operation, effectiveData, tenantId, request.entityId, request.requestedBy ?? approvedBy)
                break

            case 'journal_parameter':
                await executeJournalParameterAction(operation, effectiveData, tenantId, request.entityId, request.requestedBy ?? approvedBy)
                break

            case INDIVIDUAL_IMPAIRMENT_V2_ENTITY_TYPE:
                await executeIndividualImpairmentV2Action(operation, requestData, effectiveData, tenantId, request.requestedBy ?? approvedBy)
                break

            case INDIVIDUAL_ASSESSMENT_CONSOLIDATED_ENTITY_TYPE:
                await executeIndividualAssessmentConsolidatedAction(
                    operation,
                    requestData.data ?? requestData,
                    effectiveData,
                    tenantId,
                    request.requestedBy ?? approvedBy
                )
                break

            case 'role_permission':
            case 'role_permissions':
                await executeRolePermissionAction(operation, effectiveData, tenantId)
                break

            default:
                console.warn(`[ApprovalService] No executor defined for entity type: ${entityType}`)
            // For unknown entity types, just log - they may be handled by custom logic
        }
    } catch (error) {
        console.error(`[ApprovalService] Failed to execute approved action:`, error)
        throw error
    }
}

/**
 * Replay the side effect for an already-approved request.
 *
 * Intended for operational reconciliation of older approval requests whose
 * status reached `approved` before the executor wrote the live row.
 */
export async function replayApprovedRequestSideEffect(request: any, approvedBy?: string): Promise<void> {
    await executeApprovedAction(request, approvedBy)
}

/**
 * Execute user-related actions
 */
async function executeUserAction(
    operation: 'create' | 'update' | 'delete',
    data: any,
    tenantId: string
): Promise<void> {
    // Import dynamically to avoid circular dependencies
    const { createUser, updateUser, deleteUser } = await import('./users.service')

    switch (operation) {
        case 'create':
            await Effect.runPromise(createUser({ ...data, tenantId }) as any)
            break
        case 'update':
            await Effect.runPromise(updateUser(data.id, { ...data, tenantId }) as any)
            break
        case 'delete':
            await Effect.runPromise(deleteUser(data.id, tenantId) as any)
            break
    }
}

/**
 * Execute user status actions (enable/disable) after approval.
 */
async function executeUserStatusAction(
    operation: 'create' | 'update' | 'delete',
    data: any,
    tenantId: string
): Promise<void> {
    if (operation !== 'update') {
        console.warn(`[ApprovalService] Unsupported user_status operation: ${operation}`)
        return
    }

    const userId = data?.id
    if (!userId || typeof userId !== 'string') {
        throw new Error('Missing user id in user_status approval payload')
    }

    const { enableUser, disableUser } = await import('./users.service')
    const isActive = Boolean(data?.isActive)
    if (isActive) {
        await Effect.runPromise(enableUser(userId, tenantId) as any)
    } else {
        await Effect.runPromise(disableUser(userId, tenantId) as any)
    }
}

/**
 * Execute role CRUD actions after approval.
 */
async function executeRoleAction(
    operation: 'create' | 'update' | 'delete',
    data: any,
    tenantId: string
): Promise<void> {
    const { createRole, updateRole, deleteRole } = await import('./rbac.service')
    const { rolePermissionsRepository } = await import('@/repositories/rbac.repository')
    const { permissions: permissionsTable } = await import('@/db/schema')
    const db = getDatabase(tenantId)
    const resolvePermissionIds = async (input: unknown): Promise<string[]> => {
        if (!Array.isArray(input)) return []

        const requestedPermissions = Array.from(new Set(
            input.filter((entry: unknown): entry is string => typeof entry === 'string' && entry.trim().length > 0)
                .map((entry) => entry.trim())
        ))

        if (requestedPermissions.length === 0) return []

        const permArray = sql.join(requestedPermissions.map((p) => sql`${p}::varchar`), sql`, `);
        const matched = await db
            .select({ id: permissionsTable.id, code: permissionsTable.code })
            .from(permissionsTable)
            .where(sql`(${permissionsTable.id}::text = ANY(ARRAY[${permArray}]) OR ${permissionsTable.code} = ANY(ARRAY[${permArray}]))`)

        const permissionLookup = new Map<string, string>()
        for (const permission of matched as any[]) {
            permissionLookup.set(permission.id, permission.id)
            permissionLookup.set(permission.code, permission.id)
        }

        const unknownPermissions = requestedPermissions.filter((entry) => !permissionLookup.has(entry))
        if (unknownPermissions.length > 0) {
            throw new Error(`Unknown role permissions in role approval payload: ${unknownPermissions.join(', ')}`)
        }

        return requestedPermissions
            .map((entry) => permissionLookup.get(entry))
            .filter((entry: string | undefined): entry is string => typeof entry === 'string')
    }

    switch (operation) {
        case 'create': {
            const { permissions: permCodes, ...roleData } = data
            const permissionIds = await resolvePermissionIds(permCodes)
            const [role] = await Effect.runPromise(createRole({ ...roleData, tenantId }) as any)
            if (role && permissionIds.length > 0) {
                await Effect.runPromise(rolePermissionsRepository.set(db, role.id, permissionIds))
            }
            break
        }
        case 'update': {
            if (!data?.id) {
                throw new Error('Missing role id in role update approval payload')
            }
            const { permissions: permCodes, ...roleData } = data
            const permissionIds = await resolvePermissionIds(permCodes)
            await Effect.runPromise(updateRole(data.id, { ...roleData, tenantId }) as any)
            if (Array.isArray(permCodes)) {
                await Effect.runPromise(rolePermissionsRepository.set(db, data.id, permissionIds))
            }
            break
        }
        case 'delete':
            if (!data?.id) {
                throw new Error('Missing role id in role delete approval payload')
            }
            await Effect.runPromise(deleteRole(data.id, tenantId) as any)
            break
    }
}

/**
 * Execute user-role assignment actions after approval.
 */
async function executeRoleAssignmentAction(
    operation: 'create' | 'update' | 'delete',
    data: any,
    tenantId: string
): Promise<void> {
    const { assignRole, removeRole } = await import('./rbac.service')

    if (!data?.userId || !data?.roleId) {
        throw new Error('Missing userId/roleId in role assignment approval payload')
    }

    switch (operation) {
        case 'create':
            await Effect.runPromise(assignRole({
                userId: data.userId,
                roleId: data.roleId,
                tenantId,
                assignedBy: data.assignedBy,
                validFrom: data.validFrom ? new Date(data.validFrom) : undefined,
                validUntil: data.validUntil ? new Date(data.validUntil) : undefined,
                isTemporary: Boolean(data.isTemporary),
                temporaryReason: data.temporaryReason,
            }) as any)
            break
        case 'delete':
            await Effect.runPromise(removeRole(data.userId, data.roleId, tenantId) as any)
            break
        default:
            console.warn(`[ApprovalService] Unsupported role_assignment operation: ${operation}`)
    }
}

/**
 * Execute parameter-related actions
 */
async function executeParameterAction(
    operation: 'create' | 'update' | 'delete',
    data: any,
    _tenantId: string,
    entityType: string,
    entityId?: string | null,
    actorId?: string
): Promise<void> {
    const { ParametersService } = await import('./parameters.service')
    const effectiveActorId = actorId || 'system'
    const scope = data?.scope
    const numericDetailId = entityId && entityId.startsWith('detail:') ? Number(entityId.slice('detail:'.length)) : Number(data?.detailId ?? data?.id)
    const headerCode = typeof entityId === 'string' && !entityId.startsWith('detail:') ? entityId : (data?.paramCode ?? data?.parentCode)
    const payloadWithParamType =
        entityType === 'business_setting' || data?.paramType === 'B'
            ? { ...data, paramType: 'B' }
            : data

    if (scope === 'detail' || (entityId && entityId.startsWith('detail:'))) {
        switch (operation) {
            case 'create':
                await Effect.runPromise(ParametersService.createAppSettingDetail(payloadWithParamType, effectiveActorId) as any)
                return
            case 'update':
                if (!Number.isFinite(numericDetailId)) {
                    throw new Error('Missing parameter detail id in approval payload')
                }
                await Effect.runPromise(ParametersService.updateAppSettingDetail(numericDetailId, payloadWithParamType, effectiveActorId) as any)
                return
            case 'delete':
                if (!Number.isFinite(numericDetailId)) {
                    throw new Error('Missing parameter detail id in approval payload')
                }
                await Effect.runPromise(ParametersService.deleteAppSettingDetail(numericDetailId) as any)
                return
        }
        return
    }

    switch (operation) {
        case 'create':
            await Effect.runPromise(ParametersService.createAppSetting(payloadWithParamType, effectiveActorId) as any)
            return
        case 'update':
            if (!headerCode) {
                throw new Error('Missing parameter code in approval payload')
            }
            await Effect.runPromise(ParametersService.updateAppSetting(headerCode, payloadWithParamType, effectiveActorId) as any)
            return
        case 'delete':
            if (!headerCode) {
                throw new Error('Missing parameter code in approval payload')
            }
            await Effect.runPromise(ParametersService.deleteAppSetting(headerCode) as any)
            return
    }
}

function parseNumericEntityId(entityId?: string | null, fallback?: unknown): number {
    const raw = typeof entityId === 'string' && entityId.includes(':')
        ? entityId.split(':').pop()
        : entityId ?? fallback
    const numericId = Number(raw)
    return Number.isFinite(numericId) ? numericId : Number.NaN
}

/**
 * Execute configuration-related actions
 */
async function executeConfigurationAction(
    operation: 'create' | 'update' | 'delete',
    data: any,
    tenantId: string,
    entityType: string,
    entityId?: string | null,
    actorId?: string
): Promise<void> {
    const effectiveActorId = actorId || 'system'

    switch (entityType) {
        case 'lgd_configuration': {
            const { LgdConfigurationsService } = await import('./lgd-configurations.service')
            const numericEntityId = entityId ? Number(entityId) : Number(data?.id)

            switch (operation) {
                case 'create':
                    await Effect.runPromise(LgdConfigurationsService.create(data, effectiveActorId) as any)
                    return
                case 'update':
                    if (!Number.isFinite(numericEntityId)) {
                        throw new Error('Missing LGD configuration id in approval payload')
                    }
                    await Effect.runPromise(LgdConfigurationsService.update(numericEntityId, data, effectiveActorId) as any)
                    return
                case 'delete':
                    if (!Number.isFinite(numericEntityId)) {
                        throw new Error('Missing LGD configuration id in approval payload')
                    }
                    await Effect.runPromise(LgdConfigurationsService.delete(numericEntityId) as any)
                    return
            }
            return
        }

        case 'pd_configuration': {
            const { PdConfigurationsService } = await import('./pd-configurations.service')
            const numericEntityId = entityId ? Number(entityId) : Number(data?.id)

            switch (operation) {
                case 'create':
                    await Effect.runPromise(PdConfigurationsService.create(data, effectiveActorId) as any)
                    return
                case 'update':
                    if (!Number.isFinite(numericEntityId)) {
                        throw new Error('Missing PD configuration id in approval payload')
                    }
                    await Effect.runPromise(PdConfigurationsService.update(numericEntityId, data, effectiveActorId) as any)
                    return
                case 'delete':
                    if (!Number.isFinite(numericEntityId)) {
                        throw new Error('Missing PD configuration id in approval payload')
                    }
                    await Effect.runPromise(PdConfigurationsService.delete(numericEntityId) as any)
                    return
            }
            return
        }

        case 'ecl_configuration': {
            const { EclConfigurationsService } = await import('./ecl-configurations.service')
            const numericEntityId = entityId ? Number(entityId) : Number(data?.id)

            switch (operation) {
                case 'create':
                    await Effect.runPromise(EclConfigurationsService.create(data, effectiveActorId) as any)
                    return
                case 'update':
                    if (!Number.isFinite(numericEntityId)) {
                        throw new Error('Missing ECL configuration id in approval payload')
                    }
                    await Effect.runPromise(EclConfigurationsService.update(numericEntityId, data, effectiveActorId) as any)
                    return
                case 'delete':
                    if (!Number.isFinite(numericEntityId)) {
                        throw new Error('Missing ECL configuration id in approval payload')
                    }
                    await Effect.runPromise(EclConfigurationsService.delete(numericEntityId) as any)
                    return
            }
            return
        }

        case 'ead_configuration': {
            const [{ legacyDb: db }, { frs9ImpCaEadConfig }, { eq }] = await Promise.all([
                import('../config'),
                import('../db/schema'),
                import('drizzle-orm'),
            ])
            const numericEntityId = entityId ? Number(entityId) : Number(data?.id)
            const now = new Date().toISOString()

            switch (operation) {
                case 'create':
                    await db.insert(frs9ImpCaEadConfig).values({
                        eadModelName: data.model_name,
                        segmentId: data.segment_id,
                        eadMethod: data.ead_method,
                        calcMethod: data.calc_method,
                        activeFlag: data.is_active,
                        createdby: effectiveActorId,
                        createdhost: 'localhost',
                        createddate: now,
                        updatedby: effectiveActorId,
                        updatedhost: 'localhost',
                        updateddate: now,
                    } as any)
                    return
                case 'update':
                    if (!Number.isFinite(numericEntityId)) {
                        throw new Error('Missing EAD configuration id in approval payload')
                    }
                    await db
                        .update(frs9ImpCaEadConfig)
                        .set({
                            eadModelName: data.model_name,
                            segmentId: data.segment_id,
                            eadMethod: data.ead_method,
                            calcMethod: data.calc_method,
                            activeFlag: data.is_active,
                            updatedby: effectiveActorId,
                            updatedhost: 'localhost',
                            updateddate: now,
                        } as any)
                        .where(eq(frs9ImpCaEadConfig.pkid, numericEntityId))
                    return
                case 'delete':
                    if (!Number.isFinite(numericEntityId)) {
                        throw new Error('Missing EAD configuration id in approval payload')
                    }
                    await db.delete(frs9ImpCaEadConfig).where(eq(frs9ImpCaEadConfig.pkid, numericEntityId))
                    return
            }
            return
        }

        default:
            console.warn(`[ApprovalService] No configuration executor defined for entity type: ${entityType}`)
    }
}

async function executeBucketParameterAction(
    operation: 'create' | 'update' | 'delete',
    data: any,
    _tenantId: string,
    entityId?: string | null,
    actorId?: string
): Promise<void> {
    const { BucketParametersService } = await import('./bucket-parameters.service')
    const effectiveActorId = actorId || 'system'
    const isDetailScope = data?.scope === 'detail' || Boolean(entityId && entityId.startsWith('detail:'))
    const numericEntityId = parseNumericEntityId(entityId, data?.detailId ?? data?.id)

    if (isDetailScope) {
        const numericHeaderId = parseNumericEntityId(null, data?.headerId ?? data?.bucket_id)
        switch (operation) {
            case 'create':
                if (!Number.isFinite(numericHeaderId)) {
                    throw new Error('Missing bucket header id in bucket detail approval payload')
                }
                await Effect.runPromise(BucketParametersService.createDetail(numericHeaderId, data, effectiveActorId) as any)
                return
            case 'update':
                if (!Number.isFinite(numericEntityId)) {
                    throw new Error('Missing bucket detail id in approval payload')
                }
                await Effect.runPromise(BucketParametersService.updateDetail(numericEntityId, data, effectiveActorId) as any)
                return
            case 'delete':
                if (!Number.isFinite(numericEntityId)) {
                    throw new Error('Missing bucket detail id in approval payload')
                }
                await Effect.runPromise(BucketParametersService.deleteDetail(numericEntityId) as any)
                return
        }
        return
    }

    switch (operation) {
        case 'create':
            await Effect.runPromise(BucketParametersService.createHeader(data, effectiveActorId) as any)
            return
        case 'update':
            if (!Number.isFinite(numericEntityId)) {
                throw new Error('Missing bucket parameter id in approval payload')
            }
            await Effect.runPromise(BucketParametersService.updateHeader(numericEntityId, data, effectiveActorId) as any)
            return
        case 'delete':
            if (!Number.isFinite(numericEntityId)) {
                throw new Error('Missing bucket parameter id in approval payload')
            }
            await Effect.runPromise(BucketParametersService.deleteHeader(numericEntityId) as any)
            return
    }
}

async function executeRuleBaseSettingAction(
    operation: 'create' | 'update' | 'delete',
    data: any,
    _tenantId: string,
    entityId?: string | null,
    actorId?: string
): Promise<void> {
    const { RuleBaseSettingsService } = await import('./rule-base-settings.service')
    const effectiveActorId = actorId || 'system'
    const isDetailScope = data?.scope === 'detail' || Boolean(entityId && entityId.startsWith('detail:'))
    const numericEntityId = parseNumericEntityId(entityId, data?.detailId ?? data?.id)

    if (isDetailScope) {
        switch (operation) {
            case 'create':
                if (!Number.isFinite(Number(data?.ruleId))) {
                    throw new Error('Missing rule header id in rule detail approval payload')
                }
                await Effect.runPromise(RuleBaseSettingsService.createDetail(Number(data.ruleId), data, effectiveActorId) as any)
                return
            case 'update':
                if (!Number.isFinite(numericEntityId)) {
                    throw new Error('Missing rule detail id in approval payload')
                }
                await Effect.runPromise(RuleBaseSettingsService.updateDetail(numericEntityId, data, effectiveActorId) as any)
                return
            case 'delete':
                if (!Number.isFinite(numericEntityId)) {
                    throw new Error('Missing rule detail id in approval payload')
                }
                await Effect.runPromise(RuleBaseSettingsService.deleteDetail(numericEntityId) as any)
                return
        }
        return
    }

    const numericHeaderId = parseNumericEntityId(entityId, data?.id)
    switch (operation) {
        case 'create':
            await Effect.runPromise(RuleBaseSettingsService.createHeader(data, effectiveActorId) as any)
            return
        case 'update':
            if (!Number.isFinite(numericHeaderId)) {
                throw new Error('Missing rule base header id in approval payload')
            }
            await Effect.runPromise(RuleBaseSettingsService.updateHeader(numericHeaderId, data, effectiveActorId) as any)
            return
        case 'delete':
            if (!Number.isFinite(numericHeaderId)) {
                throw new Error('Missing rule base header id in approval payload')
            }
            await Effect.runPromise(RuleBaseSettingsService.deleteHeader(numericHeaderId) as any)
            return
    }
}

async function executeSegmentationAction(
    operation: 'create' | 'update' | 'delete',
    data: any,
    _tenantId: string,
    entityId?: string | null,
    actorId?: string
): Promise<void> {
    const [{ legacyDb: db }, schema, { eq }] = await Promise.all([
        import('../config'),
        import('../db/schema'),
        import('drizzle-orm'),
    ])
    const effectiveActorId = actorId || 'system'
    const now = new Date().toISOString()
    const isDetailScope = data?.scope === 'detail' || Boolean(entityId && entityId.startsWith('detail:'))
    const numericEntityId = parseNumericEntityId(entityId, data?.detail_id ?? data?.segment_id ?? data?.id)
    const { frs9ParamSegmenth, frs9ParamSegmentd } = schema

    if (isDetailScope) {
        switch (operation) {
            case 'create':
                if (!Number.isFinite(Number(data?.segment_id))) {
                    throw new Error('Missing segment header id in segmentation detail approval payload')
                }
                await db.insert(frs9ParamSegmentd).values({
                    segmentId: Number(data.segment_id),
                    queryGroup: data.query_group,
                    seq: data.seq,
                    tableName: data.table_name,
                    columnName: data.column_name,
                    dataType: data.data_type,
                    operator: data.operator,
                    value1: data.value1,
                    value2: data.value2,
                    condition: data.condition,
                    createdby: effectiveActorId,
                    createdhost: 'localhost',
                    createddate: now,
                } as any)
                return
            case 'update':
                if (!Number.isFinite(numericEntityId)) {
                    throw new Error('Missing segmentation detail id in approval payload')
                }
                await db.update(frs9ParamSegmentd)
                    .set({
                        queryGroup: data.query_group,
                        seq: data.seq,
                        tableName: data.table_name,
                        columnName: data.column_name,
                        dataType: data.data_type,
                        operator: data.operator,
                        value1: data.value1,
                        value2: data.value2,
                        condition: data.condition,
                        updatedby: effectiveActorId,
                        updateddate: now,
                        updatedhost: 'localhost',
                    } as any)
                    .where(eq(frs9ParamSegmentd.pkid, numericEntityId))
                return
            case 'delete':
                if (!Number.isFinite(numericEntityId)) {
                    throw new Error('Missing segmentation detail id in approval payload')
                }
                await db.delete(frs9ParamSegmentd).where(eq(frs9ParamSegmentd.pkid, numericEntityId))
                return
        }
        return
    }

    const numericHeaderId = parseNumericEntityId(entityId, data?.id)
    switch (operation) {
        case 'create':
            await db.transaction(async (tx) => {
                const [header] = await tx.insert(frs9ParamSegmenth).values({
                    groupSegment: data.group_segment,
                    segment: data.segment,
                    subSegment: data.sub_segment,
                    segmentType: data.segment_type,
                    seq: data.seq,
                    activeFlag: data.active_flag,
                    createdby: data.createdby || effectiveActorId,
                    createdhost: 'localhost',
                    createddate: now,
                } as any).returning({ id: frs9ParamSegmenth.pkid })

                if (Array.isArray(data.rules) && data.rules.length > 0) {
                    await tx.insert(frs9ParamSegmentd).values(
                        data.rules.map((rule: any) => ({
                            segmentId: header.id,
                            queryGroup: rule.query_group,
                            seq: rule.seq,
                            tableName: rule.table_name,
                            columnName: rule.column_name,
                            dataType: rule.data_type,
                            operator: rule.operator,
                            value1: rule.value1,
                            value2: rule.value2,
                            condition: rule.condition,
                            createdby: effectiveActorId,
                            createdhost: 'localhost',
                            createddate: now,
                        }))
                    )
                }
            })
            return
        case 'update':
            if (!Number.isFinite(numericHeaderId)) {
                throw new Error('Missing segmentation header id in approval payload')
            }
            await db.transaction(async (tx) => {
                await tx.update(frs9ParamSegmenth)
                    .set({
                        groupSegment: data.group_segment,
                        segment: data.segment,
                        subSegment: data.sub_segment,
                        segmentType: data.segment_type,
                        seq: data.seq,
                        activeFlag: data.active_flag,
                        updatedby: effectiveActorId,
                        updateddate: now,
                        updatedhost: 'localhost',
                    } as any)
                    .where(eq(frs9ParamSegmenth.pkid, numericHeaderId))

                if (Array.isArray(data.rules)) {
                    await tx.delete(frs9ParamSegmentd).where(eq(frs9ParamSegmentd.segmentId, numericHeaderId))
                    if (data.rules.length > 0) {
                        await tx.insert(frs9ParamSegmentd).values(
                            data.rules.map((rule: any) => ({
                                segmentId: numericHeaderId,
                                queryGroup: rule.query_group,
                                seq: rule.seq,
                                tableName: rule.table_name,
                                columnName: rule.column_name,
                                dataType: rule.data_type,
                                operator: rule.operator,
                                value1: rule.value1,
                                value2: rule.value2,
                                condition: rule.condition,
                                createdby: effectiveActorId,
                                createdhost: 'localhost',
                                createddate: now,
                                updatedby: effectiveActorId,
                                updateddate: now,
                                updatedhost: 'localhost',
                            }))
                        )
                    }
                }
            })
            return
        case 'delete':
            if (!Number.isFinite(numericHeaderId)) {
                throw new Error('Missing segmentation header id in approval payload')
            }
            await db.transaction(async (tx) => {
                await tx.delete(frs9ParamSegmentd).where(eq(frs9ParamSegmentd.segmentId, numericHeaderId))
                await tx.delete(frs9ParamSegmenth).where(eq(frs9ParamSegmenth.pkid, numericHeaderId))
            })
            return
    }
}

async function executeFlScalarAction(
    operation: 'create' | 'update' | 'delete',
    data: any,
    _tenantId: string,
    entityId?: string | null,
    actorId?: string
): Promise<void> {
    const [{ legacyDb: db }, schema, { eq }] = await Promise.all([
        import('../config'),
        import('../db/schema'),
        import('drizzle-orm'),
    ])
    const effectiveActorId = actorId || 'system'
    const now = new Date().toISOString()
    const numericEntityId = parseNumericEntityId(entityId, data?.id)
    const { frs9ImpCaFlScalarh, frs9ImpCaFlScalard } = schema

    switch (operation) {
        case 'create':
            await db.transaction(async (tx) => {
                const [header] = await tx.insert(frs9ImpCaFlScalarh).values({
                    scalarName: data.scalar_name,
                    activeFlag: data.active_flag,
                    createdby: effectiveActorId,
                    createdhost: 'localhost',
                    createddate: now,
                    updatedby: effectiveActorId,
                    updatedhost: 'localhost',
                    updateddate: now,
                } as any).returning()

                if (Array.isArray(data.details) && data.details.length > 0) {
                    await tx.insert(frs9ImpCaFlScalard).values(
                        data.details.map((detail: any) => ({
                            scalarId: header.pkid,
                            period: detail.period,
                            weightedScalar: detail.weighted_scalar,
                            createdby: effectiveActorId,
                            createdhost: 'localhost',
                            createddate: now,
                            updatedby: effectiveActorId,
                            updatedhost: 'localhost',
                            updateddate: now,
                        }))
                    )
                }
            })
            return
        case 'update':
            if (!Number.isFinite(numericEntityId)) {
                throw new Error('Missing FL scalar id in approval payload')
            }
            await db.transaction(async (tx) => {
                const [header] = await tx.update(frs9ImpCaFlScalarh)
                    .set({
                        scalarName: data.scalar_name,
                        activeFlag: data.active_flag,
                        updatedby: effectiveActorId,
                        updateddate: now,
                        updatedhost: 'localhost',
                    } as any)
                    .where(eq(frs9ImpCaFlScalarh.pkid, numericEntityId))
                    .returning()

                if (!header) {
                    throw new Error('FL Scalar not found')
                }

                await tx.delete(frs9ImpCaFlScalard).where(eq(frs9ImpCaFlScalard.scalarId, numericEntityId))
                if (Array.isArray(data.details) && data.details.length > 0) {
                    await tx.insert(frs9ImpCaFlScalard).values(
                        data.details.map((detail: any) => ({
                            scalarId: numericEntityId,
                            period: detail.period,
                            weightedScalar: detail.weighted_scalar,
                            createdby: effectiveActorId,
                            createdhost: 'localhost',
                            createddate: now,
                            updatedby: effectiveActorId,
                            updatedhost: 'localhost',
                            updateddate: now,
                        }))
                    )
                }
            })
            return
        case 'delete':
            if (!Number.isFinite(numericEntityId)) {
                throw new Error('Missing FL scalar id in approval payload')
            }
            await db.transaction(async (tx) => {
                await tx.delete(frs9ImpCaFlScalard).where(eq(frs9ImpCaFlScalard.scalarId, numericEntityId))
                await tx.delete(frs9ImpCaFlScalarh).where(eq(frs9ImpCaFlScalarh.pkid, numericEntityId))
            })
            return
    }
}

async function executeProductParameterAction(
    operation: 'create' | 'update' | 'delete',
    data: any,
    _tenantId: string,
    entityId?: string | null,
    actorId?: string
): Promise<void> {
    const { ProductParametersService } = await import('./product-parameters.service')
    const effectiveActorId = actorId || 'system'
    const numericEntityId = parseNumericEntityId(entityId, data?.id)

    switch (operation) {
        case 'create':
            await Effect.runPromise(ProductParametersService.create(data, effectiveActorId) as any)
            return
        case 'update':
            if (!Number.isFinite(numericEntityId)) {
                throw new Error('Missing product parameter id in approval payload')
            }
            await Effect.runPromise(ProductParametersService.update(numericEntityId, data, effectiveActorId) as any)
            return
        case 'delete':
            if (!Number.isFinite(numericEntityId)) {
                throw new Error('Missing product parameter id in approval payload')
            }
            await Effect.runPromise(ProductParametersService.delete(numericEntityId) as any)
            return
    }
}

async function executeJournalParameterAction(
    operation: 'create' | 'update' | 'delete',
    data: any,
    _tenantId: string,
    entityId?: string | null,
    actorId?: string
): Promise<void> {
    const { JournalParametersService } = await import('./journal-parameters.service')
    const effectiveActorId = actorId || 'system'
    const numericEntityId = parseNumericEntityId(entityId, data?.id)

    switch (operation) {
        case 'create':
            await Effect.runPromise(JournalParametersService.create(data, effectiveActorId) as any)
            return
        case 'update':
            if (!Number.isFinite(numericEntityId)) {
                throw new Error('Missing journal parameter id in approval payload')
            }
            await Effect.runPromise(JournalParametersService.update(numericEntityId, data, effectiveActorId) as any)
            return
        case 'delete':
            if (!Number.isFinite(numericEntityId)) {
                throw new Error('Missing journal parameter id in approval payload')
            }
            await Effect.runPromise(JournalParametersService.delete(numericEntityId) as any)
            return
    }
}

async function executeIndividualImpairmentV2Action(
    operation: 'create' | 'update' | 'delete',
    requestData: any,
    data: any,
    tenantId: string,
    actorId?: string
): Promise<void> {
    const subtype = String(requestData?.subtype || '').trim()

    if (subtype !== INDIVIDUAL_IMPAIRMENT_V2_SUBTYPES.OVERRIDE) {
        console.warn(`[ApprovalService] Unsupported individual impairment v2 subtype: ${subtype || '(empty)'}`)
        return
    }

    if (operation !== 'create' && operation !== 'update') {
        console.warn(`[ApprovalService] Unsupported individual impairment v2 operation: ${operation}`)
        return
    }

    const { individualImpairmentV2Service } = await import('./individual-impairment-v2.service')
    const effectiveActorId = actorId || data?.requestedBy || data?.createdBy || 'system'

    await individualImpairmentV2Service.createOverride({
        ...data,
        tenantId,
        requestedBy: effectiveActorId,
        createdBy: effectiveActorId,
        status: data?.status || 'PENDING',
    })
}

async function executeIndividualAssessmentConsolidatedAction(
    operation: string,
    requestData: any,
    data: any,
    tenantId: string,
    approvedBy: string
) {
    const { individualImpairmentService } = await import('./individual-impairment.service')
    const accountId = Number(requestData.accountId)
    if (!accountId) throw new Error('Missing accountId in consolidated assessment approval')

    // 1. Apply the staged data to operational tables
    await individualImpairmentService.applyConsolidatedAssessment(accountId, requestData, approvedBy)

    // 2. Mark the assessment as APPROVED
    const justification = requestData.justification || 'Consolidated Assessment Approved'
    await individualImpairmentService.approveAssessment(accountId, justification, approvedBy)
}

/**
 * Execute role-permission updates after approval.
 */
async function executeRolePermissionAction(
    operation: 'create' | 'update' | 'delete',
    data: any,
    tenantId: string
): Promise<void> {
    if (operation !== 'update') {
        console.warn(`[ApprovalService] Unsupported role permission operation: ${operation}`)
        return
    }

    const roleId = data?.roleId || data?.id || data?.entityId
    if (!roleId || typeof roleId !== 'string') {
        throw new Error('Missing roleId in role permission approval payload')
    }

    const { getAvailablePermissions, updateRolePermissions } = await import('./rbac.service')

    const availablePermissions = await Effect.runPromise(getAvailablePermissions(tenantId))
    const permissionLookup = new Map<string, string>()
    for (const permission of availablePermissions as any[]) {
        permissionLookup.set(permission.id, permission.id)
        permissionLookup.set(permission.code, permission.id)
    }

    const requestedPermissionsRaw = Array.isArray(data?.permissionIds)
        ? data.permissionIds
        : Array.isArray(data?.permissions)
            ? data.permissions
            : []

    const requestedPermissions: string[] = requestedPermissionsRaw.filter((entry: unknown): entry is string => typeof entry === 'string')
    const unknownPermissions = requestedPermissions.filter((entry: string) => !permissionLookup.has(entry))
    if (unknownPermissions.length > 0) {
        throw new Error(`Unknown role permissions in approval payload: ${unknownPermissions.join(', ')}`)
    }

    const resolvedPermissionIds = requestedPermissions
        .map((entry: string) => permissionLookup.get(entry))
        .filter((entry: string | undefined): entry is string => typeof entry === 'string')

    await Effect.runPromise(updateRolePermissions(roleId, resolvedPermissionIds, tenantId))
}

/**
 * Notify the completion of the entire approval process
 */
function getApprovalNotificationTitle(request: any): string {
    const requestData = request?.requestData && typeof request.requestData === 'object' ? request.requestData : {}
    const candidates = [
        request?.title,
        request?.requestTitle,
        requestData.title,
        requestData.requestTitle,
        requestData.customerName && requestData.accountNumber
            ? `${requestData.customerName} (${requestData.accountNumber})`
            : undefined,
        requestData.accountNumber ? `Account ${requestData.accountNumber}` : undefined,
        request?.entityType && request?.entityId ? `${request.entityType} ${request.entityId}` : undefined,
    ]

    const value = candidates.find((candidate) => typeof candidate === 'string' && candidate.trim().length > 0)
    return typeof value === 'string' ? value.trim() : 'Approval request'
}

async function notifyApprovalCompletion(request: any, outcome: 'approved' | 'rejected', actorUserId?: string): Promise<void> {
    const type = outcome === 'approved' ? 'APPROVAL_APPROVED' : 'APPROVAL_REJECTED'
    const severity = outcome === 'approved' ? 'success' : 'warning'
    const title = outcome === 'approved' ? 'Approval Completed' : 'Approval Rejected'
    const requestTitle = getApprovalNotificationTitle(request)

    const notification: NotificationPayload = {
        id: `approval-${request.id}-${outcome}-${Date.now()}`,
        type,
        workflowId: request.id,
        tenantId: request.tenantId,
        title,
        message: `${requestTitle} was ${outcome}.`,
        severity,
        timestamp: new Date().toISOString(),
        data: {
            requestId: request.id,
            entityType: request.entityType,
            entityId: request.entityId,
            status: outcome,
            title: requestTitle,
        },
        actionUrl: `/banking/maintenance/approval?requestId=${request.id}`,
    }

    await safeEmitNotification(request.tenantId, notification, {
        userIds: [request.requestedBy],
        roleRooms: ['CHECKER', 'APPROVER', 'SUPER_ADMIN'],
        excludeUserId: actorUserId,
    })
}

/**
 * Notify approvers at the next level
 */
async function notifyNextLevelApprovers(request: any): Promise<void> {
    const levels = resolveApprovalLevelsFromRequest(request)
    const currentLevel = levels.find((level) => level.level === request.currentLevel)
    if (!currentLevel) return

    const candidates = await findApproverCandidatesForLevel(
        request.tenantId,
        currentLevel.requiredRoleCodes,
        currentLevel.requiredPermissionCodes
    )

    const notification: NotificationPayload = {
        id: `approval-${request.id}-level-${request.currentLevel}-${Date.now()}`,
        type: 'APPROVAL_PENDING',
        workflowId: request.id,
        tenantId: request.tenantId,
        title: `Approval Needed: ${getApprovalNotificationTitle(request)}`,
        message: `Request is waiting for level ${request.currentLevel} (${currentLevel.name}) approval.`,
        severity: 'info',
        timestamp: new Date().toISOString(),
        data: {
            requestId: request.id,
            entityType: request.entityType,
            requiredRoleCodes: currentLevel.requiredRoleCodes,
            requiredPermissionCodes: currentLevel.requiredPermissionCodes,
            requiredCount: currentLevel.requiredCount,
            candidateCount: candidates.length,
        },
        actionUrl: `/banking/maintenance/approval?requestId=${request.id}`,
    }

    await safeEmitNotification(request.tenantId, notification, {
        userIds: candidates.map((candidate) => candidate.userId),
        roleRooms: buildRoleRoomsFromRequiredRoleCodes(currentLevel.requiredRoleCodes),
    })
}

/**
 * Notify a specific approver
 */
async function notifyApprover(userId: string, request: any, type: 'new' | 'delegated'): Promise<void> {
    const notification: NotificationPayload = {
        id: `approval-${request.id}-${type}-${Date.now()}`,
        type: 'APPROVAL_PENDING',
        workflowId: request.id,
        tenantId: request.tenantId,
        title: type === 'delegated' ? 'Approval Delegated To You' : 'New Approval Request',
        message: `${request.title} requires your review.`,
        severity: 'info',
        timestamp: new Date().toISOString(),
        actionUrl: `/banking/maintenance/approval?requestId=${request.id}`,
    }

    await safeEmitNotification(request.tenantId, notification, { userIds: [userId] })
}

/**
 * Notify the original requester
 */
async function notifyRequester(request: any, type: string, comment?: string): Promise<void> {
    const requestTitle = getApprovalNotificationTitle(request)
    const notification: NotificationPayload = {
        id: `approval-${request.id}-${type}-${Date.now()}`,
        type: 'APPROVAL_PENDING',
        workflowId: request.id,
        tenantId: request.tenantId,
        title: 'Approval Update',
        message: comment ? `Update on ${requestTitle}: ${comment}` : `Update on ${requestTitle}`,
        severity: 'info',
        timestamp: new Date().toISOString(),
        actionUrl: `/banking/maintenance/approval?requestId=${request.id}`,
    }

    await safeEmitNotification(request.tenantId, notification, { userIds: [request.requestedBy] })
}

// =============================================================================
// REQUEST QUERIES
// =============================================================================

/**
 * Get pending approvals for a user by checking their roles against matrix requirements.
 * 
 * @param userId - The user ID
 * @param tenantId - The tenant ID
 * @returns An Effect resolving to an array of pending requests available for the user to approve
 */
export const getPendingApprovalsForUser = (
    userId: string,
    tenantId: string
): Effect.Effect<ApprovalRequest[], DatabaseError> =>
    dbOperation('query', async () => {
        // We typically need to know user roles to filter.
        // The Service logic used to fetch userRoles manually.
        const db = getDatabase(tenantId)

        // Get user's roles using the new repository
        // We run the Effect to get the promise result since we are inside an async dbOperation block
        const userRolesData = await Effect.runPromise(
            userRolesRepository.findByUser(db, userId, tenantId)
        )

        const approverContext = buildApproverContext(userRolesData as any[])
        const canBypassRouting = isSuperAdminLevelRoutingBypassEnabled()
            && approverContext.permissions.has(SUPER_ADMIN_PERMISSION_CODE)

        // Get pending requests for this tenant
        const pending = await ApprovalRepository.findPendingRequests(tenantId)

        // Filter to requests where user can approve at current level
        return pending.filter((req: any) => {
            // Don't show requests the user already approved (strict SoD UX)
            if (hasApproverApproved(req.actions, userId)) return false

            if (canBypassRouting) return true

            const levels = resolveApprovalLevelsFromRequest(req)
            if (!levels.length) return true // No routing data, allow all

            const currentLevel = levels.find((l) => l.level === req.currentLevel)
                || levels[0]
            return matchesApprovalRequirements(
                currentLevel.requiredRoleCodes,
                currentLevel.requiredPermissionCodes,
                approverContext,
                currentLevel.roleMatchMode,
                currentLevel.permissionMatchMode
            )
        })
    })

/**
 * Get approval request by ID with full details.
 * 
 * @param requestId - The request ID
 * @returns An Effect resolving to the request with actions or NotFoundError
 */
export const getApprovalRequest = (
    requestId: string
): Effect.Effect<ApprovalRequest & { actions: ApprovalAction[] }, DatabaseError | NotFoundError> =>
    pipe(
        dbOperation('query', () =>
            ApprovalRepository.findRequestById(requestId)
        ),
        Effect.flatMap((request) =>
            request
                ? Effect.succeed(request as ApprovalRequest & { actions: ApprovalAction[] })
                : Effect.fail(new NotFoundError({ resource: 'ApprovalRequest', id: requestId }))
        )
    )

/**
 * Get approval history for an entity.
 * 
 * @param tenantId - The tenant ID
 * @param entityType - Optional entity type filter
 * @param entityId - Optional entity ID filter
 * @returns An Effect resolving to an array of approval requests
 */
export const getApprovalHistory = (
    tenantId: string,
    entityType?: string,
    entityId?: string
): Effect.Effect<ApprovalRequest[], DatabaseError> =>
    dbOperation('query', () => {
        // If entityType is provided, filter by it; otherwise get full tenant history.
        if (entityType) {
            return ApprovalRepository.findRequestsByEntity(tenantId, entityType, entityId)
        } else {
            return ApprovalRepository.findRequestsByTenant(tenantId)
        }
    })

export const getApprovalHistoryList = (
    input: {
        tenantId: string
        entityType?: string
        entityId?: string
        status?: string
        impactLevel?: string
        bankingType?: string
        currentLevel?: number
        currentLevelMin?: number
        currentLevelMax?: number
        riskLevel?: string
        requestedBy?: string
        operation?: string
        search?: string
        createdAtFrom?: Date
        createdAtTo?: Date
        limit: number
        offset: number
        sort?: { field: string; direction: 'asc' | 'desc' }
    }
): Effect.Effect<{ data: ApprovalRequest[]; total: number }, DatabaseError> =>
    dbOperation('query', () => ApprovalRepository.findRequestsList(input))

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function calculateRequiredApprovals(
    impactLevel?: string,
    matrix?: any
): number {
    const sortedLevels = getSortedLevels(matrix)
    if (sortedLevels.length > 0) {
        return sortedLevels.reduce((sum, level) => sum + Math.max(1, level.requiredCount || 1), 0)
    }

    const levels = matrix?.levels?.length ?? 2

    switch (impactLevel) {
        case 'low':
            return 1
        case 'medium':
            return Math.min(2, levels)
        case 'high':
            return Math.min(3, levels)
        case 'critical':
            return levels
        default:
            return 2
    }
}

type ApproverContext = {
    roleCodes: Set<string>
    roleNames: Set<string>
    permissions: Set<string>
}

function normalizeActor(value: string): string {
    return value.trim().toLowerCase()
}

function getSortedLevels(matrix: any): ApprovalLevel[] {
    const levels = Array.isArray(matrix?.levels) ? matrix.levels : []
    return [...levels].sort((a: ApprovalLevel, b: ApprovalLevel) => a.level - b.level)
}

function getEffectiveLevels(levels: RoutingLevel[], approvalsRequired: number | null | undefined): RoutingLevel[] {
    if (!levels.length) return []
    if (!approvalsRequired || approvalsRequired <= 0) return levels

    const effective: RoutingLevel[] = []
    let collectedRequiredApprovals = 0

    for (const level of levels) {
        effective.push(level)
        collectedRequiredApprovals += Math.max(1, level.requiredCount || 1)
        if (collectedRequiredApprovals >= approvalsRequired) break
    }

    return effective.length > 0 ? effective : [levels[0]]
}

function countApprovedActions(actions: unknown, level?: number): number {
    const list = Array.isArray(actions) ? actions : []
    return list.filter((action) =>
        action?.action === 'approve' && (typeof level === 'number' ? action?.level === level : true)
    ).length
}

function hasApproverApproved(actions: unknown, approverId: string): boolean {
    const list = Array.isArray(actions) ? actions : []
    return list.some((action) => action?.action === 'approve' && action?.approverId === approverId)
}

function hasApproverApprovedAtLevel(actions: unknown, approverId: string, level: number): boolean {
    const list = Array.isArray(actions) ? actions : []
    return list.some(
        (action) => action?.action === 'approve' && action?.approverId === approverId && action?.level === level
    )
}

function mergeActionConditions(
    originalConditions: string | undefined,
    metadata?: Record<string, unknown>
): string | undefined {
    if (!metadata || Object.keys(metadata).length === 0) return originalConditions

    const raw = typeof originalConditions === 'string' ? originalConditions.trim() : ''
    if (!raw) {
        return JSON.stringify(metadata)
    }

    try {
        const parsed = JSON.parse(raw)
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
            return JSON.stringify({
                ...(parsed as Record<string, unknown>),
                ...metadata,
            })
        }
    } catch {
        // Keep backward compatibility for free-text condition values.
    }

    return JSON.stringify({
        note: raw,
        ...metadata,
    })
}

function hasExecutableApprovalPayload(request: any): boolean {
    const requestData = request?.requestData
    if (!requestData || typeof requestData !== 'object') return false

    const operation = String((requestData as any).operation || '').trim().toLowerCase()
    if (!['create', 'update', 'delete'].includes(operation)) return false

    const payload = (requestData as any).data
    return Boolean(payload && typeof payload === 'object')
}

async function shouldAutoApproveCreatedRequest(request: any, input: CreateApprovalRequestInput): Promise<boolean> {
    if (!isSuperAdminAutoApproveOnCreateEnabled()) return false
    
    const normalizedEntityType = String(request?.entityType || '').trim().toLowerCase()

    // EXEMPT Individual Impairment from Auto-Approval - Must always have a manual Checker review
    if (normalizedEntityType === INDIVIDUAL_ASSESSMENT_CONSOLIDATED_ENTITY_TYPE.toLowerCase() ||
        normalizedEntityType === INDIVIDUAL_IMPAIRMENT_V2_ENTITY_TYPE.toLowerCase()) {
        return false
    }

    if (!request || request.status !== 'pending') return false
    if (!hasExecutableApprovalPayload(request)) return false

    const requesterContext = await loadApproverContext(input.requestedBy, input.tenantId)
    return requesterContext.permissions.has(SUPER_ADMIN_PERMISSION_CODE)
}

async function autoApproveCreatedRequest(request: any, approverId: string): Promise<any> {
    const approvalsRequired = Math.max(1, Number(request?.approvalsRequired || 1))
    const now = new Date()
    const metadata = {
        autoApproved: true,
        trigger: 'request_create',
        policy: SUPERADMIN_AUTO_APPROVE_REQUESTS_ENV,
        forcedCompletion: true,
        originalApprovalsRequired: approvalsRequired,
    }

    await ApprovalRepository.createAction({
        requestId: String(request.id),
        approverId,
        approverRole: 'SUPER_ADMIN_AUTO',
        level: Number(request?.currentLevel || 1),
        action: 'approve',
        comment: 'Auto-approved on request creation by super admin policy',
        conditions: mergeActionConditions(undefined, metadata),
    })

    await ApprovalRepository.updateRequest(String(request.id), {
        approvalsReceived: approvalsRequired,
        status: 'approved',
        completedAt: now,
        completedBy: approverId,
    })

    const finalized = await ApprovalRepository.findRequestById(String(request.id))
    if (finalized) {
        await executeApprovedAction(finalized, approverId)
        await notifyApprovalCompletion(finalized, 'approved', approverId)
        return finalized
    }

    return {
        ...request,
        approvalsReceived: approvalsRequired,
        status: 'approved',
        completedAt: now,
        completedBy: approverId,
    }
}

function buildApproverContext(userRolesData: any[]): ApproverContext {
    const roleCodes = new Set<string>()
    const roleNames = new Set<string>()
    const permissions = new Set<string>()

    for (const userRole of userRolesData) {
        const roleCode = typeof userRole?.role?.roleCode === 'string' ? normalizeActor(userRole.role.roleCode) : null
        const roleName = typeof userRole?.role?.roleName === 'string' ? normalizeActor(userRole.role.roleName) : null
        if (roleCode) roleCodes.add(roleCode)
        if (roleName) roleNames.add(roleName)

        const rolePermissions = Array.isArray(userRole?.role?.rolePermissions) ? userRole.role.rolePermissions : []
        for (const rolePermission of rolePermissions) {
            if (typeof rolePermission?.permission?.code === 'string') {
                permissions.add(normalizeActor(rolePermission.permission.code))
            }
        }
    }

    return { roleCodes, roleNames, permissions }
}

function normalizeStringArray(input: unknown): string[] {
    if (!Array.isArray(input)) return []
    return input
        .filter((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0)
        .map((entry) => entry.trim())
}

function splitLegacyRequiredRoles(requiredRoles: string[]): {
    roleCodes: string[]
    permissionCodes: string[]
} {
    const roleCodes: string[] = []
    const permissionCodes: string[] = []

    for (const entry of requiredRoles) {
        // Legacy payload stored both role codes and permission codes in one list.
        if (entry.includes('.')) {
            permissionCodes.push(entry)
        } else {
            roleCodes.push(entry)
        }
    }

    return { roleCodes, permissionCodes }
}

function hasMatchingRole(requiredRoleCodes: string[], context: ApproverContext, mode: 'ANY' | 'ALL' = 'ANY'): boolean {
    if (!requiredRoleCodes.length) return true
    const normalized = requiredRoleCodes.map(normalizeActor)
    if (mode === 'ALL') {
        return normalized.every((required) => context.roleCodes.has(required) || context.roleNames.has(required))
    }
    return normalized.some((required) => context.roleCodes.has(required) || context.roleNames.has(required))
}

function hasMatchingPermission(
    requiredPermissionCodes: string[],
    context: ApproverContext,
    mode: 'ANY' | 'ALL' = 'ANY'
): boolean {
    if (!requiredPermissionCodes.length) return true
    const normalized = requiredPermissionCodes.map(normalizeActor)
    if (mode === 'ALL') {
        return normalized.every((required) => context.permissions.has(required))
    }
    return normalized.some((required) => context.permissions.has(required))
}

function matchesApprovalRequirements(
    requiredRoleCodes: string[],
    requiredPermissionCodes: string[],
    context: ApproverContext,
    roleMatchMode: 'ANY' | 'ALL' = 'ANY',
    permissionMatchMode: 'ANY' | 'ALL' = 'ANY'
): boolean {
    return hasMatchingRole(requiredRoleCodes, context, roleMatchMode)
        && hasMatchingPermission(requiredPermissionCodes, context, permissionMatchMode)
}

type RoutingLevel = {
    level: number
    name: string
    requiredRoleCodes: string[]
    requiredPermissionCodes: string[]
    roleMatchMode: 'ANY' | 'ALL'
    permissionMatchMode: 'ANY' | 'ALL'
    requiredCount: number
    timeoutHours?: number
}

function normalizeRoutingLevels(levels: unknown): RoutingLevel[] {
    if (!Array.isArray(levels)) return []
    const normalizedLevels = levels
        .map((level: any): RoutingLevel | null => {
            const levelNumber = Number(level?.level)
            if (!Number.isFinite(levelNumber) || levelNumber <= 0) return null

            const explicitRoleCodes = normalizeStringArray(level?.requiredRoleCodes)
            const explicitPermissionCodes = normalizeStringArray(level?.requiredPermissionCodes)
            const legacyRequirements = splitLegacyRequiredRoles(normalizeStringArray(level?.requiredRoles))

            const requiredRoleCodes = explicitRoleCodes.length > 0
                ? explicitRoleCodes
                : legacyRequirements.roleCodes

            const requiredPermissionCodes = explicitPermissionCodes.length > 0
                ? explicitPermissionCodes
                : legacyRequirements.permissionCodes

            const roleMatchMode = String(level?.roleMatchMode || 'ANY').toUpperCase() === 'ALL' ? 'ALL' : 'ANY'
            const permissionMatchMode = String(level?.permissionMatchMode || 'ANY').toUpperCase() === 'ALL' ? 'ALL' : 'ANY'

            const normalizedPermissionCodes = requiredPermissionCodes.length > 0
                ? requiredPermissionCodes
                : ['approval.requests.approve']

            return {
                level: levelNumber,
                name: String(level?.name || `Level ${levelNumber}`),
                requiredRoleCodes,
                requiredPermissionCodes: normalizedPermissionCodes,
                roleMatchMode,
                permissionMatchMode,
                requiredCount: Math.max(1, Number(level?.requiredCount || 1)),
                timeoutHours: level?.timeoutHours ? Number(level.timeoutHours) : undefined,
            }
        })
        .filter((level): level is RoutingLevel => level !== null)
        .sort((a, b) => a.level - b.level)

    return normalizedLevels
}

function resolveApprovalLevelsFromRequest(request: any): RoutingLevel[] {
    const matrixLevels = normalizeRoutingLevels(getSortedLevels(request?.matrix))
    if (matrixLevels.length > 0) {
        return matrixLevels
    }

    const requestLevels = normalizeRoutingLevels((request?.requestData as any)?.approvalRouting?.levels)
    if (requestLevels.length > 0) {
        return requestLevels
    }

    return []
}

function buildRoleRoomsFromRequiredRoleCodes(requiredRoleCodes: unknown): string[] {
    const normalized = Array.isArray(requiredRoleCodes)
        ? requiredRoleCodes
            .filter((entry): entry is string => typeof entry === 'string')
            .map((entry) => entry.trim().toUpperCase())
            .filter(Boolean)
        : []

    if (normalized.length > 0) {
        return Array.from(new Set(normalized))
    }

    return ['CHECKER', 'APPROVER', 'SUPER_ADMIN']
}

const resolveNotificationSeverity = (severity: string): 'info' | 'warning' | 'success' | 'error' => {
    if (severity === 'warning' || severity === 'success' || severity === 'error') {
        return severity
    }
    return 'info'
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

async function persistNotificationRecord(
    tenantId: string,
    notification: NotificationPayload,
    options: {
        roleRooms: string[]
        userIds: string[]
        excludeUserId?: string
    },
    deliveryStatus: 'pending' | 'sent' | 'failed' | 'read',
    errorMessage?: string
): Promise<void> {
    const roleCandidateUserIds = options.roleRooms.length > 0
        ? (
            await findApproverCandidatesForLevel(
                tenantId,
                options.roleRooms,
                ['approval.requests.approve', 'approval.all', 'admin.super_admin']
            )
        ).map((candidate) => candidate.userId)
        : []

    const userTargets = Array.from(new Set([
        ...options.userIds,
        ...roleCandidateUserIds,
    ])).filter((userId) => userId !== options.excludeUserId)

    await Effect.runPromise(createNotification({
        tenantId,
        approvalRequestId: typeof notification.workflowId === 'string' && UUID_PATTERN.test(notification.workflowId)
            ? notification.workflowId
            : undefined,
        workflowId: notification.workflowId,
        type: notification.type,
        severity: resolveNotificationSeverity(notification.severity),
        title: notification.title,
        message: notification.message,
        actionUrl: notification.actionUrl,
        entityType: typeof notification.data?.entityType === 'string' ? notification.data.entityType : undefined,
        entityId: typeof notification.data?.entityId === 'string' ? notification.data.entityId : undefined,
        source: 'approval_service',
        metadata: notification.data,
        userTargets,
        roleTargets: options.roleRooms,
        channel: 'socket',
        deliveryStatus,
        deliveredAt: new Date(),
        errorMessage,
    }))
}

async function safeEmitNotification(
    tenantId: string,
    notification: NotificationPayload,
    options?: {
        roleRooms?: string[]
        userIds?: string[]
        excludeUserId?: string
    }
): Promise<void> {
    const roleRooms = Array.isArray(options?.roleRooms)
        ? options!.roleRooms!.filter((room): room is string => typeof room === 'string' && room.trim().length > 0)
        : []
    const userIds = Array.isArray(options?.userIds)
        ? options!.userIds!.filter((userId): userId is string => typeof userId === 'string' && userId.trim().length > 0)
        : []
    const excludeUserId = typeof options?.excludeUserId === 'string' && options.excludeUserId.trim().length > 0
        ? options.excludeUserId.trim()
        : undefined
    let resolvedUserIds = userIds

    try {
        const socket = getNotificationSocket()
        const notificationCategory = deriveNotificationCategory(notification.type)
        const notificationWithCategory: NotificationPayload = {
            ...notification,
            category: notificationCategory,
        }

        const roleCandidateUserIds = roleRooms.length > 0
            ? (
                await findApproverCandidatesForLevel(
                    tenantId,
                    roleRooms,
                    ['approval.requests.approve', 'approval.all', 'admin.super_admin']
                )
            ).map((candidate) => candidate.userId)
            : []

        const hasExplicitTargets = roleRooms.length > 0 || userIds.length > 0
        const targetUserIds = Array.from(new Set([...userIds, ...roleCandidateUserIds]))
            .filter((userId) => userId !== excludeUserId)

        const eligibleUserIds = await filterNotificationRecipientsByPreferences({
            tenantId,
            userIds: targetUserIds,
            category: notificationCategory,
            now: new Date(),
        })
        resolvedUserIds = eligibleUserIds

        if (eligibleUserIds.length > 0) {
            socket.broadcastApprovalNotificationToUsers(tenantId, notificationWithCategory, eligibleUserIds)
        } else if (!hasExplicitTargets) {
            // Fallback broadcast only when there are no explicit targets.
            socket.broadcastApprovalNotification(tenantId, notificationWithCategory)
        } else {
            return
        }

        await persistNotificationRecord(
            tenantId,
            notificationWithCategory,
            { roleRooms: [], userIds: eligibleUserIds, excludeUserId },
            'sent'
        )
    } catch (error) {
        try {
            await persistNotificationRecord(
                tenantId,
                notification,
                { roleRooms: [], userIds: resolvedUserIds, excludeUserId },
                'failed',
                error instanceof Error ? error.message : String(error)
            )
        } catch (persistError) {
            console.warn('[ApprovalService] Failed to persist notification record:', persistError)
        }
        // Socket may not be initialized in test/runtime contexts.
        console.warn('[ApprovalService] Notification socket unavailable:', error)
    }
}

async function findApproverCandidatesForLevel(
    tenantId: string,
    requiredRoleCodes: string[],
    requiredPermissionCodes: string[],
    roleMatchMode: 'ANY' | 'ALL' = 'ANY',
    permissionMatchMode: 'ANY' | 'ALL' = 'ANY',
    options?: { department?: string }
): Promise<ApprovalRoutingCandidate[]> {
    const db = getDatabase(tenantId)
    const now = new Date()
    const assignments = await db.query.userRoles.findMany({
        where: and(
            eq(userRoles.tenantId, tenantId),
            eq(userRoles.isActive, true),
            or(isNull(userRoles.validFrom), lte(userRoles.validFrom, now))!,
            or(isNull(userRoles.validUntil), gte(userRoles.validUntil, now))!,
        ),
        with: {
            user: true,
            role: {
                with: {
                    rolePermissions: {
                        with: {
                            permission: true,
                        },
                    },
                },
            },
        },
    })

    const assignmentByUser = new Map<string, any[]>()
    for (const assignment of assignments as any[]) {
        const userId = assignment?.user?.id
        if (!userId) continue
        if (!assignment?.user?.isActive) continue

        if (options?.department) {
            const expected = options.department.trim().toLowerCase()
            const actual = String(assignment?.user?.department || '').trim().toLowerCase()
            if (!expected || actual !== expected) continue
        }

        if (!assignmentByUser.has(userId)) {
            assignmentByUser.set(userId, [])
        }
        assignmentByUser.get(userId)!.push(assignment)
    }

    const candidates: ApprovalRoutingCandidate[] = []
    for (const [userId, rows] of assignmentByUser.entries()) {
        const context = buildApproverContext(rows)
        if (
            !matchesApprovalRequirements(
                requiredRoleCodes,
                requiredPermissionCodes,
                context,
                roleMatchMode,
                permissionMatchMode
            )
        ) {
            continue
        }

        const user = rows[0]?.user
        const roleCodes = Array.from(context.roleCodes.values()).sort()
        candidates.push({
            userId,
            fullName: String(user?.fullName || 'Unknown User'),
            email: String(user?.email || ''),
            department: user?.department ?? null,
            position: user?.position ?? null,
            roleCodes,
        })
    }

    return candidates.sort((a, b) => a.fullName.localeCompare(b.fullName))
}

/**
 * Get matrix/routing overview and potential approvers for each level.
 * Use this in UI so users know exactly who should review a request.
 */
export const getApprovalRoutingOverview = (input: {
    tenantId: string
    entityType?: string
    operation?: 'create' | 'update' | 'delete'
    department?: string
    bankingMode?: string
}): Effect.Effect<ApprovalRoutingOverview[], DatabaseError> =>
    dbOperation('query', async () => {
        const { tenantId, entityType, operation, department, bankingMode } = input
        const matrices = entityType
            ? [await ApprovalRepository.findMatrixByEntityType(tenantId, entityType, bankingMode)]
            : await ApprovalRepository.findMatricesByTenant(tenantId)

        const filteredMatrices = matrices.filter((matrix): matrix is NonNullable<typeof matrix> => {
            if (!matrix) return false
            if (!operation) return true

            const operationTypes = String(matrix.operationType || '')
                .split(',')
                .map((value) => value.trim().toLowerCase())
                .filter(Boolean)

            if (!operationTypes.length) return true
            return operationTypes.includes(operation.toLowerCase())
        })

        if (!filteredMatrices.length && entityType) {
            const fallbackLevels = buildDefaultFourEyesRouting(entityType)
            const levels = await Promise.all(fallbackLevels.map(async (level) => {
                const candidates = await findApproverCandidatesForLevel(
                    tenantId,
                    level.requiredRoleCodes,
                    level.requiredPermissionCodes,
                    level.roleMatchMode,
                    level.permissionMatchMode,
                    { department }
                )
                return {
                    level: level.level,
                    name: level.name,
                    requiredRoleCodes: level.requiredRoleCodes,
                    requiredPermissionCodes: level.requiredPermissionCodes,
                    requiredCount: level.requiredCount,
                    timeoutHours: level.timeoutHours,
                    candidateCount: candidates.length,
                    candidates,
                }
            }))

            return [{
                entityType,
                operationType: operation || 'create,update,delete',
                matrixId: null,
                matrixName: 'Strict 4-Eyes Fallback',
                isActive: true,
                levels,
            }]
        }

        const overview: ApprovalRoutingOverview[] = []
        for (const matrix of filteredMatrices) {
            const levels = normalizeRoutingLevels(matrix.levels || [])
            const enrichedLevels: ApprovalRoutingLevelOverview[] = await Promise.all(
                levels.map(async (level) => {
                    const candidates = await findApproverCandidatesForLevel(
                        tenantId,
                        level.requiredRoleCodes,
                        level.requiredPermissionCodes,
                        level.roleMatchMode,
                        level.permissionMatchMode,
                        { department }
                    )
                    return {
                        ...level,
                        candidateCount: candidates.length,
                        candidates,
                    }
                })
            )

            overview.push({
                entityType: matrix.entityType,
                operationType: matrix.operationType || 'create,update,delete',
                matrixId: matrix.id,
                matrixName: matrix.name,
                isActive: Boolean(matrix.isActive),
                levels: enrichedLevels,
            })
        }

        return overview
    })

async function loadApproverContext(approverId: string, tenantId: string): Promise<ApproverContext> {
    const db = getDatabase(tenantId)
    const userRolesData = await Effect.runPromise(
        userRolesRepository.findByUser(db, approverId, tenantId)
    )
    return buildApproverContext(userRolesData as any[])
}


// --------------------------------------------------------------------------------
// R-Analytics Comprehensive Action Executor
// --------------------------------------------------------------------------------
async function executeRAnalyticsComprehensiveAction(
    operation: string,
    requestData: any,
    status: 'APPROVED' | 'REJECTED'
) {
    console.log(`[ApprovalService] Executing RAnalyticsComprehensiveAction with status ${status}`)
    
    let parsedData = requestData;
    if (typeof requestData === 'string') {
        try {
            parsedData = JSON.parse(requestData);
        } catch (e) {
            console.error('[ApprovalService] Failed to parse requestData string', e);
        }
    }
    const data = parsedData?.data ?? parsedData;

    console.log(`[ApprovalService] Extracted data for r_analytics_comprehensive:`, JSON.stringify(data));

    if (!data || !data.id) {
        console.warn('[ApprovalService] No ID provided for r_analytics_comprehensive')
        return
    }

    try {
        const [{ legacyDb: db }, schema, { eq }] = await Promise.all([
            import('../config'),
            import('../db/schema'),
            import('drizzle-orm')
        ])

        // Update frs9_r_pd_afl model_status based on Approval Result
        await db.update(schema.frs9RPdAfl)
            .set({ modelStatus: status })
            .where(eq(schema.frs9RPdAfl.id, Number(data.id)))

        console.log(`[ApprovalService] Successfully updated frs9_r_pd_afl ID ${data.id} to ${status}`)
    } catch (error) {
        console.error('[ApprovalService] Failed to update frs9_r_pd_afl:', error)
        // We shouldn't throw here if we want the main approval to succeed even if legacy sync fails,
        // but for now let's just log it.
    }
}
