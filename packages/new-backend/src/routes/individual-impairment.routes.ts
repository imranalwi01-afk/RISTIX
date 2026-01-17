import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import type { AppContext } from '../app'
import { authMiddleware } from '../middleware'
import { Effect } from 'effect'
import { IndividualImpairmentService } from '../services/individual-impairment.service'

export const individualImpairmentRoutes = new OpenAPIHono<AppContext>()

individualImpairmentRoutes.use('*', authMiddleware)

// ============================================================================
// SCHEMAS
// ============================================================================

const WatchlistItemSchema = z.object({
    id: z.string(),
    customerName: z.string().optional(),
    accountNumber: z.string().optional(),
    stage: z.number().int().optional(),
    impairedFlag: z.string().optional(),
    assessmentStatus: z.string().optional(),
    // Add more real fields based on Service return
}).openapi('WatchlistItem')

const WatchlistListResponse = z.object({
    success: z.boolean(),
    data: z.array(WatchlistItemSchema),
    meta: z.object({
        page: z.number(),
        limit: z.number(),
        total: z.number(),
        totalPages: z.number(),
    }).optional()
}).openapi('WatchlistListResponse')

const AddWatchlistSchema = z.object({
    customerId: z.string(),
    reason: z.string().optional(),
}).openapi('AddWatchlistInput')

const OverrideSchema = z.object({
    id: z.number(),
    customerId: z.string(),
    originalStage: z.number().int(),
    proposedStage: z.number().int(),
    status: z.string(),
    createdAt: z.string(),
}).openapi('OverrideItem')

const OverrideListResponse = z.object({
    success: z.boolean(),
    data: z.array(OverrideSchema)
}).openapi('OverrideListResponse')

const AddOverrideSchema = z.object({
    customerId: z.string(),
    originalStage: z.number().int(),
    proposedStage: z.number().int(),
    justification: z.string(),
}).openapi('AddOverrideInput')

const ErrorResponse = z.object({
    success: z.boolean(),
    message: z.string(),
    error: z.string().optional()
}).openapi('ErrorResponse')

// ============================================================================
// ROUTES
// ============================================================================

// GET /watchlist - Real implementation
individualImpairmentRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/watchlist',
        tags: ['Individual Impairment'],
        summary: 'Get Watchlist',
        request: {
            query: z.object({
                page: z.string().optional(),
                limit: z.string().optional(),
                search: z.string().optional(),
                'filter[stage]': z.string().optional(),
                'filter[impaired_flag]': z.string().optional(),
                'filter[assessment_status]': z.string().optional(),
                'sort[field]': z.string().optional(),
                'sort[order]': z.string().optional(),
            } as any)
        },
        responses: {
            200: { content: { 'application/json': { schema: WatchlistListResponse } }, description: 'Watchlist' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c) => {
        try {
            const query = c.req.query()
            const page = Number(query['page'] || '1')
            const limit = Number(query['limit'] || '20')
            const search = query['search']

            const filter = {
                stage: query['filter[stage]'] ? Number(query['filter[stage]']) : undefined,
                impaired_flag: query['filter[impaired_flag]'] as 'I' | 'N' | undefined,
                assessment_status: query['filter[assessment_status]']
            }

            const sort = {
                field: query['sort[field]'],
                order: query['sort[order]'] as 'asc' | 'desc' | undefined
            }

            const program = IndividualImpairmentService.getWatchlist({
                page,
                limit,
                search,
                filter,
                sort
            } as any)

            const result = await Effect.runPromiseExit(program)

            if (result._tag === 'Success') {
                return c.json(result.value as any)
            } else {
                console.error('Error fetching watchlist:', result.cause)
                return c.json({
                    success: false,
                    message: 'Failed to fetch watchlist',
                    error: String(result.cause)
                } as any, 500)
            }
        } catch (error) {
            console.error('Error fetching watchlist:', error)
            return c.json({ success: false, message: 'Failed to fetch watchlist', error: String(error) }, 500)
        }
    }
)

// POST /watchlist - Stub endpoint
individualImpairmentRoutes.openapi(
    createRoute({
        method: 'post',
        path: '/watchlist',
        tags: ['Individual Impairment'],
        summary: 'Add to Watchlist',
        request: {
            body: { content: { 'application/json': { schema: AddWatchlistSchema } } }
        },
        responses: {
            200: { content: { 'application/json': { schema: z.object({ success: z.boolean(), message: z.string(), data: z.any() }) } }, description: 'Added' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c) => {
        try {
            const body = await c.req.json()
            return c.json({
                success: true,
                data: { id: Date.now(), ...body },
                message: 'Added to watchlist'
            } as any)
        } catch (error) {
            return c.json({ success: false, message: 'Failed to add to watchlist' }, 500)
        }
    }
)

// DELETE /watchlist/:id - Stub endpoint
individualImpairmentRoutes.openapi(
    createRoute({
        method: 'delete',
        path: '/watchlist/{id}',
        tags: ['Individual Impairment'],
        summary: 'Remove from Watchlist',
        request: {
            params: z.object({ id: z.string() })
        },
        responses: {
            200: { content: { 'application/json': { schema: z.object({ success: z.boolean(), message: z.string() }) } }, description: 'Removed' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c) => {
        try {
            return c.json({ success: true, message: 'Removed from watchlist' })
        } catch (error) {
            return c.json({ success: false, message: 'Failed to remove from watchlist' }, 500)
        }
    }
)

// GET /overrides - Stub endpoint
individualImpairmentRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/overrides',
        tags: ['Individual Impairment'],
        summary: 'Get Overrides',
        responses: {
            200: { content: { 'application/json': { schema: OverrideListResponse } }, description: 'Overrides' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c) => {
        try {
            return c.json({ success: true, data: [] })
        } catch (error) {
            return c.json({ success: false, message: 'Failed to fetch overrides' }, 500)
        }
    }
)

// POST /overrides - Stub endpoint
individualImpairmentRoutes.openapi(
    createRoute({
        method: 'post',
        path: '/overrides',
        tags: ['Individual Impairment'],
        summary: 'Create Override',
        request: {
            body: { content: { 'application/json': { schema: AddOverrideSchema } } }
        },
        responses: {
            200: { content: { 'application/json': { schema: z.object({ success: z.boolean(), message: z.string(), data: OverrideSchema }) } }, description: 'Created' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c) => {
        try {
            const body = await c.req.json()
            return c.json({
                success: true,
                data: { id: Date.now(), ...body, status: 'PENDING', createdAt: new Date().toISOString() },
                message: 'Override request created'
            } as any)
        } catch (error) {
            return c.json({ success: false, message: 'Failed to create override' }, 500)
        }
    }
)
