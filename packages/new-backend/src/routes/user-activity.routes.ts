import { OpenAPIHono } from '@hono/zod-openapi'
import type { AppContext } from '../app'

/**
 * User Activity Routes (STUB)
 * TODO: Implement activity tracking
 */
export const userActivityRoutes = new OpenAPIHono<AppContext>()

userActivityRoutes.get('/', async (c) => {
    return c.json({
        success: true,
        data: [],
        meta: { total: 0 },
        message: 'User activity - stub implementation',
    })
})

userActivityRoutes.get('/:userId', async (c) => {
    const userId = c.req.param('userId')
    return c.json({
        success: true,
        data: [],
        meta: { userId, total: 0 },
        message: 'User activity detail - stub implementation',
    })
})

export default userActivityRoutes
