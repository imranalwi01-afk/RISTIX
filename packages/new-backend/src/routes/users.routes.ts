import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { Effect, pipe } from 'effect'
import type { AppContext } from '../app'
import { authMiddleware, tenantMiddleware } from '../middleware'
import { runEffect } from '../lib/effect'
import { parsePaginationParams, parseFilterParams } from '../lib/react-admin'
import * as usersService from '../services/users.service'
import { interceptCreate, interceptUpdate, interceptDelete } from '../middleware/approval-interceptor.middleware'
import { buildDefaultFourEyesRouting, type ApprovalResponse } from '../lib/approval-helpers'
import { createApprovalRequest } from '../services/approval.service'
import * as auditService from '../services/audit.service'
import { openApiValidationHook } from '../lib/http/openapi-validation-hook'
import { UserTableViewsRepository } from '@/repositories/user-table-views.repository'

export const usersRoutes: any = new OpenAPIHono<AppContext>({ defaultHook: openApiValidationHook })

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
    password: z.string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain an uppercase letter')
        .regex(/[a-z]/, 'Password must contain a lowercase letter')
        .regex(/[0-9]/, 'Password must contain a number')
        .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, 'Password must contain a special character'),
    fullName: z.string().min(2),
    username: z.string().min(2),
    phone: z.string().optional(),
    department: z.string().optional(),
    position: z.string().optional(),
    sendWelcomeEmail: z.boolean().optional(),
}).openapi('CreateUserInput')

const UpdateUserSchema = z.object({
    fullName: z.string().min(2).optional(),
    phone: z.string().optional(),
    department: z.string().optional(),
    position: z.string().optional(),
    isActive: z.boolean().optional(),
}).openapi('UpdateUserInput')

const ResetPasswordSchema = z.object({
    newPassword: z.string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain an uppercase letter')
        .regex(/[a-z]/, 'Password must contain a lowercase letter')
        .regex(/[0-9]/, 'Password must contain a number')
        .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, 'Password must contain a special character'),
    forcePasswordChange: z.boolean().optional().default(true),
}).openapi('ResetUserPasswordInput')

const UserListResponse = z.object({
    success: z.boolean(),
    data: z.object({
        users: z.array(UserSchema),
    }),
    pagination: z.object({
        total: z.number(),
        page: z.number(),
        limit: z.number(),
    }),
}).openapi('UserListResponse')

const UserStatsResponse = z.object({
    totalUsers: z.number(),
    activeUsers: z.number(),
    inactiveUsers: z.number(),
}).openapi('UserStatsResponse')

const TableViewStateSchema = z.object({
    columns: z.any().optional(),
    filters: z.record(z.any()).optional(),
    sort: z.array(z.object({
        field: z.string(),
        direction: z.enum(['asc', 'desc']),
    })).optional(),
    density: z.enum(['compact', 'standard', 'comfortable', 'dense']).optional(),
    pageSize: z.number().int().positive().optional(),
}).passthrough().openapi('TableViewState')

const UpsertTableViewSchema = z.object({
    scope: z.string().min(1).max(160),
    name: z.string().min(1).max(160).optional(),
    isDefault: z.boolean().optional(),
    state: TableViewStateSchema,
}).openapi('UpsertTableViewInput')

const isPendingApprovalRequest = (request: { status?: string } | null | undefined): boolean => {
    const normalizedStatus = String(request?.status || '').trim().toLowerCase()
    return normalizedStatus === '' || normalizedStatus === 'pending'
}

const buildApprovalSubmissionResponse = (request: { id: string; status?: string }, message: string) => {
    const isPending = isPendingApprovalRequest(request)
    const isApproved = String(request.status || '').trim().toLowerCase() === 'approved'

    return {
        success: true,
        approvalRequired: isPending,
        autoApproved: !isPending && isApproved,
        requestId: request.id,
        message: isPending
            ? message
            : 'Request auto-approved and executed successfully.',
    }
}

// =============================================================================
// ROUTES
// =============================================================================

// =============================================================================
// ROUTES
// =============================================================================

