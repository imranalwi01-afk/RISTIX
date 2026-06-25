import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { Effect, pipe } from 'effect'
import type { AppContext } from '../app'
import { authMiddleware, tenantMiddleware } from '../middleware'
import { runEffect } from '../lib/effect'
import * as approvalService from '../services/approval.service'
import * as auditService from '../services/audit.service'
import { openApiValidationHook } from '../lib/http/openapi-validation-hook'
import {
    ListQueryValidationError,
    buildListResponse,
    buildOffsetPagination,
    parseListQuery,
    type ListQueryConfig,
} from '../lib/http/list-query'

export const approvalRoutes = new OpenAPIHono<AppContext>({ defaultHook: openApiValidationHook })

// Apply auth and tenant middleware
approvalRoutes.use('*', authMiddleware)
approvalRoutes.use('*', tenantMiddleware)

// =============================================================================
// SCHEMA DEFINITIONS
// =============================================================================

const CreateRequestSchema = z.object({
    entityType: z.string().min(1).openapi({ example: 'loan_application' }),
    entityId: z.string().optional().openapi({ example: '123e4567-e89b-12d3-a456-426614174000' }),
    title: z.string().min(1).max(500).openapi({ example: 'Loan Application #12345' }),
    description: z.string().optional().openapi({ example: 'Approval for new loan application' }),
    requestData: z.record(z.unknown()).optional(),
    impactLevel: z.enum(['low', 'medium', 'high', 'critical']).optional(),
}).openapi('CreateApprovalRequestInput')

const ProcessActionSchema = z.object({
    action: z.enum(['approve', 'reject', 'request_info', 'delegate']),
    comment: z.string().optional(),
    conditions: z.string().optional(),
    delegatedTo: z.string().optional(), // Removed uuid validation constraint for flex, or keep if strict
    riskScore: z.number().int().min(0).max(10).optional(),
}).openapi('ProcessApprovalActionInput')

const CancelRequestSchema = z.object({
    reason: z.string().max(1000).optional(),
}).openapi('CancelApprovalRequestInput')

const APPROVAL_REQUEST_LIST_QUERY_CONFIG: ListQueryConfig = {
    defaultLimit: 50,
    maxLimit: 200,
    defaultSort: [{ field: 'createdAt', direction: 'desc' }],
    searchableColumns: ['id', 'title', 'description', 'entityType', 'entityId', 'status'],
    filterDefinitions: {
        createdAt: { field: 'createdAt', label: 'Date', type: 'date', operators: ['from', 'to'] },
        status: {
            field: 'status',
            label: 'Status',
            type: 'enum',
            options: [
                { label: 'Pending', value: 'pending' },
                { label: 'Approved', value: 'approved' },
                { label: 'Rejected', value: 'rejected' },
                { label: 'Cancelled', value: 'cancelled' },
                { label: 'Expired', value: 'expired' },
            ],
        },
        impactLevel: {
            field: 'impactLevel',
            label: 'Priority',
            type: 'enum',
            options: [
                { label: 'Critical', value: 'critical' },
                { label: 'High', value: 'high' },
                { label: 'Medium', value: 'medium' },
                { label: 'Low', value: 'low' },
            ],
        },
        bankingType: {
            field: 'bankingType',
            label: 'Banking Type',
            type: 'enum',
            options: [
                { label: 'Conventional', value: 'conventional' },
                { label: 'Syariah', value: 'syariah' },
                { label: 'Dual', value: 'dual' },
            ],
        },
        currentLevel: { field: 'currentLevel', label: 'Current Level', type: 'number', operators: ['min', 'max'] },
        riskLevel: {
            field: 'riskLevel',
            label: 'Risk Level',
            type: 'enum',
            options: [
                { label: 'Critical', value: 'critical' },
                { label: 'High', value: 'high' },
                { label: 'Medium', value: 'medium' },
                { label: 'Low', value: 'low' },
            ],
        },
        entityType: { field: 'entityType', label: 'Entity Type', type: 'text', operators: ['contains', 'equals'] },
        entityId: { field: 'entityId', label: 'Entity ID', type: 'text', operators: ['equals'] },
        requestedBy: { field: 'requestedBy', label: 'Requested By', type: 'text', operators: ['equals'] },
        operation: { field: 'operation', label: 'Operation', type: 'text', operators: ['contains', 'equals'] },
    },
    sortableColumns: ['createdAt', 'updatedAt', 'status', 'entityType', 'title', 'impactLevel', 'currentLevel'],
}

