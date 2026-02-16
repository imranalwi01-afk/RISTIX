import { Effect, pipe } from 'effect'
import { getDatabase } from '@/config/database'
import { ApprovalRepository } from '@/repositories/approval.repository'
import { createApprovalRequest } from '@/services/approval.service'
import type { ApprovalMatrix } from '@/db/schema'
import {
    shouldAutoApprove,
    formatApprovalRequiredResponse,
    formatDirectExecutionResponse,
    buildApprovalTitle,
    buildApprovalDescription,
    type ApprovalCheckResult,
    type ApprovalResponse,
} from '@/lib/approval-helpers'
import { DatabaseError } from '@/lib/errors'

/**
 * Approval Interceptor Middleware
 * Intercepts CRUD operations and determines if approval is required
 */

// =============================================================================
// TYPES
// =============================================================================

export interface InterceptorContext {
    tenantId: string
    userId: string
    userPermissions: string[]
    entityType: string
    operation: 'create' | 'update' | 'delete'
    data: Record<string, any>
    entityId?: string
    impactLevel?: 'low' | 'medium' | 'high' | 'critical'
}

export interface InterceptorResult<T> {
    shouldExecute: boolean
    approvalRequired: boolean
    result?: T
    approvalRequest?: any
}

// =============================================================================
// CORE INTERCEPTOR LOGIC
// =============================================================================

/**
 * Check if an operation requires approval based on approval matrix
 */
export const checkApprovalRequired = (
    tenantId: string,
    entityType: string,
    operation: 'create' | 'update' | 'delete'
): Effect.Effect<ApprovalCheckResult, DatabaseError> =>
    Effect.tryPromise({
        try: async () => {
            // Get approval matrix for this entity type and operation
            const matrix = await ApprovalRepository.findMatrixByEntityType(
                tenantId,
                entityType
            )

            // No matrix = no approval required
            if (!matrix) {
                return {
                    requiresApproval: false,
                    canSelfApprove: true,
                    reason: 'No approval matrix configured',
                }
            }

            // Check if matrix is active
            if (!matrix.isActive) {
                return {
                    requiresApproval: false,
                    canSelfApprove: true,
                    reason: 'Approval matrix is inactive',
                }
            }

            // Check if operation type is covered by this matrix
            if (matrix.operationType) {
                const operations = (matrix.operationType as string).split(',').map(op => op.trim())
                if (!operations.includes(operation)) {
                    return {
                        requiresApproval: false,
                        canSelfApprove: true,
                        reason: `Operation '${operation}' not covered by matrix`,
                    }
                }
            }

            return {
                requiresApproval: true,
                canSelfApprove: false,
                matrix,
                reason: 'Approval required by matrix',
            }
        },
        catch: (error) =>
            new DatabaseError({
                message: `Failed to check approval requirements: ${error}`,
                operation: 'query',
                cause: error,
            }),
    })

export const interceptCRUDOperation = <T>(
    context: InterceptorContext,
    executeOperation: () => Effect.Effect<T, any>
): Effect.Effect<InterceptorResult<T>, DatabaseError | any> =>
    pipe(
        // Step 1: Check if approval is required
        checkApprovalRequired(context.tenantId, context.entityType, context.operation),

        Effect.flatMap((checkResult): Effect.Effect<InterceptorResult<T>, DatabaseError | any> => {
            // If no approval required, execute directly
            if (!checkResult.requiresApproval) {
                return pipe(
                    executeOperation(),
                    Effect.map((result): InterceptorResult<T> => ({
                        shouldExecute: true,
                        approvalRequired: false,
                        result,
                    })),
                    Effect.mapError((error) => error as any)
                )
            }

            // Check if user can self-approve
            const canAutoApprove = shouldAutoApprove(
                checkResult.matrix,
                context.userPermissions,
                context.entityType,
                context.operation,
                context.impactLevel
            )

            if (canAutoApprove) {
                // User can self-approve, execute directly
                return pipe(
                    executeOperation(),
                    Effect.map((result): InterceptorResult<T> => ({
                        shouldExecute: true,
                        approvalRequired: false,
                        result,
                    })),
                    Effect.mapError((error) => error as any)
                )
            }

            // Create approval request instead of executing
            return pipe(
                createApprovalRequest({
                    tenantId: context.tenantId,
                    entityType: context.entityType,
                    entityId: context.entityId,
                    title: buildApprovalTitle(
                        context.operation,
                        context.entityType,
                        context.entityId
                    ),
                    description: buildApprovalDescription(
                        context.operation,
                        context.entityType,
                        context.data
                    ),
                    requestData: {
                        operation: context.operation,
                        entityType: context.entityType,
                        data: context.data,
                    },
                    requestedBy: context.userId,
                    impactLevel: context.impactLevel || 'medium',
                }),
                Effect.map((approvalRequest): InterceptorResult<T> => ({
                    shouldExecute: false,
                    approvalRequired: true,
                    approvalRequest,
                }))
            )
        })
    )

/**
 * Simplified wrapper for common CRUD operations
 */
export const withApprovalCheck = <T>(
    context: InterceptorContext,
    executeOperation: () => Effect.Effect<T, any>
): Effect.Effect<ApprovalResponse, any> =>
    pipe(
        interceptCRUDOperation(context, executeOperation),
        Effect.map((interceptResult) => {
            if (interceptResult.shouldExecute) {
                // Operation was executed directly
                return formatDirectExecutionResponse(
                    interceptResult.result,
                    'Operation completed successfully'
                )
            } else {
                // Approval request was created
                return formatApprovalRequiredResponse(interceptResult.approvalRequest)
            }
        })
    )

// =============================================================================
// CONVENIENCE FUNCTIONS FOR SPECIFIC OPERATIONS
// =============================================================================

/**
 * Intercept CREATE operation
 */
export const interceptCreate = <T>(
    tenantId: string,
    userId: string,
    userPermissions: string[],
    entityType: string,
    data: Record<string, any>,
    executeCreate: () => Effect.Effect<T, any>,
    impactLevel?: 'low' | 'medium' | 'high' | 'critical'
): Effect.Effect<ApprovalResponse, any> =>
    withApprovalCheck(
        {
            tenantId,
            userId,
            userPermissions,
            entityType,
            operation: 'create',
            data,
            impactLevel,
        },
        executeCreate
    )

/**
 * Intercept UPDATE operation
 */
export const interceptUpdate = <T>(
    tenantId: string,
    userId: string,
    userPermissions: string[],
    entityType: string,
    entityId: string,
    data: Record<string, any>,
    executeUpdate: () => Effect.Effect<T, any>,
    impactLevel?: 'low' | 'medium' | 'high' | 'critical'
): Effect.Effect<ApprovalResponse, any> =>
    withApprovalCheck(
        {
            tenantId,
            userId,
            userPermissions,
            entityType,
            operation: 'update',
            data,
            entityId,
            impactLevel,
        },
        executeUpdate
    )

/**
 * Intercept DELETE operation
 */
export const interceptDelete = <T>(
    tenantId: string,
    userId: string,
    userPermissions: string[],
    entityType: string,
    entityId: string,
    executeDelete: () => Effect.Effect<T, any>,
    impactLevel?: 'low' | 'medium' | 'high' | 'critical'
): Effect.Effect<ApprovalResponse, any> =>
    withApprovalCheck(
        {
            tenantId,
            userId,
            userPermissions,
            entityType,
            operation: 'delete',
            data: { id: entityId },
            entityId,
            impactLevel,
        },
        executeDelete
    )
