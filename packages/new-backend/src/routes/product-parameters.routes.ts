import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { Effect, pipe } from 'effect'
import type { AppContext } from '../app'
import { authMiddleware } from '../middleware'
import { ProductParametersService } from '../services/product-parameters.service'
import { runEffect } from '../lib/effect/runtime'
import { interceptCreate, interceptUpdate, interceptDelete } from '../middleware/approval-interceptor.middleware'
import type { ApprovalResponse } from '../lib/approval-helpers'
import { buildErrorResponse } from '../lib/http/error-response'
import { openApiValidationHook } from '../lib/http/openapi-validation-hook'

const app = new OpenAPIHono<AppContext>({ defaultHook: openApiValidationHook })

app.use('*', authMiddleware)

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

export const ProductModeSchema = z.enum(['conventional', 'sharia']).openapi('ProductMode')

export const ProductParamSchema = z.object({
    mode: ProductModeSchema.optional(), // Added for flexibility in CRUD
    dataSource: z.string().max(50),
    prdGroup: z.string().max(50),
    prdType: z.string().max(50),
    prdCode: z.string().max(50),
    prdDesc: z.string().max(255),
    currency: z.string().max(10),
    amortizationType: z.string().max(50).optional(),
    alFlag: z.string().max(50).optional(),
    impairedFlag: z.boolean().optional(),
    bmFlag: z.boolean().optional(),
    expectedLife: z.number().int().optional(),
    borrowingRate: z.number().optional(),
    marketRate: z.number().optional(),
    activeFlag: z.boolean().default(true),
    createdby: z.string().max(50).default('SYSTEM'),
}).openapi('CreateProductParamInput')

export const UpdateProductParamSchema = ProductParamSchema.partial().openapi('UpdateProductParamInput')

const ProductParamResponse = z.object({
    id: z.number().openapi({ description: 'Alias for pkid' }),
    pkid: z.number(),
    dataSource: z.string().nullable(),
    prdGroup: z.string().nullable(),
    prdType: z.string().nullable(),
    prdCode: z.string().nullable(),
    prdDesc: z.string().nullable(),
    currency: z.string().nullable(),
    amortizationType: z.string().nullable(),
    alFlag: z.string().nullable(),
    impairedFlag: z.boolean().nullable(),
    bmFlag: z.boolean().nullable(),
    expectedLife: z.number().nullable(),
    borrowingRate: z.number().nullable(),
    marketRate: z.number().nullable(),
    activeFlag: z.boolean().nullable(),
    createdby: z.string().nullable(),
    createddate: z.string().nullable(),
    updatedby: z.string().nullable(),
    updateddate: z.string().nullable(),
}).openapi('ProductParamResponse')

const ProductListResponse = z.object({
    success: z.boolean(),
    products: z.array(ProductParamResponse),
    mode: ProductModeSchema,
    timestamp: z.string()
}).openapi('ProductListResponse')

const ProductDetailResponse = z.object({
    success: z.boolean(),
    data: ProductParamResponse
}).openapi('ProductDetailResponse')

const OptionSchema = z.object({
    id: z.string(),
    name: z.string(),
})

const OptionListResponse = z.object({
    success: z.boolean(),
    data: z.array(OptionSchema)
}).openapi('OptionListResponse')

