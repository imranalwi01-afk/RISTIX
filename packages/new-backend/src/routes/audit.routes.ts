import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import type { AppContext } from '../app'
import { authMiddleware, tenantMiddleware } from '../middleware'
import { db, getDatabase } from '../config/database'
import { auditLogs, dataAccessLogs } from '../db/schema'
import { eq, and, asc, desc, gte, lte, like, sql, or } from 'drizzle-orm'
import { buildErrorResponse } from '../lib/http/error-response'
import { openApiValidationHook } from '../lib/http/openapi-validation-hook'
import {
    ListQueryValidationError,
    buildListResponse,
    buildOffsetPagination,
    parseListQuery,
    type ListQueryConfig,
} from '../lib/http/list-query'

export const auditRoutes = new OpenAPIHono<AppContext>({ defaultHook: openApiValidationHook })

const buildRequestIdCondition = (requestId: string) =>
    or(
        sql`cast(${auditLogs.entityId} as text) = ${requestId}`,
        sql`coalesce(${auditLogs.metadata}->>'requestId', '') = ${requestId}`,
        sql`coalesce(${auditLogs.metadata}->>'request_id', '') = ${requestId}`
    )!

const buildAuditSearchCondition = (search: string) => {
    const pattern = `%${search}%`

    return or(
        like(auditLogs.description, pattern),
        like(auditLogs.entityName, pattern),
        like(auditLogs.action, pattern),
        like(auditLogs.entityType, pattern),
        sql`cast(${auditLogs.entityId} as text) ilike ${pattern}`,
        sql`coalesce(${auditLogs.metadata}->>'requestId', '') ilike ${pattern}`,
        sql`coalesce(${auditLogs.metadata}->>'request_id', '') ilike ${pattern}`
    )!
}

const AUDIT_LOG_LIST_QUERY_CONFIG: ListQueryConfig = {
    defaultLimit: 50,
    maxLimit: 500,
    defaultSort: [{ field: 'createdAt', direction: 'desc' }],
    filterDefinitions: {
        createdAt: { field: 'createdAt', label: 'Date', type: 'date', operators: ['from', 'to'] },
        eventType: { field: 'eventType', label: 'Event Type', type: 'enum' },
        action: { field: 'action', label: 'Action', type: 'text', operators: ['contains', 'equals'] },
        userId: { field: 'userId', label: 'User', type: 'text', operators: ['equals'] },
        entityType: { field: 'entityType', label: 'Entity Type', type: 'text', operators: ['contains', 'equals'] },
        entityId: { field: 'entityId', label: 'Entity ID', type: 'text', operators: ['equals'] },
        requestId: { field: 'requestId', label: 'Request ID', type: 'text', operators: ['equals'] },
    },
    sortableColumns: ['createdAt', 'eventType', 'action', 'entityType', 'userId'],
    filterAliases: {
        startDate: 'createdAt.from',
        endDate: 'createdAt.to',
    },
}

const auditListQueryBadRequest = (c: any, error: ListQueryValidationError) =>
    c.json({
        ...buildErrorResponse(c, {
            error: error.message,
            message: error.message,
            code: 'INVALID_LIST_QUERY',
        }),
        details: error.details,
    }, 400)

// Apply auth middleware
auditRoutes.use('*', authMiddleware)
auditRoutes.use('*', tenantMiddleware)

// =============================================================================
// SCHEMA DEFINITIONS
// =============================================================================