const approvalListQueryBadRequest = (c: any, error: ListQueryValidationError) =>
    c.json({
        success: false,
        error: error.message,
        message: error.message,
        code: 'INVALID_LIST_QUERY',
        details: error.details,
    }, 400)

const MatrixLevelSchema = z.object({
    level: z.number().int().min(1),
    name: z.string().min(1),
    requiredRoleCodes: z.array(z.string()).optional(),
    requiredPermissionCodes: z.array(z.string()).optional(),
    roleMatchMode: z.enum(['ANY', 'ALL']).optional(),
    permissionMatchMode: z.enum(['ANY', 'ALL']).optional(),
    // Backward compatibility for older clients.
    requiredRoles: z.array(z.string()).optional(),
    requiredCount: z.number().int().min(1).default(1),
    maxAmount: z.number().optional(),
    timeoutHours: z.number().int().optional(),
}).openapi('ApprovalMatrixLevel')

const CreateMatrixSchema = z.object({
    name: z.string().min(1).max(255).openapi({ example: 'Standard Loan Approval' }),
    description: z.string().optional(),
    entityType: z.string().min(1).openapi({ example: 'loan_application' }),
    operationType: z.string().optional(),
    bankingMode: z.enum(['conventional', 'syariah', 'dual']).optional(),
    syariahBoardRequired: z.boolean().optional(),
    levels: z.array(MatrixLevelSchema),
}).openapi('CreateApprovalMatrixInput')

const UpdateMatrixSchema = z.object({
    name: z.string().min(1).max(255).optional(),
    description: z.string().nullable().optional(),
    entityType: z.string().min(1).optional(),
    operationType: z.string().nullable().optional(),
    bankingMode: z.enum(['conventional', 'syariah', 'dual']).nullable().optional(),
    syariahBoardRequired: z.boolean().optional(),
    isActive: z.boolean().optional(),
    levels: z.array(MatrixLevelSchema).optional(),
}).openapi('UpdateApprovalMatrixInput')

const ApprovalRequestSchema = z.object({
    id: z.string().openapi({ example: '123e4567-e89b-12d3-a456-426614174000' }),
    entityType: z.string(),
    entityId: z.string().optional(),
    title: z.string(),
    description: z.string().nullable().optional(),
    status: z.string(),
    requestedBy: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
}).openapi('ApprovalRequest')

const ApprovalMatrixSchema = z.object({
    id: z.string().openapi({ example: '123e4567-e89b-12d3-a456-426614174000' }),
    name: z.string(),
    entityType: z.string(),
    levels: z.array(MatrixLevelSchema).optional(),
    createdAt: z.string(),
}).openapi('ApprovalMatrix')

const RoutingCandidateSchema = z.object({
    userId: z.string(),
    fullName: z.string(),
    email: z.string(),
    department: z.string().nullable().optional(),
    position: z.string().nullable().optional(),
    roleCodes: z.array(z.string()),
}).openapi('ApprovalRoutingCandidate')

const RoutingLevelSchema = z.object({
    level: z.number().int().min(1),
    name: z.string(),
    requiredRoleCodes: z.array(z.string()),
    requiredPermissionCodes: z.array(z.string()),
    requiredCount: z.number().int().min(1),
    timeoutHours: z.number().int().optional(),
    candidateCount: z.number().int().min(0),
    candidates: z.array(RoutingCandidateSchema),
}).openapi('ApprovalRoutingLevel')

const ApprovalRoutingSchema = z.object({
    entityType: z.string(),
    operationType: z.string(),
    matrixId: z.string().nullable(),
    matrixName: z.string(),
    isActive: z.boolean(),
    levels: z.array(RoutingLevelSchema),
}).openapi('ApprovalRouting')

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

const looksLikeUuid = (value: unknown): boolean =>
    typeof value === 'string' && UUID_REGEX.test(value.trim())

const toNonUuidString = (value: unknown): string | null => {
    if (typeof value !== 'string') return null
    const trimmed = value.trim()
    if (!trimmed || looksLikeUuid(trimmed)) return null
    return trimmed
}

