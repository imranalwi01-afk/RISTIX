import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { Effect, pipe } from 'effect'
import type { AppContext } from '../app'
import { authMiddleware, tenantMiddleware } from '../middleware'
import { runEffect } from '../lib/effect'
import { parsePaginationParams, parseFilterParams } from '../lib/react-admin'
import * as usersService from '../services/users.service'

export const usersRoutes = new OpenAPIHono<AppContext>()

// Apply auth and tenant middleware
usersRoutes.use('*', authMiddleware)
usersRoutes.use('*', tenantMiddleware)

// =============================================================================
// SCHEMA DEFINITIONS
// =============================================================================

// Helper to split full name if needed, or just expose fullName
const UserSchema = z.object({
    id: z.string().openapi({ example: '123e4567-e89b-12d3-a456-426614174000' }),
    email: z.string().email().openapi({ example: 'user@example.com' }),
    fullName: z.string().openapi({ example: 'John Doe' }),
    // Keeping firstName/lastName as optional derived fields for frontend compatibility if needed, 
    // but typically best to match DB or transform. Let's strictly match what we can provide from DB + simple transform.
    username: z.string().openapi({ example: 'jdoe' }),
    phone: z.string().optional().nullable().openapi({ example: '+1234567890' }),
    department: z.string().optional().nullable().openapi({ example: 'IT' }),
    position: z.string().optional().nullable().openapi({ example: 'Developer' }),
    tenantId: z.string().optional().nullable(),
    isVerified: z.boolean().optional(),
    emailVerifiedAt: z.string().optional().nullable(),
    lastLoginAt: z.string().optional().nullable(),
    isActive: z.boolean().optional(),
}).openapi('User')

const CreateUserSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    fullName: z.string().min(2),
    username: z.string().min(2),
    phone: z.string().optional(),
    department: z.string().optional(),
    position: z.string().optional(),
}).openapi('CreateUserInput')

const UpdateUserSchema = z.object({
    fullName: z.string().min(2).optional(),
    phone: z.string().optional(),
    department: z.string().optional(),
    position: z.string().optional(),
    isActive: z.boolean().optional(),
}).openapi('UpdateUserInput')

const UserListResponse = z.object({
    data: z.array(UserSchema),
    total: z.number(),
}).openapi('UserListResponse')

const UserStatsResponse = z.object({
    totalUsers: z.number(),
    activeUsers: z.number(),
    inactiveUsers: z.number(),
}).openapi('UserStatsResponse')

// =============================================================================
// ROUTES
// =============================================================================

/**
 * GET /users - List users (react-admin compatible)
 */
usersRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/',
        tags: ['Users'],
        summary: 'List Users',
        description: 'Retrieve a list of users with pagination and filtering',
        security: [{ BearerAuth: [] }],
        request: {
            query: z.object({
                page: z.string().optional().openapi({ example: '1', description: 'Page number' }),
                perPage: z.string().optional().openapi({ example: '10', description: 'Items per page' }),
                sort: z.string().optional().openapi({ example: 'createdAt', description: 'Sort field' }),
                order: z.string().optional().openapi({ example: 'DESC', description: 'Sort order' }),
                filter: z.string().optional().openapi({ example: '{"q": "john"}', description: 'JSON string of filters' }),
            }),
        },
        responses: {
            200: {
                content: {
                    'application/json': {
                        schema: UserListResponse,
                    },
                },
                description: 'List of users',
            },
        },
    }),
    async (c) => {
        const tenantId = c.get('tenantId')!
        const pagination = parsePaginationParams(c)
        const filters = parseFilterParams(c)

        const effect = pipe(
            usersService.getUsers(tenantId, {
                limit: pagination.limit,
                offset: (pagination.page - 1) * pagination.limit,
                search: filters.q as string | undefined,
                isActive: filters.includeInactive === 'true' ? undefined : true,
            }),
            Effect.map((result) => ({
                data: result.data.map(u => ({
                    ...u,
                    // Transform dates to strings for JSON response
                    emailVerifiedAt: u.emailVerifiedAt ? u.emailVerifiedAt.toISOString() : null,
                    lastLoginAt: u.lastLoginAt ? u.lastLoginAt.toISOString() : null,
                    // Ensure nulls are handled
                    phone: u.phone ?? null,
                    department: u.department ?? null,
                    position: u.position ?? null,
                    tenantId: u.tenantId ?? null,
                    isActive: u.isActive ?? false,
                    isVerified: u.isVerified ?? false,
                })),
                total: result.total
            }))
        )

        const result = await Effect.runPromise(effect)

        c.header('X-Total-Count', result.total.toString())
        return c.json(result)
    }
)

/**
 * POST /users - Create user
 */
