import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { legacyDb as db } from '../config'
import { frs9ParamSegmenth } from '../db/schema'
import { eq, desc } from 'drizzle-orm'
import type { AppContext } from '../app'
import { authMiddleware } from '../middleware'
import { buildErrorResponse } from '../lib/http/error-response'
import { openApiValidationHook } from '../lib/http/openapi-validation-hook'

export const productSegmentsRoutes = new OpenAPIHono<AppContext>({ defaultHook: openApiValidationHook })

// Apply auth middleware
productSegmentsRoutes.use('*', authMiddleware)

// ============================================================================
// SCHEMAS
// ============================================================================

const ProductSegmentSchema = z.object({
    id: z.number(),
    groupSegment: z.string().nullable(),
    segment: z.string().nullable(),
    subSegment: z.string().nullable(),
    segmentType: z.string().nullable(),
    isActive: z.boolean().nullable(),
    displayOrder: z.number().nullable(),
    description: z.string().optional(),
    tenantId: z.string(),
    createdBy: z.string().nullable(),
    updatedBy: z.string().nullable(),
    createdAt: z.string().nullable(),
    updatedAt: z.string().nullable(),
}).openapi('ProductSegment')

const CreateProductSegmentSchema = z.object({
    groupSegment: z.string().min(1).max(150),
    segment: z.string().min(1).max(150),
    subSegment: z.string().min(1).max(150),
    segmentType: z.enum(['EAD Segment', 'LGD Segment', 'PD Segment', 'Portfolio Segment']),
    isActive: z.boolean().default(true),
    displayOrder: z.number().int().default(0),
}).openapi('CreateProductSegmentInput')

const UpdateProductSegmentSchema = CreateProductSegmentSchema.partial().openapi('UpdateProductSegmentInput')

const ProductSegmentListResponse = z.object({
    success: z.boolean(),
    data: z.array(ProductSegmentSchema)
}).openapi('ProductSegmentListResponse')

const ProductSegmentResponse = z.object({
    success: z.boolean(),
    data: ProductSegmentSchema,
    message: z.string().optional()
}).openapi('ProductSegmentResponse')

const ErrorResponse = z.object({
    success: z.boolean(),
    message: z.string(),
    error: z.string().optional(),
    code: z.string().optional(),
    requestId: z.string().nullable().optional(),
    timestamp: z.string().optional(),
    details: z.unknown().optional(),
}).openapi('ErrorResponse')

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const transformSegment = (segment: typeof frs9ParamSegmenth.$inferSelect) => ({
    id: segment.pkid,
    groupSegment: segment.groupSegment,
    segment: segment.segment,
    subSegment: segment.subSegment,
    segmentType: segment.segmentType,
    isActive: segment.activeFlag,
    displayOrder: segment.seq,
    description: '',
    tenantId: 'legacy',
    createdBy: segment.createdby,
    updatedBy: segment.updatedby,
    createdAt: segment.createddate,
    updatedAt: segment.updateddate,
})

// ============================================================================
// ENDPOINTS
// ============================================================================

// GET /api/v1/banking/parameters/product-segments
productSegmentsRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/',
        tags: ['Product Segments'],
        summary: 'List Product Segments',
        responses: {
            200: { content: { 'application/json': { schema: ProductSegmentListResponse } }, description: 'List Segments' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c): Promise<any> => {
        try {
            const segments = await db
                .select()
                .from(frs9ParamSegmenth)
                .orderBy(desc(frs9ParamSegmenth.seq))

            return c.json({
                success: true,
                data: segments.map(transformSegment),
            } as any)
        } catch (error) {
            console.error('Error fetching product segments:', error)
            return c.json(buildErrorResponse(c, { error: 'Failed to fetch product segments', message: 'Failed to fetch product segments', code: 'PRODUCT_SEGMENT_ERROR', details: { cause: String(error) } }), 500)
        }
    }
)

// GET /api/v1/banking/parameters/product-segments/:id
productSegmentsRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/{id}',
        tags: ['Product Segments'],
        summary: 'Get Product Segment',
        request: {
            params: z.object({ id: z.string().transform(Number) })
        },
        responses: {
            200: { content: { 'application/json': { schema: ProductSegmentResponse } }, description: 'Segment Details' },
            400: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Invalid ID' },
            404: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Not Found' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c): Promise<any> => {
        try {
            const { id } = c.req.valid('param')
            if (isNaN(id)) return c.json(buildErrorResponse(c, { error: 'Invalid ID', message: 'Invalid ID', code: 'BAD_REQUEST' }), 400);

            const [segment] = await db
                .select()
                .from(frs9ParamSegmenth)
                .where(eq(frs9ParamSegmenth.pkid, id))

            if (!segment) {
                return c.json(buildErrorResponse(c, { error: 'Segment not found', message: 'Segment not found', code: 'NOT_FOUND' }), 404)
            }

            return c.json({ success: true, data: transformSegment(segment) } as any)
        } catch (error) {
            console.error('Error fetching product segment:', error)
            return c.json(buildErrorResponse(c, { error: 'Failed to fetch product segment', message: 'Failed to fetch product segment', code: 'PRODUCT_SEGMENT_ERROR', details: { cause: String(error) } }), 500)
        }
    }
)

