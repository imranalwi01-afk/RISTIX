import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { db } from '@/config'
import { frs9ParamBucketh, frs9ParamBucketd } from '@/db/schema'
import { eq, and, desc, like, or, asc } from 'drizzle-orm'
import type { AppContext } from '@/app'
import { authMiddleware } from '../middleware'

const app = new Hono<AppContext>()

app.use('*', authMiddleware)

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const createHeaderSchema = z.object({
    bucket_group: z.string().min(1).max(30),
    bucket_group_desc: z.string().max(255).optional(),
    basis: z.string().max(20).default('D'),
    include_close: z.boolean().default(false),
    include_wo: z.boolean().default(false),
    active_flag: z.boolean().default(true), // Legacy table doesn't have it, but frontend sends it
    // bucket_default: z.number().int().optional()
})

const updateHeaderSchema = createHeaderSchema.partial()

const createDetailSchema = z.object({
    bucket_name: z.string().min(1).max(100),
    range_start: z.number().int(),
    range_end: z.number().int().optional().nullable(),
    seq: z.number().int().optional(), // Maps to bucketId (business ID)?
    active_flag: z.boolean().default(true)
})

const updateDetailSchema = createDetailSchema.partial()

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const transformHeader = (header: typeof frs9ParamBucketh.$inferSelect) => ({
    id: header.pkid,
    bucket_group: header.bucketGroup,
    bucket_group_desc: header.bucketDesc,
    basis: header.basis || 'D',
    include_close: header.closedFlag,
    include_wo: header.woFlag,
    active_flag: true, // Not in schema
    created_by: header.createdby,
    updated_by: header.updatedby,
    created_date: header.createddate,
    updated_date: header.updateddate,
})

const transformDetail = (detail: typeof frs9ParamBucketd.$inferSelect) => ({
    id: detail.pkid,
    bucket_id: detail.pkidHeader,
    bucket_name: detail.bucketName,
    range_start: detail.rangeStart,
    range_end: detail.rangeEnd,
    seq: detail.bucketId, // Using bucketId as sequence/order
    active_flag: true, // Not in schema
    created_by: detail.createdby,
    updated_by: detail.updatedby,
    created_date: detail.createddate,
    updated_date: detail.updateddate,
})

// ============================================================================
// ROUTES
// ============================================================================

// GET /api/v1/banking/collective/bucket
app.get('/', async (c) => {
    try {
        const { search, basis } = c.req.query()
        const conditions = []

        if (search) {
            conditions.push(
                or(
                    like(frs9ParamBucketh.bucketGroup, `%${search}%`),
                    like(frs9ParamBucketh.bucketDesc, `%${search}%`)
                )!
            )
        }

        if (basis) {
            conditions.push(eq(frs9ParamBucketh.basis, basis))
        }

        const headers = await db
            .select()
            .from(frs9ParamBucketh)
            .where(and(...conditions))
            .orderBy(desc(frs9ParamBucketh.createddate))

        return c.json({
            success: true,
            data: headers.map(transformHeader)
        })
    } catch (error) {
        console.error('Error fetching bucket headers:', error)
        return c.json({ success: false, message: 'Failed to fetch bucket headers' }, 500)
    }
})

// GET /api/v1/banking/collective/bucket/:id
app.get('/:id', async (c) => {
    try {
        const id = Number(c.req.param('id'))
        if (isNaN(id)) return c.json({ error: 'Invalid ID' }, 400);

        const [header] = await db
            .select()
            .from(frs9ParamBucketh)
            .where(eq(frs9ParamBucketh.pkid, id))

        if (!header) {
            return c.json({ success: false, message: 'Bucket header not found' }, 404)
        }

        return c.json({ success: true, data: transformHeader(header) })
    } catch (error) {
        return c.json({ success: false, message: 'Failed to fetch bucket header' }, 500)
    }
})

// POST /api/v1/banking/collective/bucket
app.post('/', zValidator('json', createHeaderSchema), async (c) => {
    try {
        const userId = 'SYSTEM'
        const data = c.req.valid('json')

        const [header] = await db
            .insert(frs9ParamBucketh)
            .values({
                bucketGroup: data.bucket_group,
                bucketDesc: data.bucket_group_desc || '',
                basis: data.basis,
                closedFlag: data.include_close,
                woFlag: data.include_wo,
                // activeFlag is ignored as it's missing in schema
                createdby: userId,
                createdhost: 'localhost',
                createddate: new Date().toISOString(),
                updatedby: userId,
                updatedhost: 'localhost',
                updateddate: new Date().toISOString()
            })
            .returning()

        return c.json({ success: true, data: transformHeader(header) }, 201)
    } catch (error) {
        console.error('Error creating bucket header:', error)
        return c.json({ success: false, message: 'Failed to create bucket header' }, 500)
    }
})

