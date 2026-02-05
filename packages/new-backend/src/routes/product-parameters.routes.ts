import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import type { AppContext } from '../app'
import { authMiddleware } from '../middleware'
import { ProductParametersService } from '../services/product-parameters.service'
import { runEffect } from '../lib/effect/runtime'

const app = new OpenAPIHono<AppContext>()

app.use('*', authMiddleware)

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const ProductParamSchema = z.object({
    dataSource: z.string().max(20),
    prdGroup: z.string().max(20),
    prdType: z.string().max(20),
    prdCode: z.string().max(20),
    prdDesc: z.string().max(255),
    currency: z.string().max(5),
    amortizationType: z.string().max(10).optional(),
    alFlag: z.string().max(10).optional(),
    impairedFlag: z.boolean().optional(),
    bmFlag: z.boolean().optional(),
    expectedLife: z.number().int().optional(),
    borrowingRate: z.number().optional(),
    marketRate: z.number().optional(),
    activeFlag: z.boolean().default(true),
    createdby: z.string().max(50).default('SYSTEM'),
}).openapi('CreateProductParamInput')

const UpdateProductParamSchema = ProductParamSchema.partial().openapi('UpdateProductParamInput')

const ProductParamResponse = z.object({
    id: z.number(),
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
    data: z.array(ProductParamResponse)
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
        responses: {
            200: { content: { 'application/json': { schema: ProductListResponse } }, description: 'List Products' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c) => {
        return runEffect(c, ProductParametersService.list() as any) as any
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
        if (isNaN(id)) return c.json({ success: false, message: 'Invalid ID' } as any, 400)
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
            body: { content: { 'application/json': { schema: ProductParamSchema } } }
        },
        responses: {
            201: { content: { 'application/json': { schema: ProductDetailResponse } }, description: 'Created' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c) => {
        const data = c.req.valid('json')
        const userId = c.get('userId') as string || 'system'
        return runEffect(c, ProductParametersService.create(data, userId) as any) as any
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
            404: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Not Found' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c) => {
        const { id } = c.req.valid('param')
        const data = c.req.valid('json')
        const userId = c.get('userId') as string || 'system'
        if (isNaN(id)) return c.json({ success: false, message: 'Invalid ID' } as any, 400)
        return runEffect(c, ProductParametersService.update(id, data, userId) as any) as any
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
            200: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Deleted' },
            400: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Invalid ID' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c) => {
        const { id } = c.req.valid('param')
        if (isNaN(id)) return c.json({ success: false, message: 'Invalid ID' } as any, 400)
        return runEffect(c, ProductParametersService.delete(id) as any) as any
    }
)

export const productParameterRoutes = app
