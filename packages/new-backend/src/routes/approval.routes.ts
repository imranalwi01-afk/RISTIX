import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { Effect, pipe } from 'effect'
import type { AppContext } from '../app'
import { authMiddleware, tenantMiddleware } from '../middleware'
import { runEffect } from '../lib/effect'
import * as approvalService from '../services/approval.service'

export const approvalRoutes = new OpenAPIHono<AppContext>()

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

const MatrixLevelSchema = z.object({
    level: z.number().int().min(1),
    name: z.string().min(1),
    requiredRoles: z.array(z.string()),
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
                description: (r as any).description ?? null,
                createdAt: r.createdAt.toISOString(),
                updatedAt: (r as any).updatedAt?.toISOString() || new Date().toISOString(),
            })))
        )

        return runEffect(c, effect) as any
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
                entityType: z.string().optional(),
                entityId: z.string().optional(),
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
        const tenantId = c.get('tenantId')!
        const entityType = c.req.query('entityType')
        const entityId = c.req.query('entityId')

        const effect = pipe(
            approvalService.getApprovalHistory(tenantId, entityType, entityId),
            Effect.map((requests) => requests.map(r => ({
                ...r,
                description: r.description ?? null,
                createdAt: r.createdAt.toISOString(),
                updatedAt: r.updatedAt.toISOString(),
            })))
        )

        return runEffect(c, effect)
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

        const effect = pipe(
            approvalService.createApprovalRequest({
                ...body,
                tenantId,
                requestedBy: userId,
            }),
            Effect.map((request) => ({
                ...request,
                description: request.description ?? null,
                createdAt: request.createdAt.toISOString(),
                updatedAt: request.updatedAt.toISOString(),
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
            Effect.map(request => ({
                ...request,
                description: request.description ?? null,
                createdAt: request.createdAt.toISOString(),
                updatedAt: request.updatedAt.toISOString(),
            }))
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
        const body = c.req.valid('json')

        const effect = pipe(
            approvalService.processApprovalAction({
                requestId: id,
                approverId: userId,
                action: 'approve',
                comment: body.comment,
                conditions: body.conditions,
                riskScore: body.riskScore,
            }),
            Effect.map((result) => ({ success: true, result }))
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
        const body = c.req.valid('json')

        const effect = pipe(
            approvalService.processApprovalAction({
                requestId: id,
                approverId: userId,
                action: 'reject',
                comment: body.comment,
            }),
            Effect.map((result) => ({ success: true, result }))
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
        const body = c.req.valid('json')

        const effect = pipe(
            approvalService.processApprovalAction({
                requestId: id,
                approverId: userId,
                action: 'delegate',
                delegatedTo: body.delegatedTo,
                comment: body.reason,
            }),
            Effect.map((result) => ({ success: true, result }))
        )

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
        const body = c.req.valid('json')

        const { levels, ...matrixData } = body

        const effect = pipe(
            approvalService.createApprovalMatrix(
                { ...matrixData, tenantId },
                levels
            ),
            Effect.map((matrix) => ({
                ...matrix,
                createdAt: matrix.createdAt.toISOString(),
            }))
        )

        return runEffect(c, effect)
    }
)
