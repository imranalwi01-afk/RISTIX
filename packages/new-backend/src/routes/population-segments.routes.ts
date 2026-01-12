import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { legacyDb as db } from '@/config'
import { frs9ParamSegmenth } from '@/db/schema'
import { eq, and, like, desc } from 'drizzle-orm'
import type { AppContext } from '@/app'
import { authMiddleware } from '../middleware'

const app = new Hono<AppContext>()

app.use('*', authMiddleware)
// Legacy tables do not support tenant isolation yet

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const createSegmentSchema = z.object({
    segmentName: z.string().min(1).max(150), // Limited to 150 chars in legacy
    description: z.string().optional(), // Not supported in legacy, but kept for API validation compatibility
    activeFlag: z.boolean().default(true),
})

const updateSegmentSchema = createSegmentSchema.partial()

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const transformSegment = (segment: typeof frs9ParamSegmenth.$inferSelect) => ({
    id: segment.pkid,
    segment_name: segment.segment,
    description: segment.subSegment || '', // Mapping subSegment to description as a fallback or just empty
    active_flag: segment.activeFlag,
    created_by: segment.createdby,
    updated_by: segment.updatedby,
    created_date: segment.createddate,
    updated_date: segment.updateddate,
})

// ============================================================================
// ENDPOINTS
// ============================================================================

app.get('/', async (c) => {
    try {
        const { search, active_flag } = c.req.query()
        const conditions = []

        if (search) {
            conditions.push(like(frs9ParamSegmenth.segment, `%${search}%`))
        }

        if (active_flag !== undefined) {
            conditions.push(eq(frs9ParamSegmenth.activeFlag, active_flag === 'true'))
        }

        const segments = await db
            .select()
            .from(frs9ParamSegmenth)
            .where(and(...conditions))
            .orderBy(frs9ParamSegmenth.segment)

        return c.json({
            success: true,
            data: segments.map(transformSegment),
        })
    } catch (error) {
        console.error('Error fetching population segments:', error)
        return c.json({
            success: false,
            message: 'Failed to fetch population segments',
        }, 500)
    }
})

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
                message: 'Population segment not found',
            }, 404)
        }

        return c.json({
            success: true,
            data: transformSegment(segment),
        })
    } catch (error) {
        return c.json({
            success: false,
            message: 'Failed to fetch population segment',
        }, 500)
    }
})

app.post('/', zValidator('json', createSegmentSchema), async (c) => {
    try {
        const userId = c.get('userId') as string
        const data = c.req.valid('json')

        // Legacy table requires createdhost, we'll mock it
        const [segment] = await db
            .insert(frs9ParamSegmenth)
            .values({
                segment: data.segmentName,
                // description not supported, maybe map to subSegment? 
                // Leaving subSegment empty for now or null
                activeFlag: data.activeFlag,
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
            message: 'Population segment created successfully',
        }, 201)
    } catch (error) {
        console.error('Error creating population segment:', error)
        return c.json({
            success: false,
            message: 'Failed to create population segment',
        }, 500)
    }
})

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

        if (data.segmentName) updateData.segment = data.segmentName
        if (data.activeFlag !== undefined) updateData.activeFlag = data.activeFlag

        const [updated] = await db
            .update(frs9ParamSegmenth)
            .set(updateData)
            .where(eq(frs9ParamSegmenth.pkid, id))
            .returning()

        if (!updated) {
            return c.json({
                success: false,
                message: 'Population segment not found',
            }, 404)
        }

        return c.json({
            success: true,
            data: transformSegment(updated),
            message: 'Population segment updated successfully',
        })
    } catch (error) {
        console.error('Error updating population segment:', error)
        return c.json({
            success: false,
            message: 'Failed to update population segment',
        }, 500)
    }
})

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
                message: 'Population segment not found',
            }, 404)
        }

        return c.json({
            success: true,
            message: 'Population segment deleted successfully',
        })
    } catch (error) {
        console.error('Error deleting population segment:', error)
        return c.json({
            success: false,
            message: 'Failed to delete population segment',
        }, 500)
    }
})

export default app
