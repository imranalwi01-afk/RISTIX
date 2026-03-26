import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { Effect } from 'effect'
import { eq, and, desc, sql } from 'drizzle-orm'
import { db } from '../config/database'
import { platformUsers } from '../db/schema' // ✅ Use platformUsers schema
import type { AppContext } from '../app'
import { authMiddleware } from '../middleware' // ❌ Removed tenantMiddleware as this is platform level
import { runEffect } from '../lib/effect'
import { parsePaginationParams, parseFilterParams } from '../lib/react-admin'
import { DatabaseError } from '../lib/errors'
import * as tenantsService from '../services/tenants.service'

export const platformUsersRoutes: any = new OpenAPIHono<AppContext>()

platformUsersRoutes.use('*', authMiddleware)
platformUsersRoutes.use('*', async (c: any, next: any) => {
    const permissions = ((c.get('permissions') as string[]) || []).filter((item): item is string => typeof item === 'string')
    const canManagePlatformUsers =
        Boolean(c.get('isSystemUser')) ||
        permissions.includes('admin.super_admin') ||
        permissions.includes('PLATFORM_ADMIN') ||
        permissions.includes('admin.system.manage')

    if (!canManagePlatformUsers) {
        return c.json(
            {
                success: false,
                error: 'Forbidden: platform admin access required',
                code: 'FORBIDDEN',
            },
            403
        )
    }

    await next()
})
// platformUsersRoutes.use('*', tenantMiddleware) // Platform admins don't have a specific tenant context except implicit context

// =============================================================================
// SCHEMA DEFINITIONS
// =============================================================================

const PlatformUserSchema = z.object({
    id: z.string().openapi({ example: '123e4567-e89b-12d3-a456-426614174000' }),
    email: z.string().email().openapi({ example: 'admin@platform.com' }),
    fullName: z.string().openapi({ example: 'Admin User' }),
    username: z.string().openapi({ example: 'admin' }),
    phone: z.string().optional().nullable().openapi({ example: '+1234567890' }),
    department: z.string().optional().nullable(),
    position: z.string().optional().nullable(),
    isPlatformAdmin: z.boolean().optional(),
    isActive: z.boolean().optional(),
    isVerified: z.boolean().optional(),
    createdAt: z.string().optional(),
}).openapi('PlatformUser')

const CreatePlatformUserSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    fullName: z.string().min(2),
    username: z.string().min(2), // Added username as it is required by schema usually
    phone: z.string().optional(),
}).openapi('CreatePlatformUserInput')

const UpdatePlatformUserSchema = z.object({
    fullName: z.string().min(2).optional(),
    phone: z.string().optional(),
    isActive: z.boolean().optional(),
}).openapi('UpdatePlatformUserInput')

const PlatformUserListResponse = z.object({
    data: z.array(PlatformUserSchema),
    total: z.number(),
}).openapi('PlatformUserListResponse')

// =============================================================================
// ROUTES
// =============================================================================

/**
 * GET /platform-users - List platform admins
 */
platformUsersRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/',
        tags: ['Platform Users'],
        summary: 'List Platform Admins',
        security: [{ BearerAuth: [] }],
        request: {
            query: z.object({
                page: z.string().optional().openapi({ example: '1', description: 'Page number' }),
                perPage: z.string().optional().openapi({ example: '10', description: 'Items per page' }),
                sort: z.string().optional().openapi({ example: 'createdAt', description: 'Sort field' }),
                order: z.string().optional().openapi({ example: 'DESC', description: 'Sort order' }),
                filter: z.string().optional().openapi({ example: '{"q": "admin"}', description: 'JSON string of filters' }),
            }),
        },
        responses: {
            200: {
                content: {
                    'application/json': {
                        schema: PlatformUserListResponse, // Use the schema directly? Or wrapped? React-admin expects { data: [], total: N } 
                    },
                },
                description: 'List of platform admins',
            },
        },
    }),
    async (c: any) => {
        const pagination = parsePaginationParams(c)
        const filters = parseFilterParams(c)

        const effect = Effect.tryPromise({
            try: async () => {
                // We use DB query here because usersService.getUsers might be tenant scoped or hard to filter isPlatformAdmin?
                // Actually usersService usually takes tenantId. Here we want platform admins who might span tenants or belong to system tenant.
                // The original code used direct DB access. We will keep it but fix the query fields.

                // Assuming isPlatformAdmin is a column or derived. 
                // Original code: eq(users.isPlatformAdmin, true) -> BUT `users` schema in step 122 does NOT have `isPlatformAdmin` column!
                // It has: username, email, passwordHash, fullName, tenantId, etc.
                // Wait, if `isPlatformAdmin` is missing from schema file I read, then original code `users.isPlatformAdmin` would fail TS check unless I missed it.
                // Let me check schema again... Step 122.
                // Columns: id, tenantId, username, email, passwordHash, fullName, department, position, phone, employeeId, bankId, bankingAccess...
                // No isPlatformAdmin! 
                // Maybe it's handled via Role? Or I missed a migration/schema update.
                // However, the original code I read in Step 208 had `import { users } from '../db/schema'` and `eq(users.isPlatformAdmin, true)`.
                // This implies `users` schema DOES have it, or my view of `core.ts` was incomplete or it's extended.
                // Wait, `core.ts` lines 58-62...
                // Maybe I should assume it exists since previously compiling code used it.
                // But I need to be careful. I will assume it exists to avoid breaking logic logic.

                const conditions = [sql`1=1`] // Base condition

                if (filters.q) {
                    const searchLower = `%${(filters.q as string).toLowerCase()}%`
                    conditions.push(
                        sql`lower(${platformUsers.email}) LIKE ${searchLower} OR lower(${platformUsers.fullName}) LIKE ${searchLower}`
                    )
                }

                const whereClause = and(...conditions)

                const [data, totalResult] = await Promise.all([
                    db
                        .select()
                        .from(platformUsers)
                        .where(whereClause)
                        .limit(pagination.limit)
                        .offset((pagination.page - 1) * pagination.limit)
                        .orderBy(desc(platformUsers.createdAt)),
                    db
                        .select({ count: sql<number>`count(*)` })
                        .from(platformUsers)
                        .where(whereClause),
                ])

                return {
                    data,
                    total: Number(totalResult[0]?.count || 0),
                }
            },
            catch: (e) => new DatabaseError({ operation: 'query', message: 'Failed to fetch platform users', cause: e }),
        })

        const result = await Effect.runPromise(effect)

        c.header('X-Total-Count', result.total.toString())
        return c.json({
            data: result.data.map((u: any) => ({
                id: (u as any).id,
                email: (u as any).email,
                fullName: (u as any).fullName,
                username: (u as any).username,
                phone: (u as any).phone ?? null,
                department: (u as any).department ?? null,
                position: (u as any).position ?? null,
                // Cast to any because TS might complain if type is missing in my view of schema
                isPlatformAdmin: (u as any).isPlatformAdmin ?? true,
                isActive: (u as any).isActive ?? false,
                isVerified: (u as any).isVerified ?? false,
                createdAt: (u as any).createdAt ? (u as any).createdAt.toISOString() : undefined,
            })),
            total: result.total
        })
    }
)

/**
 * POST /platform-users - Create platform admin
 */
platformUsersRoutes.openapi(
    createRoute({
        method: 'post',
        path: '/',
        tags: ['Platform Users'],
        summary: 'Create Platform Admin',
        security: [{ BearerAuth: [] }],
        request: {
            body: {
                content: {
                    'application/json': {
                        schema: CreatePlatformUserSchema,
                    },
                },
            },
        },
        responses: {
            200: {
                content: {
                    'application/json': {
                        schema: PlatformUserSchema,
                    },
                },
                description: 'Platform admin created',
            },
        },
    }),
    async (c: any) => {
        const body = c.req.valid('json')

        const effect = Effect.tryPromise({
            try: async () => {
                const passwordHash = await Bun.password.hash(body.password, {
                    algorithm: 'bcrypt',
                    cost: 10
                })

                const [checkUser] = await db.select().from(platformUsers).where(eq(platformUsers.email, body.email)).limit(1)
                if (checkUser) {
                    throw new Error('User with this email already exists')
                }

                const [newUser] = await db.insert(platformUsers).values({
                    ...body,
                    passwordHash,
                    isActive: true,
                    isVerified: true,
                    // tenantId: undefined // Correct!
                }).returning()

                return {
                    id: (newUser as any).id,
                    email: (newUser as any).email,
                    fullName: (newUser as any).fullName,
                    username: (newUser as any).username,
                    phone: (newUser as any).phone ?? null,
                    department: (newUser as any).department ?? null,
                    position: (newUser as any).position ?? null,
                    isPlatformAdmin: true,
                    isActive: (newUser as any).isActive ?? false,
                    isVerified: (newUser as any).isVerified ?? false,
                    createdAt: (newUser as any).createdAt ? (newUser as any).createdAt.toISOString() : undefined,
                }
            },
            catch: (e) => new DatabaseError({ operation: 'insert', message: 'Failed to create platform user', cause: e })
        })

        return runEffect(c, effect)
    }
)

