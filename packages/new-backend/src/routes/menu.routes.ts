import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { Effect, pipe } from 'effect'
import type { AppContext } from '../app'
import { authMiddleware, tenantMiddleware } from '../middleware'
import { runEffect } from '../lib/effect'
import * as menuService from '../services/menu.service'
import * as rbacService from '../services/rbac.service'

export const menuRoutes = new OpenAPIHono<AppContext>()

// Apply auth and tenant middleware
menuRoutes.use('*', authMiddleware)
menuRoutes.use('*', tenantMiddleware)

// ============================================================================
// SCHEMAS
// ============================================================================

// Define interface for recursive schema
interface MenuItem {
    id: string
    label: string
    path?: string
    icon?: string
    children?: MenuItem[]
}

const MenuItemSchema: z.ZodType<MenuItem> = z.object({
    id: z.string(),
    label: z.string(),
    path: z.string().optional(),
    icon: z.string().optional(),
    children: z.array(z.lazy(() => MenuItemSchema)).optional(), // Recursive schema
}).openapi('MenuItem')


const MenuHierarchySchema = z.object({
    success: z.boolean(),
    data: z.array(MenuItemSchema),
}).openapi('MenuHierarchyResponse')

const MenuStatusSchema = z.object({
    success: z.boolean(),
    message: z.string(),
    timestamp: z.string(),
}).openapi('MenuStatusResponse')

const ErrorResponse = z.object({
    success: z.boolean(),
    message: z.string(),
    error: z.string().optional()
}).openapi('ErrorResponse')

// ============================================================================
// ROUTES
// ============================================================================

/**
 * GET /menu/hierarchy - Get user menu hierarchy
 */
menuRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/hierarchy',
        tags: ['Menu'],
        summary: 'Get Menu Hierarchy',
        responses: {
            200: { content: { 'application/json': { schema: MenuHierarchySchema } }, description: 'Menu Hierarchy' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c) => {
        const userId = c.get('userId')!
        const tenantId = c.get('tenantId')!

        // We need user roles to filter the menu
        const effect = pipe(
            rbacService.getUserRoles(userId, tenantId),
            Effect.flatMap((userRoles) => {
                const roleNames = userRoles.map((ur: any) => ur.role?.roleName).filter(Boolean) as string[];
                return menuService.getUserMenuHierarchy(userId, tenantId, roleNames);
            }),
            Effect.map((hierarchy) => hierarchy)
        )

        return runEffect(c, effect)
    }
)

/**
 * GET /menu/status - Health check
 */
menuRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/status',
        tags: ['Menu'],
        summary: 'Get Menu Status',
        responses: {
            200: { content: { 'application/json': { schema: MenuStatusSchema } }, description: 'Status' }
        }
    }),
    (c) => {
        return c.json({
            success: true,
            message: 'Menu service is healthy',
            timestamp: new Date().toISOString(),
        })
    }
)
