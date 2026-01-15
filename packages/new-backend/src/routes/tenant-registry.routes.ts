import { OpenAPIHono } from '@hono/zod-openapi'
import type { AppContext } from '../app'

/**
 * Tenant Registry Routes (STUB)
 * TODO: Implement tenant management
 */
export const tenantRegistryRoutes = new OpenAPIHono<AppContext>()

tenantRegistryRoutes.get('/', async (c) => {
    return c.json({
        success: true,
        data: [],
        meta: { total: 0 },
        message: 'Tenant registry - stub implementation',
    })
})

tenantRegistryRoutes.get('/:id', async (c) => {
    const id = c.req.param('id')
    return c.json({
        success: true,
        data: {
            id,
            name: 'Sample Tenant',
            status: 'active',
        },
        message: 'Tenant detail - stub implementation',
    })
})

tenantRegistryRoutes.post('/', async (c) => {
    const body = await c.req.json()
    return c.json(
        {
            success: true,
            data: { id: 'new-tenant-id', ...body },
            message: 'Tenant created - stub implementation',
        },
        201
    )
})

export default tenantRegistryRoutes