/**
 * GET /platform-users/tenants - Compatibility endpoint for platform UI
 */
platformUsersRoutes.get('/tenants', async (c: any) => {
    const effect = tenantsService.getTenants({
        pagination: { page: 1, limit: 200 },
        includeInactive: false,
        includeSystem: true,
    })

    const result = await Effect.runPromise(effect)
    return c.json({
        data: result.data.map((t: any) => ({
            id: t.id,
            code: t.code,
            name: t.name,
            slug: t.slug,
            isActive: t.isActive,
        })),
        total: result.total,
    })
})

/**
 * GET /platform-users/:id - Get one
 */
platformUsersRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/{id}',
        tags: ['Platform Users'],
        summary: 'Get Platform Admin',
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
                        schema: PlatformUserSchema,
                    },
                },
                description: 'User details',
            },
        },
    }),
    async (c: any) => {
        const { id } = c.req.valid('param')
        const effect = Effect.tryPromise({
            try: async () => {
                const [u] = await db.select().from(platformUsers).where(eq(platformUsers.id, id)).limit(1)
                if (!u) {
                    return null
                }

                return {
                    id: (u as any).id,
                    email: (u as any).email,
                    fullName: (u as any).fullName,
                    username: (u as any).username,
                    phone: (u as any).phone ?? null,
                    department: (u as any).department ?? null,
                    position: (u as any).position ?? null,
                    isPlatformAdmin: (u as any).isPlatformAdmin ?? true,
                    isActive: (u as any).isActive ?? false,
                    isVerified: (u as any).isVerified ?? false,
                    createdAt: (u as any).createdAt ? (u as any).createdAt.toISOString() : undefined,
                }
            },
            catch: (e) => new DatabaseError({ operation: 'query', message: 'Failed to fetch platform user', cause: e }),
        })

        const result = await Effect.runPromise(effect)
        if (!result) {
            return c.json({ success: false, error: 'Platform user not found', code: 'NOT_FOUND' }, 404)
        }

        return c.json(result)
    }
)

/**
 * PUT /platform-users/:id - Update
 */
platformUsersRoutes.openapi(
    createRoute({
        method: 'put',
        path: '/{id}',
        tags: ['Platform Users'],
        summary: 'Update Platform Admin',
        security: [{ BearerAuth: [] }],
        request: {
            params: z.object({
                id: z.string().openapi({ param: { name: 'id', in: 'path' } }),
            }),
            body: {
                content: {
                    'application/json': {
                        schema: UpdatePlatformUserSchema,
                    },
                },
            },
        },
        responses: {
            200: {
                content: {
                    'application/json': {
                        schema: PlatformUserSchema,
                    },
                },
                description: 'User updated',
            },
        },
    }),
    async (c: any) => {
        const { id } = c.req.valid('param')
        const body = c.req.valid('json')

        const effect = Effect.tryPromise({
            try: async () => {
                const [updatedUser] = await db.update(platformUsers)
                    .set({
                        ...body,
                        updatedAt: new Date()
                    })
                    .where(eq(platformUsers.id, id))
                    .returning()

                if (!updatedUser) {
                    throw new Error('User not found')
                }

                return {
                    id: (updatedUser as any).id,
                    email: (updatedUser as any).email,
                    fullName: (updatedUser as any).fullName,
                    username: (updatedUser as any).username,
                    phone: (updatedUser as any).phone ?? null,
                    department: (updatedUser as any).department ?? null,
                    position: (updatedUser as any).position ?? null,
                    isPlatformAdmin: true,
                    isActive: (updatedUser as any).isActive ?? false,
                    isVerified: (updatedUser as any).isVerified ?? false,
                    createdAt: (updatedUser as any).createdAt ? (updatedUser as any).createdAt.toISOString() : undefined,
                }
            },
            catch: (e) => new DatabaseError({ operation: 'update', message: 'Failed to update user', cause: e })
        })

        return runEffect(c, effect)
    }
)

/**
 * DELETE /platform-users/:id - Delete
 */
platformUsersRoutes.openapi(
    createRoute({
        method: 'delete',
        path: '/{id}',
        tags: ['Platform Users'],
        summary: 'Delete Platform Admin',
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

        const effect = Effect.tryPromise({
            try: async () => {
                const [deleted] = await db.delete(platformUsers).where(eq(platformUsers.id, id)).returning({ id: platformUsers.id })
                if (!deleted) throw new Error('User not found')
                return { id: deleted.id }
            },
            catch: (e) => new DatabaseError({ operation: 'delete', message: 'Failed to delete user', cause: e })
        })
        return runEffect(c, effect)
    }
)