const ErrorResponse = z.object({
    success: z.boolean(),
    message: z.string(),
    error: z.string().optional()
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
 * Get Instrument Class Options.
 * Retrieve available instrument class options.
 * 
 * @route GET /api/v1/banking/collective/product/instrument-class-options
 */
app.openapi(
    createRoute({
        method: 'get',
        path: '/instrument-class-options',
        tags: ['Product Parameters'],
        summary: 'Get Instrument Class Options',
        responses: {
            200: { content: { 'application/json': { schema: OptionListResponse } }, description: 'Options' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c) => {
        return runEffect(c, ProductParametersService.getInstrumentClassOptions() as any) as any
    }
)

/**
 * List Product Parameters.
 * Retrieve a list of product parameters.
 * 
 * @route GET /api/v1/banking/collective/product
 */
app.openapi(
    createRoute({
        method: 'get',
        path: '/',
        tags: ['Product Parameters'],
        summary: 'List Product Parameters',
        request: {
            query: z.object({
                mode: ProductModeSchema,
                page: z.string().optional().transform(v => v ? parseInt(v) : 1),
                limit: z.string().optional().transform(v => v ? parseInt(v) : 10),
                search: z.string().optional()
            })
        },
        responses: {
            200: {
                content: {
                    'application/json': {
                        schema: ProductListResponse.extend({
                            pagination: z.object({
                                total: z.number(),
                                page: z.number(),
                                limit: z.number(),
                                pages: z.number()
                            })
                        })
                    }
                }, description: 'List Products'
            },
            400: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Invalid Mode' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c) => {
        const { mode, page, limit, search } = c.req.valid('query')
        console.log(`📡 [PROD-ROUTES] Listing products for mode: ${mode}, page: ${page}, limit: ${limit}, search: ${search}`);

        return runEffect(c, ProductParametersService.list(mode, { page, limit, search }) as any) as any
    }
)

/**
 * Get Product Parameter.
 * Retrieve a specific product parameter by ID.
 * 
 * @route GET /api/v1/banking/collective/product/:id
 */
app.openapi(
    createRoute({
        method: 'get',
        path: '/{id}',
        tags: ['Product Parameters'],
        summary: 'Get Product Parameter',
        request: {
            params: z.object({ id: z.string().transform(Number) })
        },
        responses: {
            200: { content: { 'application/json': { schema: ProductDetailResponse } }, description: 'Product Detail' },
            404: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Not Found' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c) => {
        const { id } = c.req.valid('param')
        if (isNaN(id)) return c.json(buildErrorResponse(c, { error: 'Invalid ID', message: 'Invalid ID', code: 'BAD_REQUEST' }) as any, 400)
        return runEffect(c, ProductParametersService.get(id) as any) as any
    }
)

/**
 * Create Product Parameter.
 * Create a new product parameter configuration.
 * 
 * @route POST /api/v1/banking/collective/product
 */
app.openapi(
    createRoute({
        method: 'post',
        path: '/',
        tags: ['Product Parameters'],
        summary: 'Create Product Parameter',
        request: {
            body: {
                content: {
                    'application/json': {
                        schema: ProductParamSchema.extend({ mode: ProductModeSchema })
                    }
                }
            }
        },
        responses: {
            201: { content: { 'application/json': { schema: ProductDetailResponse } }, description: 'Created' },
            202: { content: { 'application/json': { schema: ApprovalWorkflowResponse } }, description: 'Pending Approval' },
            400: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Invalid Input' },
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
            'product_parameter',
            data,
            () => ProductParametersService.create(data, userId)
        )
        return runEffect(c, effect, (result: any) => result.approvalRequired ? 202 : 201)
    }
)

/**
 * Update Product Parameter.
 * Update an existing product parameter configuration.
 * 
 * @route PUT /api/v1/banking/collective/product/:id
 */
app.openapi(
    createRoute({
        method: 'put',
        path: '/{id}',
        tags: ['Product Parameters'],
        summary: 'Update Product Parameter',
        request: {
            params: z.object({ id: z.string().transform(Number) }),
            body: { content: { 'application/json': { schema: UpdateProductParamSchema } } }
        },
        responses: {
            200: { content: { 'application/json': { schema: ProductDetailResponse } }, description: 'Updated' },
            202: { content: { 'application/json': { schema: ApprovalWorkflowResponse } }, description: 'Update Pending Approval' },
            400: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Invalid Input' },
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
        if (isNaN(id)) return c.json(buildErrorResponse(c, { error: 'Invalid ID', message: 'Invalid ID', code: 'BAD_REQUEST' }) as any, 400)

        const effect = interceptUpdate(
            tenantId,
            userId,
            userPermissions,
            'product_parameter',
            id.toString(),
            data,
            () => ProductParametersService.update(id, data, userId)
        )
        return runEffect(c, effect, (result: any) => result.approvalRequired ? 202 : 200)
    }
)

/**
 * Delete Product Parameter.
 * Delete a product parameter configuration.
 * 
 * @route DELETE /api/v1/banking/collective/product/:id
 */
app.openapi(
    createRoute({
        method: 'delete',
        path: '/{id}',
        tags: ['Product Parameters'],
        summary: 'Delete Product Parameter',
        request: {
            params: z.object({ id: z.string().transform(Number) })
        },
        responses: {
            200: { content: { 'application/json': { schema: z.object({ success: z.boolean(), message: z.string() }) } }, description: 'Deleted' },
            202: { content: { 'application/json': { schema: ApprovalWorkflowResponse } }, description: 'Deletion Pending Approval' },
            400: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Invalid ID' },
            404: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Not Found' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c) => {
        const { id } = c.req.valid('param')
        const userId = c.get('userId') as string || 'system'
        const tenantId = c.get('tenantId') as string
        const userPermissions = c.get('permissions') || []
        if (isNaN(id)) return c.json(buildErrorResponse(c, { error: 'Invalid ID', message: 'Invalid ID', code: 'BAD_REQUEST' }) as any, 400)

        const effect = interceptDelete(
            tenantId,
            userId,
            userPermissions,
            'product_parameter',
            id.toString(),
            () => ProductParametersService.delete(id)
        )
        return runEffect(c, effect, (result: any) => result.approvalRequired ? 202 : 200)
    }
)

export const productParameterRoutes = app
