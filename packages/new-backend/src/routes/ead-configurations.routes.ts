import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { db } from '@/config'
import { frs9ImpCaEadConfig } from '@/db/schema'
import { eq, and, like, desc } from 'drizzle-orm'
import type { AppContext } from '@/app'
import { authMiddleware, tenantMiddleware } from '../middleware'

const app = new Hono<AppContext>()

app.use('*', authMiddleware)
// app.use('*', tenantMiddleware) // Legacy tables typically don't support tenant isolation yet

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const createEadConfigSchema = z.object({
    modelName: z.string().min(1).max(250),
    segmentId: z.number().int().optional(), // smallint in DB
    eadMethod: z.string().max(10), // varchar(10)
    calcMethod: z.string().max(10), // varchar(10)
    isActive: z.boolean().default(true),
})

const updateEadConfigSchema = createEadConfigSchema.partial()

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const transformEadConfig = (config: typeof frs9ImpCaEadConfig.$inferSelect) => ({
    id: config.pkid,
    model_name: config.eadModelName,
    segment_id: config.segmentId,
    ead_method: config.eadMethod,
    calc_method: config.calcMethod,
    is_active: config.activeFlag,
    created_by: config.createdby,
    updated_by: config.updatedby,
    created_date: config.createddate,
    updated_date: config.updateddate,
})

// ============================================================================
// ENDPOINTS
// ============================================================================

// GET /api/v1/banking/parameters/ead-configurations
app.get('/', async (c) => {
    try {
        const { search, ead_method, is_active } = c.req.query()
        const conditions = []

        if (search) {
            conditions.push(like(frs9ImpCaEadConfig.eadModelName, `%${search}%`))
        }

        if (ead_method) {
            conditions.push(eq(frs9ImpCaEadConfig.eadMethod, ead_method))
        }

        if (is_active !== undefined) {
            conditions.push(eq(frs9ImpCaEadConfig.activeFlag, is_active === 'true'))
        }

        const configs = await db
            .select()
            .from(frs9ImpCaEadConfig)
            .where(and(...conditions))
            .orderBy(desc(frs9ImpCaEadConfig.createddate))

        return c.json({
            success: true,
            data: configs.map(transformEadConfig),
        })
    } catch (error) {
        console.error('Error fetching EAD configurations:', error)
        return c.json({ success: false, message: 'Failed to fetch EAD configurations' }, 500)
    }
})

// GET /api/v1/banking/parameters/ead-configurations/:id
app.get('/:id', async (c) => {
    try {
        const id = Number(c.req.param('id'))
        if (isNaN(id)) return c.json({ error: 'Invalid ID' }, 400);

        const [config] = await db
            .select()
            .from(frs9ImpCaEadConfig)
            .where(eq(frs9ImpCaEadConfig.pkid, id))

        if (!config) {
            return c.json({ success: false, message: 'EAD configuration not found' }, 404)
        }

        return c.json({ success: true, data: transformEadConfig(config) })
    } catch (error) {
        return c.json({ success: false, message: 'Failed to fetch EAD configuration' }, 500)
    }
})

// POST /api/v1/banking/parameters/ead-configurations
app.post('/', zValidator('json', createEadConfigSchema), async (c) => {
    try {
        const userId = 'SYSTEM' // Legacy usually implies system or we get from auth if possible
        // const userId = c.get('userId') as string 
        const data = c.req.valid('json')

        const [config] = await db
            .insert(frs9ImpCaEadConfig)
            .values({
                eadModelName: data.modelName,
                segmentId: data.segmentId,
                eadMethod: data.eadMethod,
                calcMethod: data.calcMethod,
                activeFlag: data.isActive,
                createdby: userId,
                createdhost: 'localhost',
                createddate: new Date().toISOString(),
                updatedby: userId,
                updatedhost: 'localhost',
                updateddate: new Date().toISOString()
            })
            .returning()

        return c.json({
            success: true,
            data: transformEadConfig(config),
            message: 'EAD configuration created successfully',
        }, 201)
    } catch (error) {
        console.error('Error creating EAD configuration:', error)
        return c.json({ success: false, message: 'Failed to create EAD configuration' }, 500)
    }
})

// PUT /api/v1/banking/parameters/ead-configurations/:id
app.put('/:id', zValidator('json', updateEadConfigSchema), async (c) => {
    try {
        const id = Number(c.req.param('id'))
        if (isNaN(id)) return c.json({ error: 'Invalid ID' }, 400);
        const userId = 'SYSTEM'
        const data = c.req.valid('json')

        const [updated] = await db
            .update(frs9ImpCaEadConfig)
            .set({
                eadModelName: data.modelName,
                segmentId: data.segmentId,
                eadMethod: data.eadMethod,
                calcMethod: data.calcMethod,
                activeFlag: data.isActive,
                updatedby: userId,
                updateddate: new Date().toISOString(),
                updatedhost: 'localhost',
            })
            .where(eq(frs9ImpCaEadConfig.pkid, id))
            .returning()

        if (!updated) {
            return c.json({ success: false, message: 'EAD configuration not found' }, 404)
        }

        return c.json({
            success: true,
            data: transformEadConfig(updated),
            message: 'EAD configuration updated successfully',
        })
    } catch (error) {
        console.error('Error updating EAD configuration:', error)
        return c.json({ success: false, message: 'Failed to update EAD configuration' }, 500)
    }
})

// DELETE /api/v1/banking/parameters/ead-configurations/:id
app.delete('/:id', async (c) => {
    try {
        const id = Number(c.req.param('id'))
        if (isNaN(id)) return c.json({ error: 'Invalid ID' }, 400);

        const [deleted] = await db
            .delete(frs9ImpCaEadConfig)
            .where(eq(frs9ImpCaEadConfig.pkid, id))
            .returning()

        if (!deleted) {
            return c.json({ success: false, message: 'EAD configuration not found' }, 404)
        }

        return c.json({ success: true, message: 'EAD configuration deleted successfully' })
    } catch (error) {
        return c.json({ success: false, message: 'Failed to delete EAD configuration' }, 500)
    }
})

// METADATA
app.get('/metadata/methods', async (c) => {
    return c.json({
        success: true,
        data: [
            { value: 'CCF', label: 'CCF' },
            { value: 'Prepayment', label: 'Prepayment' },
        ],
    })
})

app.get('/metadata/calc-methods', async (c) => {
    return c.json({
        success: true,
        data: [
            { value: 'Revolving', label: 'Revolving' },
            { value: 'Term Loan', label: 'Term Loan' },
        ],
    })
})

export default app
