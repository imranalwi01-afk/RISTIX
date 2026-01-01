import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { db } from '@/config'
import { frs9ImpCaPdConfig, frs9ParamSegmenth } from '@/db/schema'
import { eq, and, desc, like, or } from 'drizzle-orm'
import type { AppContext } from '@/app'
import { authMiddleware } from '../middleware'

const app = new Hono<AppContext>()

app.use('*', authMiddleware)
// Tenant middleware removed for legacy table support

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const createPdConfigSchema = z.object({
    model_name: z.string().min(1).max(250),
    population_segment_id: z.union([z.number(), z.string().transform(val => parseInt(val))]),
    selected_method: z.number().int(),
    migration_interval: z.number().int(),
    population_type: z.number().int(),
    historical_month: z.number().int(),
    first_historical_date: z.string().optional(), // YYYY-MM-DD
    multiplication: z.number().int().optional(),
    fl_flag: z.boolean().default(false),
    ia_flag: z.boolean().default(false),
    bucket: z.string().max(30).optional(), // bucketGroup
    is_active: z.boolean().default(true)
})

const updatePdConfigSchema = createPdConfigSchema.partial()

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const transformPdConfig = (config: any, segmentName?: string) => ({
    id: config.pkid,
    model_name: config.pdModelName,
    population_segment_id: config.segmentId,
    population_segment_desc: segmentName || '', // Fetch if possible or leave empty
    selected_method: parseInt(config.pdMethod || '0'),
    migration_interval: config.interval,
    population_type: parseInt(config.populationType || '0'),
    historical_month: config.observationPeriod,
    first_historical_date: config.observationStartDate ? new Date(config.observationStartDate).toISOString().split('T')[0] : null,
    multiplication: config.multiplication,
    fl_flag: config.flFlag,
    fl_scalar_id: config.flScalarId,
    ia_flag: config.iaFlag,
    bucket: config.bucketGroup,
    is_active: config.activeFlag,
    created_by: config.createdby,
    updated_by: config.updatedby,
    created_date: config.createddate,
    updated_date: config.updateddate,
})

// ============================================================================
// ROUTES
// ============================================================================

// GET /api/v1/banking/parameters/pd-configurations
app.get('/', async (c) => {
    try {
        const { search, selected_method, bucket, is_active } = c.req.query()
        const conditions = []

        if (search) {
            conditions.push(
                or(
                    like(frs9ImpCaPdConfig.pdModelName, `%${search}%`),
                    // like(frs9ImpCaPdConfig.bucketGroup, `%${search}%`) // optional
                )!
            )
        }

        if (selected_method) {
            conditions.push(eq(frs9ImpCaPdConfig.pdMethod, String(selected_method)))
        }

        if (bucket) {
            conditions.push(eq(frs9ImpCaPdConfig.bucketGroup, bucket))
        }

        if (is_active !== undefined) {
            conditions.push(eq(frs9ImpCaPdConfig.activeFlag, is_active === 'true'))
        }

        const configs = await db
            .select()
            .from(frs9ImpCaPdConfig)
            .where(and(...conditions))
            .orderBy(desc(frs9ImpCaPdConfig.createddate))

        // Optional: Join with segment table to get names?
        // Ideally yes, but let's keep it simple first. Frontend often matches IDs itself.
        // Frontend "enrichedConfigs" logic:
        // const segment = segmentsRes.find(s => s.id === config.population_segment_id);

        return c.json({
            success: true,
            data: configs.map(c => transformPdConfig(c)),
        })
    } catch (error) {
        console.error('Error fetching PD configurations:', error)
        return c.json({ success: false, message: 'Failed to fetch PD configurations' }, 500)
    }
})

// GET /api/v1/banking/parameters/pd-configurations/:id
app.get('/:id', async (c) => {
    try {
        const id = Number(c.req.param('id'))
        if (isNaN(id)) return c.json({ error: 'Invalid ID' }, 400);

        const [config] = await db
            .select()
            .from(frs9ImpCaPdConfig)
            .where(eq(frs9ImpCaPdConfig.pkid, id))

        if (!config) {
            return c.json({ success: false, message: 'PD configuration not found' }, 404)
        }

        return c.json({ success: true, data: transformPdConfig(config) })
    } catch (error) {
        return c.json({ success: false, message: 'Failed to fetch PD configuration' }, 500)
    }
})