const buildRequestedByMeta = (request: any): {
    requestedByName: string
    requestedByEmail: string | null
    requestedByUsername: string | null
} => {
    const requester = request?.requester || {}
    const requestData = request?.requestData || {}

    const fullName = toNonUuidString(requester?.fullName)
    const email = toNonUuidString(requester?.email)
    const username = toNonUuidString(requester?.username)
    const explicitName = toNonUuidString(request?.requestedByName)
    const explicitEmail = toNonUuidString(request?.requestedByEmail)
    const explicitUsername = toNonUuidString(request?.requestedByUsername)
    const dataName = toNonUuidString(requestData?.requestedByName)
    const dataEmail = toNonUuidString(requestData?.requestedByEmail)
    const dataUsername = toNonUuidString(requestData?.requestedByUsername)

    const requestedByName =
        (fullName && email ? `${fullName} (${email})` : null)
        || email
        || username
        || fullName
        || explicitName
        || explicitEmail
        || explicitUsername
        || dataName
        || dataEmail
        || dataUsername
        || 'Unknown User'

    return {
        requestedByName,
        requestedByEmail: email || explicitEmail || dataEmail || null,
        requestedByUsername: username || explicitUsername || dataUsername || null,
    }
}

const serializeApprovalRequestForAudit = (request: any) => ({
    id: request.id,
    title: request.title,
    entityType: request.entityType,
    entityId: request.entityId ?? null,
    status: request.status,
    currentLevel: request.currentLevel ?? null,
    approvalsRequired: request.approvalsRequired ?? null,
    approvalsReceived: request.approvalsReceived ?? null,
    impactLevel: request.impactLevel ?? null,
    requestData: request.requestData ?? null,
})

const serializeApprovalMatrixForAudit = (matrix: any, levels?: unknown[]) => ({
    id: matrix.id,
    name: matrix.name,
    description: matrix.description ?? null,
    entityType: matrix.entityType,
    operationType: matrix.operationType ?? null,
    bankingMode: matrix.bankingMode ?? null,
    syariahBoardRequired: Boolean(matrix.syariahBoardRequired),
    isActive: typeof matrix.isActive === 'boolean' ? matrix.isActive : true,
    levels: levels ?? matrix.levels ?? [],
})

const promiseEffect = <A>(fn: () => Promise<A>) =>
    Effect.tryPromise({
        try: fn,
        catch: (error) => error as any,
    })

// =============================================================================
// ROUTES
// =============================================================================

// =============================================================================
// PENDING APPROVALS
// =============================================================================

/**
 * GET /approvals/pending - Get my pending approvals
 */
approvalRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/pending',
        tags: ['Approvals'],
        summary: 'Get Pending Approvals',
        security: [{ BearerAuth: [] }],
        responses: {
            200: {
                content: {
                    'application/json': {
                        schema: z.array(ApprovalRequestSchema),
                    },
                },
                description: 'Pending approvals',
            },
        },
    }),
    async (c) => {
        const userId = c.get('userId')!
        const tenantId = c.get('tenantId')!

        const effect = pipe(
            approvalService.getPendingApprovalsForUser(userId, tenantId),
            Effect.map((requests) => requests.map(r => ({
                ...(r as any),
                ...buildRequestedByMeta(r),
                description: (r as any).description ?? null,
                createdAt: r.createdAt.toISOString(),
                updatedAt: (r as any).updatedAt?.toISOString() || new Date().toISOString(),
            })))
        )

        return runEffect(c, effect) as any
    }
)

/**
 * POST /approvals/requests/:id/cancel - Cancel request
 */
approvalRoutes.openapi(
    createRoute({
        method: 'post',
        path: '/requests/{id}/cancel',
        tags: ['Approvals'],
        summary: 'Cancel Approval Request',
        security: [{ BearerAuth: [] }],
        request: {
            params: z.object({
                id: z.string().openapi({ param: { name: 'id', in: 'path' } }),
            }),
            body: {
                content: {
                    'application/json': {
                        schema: CancelRequestSchema,
                    },
                },
            },
        },
        responses: {
            200: {
                content: {
                    'application/json': {
                        schema: z.object({ success: z.boolean(), result: z.any() }),
                    },
                },
                description: 'Cancelled',
            },
        },
    }),
    async (c) => {
        const { id } = c.req.valid('param')
        const userId = c.get('userId')!
        const tenantId = c.get('tenantId')!
        const body = c.req.valid('json')
        const isSystemUser = c.get('isSystemUser') === true

        const effect = pipe(
            approvalService.getApprovalRequest(id),
            Effect.flatMap((existingRequest) =>
                pipe(
                    approvalService.cancelApprovalRequest({
                        requestId: id,
                        cancelledBy: userId,
                        isSystemUser,
                        reason: body.reason,
                    }),
                    Effect.tap((result) =>
                        promiseEffect(() =>
                            auditService.logApproval.cancelled(
                                id,
                                existingRequest.title,
                                userId,
                                tenantId,
                                body.reason,
                                {
                                    entityType: existingRequest.entityType,
                                    newValues: {
                                        reason: body.reason,
                                        status: result.status,
                                    },
                                    metadata: {
                                        cancelledBySystemUser: isSystemUser,
                                    },
                                }
                            )
                        )
                    ),
                    Effect.map((result) => ({ success: true, result }))
                )
            )
        )

        return runEffect(c, effect)
    }
)

