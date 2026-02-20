import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import type { AppContext } from '../app'
import { authMiddleware } from '../middleware'
import { PdConfigurationsService } from '../services/pd-configurations.service'
import { runEffect } from '../lib/effect/runtime'
import { interceptCreate, interceptUpdate, interceptDelete } from '../middleware/approval-interceptor.middleware'
import type { ApprovalResponse } from '../lib/approval-helpers'

const app = new OpenAPIHono<AppContext>()

app.use('*', authMiddleware)

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const PdConfigSchema = z.object({
    id: z.number(),
    model_name: z.string().nullable(),
    population_segment_id: z.number().nullable(),
    selected_method: z.number().nullable(),
    migration_interval: z.number().nullable(),
    population_type: z.number().nullable(),
    historical_month: z.number().nullable(),
    first_historical_date: z.string().nullable(),
    multiplication: z.string().nullable(),
    fl_flag: z.boolean().nullable(),
    fl_scalar_id: z.number().nullable(),
    ia_flag: z.boolean().nullable(),
    bucket: z.string().nullable(),
    is_active: z.boolean().nullable(),
    created_by: z.string().nullable(),
    updated_by: z.string().nullable(),
    created_date: z.string().nullable(),
    updated_date: z.string().nullable(),
}).openapi('PdConfig')

const CreatePdConfigSchema = z.object({
    model_name: z.string().min(1).max(250),
    population_segment_id: z.union([z.number(), z.string().transform(val => parseInt(val))]),
    selected_method: z.number().int(),
    migration_interval: z.number().int(),
    population_type: z.number().int(),
    historical_month: z.number().int(),
    first_historical_date: z.string().optional(),
    multiplication: z.number().int().optional(),
    fl_flag: z.boolean().default(false),
    ia_flag: z.boolean().default(false),
    bucket: z.string().max(30).optional(),
    is_active: z.boolean().default(true)
}).openapi('CreatePdConfigInput')

const UpdatePdConfigSchema = CreatePdConfigSchema.partial().openapi('UpdatePdConfigInput')

const PdListResponse = z.object({
    success: z.boolean(),
    data: z.array(PdConfigSchema)
}).openapi('PdListResponse')

const PdResponse = z.object({
    success: z.boolean(),
    data: PdConfigSchema
}).openapi('PdResponse')

const MetadataResponse = z.object({
    success: z.boolean(),
    data: z.array(z.object({ value: z.number(), label: z.string() }))
}).openapi('MetadataResponse')

const ErrorResponse = z.object({
    success: z.boolean(),
    message: z.string()
}).openapi('ErrorResponse')

const ApprovalWorkflowResponse = z.object({
    success: z.boolean(),
    approvalRequired: z.boolean(),
    requestId: z.string().optional(),
    data: z.any().optional(),
    message: z.string().optional()
}).openapi('ApprovalWorkflowResponse')

// ============================================================================
// ROUTES
// ============================================================================

// ============================================================================
// ROUTES
// ============================================================================

/**
 * List PD Configurations.
 * Retrieve a list of PD configurations with optional filtering.
 * 
 * @route GET /api/v1/banking/parameters/pd-configurations
 */
app.openapi(
    createRoute({
        method: 'get',
        path: '/',
        tags: ['PD Configurations'],
        summary: 'List PD Configurations',
        request: {
            query: z.object({
                search: z.string().optional(),
                selected_method: z.string().optional(),
                bucket: z.string().optional(),
                is_active: z.string().optional(),
            })
        },
        responses: {
            200: { content: { 'application/json': { schema: PdListResponse } }, description: 'List of PD configurations' },
            400: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Bad Request' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Server Error' }
        }
    }),
    async (c) => {
        const query = c.req.valid('query')
        return runEffect(c, PdConfigurationsService.list({
            ...query,
            is_active: query.is_active ? query.is_active === 'true' : undefined
        }) as any) as any
    }
)

/**
 * Get PD Configuration.
 * Retrieve a specific PD configuration by ID.
 * 
 * @route GET /api/v1/banking/parameters/pd-configurations/:id
 */
