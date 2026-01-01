import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { db } from '@/config'
import { productSegments } from '@/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import type { AppContext } from '@/app'
import { authMiddleware, tenantMiddleware } from '../middleware'

const app = new Hono<AppContext>()

// Apply auth and tenant middleware
app.use('*', authMiddleware)
app.use('*', tenantMiddleware)

// Validation schemas
const createSegmentSchema = z.object({
    groupSegment: z.string().min(1).max(100),
    segment: z.string().min(1).max(100),
    subSegment: z.string().min(1).max(100),
    segmentType: z.enum(['EAD Segment', 'LGD Segment', 'PD Segment', 'Portfolio Segment']),
    isActive: z.boolean().default(true),
    description: z.string().optional(),
    displayOrder: z.number().int().default(0),
})

const updateSegmentSchema = createSegmentSchema.partial()

// GET /api/v1/banking/parameters/product-segments
app.get('/', async (c) => {
    try {
        const tenantId = c.get('tenantId') as string

        const segments = await db
            .select()
            .from(productSegments)
            .where(eq(productSegments.tenantId, tenantId))
            .orderBy(desc(productSegments.displayOrder))

        return c.json({
            success: true,
            data: segments,
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
        const id = c.req.param('id')
        const tenantId = c.get('tenantId') as string

        const [segment] = await db
            .select()
            .from(productSegments)
            .where(
                and(
                    eq(productSegments.id, id),
                    eq(productSegments.tenantId, tenantId)
                )
            )

        if (!segment) {
            return c.json({
                success: false,
                message: 'Segment not found',
            }, 404)
        }

        return c.json({
            success: true,
            data: segment,
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
        const tenantId = c.get('tenantId') as string
        const userId = c.get('userId') as string
        const data = c.req.valid('json')

        const [segment] = await db
            .insert(productSegments)
            .values({
                groupSegment: data.groupSegment,
                segment: data.segment,
                subSegment: data.subSegment,
                segmentType: data.segmentType,
                isActive: data.isActive,
                description: data.description,
                displayOrder: data.displayOrder,
                tenantId,
                createdBy: userId,
                updatedBy: userId,
            })
            .returning()

        return c.json({
            success: true,
            data: segment,
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
        const id = c.req.param('id')
        const tenantId = c.get('tenantId') as string
        const userId = c.get('userId') as string
        const data = c.req.valid('json')

        const [updated] = await db
            .update(productSegments)
            .set({
                ...data,
                updatedBy: userId,
                updatedAt: new Date(),
            })
            .where(
                and(
                    eq(productSegments.id, id),
                    eq(productSegments.tenantId, tenantId)
                )
            )
            .returning()

        if (!updated) {
            return c.json({
                success: false,
                message: 'Segment not found',
            }, 404)
        }

        return c.json({
            success: true,
            data: updated,
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
        const id = c.req.param('id')
        const tenantId = c.get('tenantId') as string

        const [deleted] = await db
            .delete(productSegments)
            .where(
                and(
                    eq(productSegments.id, id),
                    eq(productSegments.tenantId, tenantId)
                )
            )
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
