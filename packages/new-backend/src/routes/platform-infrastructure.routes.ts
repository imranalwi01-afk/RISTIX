import { OpenAPIHono } from '@hono/zod-openapi'
import type { AppContext } from '../app'

/**
 * Platform Infrastructure Routes (STUB)
 * TODO: Implement infrastructure management
 */
export const platformInfrastructureRoutes = new OpenAPIHono<AppContext>()

platformInfrastructureRoutes.get('/health', async (c) => {
    return c.json({
        success: true,
        data: {
            status: 'healthy',
            services: [],
        },
        message: 'Infrastructure health - stub implementation',
    })
})

platformInfrastructureRoutes.get('/metrics', async (c) => {
    return c.json({
        success: true,
        data: {
            cpu: 0,
            memory: 0,
            disk: 0,
        },
        message: 'Infrastructure metrics - stub implementation',
    })
})

platformInfrastructureRoutes.get('/logs', async (c) => {
    return c.json({
        success: true,
        data: [],
        message: 'Infrastructure logs - stub implementation',
    })
})

export default platformInfrastructureRoutes
