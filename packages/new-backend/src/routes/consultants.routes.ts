import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { Effect, pipe } from 'effect'
import type { AppContext } from '../app'
import { authMiddleware, tenantMiddleware } from '../middleware'
import { runEffect } from '../lib/effect'
import { sendListResponse, parsePaginationParams, parseFilterParams } from '../lib/react-admin'
import * as consultantsService from '../services/consultants.service'
import { DatabaseError, NotFoundError } from '@lib/errors'

export const consultantsRoutes = new OpenAPIHono<AppContext>()

// Apply auth middleware
consultantsRoutes.use('*', authMiddleware)
consultantsRoutes.use('*', tenantMiddleware)

// =============================================================================
// SCHEMAS
// =============================================================================

const ConsultantSchema = z.object({
    id: z.string().uuid(),
    fullName: z.string(),
    email: z.string().email(),
    firmName: z.string().optional().nullable(),
    specialization: z.string().optional().nullable(),
    status: z.enum(['active', 'inactive', 'on_hold']),
    isActive: z.boolean(),
    startDate: z.string().optional().nullable(),
    endDate: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
    createdAt: z.date().or(z.string()),
    updatedAt: z.date().or(z.string()),
}).openapi('Consultant')

const CreateConsultantSchema = z.object({
    fullName: z.string().min(2),
    email: z.string().email(),
    firmName: z.string().optional(),
    specialization: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    status: z.enum(['active', 'inactive', 'on_hold']).default('active'),
    isActive: z.boolean().default(true),
    notes: z.string().optional(),
}).openapi('CreateConsultantInput')

const UpdateConsultantSchema = CreateConsultantSchema.partial().openapi('UpdateConsultantInput')

const ListResponseSchema = z.object({
    data: z.array(ConsultantSchema),
    total: z.number(),
    page: z.number().optional(),
    limit: z.number().optional()
}).openapi('ConsultantListResponse')

const ErrorSchema = z.object({
    success: z.boolean(),
    error: z.string(),
    code: z.string().optional()
}).openapi('ErrorResponse')

// =============================================================================
// ROUTES
// =============================================================================

/**
 * GET /consultants - List consultants
 */
consultantsRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/',
        tags: ['Consultants'],
        summary: 'List Consultants',
        request: {
            query: z.object({
                page: z.string().optional(),
                limit: z.string().optional(),
                q: z.string().optional(),
                status: z.string().optional(),
            })
        },
        responses: {
            200: {
                content: {
                    'application/json': {
                        schema: ListResponseSchema,
                    },
                },
                description: 'List of consultants',
            },
        },
    }),
    async (c) => {
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
    }
)

/**
 * GET /consultants/:id - Get one
 */
consultantsRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/{id}',
        tags: ['Consultants'],
        summary: 'Get Consultant by ID',
        request: {
            params: z.object({
                id: z.string().uuid(),
            }),
        },
        responses: {
            200: {
                content: {
                    'application/json': {
                        schema: z.object({ success: z.boolean(), data: ConsultantSchema }),
                    },
                },
                description: 'Consultant details',
            },
            404: {
                content: { 'application/json': { schema: ErrorSchema } },
                description: 'Consultant not found',
            },
        },
    }),
    async (c) => {
        const { id } = c.req.valid('param')
        const effect = consultantsService.getConsultantById(id)
        return runEffect(c, effect)
    }
)

/**
 * POST /consultants - Create
 */
consultantsRoutes.openapi(
    createRoute({
        method: 'post',
        path: '/',
        tags: ['Consultants'],
        summary: 'Create Consultant',
        request: {
            body: {
                content: {
                    'application/json': {
                        schema: CreateConsultantSchema,
                    },
                },
            },
        },
        responses: {
            200: {
                content: {
                    'application/json': {
                        schema: z.object({ success: z.boolean(), data: ConsultantSchema }),
                    },
                },
                description: 'Consultant created',
            },
        },
    }),
    async (c) => {
        const body = c.req.valid('json')

        // Convert date strings to Date objects if present
        const data = {
            ...body,
            startDate: body.startDate ? body.startDate : undefined,
            endDate: body.endDate ? body.endDate : undefined,
        }

        const effect = consultantsService.createConsultant(data as any)
        return runEffect(c, effect)
    }
)

/**
 * PUT /consultants/:id - Update
 */
consultantsRoutes.openapi(
    createRoute({
        method: 'put',
        path: '/{id}',
        tags: ['Consultants'],
        summary: 'Update Consultant',
        request: {
            params: z.object({
                id: z.string().uuid(),
            }),
            body: {
                content: {
                    'application/json': {
                        schema: UpdateConsultantSchema,
                    },
                },
            },
        },
        responses: {
            200: {
                content: {
                    'application/json': {
                        schema: z.object({ success: z.boolean(), data: ConsultantSchema }),
                    },
                },
                description: 'Consultant updated',
            },
        },
    }),
    async (c) => {
        const { id } = c.req.valid('param')
        const body = c.req.valid('json')

        const effect = consultantsService.updateConsultant(id, body as any)
        return runEffect(c, effect)
    }
)

/**
 * DELETE /consultants/:id - Delete
 */
consultantsRoutes.openapi(
    createRoute({
        method: 'delete',
        path: '/{id}',
        tags: ['Consultants'],
        summary: 'Delete Consultant',
        request: {
            params: z.object({
                id: z.string().uuid(),
            }),
        },
        responses: {
            200: {
                content: {
                    'application/json': {
                        schema: z.object({ success: z.boolean(), data: ConsultantSchema }),
                    },
                },
                description: 'Consultant deleted',
            },
        },
    }),
    async (c) => {
        const { id } = c.req.valid('param')
        const effect = consultantsService.deleteConsultant(id)
        return runEffect(c, effect)
    }
)