// PUT /api/v1/banking/collective/bucket/:id
app.put('/:id', zValidator('json', updateHeaderSchema), async (c) => {
    try {
        const id = Number(c.req.param('id'))
        if (isNaN(id)) return c.json({ error: 'Invalid ID' }, 400);
        const userId = 'SYSTEM'
        const data = c.req.valid('json')

        const [updated] = await db
            .update(frs9ParamBucketh)
            .set({
                bucketGroup: data.bucket_group,
                bucketDesc: data.bucket_group_desc,
                basis: data.basis,
                closedFlag: data.include_close,
                woFlag: data.include_wo,
                updatedby: userId,
                updateddate: new Date().toISOString(),
                updatedhost: 'localhost'
            })
            .where(eq(frs9ParamBucketh.pkid, id))
            .returning()

        if (!updated) {
            return c.json({ success: false, message: 'Bucket header not found' }, 404)
        }

        return c.json({ success: true, data: transformHeader(updated) })
    } catch (error) {
        return c.json({ success: false, message: 'Failed to update bucket header' }, 500)
    }
})

// DELETE /api/v1/banking/collective/bucket/:id
app.delete('/:id', async (c) => {
    try {
        const id = Number(c.req.param('id'))
        if (isNaN(id)) return c.json({ error: 'Invalid ID' }, 400);

        await db.transaction(async (tx) => {
            await tx.delete(frs9ParamBucketd).where(eq(frs9ParamBucketd.pkidHeader, id))
            await tx.delete(frs9ParamBucketh).where(eq(frs9ParamBucketh.pkid, id))
        })

        return c.json({ success: true, message: 'Deleted successfully' })
    } catch (error) {
        return c.json({ success: false, message: 'Failed to delete bucket header' }, 500)
    }
})

// ============================================================================
// DETAILS ROUTES
// ============================================================================

// GET /api/v1/banking/collective/bucket/:id/details
app.get('/:id/details', async (c) => {
    try {
        const id = Number(c.req.param('id'))
        if (isNaN(id)) return c.json({ error: 'Invalid ID' }, 400);

        const details = await db
            .select()
            .from(frs9ParamBucketd)
            .where(eq(frs9ParamBucketd.pkidHeader, id))
            .orderBy(asc(frs9ParamBucketd.rangeStart))

        return c.json({ success: true, data: details.map(transformDetail) })
    } catch (error) {
        return c.json({ success: false, message: 'Failed to fetch details' }, 500)
    }
})

// POST /api/v1/banking/collective/bucket/:id/details
app.post('/:id/details', zValidator('json', createDetailSchema), async (c) => {
    try {
        const id = Number(c.req.param('id'))
        if (isNaN(id)) return c.json({ error: 'Invalid ID' }, 400);
        const userId = 'SYSTEM'
        const data = c.req.valid('json')

        const [detail] = await db
            .insert(frs9ParamBucketd)
            .values({
                pkidHeader: id,
                bucketName: data.bucket_name,
                rangeStart: data.range_start,
                rangeEnd: data.range_end,
                bucketId: data.seq, // Using seq as bucketId
                createdby: userId,
                createdhost: 'localhost',
                createddate: new Date().toISOString(),
                updatedby: userId,
                updatedhost: 'localhost',
                updateddate: new Date().toISOString()
            })
            .returning()

        return c.json({ success: true, data: transformDetail(detail) }, 201)
    } catch (error) {
        console.error('Error creating detail:', error)
        return c.json({ success: false, message: 'Failed to create detail' }, 500)
    }
})

// PUT /api/v1/banking/collective/bucket/details/:detailId
app.put('/details/:detailId', zValidator('json', updateDetailSchema), async (c) => {
    try {
        const detailId = Number(c.req.param('detailId'))
        if (isNaN(detailId)) return c.json({ error: 'Invalid ID' }, 400);
        const userId = 'SYSTEM'
        const data = c.req.valid('json')

        const [updated] = await db
            .update(frs9ParamBucketd)
            .set({
                bucketName: data.bucket_name,
                rangeStart: data.range_start,
                rangeEnd: data.range_end,
                bucketId: data.seq,
                updatedby: userId,
                updateddate: new Date().toISOString(),
                updatedhost: 'localhost'
            })
            .where(eq(frs9ParamBucketd.pkid, detailId))
            .returning()

        if (!updated) {
            return c.json({ success: false, message: 'Detail not found' }, 404)
        }

        return c.json({ success: true, data: transformDetail(updated) })
    } catch (error) {
        return c.json({ success: false, message: 'Failed to update detail' }, 500)
    }
})

// DELETE /api/v1/banking/collective/bucket/details/:detailId
app.delete('/details/:detailId', async (c) => {
    try {
        const detailId = Number(c.req.param('detailId'))
        if (isNaN(detailId)) return c.json({ error: 'Invalid ID' }, 400);

        await db.delete(frs9ParamBucketd).where(eq(frs9ParamBucketd.pkid, detailId))

        return c.json({ success: true, message: 'Deleted' })
    } catch (error) {
        return c.json({ success: false, message: 'Failed to delete detail' }, 500)
    }
})

export default app
