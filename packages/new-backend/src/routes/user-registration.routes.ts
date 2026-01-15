import { OpenAPIHono } from '@hono/zod-openapi'
import type { AppContext } from '../app'

/**
 * User Registration Routes (STUB)
 * TODO: Implement user registration flow
 */
export const userRegistrationRoutes = new OpenAPIHono<AppContext>()

userRegistrationRoutes.post('/register', async (c) => {
    const body = await c.req.json()
    return c.json(
        {
            success: true,
            data: {
                id: 'new-user-id',
                email: body.email,
                status: 'pending',
            },
            message: 'User registration initiated - stub implementation',
        },
        201
    )
})

userRegistrationRoutes.post('/verify', async (c) => {
    const body = await c.req.json()
    return c.json({
        success: true,
        message: 'Email verified - stub implementation',
    })
})

userRegistrationRoutes.post('/resend-verification', async (c) => {
    return c.json({
        success: true,
        message: 'Verification email resent - stub implementation',
    })
})

export default userRegistrationRoutes
