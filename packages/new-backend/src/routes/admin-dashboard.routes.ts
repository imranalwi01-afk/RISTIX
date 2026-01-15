import { OpenAPIHono } from '@hono/zod-openapi'
import type { AppContext } from '../app'

/**
 * Admin Dashboard Routes (STUB)
 * TODO: Implement dashboard data aggregation
 */
export const adminDashboardRoutes = new OpenAPIHono<AppContext>()

adminDashboardRoutes.get('/stats', async (c) => {
    return c.json({
        success: true,
        data: {
            totalUsers: 0,
            totalTenants: 0,
            totalAccounts: 0,
            totalTransactions: 0,
        },
        message: 'Dashboard stats - stub implementation',
    })
})

adminDashboardRoutes.get('/recent-activity', async (c) => {
    return c.json({
        success: true,
        data: [],
        message: 'Recent activity - stub implementation',
    })
})

adminDashboardRoutes.get('/alerts', async (c) => {
    return c.json({
        success: true,
        data: [],
        message: 'Alerts - stub implementation',
    })
})

export default adminDashboardRoutes