// POST /api/v1/banking/parameters/product-segments
productSegmentsRoutes.openapi(
    createRoute({
        method: 'post',
        path: '/',
        tags: ['Product Segments'],
        summary: 'Create Product Segment',
        request: {
            body: { content: { 'application/json': { schema: CreateProductSegmentSchema } } }
        },
        responses: {
            201: { content: { 'application/json': { schema: ProductSegmentResponse } }, description: 'Created' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c): Promise<any> => {
        try {
            const userId = c.get('userId') as string || 'system'
            const data = c.req.valid('json')

            const [segment] = await db
                .insert(frs9ParamSegmenth)
                .values({
                    groupSegment: data.groupSegment,
                    segment: data.segment,
                    subSegment: data.subSegment,
                    segmentType: data.segmentType,
                    activeFlag: data.isActive,
                    seq: data.displayOrder,
                    createdby: userId,
                    createdhost: 'localhost',
                    createddate: new Date().toISOString(),
                    updatedby: userId,
                    updatedhost: 'localhost',
                    updateddate: new Date().toISOString(),
                })
                .returning()

            return c.json({
                success: true,
                data: transformSegment(segment),
                message: 'Product segment created successfully',
            }, 201)
        } catch (error) {
            console.error('Error creating product segment:', error)
            return c.json(buildErrorResponse(c, { error: 'Failed to create product segment', message: 'Failed to create product segment', code: 'PRODUCT_SEGMENT_ERROR', details: { cause: String(error) } }), 500)
        }
    }
)

// PUT /api/v1/banking/parameters/product-segments/:id
productSegmentsRoutes.openapi(
    createRoute({
        method: 'put',
        path: '/{id}',
        tags: ['Product Segments'],
        summary: 'Update Product Segment',
        request: {
            params: z.object({ id: z.string().transform(Number) }),
            body: { content: { 'application/json': { schema: UpdateProductSegmentSchema } } }
        },
        responses: {
            200: { content: { 'application/json': { schema: ProductSegmentResponse } }, description: 'Updated' },
            404: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Not Found' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c): Promise<any> => {
        try {
            const { id } = c.req.valid('param')
            if (isNaN(id)) {
                return c.json(
                    buildErrorResponse(c, {
                        error: 'Invalid ID',
                        message: 'Invalid ID',
                        code: 'BAD_REQUEST',
                    }),
                    400
                ) as any
            }

            const userId = c.get('userId') as string || 'system'
            const data = c.req.valid('json')

            const updateData: any = {
                updatedby: userId,
                updatedhost: 'localhost',
                updateddate: new Date().toISOString(),
            }

            if (data.groupSegment) updateData.groupSegment = data.groupSegment
            if (data.segment) updateData.segment = data.segment
            if (data.subSegment) updateData.subSegment = data.subSegment
            if (data.segmentType) updateData.segmentType = data.segmentType
            if (data.isActive !== undefined) updateData.activeFlag = data.isActive
            if (data.displayOrder !== undefined) updateData.seq = data.displayOrder

            const [updated] = await db
                .update(frs9ParamSegmenth)
                .set(updateData)
                .where(eq(frs9ParamSegmenth.pkid, id))
                .returning()

            if (!updated) {
                return c.json(
                    buildErrorResponse(c, {
                        error: 'Segment not found',
                        message: 'Segment not found',
                        code: 'NOT_FOUND',
                    }),
                    404
                )
            }

            return c.json({
                success: true,
                data: transformSegment(updated),
                message: 'Product segment updated successfully',
            })
        } catch (error) {
            console.error('Error updating product segment:', error)
            return c.json(
                buildErrorResponse(c, {
                    error: 'Failed to update product segment',
                    message: 'Failed to update product segment',
                    code: 'PRODUCT_SEGMENT_ERROR',
                    details: String(error),
                }),
                500
            )
        }
    }
)

// DELETE /api/v1/banking/parameters/product-segments/:id
productSegmentsRoutes.openapi(
    createRoute({
        method: 'delete',
        path: '/{id}',
        tags: ['Product Segments'],
        summary: 'Delete Product Segment',
        request: {
            params: z.object({ id: z.string().transform(Number) })
        },
        responses: {
            200: { content: { 'application/json': { schema: z.object({ success: z.boolean(), message: z.string() }) } }, description: 'Deleted' },
            400: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Invalid ID' },
            404: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Not Found' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c): Promise<any> => {
        try {
            const { id } = c.req.valid('param')
            if (isNaN(id)) {
                return c.json(
                    buildErrorResponse(c, {
                        error: 'Invalid ID',
                        message: 'Invalid ID',
                        code: 'BAD_REQUEST',
                    }),
                    400
                )
            }

            const [deleted] = await db
                .delete(frs9ParamSegmenth)
                .where(eq(frs9ParamSegmenth.pkid, id))
                .returning()

            if (!deleted) {
                return c.json(
                    buildErrorResponse(c, {
                        error: 'Segment not found',
                        message: 'Segment not found',
                        code: 'NOT_FOUND',
                    }),
                    404
                )
            }

            return c.json({ success: true, message: 'Product segment deleted successfully' } as any)
        } catch (error) {
            console.error('Error deleting product segment:', error)
            return c.json(
                buildErrorResponse(c, {
                    error: 'Failed to delete product segment',
                    message: 'Failed to delete product segment',
                    code: 'PRODUCT_SEGMENT_ERROR',
                    details: String(error),
                }),
                500
            )
        }
    }
)
