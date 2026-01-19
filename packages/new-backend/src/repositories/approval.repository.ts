import { eq, and, asc, desc, count, gte, lte } from 'drizzle-orm'
import { db } from '@/config'
import {
    approvalMatrices,
    approvalLevels,
    approvalRequests,
    approvalActions,
    type ApprovalMatrix,
    type NewApprovalMatrix,
    type ApprovalLevel,
    type NewApprovalLevel,
    type ApprovalRequest,
    type NewApprovalRequest,
    type ApprovalAction,
    type NewApprovalAction,
} from '@/db/schema'

// =============================================================================
// APPROVAL REPOSITORY - Domain: Multi-Level Approval Workflow
// =============================================================================
// Handles: approval_matrices, approval_levels, approval_requests, approval_actions
// =============================================================================

export const ApprovalRepository = {
    // ---------------------------------------------------------------------------
    // MATRIX OPERATIONS
    // ---------------------------------------------------------------------------

    /**
     * Find an approval matrix by ID.
     * 
     * @param id - The ID of the approval matrix
     * @returns The approval matrix with levels
     */
    findMatrixById: (id: string) =>
        db.query.approvalMatrices.findFirst({
            where: eq(approvalMatrices.id, id),
            with: { levels: { orderBy: [asc(approvalLevels.level)] } },
        }),

    /**
     * Find an approval matrix by entity type.
     * 
     * @param tenantId - The tenant ID
     * @param entityType - The entity type
     * @param bankingMode - Optional banking mode filter
     * @returns The approval matrix with levels
     */
    findMatrixByEntityType: (tenantId: string, entityType: string, bankingMode?: string) =>
        db.query.approvalMatrices.findFirst({
            where: and(
                eq(approvalMatrices.tenantId, tenantId),
                eq(approvalMatrices.entityType, entityType),
                eq(approvalMatrices.isActive, true),
                bankingMode ? eq(approvalMatrices.bankingMode, bankingMode) : undefined
            ),
            with: { levels: { orderBy: [asc(approvalLevels.level)] } },
        }),

    /**
     * Find all approval matrices for a tenant.
     * 
     * @param tenantId - The tenant ID
     * @returns An array of approval matrices
     */
    findMatricesByTenant: async (tenantId: string) =>
        db.query.approvalMatrices.findMany({
            where: eq(approvalMatrices.tenantId, tenantId),
            with: { levels: true },
        }),

    /**
     * Create a new approval matrix with levels.
     * 
     * @param data - The matrix data
     * @param levels - The levels data
     * @returns The created matrix
     */
    createMatrix: async (data: NewApprovalMatrix, levels: Omit<NewApprovalLevel, 'matrixId'>[]) => {
        const [matrix] = await db.insert(approvalMatrices).values(data).returning()

        if (levels.length > 0) {
            await db.insert(approvalLevels).values(
                levels.map(l => ({ ...l, matrixId: matrix.id }))
            )
        }

        return matrix
    },

    /**
     * Update an approval matrix.
     * 
     * @param id - The matrix ID
     * @param data - The updated data
     * @returns The updated matrix
     */
    updateMatrix: async (id: string, data: Partial<NewApprovalMatrix>) => {
        const [matrix] = await db.update(approvalMatrices)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(approvalMatrices.id, id))
            .returning()
        return matrix
    },

    // ---------------------------------------------------------------------------
    // REQUEST OPERATIONS
    // ---------------------------------------------------------------------------

    /**
     * Find an approval request by ID.
     * 
     * @param id - The request ID
     * @returns The approval request with details
     */
    findRequestById: (id: string) =>
        db.query.approvalRequests.findFirst({
            where: eq(approvalRequests.id, id),
            with: {
                actions: { orderBy: [asc(approvalActions.createdAt)] },
                requester: true,
                matrix: { with: { levels: true } },
            },
        }),

    /**
     * Find pending approval requests for a tenant.
     * 
     * @param tenantId - The tenant ID
     * @returns An array of pending approval requests
     */
    findPendingRequests: (tenantId: string) =>
        db.query.approvalRequests.findMany({
            where: and(
                eq(approvalRequests.tenantId, tenantId),
                eq(approvalRequests.status, 'pending')
            ),
            with: {
                matrix: { with: { levels: true } },
                requester: true,
                actions: true,
            },
            orderBy: [desc(approvalRequests.createdAt)],
        }),

    /**
     * Find approval requests by entity type.
     * 
     * @param tenantId - The tenant ID
     * @param entityType - The entity type
     * @param entityId - Optional entity ID filter
     * @returns An array of approval requests
     */
    findRequestsByEntity: (tenantId: string, entityType: string, entityId?: string) =>
        db.query.approvalRequests.findMany({
            where: and(
                eq(approvalRequests.tenantId, tenantId),
                eq(approvalRequests.entityType, entityType),
                entityId ? eq(approvalRequests.entityId, entityId) : undefined
            ),
            with: { actions: true, requester: true },
            orderBy: [desc(approvalRequests.createdAt)],
            limit: 100,
        }),

    /**
     * Create a new approval request.
     * 
     * @param data - The request data
     * @returns The created request
     */
    createRequest: async (data: NewApprovalRequest) => {
        const [request] = await db.insert(approvalRequests).values(data).returning()
        return request
    },

    /**
     * Update an existing approval request.
     * 
     * @param id - The request ID
     * @param data - The data to update
     * @returns The updated request
     */
    updateRequest: async (id: string, data: Partial<{
        status: string
        currentLevel: number
        approvalsReceived: number
        completedAt: Date | null
        completedBy: string | null
    }>) => {
        const [request] = await db.update(approvalRequests)
            .set({ ...data })
            .where(eq(approvalRequests.id, id))
            .returning()
        return request
    },

    // ---------------------------------------------------------------------------
    // ACTION OPERATIONS
    // ---------------------------------------------------------------------------

    /**
     * Find actions for a specific request.
     * 
     * @param requestId - The request ID
     * @returns An array of approval actions
     */
    findActionsByRequest: (requestId: string) =>
        db.query.approvalActions.findMany({
            where: eq(approvalActions.requestId, requestId),
            with: { approver: true },
            orderBy: [asc(approvalActions.createdAt)],
        }),

    /**
     * Create a new approval action.
     * 
     * @param data - The action data
     * @returns The created action
     */
    createAction: async (data: NewApprovalAction) => {
        const [action] = await db.insert(approvalActions).values(data).returning()
        return action
    },

    // ---------------------------------------------------------------------------
    // AGGREGATE QUERIES
    // ---------------------------------------------------------------------------

    countPendingByTenant: async (tenantId: string) => {
        const result = await db.select({ count: count() })
            .from(approvalRequests)
            .where(and(
                eq(approvalRequests.tenantId, tenantId),
                eq(approvalRequests.status, 'pending')
            ))
        return result[0]?.count ?? 0
    },

    getExpiredRequests: () =>
        db.query.approvalRequests.findMany({
            where: and(
                eq(approvalRequests.status, 'pending'),
                lte(approvalRequests.expiresAt, new Date())
            ),
        }),
}

export type ApprovalRepositoryType = typeof ApprovalRepository
