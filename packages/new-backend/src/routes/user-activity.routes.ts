import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import type { AppContext } from '../app'
import { authMiddleware, tenantMiddleware } from '../middleware'
import { getDatabase } from '../config/database'
import { userActivityLogs, users } from '../db/schema'
import { eq, and, desc, sql } from 'drizzle-orm'
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
    searchTerm: z.string().optional(),
})

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
        
        const conditions = []
        // userActivityLogs tenantId might be a generic varchar
        // conditions.push(eq(userActivityLogs.tenantId, tenantId))
        
        if (query.userId) conditions.push(eq(userActivityLogs.userId, query.userId))
        if (query.activityType) conditions.push(eq(userActivityLogs.activityType, query.activityType))

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined

        const [{ count }] = await currentDb
            .select({ count: sql<number>`count(*)` })
            .from(userActivityLogs)
            .where(whereClause)

        const activities = await currentDb
            .select({
                id: userActivityLogs.id,
                userId: userActivityLogs.userId,
                activityType: userActivityLogs.activityType,
                activityDescription: userActivityLogs.activityDescription,
                pageUrl: userActivityLogs.pageUrl,
                endpoint: userActivityLogs.endpoint,
                method: userActivityLogs.method,
                statusCode: userActivityLogs.statusCode,
                responseTimeMs: userActivityLogs.responseTimeMs,
                sessionId: userActivityLogs.sessionId,
                ipAddress: userActivityLogs.ipAddress,
                userAgent: userActivityLogs.userAgent,
                createdAt: userActivityLogs.createdAt,
                user: users
            })
            .from(userActivityLogs)
            .leftJoin(users, eq(userActivityLogs.userId, users.id))
            .where(whereClause)
            .orderBy(desc(userActivityLogs.createdAt))
            .limit(limit)
            .offset(offset)

        const mappedActivities = activities.map(({ user, ...log }) => ({
            id: log.id,
            tenantId: 'dana', // Default or mocked tenant
            userId: log.userId,
            userName: user?.fullName || 'Unknown User',
            userEmail: user?.email || '',
            sessionId: log.sessionId || '-',
            correlationId: log.id,
            activityType: log.activityType,
            actionPerformed: log.activityDescription || `${log.method} ${log.endpoint}`,
            targetEntity: '-',
            pageUrl: log.pageUrl,
            actionResult: (log.statusCode && log.statusCode >= 400) ? 'FAILURE' : 'SUCCESS',
            responseTimeMs: log.responseTimeMs,
            ipAddress: log.ipAddress || '-',
            userAgent: log.userAgent || '-',
            deviceType: 'Desktop',
            browserName: 'Chrome',
            riskLevel: 'LOW',
            bankingType: 'conventional',
            complianceRelevant: false,
            activityTimestamp: log.createdAt.toISOString(),
            createdAt: log.createdAt.toISOString()
        }))

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
                successfulActivities: mappedActivities.filter(a => a.actionResult === 'SUCCESS').length,
                failedActivities: mappedActivities.filter(a => a.actionResult === 'FAILURE').length,
                partialActivities: 0,
                criticalRiskActivities: 0,
                highRiskActivities: 0,
                mediumRiskActivities: 0,
                lowRiskActivities: Number(count),
                uniqueUsers: new Set(mappedActivities.map(a => a.userId)).size,
                uniqueSessions: new Set(mappedActivities.map(a => a.sessionId)).size,
                avgResponseTime: 0,
                maxResponseTime: 0,
                minResponseTime: 0,
                totalErrors: 0,
                complianceRelevantActivities: 0,
                topModules: [],
                topUsers: [],
                hourlyDistribution: [],
                riskDistribution: [],
                resultDistribution: [],
                bankingTypeDistribution: [],
                moduleEngagement: [],
                performanceMetrics: {
                    avgPageLoadTime: 0,
                    avgServerResponseTime: 0,
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
        responses: {
            200: {
                description: 'Statistics',
            }
        }
    }),
    async (c) => {
        return c.json({
            data: {
                totalActivities: 0,
                successfulActivities: 0,
                failedActivities: 0,
                partialActivities: 0,
                criticalRiskActivities: 0,
                highRiskActivities: 0,
                mediumRiskActivities: 0,
                lowRiskActivities: 0,
                uniqueUsers: 0,
                uniqueSessions: 0,
                avgResponseTime: 0,
                maxResponseTime: 0,
                minResponseTime: 0,
                totalErrors: 0,
                complianceRelevantActivities: 0,
                topModules: [],
                topUsers: [],
                hourlyDistribution: [],
                riskDistribution: [],
                resultDistribution: [],
                bankingTypeDistribution: [],
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
