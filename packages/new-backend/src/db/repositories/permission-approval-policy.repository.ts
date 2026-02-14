import { eq, and, desc, sql } from 'drizzle-orm'
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import * as schema from '../schema'
import {
    permissionApprovalPolicies,
    type PermissionApprovalPolicy,
    type NewPermissionApprovalPolicy,
} from '../schema'

export class PermissionApprovalPolicyRepository {
    private tableAvailable: boolean | null = null

    constructor(private db: PostgresJsDatabase<typeof schema>) { }

    private isMissingTableError(error: unknown): boolean {
        const maybe = error as { code?: string; message?: string }
        return (
            maybe?.code === '42P01' ||
            (maybe?.message?.includes('permission_approval_policies') &&
                maybe?.message?.includes('does not exist')) ||
            false
        )
    }

    private async hasPolicyTable(): Promise<boolean> {
        if (this.tableAvailable !== null) return this.tableAvailable

        try {
            const result = await this.db.execute(
                sql`SELECT to_regclass('approval.permission_approval_policies') AS policy_table`
            ) as any

            const firstRow = Array.isArray(result)
                ? result[0]
                : result?.rows?.[0]

            this.tableAvailable = Boolean(firstRow?.policy_table)
        } catch {
            this.tableAvailable = false
        }

        return this.tableAvailable
    }

    /**
     * Find all policies for a tenant
     */
    async findByTenantId(tenantId: string): Promise<PermissionApprovalPolicy[]> {
        if (!(await this.hasPolicyTable())) return []

        try {
            return await this.db
                .select()
                .from(permissionApprovalPolicies)
                .where(
                    and(
                        eq(permissionApprovalPolicies.tenantId, tenantId),
                        eq(permissionApprovalPolicies.isActive, true)
                    )
                )
                .orderBy(desc(permissionApprovalPolicies.createdAt))
        } catch (error) {
            if (this.isMissingTableError(error)) {
                this.tableAvailable = false
                return []
            }
            throw error
        }
    }

    /**
     * Find policy for a specific permission in a tenant
     */
    async findByPermission(
        tenantId: string,
        permissionId: string
    ): Promise<PermissionApprovalPolicy | undefined> {
        if (!(await this.hasPolicyTable())) return undefined

        try {
            const [policy] = await this.db
                .select()
                .from(permissionApprovalPolicies)
                .where(
                    and(
                        eq(permissionApprovalPolicies.tenantId, tenantId),
                        eq(permissionApprovalPolicies.permissionId, permissionId),
                        eq(permissionApprovalPolicies.isActive, true)
                    )
                )
                .limit(1)

            return policy
        } catch (error) {
            if (this.isMissingTableError(error)) {
                this.tableAvailable = false
                return undefined
            }
            throw error
        }
    }

    /**
     * Find all policies that require approval for a tenant
     */
    async findRequiringApproval(tenantId: string): Promise<PermissionApprovalPolicy[]> {
        if (!(await this.hasPolicyTable())) return []

        try {
            return await this.db
                .select()
                .from(permissionApprovalPolicies)
                .where(
                    and(
                        eq(permissionApprovalPolicies.tenantId, tenantId),
                        eq(permissionApprovalPolicies.requiresApproval, true),
                        eq(permissionApprovalPolicies.isActive, true)
                    )
                )
                .orderBy(desc(permissionApprovalPolicies.minHierarchyLevel))
        } catch (error) {
            if (this.isMissingTableError(error)) {
                this.tableAvailable = false
                return []
            }
            throw error
        }
    }

    /**
     * Create a new approval policy
     */
    async create(policy: NewPermissionApprovalPolicy): Promise<PermissionApprovalPolicy> {
        if (!(await this.hasPolicyTable())) {
            throw new Error('approval.permission_approval_policies is not configured')
        }

        const [created] = await this.db
            .insert(permissionApprovalPolicies)
            .values({
                ...policy,
                createdAt: new Date(),
                updatedAt: new Date(),
            })
            .returning()

        if (!created) {
            throw new Error('Failed to create permission approval policy')
        }

        return created
    }

    /**
     * Update an existing policy
     */
    async update(
        id: string,
        data: Partial<NewPermissionApprovalPolicy>
    ): Promise<PermissionApprovalPolicy> {
        if (!(await this.hasPolicyTable())) {
            throw new Error('approval.permission_approval_policies is not configured')
        }

        const [updated] = await this.db
            .update(permissionApprovalPolicies)
            .set({
                ...data,
                updatedAt: new Date(),
            })
            .where(eq(permissionApprovalPolicies.id, id))
            .returning()

        if (!updated) {
            throw new Error('Permission approval policy not found')
        }

        return updated
    }

    /**
     * Upsert (create or update) a policy by tenant and permission
     */
    async upsert(
        tenantId: string,
        permissionId: string,
        data: Partial<NewPermissionApprovalPolicy>
    ): Promise<PermissionApprovalPolicy> {
        const existing = await this.findByPermission(tenantId, permissionId)

        if (existing) {
            return this.update(existing.id, data)
        }

        return this.create({
            tenantId,
            permissionId,
            ...data,
        } as NewPermissionApprovalPolicy)
    }

    /**
     * Soft delete a policy (mark as inactive)
     */
    async softDelete(id: string): Promise<void> {
        if (!(await this.hasPolicyTable())) return

        await this.db
            .update(permissionApprovalPolicies)
            .set({
                isActive: false,
                updatedAt: new Date(),
            })
            .where(eq(permissionApprovalPolicies.id, id))
    }

    /**
     * Hard delete a policy
     */
    async delete(id: string): Promise<void> {
        if (!(await this.hasPolicyTable())) return
        await this.db.delete(permissionApprovalPolicies).where(eq(permissionApprovalPolicies.id, id))
    }

    /**
     * Check if a permission requires approval
     */
    async requiresApproval(tenantId: string, permissionId: string): Promise<boolean> {
        const policy = await this.findByPermission(tenantId, permissionId)
        return policy?.requiresApproval ?? false
    }

    /**
     * Get minimum hierarchy level required to approve a permission
     */
    async getMinHierarchyLevel(tenantId: string, permissionId: string): Promise<number | null> {
        const policy = await this.findByPermission(tenantId, permissionId)
        return policy?.minHierarchyLevel ?? null
    }

    /**
     * Get required approvers count for a permission
     */
    async getRequiredApprovers(tenantId: string, permissionId: string): Promise<number> {
        const policy = await this.findByPermission(tenantId, permissionId)
        return policy?.requiredApprovers ?? 1
    }
}
