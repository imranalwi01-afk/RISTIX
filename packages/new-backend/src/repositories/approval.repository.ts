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

    findMatrixById: (id: string) =>
        db.query.approvalMatrices.findFirst({
            where: eq(approvalMatrices.id, id),
            with: { levels: { orderBy: [asc(approvalLevels.level)] } },
        }),

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

    findMatricesByTenant: async (tenantId: string) =>
        db.query.approvalMatrices.findMany({
            where: eq(approvalMatrices.tenantId, tenantId),
            with: { levels: true },
        }),

    createMatrix: async (data: NewApprovalMatrix, levels: Omit<NewApprovalLevel, 'matrixId'>[]) => {
        const [matrix] = await db.insert(approvalMatrices).values(data).returning()

        if (levels.length > 0) {
            await db.insert(approvalLevels).values(
                levels.map(l => ({ ...l, matrixId: matrix.id }))
            )
        }

        return matrix
    },

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

    findRequestById: (id: string) =>
        db.query.approvalRequests.findFirst({
            where: eq(approvalRequests.id, id),
            with: {
                actions: { orderBy: [asc(approvalActions.createdAt)] },
                requester: true,
                matrix: { with: { levels: true } },
            },
        }),

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

    createRequest: async (data: NewApprovalRequest) => {
        const [request] = await db.insert(approvalRequests).values(data).returning()
        return request
    },

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

    findActionsByRequest: (requestId: string) =>
        db.query.approvalActions.findMany({
            where: eq(approvalActions.requestId, requestId),
            with: { approver: true },
            orderBy: [asc(approvalActions.createdAt)],
        }),

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
