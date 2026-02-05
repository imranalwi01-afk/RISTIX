import { Effect } from 'effect'
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import * as schema from '../db/schema'
import { PermissionApprovalService } from './permission-approval.service'
import { DatabaseError, AuthorizationError } from '../lib/errors'

/**
 * Approval enforcement guard for permission execution
 * Checks if permission requires approval and validates user eligibility
 */
export class ApprovalEnforcementGuard {
    private approvalService: PermissionApprovalService

    constructor(private db: PostgresJsDatabase<typeof schema>) {
        this.approvalService = new PermissionApprovalService(db)
    }

    /**
     * Check if action can proceed or needs approval
     * @param tenantId - Tenant context
     * @param permissionId - Permission being executed
     * @param userId - User attempting the action
     * @param userMaxHierarchyLevel - User's highest hierarchy level
     * @returns Effect that succeeds if allowed or fails with approval required
     */
    enforceApproval = (
        tenantId: string,
        permissionId: string,
        userId: string,
        userMaxHierarchyLevel: number
    ) =>
        Effect.gen(this, function* (_) {
            // Get approval requirements
            const validation = yield* _(
                this.approvalService.validateApprovalRequest(tenantId, permissionId)
            )

            // If no approval needed, proceed
            if (!validation.needsApproval) {
                return {
                    allowed: true,
                    requiresApproval: false,
                    message: 'Action allowed without approval',
                }
            }

            const requirement = validation.requirement!

            // Check if user can self-approve based on hierarchy level
            const canSelfApprove = this.approvalService.canUserApprove(
                userMaxHierarchyLevel,
                requirement.minHierarchyLevel
            )

            if (canSelfApprove) {
                return {
                    allowed: true,
                    requiresApproval: true,
                    canSelfApprove: true,
                    message: `User level ${userMaxHierarchyLevel} can self-approve (Level ${requirement.minHierarchyLevel}+ required)`,
                }
            }

            // User cannot approve - must create approval request
            return {
                allowed: false,
                requiresApproval: true,
                canSelfApprove: false,
                requirement,
                message: `Approval required: User level ${userMaxHierarchyLevel} insufficient (Level ${requirement.minHierarchyLevel}+ required)`,
            }
        })

    /**
     * Enforce approval or throw authorization error
     * Use this in action handlers that should block if approval is needed
     */
    enforceOrFail = (
        tenantId: string,
        permissionId: string,
        userId: string,
        userMaxHierarchyLevel: number
    ) =>
        Effect.gen(this, function* (_) {
            const result = yield* _(
                this.enforceApproval(tenantId, permissionId, userId, userMaxHierarchyLevel)
            )

            if (!result.allowed) {
                return yield* _(
                    Effect.fail(
                        new AuthorizationError({
                            message: result.message,
                            requiredPermission: permissionId,
                            userId,
                        })
                    )
                )
            }

            return result
        })
}

/**
 * Example usage in a route handler:
 * 
 * const guard = new ApprovalEnforcementGuard(db)
 * const enforcement = await runEffect(
 *   guard.enforceOrFail(tenantId, permissionId, userId, userMaxLevel)
 * )
 * 
 * if (!enforcement.allowed) {
 *   return c.json({ error: 'Approval required', ...enforcement }, 403)
 * }
 * 
 * // Proceed with action...
 */
