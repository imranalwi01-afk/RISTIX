import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { Effect, pipe } from 'effect'
import { NotFoundError, BusinessError } from '../lib/errors'
import type { AppContext } from '../app'
import { authMiddleware } from '../middleware'
import { runEffect } from '../lib/effect'
import { parsePaginationParams, parseFilterParams } from '../lib/react-admin'
import * as tenantsService from '../services/tenants.service'
import { buildErrorResponse } from '../lib/http/error-response'

/**
 * Tenants Routes
 * Handles CRUD operations for Tenants.
 * 
 * Base Path: /tenants
 */
export const tenantsRoutes: any = new OpenAPIHono<AppContext>()

// Apply auth middleware
tenantsRoutes.use('*', authMiddleware)

/**
 * Middleware to check if user is platform admin
 * For OpenAPI routes, we can't easily use inline middleware functions in the route definition
 * effectively without losing type inference sometimes, or we can use it as a hook.
 * But here we will stick to the service logic or check it inside the handler for simplicity in the OpenAPI port,
 * OR we can use the existing middleware approach if we apply it strictly to paths.
 * 
 * However, we can simply check inside the handler for now to be safe and explicit, 
 * or better yet, assume authMiddleware populates the user and we check the role.
 */
const requirePlatformAdmin = (c: any) => {
    const isPlatformAdmin = c.get('isSystemUser')
    if (!isPlatformAdmin) {
        throw new Error('Unauthorized: Platform Admin access required')
    }
}

const forbidden = (c: any, message: string) =>
    c.json(buildErrorResponse(c, { error: message, message, code: 'FORBIDDEN' }), 403)

const badRequest = (c: any, message: string) =>
    c.json(buildErrorResponse(c, { error: message, message, code: 'BAD_REQUEST' }), 400)

const notFound = (c: any, message: string) =>
    c.json(buildErrorResponse(c, { error: message, message, code: 'NOT_FOUND' }), 404)

const toSettingsObject = (value: unknown): Record<string, unknown> | null => {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
        return value as Record<string, unknown>
    }
    return null
}

// =============================================================================
// SCHEMA DEFINITIONS
// =============================================================================