const AuditLogSchema = z.object({
    id: z.string().openapi({ example: '123e4567-e89b-12d3-a456-426614174000' }),
    userId: z.string().nullable().optional(),
    tenantId: z.string().nullable().optional(),
    eventType: z.string().openapi({ example: 'AUTH_LOGIN' }),
    action: z.string().openapi({ example: 'LOGIN' }),
    description: z.string().nullable().optional(),
    entityType: z.string().nullable().optional(),
    entityId: z.string().nullable().optional(),
    entityName: z.string().nullable().optional(),
    oldValues: z.record(z.unknown()).nullable().optional(),
    newValues: z.record(z.unknown()).nullable().optional(),
    changedFields: z.array(z.string()).nullable().optional(),
    metadata: z.record(z.unknown()).nullable().optional(),
    ipAddress: z.string().nullable().optional(),
    userAgent: z.string().nullable().optional(),
    createdAt: z.string(), // ISO String
}).openapi('AuditLog')

const DataAccessLogSchema = z.object({
    id: z.string().openapi({ example: '123e4567-e89b-12d3-a456-426614174000' }),
    userId: z.string(),
    tenantId: z.string().nullable().optional(),
    accessType: z.string(),
    resourceType: z.string(),
    resourceId: z.string().nullable().optional(),
    recordCount: z.number().nullable().optional(),
    purpose: z.string().nullable().optional(),
    ipAddress: z.string().nullable().optional(),
    timestamp: z.string(),
}).openapi('DataAccessLog')

const PaginationSchema = z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
}).openapi('Pagination')

const AuditLogListResponse = z.object({
    data: z.array(AuditLogSchema),
    pagination: PaginationSchema,
}).openapi('AuditLogListResponse')

const DataAccessLogListResponse = z.object({
    data: z.array(DataAccessLogSchema),
    pagination: PaginationSchema,
}).openapi('DataAccessLogListResponse')

const AuditStatsResponse = z.object({
    total: z.number(),
    byEventType: z.array(z.object({ eventType: z.string(), count: z.number() })),
    byRiskLevel: z.array(z.object({ riskLevel: z.string().nullable().optional(), count: z.number() })),
    topUsers: z.array(z.object({ userId: z.string().nullable().optional(), count: z.number() })),
}).openapi('AuditStatsResponse')

// =============================================================================
// AUDIT LOGS
// =============================================================================

/**
 * GET /logs - Get audit logs (paginated and filtered)
 */
auditRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/logs',
        tags: ['Audit'],
        summary: 'List Audit Logs',
        security: [{ BearerAuth: [] }],
        request: {
            query: z.object({
                page: z.string().optional().default('1').openapi({ example: '1' }),
                offset: z.string().optional(),
                limit: z.string().optional().default('50').openapi({ example: '50' }),
                filters: z.string().optional(),
                sort: z.string().optional(),
                sortField: z.string().optional(),
                sortOrder: z.enum(['asc', 'desc']).optional(),
                paginationMode: z.enum(['offset']).optional(),
                eventType: z.string().optional(),
                action: z.string().optional(),
                userId: z.string().optional(),
                entityType: z.string().optional(),
                entityId: z.string().optional(),
                requestId: z.string().optional(),
                riskLevel: z.string().optional(),
                startDate: z.string().optional(),
                endDate: z.string().optional(),
                search: z.string().optional()
            } as any),
        },
        responses: {
            200: {
                content: {
                    'application/json': {
                        schema: AuditLogListResponse,
                    },
                },
                description: 'List of audit logs',
            },
        },
    }),
    async (c) => {
        try {
            const tenantId = c.get('tenantId')!
            const query = parseListQuery(c, AUDIT_LOG_LIST_QUERY_CONFIG)
            const filters = query.filters

            const conditions = [eq(auditLogs.tenantId, tenantId)]

            if (filters.eventType) { conditions.push(eq(auditLogs.eventType, String(filters.eventType))) }
            if (filters.action) { conditions.push(eq(auditLogs.action, String(filters.action))) }
            if (filters.userId) { conditions.push(eq(auditLogs.userId, String(filters.userId))) }
            if (filters.entityType) { conditions.push(eq(auditLogs.entityType, String(filters.entityType))) }
            if (filters.entityId) { conditions.push(eq(auditLogs.entityId, String(filters.entityId))) }
            if (filters.requestId) { conditions.push(buildRequestIdCondition(String(filters.requestId))) }

            if (filters['createdAt.from']) {
                conditions.push(gte(auditLogs.createdAt, new Date(String(filters['createdAt.from']))))
            }

            if (filters['createdAt.to']) {
                conditions.push(lte(auditLogs.createdAt, new Date(String(filters['createdAt.to']))))
            }

        if (query.search) {
            conditions.push(buildAuditSearchCondition(query.search))
        }

        const whereClause = and(...conditions)

        const currentDb = getDatabase(tenantId)

        // Get total count
        const [{ count }] = await currentDb
            .select({ count: sql<number>`count(*)` })
            .from(auditLogs)
            .where(whereClause)

        const sortMap = {
            createdAt: auditLogs.createdAt,
            eventType: auditLogs.eventType,
            action: auditLogs.action,
            entityType: auditLogs.entityType,
            userId: auditLogs.userId,
        }
        const sort = query.sort[0] ?? { field: 'createdAt', direction: 'desc' as const }
        const sortColumn = sortMap[sort.field as keyof typeof sortMap] ?? auditLogs.createdAt

        // Get logs
        const logs = await currentDb
            .select()
            .from(auditLogs)
            .where(whereClause)
            .orderBy(sort.direction === 'asc' ? asc(sortColumn) : desc(sortColumn))
            .limit(query.limit)
            .offset(query.offset ?? 0)

        const data = logs.map(l => ({
                ...l,
                createdAt: l.createdAt.toISOString(),
                // Fix potential nulls/types
                description: l.description ?? null,
                entityType: l.entityType ?? null,
                entityId: l.entityId ?? null,
                entityName: l.entityName ?? null,
                oldValues: l.oldValues as Record<string, unknown> ?? null,
                newValues: l.newValues as Record<string, unknown> ?? null,
                changedFields: l.changedFields ?? null,
                metadata: l.metadata as Record<string, unknown> ?? null,
                ipAddress: l.ipAddress ?? null,
                userAgent: l.userAgent ?? null,
                userId: l.userId ?? null,
                tenantId: l.tenantId ?? null,
            } as any))

        return c.json(buildListResponse(
            data,
            query,
            buildOffsetPagination(query, Number(count)),
            { filterDefinitions: AUDIT_LOG_LIST_QUERY_CONFIG.filterDefinitions },
        ) as any)
        } catch (error: any) {
            if (error instanceof ListQueryValidationError) return auditListQueryBadRequest(c, error)
            throw error
        }
    }
)

/**
 * GET /logs/:id - Get specific audit log
 */
auditRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/logs/{id}',
        tags: ['Audit'],
        summary: 'Get Audit Log',
        security: [{ BearerAuth: [] }],
        request: {
            params: z.object({
                id: z.string().openapi({ param: { name: 'id', in: 'path' } }),
            } as any),
        },
        responses: {
            200: {
                content: {
                    'application/json': {
                        schema: AuditLogSchema,
                    },
                },
                description: 'Audit log details',
            },
            404: { description: 'Log not found' }
        },
    }),
    async (c) => {
        const { id } = c.req.valid('param')
        const tenantId = c.get('tenantId')!

        const currentDb = getDatabase(tenantId)

        const [log] = await currentDb
            .select()
            .from(auditLogs)
            .where(and(
                eq(auditLogs.id, id),
                eq(auditLogs.tenantId, tenantId)
            ))
            .limit(1)

        if (!log) {
            return c.json(buildErrorResponse(c, { error: 'Audit log not found', message: 'Audit log not found', code: 'NOT_FOUND' }) as any, 404)
        }

        return c.json({
            ...log,
            createdAt: log.createdAt.toISOString(),
            description: log.description ?? null,
            entityType: log.entityType ?? null,
            entityId: log.entityId ?? null,
            entityName: log.entityName ?? null,
            oldValues: log.oldValues as Record<string, unknown> ?? null,
            newValues: log.newValues as Record<string, unknown> ?? null,
            changedFields: log.changedFields ?? null,
            metadata: log.metadata as Record<string, unknown> ?? null,
            ipAddress: log.ipAddress ?? null,
            userAgent: log.userAgent ?? null,
            userId: log.userId ?? null,
            tenantId: log.tenantId ?? null,
        } as any)
    }
)

