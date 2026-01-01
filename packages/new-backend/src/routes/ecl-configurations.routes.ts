import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { db } from '@/config'
import { frs9ImpCaEclConfigh, frs9ImpCaEclConfigd } from '@/db/schema'
import { eq, desc, inArray } from 'drizzle-orm'
import type { AppContext } from '@/app'
import { authMiddleware } from '../middleware'

const app = new Hono<AppContext>()

app.use('*', authMiddleware)

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const eclDetailSchema = z.object({
    pkid: z.number().int().optional(),
    pfSegmentId: z.number().int().optional(),
    stageRuleId: z.number().int().optional(),
    pdModelId: z.number().int().optional(),
    lgdModelId: z.number().int().optional(),
    eadModelId: z.number().int().optional(),
    overlayRate: z.number().optional().default(100),
    periodType: z.number().int().optional(),
    periodDate: z.string().optional(),
})

const createEclConfigSchema = z.object({
    modelName: z.string().min(1).max(50),
    module: z.string().max(10).optional(),
    effectiveDate: z.string(), // date string
    activeFlag: z.boolean().default(true),
    details: z.array(eclDetailSchema).optional(),
})

const updateEclConfigSchema = createEclConfigSchema.partial()

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const transformHeader = (header: typeof frs9ImpCaEclConfigh.$inferSelect) => ({
    id: header.pkid,
    model_name: header.eclModelName,
    module: header.module,
    effective_date: header.effectiveDate,
    active_flag: header.activeFlag,
    last_run_period: header.lastRunPeriod,
    last_run_status: header.lastRunStatus,
    last_run_date: header.lastRunDate,
    created_by: header.createdby,
    created_date: header.createddate,
})

const transformDetail = (detail: typeof frs9ImpCaEclConfigd.$inferSelect) => ({
    id: detail.pkid,
    pf_segment_id: detail.pfSegmentId,
    stage_rule_id: detail.stageRuleId,
    pd_model_id: detail.pdModelId,
    lgd_model_id: detail.lgdModelId,
    ead_model_id: detail.eadModelId,
    overlay_rate: detail.overlayRate,
    period_type: detail.periodType,
    period_date: detail.periodDate,
})

// ============================================================================
// ENDPOINTS
// ============================================================================

// GET /api/v1/banking/collective/ecl-configurations
app.get('/', async (c) => {
    try {
        const configs = await db
            .select()
            .from(frs9ImpCaEclConfigh)
            .orderBy(desc(frs9ImpCaEclConfigh.createddate))

        // Optional: Fetch details count or summary if needed
        return c.json({
            success: true,
            data: configs.map(transformHeader),
        })
    } catch (error) {
        console.error('Error fetching ECL configs:', error)
        return c.json({ success: false, message: 'Failed to fetch ECL configurations' }, 500)
    }
})

// GET /api/v1/banking/collective/ecl-configurations/:id
app.get('/:id', async (c) => {
    try {
        const id = Number(c.req.param('id'))
        if (isNaN(id)) return c.json({ error: 'Invalid ID' }, 400);

        const [header] = await db
            .select()
            .from(frs9ImpCaEclConfigh)
            .where(eq(frs9ImpCaEclConfigh.pkid, id))

        if (!header) {
            return c.json({ success: false, message: 'Configuration not found' }, 404)
        }

        const details = await db
            .select()
            .from(frs9ImpCaEclConfigd)
            .where(eq(frs9ImpCaEclConfigd.eclModelId, id))

        return c.json({
            success: true,
            data: {
                ...transformHeader(header),
                details: details.map(transformDetail)
            }
        })
    } catch (error) {
        console.error('Error fetching ECL config:', error)
        return c.json({ success: false, message: 'Failed to fetch ECL configuration' }, 500)
    }
})