/**
 * List Users.
 * Retrieve a list of users with pagination and filtering.
 * Compatible with react-admin data provider.
 * 
 * @route GET /users
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
                limit: z.string().optional().openapi({ example: '10', description: 'Items per page' }),
                search: z.string().optional().openapi({ example: 'john', description: 'Search term' }),
                isActive: z.string().optional().openapi({ example: 'true', description: 'Filter by active status' }),
                includeInactive: z.string().optional().openapi({ example: 'true', description: 'Include inactive users in the list result' }),
                department: z.string().optional().openapi({ example: 'IT', description: 'Filter by department' }),
                bankingAccess: z.string().optional().openapi({ example: 'CONVENTIONAL', description: 'Filter by banking access' }),
                sort: z.string().optional().openapi({ example: 'createdAt', description: 'Sort field' }),
                order: z.string().optional().openapi({ example: 'DESC', description: 'Sort order' }),
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
    async (c: any) => {
        const tenantId = c.get('tenantId')!
        const query = c.req.valid('query')

        const page = parseInt(query.page || '1')
        const limit = parseInt(query.limit || '10')
        const includeInactive = query.includeInactive === 'true'
        const parsedIsActive = query.isActive === 'true'
            ? true
            : query.isActive === 'false'
                ? false
                : undefined

        const effect = pipe(
            usersService.getUsers(tenantId, {
                limit,
                offset: (page - 1) * limit,
                search: query.search,
                isActive: parsedIsActive ?? (includeInactive ? undefined : true),
                // Add sorting if needed
                sort: query.sort,
                order: (query.order?.toLowerCase() as 'asc' | 'desc') || 'desc'
            }),
            Effect.map((result) => ({
                success: true,
                data: {
                    users: result.data.map(u => ({
                        ...u,
                        emailVerifiedAt: u.emailVerifiedAt ? u.emailVerifiedAt.toISOString() : null,
                        lastLoginAt: u.lastLoginAt ? u.lastLoginAt.toISOString() : null,
                        phone: u.phone ?? null,
                        department: u.department ?? null,
                        position: u.position ?? null,
                        tenantId: u.tenantId ?? null,
                        isActive: u.isActive ?? false,
                        isVerified: u.isVerified ?? false,
                    })),
                },
                pagination: {
                    total: result.total,
                    page,
                    limit
                }
            }))
        )

        const result = await Effect.runPromise(effect)

        c.header('X-Total-Count', (result as any).pagination.total.toString())
        return c.json(result)
    }
)

/**
 * Reset User Password (admin/platform-admin only).
 *
 * @route POST /users/:id/reset-password
 */
usersRoutes.openapi(
    createRoute({
        method: 'post',
        path: '/{id}/reset-password',
        tags: ['Users'],
        summary: 'Reset User Password',
        security: [{ BearerAuth: [] }],
        request: {
            params: z.object({
                id: z.string().openapi({ param: { name: 'id', in: 'path' } }),
            }),
            body: {
                content: {
                    'application/json': {
                        schema: ResetPasswordSchema,
                    },
                },
            },
        },
        responses: {
            200: {
                description: 'Password reset successful',
                content: {
                    'application/json': {
                        schema: z.object({
                            success: z.boolean(),
                            message: z.string(),
                            data: UserSchema,
                        }),
                    },
                },
            },
            403: {
                description: 'Forbidden',
                content: {
                    'application/json': {
                        schema: z.object({
                            success: z.boolean(),
                            error: z.string(),
                            code: z.string(),
                        }),
                    },
                },
            },
        },
    }),
    async (c: any) => {
        const { id } = c.req.valid('param')
        const tenantId = c.get('tenantId')!
        const body = c.req.valid('json')
        const userPermissions = (c.get('userPermissions') as string[]) || []
        const isSystemUser = c.get('isSystemUser')

        const canResetPassword =
            isSystemUser ||
            userPermissions.includes('admin.super_admin') ||
            userPermissions.includes('admin.users.manage') ||
            userPermissions.includes('MANAGE_USERS')

        if (!canResetPassword) {
            return c.json(
                {
                    success: false,
                    error: 'Insufficient permission to reset user password',
                    code: 'FORBIDDEN',
                },
                403
            )
        }

        const effect = pipe(
            usersService.resetPassword(id, body.newPassword, tenantId, {
                forcePasswordChange: body.forcePasswordChange,
            }),
            Effect.map((user) => ({
                success: true,
                message: 'Password reset successfully',
                data: {
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
                },
            }))
        )

        return runEffect(c, effect)
    }
)