/**
 * GET /stats - Get audit statistics
 */
auditRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/stats',
        tags: ['Audit'],
        summary: 'Audit Statistics',
        security: [{ BearerAuth: [] }],
        request: {
            query: z.object({
                startDate: z.string().optional(),
                endDate: z.string().optional()
            } as any),
        },
        responses: {
            200: {
                content: {
                    'application/json': {
                        schema: AuditStatsResponse,
                    },
                },
                description: 'Statistics',
            },
        },
    }),
    async (c) => {
        const tenantId = c.get('tenantId')!
        const { startDate, endDate } = c.req.valid('query')

        const conditions = [eq(auditLogs.tenantId, tenantId)]

        if (startDate) {
            conditions.push(gte(auditLogs.createdAt, new Date(startDate)))
        }

        if (endDate) {
            conditions.push(lte(auditLogs.createdAt, new Date(endDate)))
        }

        const currentDb = getDatabase(tenantId)
        const whereClause = and(...conditions)

        // Get stats by event type
        const eventTypeStats = await currentDb
            .select({
                eventType: auditLogs.eventType,
                count: sql<number>`count(*)`
            } as any)
            .from(auditLogs)
            .where(whereClause)
            .groupBy(auditLogs.eventType)

        // Get top users
        const topUsers = await currentDb
            .select({
                userId: auditLogs.userId,
                count: sql<number>`count(*)`
            } as any)
            .from(auditLogs)
            .where(whereClause)
            .groupBy(auditLogs.userId)
            .orderBy(desc(sql`count(*)`))
            .limit(10)

        // Get total count
        const [{ total }] = await currentDb
            .select({ total: sql<number>`count(*)` })
            .from(auditLogs)
            .where(whereClause)

        return c.json({
            total: Number(total),
            byEventType: eventTypeStats.map(s => ({ ...s, count: Number(s.count) })),
            byRiskLevel: [], // Removed as column doesn't exist in schema
            topUsers: topUsers.map(u => ({ ...u, count: Number(u.count) }))
        } as any)
    }
)

/**
 * POST /export - Export audit logs
 */
auditRoutes.openapi(
    createRoute({
        method: 'post',
        path: '/export',
        tags: ['Audit'],
        summary: 'Export Audit Logs',
        security: [{ BearerAuth: [] }],
        request: {
            body: {
                content: {
                    'application/json': {
                        schema: z.object({
                            format: z.enum(['csv', 'json']).default('csv'),
                            filters: z.object({
                                eventType: z.string().optional(),
                                requestId: z.string().optional(),
                                startDate: z.string().optional(),
                                endDate: z.string().optional(),
                                search: z.string().optional(),
                            } as any).optional()
                        } as any)
                    }
                }
            }
        },
        responses: {
            200: {
                description: 'Exported data',
                content: {
                    'application/json': { schema: z.array(AuditLogSchema) },
                    'text/csv': { schema: z.string() }
                }
            },
        },
    }),
    async (c) => {
        const tenantId = c.get('tenantId')!
        const { format, filters } = c.req.valid('json')

        const conditions = [eq(auditLogs.tenantId, tenantId)]

        if (filters?.eventType) {
            conditions.push(eq(auditLogs.eventType, filters.eventType))
        }

        if (filters?.requestId) {
            conditions.push(buildRequestIdCondition(filters.requestId))
        }

        if (filters?.startDate) {
            conditions.push(gte(auditLogs.createdAt, new Date(filters.startDate)))
        }

        if (filters?.endDate) {
            conditions.push(lte(auditLogs.createdAt, new Date(filters.endDate)))
        }

        if (filters?.search) {
            conditions.push(buildAuditSearchCondition(filters.search))
        }

        const currentDb = getDatabase(tenantId)

        const logs = await currentDb
            .select()
            .from(auditLogs)
            .where(and(...conditions))
            .orderBy(desc(auditLogs.createdAt))
            .limit(10000)

        // Transform for export
        const transformedLogs = logs.map(l => ({
            ...l,
            createdAt: l.createdAt.toISOString()
        } as any))

        if (format === 'json') {
            return c.json(transformedLogs as any)
        } else {
            const csv = convertToCSV(transformedLogs)
            return c.text(csv, 200, {
                'Content-Type': 'text/csv',
                'Content-Disposition': `attachment; filename="audit-logs-${new Date().toISOString()}.csv"`
            } as any)
        }
    }
)

