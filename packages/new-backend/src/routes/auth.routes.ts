import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { Effect, pipe } from 'effect'
import type { AppContext } from '../app'
import { runEffect } from '../lib/effect'
import * as authService from '../services/auth.service'
import * as tenantService from '../services/tenants.service'
import { authMiddleware } from '../middleware'
import * as auditService from '../services/audit.service'
import * as rbacService from '../services/rbac.service'

export const authRoutes = new OpenAPIHono<AppContext>()

// =============================================================================
// SCHEMAS
// =============================================================================

const LoginInput = z.object({
    email: z.string().email('Valid email is required'),
    password: z.string().min(1, 'Password is required'),
    tenantId: z.string().optional(),
}).openapi('LoginInput')

const RefreshInput = z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
}).openapi('RefreshInput')

const TokenPairSchema = z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
    expiresIn: z.number(),
    refreshExpiresIn: z.number(),
})

const UserSchema = z.object({
    id: z.string(),
    email: z.string(),
    firstName: z.string().optional().nullable(),
    lastName: z.string().optional().nullable(),
    tenantId: z.string().optional().nullable(),
    permissions: z.array(z.string()),
    roles: z.array(z.string()),
}).openapi('User')

const LoginResponse = z.object({
    user: UserSchema,
    tokens: TokenPairSchema,
    token: z.string(), // Legacy
    accessToken: z.string(),
    refreshToken: z.string(),
    expiresIn: z.number(),
    refreshExpiresIn: z.number(),
}).openapi('LoginResponse')

const LoginDataResponse = z.object({
    tenants: z.array(z.object({
        id: z.string(),
        slug: z.string(),
        name: z.string(),
        displayName: z.string(),
        bankingType: z.string().optional().nullable(),
        isActive: z.boolean(),
    })),
    total: z.number(),
}).openapi('LoginDataResponse')

const VerifyResponse = z.object({
    success: z.boolean(),
    message: z.string(),
    user: z.any().optional(), // Flexible for now
}).openapi('VerifyResponse')

const MeResponse = z.object({
    id: z.string().optional(),
    email: z.string().optional(),
    tenantId: z.string().optional(),
    roles: z.array(z.string()),
}).openapi('MeResponse')

const PermissionsResponse = z.object({
    permissions: z.array(z.string()),
}).openapi('PermissionsResponse')

const SuccessResponse = z.object({
    success: z.boolean(),
    message: z.string(),
    timestamp: z.string().optional(),
}).openapi('SuccessResponse')

// =============================================================================
// ROUTES
// =============================================================================

/**
 * POST /auth/login - User authentication
 */
authRoutes.openapi(
    createRoute({
        method: 'post',
        path: '/login',
        tags: ['Auth'],
        summary: 'Login',
        request: {
            body: {
                content: {
                    'application/json': {
                        schema: LoginInput,
                    },
                },
            },
        },
        responses: {
            200: {
                content: {
                    'application/json': {
                        schema: LoginResponse,
                    },
                },
                description: 'Successful Login',
            },
        },
    }),
    async (c) => {
        const body = c.req.valid('json')
        const ip = c.req.header('x-forwarded-for') || c.req.header('x-real-ip')
        const userAgent = c.req.header('user-agent')

        const effect = pipe(
            authService.login(body, { ip, userAgent }),
            Effect.tap(({ user, tokens }) => {
                // Log successful login - extract tenantId from token (it's the resolved UUID)
                const tokenPayload = JSON.parse(Buffer.from(tokens.accessToken.split('.')[1], 'base64').toString())
                const resolvedTenantId = tokenPayload.tenantId
                auditService.logAuth.login(user.id, resolvedTenantId, ip, userAgent)
                return Effect.succeed(void 0)
            }),
            Effect.map(({ user, tokens }) => ({
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: (user as any).firstName || '',
                    lastName: (user as any).lastName || '',
                    tenantId: user.tenantId,
                    // authService.login returns roles/permissions mapped as strings
                    permissions: (user as any).permissions ?? [],
                    roles: (user as any).roles ?? [],
                },
                ...tokens,
                tokens,
                token: tokens.accessToken,
            })),
            Effect.tapError((error) => {
                // Log failed login
                const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
                const tenantIdForLog = body.tenantId && uuidRegex.test(body.tenantId) ? body.tenantId : undefined

                auditService.logAuth.loginFailed(body.email, tenantIdForLog, ip, error.message)
                return Effect.succeed(void 0)
            })
        )

        return runEffect(c, effect)
    }
)

/**
 * POST /auth/refresh - Refresh access token
 */
