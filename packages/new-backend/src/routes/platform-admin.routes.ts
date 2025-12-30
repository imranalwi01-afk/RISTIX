import { Hono } from 'hono'
import { Effect, pipe } from 'effect'
import type { AppContext } from '../app'
import { authMiddleware, requirePermission } from '../middleware'
import { runEffect } from '../lib/effect'
import * as platformAdminService from '../services/platform-admin.service'

export const platformAdminRoutes = new Hono<AppContext>()

// Apply auth middleware
platformAdminRoutes.use('*', authMiddleware)

// =============================================================================
// DASHBOARD ROUTES
// =============================================================================

/**
 * GET /platform-admin/stats - Platform statistics for dashboard
 */
platformAdminRoutes.get('/stats', async (c) => {
    const effect = pipe(
        platformAdminService.getPlatformStats(),
        Effect.map((stats) => ({
            success: true,
            data: stats,
        }))
    )

    return runEffect(c, effect)
})

/**
 * GET /platform-admin/health - System health status
 */
platformAdminRoutes.get('/health', async (c) => {
    const effect = pipe(
        platformAdminService.getSystemHealth(),
        Effect.map((health) => ({
            success: true,
            data: health,
        }))
    )

    return runEffect(c, effect)
})

/**
 * GET /platform-admin/tenants-overview - Tenant overview for dashboard
 */
platformAdminRoutes.get('/tenants-overview', async (c) => {
    const effect = pipe(
        platformAdminService.getTenantOverview(),
        Effect.map((tenants) => ({
            success: true,
            data: tenants,
            total: tenants.length,
        }))
    )

    return runEffect(c, effect)
})

/**
 * GET /platform-admin/recent-activity - Recent platform activity
 */
platformAdminRoutes.get('/recent-activity', async (c) => {
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
})

/**
 * GET /platform-admin/dashboard - Combined dashboard data
 */
platformAdminRoutes.get('/dashboard', async (c) => {
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
    })
})

/**
 * GET /platform-admin/infrastructure - Infrastructure monitoring
 */
platformAdminRoutes.get('/infrastructure', async (c) => {
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
})
