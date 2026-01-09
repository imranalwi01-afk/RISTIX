import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { Effect, pipe } from 'effect'
import { eq, and, desc, sql } from 'drizzle-orm'
import { db } from '../config/database'
import { users } from '../db/schema'
import type { AppContext } from '../app'
import { authMiddleware, tenantMiddleware } from '../middleware'
import { runEffect } from '../lib/effect'
import { sendListResponse, parsePaginationParams, parseFilterParams } from '../lib/react-admin'
import {
    DatabaseError,
    NotFoundError,
    ValidationError,
    AuthenticationError
} from '../lib/errors'
import * as usersService from '../services/users.service'

export const platformUsersRoutes = new Hono<AppContext>()

platformUsersRoutes.use('*', authMiddleware)
platformUsersRoutes.use('*', tenantMiddleware)

// =============================================================================
// PLATFORM USERS (Admins) ROUTES
// Reuses users table but filters for isPlatformAdmin = true
// =============================================================================

/**
 * GET /platform-users - List platform admins
 */
platformUsersRoutes.get('/', async (c) => {
    const pagination = parsePaginationParams(c)
    const filters = parseFilterParams(c)

    const effect = Effect.tryPromise({
        try: async () => {
            const conditions = [eq(users.isPlatformAdmin, true)]

            if (filters.q) {
                const searchLower = `%${(filters.q as string).toLowerCase()}%`
                conditions.push(
                    sql`lower(${users.email}) LIKE ${searchLower} OR lower(${users.firstName}) LIKE ${searchLower}`
                )
            }

            const whereClause = and(...conditions)

            const [data, totalResult] = await Promise.all([
                db
                    .select()
                    .from(users)
                    .where(whereClause)
                    .limit(pagination.limit)
                    .offset((pagination.page - 1) * pagination.limit)
                    .orderBy(desc(users.createdAt)),
                db
                    .select({ count: sql<number>`count(*)` })
                    .from(users)
                    .where(whereClause),
            ])

            return {
                data,
                total: Number(totalResult[0]?.count || 0),
            }
        },
        catch: (e) => new DatabaseError({ message: 'Failed to fetch platform users', cause: e }),
    })

    const result = await Effect.runPromise(effect)
    return sendListResponse(c, result.data, result.total, pagination)
})

/**
 * POST /platform-users - Create platform admin
 */
const createPlatformUserSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    firstName: z.string().min(2),
    lastName: z.string().optional(),
    phone: z.string().optional(),
})

platformUsersRoutes.post('/', zValidator('json', createPlatformUserSchema), async (c) => {
    const tenantId = c.get('tenantId')! // Should be system tenant
    const body = c.req.valid('json')

    // Force isPlatformAdmin = true
    const effect = usersService.createUser({
        ...body,
        tenantId,
        isPlatformAdmin: true,
        username: body.email.split('@')[0], // Simple username gen
    })

    return runEffect(c, effect)
})

/**
 * GET /platform-users/:id - Get one
 */
platformUsersRoutes.get('/:id', async (c) => {
    const { id } = c.req.param()
    const effect = usersService.getUserById(id)
    return runEffect(c, effect)
})

/**
 * PUT /platform-users/:id - Update
 */
const updatePlatformUserSchema = z.object({
    firstName: z.string().min(2).optional(),
    lastName: z.string().optional(),
    phone: z.string().optional(),
    isActive: z.boolean().optional(),
})

platformUsersRoutes.put('/:id', zValidator('json', updatePlatformUserSchema), async (c) => {
    const { id } = c.req.param()
    const body = c.req.valid('json')
    const effect = usersService.updateUser(id, body)
    return runEffect(c, effect)
})

/**
 * DELETE /platform-users/:id - Delete
 */
platformUsersRoutes.delete('/:id', async (c) => {
    const { id } = c.req.param()
    const effect = usersService.deleteUser(id)
    return runEffect(c, effect)
})
