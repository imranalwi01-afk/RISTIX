import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { Effect, pipe } from 'effect'
import type { AppContext } from '../app'
import { authMiddleware } from '../middleware'
import { runEffect } from '../lib/effect'
import * as platformAdminService from '../services/platform-admin.service'

export const platformAdminRoutes = new OpenAPIHono<AppContext>()

// Apply auth middleware
platformAdminRoutes.use('*', authMiddleware)

// =============================================================================
// SCHEMA DEFINITIONS
// =============================================================================

const PlatformStatsSchema = z.object({
    activeTenants: z.number().openapi({ example: 42 }),
    totalUsers: z.number().openapi({ example: 1024 }),
    totalJobs: z.number().openapi({ example: 50 }),
    activeEvents: z.number().openapi({ example: 5 }),
    storageUsed: z.string().optional(),
    uptime: z.string().optional(),
}).openapi('PlatformStats')

const SystemHealthSchema = z.object({
    status: z.string().openapi({ example: 'healthy' }),
    version: z.string().openapi({ example: '1.0.0' }),
    database: z.string().openapi({ example: 'connected' }),
    redis: z.string().openapi({ example: 'connected' }),
    uptime: z.number().openapi({ example: 3600 }),
    lastCheck: z.string().openapi({ example: '2023-01-01T00:00:00Z' }),
    services: z.array(z.object({
        name: z.string(),
        status: z.string(),
        uptime: z.number().optional(),
        latency: z.string().optional(),
        hitRate: z.string().optional(),
    })).optional()
}).openapi('SystemHealth')

const TenantOverviewSchema = z.object({
    id: z.string(),
    name: z.string(),
    status: z.string(),
    users: z.number(),
    lastActivity: z.string().optional(),
}).openapi('TenantOverview')

const ActivitySchema = z.object({
    id: z.string(),
    type: z.string(),
    description: z.string(),
    timestamp: z.string(),
    user: z.string().optional(),
    tenant: z.string().optional(),
}).openapi('RecentActivity')

const DashboardDataSchema = z.object({
    stats: PlatformStatsSchema,
    health: SystemHealthSchema,
    tenantsOverview: z.array(TenantOverviewSchema),
    recentActivity: z.array(ActivitySchema),
}).openapi('PlatformDashboardData')

// =============================================================================
// ROUTES
// =============================================================================

/**
 * GET /platform-admin/stats - Platform statistics for dashboard
 */
platformAdminRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/stats',
        tags: ['Platform Admin'],
        summary: 'Platform Stats',
        security: [{ BearerAuth: [] }],
        responses: {
            200: {
                content: {
                    'application/json': {
                        schema: z.object({
                            success: z.boolean(),
                            data: PlatformStatsSchema,
                        }),
                    },
                },
                description: 'Platform statistics',
            },
        },
    }),
    async (c) => {
        const effect = pipe(
            platformAdminService.getPlatformStats(),
            Effect.map((stats) => ({
                success: true,
                data: stats,
            }))
        )

        return runEffect(c, effect)
    }
)

/**
 * GET /platform-admin/health - System health status
 */
platformAdminRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/health',
        tags: ['Platform Admin'],
        summary: 'System Health',
        security: [{ BearerAuth: [] }],
        responses: {
            200: {
                content: {
                    'application/json': {
                        schema: z.object({
                            success: z.boolean(),
                            data: SystemHealthSchema,
                        }),
                    },
                },
                description: 'System health',
            },
        },
    }),
    async (c) => {
        const effect = pipe(
            platformAdminService.getSystemHealth(),
            Effect.map((health) => ({
                success: true,
                data: health,
            }))
        )

        return runEffect(c, effect)
    }
)

/**
 * GET /platform-admin/tenants-overview - Tenant overview for dashboard
 */
platformAdminRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/tenants-overview',
        tags: ['Platform Admin'],
        summary: 'Tenants Overview',
        security: [{ BearerAuth: [] }],
        responses: {
            200: {
                content: {
                    'application/json': {
                        schema: z.object({
                            success: z.boolean(),
                            data: z.array(TenantOverviewSchema),
                            total: z.number(),
                        }),
                    },
                },
                description: 'Tenant overview',
            },
        },
    }),
    async (c) => {
        const effect = pipe(
            platformAdminService.getTenantOverview(),
            Effect.map((tenants) => ({
                success: true,
                data: tenants,
                total: tenants.length,
            }))
        )

        return runEffect(c, effect)
    }
)

/**
 * GET /platform-admin/recent-activity - Recent platform activity
 */
platformAdminRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/recent-activity',
        tags: ['Platform Admin'],
        summary: 'Recent Activity',
        security: [{ BearerAuth: [] }],
        request: {
            query: z.object({
                limit: z.string().optional().default('10').openapi({ example: '10' }),
            }),
        },
        responses: {
            200: {
                content: {
                    'application/json': {
                        schema: z.object({
                            success: z.boolean(),
                            data: z.array(ActivitySchema),
                            total: z.number(),
                        }),
                    },
                },
                description: 'Recent activity',
            },
        },
    }),
    async (c) => {
        const limit = parseInt(c.req.query('limit') ?? '10', 10)

        const effect = pipe(
            platformAdminService.getRecentActivity(limit),
            Effect.map((activity) => ({
                success: true,
                data: activity,
                total: activity.length,
            }))
        )

        return runEffect(c, effect)
    }
)

/**
 * GET /platform-admin/dashboard - Combined dashboard data
 */
platformAdminRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/dashboard',
        tags: ['Platform Admin'],
        summary: 'Dashboard Data',
        security: [{ BearerAuth: [] }],
        responses: {
            200: {
                content: {
                    'application/json': {
                        schema: z.object({
                            success: z.boolean(),
                            data: DashboardDataSchema,
                        }),
                    },
                },
                description: 'Dashboard data',
            },
        },
    }),
    async (c) => {
        const [stats, health, tenants, activity] = await Promise.all([
            Effect.runPromise(platformAdminService.getPlatformStats()),
            Effect.runPromise(platformAdminService.getSystemHealth()),
            Effect.runPromise(platformAdminService.getTenantOverview()),
            Effect.runPromise(platformAdminService.getRecentActivity(5)),
        ])

        return c.json({
            success: true,
            data: {
                stats,
                health,
                tenantsOverview: tenants.slice(0, 10),
                recentActivity: activity,
            },
        }) as any
    }
)

/**
 * GET /platform-admin/infrastructure - Infrastructure monitoring
 */
platformAdminRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/infrastructure',
        tags: ['Platform Admin'],
        summary: 'Infrastructure Monitoring',
        security: [{ BearerAuth: [] }],
        responses: {
            200: {
                content: {
                    'application/json': {
                        schema: z.object({
                            success: z.boolean(),
                            data: SystemHealthSchema,
                        }),
                    },
                },
                description: 'Infrastructure health',
            },
        },
    }),
    async (c) => {
        const effect = pipe(
            platformAdminService.getSystemHealth(),
            Effect.map((health) => ({
                success: true,
                data: {
                    ...health,
                    services: [
                        { name: 'API Server', status: 'running', uptime: health.uptime },
                        { name: 'Database', status: health.database, latency: '5ms' },
                        { name: 'Cache', status: 'healthy', hitRate: '92%' },
                    ],
                },
            }))
        )

        return runEffect(c, effect)
    }
)
