import { Effect } from 'effect'
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import * as schema from '../db/schema'
import { PermissionApprovalPolicyRepository } from '../db/repositories/permission-approval-policy.repository'
import { DatabaseError } from '../lib/errors'
import type {
    PermissionApprovalPolicy,
    NewPermissionApprovalPolicy,
} from '../db/schema'

export interface ApprovalRequirement {
    requiresApproval: boolean
    minHierarchyLevel: number | null
    requiredApprovers: number
    description?: string
}

export interface PermissionWithApproval {
    permissionId: string
    code: string
    name: string
    category: string
    requiresApproval: boolean
    requiredApprovalLevel: number | null
    requiredApprovers: number
}

export class PermissionApprovalService {
    private repository: PermissionApprovalPolicyRepository

    constructor(private db: PostgresJsDatabase<typeof schema>) {
        this.repository = new PermissionApprovalPolicyRepository(db)
    }

    /**
     * Get approval requirements for a specific permission
     */
    getApprovalRequirement = (tenantId: string, permissionId: string) =>
        Effect.tryPromise({
            try: async (): Promise<ApprovalRequirement> => {
                const policy = await this.repository.findByPermission(tenantId, permissionId)

                return {
                    requiresApproval: policy?.requiresApproval ?? false,
                    minHierarchyLevel: policy?.minHierarchyLevel ?? null,
                    requiredApprovers: policy?.requiredApprovers ?? 1,
                    description: policy?.description ?? undefined,
                }
            },
            catch: (error) => new DatabaseError({
                operation: 'query',
                message: `Failed to get approval requirement: ${error}`
            }),
        })

    /**
     * Check if a permission requires approval
     */
    requiresApproval = (tenantId: string, permissionId: string) =>
        Effect.tryPromise({
            try: async (): Promise<boolean> => {
                return this.repository.requiresApproval(tenantId, permissionId)
            },
            catch: (error) => new DatabaseError({
                operation: 'query',
                message: `Failed to check approval requirement: ${error}`
            }),
        })

    /**
     * Get all permissions requiring approval for a tenant
     */
    getPermissionsRequiringApproval = (tenantId: string) =>
        Effect.tryPromise({
            try: async (): Promise<PermissionApprovalPolicy[]> => {
                return this.repository.findRequiringApproval(tenantId)
            },
            catch: (error) => new DatabaseError({
                operation: 'query',
                message: `Failed to get permissions requiring approval: ${error}`
            }),
        })

    /**
     * Create or update an approval policy
     */
    upsertPolicy = (
        tenantId: string,
        permissionId: string,
        data: {
            requiresApproval: boolean
            minHierarchyLevel?: number | null
            requiredApprovers?: number
            description?: string
        }
    ) =>
        Effect.tryPromise({
            try: async (): Promise<PermissionApprovalPolicy> => {
                return this.repository.upsert(tenantId, permissionId, data)
            },
            catch: (error) => new DatabaseError({
                operation: 'upsert',
                message: `Failed to upsert approval policy: ${error}`
            }),
        })

    /**
     * Check if user can approve based on their role hierarchy level
     */
    canUserApprove = (
        userMaxHierarchyLevel: number,
        requiredMinHierarchyLevel: number | null
    ): boolean => {
        if (requiredMinHierarchyLevel === null) {
            return true // No hierarchy requirement
        }
        return userMaxHierarchyLevel >= requiredMinHierarchyLevel
    }

    /**
     * Get eligible approvers for a permission
     * Returns the minimum hierarchy level needed
     */
    getEligibleApproverLevel = (tenantId: string, permissionId: string) =>
        Effect.tryPromise({
            try: async (): Promise<number | null> => {
                return this.repository.getMinHierarchyLevel(tenantId, permissionId)
            },
            catch: (error) => new DatabaseError({
                operation: 'query',
                message: `Failed to get eligible approver level: ${error}`
            }),
        })

    /**
     * Validate approval request
     * Checks if the permission requires approval and returns requirements
     */
    validateApprovalRequest = (tenantId: string, permissionId: string) =>
        Effect.gen(this, function* (_) {
            const requirement = yield* _(this.getApprovalRequirement(tenantId, permissionId))

            if (!requirement.requiresApproval) {
                return {
                    needsApproval: false,
                    requirement: null,
                }
            }

            return {
                needsApproval: true,
                requirement,
            }
        })

    /**
     * Bulk get approval requirements for multiple permissions
     */
    getBulkApprovalRequirements = (tenantId: string, permissionIds: string[]) =>
        Effect.tryPromise({
            try: async (): Promise<Map<string, ApprovalRequirement>> => {
                const requirements = new Map<string, ApprovalRequirement>()

                await Promise.all(
                    permissionIds.map(async (permissionId) => {
                        const policy = await this.repository.findByPermission(
                            tenantId,
                            permissionId
                        )

                        requirements.set(permissionId, {
                            requiresApproval: policy?.requiresApproval ?? false,
                            minHierarchyLevel: policy?.minHierarchyLevel ?? null,
                            requiredApprovers: policy?.requiredApprovers ?? 1,
                            description: policy?.description ?? undefined,
                        })
                    })
                )

                return requirements
            },
            catch: (error) => new DatabaseError({
                operation: 'query',
                message: `Failed to get bulk approval requirements: ${error}`
            }),
        })

    /**
     * Delete approval policy
     */
    deletePolicy = (id: string) =>
        Effect.tryPromise({
            try: async (): Promise<void> => {
                await this.repository.softDelete(id)
            },
            catch: (error) => new DatabaseError({
                operation: 'delete',
                message: `Failed to delete approval policy: ${error}`
            }),
        })
}
