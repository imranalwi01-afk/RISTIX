import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { legacyDb as db } from '@/config'
import { frs9ParamSegmenth } from '@/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import type { AppContext } from '@/app'
import { authMiddleware } from '../middleware'

const app = new Hono<AppContext>()

// Apply auth middleware only (Legacy tables don't support tenant isolation yet)
app.use('*', authMiddleware)

// Validation schemas
const createSegmentSchema = z.object({
    groupSegment: z.string().min(1).max(150),
    segment: z.string().min(1).max(150),
    subSegment: z.string().min(1).max(150),
    segmentType: z.enum(['EAD Segment', 'LGD Segment', 'PD Segment', 'Portfolio Segment']),
    isActive: z.boolean().default(true),
    // description: z.string().optional(), // Not supported in legacy schema
    displayOrder: z.number().int().default(0),
})

const updateSegmentSchema = createSegmentSchema.partial()

// Helper to transform legacy fields to frontend expected format
const transformSegment = (segment: typeof frs9ParamSegmenth.$inferSelect) => ({
    id: segment.pkid, // Map pkid to id
    groupSegment: segment.groupSegment,
    segment: segment.segment,
    subSegment: segment.subSegment,
    segmentType: segment.segmentType,
    isActive: segment.activeFlag,
    displayOrder: segment.seq,
    description: '', // Placeholder
    tenantId: 'legacy', // Placeholder
    createdBy: segment.createdby,
    updatedBy: segment.updatedby,
    createdAt: segment.createddate,
    updatedAt: segment.updateddate,
})

// GET /api/v1/banking/parameters/product-segments
app.get('/', async (c) => {
    try {
        // No tenant filtering for now
        const segments = await db
            .select()
            .from(frs9ParamSegmenth)
            .orderBy(desc(frs9ParamSegmenth.seq))

        return c.json({
            success: true,
            data: segments.map(transformSegment),
        })
    } catch (error) {
        console.error('Error fetching product segments:', error)
        return c.json({
            success: false,
            message: 'Failed to fetch product segments',
        }, 500)
    }
})

// GET /api/v1/banking/parameters/product-segments/:id
app.get('/:id', async (c) => {
    try {
        const id = Number(c.req.param('id'))
        if (isNaN(id)) return c.json({ error: 'Invalid ID' }, 400);

        const [segment] = await db
            .select()
            .from(frs9ParamSegmenth)
            .where(eq(frs9ParamSegmenth.pkid, id))

        if (!segment) {
            return c.json({
                success: false,
                message: 'Segment not found',
            }, 404)
        }

        return c.json({
            success: true,
            data: transformSegment(segment),
        })
    } catch (error) {
        console.error('Error fetching product segment:', error)
        return c.json({
            success: false,
            message: 'Failed to fetch product segment',
        }, 500)
    }
})

// POST /api/v1/banking/parameters/product-segments
app.post('/', zValidator('json', createSegmentSchema), async (c) => {
    try {
        const userId = c.get('userId') as string
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
        return c.json({
            success: false,
            message: 'Failed to create product segment',
        }, 500)
    }
})

// PUT /api/v1/banking/parameters/product-segments/:id
app.put('/:id', zValidator('json', updateSegmentSchema), async (c) => {
    try {
        const id = Number(c.req.param('id'))
        if (isNaN(id)) return c.json({ error: 'Invalid ID' }, 400);

        const userId = c.get('userId') as string
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
            return c.json({
                success: false,
                message: 'Segment not found',
            }, 404)
        }

        return c.json({
            success: true,
            data: transformSegment(updated),
            message: 'Product segment updated successfully',
        })
    } catch (error) {
        console.error('Error updating product segment:', error)
        return c.json({
            success: false,
            message: 'Failed to update product segment',
        }, 500)
    }
})

// DELETE /api/v1/banking/parameters/product-segments/:id
app.delete('/:id', async (c) => {
    try {
        const id = Number(c.req.param('id'))
        if (isNaN(id)) return c.json({ error: 'Invalid ID' }, 400);

        const [deleted] = await db
            .delete(frs9ParamSegmenth)
            .where(eq(frs9ParamSegmenth.pkid, id))
            .returning()

        if (!deleted) {
            return c.json({
                success: false,
                message: 'Segment not found',
            }, 404)
        }

        return c.json({
            success: true,
            message: 'Product segment deleted successfully',
        })
    } catch (error) {
        console.error('Error deleting product segment:', error)
        return c.json({
            success: false,
            message: 'Failed to delete product segment',
        }, 500)
    }
})

export default app
