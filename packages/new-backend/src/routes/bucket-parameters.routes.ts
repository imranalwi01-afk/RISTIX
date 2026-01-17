import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import type { AppContext } from '../app'
import { authMiddleware } from '../middleware'
import { BucketParametersService } from '../services/bucket-parameters.service'
import { runEffect } from '../lib/effect/runtime'

const app = new OpenAPIHono<AppContext>()

app.use('*', authMiddleware)

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const CreateHeaderSchema = z.object({
    bucket_group: z.string().min(1).max(30),
    bucket_group_desc: z.string().max(255).optional(),
    basis: z.string().max(20).default('D'),
    include_close: z.boolean().default(false),
    include_wo: z.boolean().default(false),
    active_flag: z.boolean().default(true),
}).openapi('CreateBucketHeaderInput')

const UpdateHeaderSchema = CreateHeaderSchema.partial().openapi('UpdateBucketHeaderInput')

const CreateDetailSchema = z.object({
    bucket_name: z.string().min(1).max(100),
    range_start: z.number().int(),
    range_end: z.number().int().optional().nullable(),
    seq: z.number().int().optional(),
    active_flag: z.boolean().default(true)
}).openapi('CreateBucketDetailInput')

const UpdateDetailSchema = CreateDetailSchema.partial().openapi('UpdateBucketDetailInput')

const BucketHeaderSchema = z.object({
    id: z.number(),
    bucket_group: z.string().nullable(),
    bucket_group_desc: z.string().nullable(),
    basis: z.string().nullable(),
    include_close: z.boolean().nullable(),
    include_wo: z.boolean().nullable(),
    active_flag: z.boolean().default(true),
    created_by: z.string().nullable(),
    updated_by: z.string().nullable(),
    created_date: z.string().nullable(),
    updated_date: z.string().nullable(),
}).openapi('BucketHeader')

const BucketDetailSchema = z.object({
    id: z.number(),
    bucket_id: z.number().nullable(),
    bucket_name: z.string().nullable(),
    range_start: z.number().nullable(),
    range_end: z.number().nullable(),
    seq: z.number().nullable(),
    active_flag: z.boolean().default(true),
    created_by: z.string().nullable(),
    updated_by: z.string().nullable(),
    created_date: z.string().nullable(),
    updated_date: z.string().nullable(),
}).openapi('BucketDetail')

const BucketListResponse = z.object({
    success: z.boolean(),
    data: z.array(BucketHeaderSchema)
}).openapi('BucketListResponse')

const BucketResponse = z.object({
    success: z.boolean(),
    data: BucketHeaderSchema
}).openapi('BucketResponse')

const BucketDetailListResponse = z.object({
    success: z.boolean(),
    data: z.array(BucketDetailSchema)
}).openapi('BucketDetailListResponse')

const BucketDetailResponse = z.object({
    success: z.boolean(),
    data: BucketDetailSchema
}).openapi('BucketDetailResponse')

const ErrorResponse = z.object({
    success: z.boolean(),
    message: z.string(),
    error: z.string().optional()
}).openapi('ErrorResponse')

// ============================================================================
// ROUTES (HEADERS)
// ============================================================================

