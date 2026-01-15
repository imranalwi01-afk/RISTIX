import { OpenAPIHono } from '@hono/zod-openapi'
import type { AppContext } from '../app'

/**
 * Security Config Routes (STUB)
 * TODO: Implement security configuration
 */
export const securityConfigRoutes = new OpenAPIHono<AppContext>()

securityConfigRoutes.get('/', async (c) => {
    return c.json({
        success: true,
        data: {
            passwordPolicy: {},
            sessionTimeout: 3600,
            mfaEnabled: false,
        },
        message: 'Security config - stub implementation',
    })
})

securityConfigRoutes.put('/', async (c) => {
    const body = await c.req.json()
    return c.json({
        success: true,
        data: body,
        message: 'Security config updated - stub implementation',
    })
})

export default securityConfigRoutes
