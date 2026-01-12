import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { legacyDb as db } from '../config'
import { frs9ParamSegmenth, frs9ParamSegmentd } from '../db/schema'
import { eq, desc, and, asc } from 'drizzle-orm'

export const segmentationRoutes = new Hono()

// Schema definitions matches Backend Drizzle (camelCase)
const segmentDetailSchema = z.object({
    queryGroup: z.number().int().optional(),
    seq: z.number().int().optional(),
    tableName: z.string().max(30).optional(),
    columnName: z.string().max(30).optional(),
    dataType: z.string().max(15).optional(),
    operator: z.string().max(10).optional(),
    value1: z.string().optional(),
    value2: z.string().optional(),
    condition: z.string().max(3).optional(),
})

const segmentHeaderSchema = z.object({
    groupSegment: z.string().max(150),
    segment: z.string().max(150),
    subSegment: z.string().max(150).optional(),
    segmentType: z.string().max(50),
    seq: z.number().int().optional(),
    activeFlag: z.boolean().default(true),
    createdby: z.string().max(50).default('SYSTEM'),
})

// Metadata Endpoint: Segment Types
segmentationRoutes.get('/business-settings/segment-types', (c) => {
    // Return hardcoded types or valid types for now
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
})

// GET / - List all Segment Headers
segmentationRoutes.get('/', async (c) => {
    try {
        const result = await db.select().from(frs9ParamSegmenth).orderBy(desc(frs9ParamSegmenth.createddate));
        // Add detail_count?
        // We can do a join or subquery, but for now basic list.
        return c.json({ success: true, data: result, total: result.length });
    } catch (error) {
        console.error('Error fetching segments:', error);
        return c.json({ error: 'Failed to fetch segments' }, 500);
    }
})

// GET /:id - Get Segment Header
segmentationRoutes.get('/:id', async (c) => {
    const id = Number(c.req.param('id'));
    if (isNaN(id)) return c.json({ error: 'Invalid ID' }, 400);

    try {
        const [header] = await db.select().from(frs9ParamSegmenth).where(eq(frs9ParamSegmenth.pkid, id));
        if (!header) return c.json({ error: 'Segment not found' }, 404);

        return c.json({ success: true, data: header });
    } catch (error) {
        console.error('Error fetching segment details:', error);
        return c.json({ error: 'Failed to fetch segment details' }, 500);
    }
})

// POST / - Create Segment Header
segmentationRoutes.post('/', zValidator('json', segmentHeaderSchema), async (c) => {
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
})

// PUT /:id - Update Segment Header
segmentationRoutes.put('/:id', zValidator('json', segmentHeaderSchema.partial()), async (c) => {
    const id = Number(c.req.param('id'));
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
})

// DELETE /:id - Delete Segment Header (Cascade)
segmentationRoutes.delete('/:id', async (c) => {
    const id = Number(c.req.param('id'));
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
})

// ==========================================
// DETAILS ENDPOINTS
// ==========================================

// GET /:id/details - List Details
segmentationRoutes.get('/:id/details', async (c) => {
    const id = Number(c.req.param('id'));
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
})

// POST /:id/details - Create Detail
segmentationRoutes.post('/:id/details', zValidator('json', segmentDetailSchema), async (c) => {
    const id = Number(c.req.param('id'));
    if (isNaN(id)) return c.json({ error: 'Invalid ID' }, 400);
    const detailData = c.req.valid('json');

    try {
        const [newDetail] = await db.insert(frs9ParamSegmentd).values({
            ...detailData,
            segmentId: id,
            createdhost: 'localhost',
            createddate: new Date().toISOString(),
            createdby: 'SYSTEM' // data.createdby?
        }).returning();

        return c.json({ success: true, data: newDetail });
    } catch (error) {
        return c.json({ error: 'Failed to create detail' }, 500);
    }
})

// PUT /details/:detailId - Update Detail
segmentationRoutes.put('/details/:detailId', zValidator('json', segmentDetailSchema), async (c) => {
    const detailId = Number(c.req.param('detailId'));
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
})

// DELETE /details/:detailId - Delete Detail
segmentationRoutes.delete('/details/:detailId', async (c) => {
    const detailId = Number(c.req.param('detailId'));
    if (isNaN(detailId)) return c.json({ error: 'Invalid ID' }, 400);

    try {
        await db.delete(frs9ParamSegmentd).where(eq(frs9ParamSegmentd.pkid, detailId));
        return c.json({ success: true, message: 'Deleted' });
    } catch (error) {
        return c.json({ error: 'Failed to delete detail' }, 500);
    }
})
