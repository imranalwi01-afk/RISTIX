import { eq, sql } from 'drizzle-orm'
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

    private extractErrorMessage(error: unknown): string {
        const maybe = error as { message?: string; cause?: unknown }
        const cause = maybe?.cause as { message?: string } | undefined
        const parts = [
            maybe?.message,
            cause?.message,
            error instanceof Error ? error.message : undefined,
            String(error),
        ].filter(Boolean)
        return parts.join(' | ')
    }

    private isMissingTableError(error: unknown): boolean {
        const maybe = error as { code?: string }
        const message = this.extractErrorMessage(error)
        return (
            maybe?.code === '42P01' ||
            (message.includes('permission_approval_policies') &&
                message.includes('does not exist')) ||
            false
        )
    }

    private mapPolicyRow(row: any): PermissionApprovalPolicy {
        return {
            id: row.id,
            tenantId: row.tenant_id,
            permissionId: row.permission_id,
            requiresApproval: row.requires_approval ?? false,
            minHierarchyLevel:
                row.min_hierarchy_level === null || row.min_hierarchy_level === undefined
                    ? null
                    : Number(row.min_hierarchy_level),
            requiredApprovers:
                row.required_approvers === null || row.required_approvers === undefined
                    ? 1
                    : Number(row.required_approvers),
            matrixId: row.matrix_id ?? null,
            description: row.description ?? null,
            isActive: row.is_active ?? true,
            createdAt: row.created_at ? new Date(row.created_at) : new Date(),
            updatedAt: row.updated_at ? new Date(row.updated_at) : new Date(),
        }
    }

    private async hasPolicyTable(): Promise<boolean> {
        if (this.tableAvailable !== null) return this.tableAvailable

        try {
            const result = await this.db.execute(
                sql`
                    SELECT to_regclass('approval.permission_approval_policies') AS approval_table
                `
            ) as any

            const firstRow = Array.isArray(result)
                ? result[0]
                : result?.rows?.[0]

            this.tableAvailable = Boolean(firstRow?.approval_table)
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
            const result = await this.db.execute(sql`
                SELECT
                    id,
                    tenant_id,
                    permission_id,
                    requires_approval,
                    min_hierarchy_level,
                    required_approvers,
                    matrix_id,
                    description,
                    is_active,
                    created_at,
                    updated_at
                FROM approval.permission_approval_policies
                WHERE tenant_id = ${tenantId}
                  AND is_active = true
                ORDER BY created_at DESC
            `) as any

            const rows = Array.isArray(result) ? result : (result?.rows ?? [])
            return rows.map((row: any) => this.mapPolicyRow(row))
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
            const result = await this.db.execute(sql`
                SELECT
                    id,
                    tenant_id,
                    permission_id,
                    requires_approval,
                    min_hierarchy_level,
                    required_approvers,
                    matrix_id,
                    description,
                    is_active,
                    created_at,
                    updated_at
                FROM approval.permission_approval_policies
                WHERE tenant_id = ${tenantId}
                  AND permission_id = ${permissionId}
                  AND is_active = true
                LIMIT 1
            `) as any

            const rows = Array.isArray(result) ? result : (result?.rows ?? [])
            const row = rows[0]
            return row ? this.mapPolicyRow(row) : undefined
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
            const result = await this.db.execute(sql`
                SELECT
                    id,
                    tenant_id,
                    permission_id,
                    requires_approval,
                    min_hierarchy_level,
                    required_approvers,
                    matrix_id,
                    description,
                    is_active,
                    created_at,
                    updated_at
                FROM approval.permission_approval_policies
                WHERE tenant_id = ${tenantId}
                  AND requires_approval = true
                  AND is_active = true
                ORDER BY min_hierarchy_level DESC NULLS LAST
            `) as any

            const rows = Array.isArray(result) ? result : (result?.rows ?? [])
            return rows.map((row: any) => this.mapPolicyRow(row))
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
