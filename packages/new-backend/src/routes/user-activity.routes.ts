import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import type { AppContext } from '../app'
import { authMiddleware, tenantMiddleware } from '../middleware'
import { getDatabase } from '../config/database'
import { auditLogs, users } from '../db/schema'
import { eq, and, desc, sql, gte, lte, or, ilike } from 'drizzle-orm'
import { openApiValidationHook } from '../lib/http/openapi-validation-hook'

export const userActivityRoutes = new OpenAPIHono<AppContext>({ defaultHook: openApiValidationHook })

userActivityRoutes.use('*', authMiddleware)
userActivityRoutes.use('*', tenantMiddleware)

// Schemas
const ActivityFiltersSchema = z.object({
    limit: z.string().optional().default('50'),
    offset: z.string().optional().default('0'),
    userId: z.string().optional(),
    activityType: z.string().optional(),
    actionResult: z.enum(['SUCCESS', 'FAILURE', 'PARTIAL']).optional(),
    riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
    bankingType: z.string().optional(),
    complianceRelevant: z.string().optional(),
    moduleAccessed: z.string().optional(),
    ipAddress: z.string().optional(),
    dateFrom: z.string().optional(),
    dateTo: z.string().optional(),
    searchTerm: z.string().optional(),
})

const getMetadataValue = (metadata: unknown, key: string): unknown => {
    if (!metadata || typeof metadata !== 'object') return undefined
    return (metadata as Record<string, unknown>)[key]
}

const toRiskLevel = (metadata: unknown): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' => {
    const rawRisk = String(getMetadataValue(metadata, 'riskLevel') ?? 'low').toLowerCase()
    if (rawRisk === 'critical') return 'CRITICAL'
    if (rawRisk === 'high') return 'HIGH'
    if (rawRisk === 'medium') return 'MEDIUM'
    return 'LOW'
}

const toActionResult = (statusCode: unknown, action?: string | null): 'SUCCESS' | 'FAILURE' | 'PARTIAL' => {
    const numericStatus = Number(statusCode)
    if (!Number.isNaN(numericStatus) && numericStatus >= 400) return 'FAILURE'
    if (String(action || '').toLowerCase().includes('failed')) return 'FAILURE'
    return 'SUCCESS'
}

const toModuleAccessed = (entityType?: string | null, requestPath?: unknown): string =>
    entityType || String(requestPath || '').split('/').filter(Boolean).slice(0, 3).join('/') || '-'

const buildAuditActivityConditions = (
    tenantId: string,
    query: z.infer<typeof ActivityFiltersSchema>
) => {
    const conditions = [eq(auditLogs.tenantId, tenantId)]

    if (query.userId) conditions.push(eq(auditLogs.userId, query.userId))
    if (query.activityType) conditions.push(eq(auditLogs.eventType, query.activityType))
    if (query.ipAddress) conditions.push(ilike(auditLogs.ipAddress, `%${query.ipAddress}%`))
    if (query.moduleAccessed) {
        conditions.push(or(
            ilike(auditLogs.entityType, `%${query.moduleAccessed}%`),
            sql`coalesce(${auditLogs.metadata}->>'requestPath', '') ilike ${`%${query.moduleAccessed}%`}`
        )!)
    }
    if (query.riskLevel) {
        conditions.push(sql`upper(coalesce(${auditLogs.metadata}->>'riskLevel', 'LOW')) = ${query.riskLevel}`)
    }
    if (query.actionResult === 'FAILURE') {
        conditions.push(or(
            sql`coalesce((${auditLogs.metadata}->>'statusCode')::int, 200) >= 400`,
            ilike(auditLogs.action, '%failed%')
        )!)
    } else if (query.actionResult === 'SUCCESS') {
        conditions.push(and(
            sql`coalesce((${auditLogs.metadata}->>'statusCode')::int, 200) < 400`,
            sql`lower(${auditLogs.action}) not like '%failed%'`
        )!)
    }
    if (query.dateFrom) conditions.push(gte(auditLogs.createdAt, new Date(query.dateFrom)))
    if (query.dateTo) conditions.push(lte(auditLogs.createdAt, new Date(query.dateTo)))
    if (query.searchTerm) {
        const searchPattern = `%${query.searchTerm}%`
        conditions.push(or(
            ilike(auditLogs.description, searchPattern),
            ilike(auditLogs.action, searchPattern),
            ilike(auditLogs.eventType, searchPattern),
            ilike(auditLogs.entityType, searchPattern),
            sql`coalesce(${auditLogs.metadata}->>'requestPath', '') ilike ${searchPattern}`,
            sql`coalesce(${auditLogs.metadata}->>'requestMethod', '') ilike ${searchPattern}`,
            sql`coalesce(${auditLogs.metadata}->>'correlationId', '') ilike ${searchPattern}`
        )!)
    }

    return conditions
}

userActivityRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/activities',
        tags: ['User Activity'],
        summary: 'List User Activities',
        security: [{ BearerAuth: [] }],
        request: {
            query: ActivityFiltersSchema,
        },
        responses: {
            200: {
                description: 'List Activities',
            }
        }
    }),
    async (c) => {
        const tenantId = c.get('tenantId')!
        const query = c.req.valid('query')
        const limit = parseInt(query.limit || '50')
        const offset = parseInt(query.offset || '0')

        const currentDb = getDatabase(tenantId)

        const conditions = buildAuditActivityConditions(tenantId, query)

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined

        const [{ count }] = await currentDb
            .select({ count: sql<number>`count(*)` })
            .from(auditLogs)
            .where(whereClause)

        const activities = await currentDb
            .select({
                id: auditLogs.id,
                tenantId: auditLogs.tenantId,
                userId: auditLogs.userId,
                eventType: auditLogs.eventType,
                action: auditLogs.action,
                description: auditLogs.description,
                entityType: auditLogs.entityType,
                entityId: auditLogs.entityId,
                entityName: auditLogs.entityName,
                metadata: auditLogs.metadata,
                ipAddress: auditLogs.ipAddress,
                userAgent: auditLogs.userAgent,
                createdAt: auditLogs.createdAt,
                user: users
            })
            .from(auditLogs)
            .leftJoin(users, eq(auditLogs.userId, users.id))
            .where(whereClause)
            .orderBy(desc(auditLogs.createdAt))
            .limit(limit)
            .offset(offset)

        const mappedActivities = activities.map(({ user, ...log }) => ({
            id: log.id,
            tenantId: log.tenantId || tenantId,
            userId: log.userId || 'system',
            userName: user?.fullName || 'Unknown User',
            userEmail: user?.email || '',
            sessionId: String(getMetadataValue(log.metadata, 'sessionId') || '-'),
            correlationId: String(getMetadataValue(log.metadata, 'correlationId') || log.id),
            activityType: log.eventType,
            actionPerformed: log.description || log.action,
            activityDescription: log.description || log.action,
            targetEntity: log.entityType || '-',
            targetId: log.entityId || undefined,
            targetName: log.entityName || undefined,
            pageUrl: String(getMetadataValue(log.metadata, 'requestPath') || ''),
            requestPath: String(getMetadataValue(log.metadata, 'requestPath') || ''),
            requestMethod: String(getMetadataValue(log.metadata, 'requestMethod') || ''),
            apiEndpoint: String(getMetadataValue(log.metadata, 'requestPath') || ''),
            actionResult: toActionResult(getMetadataValue(log.metadata, 'statusCode'), log.action),
            responseTimeMs: Number(getMetadataValue(log.metadata, 'executionTimeMs') || 0),
            ipAddress: log.ipAddress || '-',
            userAgent: log.userAgent || '-',
            deviceType: 'Desktop',
            browserName: 'Chrome',
            moduleAccessed: toModuleAccessed(log.entityType, getMetadataValue(log.metadata, 'requestPath')),
            riskLevel: toRiskLevel(log.metadata),
            bankingType: 'conventional',
            complianceRelevant: log.eventType === 'auth' || log.eventType === 'security' || toRiskLevel(log.metadata) !== 'LOW',
            regulatoryImpact: false,
            metadata: log.metadata,
            activityTimestamp: log.createdAt.toISOString(),
            createdAt: log.createdAt.toISOString()
        }))

        const responseTimes = mappedActivities.map(a => a.responseTimeMs || 0).filter(value => value > 0)
        const riskCounts = mappedActivities.reduce((acc: Record<string, number>, activity) => {
            acc[activity.riskLevel] = (acc[activity.riskLevel] || 0) + 1
            return acc
        }, {})
        const resultCounts = mappedActivities.reduce((acc: Record<string, number>, activity) => {
            acc[activity.actionResult] = (acc[activity.actionResult] || 0) + 1
            return acc
        }, {})
        const moduleCounts = mappedActivities.reduce((acc: Record<string, number>, activity) => {
            acc[activity.moduleAccessed] = (acc[activity.moduleAccessed] || 0) + 1
            return acc
        }, {})

        return c.json({
            activities: mappedActivities,
            pagination: {
                total: Number(count),
                limit,
                offset,
                hasMore: offset + limit < Number(count)
            },
            statistics: {
                totalActivities: Number(count),
                successfulActivities: resultCounts.SUCCESS || 0,
                failedActivities: resultCounts.FAILURE || 0,
                partialActivities: 0,
                criticalRiskActivities: riskCounts.CRITICAL || 0,
                highRiskActivities: riskCounts.HIGH || 0,
                mediumRiskActivities: riskCounts.MEDIUM || 0,
                lowRiskActivities: riskCounts.LOW || 0,
                uniqueUsers: new Set(mappedActivities.map(a => a.userId)).size,
                uniqueSessions: new Set(mappedActivities.map(a => a.sessionId)).size,
                avgResponseTime: responseTimes.length ? Math.round(responseTimes.reduce((sum, value) => sum + value, 0) / responseTimes.length) : 0,
                maxResponseTime: responseTimes.length ? Math.max(...responseTimes) : 0,
                minResponseTime: responseTimes.length ? Math.min(...responseTimes) : 0,
                totalErrors: resultCounts.FAILURE || 0,
                complianceRelevantActivities: mappedActivities.filter(a => a.complianceRelevant).length,
                topModules: Object.entries(moduleCounts).map(([module, moduleCount]) => ({ module, count: moduleCount })).sort((left, right) => right.count - left.count).slice(0, 5),
                topUsers: [],
                hourlyDistribution: [],
                riskDistribution: Object.entries(riskCounts).map(([risk, riskCount]) => ({ risk, count: riskCount })),
                resultDistribution: Object.entries(resultCounts).map(([result, resultCount]) => ({ result, count: resultCount })),
                bankingTypeDistribution: [{ type: 'conventional', count: mappedActivities.length }],
                moduleEngagement: [],
                performanceMetrics: {
                    avgPageLoadTime: 0,
                    avgServerResponseTime: responseTimes.length ? Math.round(responseTimes.reduce((sum, value) => sum + value, 0) / responseTimes.length) : 0,
                    avgClientRenderTime: 0,
                    slaComplianceRate: 100
                }
            },
            filters: query
        } as any)
    }
)

userActivityRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/statistics',
        tags: ['User Activity'],
        summary: 'Get User Activity Statistics',
        security: [{ BearerAuth: [] }],
        request: {
            query: ActivityFiltersSchema,
        },
        responses: {
            200: {
                description: 'Statistics',
            }
        }
    }),
    async (c) => {
        const tenantId = c.get('tenantId')!
        const query = c.req.valid('query')
        const currentDb = getDatabase(tenantId)
        const conditions = buildAuditActivityConditions(tenantId, query)
        const whereClause = and(...conditions)

        const [totalResult] = await currentDb
            .select({ count: sql<number>`count(*)` })
            .from(auditLogs)
            .where(whereClause)

        const [failureResult] = await currentDb
            .select({ count: sql<number>`count(*)` })
            .from(auditLogs)
            .where(and(
                ...conditions,
                or(
                    sql`coalesce((${auditLogs.metadata}->>'statusCode')::int, 200) >= 400`,
                    ilike(auditLogs.action, '%failed%')
                )!
            ))

        const riskDistributionRows = await currentDb
            .select({
                risk: sql<string>`upper(coalesce(${auditLogs.metadata}->>'riskLevel', 'LOW'))`,
                count: sql<number>`count(*)`,
            })
            .from(auditLogs)
            .where(whereClause)
            .groupBy(sql`upper(coalesce(${auditLogs.metadata}->>'riskLevel', 'LOW'))`)

        const moduleRows = await currentDb
            .select({
                module: sql<string>`coalesce(${auditLogs.entityType}, split_part(coalesce(${auditLogs.metadata}->>'requestPath', '-'), '/', 3), '-')`,
                count: sql<number>`count(*)`,
            })
            .from(auditLogs)
            .where(whereClause)
            .groupBy(sql`coalesce(${auditLogs.entityType}, split_part(coalesce(${auditLogs.metadata}->>'requestPath', '-'), '/', 3), '-')`)
            .orderBy(desc(sql`count(*)`))
            .limit(5)

        const total = Number(totalResult?.count || 0)
        const failures = Number(failureResult?.count || 0)
        const riskDistribution = riskDistributionRows.map(row => ({
            risk: row.risk,
            count: Number(row.count || 0),
        }))
        const riskCount = (risk: string) =>
            riskDistribution.find(row => row.risk === risk)?.count || 0

        return c.json({
            data: {
                totalActivities: total,
                successfulActivities: Math.max(total - failures, 0),
                failedActivities: failures,
                partialActivities: 0,
                criticalRiskActivities: riskCount('CRITICAL'),
                highRiskActivities: riskCount('HIGH'),
                mediumRiskActivities: riskCount('MEDIUM'),
                lowRiskActivities: riskCount('LOW'),
                uniqueUsers: 0,
                uniqueSessions: 0,
                avgResponseTime: 0,
                maxResponseTime: 0,
                minResponseTime: 0,
                totalErrors: failures,
                complianceRelevantActivities: 0,
                topModules: moduleRows.map(row => ({ module: row.module, count: Number(row.count || 0) })),
                topUsers: [],
                hourlyDistribution: [],
                riskDistribution,
                resultDistribution: [
                    { result: 'SUCCESS', count: Math.max(total - failures, 0) },
                    { result: 'FAILURE', count: failures },
                ],
                bankingTypeDistribution: [{ type: 'conventional', count: total }],
                moduleEngagement: [],
                performanceMetrics: {
                    avgPageLoadTime: 0,
                    avgServerResponseTime: 0,
                    avgClientRenderTime: 0,
                    slaComplianceRate: 100
                }
            }
        } as any)
    }
)
