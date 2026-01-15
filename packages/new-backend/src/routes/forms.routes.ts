import { OpenAPIHono } from '@hono/zod-openapi'
import type { AppContext } from '../app'

/**
 * Forms Routes (STUB)
 * TODO: Implement dynamic forms engine
 */
export const formsRoutes = new OpenAPIHono<AppContext>()

// ============================================================================
// FORMS ENDPOINTS
// ============================================================================

formsRoutes.get('/', async (c) => {
    return c.json({
        success: true,
        data: [],
        meta: {
            total: 0,
            page: 1,
            limit: 10,
        },
        message: 'Forms list - stub implementation',
    })
})

formsRoutes.get('/:id', async (c) => {
    const id = c.req.param('id')
    return c.json({
        success: true,
        data: {
            id,
            name: 'Sample Form',
            fields: [],
            status: 'active',
        },
        message: 'Form detail - stub implementation',
    })
})

formsRoutes.post('/', async (c) => {
    const body = await c.req.json()
    return c.json(
        {
            success: true,
            data: {
                id: 'new-form-id',
                ...body,
            },
            message: 'Form created - stub implementation',
        },
        201
    )
})

formsRoutes.put('/:id', async (c) => {
    const id = c.req.param('id')
    const body = await c.req.json()
    return c.json({
        success: true,
        data: {
            id,
            ...body,
        },
        message: 'Form updated - stub implementation',
    })
})

formsRoutes.delete('/:id', async (c) => {
    const id = c.req.param('id')
    return c.json({
        success: true,
        message: `Form ${id} deleted - stub implementation`,
    })
})

// Submit form data
formsRoutes.post('/:id/submit', async (c) => {
    const id = c.req.param('id')
    const body = await c.req.json()
    return c.json({
        success: true,
        data: {
            formId: id,
            submissionId: 'sub-' + Date.now(),
            submittedAt: new Date().toISOString(),
        },
        message: 'Form submitted - stub implementation',
    })
})

// Get form submissions
formsRoutes.get('/:id/submissions', async (c) => {
    const id = c.req.param('id')
    return c.json({
        success: true,
        data: [],
        meta: {
            formId: id,
            total: 0,
        },
        message: 'Form submissions - stub implementation',
    })
})

export default formsRoutes
