import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { legacyDb as db } from '../config'
import { frs9ParamSegmenth, frs9ParamSegmentd } from '../db/schema'
import { eq, desc, asc } from 'drizzle-orm'
import type { AppContext } from '../app'

export const segmentationRoutes = new OpenAPIHono<AppContext>()

// ============================================================================
// SCHEMAS
// ============================================================================

const SegmentDetailInputSchema = z.object({
    queryGroup: z.number().int().optional(),
    seq: z.number().int().optional(),
    tableName: z.string().max(30).optional(),
    columnName: z.string().max(30).optional(),
    dataType: z.string().max(15).optional(),
    operator: z.string().max(10).optional(),
    value1: z.string().optional(),
    value2: z.string().optional(),
    condition: z.string().max(3).optional(),
}).openapi('SegmentDetailInput')

const SegmentHeaderInputSchema = z.object({
    groupSegment: z.string().max(150),
    segment: z.string().max(150),
    subSegment: z.string().max(150).optional(),
    segmentType: z.string().max(50),
    seq: z.number().int().optional(),
    activeFlag: z.boolean().default(true),
    createdby: z.string().max(50).default('SYSTEM'),
}).openapi('SegmentHeaderInput')

const SegmentHeaderResponse = z.object({
    success: z.boolean(),
    data: z.any(), // Generic since we are returning Drizzle selects primarily
    message: z.string().optional(),
}).openapi('SegmentHeaderResponse')

const SegmentListResponse = z.object({
    success: z.boolean(),
    data: z.array(z.any()),
    total: z.number().optional(),
}).openapi('SegmentListResponse')

const SegmentDetailListResponse = z.object({
    success: z.boolean(),
    data: z.array(z.any()),
}).openapi('SegmentDetailListResponse')

const MetadataListResponse = z.object({
    success: z.boolean(),
    data: z.array(z.object({
        type_code: z.string(),
        type_name: z.string()
    }))
}).openapi('MetadataListResponse')

const ErrorResponse = z.object({
    success: z.boolean().optional(),
    error: z.string(),
    message: z.string().optional()
}).openapi('ErrorResponse')

// ============================================================================
// ENDPOINTS
// ============================================================================

// Metadata Endpoint: Segment Types
segmentationRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/business-settings/segment-types',
        tags: ['Segmentation'],
        summary: 'Get Segment Types',
        responses: {
            200: { content: { 'application/json': { schema: MetadataListResponse } }, description: 'Segment Types' }
        }
    }),
    async (c) => {
        return c.json({
            success: true,
            data: [
                { type_code: 'RISK_SEGMENT', type_name: 'Risk-Based Segmentation' },
                { type_code: 'PRODUCT_SEGMENT', type_name: 'Product-Based Segmentation' },
                { type_code: 'GEOGRAPHY_SEGMENT', type_name: 'Geographic Segmentation' },
                { type_code: 'CUSTOMER_SEGMENT', type_name: 'Customer-Based Segmentation' },
                { type_code: 'PORTFOLIO_SEGMENT', type_name: 'Portfolio Segmentation' },
                { type_code: 'BUSINESS_SEGMENT', type_name: 'Business Line Segmentation' },
                { type_code: 'CUSTOM_SEGMENT', type_name: 'Custom Segmentation' }
            ]
        })
    }
)

// GET / - List all Segment Headers
segmentationRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/',
        tags: ['Segmentation'],
        summary: 'List Segment Headers',
        responses: {
            200: { content: { 'application/json': { schema: SegmentListResponse } }, description: 'List Headers' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c) => {
        try {
            const result = await db.select().from(frs9ParamSegmenth).orderBy(desc(frs9ParamSegmenth.createddate));
            return c.json({ success: true, data: result, total: result.length });
        } catch (error) {
            console.error('Error fetching segments:', error);
            return c.json({ error: 'Failed to fetch segments' }, 500);
        }
    }
)