// POST /api/v1/banking/collective/ecl-configurations
app.post('/', zValidator('json', createEclConfigSchema), async (c) => {
    try {
        const userId = 'SYSTEM'
        const data = c.req.valid('json')

        // Transaction
        const result = await db.transaction(async (tx) => {
            const [header] = await tx
                .insert(frs9ImpCaEclConfigh)
                .values({
                    eclModelName: data.modelName,
                    module: data.module,
                    effectiveDate: data.effectiveDate,
                    activeFlag: data.activeFlag,
                    createdby: userId,
                    createdhost: 'localhost',
                    createddate: new Date().toISOString(),
                    updatedby: userId,
                    updatedhost: 'localhost',
                    updateddate: new Date().toISOString()
                })
                .returning()

            if (data.details && data.details.length > 0) {
                await tx.insert(frs9ImpCaEclConfigd).values(
                    data.details.map(d => ({
                        eclModelId: header.pkid,
                        pfSegmentId: d.pfSegmentId,
                        stageRuleId: d.stageRuleId,
                        pdModelId: d.pdModelId,
                        lgdModelId: d.lgdModelId,
                        eadModelId: d.eadModelId,
                        overlayRate: d.overlayRate,
                        periodType: d.periodType,
                        periodDate: d.periodDate,
                        createdby: userId,
                        createdhost: 'localhost',
                        createddate: new Date().toISOString(),
                        updatedby: userId,
                        updatedhost: 'localhost',
                        updateddate: new Date().toISOString()
                    }))
                )
            }
            return header
        })

        // Fetch complete object
        const details = await db
            .select()
            .from(frs9ImpCaEclConfigd)
            .where(eq(frs9ImpCaEclConfigd.eclModelId, result.pkid))

        return c.json({
            success: true,
            data: {
                ...transformHeader(result),
                details: details.map(transformDetail)
            },
            message: 'ECL configuration created successfully',
        }, 201)

    } catch (error) {
        console.error('Error creating ECL config:', error)
        return c.json({ success: false, message: 'Failed to create ECL configuration' }, 500)
    }
})

// PUT /api/v1/banking/collective/ecl-configurations/:id
app.put('/:id', zValidator('json', updateEclConfigSchema), async (c) => {
    try {
        const id = Number(c.req.param('id'))
        if (isNaN(id)) return c.json({ error: 'Invalid ID' }, 400);
        const userId = 'SYSTEM'
        const data = c.req.valid('json')

        const result = await db.transaction(async (tx) => {
            // Update Header
            const [header] = await tx
                .update(frs9ImpCaEclConfigh)
                .set({
                    eclModelName: data.modelName,
                    module: data.module,
                    effectiveDate: data.effectiveDate,
                    activeFlag: data.activeFlag,
                    updatedby: userId,
                    updateddate: new Date().toISOString(),
                    updatedhost: 'localhost',
                })
                .where(eq(frs9ImpCaEclConfigh.pkid, id))
                .returning()

            if (!header) throw new Error('Header not found')

            // Update Details (Full Replace Strategy for simplicity, or smart update)
            // For now, let's delete existing for this header and re-insert if details provided
            if (data.details) {
                await tx.delete(frs9ImpCaEclConfigd).where(eq(frs9ImpCaEclConfigd.eclModelId, id))

                if (data.details.length > 0) {
                    await tx.insert(frs9ImpCaEclConfigd).values(
                        data.details.map(d => ({
                            eclModelId: header.pkid,
                            pfSegmentId: d.pfSegmentId,
                            stageRuleId: d.stageRuleId,
                            pdModelId: d.pdModelId,
                            lgdModelId: d.lgdModelId,
                            eadModelId: d.eadModelId,
                            overlayRate: d.overlayRate,
                            periodType: d.periodType,
                            periodDate: d.periodDate,
                            createdby: userId,
                            createdhost: 'localhost',
                            createddate: new Date().toISOString(),
                            updatedby: userId,
                            updatedhost: 'localhost',
                            updateddate: new Date().toISOString()
                        }))
                    )
                }
            }
            return header
        })

        const details = await db
            .select()
            .from(frs9ImpCaEclConfigd)
            .where(eq(frs9ImpCaEclConfigd.eclModelId, id))

        return c.json({
            success: true,
            data: {
                ...transformHeader(result),
                details: details.map(transformDetail)
            },
            message: 'ECL configuration updated successfully',
        })

    } catch (error) {
        console.error('Error updating ECL config:', error)
        return c.json({ success: false, message: 'Failed to update ECL configuration' }, 500)
    }
})

// DELETE /api/v1/banking/collective/ecl-configurations/:id
app.delete('/:id', async (c) => {
    try {
        const id = Number(c.req.param('id'))
        if (isNaN(id)) return c.json({ error: 'Invalid ID' }, 400);

        await db.transaction(async (tx) => {
            // Delete details first (FK constraint usually handles this if cascade is set, but better safe)
            await tx.delete(frs9ImpCaEclConfigd).where(eq(frs9ImpCaEclConfigd.eclModelId, id))
            await tx.delete(frs9ImpCaEclConfigh).where(eq(frs9ImpCaEclConfigh.pkid, id))
        })

        return c.json({ success: true, message: 'ECL configuration deleted successfully' })
    } catch (error) {
        console.error('Error deleting ECL config:', error)
        return c.json({ success: false, message: 'Failed to delete ECL configuration' }, 500)
    }
})

export default app
