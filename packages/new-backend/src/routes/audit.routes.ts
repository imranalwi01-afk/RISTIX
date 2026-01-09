import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import type { AppContext } from '../app'
import { authMiddleware, tenantMiddleware } from '../middleware'
import { db } from '../config/database'
import { auditLogs, userActivityLogs, dataAccessLogs } from '../db/schema'
import { eq, and, desc, gte, lte, like, sql, or } from 'drizzle-orm'

const app = new Hono<AppContext>()

// Apply auth middleware
app.use('*', authMiddleware)
app.use('*', tenantMiddleware)

// =============================================================================
// AUDIT LOGS
// =============================================================================

/**
 * GET /logs - Get audit logs (paginated and filtered)
 */
app.get('/logs', zValidator('query', z.object({
    page: z.string().optional().default('1'),
    limit: z.string().optional().default('50'),
    eventType: z.string().optional(),
    action: z.string().optional(),
    userId: z.string().optional(),
    entityType: z.string().optional(),
    entityId: z.string().optional(),
    riskLevel: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    search: z.string().optional()
})), async (c) => {
    const tenantId = c.get('tenantId')!
    const query = c.req.valid('query')

    const page = parseInt(query.page)
    const limit = parseInt(query.limit)
    const offset = (page - 1) * limit

    // Build where conditions
    const conditions = [eq(auditLogs.tenantId, tenantId)]

    if (query.eventType) {
        conditions.push(eq(auditLogs.eventType, query.eventType))
    }

    if (query.action) {
        conditions.push(eq(auditLogs.action, query.action))
    }

    if (query.userId) {
        conditions.push(eq(auditLogs.userId, query.userId))
    }

    if (query.entityType) {
        conditions.push(eq(auditLogs.entityType, query.entityType))
    }

    if (query.entityId) {
        conditions.push(eq(auditLogs.entityId, query.entityId))
    }

    if (query.riskLevel) {
        conditions.push(eq(auditLogs.riskLevel, query.riskLevel))
    }

    if (query.startDate) {
        conditions.push(gte(auditLogs.timestamp, new Date(query.startDate)))
    }

    if (query.endDate) {
        conditions.push(lte(auditLogs.timestamp, new Date(query.endDate)))
    }

    if (query.search) {
        conditions.push(
            or(
                like(auditLogs.description, `%${query.search}%`),
                like(auditLogs.entityName, `%${query.search}%`)
            )!
        )
    }

    const whereClause = and(...conditions)

    // Get total count
    const [{ count }] = await db
        .select({ count: sql<number>`count(*)` })
        .from(auditLogs)
        .where(whereClause)

    // Get logs
    const logs = await db
        .select()
        .from(auditLogs)
        .where(whereClause)
        .orderBy(desc(auditLogs.timestamp))
        .limit(limit)
        .offset(offset)

    return c.json({
        data: logs,
        pagination: {
            page,
            limit,
            total: Number(count),
            totalPages: Math.ceil(Number(count) / limit)
        }
    })
})

/**
 * GET /logs/:id - Get specific audit log
 */
app.get('/logs/:id', async (c) => {
    const { id } = c.req.param()
    const tenantId = c.get('tenantId')!

    const [log] = await db
        .select()
        .from(auditLogs)
        .where(and(
            eq(auditLogs.id, id),
            eq(auditLogs.tenantId, tenantId)
        ))
        .limit(1)

    if (!log) {
        return c.json({ error: 'Audit log not found' }, 404)
    }

    return c.json(log)
})

/**
 * GET /stats - Get audit statistics
 */
app.get('/stats', zValidator('query', z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional()
})), async (c) => {
    const tenantId = c.get('tenantId')!
    const { startDate, endDate } = c.req.valid('query')

    const conditions = [eq(auditLogs.tenantId, tenantId)]

    if (startDate) {
        conditions.push(gte(auditLogs.timestamp, new Date(startDate)))
    }

    if (endDate) {
        conditions.push(lte(auditLogs.timestamp, new Date(endDate)))
    }

    const whereClause = and(...conditions)

    // Get stats by event type
    const eventTypeStats = await db
        .select({
            eventType: auditLogs.eventType,
            count: sql<number>`count(*)`
        })
        .from(auditLogs)
        .where(whereClause)
        .groupBy(auditLogs.eventType)

    // Get stats by risk level
    const riskLevelStats = await db
        .select({
            riskLevel: auditLogs.riskLevel,
            count: sql<number>`count(*)`
        })
        .from(auditLogs)
        .where(whereClause)
        .groupBy(auditLogs.riskLevel)

    // Get top users
    const topUsers = await db
        .select({
            userId: auditLogs.userId,
            count: sql<number>`count(*)`
        })
        .from(auditLogs)
        .where(whereClause)
        .groupBy(auditLogs.userId)
        .orderBy(desc(sql`count(*)`))
        .limit(10)

    // Get total count
    const [{ total }] = await db
        .select({ total: sql<number>`count(*)` })
        .from(auditLogs)
        .where(whereClause)

    return c.json({
        total: Number(total),
        byEventType: eventTypeStats.map(s => ({ ...s, count: Number(s.count) })),
        byRiskLevel: riskLevelStats.map(s => ({ ...s, count: Number(s.count) })),
        topUsers: topUsers.map(u => ({ ...u, count: Number(u.count) }))
    })
})