/**
 * PUT /approvals/matrices/:id - Update approval matrix
 */
approvalRoutes.openapi(
    createRoute({
        method: 'put',
        path: '/matrices/{id}',
        tags: ['Approvals'],
        summary: 'Update Approval Matrix',
        security: [{ BearerAuth: [] }],
        request: {
            params: z.object({
                id: z.string().openapi({ param: { name: 'id', in: 'path' } }),
            }),
            body: {
                content: {
                    'application/json': {
                        schema: UpdateMatrixSchema,
                    },
                },
            },
        },
        responses: {
            200: {
                content: {
                    'application/json': {
                        schema: ApprovalMatrixSchema,
                    },
                },
                description: 'Matrix updated',
            },
        },
    }),
    async (c) => {
        const tenantId = c.get('tenantId')!
        const userId = c.get('userId')!
        const { id } = c.req.valid('param')
        const body = c.req.valid('json')

        const normalizeLevel = (level: z.infer<typeof MatrixLevelSchema>) => {
            const legacyRequired = Array.isArray(level.requiredRoles) ? level.requiredRoles : []
            const requiredRoleCodes = Array.isArray(level.requiredRoleCodes)
                ? level.requiredRoleCodes
                : legacyRequired.filter((entry) => typeof entry === 'string' && !entry.includes('.'))
            const requiredPermissionCodes = Array.isArray(level.requiredPermissionCodes)
                ? level.requiredPermissionCodes
                : legacyRequired.filter((entry) => typeof entry === 'string' && entry.includes('.'))
            const { requiredRoles, ...restLevel } = level

            return {
                ...restLevel,
                requiredRoleCodes,
                requiredPermissionCodes: requiredPermissionCodes.length > 0
                    ? requiredPermissionCodes
                    : ['approval.requests.approve'],
                roleMatchMode: level.roleMatchMode || 'ANY',
                permissionMatchMode: level.permissionMatchMode || 'ANY',
            }
        }

        const levels = Array.isArray(body.levels)
            ? body.levels.map(normalizeLevel)
            : undefined

        const matrixData = { ...body } as Record<string, unknown>
        delete matrixData.levels
        const effect = pipe(
            approvalService.getApprovalMatrices(tenantId),
            Effect.flatMap((currentMatrices) => {
                const existingMatrix = currentMatrices.find((matrix: any) => matrix.id === id)
                return pipe(
                    approvalService.updateApprovalMatrix(
                        tenantId,
                        id,
                        matrixData as any,
                        levels as any
                    ),
                    Effect.tap((updatedMatrix) =>
                        promiseEffect(() =>
                            auditService.logDataChange.update(
                                'approval_matrix',
                                id,
                                existingMatrix ? serializeApprovalMatrixForAudit(existingMatrix) : {},
                                serializeApprovalMatrixForAudit(updatedMatrix, levels),
                                userId,
                                tenantId
                            )
                        )
                    ),
                    Effect.map((updatedMatrix) => ({
                        ...updatedMatrix,
                        createdAt: updatedMatrix.createdAt.toISOString(),
                    }))
                )
            })
        )

        return runEffect(c, effect)
    }
)

// =============================================================================
// APPROVAL REQUESTS
// =============================================================================

/**
 * GET /approvals/requests - List approval requests
 */
approvalRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/requests',
        tags: ['Approvals'],
        summary: 'List Approval Requests',
        security: [{ BearerAuth: [] }],
        request: {
            query: z.object({
                page: z.string().optional(),
                offset: z.string().optional(),
                limit: z.string().optional(),
                filters: z.string().optional(),
                sort: z.string().optional(),
                sortField: z.string().optional(),
                sortOrder: z.enum(['asc', 'desc']).optional(),
                entityType: z.string().optional(),
                entityId: z.string().optional(),
                status: z.string().optional(),
                impactLevel: z.string().optional(),
                bankingType: z.string().optional(),
                currentLevel: z.string().optional(),
                riskLevel: z.string().optional(),
                requestedBy: z.string().optional(),
                operation: z.string().optional(),
                search: z.string().optional(),
            }),
        },
        responses: {
            200: {
                content: {
                    'application/json': {
                        schema: z.array(ApprovalRequestSchema),
                    },
                },
                description: 'Approval requests',
            },
        },
    }),
    async (c) => {
        try {
            const tenantId = c.get('tenantId')!
            const query = parseListQuery(c, APPROVAL_REQUEST_LIST_QUERY_CONFIG)
            const filters = query.filters
            const result = await Effect.runPromise(approvalService.getApprovalHistoryList({
                tenantId,
                entityType: filters.entityType ? String(filters.entityType) : undefined,
                entityId: filters.entityId ? String(filters.entityId) : undefined,
                status: filters.status ? String(filters.status) : undefined,
                impactLevel: filters.impactLevel ? String(filters.impactLevel) : undefined,
                bankingType: filters.bankingType ? String(filters.bankingType) : undefined,
                currentLevel: filters['currentLevel.min']
                    ? Number(filters['currentLevel.min'])
                    : filters.currentLevel
                        ? Number(filters.currentLevel)
                        : undefined,
                currentLevelMin: filters['currentLevel.min'] ? Number(filters['currentLevel.min']) : undefined,
                currentLevelMax: filters['currentLevel.max'] ? Number(filters['currentLevel.max']) : undefined,
                riskLevel: filters.riskLevel ? String(filters.riskLevel) : undefined,
                requestedBy: filters.requestedBy ? String(filters.requestedBy) : undefined,
                operation: filters.operation ? String(filters.operation) : undefined,
                search: query.search,
                createdAtFrom: filters['createdAt.from'] ? new Date(String(filters['createdAt.from'])) : undefined,
                createdAtTo: filters['createdAt.to'] ? new Date(String(filters['createdAt.to'])) : undefined,
                limit: query.limit,
                offset: query.offset ?? 0,
                sort: query.sort[0],
            }) as any) as { data: any[]; total: number }

            const data = result.data.map((r: any) => ({
                ...r,
                ...buildRequestedByMeta(r),
                description: r.description ?? null,
                createdAt: r.createdAt.toISOString(),
                updatedAt: (r as any).completedAt?.toISOString() || r.createdAt.toISOString(),
            }))

            return c.json(buildListResponse(
                data,
                query,
                buildOffsetPagination(query, result.total),
                { filterDefinitions: APPROVAL_REQUEST_LIST_QUERY_CONFIG.filterDefinitions },
            ) as any)
        } catch (error: any) {
            if (error instanceof ListQueryValidationError) return approvalListQueryBadRequest(c, error)
            throw error
        }
    }
)

/**
 * POST /approvals/requests - Create new approval request
 */
approvalRoutes.openapi(
    createRoute({
        method: 'post',
        path: '/requests',
        tags: ['Approvals'],
        summary: 'Create Approval Request',
        security: [{ BearerAuth: [] }],
        request: {
            body: {
                content: {
                    'application/json': {
                        schema: CreateRequestSchema,
                    },
                },
            },
        },
        responses: {
            200: {
                content: {
                    'application/json': {
                        schema: ApprovalRequestSchema,
                    },
                },
                description: 'Request created',
            },
        },
    }),
    async (c) => {
        const userId = c.get('userId')!
        const tenantId = c.get('tenantId')!
        const body = c.req.valid('json')
        const user = c.get('user') as Record<string, unknown> | undefined
        const incomingRequestData = (body.requestData || {}) as Record<string, unknown>
        const requestData: Record<string, unknown> = {
            ...incomingRequestData,
        }

        if (!toNonUuidString(requestData.requestedByName)) {
            requestData.requestedByName = toNonUuidString(user?.fullName) || toNonUuidString(user?.username) || null
        }
        if (!toNonUuidString(requestData.requestedByEmail)) {
            requestData.requestedByEmail = toNonUuidString(user?.email) || null
        }
        if (!toNonUuidString(requestData.requestedByUsername)) {
            requestData.requestedByUsername = toNonUuidString(user?.username) || null
        }

        const effect = pipe(
            approvalService.createApprovalRequest({
                ...body,
                tenantId,
                requestedBy: userId,
                requestData,
            }),
            Effect.tap((request) =>
                promiseEffect(() =>
                    auditService.logApproval.requested(
                        request.id,
                        request.title,
                        userId,
                        tenantId,
                        {
                            entityType: request.entityType,
                            description: request.description || `Created approval request: ${request.title}`,
                            oldValues: typeof request.requestData === 'object' && request.requestData
                                ? ((request.requestData as Record<string, unknown>).oldValues ?? undefined)
                                : undefined,
                            newValues: serializeApprovalRequestForAudit(request),
                        }
                    )
                )
            ),
            Effect.map((request) => ({
                ...request,
                description: request.description ?? null,
                createdAt: request.createdAt.toISOString(),
                updatedAt: (request as any).completedAt?.toISOString() || request.createdAt.toISOString(),
            }))
        )

        return runEffect(c, effect)
    }
)

