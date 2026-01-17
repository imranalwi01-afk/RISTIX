import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import type { AppContext } from '../app'
import { authMiddleware } from '../middleware'
import { LgdConfigurationsService } from '../services/lgd-configurations.service'
import { runEffect } from '../lib/effect/runtime'

const app = new OpenAPIHono<AppContext>()

app.use('*', authMiddleware)

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const LgdConfigSchema = z.object({
    id: z.number(),
    model_name: z.string().nullable(),
    segment_id: z.number().nullable(),
    lgd_method: z.union([z.string(), z.number()]).nullable(),
    population_type: z.string().nullable(),
    observation_period: z.string().nullable(),
    observation_start_date: z.string().nullable(),
    workout_period: z.number().nullable(),
    fl_flag: z.boolean().nullable(),
    fl_scalar_id: z.number().nullable(),
    lgd_rate: z.union([z.string(), z.number()]).nullable(),
    is_active: z.boolean().nullable(),
    created_by: z.string().nullable(),
    updated_by: z.string().nullable(),
    created_date: z.string().nullable(),
    updated_date: z.string().nullable(),
}).openapi('LgdConfig')

const CreateLgdConfigSchema = z.object({
    modelName: z.string().min(1).max(255),
    segmentId: z.number().int().optional(),
    lgdMethod: z.number().int(),
    populationType: z.string().optional(),
    observationPeriod: z.string().optional(),
    workoutPeriod: z.number().int().optional(),
    flFlag: z.boolean().default(false),
    flScalarId: z.number().int().optional(),
    lgdRate: z.number().optional(),
    isActive: z.boolean().default(true),
}).openapi('CreateLgdConfigInput')

const UpdateLgdConfigSchema = CreateLgdConfigSchema.partial().openapi('UpdateLgdConfigInput')

const LgdListResponse = z.object({
    success: z.boolean(),
    data: z.array(LgdConfigSchema)
}).openapi('LgdListResponse')

const LgdResponse = z.object({
    success: z.boolean(),
    data: LgdConfigSchema,
    message: z.string().optional()
}).openapi('LgdResponse')

const ErrorResponse = z.object({
    success: z.boolean(),
    message: z.string().optional(),
    error: z.string().optional()
}).openapi('ErrorResponse')

// ============================================================================
// ENDPOINTS
// ============================================================================

// GET /api/v1/banking/parameters/lgd-configurations
app.openapi(
    createRoute({
        method: 'get',
        path: '/',
        tags: ['LGD Configurations'],
        summary: 'List LGD Configurations',
        request: {
            query: z.object({
                search: z.string().optional(),
                lgd_method: z.string().optional(),
                is_active: z.string().optional(),
            })
        },
        responses: {
            200: { content: { 'application/json': { schema: LgdListResponse } }, description: 'List LGD' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c) => {
        const query = c.req.valid('query')
        return runEffect(c, LgdConfigurationsService.list(query)) as any
    }
)

// GET /api/v1/banking/parameters/lgd-configurations/:id
app.openapi(
    createRoute({
        method: 'get',
        path: '/{id}',
        tags: ['LGD Configurations'],
        summary: 'Get LGD Configuration',
        request: {
            params: z.object({ id: z.string().transform(Number) })
        },
        responses: {
            200: { content: { 'application/json': { schema: LgdResponse } }, description: 'Detail' },
            400: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Invalid ID' },
            404: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Not Found' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c) => {
        const id = c.req.valid('param').id
        if (isNaN(id)) return c.json({ success: false, message: 'Invalid ID' }, 400)

        return runEffect(c, LgdConfigurationsService.get(id)) as any
    }
)

// POST /api/v1/banking/parameters/lgd-configurations
app.openapi(
    createRoute({
        method: 'post',
        path: '/',
        tags: ['LGD Configurations'],
        summary: 'Create LGD Configuration',
        request: {
            body: { content: { 'application/json': { schema: CreateLgdConfigSchema } } }
        },
        responses: {
            200: { content: { 'application/json': { schema: LgdResponse } }, description: 'Created' }, // Note 201->200 if runEffect defaults to 200, check runEffect
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c) => {
        const data = c.req.valid('json')
        const userId = c.get('userId') as string || 'system'

        return runEffect(c, LgdConfigurationsService.create(data, userId)) as any
    }
)

// PUT /api/v1/banking/parameters/lgd-configurations/:id
app.openapi(
    createRoute({
        method: 'put',
        path: '/{id}',
        tags: ['LGD Configurations'],
        summary: 'Update LGD Configuration',
        request: {
            params: z.object({ id: z.string().transform(Number) }),
            body: { content: { 'application/json': { schema: UpdateLgdConfigSchema } } }
        },
        responses: {
            200: { content: { 'application/json': { schema: LgdResponse } }, description: 'Updated' },
            400: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Invalid ID' },
            404: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Not found' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c) => {
        const id = c.req.valid('param').id
        if (isNaN(id)) return c.json({ success: false, message: 'Invalid ID' }, 400)

        const data = c.req.valid('json')
        const userId = c.get('userId') as string || 'system'

        return runEffect(c, LgdConfigurationsService.update(id, data, userId)) as any
    }
)

// DELETE /api/v1/banking/parameters/lgd-configurations/:id
app.openapi(
    createRoute({
        method: 'delete',
        path: '/{id}',
        tags: ['LGD Configurations'],
        summary: 'Delete LGD Configuration',
        request: {
            params: z.object({ id: z.string().transform(Number) })
        },
        responses: {
            200: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Deleted' },
            400: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Invalid ID' },
            404: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Not Found' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c) => {
        const id = c.req.valid('param').id
        if (isNaN(id)) return c.json({ success: false, message: 'Invalid ID' }, 400)

        return runEffect(c, LgdConfigurationsService.delete(id)) as any
    }
)

// METADATA
app.openapi(
    createRoute({
        method: 'get',
        path: '/metadata/methods',
        tags: ['LGD Configurations'],
        summary: 'Get Metadata Methods',
        responses: {
            200: {
                content: {
                    'application/json': {
                        schema: z.object({
                            success: z.boolean(),
                            data: z.array(z.object({ value: z.number(), label: z.string() }))
                        })
                    }
                },
                description: 'Metadata'
            }
        }
    }),
    async (c) => {
        return runEffect(c, LgdConfigurationsService.getMethods()) as any
    }
)

app.openapi(
    createRoute({
        method: 'get',
        path: '/metadata/population-types',
        tags: ['LGD Configurations'],
        summary: 'Get Metadata Population Types',
        responses: {
            200: {
                content: {
                    'application/json': {
                        schema: z.object({
                            success: z.boolean(),
                            data: z.array(z.object({ value: z.string(), label: z.string() }))
                        })
                    }
                },
                description: 'Metadata'
            }
        }
    }),
    async (c) => {
        return runEffect(c, LgdConfigurationsService.getPopulationTypes()) as any
    }
)

export const lgdConfigurationsRoutes = app
