import { Effect, pipe } from 'effect'
import { ApprovalRepository } from '@/repositories/approval.repository'
import {
    type NewApprovalMatrix,
    type NewApprovalLevel,
    type ApprovalRequest,
    type ApprovalAction,
    type ApprovalLevel,
} from '@/db/schema'
import { DatabaseError, NotFoundError, BusinessError } from '@/lib/errors'
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

// =============================================================================
// MATRIX QUERIES
// =============================================================================

/**
 * Get approval matrix for entity type
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
 * Get all matrices for a tenant
 */
export const getApprovalMatrices = (
    tenantId: string
): Effect.Effect<any[], DatabaseError> =>
    dbOperation('query', () =>
        ApprovalRepository.findMatricesByTenant(tenantId)
    )

/**
 * Create an approval matrix
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
 * Create a new approval request
 */
export const createApprovalRequest = (
    input: CreateApprovalRequestInput
): Effect.Effect<ApprovalRequest, DatabaseError> =>
    dbOperation('transaction', async () => {
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
        })

        return request
    })

/**
 * Process an approval action (simplified - no Effect pipe for better type inference)
 */
export const processApprovalAction = (
    input: ProcessApprovalInput
): Effect.Effect<{ completed: boolean; status: string }, DatabaseError | NotFoundError | BusinessError> =>
    dbOperation('transaction', async () => {
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
    })

// =============================================================================
// INTERNAL HELPERS & PLACEHOLDERS
// =============================================================================

/**
 * Execute the actual logic that was requested once approved
 */
async function executeApprovedAction(request: any): Promise<void> {
    console.log(`[ApprovalService] Executing approved action for ${request.entityType}:${request.entityId}`)
    // TODO: Map entityType to actual service calls (e.g., UserService.createPendingUser)
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
 * Get pending approvals for a user
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
 * Get approval request by ID with full details
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
 * Get approval history for an entity
 */
export const getApprovalHistory = (
    tenantId: string,
    entityType?: string,
    entityId?: string
): Effect.Effect<ApprovalRequest[], DatabaseError> =>
    dbOperation('query', () => {
        // If entityType is provided, filter by it; otherwise get all requests for tenant
        if (entityType) {
            return ApprovalRepository.findRequestsByEntity(tenantId, entityType, entityId)
        } else {
            // Get all requests for this tenant (both pending and completed)
            return ApprovalRepository.findPendingRequests(tenantId)
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
