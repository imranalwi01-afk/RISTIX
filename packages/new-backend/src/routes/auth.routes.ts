import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { Effect, pipe } from 'effect'
import type { AppContext } from '../app'
import { runEffect } from '../lib/effect'
import * as authService from '../services/auth.service'
import * as tenantService from '../services/tenants.service'
import { authMiddleware } from '../middleware'

export const authRoutes = new Hono<AppContext>()

// =============================================================================
// SCHEMA DEFINITIONS
// =============================================================================

const loginSchema = z.object({
    email: z.string().email('Valid email is required'),
    password: z.string().min(1, 'Password is required'),
    tenantId: z.string().optional(),
})

const refreshSchema = z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
})

const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    firstName: z.string().min(2).optional(),
    lastName: z.string().min(2).optional(),
    tenantId: z.string().uuid(),
})

// =============================================================================
// PUBLIC ROUTES
// =============================================================================

/**
 * POST /auth/login - User authentication
 */
authRoutes.post('/login', zValidator('json', loginSchema), async (c) => {
    const body = c.req.valid('json')
    const ip = c.req.header('x-forwarded-for') || c.req.header('x-real-ip')
    const userAgent = c.req.header('user-agent')

    const effect = pipe(
        authService.login(body, { ip, userAgent }),
        Effect.flatMap(({ user, tokens }) =>
            pipe(
                Effect.all([
                    rbacService.getUserPermissions(user.id, user.tenantId),
                    rbacService.getUserRoles(user.id, user.tenantId)
                ]),
                Effect.map(([permissions, userRoles]) => ({
                    user: {
                        id: user.id,
                        email: user.email,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        tenantId: user.tenantId,
                        permissions,
                        roles: userRoles.map((ur: any) => ur.role?.roleName ?? 'UNKNOWN'),
                    },
                    ...tokens, // Spread tokens to match frontend expectations (accessToken, refreshToken, expiresIn)
                    tokens,
                    token: tokens.accessToken, // For legacy compatibility
                }))
            )
        )
    )


    return runEffect(c, effect)
})

/**
 * POST /auth/refresh - Refresh access token
 */
authRoutes.post('/refresh', zValidator('json', refreshSchema), async (c) => {
    const { refreshToken } = c.req.valid('json')

    const effect = pipe(
        authService.refreshTokens(refreshToken),
        Effect.map((tokens) => ({
            ...tokens,
            tokens,
            token: tokens.accessToken, // For legacy compatibility
        }))
    )

    return runEffect(c, effect)
})

/**
 * GET /auth/status - Health check
 */
authRoutes.get('/status', (c) => {
    return c.json({
        success: true,
        message: 'Auth service is healthy',
        timestamp: new Date().toISOString(),
    })
})

/**
 * GET /auth/login-data - Get login data (tenants)
 */
authRoutes.get('/login-data', async (c) => {
    const effect = pipe(
        tenantService.getTenants(),
        Effect.map((result) => ({
            tenants: result.data.map((t: any) => ({
                id: t.id,
                slug: t.slug,
                name: t.name,
                displayName: t.name,
                bankingType: t.bankingMode,
                isActive: t.isActive,
            })),
            total: result.total,
        }))
    )

    return runEffect(c, effect)
})

// =============================================================================
// PROTECTED ROUTES
// =============================================================================

// Apply auth middleware to protected routes
authRoutes.use('/me', authMiddleware)
authRoutes.use('/logout', authMiddleware)

import * as rbacService from '../services/rbac.service'

/**
 * GET /auth/me - Get current user info
 */
authRoutes.get('/me', async (c) => {
    const userId = c.get('userId')
    const tenantId = c.get('tenantId')
    const user = c.get('user')

    const effect = pipe(
        rbacService.getUserRoles(userId!, tenantId!),
        Effect.map((userRoles) => ({
            id: userId,
            email: user?.email,
            tenantId,
            roles: userRoles.map((ur: any) => ur.role?.roleName ?? 'UNKNOWN'),
        }))
    )

    return runEffect(c, effect)
})

/**
 * GET /auth/me/permissions - Get current user permissions
 */
authRoutes.get('/me/permissions', async (c) => {
    const userId = c.get('userId')!
    const tenantId = c.get('tenantId')!

    const effect = pipe(
        rbacService.getUserPermissions(userId, tenantId),
        Effect.map((permissions) => ({ permissions }))
    )

    return runEffect(c, effect)
})

/**
 * POST /auth/logout - Logout current user
 */
authRoutes.post('/logout', async (c) => {
    const tokenId = c.get('tokenId')
    if (!tokenId) {
        return c.json({ success: true, message: 'Logged out' })
    }

    const effect = pipe(
        authService.logout(tokenId, 'user_logout'),
        Effect.map(() => ({
            success: true,
            message: 'Logged out successfully',
        }))
    )

    return runEffect(c, effect)
})
