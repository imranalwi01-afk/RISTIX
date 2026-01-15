import { OpenAPIHono } from '@hono/zod-openapi'
import type { AppContext } from '../app'

/**
 * Security Routes (STUB)
 * TODO: Implement security management
 */
export const securityRoutes = new OpenAPIHono<AppContext>()

securityRoutes.get('/permissions', async (c) => {
    return c.json({
        success: true,
        data: [],
        message: 'Permissions list - stub implementation',
    })
})

securityRoutes.get('/roles', async (c) => {
    return c.json({
        success: true,
        data: [],
        message: 'Roles list - stub implementation',
    })
})

securityRoutes.post('/roles', async (c) => {
    const body = await c.req.json()
    return c.json(
        {
            success: true,
            data: { id: 'new-role-id', ...body },
            message: 'Role created - stub implementation',
        },
        201
    )
})

securityRoutes.get('/audit-log', async (c) => {
    return c.json({
        success: true,
        data: [],
        message: 'Audit log - stub implementation',
    })
})

export default securityRoutes