/**
 * GET /approvals/requests/:id - Get request details
 */
approvalRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/requests/{id}',
        tags: ['Approvals'],
        summary: 'Get Approval Request',
        security: [{ BearerAuth: [] }],
        request: {
            params: z.object({
                id: z.string().openapi({ param: { name: 'id', in: 'path' } }),
            }),
        },
        responses: {
            200: {
                content: {
                    'application/json': {
                        schema: ApprovalRequestSchema,
                    },
                },
                description: 'Request details',
            },
            404: { description: 'Request not found' }
        },
    }),
    async (c) => {
        const { id } = c.req.valid('param')

        const effect = pipe(
            approvalService.getApprovalRequest(id),
            Effect.map(request => {
                const requestedByMeta = buildRequestedByMeta(request)
                return ({
                ...request,
                ...requestedByMeta,
                description: request.description ?? null,
                createdAt: request.createdAt.toISOString(),
                updatedAt: (request as any).completedAt?.toISOString() || request.createdAt.toISOString(),
                })
            })
        )

        return runEffect(c, effect)
    }
)

/**
 * POST /approvals/requests/:id/approve - Approve request
 */
approvalRoutes.openapi(
    createRoute({
        method: 'post',
        path: '/requests/{id}/approve',
        tags: ['Approvals'],
        summary: 'Approve Request',
        security: [{ BearerAuth: [] }],
        request: {
            params: z.object({
                id: z.string().openapi({ param: { name: 'id', in: 'path' } }),
            }),
            body: {
                content: {
                    'application/json': {
                        schema: ProcessActionSchema.partial(), // Just comment/conditions/riskScore
                    },
                },
            },
        },
        responses: {
            200: {
                content: {
                    'application/json': {
                        schema: z.object({ success: z.boolean(), result: z.any() }),
                    },
                },
                description: 'Approved',
            },
        },
    }),
    async (c) => {
        const { id } = c.req.valid('param')
        const userId = c.get('userId')!
        const tenantId = c.get('tenantId')!
        const body = c.req.valid('json')

        const effect = pipe(
            approvalService.getApprovalRequest(id),
            Effect.flatMap((existingRequest) =>
                pipe(
                    approvalService.processApprovalAction({
                        requestId: id,
                        approverId: userId,
                        action: 'approve',
                        comment: body.comment,
                        conditions: body.conditions,
                        riskScore: body.riskScore,
                    }),
                    Effect.tap((result) =>
                        promiseEffect(() =>
                            auditService.logApproval.approved(
                                id,
                                existingRequest.title,
                                userId,
                                tenantId,
                                body.comment,
                                {
                                    entityType: existingRequest.entityType,
                                    newValues: {
                                        comment: body.comment,
                                        conditions: body.conditions,
                                        riskScore: body.riskScore,
                                        status: result.status,
                                        completed: result.completed,
                                        requestData: existingRequest.requestData ?? null,
                                    },
                                }
                            )
                        )
                    ),
                    Effect.map((result) => ({ success: true, result }))
                )
            )
        )

        return runEffect(c, effect)
    }
)

/**
 * POST /approvals/requests/:id/reject - Reject request
 */
approvalRoutes.openapi(
    createRoute({
        method: 'post',
        path: '/requests/{id}/reject',
        tags: ['Approvals'],
        summary: 'Reject Request',
        security: [{ BearerAuth: [] }],
        request: {
            params: z.object({
                id: z.string().openapi({ param: { name: 'id', in: 'path' } }),
            }),
            body: {
                content: {
                    'application/json': {
                        schema: ProcessActionSchema.partial(),
                    },
                },
            },
        },
        responses: {
            200: {
                content: {
                    'application/json': {
                        schema: z.object({ success: z.boolean(), result: z.any() }),
                    },
                },
                description: 'Rejected',
            },
        },
    }),
    async (c) => {
        const { id } = c.req.valid('param')
        const userId = c.get('userId')!
        const tenantId = c.get('tenantId')!
        const body = c.req.valid('json')

        const effect = pipe(
            approvalService.getApprovalRequest(id),
            Effect.flatMap((existingRequest) =>
                pipe(
                    approvalService.processApprovalAction({
                        requestId: id,
                        approverId: userId,
                        action: 'reject',
                        comment: body.comment,
                    }),
                    Effect.tap((result) =>
                        promiseEffect(() =>
                            auditService.logApproval.rejected(
                                id,
                                existingRequest.title,
                                userId,
                                tenantId,
                                body.comment,
                                {
                                    entityType: existingRequest.entityType,
                                    newValues: {
                                        reason: body.comment,
                                        status: result.status,
                                        completed: result.completed,
                                        requestData: existingRequest.requestData ?? null,
                                    },
                                }
                            )
                        )
                    ),
                    Effect.map((result) => ({ success: true, result }))
                )
            )
        )

        return runEffect(c, effect)
    }
)