/**
 * Create User.
 * Register a new user in the tenant.
 * 
 * @route POST /users
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
    async (c: any) => {
        const tenantId = c.get('tenantId')!
        const userId = c.get('userId')!
        const userPermissions = (c.get('userPermissions') as string[]) || []
        const body = c.req.valid('json')

        // Define the actual user creation operation
        const executeCreate = () => pipe(
            usersService.createUser({
                ...body,
                tenantId,
            }),
            Effect.tap((user) => Effect.sync(() => {
                if (body.sendWelcomeEmail) {
                    import('../services/notification.service').then(({ sendEmailNotification }) => {
                        import('../config/env').then(({ env: config }) => {
                            const loginUrl = `${(config as any).FRONTEND_URL || 'http://localhost:4231'}/login`;
                            const job = { template: 'welcome_email' } as any;
                            Effect.runPromise(sendEmailNotification).then(sendFn => {
                                sendFn(job, body.email, {
                                    fullName: body.fullName,
                                    username: body.username,
                                    password: body.password,
                                    loginUrl,
                                }).catch(e => console.error('Failed to send welcome email', e));
                            });
                        });
                    });
                }
            }))
        )

        // Use approval interceptor
        const effect = pipe(
            interceptCreate(
                tenantId,
                userId,
                userPermissions,
                'user',
                { ...body, tenantId },
                executeCreate,
                'medium' // impact level
            ),
            Effect.map((response: ApprovalResponse) => {
                if (response.approvalRequired) {
                    // Return approval pending response
                    return response
                } else {
                    // Return created user
                    const user = response.data as any
                    return {
                        success: true,
                        approvalRequired: false,
                        data: {
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
                        }
                    }
                }
            })
        )
        return runEffect(c, effect, (result: any) => result.approvalRequired ? 202 : 201)
    }
)

/**
 * Get User Statistics.
 * Returns counts of total, active, and inactive users.
 * 
 * @route GET /users/stats
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
    async (c: any) => {
        const tenantId = c.get('tenantId')!
        const effect = usersService.getUserStats(tenantId)
        return runEffect(c, effect)
    }
)

/**
 * Get My Profile.
 * Retrieve the profile of the currently authenticated user.
 * 
 * @route GET /users/profile
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
    async (c: any) => {
        const userId = c.get('userId')!
        const tenantId = c.get('tenantId')

        const effect = pipe(
            usersService.getUserById(userId, tenantId),
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
 * Get Dashboard Settings.
 * Retrieve personalization settings for the user's dashboard.
 * (Currently returns a mock/stub response)
 * 
 * @route GET /users/:id/dashboard/personalization
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
    async (c: any) => {
        try {
            const { id } = c.req.valid('param')
            const tenantId = (c as any).get('tenantId') || 'iaf'
            const DASHBOARD_SCOPE = '__dashboard_personalization__'
            const views = await UserTableViewsRepository.list(tenantId, id, DASHBOARD_SCOPE)
            const settings = views.length > 0 ? ((views[0] as any).state || {}) : {
                defaultView: 'default',
                widgetConfig: {},
                customSettings: {},
                themePreferences: {},
                notificationSettings: {},
            }
            return c.json({
                success: true,
                data: {
                    personalization: {
                        userId: id,
                        ...settings,
                    }
                }
            })
        } catch (error: any) {
            console.error('Error fetching dashboard personalization:', error)
            return c.json({
                success: true,
                data: {
                    personalization: {
                        userId: c.req.param('id'),
                        defaultView: 'default',
                        widgetConfig: {},
                        customSettings: {},
                        themePreferences: {},
                        notificationSettings: {},
                    }
                }
            })
        }
    }
)

/**
 * Update Dashboard Settings.
 * Save personalization settings for the user's dashboard.
 * (Currently returns a mock/stub response)
 * 
 * @route PUT /users/:id/dashboard/personalization
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
    async (c: any) => {
        try {
            const { id } = c.req.valid('param')
            const tenantId = (c as any).get('tenantId') || 'iaf'
            const body = await c.req.json()
            const DASHBOARD_SCOPE = '__dashboard_personalization__'
            await UserTableViewsRepository.upsert({
                tenantId,
                userId: id,
                scope: DASHBOARD_SCOPE,
                viewKey: 'dashboard-personalization',
                name: 'Dashboard Personalization',
                isDefault: true,
                state: body.personalization || body,
            })
            return c.json({
                success: true,
                data: {
                    message: 'Dashboard personalization saved successfully',
                    personalization: body.personalization || body,
                }
            })
        } catch (error: any) {
            console.error('Error saving dashboard personalization:', error)
            return c.json({
                success: false,
                data: null,
                message: error.message || 'Failed to save settings',
            }, 500)
        }
    }
)

/**
 * List persisted table views for a user and page scope.
 *
 * @route GET /users/:id/table-views?scope=<pageKey>
 */
usersRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/{id}/table-views',
        tags: ['Users'],
        summary: 'List user table views',
        security: [{ BearerAuth: [] }],
        request: {
            params: z.object({
                id: z.string().uuid().openapi({ param: { name: 'id', in: 'path' } }),
            }),
            query: z.object({
                scope: z.string().min(1).max(160),
            }),
        },
        responses: {
            200: {
                description: 'User table views',
                content: {
                    'application/json': {
                        schema: z.object({
                            success: z.boolean(),
                            data: z.array(z.any()),
                        }),
                    },
                },
            },
        },
    }),
    async (c: any) => {
        const { id } = c.req.valid('param')
        const { scope } = c.req.valid('query')
        const currentUserId = c.get('userId') || c.get('user')?.id
        if (currentUserId !== id) {
            return c.json({ success: false, error: 'Forbidden', message: 'Cannot read table views for another user' }, 403)
        }

        const tenantId = c.get('tenantId') || c.get('user')?.tenantId
        const data = await UserTableViewsRepository.list(tenantId, id, scope)
        return c.json({ success: true, data })
    }
)

/**
 * Upsert a persisted table view for a user.
 *
 * @route PUT /users/:id/table-views/:viewKey
 */
usersRoutes.openapi(
    createRoute({
        method: 'put',
        path: '/{id}/table-views/{viewKey}',
        tags: ['Users'],
        summary: 'Save user table view',
        security: [{ BearerAuth: [] }],
        request: {
            params: z.object({
                id: z.string().uuid().openapi({ param: { name: 'id', in: 'path' } }),
                viewKey: z.string().min(1).max(160).openapi({ param: { name: 'viewKey', in: 'path' } }),
            }),
            body: {
                content: {
                    'application/json': {
                        schema: UpsertTableViewSchema,
                    },
                },
            },
        },
        responses: {
            200: {
                description: 'Table view saved',
                content: {
                    'application/json': {
                        schema: z.object({
                            success: z.boolean(),
                            data: z.any(),
                        }),
                    },
                },
            },
        },
    }),
    async (c: any) => {
        const { id, viewKey } = c.req.valid('param')
        const body = c.req.valid('json')
        const currentUserId = c.get('userId') || c.get('user')?.id
        if (currentUserId !== id) {
            return c.json({ success: false, error: 'Forbidden', message: 'Cannot write table views for another user' }, 403)
        }

        const tenantId = c.get('tenantId') || c.get('user')?.tenantId
        const data = await UserTableViewsRepository.upsert({
            tenantId,
            userId: id,
            scope: body.scope,
            viewKey,
            name: body.name,
            isDefault: body.isDefault,
            state: body.state,
        })
        return c.json({ success: true, data })
    }
)

/**
 * Delete a persisted table view for a user.
 *
 * @route DELETE /users/:id/table-views/:viewKey?scope=<pageKey>
 */
