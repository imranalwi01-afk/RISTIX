import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { db } from '@/config'
import { populationSegments } from '@/db/schema'
import { eq, and, like, desc } from 'drizzle-orm'
import type { AppContext } from '@/app'
import { authMiddleware, tenantMiddleware } from '../middleware'

const app = new Hono<AppContext>()

app.use('*', authMiddleware)
app.use('*', tenantMiddleware)

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const createSegmentSchema = z.object({
    segmentName: z.string().min(1).max(255),
    description: z.string().max(500).optional(),
    activeFlag: z.boolean().default(true),
})

const updateSegmentSchema = createSegmentSchema.partial()

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const transformSegment = (segment: any) => ({
    id: segment.id,
    segment_name: segment.segmentName,
    description: segment.description,
    active_flag: segment.activeFlag,
    created_by: segment.createdBy,
    updated_by: segment.updatedBy,
    created_date: segment.createdAt,
    updated_date: segment.updatedAt,
})

// ============================================================================
// ENDPOINTS
// ============================================================================

app.get('/', async (c) => {
    try {
        const tenantId = c.get('tenantId') as string
        const { search, active_flag } = c.req.query()

        const conditions = [eq(populationSegments.tenantId, tenantId)]

        if (search) {
            conditions.push(like(populationSegments.segmentName, `%${search}%`))
        }

        if (active_flag !== undefined) {
            conditions.push(eq(populationSegments.activeFlag, active_flag === 'true'))
        }

        const segments = await db
            .select()
            .from(populationSegments)
            .where(and(...conditions))
            .orderBy(populationSegments.segmentName)

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
        const id = c.req.param('id')
        const tenantId = c.get('tenantId') as string

        const [segment] = await db
            .select()
            .from(populationSegments)
            .where(and(eq(populationSegments.id, id), eq(populationSegments.tenantId, tenantId)))

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
        console.error('Error fetching population segment:', error)
        return c.json({
            success: false,
            message: 'Failed to fetch population segment',
        }, 500)
    }
})

app.post('/', zValidator('json', createSegmentSchema), async (c) => {
    try {
        const tenantId = c.get('tenantId') as string
        const userId = c.get('userId') as string
        const data = c.req.valid('json')

        const [segment] = await db
            .insert(populationSegments)
            .values({
                ...data,
                tenantId,
                createdBy: userId,
                updatedBy: userId,
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
        const id = c.req.param('id')
        const tenantId = c.get('tenantId') as string
        const userId = c.get('userId') as string
        const data = c.req.valid('json')

        const [updated] = await db
            .update(populationSegments)
            .set({
                ...data,
                updatedBy: userId,
                updatedAt: new Date(),
            })
            .where(and(eq(populationSegments.id, id), eq(populationSegments.tenantId, tenantId)))
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
        const id = c.req.param('id')
        const tenantId = c.get('tenantId') as string

        const [deleted] = await db
            .delete(populationSegments)
            .where(and(eq(populationSegments.id, id), eq(populationSegments.tenantId, tenantId)))
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