app.openapi(
    createRoute({
        method: 'get',
        path: '/{id}',
        tags: ['PD Configurations'],
        summary: 'Get PD Configuration',
        request: {
            params: z.object({ id: z.string().transform(Number) })
        },
        responses: {
            200: { content: { 'application/json': { schema: PdResponse } }, description: 'PD Configuration details' },
            400: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Bad Request' },
            404: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Not Found' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c) => {
        const { id } = c.req.valid('param')
        if (isNaN(id)) return c.json({ success: false, message: 'Invalid ID' }, 400)
        return runEffect(c, PdConfigurationsService.get(id) as any) as any
    }
)

/**
 * Create PD Configuration.
 * Create a new PD configuration.
 * 
 * @route POST /api/v1/banking/parameters/pd-configurations
 */
app.openapi(
    createRoute({
        method: 'post',
        path: '/',
        tags: ['PD Configurations'],
        summary: 'Create PD Configuration',
        request: {
            body: { content: { 'application/json': { schema: CreatePdConfigSchema } } }
        },
        responses: {
            201: { content: { 'application/json': { schema: PdResponse } }, description: 'Created' },
            202: { content: { 'application/json': { schema: ApprovalWorkflowResponse } }, description: 'Pending Approval' },
            400: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Bad Request' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c) => {
        const data = c.req.valid('json')
        const userId = c.get('userId') as string || 'system'
        const tenantId = c.get('tenantId') as string
        const userPermissions = c.get('permissions') || []

        const effect = interceptCreate(
            tenantId,
            userId,
            userPermissions,
            'pd_configuration',
            data,
            () => PdConfigurationsService.create(data, userId) as any
        )
        return runEffect(c, effect, (result: any) => result.approvalRequired ? 202 : 201)
    }
)

/**
 * Update PD Configuration.
 * Update an existing PD configuration.
 * 
 * @route PUT /api/v1/banking/parameters/pd-configurations/:id
 */
app.openapi(
    createRoute({
        method: 'put',
        path: '/{id}',
        tags: ['PD Configurations'],
        summary: 'Update PD Configuration',
        request: {
            params: z.object({ id: z.string().transform(Number) }),
            body: { content: { 'application/json': { schema: UpdatePdConfigSchema } } }
        },
        responses: {
            200: { content: { 'application/json': { schema: PdResponse } }, description: 'Updated' },
            202: { content: { 'application/json': { schema: ApprovalWorkflowResponse } }, description: 'Update Pending Approval' },
            400: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Bad Request' },
            404: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Not Found' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c) => {
        const { id } = c.req.valid('param')
        const data = c.req.valid('json')
        const userId = c.get('userId') as string || 'system'
        const tenantId = c.get('tenantId') as string
        const userPermissions = c.get('permissions') || []

        if (isNaN(id)) return c.json({ success: false, message: 'Invalid ID' }, 400)

        const effect = interceptUpdate(
            tenantId,
            userId,
            userPermissions,
            'pd_configuration',
            id.toString(),
            data,
            () => PdConfigurationsService.update(id, data, userId) as any
        )
        return runEffect(c, effect, (result: any) => result.approvalRequired ? 202 : 200)
    }
)

/**
 * Delete PD Configuration.
 * Delete a PD configuration.
 * 
 * @route DELETE /api/v1/banking/parameters/pd-configurations/:id
 */
app.openapi(
    createRoute({
        method: 'delete',
        path: '/{id}',
        tags: ['PD Configurations'],
        summary: 'Delete PD Configuration',
        request: {
            params: z.object({ id: z.string().transform(Number) })
        },
        responses: {
            200: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Deleted' },
            202: { content: { 'application/json': { schema: ApprovalWorkflowResponse } }, description: 'Deletion Pending Approval' },
            400: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Bad Request' },
            404: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Not Found' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c) => {
        const { id } = c.req.valid('param')
        const userId = c.get('userId') as string || 'system'
        const tenantId = c.get('tenantId') as string
        const userPermissions = c.get('permissions') || []

        if (isNaN(id)) return c.json({ success: false, message: 'Invalid ID' }, 400)

        const effect = interceptDelete(
            tenantId,
            userId,
            userPermissions,
            'pd_configuration',
            id.toString(),
            () => PdConfigurationsService.delete(id) as any
        )
        return runEffect(c, effect, (result: any) => result.approvalRequired ? 202 : 200)
    }
)

// Metadata endpoints

/**
 * Get Metadata Methods.
 * Retrieve available methods metadata.
 * 
 * @route GET /api/v1/banking/parameters/pd-configurations/metadata/methods
 */
app.openapi(
    createRoute({
        method: 'get',
        path: '/metadata/methods',
        tags: ['PD Configurations'],
        summary: 'Get Metadata Methods',
        responses: {
            200: { content: { 'application/json': { schema: MetadataResponse } }, description: 'Metadata' }
        }
    }),
    async (c) => {
        return runEffect(c, PdConfigurationsService.getMethods() as any) as any
    }
)

/**
 * Get Metadata Population Types.
 * Retrieve available population types metadata.
 * 
 * @route GET /api/v1/banking/parameters/pd-configurations/metadata/population-types
 */
app.openapi(
    createRoute({
        method: 'get',
        path: '/metadata/population-types',
        tags: ['PD Configurations'],
        summary: 'Get Metadata Population Types',
        responses: {
            200: { content: { 'application/json': { schema: MetadataResponse } }, description: 'Metadata' }
        }
    }),
    async (c) => {
        return runEffect(c, PdConfigurationsService.getPopulationTypes() as any) as any
    }
)

export const pdConfigurationsRoutes = app
