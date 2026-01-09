import { Hono } from 'hono'
import { legacyDb as db } from '../config'
import { frs9EirEcf } from '../db/schema'
import { desc } from 'drizzle-orm'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'

const app = new Hono()

// ---- Schemas ----
const runCalculationSchema = z.object({
    calculationName: z.string().optional(),
    portfolioId: z.string().optional(),
    financialAssetId: z.string().optional(),
    amortizationMethod: z.string().optional(),
    nominalRate: z.number().optional(),
    effectiveInterestRate: z.number().optional(),
    originalBookValue: z.number().optional(),
    amortizationStartDate: z.string().optional(),
    currency: z.string().default('IDR')
})

// ---- Routes ----

// GET / - Get Amortization Results (frs9EirEcf)
app.get('/', async (c) => {
    try {
        const page = Number(c.req.query('page') || '1')
        const limit = Number(c.req.query('limit') || '10')
        const offset = (page - 1) * limit

        const data = await db
            .select()
            .from(frs9EirEcf)
            .orderBy(desc(frs9EirEcf.id))
            .limit(limit)
            .offset(offset)

        return c.json({
            success: true,
            data: data,
            pagination: {
                page,
                limit,
                total: 1000, // Placeholder
                totalPages: 100
            }
        })
    } catch (error) {
        console.error('Error fetching amortization results:', error)
        return c.json({
            success: false,
            message: 'Failed to fetch amortization results',
            error: String(error)
        }, 500)
    }
})

app.get('/calculations', async (c) => {
    // Alias to / for frontend compatibility if needed, or implement aggregation
    return app.request('/', c.req.raw)
})

app.post('/run-calculation', zValidator('json', runCalculationSchema), async (c) => {
    return c.json({
        success: true,
        message: 'Amortization calculation job submitted (Mock)',
    })
})

export default app