usersRoutes.openapi(
    createRoute({
        method: 'delete',
        path: '/{id}/table-views/{viewKey}',
        tags: ['Users'],
        summary: 'Delete user table view',
        security: [{ BearerAuth: [] }],
        request: {
            params: z.object({
                id: z.string().uuid().openapi({ param: { name: 'id', in: 'path' } }),
                viewKey: z.string().min(1).max(160).openapi({ param: { name: 'viewKey', in: 'path' } }),
            }),
            query: z.object({
                scope: z.string().min(1).max(160),
            }),
        },
        responses: {
            200: {
                description: 'Table view deleted',
                content: {
                    'application/json': {
                        schema: z.object({
                            success: z.boolean(),
                            data: z.any().nullable(),
                        }),
                    },
                },
            },
        },
    }),
    async (c: any) => {
        const { id, viewKey } = c.req.valid('param')
        const { scope } = c.req.valid('query')
        const currentUserId = c.get('userId') || c.get('user')?.id
        if (currentUserId !== id) {
            return c.json({ success: false, error: 'Forbidden', message: 'Cannot delete table views for another user' }, 403)
        }

        const tenantId = c.get('tenantId') || c.get('user')?.tenantId
        const data = await UserTableViewsRepository.remove(tenantId, id, scope, viewKey)
        return c.json({ success: true, data: data ?? null })
    }
)

