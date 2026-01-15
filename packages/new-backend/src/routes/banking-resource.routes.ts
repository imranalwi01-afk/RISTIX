import { OpenAPIHono } from '@hono/zod-openapi'
import type { AppContext } from '../app'

/**
 * Banking Resource Routes (STUB)
 * TODO: Implement banking resource management
 */
export const bankingResourceRoutes = new OpenAPIHono<AppContext>()

bankingResourceRoutes.get('/', async (c) => {
    return c.json({
        success: true,
        data: [],
        message: 'Banking resources - stub implementation',
    })
})

bankingResourceRoutes.get('/:id', async (c) => {
    const id = c.req.param('id')
    return c.json({
        success: true,
        data: {
            id,
            name: 'Sample Resource',
            type: 'document',
        },
        message: 'Banking resource detail - stub implementation',
    })
})

export default bankingResourceRoutes