/**
 * POST /export - Export audit logs
 */
app.post('/export', zValidator('json', z.object({
    format: z.enum(['csv', 'json']).default('csv'),
    filters: z.object({
        eventType: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional()
    }).optional()
})), async (c) => {
    const tenantId = c.get('tenantId')!
    const { format, filters } = c.req.valid('json')

    const conditions = [eq(auditLogs.tenantId, tenantId)]

    if (filters?.eventType) {
        conditions.push(eq(auditLogs.eventType, filters.eventType))
    }

    if (filters?.startDate) {
        conditions.push(gte(auditLogs.timestamp, new Date(filters.startDate)))
    }

    if (filters?.endDate) {
        conditions.push(lte(auditLogs.timestamp, new Date(filters.endDate)))
    }

    const logs = await db
        .select()
        .from(auditLogs)
        .where(and(...conditions))
        .orderBy(desc(auditLogs.timestamp))
        .limit(10000) // Max export limit

    if (format === 'json') {
        return c.json(logs)
    } else {
        // CSV format
        const csv = convertToCSV(logs)
        return c.text(csv, 200, {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="audit-logs-${new Date().toISOString()}.csv"`
        })
    }
})

// =============================================================================
// USER ACTIVITY LOGS
// =============================================================================

/**
 * GET /activity - Get user activity logs
 */
app.get('/activity', zValidator('query', z.object({
    page: z.string().optional().default('1'),
    limit: z.string().optional().default('50'),
    userId: z.string().optional(),
    activityType: z.string().optional()
})), async (c) => {
    const tenantId = c.get('tenantId')!
    const query = c.req.valid('query')

    const page = parseInt(query.page)
    const limit = parseInt(query.limit)
    const offset = (page - 1) * limit

    const conditions = [eq(userActivityLogs.tenantId, tenantId)]

    if (query.userId) {
        conditions.push(eq(userActivityLogs.userId, query.userId))
    }

    if (query.activityType) {
        conditions.push(eq(userActivityLogs.activityType, query.activityType))
    }

    const whereClause = and(...conditions)

    const [{ count }] = await db
        .select({ count: sql<number>`count(*)` })
        .from(userActivityLogs)
        .where(whereClause)

    const activities = await db
        .select()
        .from(userActivityLogs)
        .where(whereClause)
        .orderBy(desc(userActivityLogs.timestamp))
        .limit(limit)
        .offset(offset)

    return c.json({
        data: activities,
        pagination: {
            page,
            limit,
            total: Number(count),
            totalPages: Math.ceil(Number(count) / limit)
        }
    })
})

// =============================================================================
// DATA ACCESS LOGS
// =============================================================================

/**
 * GET /data-access - Get data access logs
 */
app.get('/data-access', zValidator('query', z.object({
    page: z.string().optional().default('1'),
    limit: z.string().optional().default('50'),
    userId: z.string().optional(),
    resourceType: z.string().optional()
})), async (c) => {
    const tenantId = c.get('tenantId')!
    const query = c.req.valid('query')

    const page = parseInt(query.page)
    const limit = parseInt(query.limit)
    const offset = (page - 1) * limit

    const conditions = [eq(dataAccessLogs.tenantId, tenantId)]

    if (query.userId) {
        conditions.push(eq(dataAccessLogs.userId, query.userId))
    }

    if (query.resourceType) {
        conditions.push(eq(dataAccessLogs.resourceType, query.resourceType))
    }

    const whereClause = and(...conditions)

    const [{ count }] = await db
        .select({ count: sql<number>`count(*)` })
        .from(dataAccessLogs)
        .where(whereClause)

    const accessLogs = await db
        .select()
        .from(dataAccessLogs)
        .where(whereClause)
        .orderBy(desc(dataAccessLogs.timestamp))
        .limit(limit)
        .offset(offset)

    return c.json({
        data: accessLogs,
        pagination: {
            page,
            limit,
            total: Number(count),
            totalPages: Math.ceil(Number(count) / limit)
        }
    })
})

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function convertToCSV(data: any[]): string {
    if (data.length === 0) return ''

    const headers = Object.keys(data[0])
    const rows = data.map(row =>
        headers.map(header => {
            const value = row[header]
            if (value === null || value === undefined) return ''
            if (typeof value === 'object') return JSON.stringify(value)
            return `"${String(value).replace(/"/g, '""')}"`
        }).join(',')
    )

    return [headers.join(','), ...rows].join('\n')
}

export default app
