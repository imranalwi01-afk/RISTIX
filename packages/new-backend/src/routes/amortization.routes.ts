import { Hono } from 'hono'
import { legacyDb as db } from '../config'
import {
    frs9EirEcf,
    frs9AccountId,
    frs9MasterTransactionCost,
    frs9EventChanges,
    frs9AmortJournalData
} from '../db/schema'
import { desc, eq } from 'drizzle-orm'
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

// GET /contract-details - Get contract/account details
app.get('/contract-details', async (c) => {
    try {
        const accountNumber = c.req.query('accountNumber')
        const page = Number(c.req.query('page') || '1')
        const limit = Number(c.req.query('limit') || '20')
        const offset = (page - 1) * limit

        let query = db.select().from(frs9AccountId)

        if (accountNumber) {
            query = query.where(eq(frs9AccountId.accountNumber, accountNumber)) as any
        }

        const data = await query.limit(limit).offset(offset)

        return c.json({
            success: true,
            data: data,
            pagination: {
                page,
                limit,
                total: data.length,
                totalPages: Math.ceil(data.length / limit)
            }
        })
    } catch (error) {
        console.error('Error fetching contract details:', error)
        return c.json({
            success: false,
            message: 'Failed to fetch contract details',
            error: String(error)
        }, 500)
    }
})

// GET /fees-costs - Get transaction fees and costs
app.get('/fees-costs', async (c) => {
    try {
        const page = Number(c.req.query('page') || '1')
        const limit = Number(c.req.query('limit') || '20')
        const offset = (page - 1) * limit

        const data = await db
            .select()
            .from(frs9MasterTransactionCost)
            .limit(limit)
            .offset(offset)

        return c.json({
            success: true,
            data: data,
            pagination: {
                page,
                limit,
                total: data.length,
                totalPages: Math.ceil(data.length / limit)
            }
        })
    } catch (error) {
        console.error('Error fetching fees/costs:', error)
        return c.json({
            success: false,
            message: 'Failed to fetch fees and costs',
            error: String(error)
        }, 500)
    }
})

// GET /events - Get amortization events
app.get('/events', async (c) => {
    try {
        const accountId = c.req.query('accountId')
        const page = Number(c.req.query('page') || '1')
        const limit = Number(c.req.query('limit') || '20')
        const offset = (page - 1) * limit

        let query = db.select().from(frs9EventChanges)

        if (accountId) {
            query = query.where(eq(frs9EventChanges.accountId, Number(accountId))) as any
        }

        const data = await query
            .orderBy(desc(frs9EventChanges.prcDate))
            .limit(limit)
            .offset(offset)

        return c.json({
            success: true,
            data: data,
            pagination: {
                page,
                limit,
                total: data.length,
                totalPages: Math.ceil(data.length / limit)
            }
        })
    } catch (error) {
        console.error('Error fetching events:', error)
        return c.json({
            success: false,
            message: 'Failed to fetch events',
            error: String(error)
        }, 500)
    }
})

// GET /journal-details - Get journal entry details
app.get('/journal-details', async (c) => {
    try {
        const accountId = c.req.query('accountId')
        const page = Number(c.req.query('page') || '1')
        const limit = Number(c.req.query('limit') || '20')
        const offset = (page - 1) * limit

        let query = db.select().from(frs9AmortJournalData)

        if (accountId) {
            query = query.where(eq(frs9AmortJournalData.accountId, Number(accountId))) as any
        }

        const data = await query
            .orderBy(desc(frs9AmortJournalData.prcDate))
            .limit(limit)
            .offset(offset)

        return c.json({
            success: true,
            data: data,
            pagination: {
                page,
                limit,
                total: data.length,
                totalPages: Math.ceil(data.length / limit)
            }
        })
    } catch (error) {
        console.error('Error fetching journal details:', error)
        return c.json({
            success: false,
            message: 'Failed to fetch journal details',
            error: String(error)
        }, 500)
    }
})

export default app
