import { Hono } from 'hono'
import { Effect, pipe } from 'effect'
import type { AppContext } from '../app'
import { authMiddleware, tenantMiddleware } from '../middleware'
import { runEffect } from '../lib/effect'
import * as menuService from '../services/menu.service'
import * as rbacService from '../services/rbac.service'

export const menuRoutes = new Hono<AppContext>()

// Apply auth and tenant middleware
menuRoutes.use('*', authMiddleware)
menuRoutes.use('*', tenantMiddleware)

/**
 * GET /menu/hierarchy - Get user menu hierarchy
 */
menuRoutes.get('/hierarchy', async (c) => {
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
})

/**
 * GET /menu/status - Health check
 */
menuRoutes.get('/status', (c) => {
    return c.json({
        success: true,
        message: 'Menu service is healthy',
        timestamp: new Date().toISOString(),
    })
})