const TenantSchema = z.object({
    id: z.string().openapi({ example: '123e4567-e89b-12d3-a456-426614174000' }),
    code: z.string().min(2).max(50).openapi({ example: 'BRI' }),
    name: z.string().min(2).max(255).openapi({ example: 'Bank Rakyat Indonesia' }),
    slug: z.string().min(2).max(100).optional().nullable().openapi({ example: 'bri' }),
    description: z.string().optional().nullable().openapi({ example: 'National bank' }),
    type: z.string().optional().nullable().openapi({ example: 'banking' }),
    bankingMode: z.string().optional().nullable().openapi({ example: 'conventional' }),
    settings: z.record(z.unknown()).optional().nullable(),
    isActive: z.boolean().optional(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
}).openapi('Tenant')

const CreateTenantSchema = z.object({
    code: z.string().min(2).max(50),
    name: z.string().min(2).max(255),
    slug: z.string().min(2).max(100).optional(),
    description: z.string().optional(),
    type: z.enum(['banking', 'fintech', 'insurance']).optional(),
    bankingMode: z.enum(['conventional', 'syariah', 'dual']).optional(),
    settings: z.record(z.unknown()).optional(),
}).openapi('CreateTenantInput')

const UpdateTenantSchema = z.object({
    name: z.string().min(2).max(255).optional(),
    description: z.string().optional(),
    bankingMode: z.enum(['conventional', 'syariah', 'dual']).optional(),
    settings: z.record(z.unknown()).optional(),
    isActive: z.boolean().optional(),
}).openapi('UpdateTenantInput')

const TenantListResponse = z.object({
    data: z.array(TenantSchema),
    total: z.number(),
}).openapi('TenantListResponse')

const ErrorSchema = z.object({
    success: z.boolean(),
    error: z.any(),
}).openapi('ErrorResponse')

// =============================================================================
// ROUTES
// =============================================================================

/**
 * GET /tenants - List all tenants (react-admin compatible)
 * Restricted to Platform Admins
 */
tenantsRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/',
        tags: ['Tenants'],
        summary: 'List Tenants',
        description: 'Retrieve a list of tenants (Platform Admin only)',
        security: [{ BearerAuth: [] }],
        request: {
            query: z.object({
                page: z.string().optional().openapi({ example: '1', description: 'Page number' }),
                perPage: z.string().optional().openapi({ example: '10', description: 'Items per page' }),
                sort: z.string().optional().openapi({ example: 'createdAt', description: 'Sort field' }),
                order: z.string().optional().openapi({ example: 'DESC', description: 'Sort order' }),
                filter: z.string().optional().openapi({ example: '{"q": "bank"}', description: 'JSON string of filters' }),
                mode: z.string().optional().openapi({ example: 'admin', description: 'Mode' }),
            }),
        },
        responses: {
            200: {
                content: {
                    'application/json': {
                        schema: TenantListResponse,
                    },
                },
                description: 'List of tenants',
            },
            403: {
                content: {
                    'application/json': {
                        schema: ErrorSchema,
                    },
                },
                description: 'Unauthorized'
            }
        },
    }),
    async (c: any) => {
        try { requirePlatformAdmin(c) } catch (e: any) { return forbidden(c, e.message) }

        const pagination = parsePaginationParams(c)
        const filters = parseFilterParams(c)

        const includeSystem = filters.includeSystem === 'true' || c.req.query('mode') === 'admin'

        const effect = tenantsService.getTenants({
            pagination,
            search: filters.q as string | undefined,
            bankingMode: filters.bankingMode as string | undefined,
            includeInactive: filters.includeInactive === 'true',
            includeSystem
        })

        const result = await Effect.runPromise(effect)

        c.header('X-Total-Count', result.total.toString())

        return c.json({
            data: result.data.map(t => ({
                id: t.id,
                code: t.code,
                name: t.name,
                slug: t.slug,
                description: t.description,
                type: t.type,
                bankingMode: t.bankingMode,
                settings: toSettingsObject(t.settings),
                isActive: t.isActive,
                createdAt: t.createdAt.toISOString(),
                updatedAt: t.updatedAt.toISOString(),
            })),
            total: result.total
        }, 200)
    }
)

/**
 * POST /tenants - Create a new tenant
 * Restricted to Platform Admins
 */
tenantsRoutes.openapi(
    createRoute({
        method: 'post',
        path: '/',
        tags: ['Tenants'],
        summary: 'Create Tenant',
        security: [{ BearerAuth: [] }],
        request: {
            body: {
                content: {
                    'application/json': {
                        schema: CreateTenantSchema,
                    },
                },
            },
        },
        responses: {
            200: {
                content: {
                    'application/json': {
                        schema: z.object({
                            success: z.boolean(),
                            data: TenantSchema,
                        }),
                    },
                },
                description: 'Tenant created',
            },
            403: {
                content: {
                    'application/json': {
                        schema: ErrorSchema,
                    },
                },
                description: 'Unauthorized'
            }
        },
    }),
    async (c: any) => {
        try { requirePlatformAdmin(c) } catch (e: any) { return forbidden(c, e.message) }

        const body = c.req.valid('json')

        const effect = pipe(
            tenantsService.createTenant(body),
            Effect.map((tenant) => ({
                success: true,
                data: {
                    ...tenant,
                    createdAt: tenant.createdAt.toISOString(),
                    updatedAt: tenant.updatedAt.toISOString(),
                    settings: toSettingsObject(tenant.settings)
                },
            }))
        )
        return runEffect(c, effect)
    }
)

/**
 * GET /tenants/current - Get current tenant context
 */
tenantsRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/current',
        tags: ['Tenants'],
        summary: 'Get Current Tenant',
        security: [{ BearerAuth: [] }],
        responses: {
            200: {
                content: {
                    'application/json': {
                        schema: TenantSchema,
                    },
                },
                description: 'Current tenant details',
            },
            400: {
                content: {
                    'application/json': {
                        schema: ErrorSchema,
                    },
                },
                description: 'No tenant context'
            },
            404: {
                content: {
                    'application/json': {
                        schema: ErrorSchema,
                    },
                },
                description: 'Tenant not found'
            }
        },
    }),
    async (c: any) => {
        const tenantId = c.get('tenantId')
        if (!tenantId) {
            return badRequest(c, 'No tenant context')
        }

        const effect = pipe(
            tenantsService.getTenantById(tenantId),
            Effect.flatMap(t => {
                if (!t) return Effect.fail(new NotFoundError({
                    message: 'Tenant not found',
                    resource: 'Tenant',
                    id: tenantId
                }))
                return Effect.succeed({
                    ...t,
                    createdAt: t.createdAt.toISOString(),
                    updatedAt: t.updatedAt.toISOString(),
                    settings: toSettingsObject(t.settings)
                })
            })
        )

        try {
            return runEffect(c, effect)
        } catch (e: any) {
            return notFound(c, e.message)
        }
    }
)

/**
 * GET /tenants/slug/:slug - Get tenant by slug
 */
tenantsRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/slug/{slug}',
        tags: ['Tenants'],
        summary: 'Get Tenant by Slug',
        security: [{ BearerAuth: [] }],
        request: {
            params: z.object({
                slug: z.string().openapi({ param: { name: 'slug', in: 'path' } }),
            }),
        },
        responses: {
            200: {
                content: {
                    'application/json': {
                        schema: z.object({
                            success: z.boolean(),
                            data: TenantSchema,
                        }),
                    },
                },
                description: 'Tenant details',
            },
            404: {
                content: {
                    'application/json': {
                        schema: ErrorSchema,
                    },
                },
                description: 'Tenant not found'
            }
        },
    }),
    async (c: any) => {
        const { slug } = c.req.valid('param')

        const tenant = await Effect.runPromise(tenantsService.getTenantBySlug(slug))
        if (!tenant) {
            return notFound(c, 'Tenant not found')
        }
        return c.json({
            success: true,
            data: {
                ...tenant,
                createdAt: tenant.createdAt.toISOString(),
                updatedAt: tenant.updatedAt.toISOString(),
                settings: toSettingsObject(tenant.settings)
            }
        }, 200)
    }
)

/**
 * GET /tenants/:id - Get tenant by ID
 */
tenantsRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/{id}',
        tags: ['Tenants'],
        summary: 'Get Tenant by ID',
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
                        schema: TenantSchema,
                    },
                },
                description: 'Tenant details',
            },
            404: {
                content: {
                    'application/json': {
                        schema: ErrorSchema,
                    },
                },
                description: 'Tenant not found'
            }
        },
    }),
    async (c: any) => {
        const { id } = c.req.valid('param')

        const effect = pipe(
            tenantsService.getTenantById(id),
            Effect.flatMap(t => {
                if (!t) return Effect.fail(new NotFoundError({
                    message: 'Tenant not found',
                    resource: 'Tenant',
                    id: id
                }))
                return Effect.succeed({
                    ...t,
                    createdAt: t.createdAt.toISOString(),
                    updatedAt: t.updatedAt.toISOString(),
                    settings: toSettingsObject(t.settings)
                })
            })
        )

        try {
            return runEffect(c, effect)
        } catch (e: any) {
            return notFound(c, e.message)
        }
    }
)

/**
 * PUT /tenants/:id - Update tenant
 * Restricted to Platform Admins
 */
