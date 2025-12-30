import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { Effect, pipe } from 'effect'
import type { AppContext } from '../app'
import { authMiddleware, tenantMiddleware, requirePermission } from '../middleware'
import { runEffect } from '../lib/effect'
import { sendListResponse, sendSingleResponse, parsePaginationParams, parseFilterParams } from '../lib/react-admin'
import * as usersService from '../services/users.service'

export const usersRoutes = new Hono<AppContext>()

// Apply auth and tenant middleware
usersRoutes.use('*', authMiddleware)
usersRoutes.use('*', tenantMiddleware)

// =============================================================================
// SCHEMA DEFINITIONS
// =============================================================================

const createUserSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    firstName: z.string().min(2).optional(),
    lastName: z.string().min(2).optional(),
    phone: z.string().optional(),
    department: z.string().optional(),
    position: z.string().optional(),
})

const updateUserSchema = z.object({
    firstName: z.string().min(2).optional(),
    lastName: z.string().min(2).optional(),
    phone: z.string().optional(),
    department: z.string().optional(),
    position: z.string().optional(),
    isActive: z.boolean().optional(),
})

// =============================================================================
// ROUTES
// =============================================================================

/**
 * GET /users - List users (react-admin compatible)
 */
usersRoutes.get('/', async (c) => {
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
        Effect.map((result) => result)
    )

    const result = await Effect.runPromise(effect)
    return sendListResponse(c, result.data, result.total, pagination)
})

/**
 * POST /users - Create user
 */
usersRoutes.post('/', zValidator('json', createUserSchema), async (c) => {
    const tenantId = c.get('tenantId')!
    const body = c.req.valid('json')

    const effect = pipe(
        usersService.createUser({
            ...body,
            tenantId,
        }),
        Effect.map((user) => ({
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
        }))
    )

    return runEffect(c, effect)
})

/**
 * GET /users/stats - User statistics
 */
usersRoutes.get('/stats', async (c) => {
    const tenantId = c.get('tenantId')!

    const effect = usersService.getUserStats(tenantId)

    return runEffect(c, effect)
})

/**
 * GET /users/profile - Current user profile
 */
usersRoutes.get('/profile', async (c) => {
    const userId = c.get('userId')!

    const effect = pipe(
        usersService.getUserById(userId),
        Effect.map((user) => ({
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone,
            department: user.department,
            position: user.position,
            tenantId: user.tenantId,
            isEmailVerified: user.isEmailVerified,
            lastLoginAt: user.lastLoginAt,
        }))
    )

    return runEffect(c, effect)
})

/**
 * GET /users/:id - Get user by ID
 */
usersRoutes.get('/:id', async (c) => {
    const { id } = c.req.param()

    const effect = usersService.getUserById(id)

    return runEffect(c, effect)
})

/**
 * PUT /users/:id - Update user
 */
usersRoutes.put('/:id', zValidator('json', updateUserSchema), async (c) => {
    const { id } = c.req.param()
    const body = c.req.valid('json')

    const effect = usersService.updateUser(id, body)

    return runEffect(c, effect)
})

/**
 * DELETE /users/:id - Delete user (soft delete)
 */
usersRoutes.delete('/:id', async (c) => {
    const { id } = c.req.param()

    const effect = usersService.deleteUser(id)

    return runEffect(c, effect)
})

/**
 * POST /users/:id/enable - Enable user
 */
usersRoutes.post('/:id/enable', async (c) => {
    const { id } = c.req.param()

    const effect = pipe(
        usersService.enableUser(id),
        Effect.map(() => ({ success: true, message: 'User enabled' }))
    )

    return runEffect(c, effect)
})

/**
 * POST /users/:id/disable - Disable user
 */
usersRoutes.post('/:id/disable', async (c) => {
    const { id } = c.req.param()

    const effect = pipe(
        usersService.disableUser(id),
        Effect.map(() => ({ success: true, message: 'User disabled' }))
    )

    return runEffect(c, effect)
})
