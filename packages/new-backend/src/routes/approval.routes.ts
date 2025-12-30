import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { Effect, pipe } from 'effect'
import type { AppContext } from '../app'
import { authMiddleware, tenantMiddleware } from '../middleware'
import { runEffect } from '../lib/effect'
import { sendListResponse, parsePaginationParams } from '../lib/react-admin'
import * as approvalService from '../services/approval.service'

export const approvalRoutes = new Hono<AppContext>()

// Apply auth and tenant middleware
approvalRoutes.use('*', authMiddleware)
approvalRoutes.use('*', tenantMiddleware)

// =============================================================================
// SCHEMA DEFINITIONS
// =============================================================================

const createRequestSchema = z.object({
    entityType: z.string().min(1),
    entityId: z.string().optional(),
    title: z.string().min(1).max(500),
    description: z.string().optional(),
    requestData: z.record(z.unknown()).optional(),
    impactLevel: z.enum(['low', 'medium', 'high', 'critical']).optional(),
})

const processActionSchema = z.object({
    action: z.enum(['approve', 'reject', 'request_info', 'delegate']),
    comment: z.string().optional(),
    conditions: z.string().optional(),
    delegatedTo: z.string().uuid().optional(),
    riskScore: z.number().int().min(0).max(10).optional(),
})

const createMatrixSchema = z.object({
    name: z.string().min(1).max(255),
    description: z.string().optional(),
    entityType: z.string().min(1),
    operationType: z.string().optional(),
    bankingMode: z.enum(['conventional', 'syariah', 'dual']).optional(),
    syariahBoardRequired: z.boolean().optional(),
    levels: z.array(z.object({
        level: z.number().int().min(1),
        name: z.string().min(1),
        requiredRoles: z.array(z.string()),
        requiredCount: z.number().int().min(1).default(1),
        maxAmount: z.number().optional(),
        timeoutHours: z.number().int().optional(),
    })),
})

// =============================================================================
// PENDING APPROVALS
// =============================================================================

/**
 * GET /approvals/pending - Get my pending approvals
 */
approvalRoutes.get('/pending', async (c) => {
    const userId = c.get('userId')!
    const tenantId = c.get('tenantId')!

    const effect = pipe(
        approvalService.getPendingApprovalsForUser(userId, tenantId),
        Effect.map((requests) => requests)
    )

    return runEffect(c, effect)
})

// =============================================================================
// APPROVAL REQUESTS
// =============================================================================

/**
 * GET /approvals/requests - List approval requests
 */
approvalRoutes.get('/requests', async (c) => {
    const tenantId = c.get('tenantId')!
    const entityType = c.req.query('entityType')
    const entityId = c.req.query('entityId')

    const effect = pipe(
        approvalService.getApprovalHistory(tenantId, entityType, entityId),
        Effect.map((requests) => requests)
    )

    return runEffect(c, effect)
})

/**
 * POST /approvals/requests - Create new approval request
 */
approvalRoutes.post('/requests', zValidator('json', createRequestSchema), async (c) => {
    const userId = c.get('userId')!
    const tenantId = c.get('tenantId')!
    const body = c.req.valid('json')

    const effect = pipe(
        approvalService.createApprovalRequest({
            ...body,
            tenantId,
            requestedBy: userId,
        }),
        Effect.map((request) => request)
    )

    return runEffect(c, effect)
})

/**
 * GET /approvals/requests/:id - Get request details
 */
approvalRoutes.get('/requests/:id', async (c) => {
    const { id } = c.req.param()

    const effect = approvalService.getApprovalRequest(id)

    return runEffect(c, effect)
})

/**
 * POST /approvals/requests/:id/approve - Approve request
 */
approvalRoutes.post('/requests/:id/approve', zValidator('json', processActionSchema.partial()), async (c) => {
    const { id } = c.req.param()
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
        Effect.map((result) => result)
    )

    return runEffect(c, effect)
})

/**
 * POST /approvals/requests/:id/reject - Reject request
 */
approvalRoutes.post('/requests/:id/reject', zValidator('json', processActionSchema.partial()), async (c) => {
    const { id } = c.req.param()
    const userId = c.get('userId')!
    const body = c.req.valid('json')

    const effect = pipe(
        approvalService.processApprovalAction({
            requestId: id,
            approverId: userId,
            action: 'reject',
            comment: body.comment,
        }),
        Effect.map((result) => result)
    )

    return runEffect(c, effect)
})

/**
 * POST /approvals/requests/:id/delegate - Delegate to another user
 */
approvalRoutes.post('/requests/:id/delegate', zValidator('json', z.object({
    delegatedTo: z.string().uuid(),
    reason: z.string().optional(),
})), async (c) => {
    const { id } = c.req.param()
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
        Effect.map((result) => result)
    )

    return runEffect(c, effect)
})

// =============================================================================
// APPROVAL MATRICES
// =============================================================================

/**
 * GET /approvals/matrices - List approval matrices
 */
approvalRoutes.get('/matrices', async (c) => {
    const tenantId = c.get('tenantId')!

    const effect = pipe(
        approvalService.getApprovalMatrices(tenantId),
        Effect.map((matrices) => matrices)
    )

    return runEffect(c, effect)
})

/**
 * POST /approvals/matrices - Create approval matrix
 */
approvalRoutes.post('/matrices', zValidator('json', createMatrixSchema), async (c) => {
    const tenantId = c.get('tenantId')!
    const body = c.req.valid('json')

    const { levels, ...matrixData } = body

    const effect = pipe(
        approvalService.createApprovalMatrix(
            { ...matrixData, tenantId },
            levels
        ),
        Effect.map((matrix) => matrix)
    )

    return runEffect(c, effect)
})