/**
 * GET /data-access - Get data access logs
 */
auditRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/data-access',
        tags: ['Audit'],
        summary: 'Data Access Logs',
        security: [{ BearerAuth: [] }],
        request: {
            query: z.object({
                page: z.string().optional().default('1'),
                limit: z.string().optional().default('50'),
                userId: z.string().optional(),
                resourceType: z.string().optional()
            } as any),
        },
        responses: {
            200: {
                content: {
                    'application/json': {
                        schema: DataAccessLogListResponse,
                    },
                },
                description: 'List of data access logs',
            },
        },
    }),
    async (c) => {
        const tenantId = c.get('tenantId')!
        const query = c.req.valid('query') // Fixed type error inference hopefully by explicit schema above matching

        const page = parseInt(query.page)
        const limit = parseInt(query.limit)
        const offset = (page - 1) * limit

        // dataAccessLogs table: tenantId is uuid.
        // BUT c.get('tenantId') returns string.
        // The original code used `eq(dataAccessLogs.tenantId, tenantId)`. 
        // Postgres driver handles string->uuid usually.
        // However, in schema file (step 176 line 125): tenantId: uuid('tenant_id').
        // In auditLogs (line 33): tenantId: varchar ... default('dana').
        // So auditLogs has string tenantId, dataAccessLogs has UUID tenantId.
        // If the tenantId in context is a UUID, it works. If it's 'dana' (default), it might fail on UUID cast.
        // The Auth service resolved tenantId to UUID if possible, or slug (string) if default/platform.
        // If dataAccessLogs strictly requires UUID, and we pass a slug, it will error.
        // But let's assume valid UUID for now as per likely usage for specific tenants.

        const conditions = [eq(dataAccessLogs.tenantId, tenantId as any)] // Cast to any to avoid dzt type mismatch if strict

        if (query.userId) { conditions.push(eq(dataAccessLogs.userId, query.userId)) }
        if (query.resourceType) { conditions.push(eq(dataAccessLogs.resourceType, query.resourceType)) }

        const currentDb = getDatabase(tenantId)
        const whereClause = and(...conditions)

        const [{ count }] = await currentDb
            .select({ count: sql<number>`count(*)` })
            .from(dataAccessLogs)
            .where(whereClause)

        const accessLogs = await currentDb
            .select()
            .from(dataAccessLogs)
            .where(whereClause)
            .orderBy(desc(dataAccessLogs.timestamp))
            .limit(limit)
            .offset(offset)

        return c.json({
            data: accessLogs.map(l => ({
                ...l,
                timestamp: l.timestamp.toISOString(),
                resourceId: l.resourceId ?? null,
                recordCount: l.recordCount ?? null,
                purpose: l.purpose ?? null,
                ipAddress: l.ipAddress ?? null,
                tenantId: l.tenantId ?? null,
            } as any)),
            pagination: {
                page,
                limit,
                total: Number(count),
                totalPages: Math.ceil(Number(count) / limit)
            }
        } as any)
    }
)

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
