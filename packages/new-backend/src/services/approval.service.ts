import { Effect, pipe } from 'effect'
import { ApprovalRepository } from '@/repositories/approval.repository'
import {
    type NewApprovalMatrix,
    type NewApprovalLevel,
    type ApprovalRequest,
    type ApprovalAction,
    type ApprovalLevel,
} from '@/db/schema'
import { ConflictError, DatabaseError, NotFoundError, BusinessError } from '@/lib/errors'
import { dbOperation } from '@/lib/effect'
import { userRolesRepository } from '@/repositories/rbac.repository'
import { getDatabase } from '@/config/database'

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

export interface CancelApprovalRequestInput {
    requestId: string
    cancelledBy: string
    isSystemUser?: boolean
    reason?: string
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
            })

            if (existingPending) {
                throw new ConflictError({
                    message: 'A similar approval request is already pending',
                    resource: 'approval_request',
                    field: input.entityId ? 'entity_id' : 'title',
                    value: input.entityId ?? input.title,
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

            return ApprovalRepository.createRequest({
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
            })
        },
        catch: (error) => {
            if (error instanceof ConflictError) {
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
 * Process an approval action (approve, reject, request_info, delegate).
 * 
 * @param input - The action input data
 * @returns An Effect resolving to the completion status
 * @throws NotFoundError if request not found
 * @throws BusinessError if request is not pending or other business rule violations
 */
export const processApprovalAction = (
    input: ProcessApprovalInput
): Effect.Effect<{ completed: boolean; status: string }, DatabaseError | NotFoundError | BusinessError> =>
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

            // Prevent users from approving their own requests
            if (input.action === 'approve' && input.approverId === request.requestedBy) {
                throw new BusinessError({
                    message: 'You cannot approve your own request',
                    code: 'SELF_APPROVAL_NOT_ALLOWED',
                })
            }

            // Insert the action
            await ApprovalRepository.createAction({
                requestId: input.requestId,
                approverId: input.approverId,
                approverRole: input.approverRole,
                level: request.currentLevel,
                action: input.action,
                comment: input.comment,
                conditions: input.conditions,
                delegatedTo: input.delegatedTo,
                riskScore: input.riskScore,
            })

            // Handle based on action type
            if (input.action === 'approve') {
                const newReceived = (request.approvalsReceived || 0) + 1
                const isComplete = newReceived >= request.approvalsRequired

                await ApprovalRepository.updateRequest(input.requestId, {
                    approvalsReceived: newReceived,
                    status: isComplete ? 'approved' : 'pending',
                    currentLevel: isComplete ? request.currentLevel : request.currentLevel + 1,
                    completedAt: isComplete ? new Date() : null,
                    completedBy: isComplete ? input.approverId : null,
                })

                if (isComplete) {
                    // Execute the approved action (e.g., create user, update config)
                    await executeApprovedAction(request)
                    await notifyApprovalCompletion(request, 'approved')
                } else {
                    // Progress to next level notification
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

                await notifyApprovalCompletion(request, 'rejected')
                return { completed: true, status: 'rejected' }
            }

            if (input.action === 'request_info') {
                // Logic to notify requester for more info
                await notifyRequester(request, 'info_requested', input.comment)
                return { completed: false, status: 'pending' }
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
async function executeApprovedAction(request: any): Promise<void> {
    console.log(`[ApprovalService] Executing approved action for ${request.entityType}:${request.entityId}`)

    const requestData = request.requestData as any
    if (!requestData || !requestData.operation) {
        console.error('[ApprovalService] Invalid request data structure')
        return
    }

    const { operation, entityType, data } = requestData
    const tenantId = request.tenantId

    try {
        // Map entity types to their service executors
        switch (entityType) {
            case 'user':
                await executeUserAction(operation, data, tenantId)
                break

            case 'parameter':
            case 'app_setting':
            case 'business_setting':
                await executeParameterAction(operation, data, tenantId, entityType)
                break

            case 'pd_configuration':
            case 'lgd_configuration':
            case 'ead_configuration':
            case 'ecl_configuration':
                await executeConfigurationAction(operation, data, tenantId, entityType)
                break

            case 'role_permission':
            case 'role_permissions':
                await executeRolePermissionAction(operation, data, tenantId)
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
 * Execute parameter-related actions
 */
async function executeParameterAction(
    operation: 'create' | 'update' | 'delete',
    data: any,
    _tenantId: string,
    _entityType: string
): Promise<void> {
    const { ParametersService } = await import('./parameters.service')

    switch (operation) {
        case 'create':
            await Effect.runPromise(ParametersService.createAppSetting(data, 'system') as any)
            break
        case 'update':
            await Effect.runPromise(ParametersService.updateAppSetting(data.paramCode, data, 'system') as any)
            break
        case 'delete':
            await Effect.runPromise(ParametersService.deleteAppSetting(data.paramCode) as any)
            break
    }
}

/**
 * Execute configuration-related actions
 */
async function executeConfigurationAction(
    operation: 'create' | 'update' | 'delete',
    data: any,
    tenantId: string,
    entityType: string
): Promise<void> {
    // Configuration services would be imported and executed here
    // This is a placeholder for now
    console.log(`[ApprovalService] Executing ${operation} for ${entityType}`, data)
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
async function notifyApprovalCompletion(request: any, outcome: 'approved' | 'rejected'): Promise<void> {
    console.log(`[ApprovalService] Notifying requester ${request.requestedBy} of outcome: ${outcome}`)
}

/**
 * Notify approvers at the next level
 */
async function notifyNextLevelApprovers(request: any): Promise<void> {
    console.log(`[ApprovalService] Notifying level ${request.currentLevel + 1} approvers for request ${request.id}`)
}

/**
 * Notify a specific approver
 */
async function notifyApprover(userId: string, request: any, type: 'new' | 'delegated'): Promise<void> {
    console.log(`[ApprovalService] Notifying user ${userId} of ${type} approval request ${request.id}`)
}

/**
 * Notify the original requester
 */
async function notifyRequester(request: any, type: string, comment?: string): Promise<void> {
    console.log(`[ApprovalService] Notifying requester ${request.requestedBy} of update: ${type} - ${comment}`)
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

        const userRoleNames = userRolesData
            .map((ur) => ur.role?.roleName)
            .filter(Boolean) as string[]

        // Get pending requests for this tenant
        const pending = await ApprovalRepository.findPendingRequests(tenantId)

        // Filter to requests where user can approve at current level
        return pending.filter((req: any) => {
            const matrix = req.matrix
            if (!matrix) return true // No matrix, allow all

            const currentLevel = matrix.levels?.find(
                (l: ApprovalLevel) => l.level === req.currentLevel
            )
            if (!currentLevel) return true

            // Check if user has any of the required roles
            return currentLevel.requiredRoles?.some((role: string) =>
                userRoleNames.includes(role)
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

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function calculateRequiredApprovals(
    impactLevel?: string,
    matrix?: any
): number {
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