// POST /api/v1/banking/parameters/pd-configurations
app.post('/', zValidator('json', createPdConfigSchema), async (c) => {
    try {
        const userId = 'SYSTEM'
        const data = c.req.valid('json')

        const [config] = await db
            .insert(frs9ImpCaPdConfig)
            .values({
                pdModelName: data.model_name,
                segmentId: data.population_segment_id,
                pdMethod: String(data.selected_method),
                interval: data.migration_interval,
                populationType: String(data.population_type),
                observationPeriod: data.historical_month,
                observationStartDate: data.first_historical_date ? new Date(data.first_historical_date).toISOString() : null,
                multiplication: data.multiplication,
                flFlag: data.fl_flag,
                iaFlag: data.ia_flag,
                bucketGroup: data.bucket,
                activeFlag: data.is_active,
                createdby: userId,
                createdhost: 'localhost',
                createddate: new Date().toISOString(),
                updatedby: userId,
                updatedhost: 'localhost',
                updateddate: new Date().toISOString()
            })
            .returning()

        return c.json({ success: true, data: transformPdConfig(config) }, 201)
    } catch (error) {
        console.error('Error creating PD configuration:', error)
        return c.json({ success: false, message: 'Failed to create PD configuration' }, 500)
    }
})

// PUT /api/v1/banking/parameters/pd-configurations/:id
app.put('/:id', zValidator('json', updatePdConfigSchema), async (c) => {
    try {
        const id = Number(c.req.param('id'))
        if (isNaN(id)) return c.json({ error: 'Invalid ID' }, 400);
        const userId = 'SYSTEM'
        const data = c.req.valid('json')

        const updateData: any = {
            updatedby: userId,
            updateddate: new Date().toISOString(),
            updatedhost: 'localhost'
        }

        if (data.model_name) updateData.pdModelName = data.model_name
        if (data.population_segment_id) updateData.segmentId = data.population_segment_id
        if (data.selected_method) updateData.pdMethod = String(data.selected_method)
        if (data.migration_interval) updateData.interval = data.migration_interval
        if (data.population_type) updateData.populationType = String(data.population_type)
        if (data.historical_month) updateData.observationPeriod = data.historical_month
        if (data.first_historical_date) updateData.observationStartDate = new Date(data.first_historical_date).toISOString()
        if (data.multiplication !== undefined) updateData.multiplication = data.multiplication
        if (data.fl_flag !== undefined) updateData.flFlag = data.fl_flag
        if (data.ia_flag !== undefined) updateData.iaFlag = data.ia_flag
        if (data.bucket) updateData.bucketGroup = data.bucket
        if (data.is_active !== undefined) updateData.activeFlag = data.is_active

        const [updated] = await db
            .update(frs9ImpCaPdConfig)
            .set(updateData)
            .where(eq(frs9ImpCaPdConfig.pkid, id))
            .returning()

        if (!updated) {
            return c.json({ success: false, message: 'PD configuration not found' }, 404)
        }

        return c.json({ success: true, data: transformPdConfig(updated) })
    } catch (error) {
        console.error('Error updating PD configuration:', error)
        return c.json({ success: false, message: 'Failed to update PD configuration' }, 500)
    }
})

// DELETE /api/v1/banking/parameters/pd-configurations/:id
app.delete('/:id', async (c) => {
    try {
        const id = Number(c.req.param('id'))
        if (isNaN(id)) return c.json({ error: 'Invalid ID' }, 400);

        await db.delete(frs9ImpCaPdConfig).where(eq(frs9ImpCaPdConfig.pkid, id))

        return c.json({ success: true, message: 'Deleted' })
    } catch (error) {
        return c.json({ success: false, message: 'Failed to delete PD configuration' }, 500)
    }
})

// ============================================================================
// METADATA ENDPOINTS
// ============================================================================

// GET /api/v1/banking/parameters/pd-configurations/metadata/methods
app.get('/metadata/methods', async (c) => {
    return c.json({
        success: true,
        data: [
            { value: 1, label: 'NOA Migration' },
            { value: 3, label: 'Proxy PD' },
        ]
    })
})

// GET /api/v1/banking/parameters/pd-configurations/metadata/population-types
app.get('/metadata/population-types', async (c) => {
    return c.json({
        success: true,
        data: [
            { value: 2, label: 'Window Moving Period' },
        ]
    })
})

export default app