/**
 * POST /approvals/requests/:id/request-info - Ask requester for more information
 */
approvalRoutes.openapi(
    createRoute({
        method: 'post',
        path: '/requests/{id}/request-info',
        tags: ['Approvals'],
        summary: 'Request More Information',
        security: [{ BearerAuth: [] }],
        request: {
            params: z.object({
                id: z.string().openapi({ param: { name: 'id', in: 'path' } }),
            }),
            body: {
                content: {
                    'application/json': {
                        schema: ProcessActionSchema.partial(),
                    },
                },
            },
        },
        responses: {
            200: {
                content: {
                    'application/json': {
                        schema: z.object({ success: z.boolean(), result: z.any() }),
                    },
                },
                description: 'Info requested',
            },
        },
    }),
    async (c) => {
        const { id } = c.req.valid('param')
        const userId = c.get('userId')!
        const tenantId = c.get('tenantId')!
        const body = c.req.valid('json')

        const effect = pipe(
            approvalService.getApprovalRequest(id),
            Effect.flatMap((existingRequest) =>
                pipe(
                    approvalService.processApprovalAction({
                        requestId: id,
                        approverId: userId,
                        action: 'request_info',
                        comment: body.comment,
                    }),
                    Effect.tap((result) =>
                        promiseEffect(() =>
                            auditService.logApproval.infoRequested(
                                id,
                                existingRequest.title,
                                userId,
                                tenantId,
                                body.comment,
                                {
                                    entityType: existingRequest.entityType,
                                    newValues: {
                                        comment: body.comment,
                                        status: result.status,
                                        completed: result.completed,
                                        requestData: existingRequest.requestData ?? null,
                                    },
                                }
                            )
                        )
                    ),
                    Effect.map((result) => ({ success: true, result }))
                )
            )
        )

        return runEffect(c, effect)
    }
)

/**
 * POST /approvals/requests/:id/delegate - Delegate to another user
 */
approvalRoutes.openapi(
    createRoute({
        method: 'post',
        path: '/requests/{id}/delegate',
        tags: ['Approvals'],
        summary: 'Delegate Request',
        security: [{ BearerAuth: [] }],
        request: {
            params: z.object({
                id: z.string().openapi({ param: { name: 'id', in: 'path' } }),
            }),
            body: {
                content: {
                    'application/json': {
                        schema: z.object({
                            delegatedTo: z.string().uuid(),
                            reason: z.string().optional(),
                        }),
                    },
                },
            },
        },
        responses: {
            200: {
                content: {
                    'application/json': {
                        schema: z.object({ success: z.boolean(), result: z.any() }),
                    },
                },
                description: 'Delegated',
            },
        },
    }),
    async (c) => {
        const { id } = c.req.valid('param')
        const userId = c.get('userId')!
        const tenantId = c.get('tenantId')!
        const body = c.req.valid('json')

        const effect = pipe(
            approvalService.getApprovalRequest(id),
            Effect.flatMap((existingRequest) =>
                pipe(
                    approvalService.processApprovalAction({
                        requestId: id,
                        approverId: userId,
                        action: 'delegate',
                        delegatedTo: body.delegatedTo,
                        comment: body.reason,
                    }),
                    Effect.tap((result) =>
                        promiseEffect(() =>
                            auditService.logApproval.delegated(
                                id,
                                existingRequest.title,
                                userId,
                                tenantId,
                                body.delegatedTo,
                                {
                                    entityType: existingRequest.entityType,
                                    newValues: {
                                        delegatedTo: body.delegatedTo,
                                        reason: body.reason,
                                        status: result.status,
                                        completed: result.completed,
                                        requestData: existingRequest.requestData ?? null,
                                    },
                                }
                            )
                        )
                    ),
                    Effect.map((result) => ({ success: true, result }))
                )
            )
        )

        return runEffect(c, effect)
    }
)