authRoutes.openapi(
    createRoute({
        method: 'post',
        path: '/refresh',
        tags: ['Auth'],
        summary: 'Refresh Token',
        request: {
            body: {
                content: {
                    'application/json': {
                        schema: RefreshInput,
                    },
                },
            },
        },
        responses: {
            200: {
                content: {
                    'application/json': {
                        schema: z.object({
                            ...TokenPairSchema.shape,
                            tokens: TokenPairSchema,
                            token: z.string(),
                        }),
                    },
                },
                description: 'Tokens Refreshed',
            },
        },
    }),
    async (c) => {
        const { refreshToken } = c.req.valid('json')

        const effect = pipe(
            authService.refreshTokens(refreshToken),
            Effect.map((tokens) => ({
                ...tokens,
                tokens,
                token: tokens.accessToken,
            }))
        )

        return runEffect(c, effect)
    }
)

/**
 * GET /auth/status - Health check
 */
authRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/status',
        tags: ['Auth'],
        summary: 'Auth Status',
        responses: {
            200: {
                content: {
                    'application/json': {
                        schema: SuccessResponse,
                    },
                },
                description: 'Service Healthy',
            },
        },
    }),
    (c) => {
        return c.json({
            success: true,
            message: 'Auth service is healthy',
            timestamp: new Date().toISOString(),
        } as any)
    }
)

/**
 * GET /auth/login-data - Get login data (tenants)
 */
authRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/login-data',
        tags: ['Auth'],
        summary: 'Get Login Data (Tenants)',
        request: {
            query: z.object({
                mode: z.string().optional(),
            }),
        },
        responses: {
            200: {
                content: {
                    'application/json': {
                        schema: LoginDataResponse,
                    },
                },
                description: 'List of tenants for login',
            },
        },
    }),
    async (c) => {
        const mode = c.req.query('mode')
        const includeSystem = mode === 'admin'

        const effect = pipe(
            tenantService.getTenants({ includeSystem }),
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
    }
)

// =============================================================================
// PROTECTED ROUTES
// =============================================================================

// Apply auth middleware via .use() for specific paths or wrapper
// Since we are using OpenAPIHono, .use() works but doesn't auto-document security schemes implicitly without config.
// For now, we apply middleware manually or via hook.
// IMPORTANT: Hono middleware application order matters.

authRoutes.use('/verify', authMiddleware)
authRoutes.use('/me', authMiddleware)
authRoutes.use('/me/permissions', authMiddleware)
authRoutes.use('/logout', authMiddleware)


/**
 * GET /auth/verify - Verify token
 */
authRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/verify',
        tags: ['Auth'],
        summary: 'Verify Token',
        security: [{ BearerAuth: [] }],
        responses: {
            200: {
                content: {
                    'application/json': {
                        schema: VerifyResponse,
                    },
                },
                description: 'Token Valid',
            },
        },
    }),
    (c) => {
        return c.json({
            success: true,
            message: 'Token is valid',
            user: c.get('user'),
        } as any)
    }
)

/**
 * GET /auth/me - Get current user info
 */
authRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/me',
        tags: ['Auth'],
        summary: 'Get Current User',
        security: [{ BearerAuth: [] }],
        responses: {
            200: {
                content: {
                    'application/json': {
                        schema: MeResponse,
                    },
                },
                description: 'Current User Info',
            },
        },
    }),
    async (c) => {
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
    }
)

/**
 * GET /auth/me/permissions - Get current user permissions
 */
authRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/me/permissions',
        tags: ['Auth'],
        summary: 'Get Current User Permissions',
        security: [{ BearerAuth: [] }],
        responses: {
            200: {
                content: {
                    'application/json': {
                        schema: PermissionsResponse,
                    },
                },
                description: 'User Permissions',
            },
        },
    }),
    async (c) => {
        const userId = c.get('userId')!
        const tenantId = c.get('tenantId')!

        const effect = pipe(
            rbacService.getUserPermissions(userId, tenantId),
            Effect.map((permissions) => ({ permissions }))
        )

        return runEffect(c, effect)
    }
)

/**
 * POST /auth/logout - Logout
 */
authRoutes.openapi(
    createRoute({
        method: 'post',
        path: '/logout',
        tags: ['Auth'],
        summary: 'Logout',
        security: [{ BearerAuth: [] }],
        responses: {
            200: {
                content: {
                    'application/json': {
                        schema: SuccessResponse,
                    },
                },
                description: 'Logged Out',
            },
        },
    }),
    async (c) => {
        const tokenId = c.get('tokenId')
        const userId = c.get('userId')
        const tenantId = c.get('tenantId')
        const ip = c.req.header('x-forwarded-for') || c.req.header('x-real-ip')

        if (!tokenId) {
            return c.json({ success: true, message: 'Logged out' } as any)
        }

        const effect = pipe(
            authService.logout(tokenId, 'user_logout'),
            Effect.tap(() => {
                // Log logout
                if (userId && tenantId) {
                    auditService.logAuth.logout(userId, tenantId, ip)
                }
                return Effect.succeed(void 0)
            }),
            Effect.map(() => ({
                success: true,
                message: 'Logged out successfully',
            }))
        )

        return runEffect(c, effect)
    }
)
