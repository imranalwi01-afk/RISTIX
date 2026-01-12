import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { legacyDb as db } from '@/config'
import { frs9ImpCaFlScalarh, frs9ImpCaFlScalard } from '@/db/schema'
import { eq, desc, inArray } from 'drizzle-orm'
import type { AppContext } from '@/app'
import { authMiddleware } from '../middleware'

const app = new Hono<AppContext>()

app.use('*', authMiddleware)

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const createDetailSchema = z.object({
    period: z.number().int().min(1),
    weighted_scalar: z.number().min(0)
})

const createSchema = z.object({
    scalar_name: z.string().min(1).max(30),
    active_flag: z.boolean().default(true),
    details: z.array(createDetailSchema).optional().default([])
})

const updateSchema = createSchema.partial()

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const transformHeader = (header: typeof frs9ImpCaFlScalarh.$inferSelect, details: (typeof frs9ImpCaFlScalard.$inferSelect)[] = []) => ({
    pkid: header.pkid,
    scalar_name: header.scalarName,
    active_flag: header.activeFlag,
    created_by: header.createdby,
    created_date: header.createddate,
    created_host: header.createdhost,
    updated_by: header.updatedby,
    updated_date: header.updateddate,
    updated_host: header.updatedhost,
    details: details.map(d => ({
        pkid: d.pkid,
        scalar_id: d.scalarId,
        period: d.period,
        weighted_scalar: d.weightedScalar,
        created_by: d.createdby,
        created_date: d.createddate,
        created_host: d.createdhost,
        updated_by: d.updatedby,
        updated_date: d.updateddate,
        updated_host: d.updatedhost
    }))
})

// ============================================================================
// ROUTES
// ============================================================================

// GET /api/v1/banking/collective/fl-scalar
app.get('/', async (c) => {
    try {
        // Fetch all headers
        const headers = await db
            .select()
            .from(frs9ImpCaFlScalarh)
            .orderBy(desc(frs9ImpCaFlScalarh.createddate))

        // Fetch all details if headers exist
        let allDetails: (typeof frs9ImpCaFlScalard.$inferSelect)[] = []
        if (headers.length > 0) {
            const headerIds = headers.map(h => h.pkid)
            allDetails = await db
                .select()
                .from(frs9ImpCaFlScalard)
                .where(inArray(frs9ImpCaFlScalard.scalarId, headerIds))
        }

        // Map details to headers
        const result = headers.map(header => {
            const details = allDetails.filter(d => d.scalarId === header.pkid)
            return transformHeader(header, details)
        })

        return c.json({
            success: true,
            data: result,
            total: result.length,
            database_info: {
                database: 'DS2 FRS9PRO',
                tables: ['frs9_imp_ca_fl_scalarh', 'frs9_imp_ca_fl_scalard']
            }
        })
    } catch (error: any) {
        console.error('Error fetching FL scalars:', error)
        return c.json({
            success: false,
            message: `Failed to load FL Scalars from database: ${error.message}`,
            details: error.stack
        }, 500)
    }
})

// GET /api/v1/banking/collective/fl-scalar/:id
app.get('/:id', async (c) => {
    try {
        const id = Number(c.req.param('id'))
        if (isNaN(id)) return c.json({ error: 'Invalid ID' }, 400);

        const [header] = await db
            .select()
            .from(frs9ImpCaFlScalarh)
            .where(eq(frs9ImpCaFlScalarh.pkid, id))

        if (!header) {
            return c.json({ success: false, message: 'FL Scalar not found' }, 404)
        }

        const details = await db
            .select()
            .from(frs9ImpCaFlScalard)
            .where(eq(frs9ImpCaFlScalard.scalarId, id))

        return c.json({ success: true, data: transformHeader(header, details) })
    } catch (error) {
        return c.json({ success: false, message: 'Failed to fetch FL scalar' }, 500)
    }
})

