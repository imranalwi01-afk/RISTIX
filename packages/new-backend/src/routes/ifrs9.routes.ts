import { OpenAPIHono } from '@hono/zod-openapi'
import type { AppContext } from '../app'

/**
 * IFRS9 Main Routes (STUB)
 * TODO: Implement IFRS9 calculations
 */
export const ifrs9Routes = new OpenAPIHono<AppContext>()

ifrs9Routes.get('/calculations', async (c) => {
    return c.json({
        success: true,
        data: [],
        message: 'IFRS9 calculations - stub implementation',
    })
})

ifrs9Routes.post('/calculate', async (c) => {
    const body = await c.req.json()
    return c.json({
        success: true,
        data: {
            calculationId: 'calc-' + Date.now(),
            status: 'queued',
        },
        message: 'IFRS9 calculation started - stub implementation',
    })
})

ifrs9Routes.get('/calculations/:id', async (c) => {
    const id = c.req.param('id')
    return c.json({
        success: true,
        data: {
            id,
            status: 'completed',
            results: {},
        },
        message: 'IFRS9 calculation result - stub implementation',
    })
})

export default ifrs9Routes
