import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import type { AppContext } from '../app'
import { openApiValidationHook } from '../lib/http/openapi-validation-hook'

/**
 * Admin Dashboard Routes (STUB)
 * TODO: Implement dashboard data aggregation
 */
export const adminDashboardRoutes = new OpenAPIHono<AppContext>({ defaultHook: openApiValidationHook })

// ============================================================================
// SCHEMAS
// ============================================================================

const DashboardStatsSchema = z.object({
    totalUsers: z.number(),
    totalTenants: z.number(),
    totalAccounts: z.number(),
    totalTransactions: z.number(),
}).openapi('DashboardStats')

const ActivitySchema = z.object({
    id: z.string(),
    description: z.string(),
    timestamp: z.string(),
}).openapi('DashboardActivity')

const AlertSchema = z.object({
    id: z.string(),
    severity: z.string(),
    message: z.string(),
    timestamp: z.string(),
}).openapi('DashboardAlert')

const DashboardStatsResponse = z.object({
    success: z.boolean(),
    data: DashboardStatsSchema,
    message: z.string().optional(),
}).openapi('DashboardStatsResponse')

const ActivityListResponse = z.object({
    success: z.boolean(),
    data: z.array(ActivitySchema),
    message: z.string().optional(),
}).openapi('DashboardActivityListResponse')

const AlertListResponse = z.object({
    success: z.boolean(),
    data: z.array(AlertSchema),
    message: z.string().optional(),
}).openapi('DashboardAlertListResponse')

// ============================================================================
// ENDPOINTS
// ============================================================================

adminDashboardRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/stats',
        tags: ['Admin Dashboard'],
        summary: 'Get Dashboard Stats',
        responses: {
            200: { content: { 'application/json': { schema: DashboardStatsResponse } }, description: 'Stats' }
        }
    }),
    async (c) => {
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
    }
)

adminDashboardRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/recent-activity',
        tags: ['Admin Dashboard'],
        summary: 'Get Recent Activity',
        responses: {
            200: { content: { 'application/json': { schema: ActivityListResponse } }, description: 'Recent Activity' }
        }
    }),
    async (c) => {
        return c.json({
            success: true,
            data: [],
            message: 'Recent activity - stub implementation',
        })
    }
)

adminDashboardRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/alerts',
        tags: ['Admin Dashboard'],
        summary: 'Get Alerts',
        responses: {
            200: { content: { 'application/json': { schema: AlertListResponse } }, description: 'Alerts' }
        }
    }),
    async (c) => {
        return c.json({
            success: true,
            data: [],
            message: 'Alerts - stub implementation',
        })
    }
)