// POST /api/v1/banking/collective/fl-scalar
app.post('/', zValidator('json', createSchema), async (c) => {
    try {
        const userId = 'SYSTEM' // TODO: Get from auth context
        const data = c.req.valid('json')

        // Transaction to save header and details
        const result = await db.transaction(async (tx) => {
            // 1. Insert Header
            const [header] = await tx
                .insert(frs9ImpCaFlScalarh)
                .values({
                    scalarName: data.scalar_name,
                    activeFlag: data.active_flag,
                    createdby: userId,
                    createdhost: 'localhost',
                    createddate: new Date().toISOString(),
                    updatedby: userId,
                    updatedhost: 'localhost',
                    updateddate: new Date().toISOString()
                })
                .returning()

            // 2. Insert Details if any
            let details: (typeof frs9ImpCaFlScalard.$inferSelect)[] = []
            if (data.details && data.details.length > 0) {
                details = await tx
                    .insert(frs9ImpCaFlScalard)
                    .values(data.details.map(d => ({
                        scalarId: header.pkid,
                        period: d.period,
                        weightedScalar: d.weighted_scalar,
                        createdby: userId,
                        createdhost: 'localhost',
                        createddate: new Date().toISOString(),
                        updatedby: userId,
                        updatedhost: 'localhost',
                        updateddate: new Date().toISOString()
                    })))
                    .returning()
            }

            return transformHeader(header, details)
        })

        return c.json({ success: true, data: result }, 201)
    } catch (error) {
        console.error('Error creating FL scalar:', error)
        return c.json({ success: false, message: 'Failed to create FL scalar' }, 500)
    }
})

// PUT /api/v1/banking/collective/fl-scalar/:id
app.put('/:id', zValidator('json', updateSchema), async (c) => {
    try {
        const id = Number(c.req.param('id'))
        if (isNaN(id)) return c.json({ error: 'Invalid ID' }, 400);
        const userId = 'SYSTEM'
        const data = c.req.valid('json')

        const result = await db.transaction(async (tx) => {
            // 1. Update Header
            const [header] = await tx
                .update(frs9ImpCaFlScalarh)
                .set({
                    scalarName: data.scalar_name,
                    activeFlag: data.active_flag,
                    updatedby: userId,
                    updateddate: new Date().toISOString(),
                    updatedhost: 'localhost'
                })
                .where(eq(frs9ImpCaFlScalarh.pkid, id))
                .returning()

            if (!header) {
                throw new Error('FL Scalar not found')
            }

            // 2. Update Details (Full Replace Strategy for simplicity)
            // First delete existing details
            await tx
                .delete(frs9ImpCaFlScalard)
                .where(eq(frs9ImpCaFlScalard.scalarId, id))

            // Then insert new details
            let details: (typeof frs9ImpCaFlScalard.$inferSelect)[] = []
            if (data.details && data.details.length > 0) {
                details = await tx
                    .insert(frs9ImpCaFlScalard)
                    .values(data.details.map(d => ({
                        scalarId: id,
                        period: d.period,
                        weightedScalar: d.weighted_scalar,
                        createdby: userId,
                        createdhost: 'localhost',
                        createddate: new Date().toISOString(),
                        updatedby: userId,
                        updatedhost: 'localhost',
                        updateddate: new Date().toISOString()
                    })))
                    .returning()
            }

            return transformHeader(header, details)
        })

        return c.json({ success: true, data: result })
    } catch (error: any) {
        console.error('Error updating FL scalar:', error)
        if (error.message === 'FL Scalar not found') {
            return c.json({ success: false, message: 'FL Scalar not found' }, 404)
        }
        return c.json({ success: false, message: 'Failed to update FL scalar' }, 500)
    }
})

// DELETE /api/v1/banking/collective/fl-scalar/:id
app.delete('/:id', async (c) => {
    try {
        const id = Number(c.req.param('id'))
        if (isNaN(id)) return c.json({ error: 'Invalid ID' }, 400);

        await db.transaction(async (tx) => {
            // Delete details first (FK constraint)
            await tx.delete(frs9ImpCaFlScalard).where(eq(frs9ImpCaFlScalard.scalarId, id))
            // Delete header
            await tx.delete(frs9ImpCaFlScalarh).where(eq(frs9ImpCaFlScalarh.pkid, id))
        })

        return c.json({ success: true, message: 'Deleted successfully' })
    } catch (error) {
        return c.json({ success: false, message: 'Failed to delete FL scalar' }, 500)
    }
})

export default app