/**
 * GET /approvals/routing - Get approval routing overview and approver candidates
 */
approvalRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/routing',
        tags: ['Approvals'],
        summary: 'Get Approval Routing Overview',
        security: [{ BearerAuth: [] }],
        request: {
            query: z.object({
                entityType: z.string().optional(),
                operation: z.enum(['create', 'update', 'delete']).optional(),
                department: z.string().optional(),
                bankingMode: z.enum(['conventional', 'syariah', 'dual']).optional(),
            }),
        },
        responses: {
            200: {
                description: 'Approval routing overview with candidate approvers',
                content: {
                    'application/json': {
                        schema: z.object({
                            success: z.boolean(),
                            data: z.array(ApprovalRoutingSchema),
                        }),
                    },
                },
            },
        },
    }),
    async (c) => {
        const tenantId = c.get('tenantId')!
        const query = c.req.valid('query')

        const effect = approvalService.getApprovalRoutingOverview({
            tenantId,
            entityType: query.entityType,
            operation: query.operation,
            department: query.department,
            bankingMode: query.bankingMode,
        })

        return runEffect(c, effect)
    }
)

// =============================================================================
// APPROVAL MATRICES
// =============================================================================

/**
 * GET /approvals/matrices - List approval matrices
 */
approvalRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/matrices',
        tags: ['Approvals'],
        summary: 'List Approval Matrices',
        security: [{ BearerAuth: [] }],
        responses: {
            200: {
                content: {
                    'application/json': {
                        schema: z.array(ApprovalMatrixSchema),
                    },
                },
                description: 'Approval matrices',
            },
        },
    }),
    async (c) => {
        const tenantId = c.get('tenantId')!

        const effect = pipe(
            approvalService.getApprovalMatrices(tenantId),
            Effect.map((matrices) => matrices.map(m => ({
                ...m,
                createdAt: m.createdAt.toISOString(),
                // Handle levels if needed
            })))
        )

        return runEffect(c, effect)
    }
)

/**
 * POST /approvals/matrices - Create approval matrix
 */
approvalRoutes.openapi(
    createRoute({
        method: 'post',
        path: '/matrices',
        tags: ['Approvals'],
        summary: 'Create Approval Matrix',
        security: [{ BearerAuth: [] }],
        request: {
            body: {
                content: {
                    'application/json': {
                        schema: CreateMatrixSchema,
                    },
                },
            },
        },
        responses: {
            200: {
                content: {
                    'application/json': {
                        schema: ApprovalMatrixSchema,
                    },
                },
                description: 'Matrix created',
            },
        },
    }),
    async (c) => {
        const tenantId = c.get('tenantId')!
        const userId = c.get('userId')!
        const body = c.req.valid('json')

        const { levels, ...matrixData } = body
        const normalizedLevels = levels.map((level) => {
            const legacyRequired = Array.isArray(level.requiredRoles) ? level.requiredRoles : []
            const requiredRoleCodes = Array.isArray(level.requiredRoleCodes)
                ? level.requiredRoleCodes
                : legacyRequired.filter((entry) => typeof entry === 'string' && !entry.includes('.'))
            const requiredPermissionCodes = Array.isArray(level.requiredPermissionCodes)
                ? level.requiredPermissionCodes
                : legacyRequired.filter((entry) => typeof entry === 'string' && entry.includes('.'))
            const { requiredRoles, ...restLevel } = level

            return {
                ...restLevel,
                requiredRoleCodes,
                requiredPermissionCodes: requiredPermissionCodes.length > 0
                    ? requiredPermissionCodes
                    : ['approval.requests.approve'],
                roleMatchMode: level.roleMatchMode || 'ANY',
                permissionMatchMode: level.permissionMatchMode || 'ANY',
            }
        })

        const effect = pipe(
            approvalService.createApprovalMatrix(
                { ...matrixData, tenantId },
                normalizedLevels
            ),
            Effect.tap((matrix) =>
                promiseEffect(() =>
                    auditService.logDataChange.create(
                        'approval_matrix',
                        matrix.id,
                        serializeApprovalMatrixForAudit(matrix, normalizedLevels),
                        userId,
                        tenantId
                    )
                )
            ),
            Effect.map((matrix) => ({
                ...matrix,
                createdAt: matrix.createdAt.toISOString(),
            }))
        )

        return runEffect(c, effect)
    }
)
