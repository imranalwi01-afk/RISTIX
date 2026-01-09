import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { Effect, pipe } from 'effect'
import type { AppContext } from '../app'
import { authMiddleware, tenantMiddleware } from '../middleware'
import { runEffect } from '../lib/effect'
import { sendListResponse, parsePaginationParams, parseFilterParams } from '../lib/react-admin'
import * as consultantsService from '../services/consultants.service'

export const consultantsRoutes = new Hono<AppContext>()

// Apply auth middleware (tenant middleware might not be needed if this is global, but let's keep for consistency or if we want to restrict to 'system' tenant)
consultantsRoutes.use('*', authMiddleware)
consultantsRoutes.use('*', tenantMiddleware)

// =============================================================================
// SCHEMA DEFINITIONS
// =============================================================================

const createConsultantSchema = z.object({
    fullName: z.string().min(2),
    email: z.string().email(),
    firmName: z.string().optional(),
    specialization: z.string().optional(),
    startDate: z.string().optional(), // Date string from frontend
    endDate: z.string().optional(),
    status: z.enum(['active', 'inactive', 'on_hold']).default('active'),
    isActive: z.boolean().default(true),
    notes: z.string().optional(),
})

const updateConsultantSchema = createConsultantSchema.partial()

// =============================================================================
// ROUTES
// =============================================================================

/**
 * GET /consultants - List consultants
 */
consultantsRoutes.get('/', async (c) => {
    const pagination = parsePaginationParams(c)
    const filters = parseFilterParams(c)

    const effect = pipe(
        consultantsService.getConsultants({
            limit: pagination.limit,
            offset: (pagination.page - 1) * pagination.limit,
            search: filters.q as string | undefined,
            status: filters.status as string | undefined,
        }),
        Effect.map((result) => result)
    )

    const result = await Effect.runPromise(effect)
    return sendListResponse(c, result.data, result.total, pagination)
})

/**
 * GET /consultants/:id - Get one
 */
consultantsRoutes.get('/:id', async (c) => {
    const { id } = c.req.param()
    const effect = consultantsService.getConsultantById(id)
    return runEffect(c, effect)
})

/**
 * POST /consultants - Create
 */
consultantsRoutes.post('/', zValidator('json', createConsultantSchema), async (c) => {
    const body = c.req.valid('json')

    // Convert date strings to Date objects if present
    const data = {
        ...body,
        startDate: body.startDate ? body.startDate : undefined, // drizzle handles string dates usually but safer to check
        endDate: body.endDate ? body.endDate : undefined,
    }

    const effect = consultantsService.createConsultant(data as any)
    return runEffect(c, effect)
})

/**
 * PUT /consultants/:id - Update
 */
consultantsRoutes.put('/:id', zValidator('json', updateConsultantSchema), async (c) => {
    const { id } = c.req.param()
    const body = c.req.valid('json')

    const effect = consultantsService.updateConsultant(id, body as any)
    return runEffect(c, effect)
})

/**
 * DELETE /consultants/:id - Delete
 */
consultantsRoutes.delete('/:id', async (c) => {
    const { id } = c.req.param()
    const effect = consultantsService.deleteConsultant(id)
    return runEffect(c, effect)
})