tenantsRoutes.openapi(
    createRoute({
        method: 'put',
        path: '/{id}',
        tags: ['Tenants'],
        summary: 'Update Tenant',
        security: [{ BearerAuth: [] }],
        request: {
            params: z.object({
                id: z.string().openapi({ param: { name: 'id', in: 'path' } }),
            }),
            body: {
                content: {
                    'application/json': {
                        schema: UpdateTenantSchema,
                    },
                },
            },
        },
        responses: {
            200: {
                content: {
                    'application/json': {
                        schema: TenantSchema,
                    },
                },
                description: 'Tenant updated',
            },
            403: {
                content: {
                    'application/json': {
                        schema: ErrorSchema,
                    },
                },
                description: 'Unauthorized'
            },
            404: {
                content: {
                    'application/json': {
                        schema: ErrorSchema,
                    },
                },
                description: 'Tenant not found'
            }
        },
    }),
    async (c: any) => {
        try { requirePlatformAdmin(c) } catch (e: any) { return forbidden(c, e.message) }

        const { id } = c.req.valid('param')
        const body = c.req.valid('json')

        const effect = pipe(
            tenantsService.updateTenant(id, body),
            Effect.flatMap(t => {
                if (!t) return Effect.fail(new NotFoundError({
                    message: 'Tenant not found',
                    resource: 'Tenant',
                    id: id
                }))
                return Effect.succeed({
                    ...t,
                    createdAt: t.createdAt.toISOString(),
                    updatedAt: t.updatedAt.toISOString(),
                    settings: t.settings as Record<string, unknown>
                })
            })
        )

        try {
            return runEffect(c, effect)
        } catch (e: any) {
            return notFound(c, e.message)
        }
    }
)

/**
 * DELETE /tenants/:id - Delete tenant (soft delete)
 * Restricted to Platform Admins
 */
tenantsRoutes.openapi(
    createRoute({
        method: 'delete',
        path: '/{id}',
        tags: ['Tenants'],
        summary: 'Delete Tenant',
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
                description: 'Tenant deleted',
            },
            403: {
                content: {
                    'application/json': {
                        schema: ErrorSchema,
                    },
                },
                description: 'Unauthorized'
            }
        },
    }),
    async (c: any) => {
        try { requirePlatformAdmin(c) } catch (e: any) { return forbidden(c, e.message) }

        const { id } = c.req.valid('param')
        const effect = pipe(
            tenantsService.deleteTenant(id),
            Effect.map(() => ({ id }))
        )

        return runEffect(c, effect)
    }
)

/**
 * POST /tenants/:id/enable - Enable tenant
 */
tenantsRoutes.openapi(
    createRoute({
        method: 'post',
        path: '/{id}/enable',
        tags: ['Tenants'],
        summary: 'Enable Tenant',
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
                            success: z.boolean(),
                            message: z.string(),
                        })
                    }
                },
                description: 'Tenant enabled'
            }
        }
    }),
    async (c: any) => {
        try { requirePlatformAdmin(c) } catch (e: any) { return forbidden(c, e.message) }

        const { id } = c.req.valid('param' as any)

        const effect = pipe(
            tenantsService.enableTenant(id),
            Effect.map(() => ({ success: true, message: 'Tenant enabled' }))
        )
        return runEffect(c, effect)
    }
)

/**
 * POST /tenants/:id/disable - Disable tenant
 */
tenantsRoutes.openapi(
    createRoute({
        method: 'post',
        path: '/{id}/disable',
        tags: ['Tenants'],
        summary: 'Disable Tenant',
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
                            success: z.boolean(),
                            message: z.string(),
                        })
                    }
                },
                description: 'Tenant disabled'
            }
        }
    }),
    async (c: any) => {
        try { requirePlatformAdmin(c) } catch (e: any) { return forbidden(c, e.message) }

        const { id } = c.req.valid('param' as any)

        const effect = pipe(
            tenantsService.disableTenant(id),
            Effect.map(() => ({ success: true, message: 'Tenant disabled' }))
        )
        return runEffect(c, effect)
    }
)