/**
 * Get User by ID.
 * Retrieve details of a specific user.
 * 
 * @route GET /users/:id
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
                description: 'User details',
                content: {
                    'application/json': {
                        schema: z.object({
                            success: z.boolean(),
                            data: UserSchema,
                        })
                    }
                }
            },
        },
    }),
    async (c: any) => {
        const { id } = c.req.valid('param')
        const tenantId = c.get('tenantId')!
        const effect = pipe(
            usersService.getUserById(id, tenantId),
            Effect.map((user) => ({
                success: true,
                data: {
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
                },
            }))
        )
        return runEffect(c, effect)
    }
)

/**
 * Update User.
 * Update details of a specific user.
 * 
 * @route PUT /users/:id
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
                description: 'User updated',
                content: {
                    'application/json': {
                        schema: z.object({
                            success: z.boolean(),
                            data: UserSchema,
                        })
                    }
                }
            },
        },
    }),
    async (c: any) => {
        const { id } = c.req.valid('param')
        const tenantId = c.get('tenantId')!
        const userId = c.get('userId')!
        const userPermissions = (c.get('userPermissions') as string[]) || []
        const body = c.req.valid('json')
        const currentUser = await Effect.runPromise(usersService.getUserById(id, tenantId))

        // Define the actual user update operation
        const executeUpdate = () => usersService.updateUser(id, { ...body, tenantId })

        // Use approval interceptor
        const effect = pipe(
            interceptUpdate(
                tenantId,
                userId,
                userPermissions,
                'user',
                id,
                body,
                executeUpdate,
                'medium',
                {
                    id: currentUser.id,
                    email: currentUser.email,
                    fullName: currentUser.fullName,
                    username: currentUser.username,
                    phone: currentUser.phone ?? null,
                    department: currentUser.department ?? null,
                    position: currentUser.position ?? null,
                    tenantId: currentUser.tenantId ?? null,
                    isActive: currentUser.isActive ?? false,
                }
            ),
            Effect.map((response: ApprovalResponse) => {
                if (response.approvalRequired) {
                    return response
                } else {
                    const user = response.data as any
                    return {
                        success: true,
                        approvalRequired: false,
                        data: {
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
                        },
                    }
                }
            })
        )
        return runEffect(c, effect)
    }
)

/**
 * Delete User.
 * Soft delete a user (mark as inactive).
 * 
 * @route DELETE /users/:id
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
    async (c: any) => {
        const { id } = c.req.valid('param')
        const tenantId = c.get('tenantId')!
        const userId = c.get('userId')!
        const userPermissions = (c.get('userPermissions') as string[]) || []
        const currentUser = await Effect.runPromise(usersService.getUserById(id, tenantId))

        // Define the actual user deletion operation
        const executeDelete = () => usersService.deleteUser(id, tenantId)

        // Use approval interceptor
        const effect = pipe(
            interceptDelete(
                tenantId,
                userId,
                userPermissions,
                'user',
                id,
                executeDelete,
                'high', // Deleting users is high impact
                {
                    id: currentUser.id,
                    email: currentUser.email,
                    fullName: currentUser.fullName,
                    username: currentUser.username,
                    phone: currentUser.phone ?? null,
                    department: currentUser.department ?? null,
                    position: currentUser.position ?? null,
                    tenantId: currentUser.tenantId ?? null,
                    isActive: currentUser.isActive ?? false,
                }
            ),
            Effect.map((response: ApprovalResponse) => {
                if (response.approvalRequired) {
                    return response
                } else {
                    return {
                        success: true,
                        approvalRequired: false,
                        id,
                    }
                }
            })
        )
        return runEffect(c, effect)
    }
)

/**
 * Enable User.
 * Reactivate a disabled user.
 * 
 * @route POST /users/:id/enable
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
    async (c: any) => {
        const { id } = c.req.valid('param')
        const tenantId = c.get('tenantId')!
        const requestedBy = c.get('userId')!

        const effect = pipe(
            usersService.getUserById(id, tenantId),
            Effect.flatMap((currentUser) =>
                pipe(
                    createApprovalRequest({
                        tenantId,
                        entityType: 'user_status',
                        entityId: id,
                        title: `Enable user: ${id}`,
                        description: `User activation requested for user ${id}.`,
                        requestData: {
                            operation: 'update',
                            entityType: 'user_status',
                            oldValues: {
                                id: currentUser.id,
                                isActive: currentUser.isActive ?? false,
                            },
                            data: {
                                id,
                                isActive: true,
                                tenantId,
                            },
                            approvalRouting: { levels: buildDefaultFourEyesRouting('user_status') },
                        },
                        requestedBy,
                        impactLevel: 'high',
                    }),
                    Effect.tap((request) =>
                        Effect.sync(() => {
                            auditService.runAuditSafely(
                                auditService.logApproval.requested(
                                    request.id,
                                    request.title,
                                    requestedBy,
                                    tenantId,
                                    {
                                        entityType: 'user_status',
                                        oldValues: {
                                            id: currentUser.id,
                                            isActive: currentUser.isActive ?? false,
                                        },
                                        newValues: {
                                            id,
                                            isActive: true,
                                            tenantId,
                                        },
                                    }
                                ),
                                `approval request logging for enable user ${id}`
                            )
                        })
                    ),
                    Effect.map((request) =>
                        buildApprovalSubmissionResponse(
                            request,
                            'User enable request submitted for approval.'
                        )
                    )
                )
            )
        )

        return runEffect(
            c,
            effect,
            (response: ApprovalResponse) => response.approvalRequired ? 202 : 200
        )
    }
)

/**
 * Disable User.
 * Deactivate a user account.
 * 
 * @route POST /users/:id/disable
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
    async (c: any) => {
        const { id } = c.req.valid('param')
        const tenantId = c.get('tenantId')!
        const requestedBy = c.get('userId')!

        const effect = pipe(
            usersService.getUserById(id, tenantId),
            Effect.flatMap((currentUser) =>
                pipe(
                    createApprovalRequest({
                        tenantId,
                        entityType: 'user_status',
                        entityId: id,
                        title: `Disable user: ${id}`,
                        description: `User deactivation requested for user ${id}.`,
                        requestData: {
                            operation: 'update',
                            entityType: 'user_status',
                            oldValues: {
                                id: currentUser.id,
                                isActive: currentUser.isActive ?? false,
                            },
                            data: {
                                id,
                                isActive: false,
                                tenantId,
                            },
                            approvalRouting: { levels: buildDefaultFourEyesRouting('user_status') },
                        },
                        requestedBy,
                        impactLevel: 'high',
                    }),
                    Effect.tap((request) =>
                        Effect.sync(() => {
                            auditService.runAuditSafely(
                                auditService.logApproval.requested(
                                    request.id,
                                    request.title,
                                    requestedBy,
                                    tenantId,
                                    {
                                        entityType: 'user_status',
                                        oldValues: {
                                            id: currentUser.id,
                                            isActive: currentUser.isActive ?? false,
                                        },
                                        newValues: {
                                            id,
                                            isActive: false,
                                            tenantId,
                                        },
                                    }
                                ),
                                `approval request logging for disable user ${id}`
                            )
                        })
                    ),
                    Effect.map((request) =>
                        buildApprovalSubmissionResponse(
                            request,
                            'User disable request submitted for approval.'
                        )
                    )
                )
            )
        )

        return runEffect(
            c,
            effect,
            (response: ApprovalResponse) => response.approvalRequired ? 202 : 200
        )
    }
)
