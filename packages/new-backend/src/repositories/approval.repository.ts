import { eq, and, asc, desc, count, gte, lte, ilike, isNull, or, sql } from 'drizzle-orm'
import { getDatabase } from '@/config/database'
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
        getDatabase('tenant').query.approvalMatrices.findFirst({
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
    findMatrixByEntityType: async (tenantId: string, entityType: string, bankingMode?: string) => {
        const dbx = getDatabase(tenantId)
        const normalizedEntityType = entityType.trim().toLowerCase()
        const normalizedBankingMode = bankingMode?.trim().toLowerCase()

        const matches = await dbx.query.approvalMatrices.findMany({
            where: and(
                eq(approvalMatrices.tenantId, tenantId),
                sql`lower(${approvalMatrices.entityType}) = ${normalizedEntityType}`,
                eq(approvalMatrices.isActive, true),
                normalizedBankingMode
                    ? or(
                        sql`lower(${approvalMatrices.bankingMode}) = ${normalizedBankingMode}`,
                        sql`lower(${approvalMatrices.bankingMode}) = 'dual'`,
                        isNull(approvalMatrices.bankingMode)
                    )
                    : undefined
            ),
            with: { levels: { orderBy: [asc(approvalLevels.level)] } },
        })

        if (!normalizedBankingMode) return matches[0] ?? null

        return [...matches].sort((a, b) => {
            const rank = (mode: string | null | undefined) => {
                const normalized = String(mode || '').trim().toLowerCase()
                if (normalized === normalizedBankingMode) return 0
                if (normalized === 'dual') return 1
                if (!normalized) return 2
                return 3
            }
            return rank(a.bankingMode) - rank(b.bankingMode)
        })[0] ?? null
    },

    /**
     * Find all approval matrices for a tenant.
     * 
     * @param tenantId - The tenant ID
     * @returns An array of approval matrices
     */
    findMatricesByTenant: async (tenantId: string) => {
        const dbx = getDatabase(tenantId)
        return dbx.query.approvalMatrices.findMany({
            where: eq(approvalMatrices.tenantId, tenantId),
            with: { levels: true },
        })
    },

    /**
     * Create a new approval matrix with levels.
     * 
     * @param data - The matrix data
     * @param levels - The levels data
     * @returns The created matrix
     */
    createMatrix: async (data: NewApprovalMatrix, levels: Omit<NewApprovalLevel, 'matrixId'>[]) => {
        const dbx = getDatabase((data as any).tenantId || 'tenant')
        const [matrix] = await dbx.insert(approvalMatrices).values(data).returning()

        if (levels.length > 0) {
            await dbx.insert(approvalLevels).values(
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
        const dbx = getDatabase((data as any).tenantId || 'tenant')
        const [matrix] = await dbx.update(approvalMatrices)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(approvalMatrices.id, id))
            .returning()
        return matrix
    },

    /**
     * Update approval matrix and optionally replace all of its levels atomically.
     *
     * @param input - Matrix update payload
     * @returns Updated matrix with levels, or null when matrix is not found
     */
    updateMatrixWithLevels: async (input: {
        tenantId: string
        matrixId: string
        data: Partial<NewApprovalMatrix>
        levels?: Omit<NewApprovalLevel, 'matrixId'>[]
    }) => {
        const dbx = getDatabase(input.tenantId)

        const existing = await dbx.query.approvalMatrices.findFirst({
            where: and(
                eq(approvalMatrices.id, input.matrixId),
                eq(approvalMatrices.tenantId, input.tenantId)
            ),
        })

        if (!existing) return null

        await dbx.transaction(async (tx) => {
            await tx
                .update(approvalMatrices)
                .set({
                    ...input.data,
                    updatedAt: new Date(),
                })
                .where(and(
                    eq(approvalMatrices.id, input.matrixId),
                    eq(approvalMatrices.tenantId, input.tenantId)
                ))

            if (input.levels) {
                await tx
                    .delete(approvalLevels)
                    .where(eq(approvalLevels.matrixId, input.matrixId))

                if (input.levels.length > 0) {
                    await tx
                        .insert(approvalLevels)
                        .values(input.levels.map((level) => ({
                            ...level,
                            matrixId: input.matrixId,
                        })))
                }
            }
        })

        return dbx.query.approvalMatrices.findFirst({
            where: and(
                eq(approvalMatrices.id, input.matrixId),
                eq(approvalMatrices.tenantId, input.tenantId)
            ),
            with: { levels: { orderBy: [asc(approvalLevels.level)] } },
        })
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
    findRequestById: async (id: string) => {
        return getDatabase('tenant').query.approvalRequests.findFirst({
            where: eq(approvalRequests.id, id),
            with: {
                actions: { orderBy: [asc(approvalActions.createdAt)] },
                requester: true,
                matrix: { with: { levels: true } },
            },
        })
    },

    /**
     * Find pending approval requests for a tenant.
     * 
     * @param tenantId - The tenant ID
     * @returns An array of pending approval requests
     */
    findPendingRequests: (tenantId: string) => {
        const dbx = getDatabase(tenantId)
        return dbx.query.approvalRequests.findMany({
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
        })
    },

    /**
     * Find all approval requests for a tenant (history + pending).
     *
     * @param tenantId - The tenant ID
     * @returns An array of approval requests
     */
    findRequestsByTenant: (tenantId: string) => {
        const dbx = getDatabase(tenantId)
        return dbx.query.approvalRequests.findMany({
            where: eq(approvalRequests.tenantId, tenantId),
            with: {
                matrix: { with: { levels: true } },
                requester: true,
                actions: true,
            },
            orderBy: [desc(approvalRequests.createdAt)],
            limit: 500,
        })
    },

    /**
     * Find approval requests by entity type.
     * 
     * @param tenantId - The tenant ID
     * @param entityType - The entity type
     * @param entityId - Optional entity ID filter
     * @returns An array of approval requests
     */
    findRequestsByEntity: (tenantId: string, entityType: string, entityId?: string) => {
        const dbx = getDatabase(tenantId)
        return dbx.query.approvalRequests.findMany({
            where: and(
                eq(approvalRequests.tenantId, tenantId),
                eq(approvalRequests.entityType, entityType),
                entityId ? eq(approvalRequests.entityId, entityId) : undefined
            ),
            with: { actions: true, requester: true },
            orderBy: [desc(approvalRequests.createdAt)],
            limit: 100,
        })
    },

    findRequestsList: async (input: {
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
    }) => {
        const dbx = getDatabase(input.tenantId)
        const conditions = [eq(approvalRequests.tenantId, input.tenantId)]

        if (input.entityType) conditions.push(eq(approvalRequests.entityType, input.entityType))
        if (input.entityId) conditions.push(eq(approvalRequests.entityId, input.entityId))
        if (input.status) conditions.push(eq(approvalRequests.status, input.status))
        if (input.impactLevel) conditions.push(eq(approvalRequests.impactLevel, input.impactLevel))
        if (typeof input.currentLevel === 'number') conditions.push(eq(approvalRequests.currentLevel, input.currentLevel))
        if (typeof input.currentLevelMin === 'number') conditions.push(gte(approvalRequests.currentLevel, input.currentLevelMin))
        if (typeof input.currentLevelMax === 'number') conditions.push(lte(approvalRequests.currentLevel, input.currentLevelMax))
        if (input.bankingType) {
            conditions.push(
                sql`lower(coalesce(
                    (select ${approvalMatrices.bankingMode} from ${approvalMatrices} where ${approvalMatrices.id} = ${approvalRequests.matrixId}),
                    ${approvalRequests.requestData}->>'bankingType',
                    ''
                )) = lower(${input.bankingType})`
            )
        }
        if (input.riskLevel) {
            conditions.push(
                sql`lower(coalesce(${approvalRequests.requestData}->>'riskLevel', '')) = lower(${input.riskLevel})`
            )
        }
        if (input.requestedBy) conditions.push(eq(approvalRequests.requestedBy, input.requestedBy))
        if (input.operation) {
            conditions.push(sql`coalesce(${approvalRequests.requestData}->>'operation', '') = ${input.operation}`)
        }
        if (input.createdAtFrom) conditions.push(gte(approvalRequests.createdAt, input.createdAtFrom))
        if (input.createdAtTo) conditions.push(lte(approvalRequests.createdAt, input.createdAtTo))
        if (input.search) {
            const pattern = `%${input.search}%`
            conditions.push(or(
                ilike(approvalRequests.title, pattern),
                ilike(approvalRequests.description, pattern),
                ilike(approvalRequests.entityType, pattern),
                ilike(approvalRequests.entityId, pattern),
                ilike(approvalRequests.status, pattern),
                ilike(approvalRequests.impactLevel, pattern),
                sql`cast(${approvalRequests.id} as text) ilike ${pattern}`,
                sql`cast(${approvalRequests.currentLevel} as text) ilike ${pattern}`,
                sql`coalesce(${approvalRequests.requestData}->>'operation', '') ilike ${pattern}`,
                sql`coalesce(${approvalRequests.requestData}->>'riskLevel', '') ilike ${pattern}`,
                sql`coalesce(
                    (select ${approvalMatrices.bankingMode} from ${approvalMatrices} where ${approvalMatrices.id} = ${approvalRequests.matrixId}),
                    ${approvalRequests.requestData}->>'bankingType',
                    ''
                ) ilike ${pattern}`
            )!)
        }

        const sortColumns = {
            createdAt: approvalRequests.createdAt,
            updatedAt: approvalRequests.completedAt,
            status: approvalRequests.status,
            entityType: approvalRequests.entityType,
            title: approvalRequests.title,
            impactLevel: approvalRequests.impactLevel,
            currentLevel: approvalRequests.currentLevel,
        }
        const sort = input.sort ?? { field: 'createdAt', direction: 'desc' as const }
        const sortColumn = sortColumns[sort.field as keyof typeof sortColumns] ?? approvalRequests.createdAt

        const whereClause = and(...conditions)
        const [rows, totalRows] = await Promise.all([
            dbx.query.approvalRequests.findMany({
                where: whereClause,
                with: {
                    matrix: { with: { levels: true } },
                    requester: true,
                    actions: true,
                },
                orderBy: [sort.direction === 'asc' ? asc(sortColumn) : desc(sortColumn)],
                limit: input.limit,
                offset: input.offset,
            }),
            dbx.select({ count: count() })
                .from(approvalRequests)
                .where(whereClause),
        ])

        return {
            data: rows,
            total: Number(totalRows[0]?.count ?? 0),
        }
    },

    /**
     * Create a new approval request.
     * 
     * @param data - The request data
     * @returns The created request
     */
    createRequest: async (data: NewApprovalRequest, tx?: any) => {
        const dbx = tx || getDatabase((data as any).tenantId)
        const [request] = await dbx.insert(approvalRequests).values(data).returning()
        return request
    },

    /**
     * Find an existing pending request that matches the same business operation.
     * This prevents accidental duplicate submissions from retries/double-clicks.
     */
    findDuplicatePendingRequest: async (input: {
        tenantId: string
        entityType: string
        entityId?: string
        requestedBy: string
        title: string
        operation?: string
    }, tx?: any) => {
        const dbx = tx || getDatabase(input.tenantId)
        const pendingRows = await dbx.query.approvalRequests.findMany({
            where: and(
                eq(approvalRequests.tenantId, input.tenantId),
                eq(approvalRequests.entityType, input.entityType),
                eq(approvalRequests.status, 'pending'),
                input.entityId
                    ? eq(approvalRequests.entityId, input.entityId)
                    : and(
                        eq(approvalRequests.requestedBy, input.requestedBy),
                        eq(approvalRequests.title, input.title)
                    )
            ),
            orderBy: [desc(approvalRequests.createdAt)],
            limit: 20,
        })

        if (!pendingRows.length) return null

        if (!input.operation) {
            return pendingRows[0]
        }

        const expectedOperation = input.operation.toLowerCase()
        const sameOperation = pendingRows.find((row: any) => {
            const op = row?.requestData && typeof row.requestData === 'object'
                ? String((row.requestData as any).operation || '').toLowerCase()
                : ''
            return op === expectedOperation
        })

        return sameOperation || null
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
        const requestContext = await ApprovalRepository.findRequestById(id)
        const dbx = getDatabase(requestContext?.tenantId || 'tenant')
        const [request] = await dbx.update(approvalRequests)
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
    findActionsByRequest: async (requestId: string) => {
        return getDatabase('tenant').query.approvalActions.findMany({
            where: eq(approvalActions.requestId, requestId),
            with: { approver: true },
            orderBy: [asc(approvalActions.createdAt)],
        })
    },

    /**
     * Create a new approval action.
     * 
     * @param data - The action data
     * @returns The created action
     */
    createAction: async (data: NewApprovalAction) => {
        // Route action writes to the same DB where request lives.
        const request = await ApprovalRepository.findRequestById(String(data.requestId))
        const dbx = request?.tenantId ? getDatabase(request.tenantId) : getDatabase('tenant')
        const [action] = await dbx.insert(approvalActions).values(data).returning()
        return action
    },

    // ---------------------------------------------------------------------------
    // AGGREGATE QUERIES
    // ---------------------------------------------------------------------------

    countPendingByTenant: async (tenantId: string) => {
        const dbx = getDatabase(tenantId)
        const result = await dbx.select({ count: count() })
            .from(approvalRequests)
            .where(and(
                eq(approvalRequests.tenantId, tenantId),
                eq(approvalRequests.status, 'pending')
            ))
        return result[0]?.count ?? 0
    },

    getExpiredRequests: () =>
        getDatabase('tenant').query.approvalRequests.findMany({
            where: and(
                eq(approvalRequests.status, 'pending'),
                lte(approvalRequests.expiresAt, new Date())
            ),
        }),
}

export type ApprovalRepositoryType = typeof ApprovalRepository