// GET /api/v1/banking/collective/bucket
app.openapi(
    createRoute({
        method: 'get',
        path: '/',
        tags: ['Bucket Parameters'],
        summary: 'List Bucket Headers',
        request: {
            query: z.object({
                search: z.string().optional(),
                basis: z.string().optional()
            })
        },
        responses: {
            200: { content: { 'application/json': { schema: BucketListResponse } }, description: 'List Headers' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c) => {
        const query = c.req.valid('query')
        return runEffect(c, BucketParametersService.listHeaders(query) as any) as any
    }
)

// GET /api/v1/banking/collective/bucket/:id
app.openapi(
    createRoute({
        method: 'get',
        path: '/{id}',
        tags: ['Bucket Parameters'],
        summary: 'Get Bucket Header',
        request: {
            params: z.object({ id: z.string().transform(Number) })
        },
        responses: {
            200: { content: { 'application/json': { schema: BucketResponse } }, description: 'Header Detail' },
            404: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Not Found' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c) => {
        const { id } = c.req.valid('param')
        if (isNaN(id)) return c.json({ success: false, message: 'Invalid ID' }, 400)
        return runEffect(c, BucketParametersService.getHeader(id) as any) as any
    }
)

// POST /api/v1/banking/collective/bucket
app.openapi(
    createRoute({
        method: 'post',
        path: '/',
        tags: ['Bucket Parameters'],
        summary: 'Create Bucket Header',
        request: {
            body: { content: { 'application/json': { schema: CreateHeaderSchema } } }
        },
        responses: {
            201: { content: { 'application/json': { schema: BucketResponse } }, description: 'Created' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c) => {
        const data = c.req.valid('json')
        const userId = c.get('userId') as string || 'system'
        return runEffect(c, BucketParametersService.createHeader(data, userId) as any) as any
    }
)

// PUT /api/v1/banking/collective/bucket/:id
app.openapi(
    createRoute({
        method: 'put',
        path: '/{id}',
        tags: ['Bucket Parameters'],
        summary: 'Update Bucket Header',
        request: {
            params: z.object({ id: z.string().transform(Number) }),
            body: { content: { 'application/json': { schema: UpdateHeaderSchema } } }
        },
        responses: {
            200: { content: { 'application/json': { schema: BucketResponse } }, description: 'Updated' },
            404: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Not Found' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c) => {
        const { id } = c.req.valid('param')
        const data = c.req.valid('json')
        const userId = c.get('userId') as string || 'system'

        if (isNaN(id)) return c.json({ success: false, message: 'Invalid ID' }, 400)

        return runEffect(c, BucketParametersService.updateHeader(id, data, userId) as any) as any
    }
)

// DELETE /api/v1/banking/collective/bucket/:id
app.openapi(
    createRoute({
        method: 'delete',
        path: '/{id}',
        tags: ['Bucket Parameters'],
        summary: 'Delete Bucket Header',
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
        if (isNaN(id)) return c.json({ success: false, message: 'Invalid ID' }, 400)

        return runEffect(c, BucketParametersService.deleteHeader(id) as any) as any
    }
)

// ============================================================================
// ROUTES (DETAILS)
// ============================================================================

// GET /api/v1/banking/collective/bucket/:id/details
app.openapi(
    createRoute({
        method: 'get',
        path: '/{id}/details',
        tags: ['Bucket Parameters'],
        summary: 'List Bucket Details',
        request: {
            params: z.object({ id: z.string().transform(Number) })
        },
        responses: {
            200: { content: { 'application/json': { schema: BucketDetailListResponse } }, description: 'List Details' },
            404: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Not Found' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c) => {
        const { id } = c.req.valid('param')
        if (isNaN(id)) return c.json({ success: false, message: 'Invalid ID' }, 400)

        return runEffect(c, BucketParametersService.listDetails(id) as any) as any
    }
)

// POST /api/v1/banking/collective/bucket/:id/details
app.openapi(
    createRoute({
        method: 'post',
        path: '/{id}/details',
        tags: ['Bucket Parameters'],
        summary: 'Create Bucket Detail',
        request: {
            params: z.object({ id: z.string().transform(Number) }),
            body: { content: { 'application/json': { schema: CreateDetailSchema } } }
        },
        responses: {
            201: { content: { 'application/json': { schema: BucketDetailResponse } }, description: 'Created' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c) => {
        const { id } = c.req.valid('param')
        const data = c.req.valid('json')
        const userId = c.get('userId') as string || 'system'

        if (isNaN(id)) return c.json({ success: false, message: 'Invalid ID' }, 400)

        return runEffect(c, BucketParametersService.createDetail(id, data, userId) as any) as any
    }
)

// PUT /api/v1/banking/collective/bucket/details/:detailId
app.openapi(
    createRoute({
        method: 'put',
        path: '/details/{detailId}',
        tags: ['Bucket Parameters'],
        summary: 'Update Bucket Detail',
        request: {
            params: z.object({ detailId: z.string().transform(Number) }),
            body: { content: { 'application/json': { schema: UpdateDetailSchema } } }
        },
        responses: {
            200: { content: { 'application/json': { schema: BucketDetailResponse } }, description: 'Updated' },
            404: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Not Found' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c) => {
        const { detailId } = c.req.valid('param')
        const data = c.req.valid('json')
        const userId = c.get('userId') as string || 'system'

        if (isNaN(detailId)) return c.json({ success: false, message: 'Invalid ID' }, 400)

        return runEffect(c, BucketParametersService.updateDetail(detailId, data, userId) as any) as any
    }
)

// DELETE /api/v1/banking/collective/bucket/details/:detailId
app.openapi(
    createRoute({
        method: 'delete',
        path: '/details/{detailId}',
        tags: ['Bucket Parameters'],
        summary: 'Delete Bucket Detail',
        request: {
            params: z.object({ detailId: z.string().transform(Number) })
        },
        responses: {
            200: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Deleted' },
            400: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Invalid ID' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c) => {
        const { detailId } = c.req.valid('param')
        if (isNaN(detailId)) return c.json({ success: false, message: 'Invalid ID' }, 400)

        return runEffect(c, BucketParametersService.deleteDetail(detailId) as any) as any
    }
)

export const bucketParametersRoutes = app