// GET /:id - Get Segment Header
segmentationRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/{id}',
        tags: ['Segmentation'],
        summary: 'Get Segment Header',
        request: {
            params: z.object({ id: z.string().transform(Number) })
        },
        responses: {
            200: { content: { 'application/json': { schema: SegmentHeaderResponse } }, description: 'Segment Header' },
            404: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Not Found' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c) => {
        const id = c.req.valid('param').id
        if (isNaN(id)) return c.json({ error: 'Invalid ID' }, 400);

        try {
            const [header] = await db.select().from(frs9ParamSegmenth).where(eq(frs9ParamSegmenth.pkid, id));
            if (!header) return c.json({ error: 'Segment not found' }, 404);

            return c.json({ success: true, data: header });
        } catch (error) {
            console.error('Error fetching segment details:', error);
            return c.json({ error: 'Failed to fetch segment details' }, 500);
        }
    }
)

// POST / - Create Segment Header
segmentationRoutes.openapi(
    createRoute({
        method: 'post',
        path: '/',
        tags: ['Segmentation'],
        summary: 'Create Segment Header',
        request: {
            body: { content: { 'application/json': { schema: SegmentHeaderInputSchema } } }
        },
        responses: {
            201: { content: { 'application/json': { schema: SegmentHeaderResponse } }, description: 'Created' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c) => {
        const headerData = c.req.valid('json');

        try {
            const [newHeader] = await db.insert(frs9ParamSegmenth).values({
                ...headerData,
                createdhost: 'localhost',
                createddate: new Date().toISOString()
            }).returning();

            return c.json({ success: true, data: newHeader }, 201);
        } catch (error) {
            console.error('Error creating segment:', error);
            return c.json({ error: 'Failed to create segment' }, 500);
        }
    }
)

// PUT /:id - Update Segment Header
segmentationRoutes.openapi(
    createRoute({
        method: 'put',
        path: '/{id}',
        tags: ['Segmentation'],
        summary: 'Update Segment Header',
        request: {
            params: z.object({ id: z.string().transform(Number) }),
            body: { content: { 'application/json': { schema: SegmentHeaderInputSchema.partial() } } }
        },
        responses: {
            200: { content: { 'application/json': { schema: SegmentHeaderResponse } }, description: 'Updated' },
            404: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Not Found' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c) => {
        const id = c.req.valid('param').id
        if (isNaN(id)) return c.json({ error: 'Invalid ID' }, 400);

        const headerData = c.req.valid('json');

        try {
            const [updatedHeader] = await db.update(frs9ParamSegmenth)
                .set({
                    ...headerData,
                    updateddate: new Date().toISOString(),
                    updatedhost: 'localhost',
                })
                .where(eq(frs9ParamSegmenth.pkid, id))
                .returning();

            return c.json({ success: true, data: updatedHeader });
        } catch (error) {
            console.error('Error updating segment:', error);
            return c.json({ error: 'Failed to update segment' }, 500);
        }
    }
)

// DELETE /:id - Delete Segment Header (Cascade)
segmentationRoutes.openapi(
    createRoute({
        method: 'delete',
        path: '/{id}',
        tags: ['Segmentation'],
        summary: 'Delete Segment Header',
        request: {
            params: z.object({ id: z.string().transform(Number) })
        },
        responses: {
            200: { content: { 'application/json': { schema: z.object({ success: z.boolean(), message: z.string() }) } }, description: 'Deleted' },
            400: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Invalid ID' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c) => {
        const id = c.req.valid('param').id
        if (isNaN(id)) return c.json({ error: 'Invalid ID' }, 400);

        try {
            await db.transaction(async (tx) => {
                await tx.delete(frs9ParamSegmentd).where(eq(frs9ParamSegmentd.segmentId, id));
                await tx.delete(frs9ParamSegmenth).where(eq(frs9ParamSegmenth.pkid, id));
            });

            return c.json({ success: true, message: 'Deleted successfully' });
        } catch (error) {
            console.error('Error deleting segment:', error);
            return c.json({ error: 'Failed to delete segment' }, 500);
        }
    }
)

// ==========================================
// DETAILS ENDPOINTS
// ==========================================

// GET /:id/details - List Details
segmentationRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/{id}/details',
        tags: ['Segmentation'],
        summary: 'List Segment Details',
        request: {
            params: z.object({ id: z.string().transform(Number) })
        },
        responses: {
            200: { content: { 'application/json': { schema: SegmentDetailListResponse } }, description: 'List Details' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c) => {
        const id = c.req.valid('param').id
        if (isNaN(id)) return c.json({ error: 'Invalid ID' }, 400);

        try {
            const details = await db.select()
                .from(frs9ParamSegmentd)
                .where(eq(frs9ParamSegmentd.segmentId, id))
                .orderBy(asc(frs9ParamSegmentd.seq));

            return c.json({ success: true, data: details });
        } catch (error) {
            return c.json({ error: 'Failed to fetch details' }, 500);
        }
    }
)

// POST /:id/details - Create Detail
segmentationRoutes.openapi(
    createRoute({
        method: 'post',
        path: '/{id}/details',
        tags: ['Segmentation'],
        summary: 'Create Segment Detail',
        request: {
            params: z.object({ id: z.string().transform(Number) }),
            body: { content: { 'application/json': { schema: SegmentDetailInputSchema } } }
        },
        responses: {
            201: { content: { 'application/json': { schema: SegmentHeaderResponse } }, description: 'Created' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c) => {
        const id = c.req.valid('param').id
        if (isNaN(id)) return c.json({ error: 'Invalid ID' }, 400);
        const detailData = c.req.valid('json');

        try {
            const [newDetail] = await db.insert(frs9ParamSegmentd).values({
                ...detailData,
                segmentId: id,
                createdhost: 'localhost',
                createddate: new Date().toISOString(),
                createdby: 'SYSTEM'
            }).returning();

            return c.json({ success: true, data: newDetail }, 201);
        } catch (error) {
            return c.json({ error: 'Failed to create detail' }, 500);
        }
    }
)

// PUT /details/:detailId - Update Detail
segmentationRoutes.openapi(
    createRoute({
        method: 'put',
        path: '/details/{detailId}',
        tags: ['Segmentation'],
        summary: 'Update Segment Detail',
        request: {
            params: z.object({ detailId: z.string().transform(Number) }),
            body: { content: { 'application/json': { schema: SegmentDetailInputSchema } } }
        },
        responses: {
            200: { content: { 'application/json': { schema: SegmentHeaderResponse } }, description: 'Updated' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c) => {
        const detailId = c.req.valid('param').detailId
        if (isNaN(detailId)) return c.json({ error: 'Invalid ID' }, 400);
        const detailData = c.req.valid('json');

        try {
            const [updatedDetail] = await db.update(frs9ParamSegmentd)
                .set({
                    ...detailData,
                    updateddate: new Date().toISOString(),
                    updatedhost: 'localhost'
                })
                .where(eq(frs9ParamSegmentd.pkid, detailId))
                .returning();

            return c.json({ success: true, data: updatedDetail });
        } catch (error) {
            return c.json({ error: 'Failed to update detail' }, 500);
        }
    }
)

// DELETE /details/:detailId - Delete Detail
segmentationRoutes.openapi(
    createRoute({
        method: 'delete',
        path: '/details/{detailId}',
        tags: ['Segmentation'],
        summary: 'Delete Segment Detail',
        request: {
            params: z.object({ detailId: z.string().transform(Number) })
        },
        responses: {
            200: { content: { 'application/json': { schema: z.object({ success: z.boolean(), message: z.string() }) } }, description: 'Deleted' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c) => {
        const detailId = c.req.valid('param').detailId
        if (isNaN(detailId)) return c.json({ error: 'Invalid ID' }, 400);

        try {
            await db.delete(frs9ParamSegmentd).where(eq(frs9ParamSegmentd.pkid, detailId));
            return c.json({ success: true, message: 'Deleted' });
        } catch (error) {
            return c.json({ error: 'Failed to delete detail' }, 500);
        }
    }
)
