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
import { buildListResponse, buildOffsetPagination, ListQueryValidationError, parseListQuery } from '../lib/http/list-query'

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

const ProductListContractResponse = z.object({
    success: z.boolean(),
    data: z.array(ProductParamResponse),
    pagination: z.object({
        mode: z.literal('offset'),
        limit: z.number(),
        total: z.number(),
        page: z.number(),
        offset: z.number(),
        totalPages: z.number(),
        hasNextPage: z.boolean(),
        hasPreviousPage: z.boolean(),
        nextCursor: z.null(),
        previousCursor: z.null(),
    }).optional(),
    appliedQuery: z.object({
        search: z.string().optional(),
        filters: z.record(z.string(), z.unknown()).optional(),
        sort: z.array(z.object({
            field: z.string(),
            direction: z.enum(['asc', 'desc']),
        })).optional(),
    }).optional(),
}).openapi('ProductListContractResponse')

const productFilterDefinitions = {
    prdCode: { field: 'prdCode', label: 'Product Code', type: 'text' as const },
    prdDesc: { field: 'prdDesc', label: 'Description', type: 'text' as const },
    prdGroup: { field: 'prdGroup', label: 'Group', type: 'text' as const },
    prdType: { field: 'prdType', label: 'Type', type: 'text' as const },
    currency: { field: 'currency', label: 'Currency', type: 'text' as const },
    dataSource: { field: 'dataSource', label: 'Data Source', type: 'text' as const },
    activeFlag: {
        field: 'activeFlag',
        label: 'Active',
        type: 'enum' as const,
        options: [
            { label: 'Active', value: 'active' },
            { label: 'Inactive', value: 'inactive' },
            { label: 'True', value: 'true' },
            { label: 'False', value: 'false' },
        ],
    },
}

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
                offset: z.string().optional(),
                limit: z.string().optional().transform(v => v ? parseInt(v) : 10),
                search: z.string().optional(),
                filters: z.string().optional(),
                sort: z.string().optional(),
                paginationMode: z.string().optional(),
                currency: z.string().optional(),
                dataSource: z.string().optional(),
                activeOnly: z.string().optional(),
            })
        },
        responses: {
            200: {
                content: {
                    'application/json': {
                        schema: ProductListContractResponse
                    }
                }, description: 'List Products'
            },
            400: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Invalid Mode' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c) => {
        const { mode, page, limit, search } = c.req.valid('query')
        const rawQuery = c.req.query()
        const usesListContract = ['page', 'offset', 'limit', 'search', 'filters', 'sort', 'paginationMode', 'currency', 'dataSource', 'activeOnly'].some((key) => rawQuery[key] !== undefined)

        console.log(`📡 [PROD-ROUTES] Listing products for mode: ${mode}, page: ${page}, limit: ${limit}, search: ${search}`);

        if (!usesListContract) {
            return runEffect(c, ProductParametersService.list(mode, { page, limit, search }) as any) as any
        }

        try {
            const query = parseListQuery(c, {
                paginationMode: 'offset',
                defaultLimit: 10,
                maxLimit: 100,
                defaultSort: [{ field: 'prdCode', direction: 'asc' }],
                sortableColumns: ['prdCode', 'prdDesc', 'prdGroup', 'prdType', 'currency', 'dataSource', 'alFlag', 'activeFlag', 'createddate', 'updateddate'],
                filterableColumns: ['prdCode', 'prdDesc', 'prdGroup', 'prdType', 'currency', 'dataSource', 'activeFlag'],
                filterDefinitions: productFilterDefinitions,
                filterAliases: {
                    activeOnly: 'activeFlag',
                },
            })

            const result = await Effect.runPromise(ProductParametersService.listPage(mode, query) as any) as { rows: unknown[]; total: number }

            return c.json(
                buildListResponse(
                    result.rows,
                    query,
                    buildOffsetPagination(query, result.total),
                    {
                        filterDefinitions: productFilterDefinitions,
                        debug: {
                            endpoint: '/api/v1/banking/parameters/product',
                            requestUrl: c.req.url,
                            selectedSource: 'public.frs9_param_product',
                            sourceTables: ['public.frs9_param_product'],
                            filtersApplied: {
                                mode,
                                search: query.search,
                                ...query.filters,
                                sort: query.sort,
                                paginationMode: query.paginationMode,
                                page: query.page,
                                offset: query.offset,
                                limit: query.limit,
                            },
                            sqlPreview: 'SELECT * FROM public.frs9_param_product WHERE (:search IS NULL OR prd_code ILIKE :search OR prd_desc ILIKE :search OR prd_group ILIKE :search OR prd_type ILIKE :search) ORDER BY createddate DESC LIMIT :limit OFFSET :offset',
                            notes: [
                                'Product parameter list currently reads directly from public.frs9_param_product.',
                                'Mode is accepted by the API contract but is not applied as a database filter in the current repository implementation.',
                            ],
                        },
                    },
                ),
            )
        } catch (error) {
            if (error instanceof ListQueryValidationError) {
                return c.json(buildErrorResponse(c, {
                    error: 'Invalid list query',
                    message: error.message,
                    code: 'BAD_REQUEST',
                    details: error.details,
                }) as any, 400)
            }
            throw error
        }
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
