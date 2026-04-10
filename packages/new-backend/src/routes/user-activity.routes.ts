import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import type { AppContext } from '../app'
import { openApiValidationHook } from '../lib/http/openapi-validation-hook'

/**
 * User Activity Routes (STUB)
 * TODO: Implement activity tracking
 */
export const userActivityRoutes = new OpenAPIHono<AppContext>({ defaultHook: openApiValidationHook })

// ============================================================================
// SCHEMAS
// ============================================================================

const UserActivitySchema = z.object({
    id: z.string(),
    userId: z.string(),
    action: z.string(),
    timestamp: z.string(),
    details: z.record(z.any()).optional(),
}).openapi('UserActivity')

const UserActivityListResponse = z.object({
    success: z.boolean(),
    data: z.array(UserActivitySchema),
    meta: z.object({
        userId: z.string().optional(),
        total: z.number(),
        page: z.number().optional(),
        limit: z.number().optional(),
    }).optional(),
    message: z.string().optional(),
}).openapi('UserActivityListResponse')

const ErrorResponse = z.object({
    success: z.boolean(),
    message: z.string(),
}).openapi('ErrorResponse')

// ============================================================================
// USER ACTIVITY ENDPOINTS
// ============================================================================

userActivityRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/',
        tags: ['User Activity'],
        summary: 'List User Activities',
        responses: {
            200: { content: { 'application/json': { schema: UserActivityListResponse } }, description: 'List Activities' }
        }
    }),
    async (c) => {
        return c.json({
            success: true,
            data: [],
            meta: { total: 0 },
            message: 'User activity - stub implementation',
        })
    }
)

userActivityRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/{userId}',
        tags: ['User Activity'],
        summary: 'Get User Activity',
        request: {
            params: z.object({ userId: z.string() })
        },
        responses: {
            200: { content: { 'application/json': { schema: UserActivityListResponse } }, description: 'User Activity' }
        }
    }),
    async (c) => {
        const userId = c.req.param('userId')
        return c.json({
            success: true,
            data: [],
            meta: { userId, total: 0 },
            message: 'User activity detail - stub implementation',
        })
    }
)
