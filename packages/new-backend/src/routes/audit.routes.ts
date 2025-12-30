import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { Effect, pipe } from 'effect'
import type { AppContext } from '../app'
import { authMiddleware, tenantMiddleware } from '../middleware'
import { runEffect } from '../lib/effect'
import * as auditService from '../services/audit.service'

export const auditRoutes = new Hono<AppContext>()

// Apply auth and tenant middleware to all routes
auditRoutes.use('*', authMiddleware)
auditRoutes.use('*', tenantMiddleware)

// =============================================================================
// SCHEMA DEFINITIONS
// =============================================================================

const queryAuditLogsSchema = z.object({
    userId: z.string().uuid().optional(),
    eventType: z.string().optional(),
    action: z.string().optional(),
    entityType: z.string().optional(),
    entityId: z.string().optional(),
    riskLevel: z.enum(['low', 'medium', 'high', 'critical']).optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    limit: z.coerce.number().int().min(1).max(100).default(50),
    offset: z.coerce.number().int().min(0).default(0),
})

const createAuditLogSchema = z.object({
    eventType: z.string().min(1).max(100),
    action: z.string().min(1).max(100),
    description: z.string().optional(),
    entityType: z.string().max(100).optional(),
    entityId: z.string().max(255).optional(),
    entityName: z.string().max(200).optional(),
    oldValues: z.record(z.unknown()).optional(),
    newValues: z.record(z.unknown()).optional(),
    riskLevel: z.enum(['low', 'medium', 'high', 'critical']).default('low'),
    complianceCategory: z.string().max(50).optional(),
})

// =============================================================================
// AUDIT LOG ROUTES
// =============================================================================

/**
 * GET /logs - Query audit logs
 */
auditRoutes.get('/logs', zValidator('query', queryAuditLogsSchema), async (c) => {
    const tenantId = c.get('tenantId')!
    const query = c.req.valid('query')

    const effect = auditService.queryAuditLogs({
        tenantId,
        userId: query.userId,
        eventType: query.eventType,
        action: query.action,
        entityType: query.entityType,
        entityId: query.entityId,
        riskLevel: query.riskLevel,
        startDate: query.startDate ? new Date(query.startDate) : undefined,
        endDate: query.endDate ? new Date(query.endDate) : undefined,
        limit: query.limit,
        offset: query.offset,
    })

    return runEffect(c, effect)
})

/**
 * GET /logs/:logId - Get audit log by ID
 */
auditRoutes.get('/logs/:logId', async (c) => {
    const { logId } = c.req.param()

    const effect = auditService.getAuditLogById(logId)

    return runEffect(c, effect)
})

/**
 * POST /logs - Create audit log (for internal/admin use)
 */
auditRoutes.post('/logs', zValidator('json', createAuditLogSchema), async (c) => {
    const tenantId = c.get('tenantId')!
    const userId = c.get('userId')
    const body = c.req.valid('json')

    const effect = auditService.createAuditLog({
        ...body,
        tenantId,
        userId,
        ipAddress: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
        userAgent: c.req.header('user-agent'),
        requestPath: c.req.path,
        requestMethod: c.req.method,
    })

    return runEffect(c, effect)
})

// =============================================================================
// USER ACTIVITY ROUTES
// =============================================================================

/**
 * GET /users/:userId/activity - Get user activity logs
 */
auditRoutes.get('/users/:userId/activity', async (c) => {
    const { userId } = c.req.param()
    const tenantId = c.get('tenantId')!
    const limit = parseInt(c.req.query('limit') || '50')
    const offset = parseInt(c.req.query('offset') || '0')
    const startDate = c.req.query('startDate')
    const endDate = c.req.query('endDate')

    const effect = pipe(
        auditService.getUserActivityLogs(userId, {
            tenantId,
            limit,
            offset,
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
        }),
        Effect.map((activities) => activities)
    )

    return runEffect(c, effect)
})

/**
 * POST /activity - Log user activity
 */
auditRoutes.post(
    '/activity',
    zValidator(
        'json',
        z.object({
            activityType: z.string().min(1).max(100),
            description: z.string().optional(),
            metadata: z.record(z.unknown()).optional(),
        })
    ),
    async (c) => {
        const tenantId = c.get('tenantId')!
        const userId = c.get('userId')!
        const body = c.req.valid('json')

        const effect = auditService.logUserActivity({
            userId,
            tenantId,
            activityType: body.activityType,
            description: body.description,
            metadata: body.metadata,
            ipAddress: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
            userAgent: c.req.header('user-agent'),
            sessionId: c.req.header('x-session-id'),
        })

        return runEffect(c, effect)
    }
)

// =============================================================================
// DATA ACCESS LOG ROUTES
// =============================================================================

/**
 * POST /data-access - Log data access
 */
auditRoutes.post(
    '/data-access',
    zValidator(
        'json',
        z.object({
            accessType: z.enum(['read', 'export', 'print']),
            resourceType: z.string().min(1).max(100),
            resourceId: z.string().max(255).optional(),
            recordCount: z.number().int().optional(),
            purpose: z.string().optional(),
        })
    ),
    async (c) => {
        const tenantId = c.get('tenantId')!
        const userId = c.get('userId')!
        const body = c.req.valid('json')

        const effect = auditService.logDataAccess({
            userId,
            tenantId,
            accessType: body.accessType,
            resourceType: body.resourceType,
            resourceId: body.resourceId,
            recordCount: body.recordCount,
            purpose: body.purpose,
            ipAddress: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
        })

        return runEffect(c, effect)
    }
)

// =============================================================================
// CALCULATION AUDIT ROUTES
// =============================================================================

/**
 * POST /calculation - Log calculation audit
 */
auditRoutes.post(
    '/calculation',
    zValidator(
        'json',
        z.object({
            calculationType: z.string().min(1).max(100),
            calculationDate: z.string().datetime(),
            parameters: z.record(z.unknown()).optional(),
            inputSummary: z.record(z.unknown()).optional(),
            outputSummary: z.record(z.unknown()).optional(),
            status: z.enum(['started', 'completed', 'failed']),
            errorMessage: z.string().optional(),
            executionTimeMs: z.number().int().optional(),
            recordsProcessed: z.number().int().optional(),
        })
    ),
    async (c) => {
        const tenantId = c.get('tenantId')!
        const userId = c.get('userId')!
        const body = c.req.valid('json')

        const effect = auditService.logCalculationAudit({
            userId,
            tenantId,
            calculationType: body.calculationType,
            calculationDate: new Date(body.calculationDate),
            parameters: body.parameters,
            inputSummary: body.inputSummary,
            outputSummary: body.outputSummary,
            status: body.status,
            errorMessage: body.errorMessage,
            executionTimeMs: body.executionTimeMs,
            recordsProcessed: body.recordsProcessed,
        })

        return runEffect(c, effect)
    }
)

// =============================================================================
// STATISTICS AND REPORTING
// =============================================================================

/**
 * GET /statistics - Get audit statistics
 */
auditRoutes.get('/statistics', async (c) => {
    const tenantId = c.get('tenantId')!

    const effect = auditService.getAuditStatistics(tenantId)

    return runEffect(c, effect)
})

/**
 * GET /export - Export audit logs (placeholder)
 */
auditRoutes.get('/export', async (c) => {
    const tenantId = c.get('tenantId')!
    const format = c.req.query('format') || 'csv'

    // TODO: Implement actual export logic
    return c.json({
        success: true,
        message: 'Export is being prepared',
        data: {
            format,
            status: 'pending',
            downloadUrl: `/api/audit/export/download/${Date.now()}`,
        },
    })
})
