import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { legacyDb as db } from '../config'
import { frs9ImpCaLgdConfig } from '../db/schema'
import { eq, and, like } from 'drizzle-orm'
import type { AppContext } from '../app'
import { authMiddleware } from '../middleware'

const app = new Hono<AppContext>()

// Apply auth middleware
app.use('*', authMiddleware)
// Tenant middleware not applied for legacy global settings

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const createLgdConfigSchema = z.object({
    modelName: z.string().min(1).max(255),
    segmentId: z.number().int().optional(),
    lgdMethod: z.number().int(),
    populationType: z.string().optional(),
    observationPeriod: z.string().optional(),
    workoutPeriod: z.number().int().optional(),
    flFlag: z.boolean().default(false),
    flScalarId: z.number().int().optional(),
    lgdRate: z.number().optional(),
    isActive: z.boolean().default(true),
})

const updateLgdConfigSchema = createLgdConfigSchema.partial()

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const transformLgdConfig = (config: typeof frs9ImpCaLgdConfig.$inferSelect) => ({
    id: config.pkid,
    model_name: config.lgdModelName,
    segment_id: config.segmentId,
    lgd_method: config.lgdMethod,
    population_type: config.populationType,
    observation_period: config.observationPeriod,
    observation_start_date: config.observationStartDate ? new Date(config.observationStartDate).toISOString() : null,
    workout_period: config.workoutPeriod,
    fl_flag: config.flFlag,
    fl_scalar_id: config.flScalarId,
    lgd_rate: config.lgdRate,
    is_active: config.activeFlag,
    created_by: config.createdby,
    updated_by: config.updatedby,
    created_date: config.createddate,
    updated_date: config.updateddate,
})

// ============================================================================
// ENDPOINTS
// ============================================================================

// GET /api/v1/banking/parameters/lgd-configurations
app.get('/', async (c) => {
    try {
        const { search, lgd_method, is_active } = c.req.query()
        const conditions = []

        if (search) {
            conditions.push(like(frs9ImpCaLgdConfig.lgdModelName, `%${search}%`))
        }

        if (lgd_method) {
            conditions.push(eq(frs9ImpCaLgdConfig.lgdMethod, parseInt(lgd_method)))
        }

        if (is_active !== undefined) {
            conditions.push(eq(frs9ImpCaLgdConfig.activeFlag, is_active === 'true'))
        }

        const configs = await db
            .select()
            .from(frs9ImpCaLgdConfig)
            .where(and(...conditions))
            .orderBy(frs9ImpCaLgdConfig.lgdModelName)

        return c.json({
            success: true,
            data: configs.map(transformLgdConfig),
        })
    } catch (error) {
        console.error('Error fetching LGD configurations:', error)
        return c.json({
            success: false,
            message: 'Failed to fetch LGD configurations',
        }, 500)
    }
})

// GET /api/v1/banking/parameters/lgd-configurations/:id
app.get('/:id', async (c) => {
    try {
        const id = parseInt(c.req.param('id'))
        if (isNaN(id)) return c.json({ success: false, message: 'Invalid ID' }, 400)

        const [config] = await db
            .select()
            .from(frs9ImpCaLgdConfig)
            .where(eq(frs9ImpCaLgdConfig.pkid, id))

        if (!config) {
            return c.json({ success: false, message: 'LGD configuration not found' }, 404)
        }

        return c.json({ success: true, data: transformLgdConfig(config) })
    } catch (error) {
        console.error('Error fetching LGD configuration:', error)
        return c.json({ success: false, message: 'Failed to fetch LGD configuration' }, 500)
    }
})

// POST /api/v1/banking/parameters/lgd-configurations
app.post('/', zValidator('json', createLgdConfigSchema), async (c) => {
    try {
        const userId = c.get('userId') as string
        const data = c.req.valid('json')

        const [config] = await db
            .insert(frs9ImpCaLgdConfig)
            .values({
                lgdModelName: data.modelName,
                segmentId: data.segmentId,
                lgdMethod: data.lgdMethod,
                populationType: data.populationType,
                observationPeriod: data.observationPeriod,
                workoutPeriod: data.workoutPeriod,
                flFlag: data.flFlag,
                flScalarId: data.flScalarId,
                lgdRate: data.lgdRate,
                activeFlag: data.isActive,
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
            data: transformLgdConfig(config),
            message: 'LGD configuration created successfully',
        }, 201)
    } catch (error) {
        console.error('Error creating LGD configuration:', error)
        return c.json({ success: false, message: 'Failed to create LGD configuration' }, 500)
    }
})

// PUT /api/v1/banking/parameters/lgd-configurations/:id
app.put('/:id', zValidator('json', updateLgdConfigSchema), async (c) => {
    try {
        const id = parseInt(c.req.param('id'))
        if (isNaN(id)) return c.json({ success: false, message: 'Invalid ID' }, 400)

        const userId = c.get('userId') as string
        const data = c.req.valid('json')

        const [updated] = await db
            .update(frs9ImpCaLgdConfig)
            .set({
                lgdModelName: data.modelName,
                segmentId: data.segmentId,
                lgdMethod: data.lgdMethod,
                populationType: data.populationType,
                observationPeriod: data.observationPeriod,
                workoutPeriod: data.workoutPeriod,
                flFlag: data.flFlag,
                flScalarId: data.flScalarId,
                lgdRate: data.lgdRate,
                activeFlag: data.isActive,
                updatedby: userId,
                updateddate: new Date().toISOString(),
                updatedhost: 'localhost',
            })
            .where(eq(frs9ImpCaLgdConfig.pkid, id))
            .returning()

        if (!updated) {
            return c.json({ success: false, message: 'LGD configuration not found' }, 404)
        }

        return c.json({
            success: true,
            data: transformLgdConfig(updated),
            message: 'LGD configuration updated successfully',
        })
    } catch (error) {
        console.error('Error updating LGD configuration:', error)
        return c.json({ success: false, message: 'Failed to update LGD configuration' }, 500)
    }
})

// DELETE /api/v1/banking/parameters/lgd-configurations/:id
app.delete('/:id', async (c) => {
    try {
        const id = parseInt(c.req.param('id'))
        if (isNaN(id)) return c.json({ success: false, message: 'Invalid ID' }, 400)

        const [deleted] = await db
            .delete(frs9ImpCaLgdConfig)
            .where(eq(frs9ImpCaLgdConfig.pkid, id))
            .returning()

        if (!deleted) {
            return c.json({ success: false, message: 'LGD configuration not found' }, 404)
        }

        return c.json({ success: true, message: 'LGD configuration deleted successfully' })
    } catch (error) {
        console.error('Error deleting LGD configuration:', error)
        return c.json({ success: false, message: 'Failed to delete LGD configuration' }, 500)
    }
})

// METADATA
app.get('/metadata/methods', async (c) => {
    return c.json({
        success: true,
        data: [
            { value: 1, label: 'Linear' },
            { value: 2, label: 'Vintage' },
            { value: 3, label: 'Recovery Rate' },
        ],
    })
})

app.get('/metadata/population-types', async (c) => {
    return c.json({
        success: true,
        data: [
            { value: 'Monthly', label: 'Monthly' },
            { value: 'Quarterly', label: 'Quarterly' },
        ],
    })
})

export default app