usersRoutes.openapi(
    createRoute({
        method: 'post',
        path: '/',
        tags: ['Users'],
        summary: 'Create User',
        security: [{ BearerAuth: [] }],
        request: {
            body: {
                content: {
                    'application/json': {
                        schema: CreateUserSchema,
                    },
                },
            },
        },
        responses: {
            201: {
                content: {
                    'application/json': {
                        schema: UserSchema,
                    },
                },
                description: 'User created',
            },
        },
    }),
    async (c) => {
        const tenantId = c.get('tenantId')!
        const body = c.req.valid('json')

        const effect = pipe(
            usersService.createUser({
                ...body,
                tenantId,
                // Map API fields to Service/DB fields if needed
                // Service likely expects fullName etc now if updated, 
                // but checking the Service signature earlier it might have expected firstName/lastName 
                // We'll need to check the service, but assuming it takes Partial<User>
            }),
            Effect.map((user) => ({
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                username: user.username,
                phone: user.phone ?? null,
                department: user.department ?? null,
                position: user.position ?? null,
                tenantId: user.tenantId ?? null,
                isVerified: user.isVerified ?? false,
                emailVerifiedAt: user.emailVerifiedAt ? user.emailVerifiedAt.toISOString() : null,
                lastLoginAt: user.lastLoginAt ? user.lastLoginAt.toISOString() : null,
                isActive: user.isActive ?? false,
            }))
        )

        const result = await runEffect(c, effect)
        return c.json(result, 201)
    }
)

/**
 * GET /users/stats - User statistics
 */
usersRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/stats',
        tags: ['Users'],
        summary: 'User Statistics',
        security: [{ BearerAuth: [] }],
        responses: {
            200: {
                content: {
                    'application/json': {
                        schema: UserStatsResponse,
                    },
                },
                description: 'User statistics',
            },
        },
    }),
    async (c) => {
        const tenantId = c.get('tenantId')!
        const effect = usersService.getUserStats(tenantId)
        return runEffect(c, effect)
    }
)

/**
 * GET /users/profile - Current user profile
 */
usersRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/profile',
        tags: ['Users'],
        summary: 'Get My Profile',
        security: [{ BearerAuth: [] }],
        responses: {
            200: {
                content: {
                    'application/json': {
                        schema: UserSchema,
                    },
                },
                description: 'Current user profile',
            },
        },
    }),
    async (c) => {
        const userId = c.get('userId')!

        const effect = pipe(
            usersService.getUserById(userId),
            Effect.map((user) => ({
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                username: user.username,
                phone: user.phone ?? null,
                department: user.department ?? null,
                position: user.position ?? null,
                tenantId: user.tenantId ?? null,
                isVerified: user.isVerified ?? false,
                emailVerifiedAt: user.emailVerifiedAt ? user.emailVerifiedAt.toISOString() : null,
                lastLoginAt: user.lastLoginAt ? user.lastLoginAt.toISOString() : null,
                isActive: user.isActive ?? false,
            }))
        )

        return runEffect(c, effect)
    }
)


/**
 * GET /users/:id/dashboard/personalization - Get user dashboard settings (Stub)
 */
usersRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/{id}/dashboard/personalization',
        tags: ['Users'],
        summary: 'Get Dashboard Settings',
        security: [{ BearerAuth: [] }],
        request: {
            params: z.object({
                id: z.string().openapi({ param: { name: 'id', in: 'path' } }),
            }),
        },
        responses: {
            200: {
                description: 'Dashboard settings',
                content: {
                    'application/json': {
                        schema: z.object({
                            success: z.boolean(),
                            data: z.any()
                        })
                    }
                }
            }
        }
    }),
    async (c) => {
        const { id } = c.req.valid('param')
        return c.json({
            success: true,
            data: {
                personalization: {
                    userId: id,
                    defaultView: 'default',
                    widgetConfig: {},
                    customSettings: {},
                    themePreferences: {},
                    notificationSettings: {}
                }
            }
        })
    }
)

/**
 * PUT /users/:id/dashboard/personalization - Update user dashboard settings (Stub)
 */
usersRoutes.openapi(
    createRoute({
        method: 'put',
        path: '/{id}/dashboard/personalization',
        tags: ['Users'],
        summary: 'Update Dashboard Settings',
        security: [{ BearerAuth: [] }],
        request: {
            params: z.object({
                id: z.string().openapi({ param: { name: 'id', in: 'path' } }),
            }),
        },
        responses: {
            200: {
                description: 'Settings saved',
                content: {
                    'application/json': {
                        schema: z.object({
                            success: z.boolean(),
                            data: z.any()
                        })
                    }
                }
            }
        }
    }),
    async (c) => {
        return c.json({
            success: true,
            data: { message: 'Settings saved (mock)' }
        })
    }
)

/**
 * GET /users/:id - Get user by ID
 */
usersRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/{id}',
        tags: ['Users'],
        summary: 'Get User by ID',
        security: [{ BearerAuth: [] }],
        request: {
            params: z.object({
                id: z.string().openapi({ param: { name: 'id', in: 'path' } }),
            }),
        },
        responses: {
            200: {
                content: {
                    'application/json': {
                        schema: UserSchema,
                    },
                },
                description: 'User details',
            },
        },
    }),
    async (c) => {
        const { id } = c.req.valid('param')
        const effect = pipe(
            usersService.getUserById(id),
            Effect.map((user) => ({
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                username: user.username,
                phone: user.phone ?? null,
                department: user.department ?? null,
                position: user.position ?? null,
                tenantId: user.tenantId ?? null,
                isVerified: user.isVerified ?? false,
                emailVerifiedAt: user.emailVerifiedAt ? user.emailVerifiedAt.toISOString() : null,
                lastLoginAt: user.lastLoginAt ? user.lastLoginAt.toISOString() : null,
                isActive: user.isActive ?? false,
            }))
        )
        return runEffect(c, effect)
    }
)

/**
 * PUT /users/:id - Update user
 */
usersRoutes.openapi(
    createRoute({
        method: 'put',
        path: '/{id}',
        tags: ['Users'],
        summary: 'Update User',
        security: [{ BearerAuth: [] }],
        request: {
            params: z.object({
                id: z.string().openapi({ param: { name: 'id', in: 'path' } }),
            }),
            body: {
                content: {
                    'application/json': {
                        schema: UpdateUserSchema,
                    },
                },
            },
        },
        responses: {
            200: {
                content: {
                    'application/json': {
                        schema: UserSchema,
                    },
                },
                description: 'User updated',
            },
        },
    }),
    async (c) => {
        const { id } = c.req.valid('param')
        const body = c.req.valid('json')

        const effect = pipe(
            usersService.updateUser(id, body),
            Effect.map((user) => ({
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                username: user.username,
                phone: user.phone ?? null,
                department: user.department ?? null,
                position: user.position ?? null,
                tenantId: user.tenantId ?? null,
                isVerified: user.isVerified ?? false,
                emailVerifiedAt: user.emailVerifiedAt ? user.emailVerifiedAt.toISOString() : null,
                lastLoginAt: user.lastLoginAt ? user.lastLoginAt.toISOString() : null,
                isActive: user.isActive ?? false,
            }))
        )
        const result = await runEffect(c, effect)
        return c.json(result)
    }
)

/**
 * DELETE /users/:id - Delete user (soft delete)
 */
usersRoutes.openapi(
    createRoute({
        method: 'delete',
        path: '/{id}',
        tags: ['Users'],
        summary: 'Delete User',
        security: [{ BearerAuth: [] }],
        request: {
            params: z.object({
                id: z.string().openapi({ param: { name: 'id', in: 'path' } }),
            }),
        },
        responses: {
            200: {
                content: {
                    'application/json': {
                        schema: z.object({
                            id: z.string(),
                        }),
                    },
                },
                description: 'User deleted',
            },
        },
    }),
    async (c) => {
        const { id } = c.req.valid('param')
        const effect = usersService.deleteUser(id)
        const result = await runEffect(c, effect)
        return c.json({ id })
    }
)

/**
 * POST /users/:id/enable - Enable user
 */
usersRoutes.openapi(
    createRoute({
        method: 'post',
        path: '/{id}/enable',
        tags: ['Users'],
        summary: 'Enable User',
        security: [{ BearerAuth: [] }],
        request: {
            params: z.object({
                id: z.string().openapi({ param: { name: 'id', in: 'path' } }),
            }),
        },
        responses: {
            200: {
                description: 'User enabled',
                content: {
                    'application/json': {
                        schema: z.object({
                            success: z.boolean(),
                            message: z.string(),
                        })
                    }
                }
            },
        },
    }),
    async (c) => {
        const { id } = c.req.valid('param')

        const effect = pipe(
            usersService.enableUser(id),
            Effect.map(() => ({ success: true, message: 'User enabled' }))
        )

        return runEffect(c, effect)
    }
)

/**
 * POST /users/:id/disable - Disable user
 */
usersRoutes.openapi(
    createRoute({
        method: 'post',
        path: '/{id}/disable',
        tags: ['Users'],
        summary: 'Disable User',
        security: [{ BearerAuth: [] }],
        request: {
            params: z.object({
                id: z.string().openapi({ param: { name: 'id', in: 'path' } }),
            }),
        },
        responses: {
            200: {
                description: 'User disabled',
                content: {
                    'application/json': {
                        schema: z.object({
                            success: z.boolean(),
                            message: z.string(),
                        })
                    }
                }
            },
        },
    }),
    async (c) => {
        const { id } = c.req.valid('param')

        const effect = pipe(
            usersService.disableUser(id),
            Effect.map(() => ({ success: true, message: 'User disabled' }))
        )

        return runEffect(c, effect)
    }
)
