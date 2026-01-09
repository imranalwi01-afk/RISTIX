import { Hono } from 'hono'
import { legacyDb as db } from '../config'
import {
    frs9ImpCaPdTs,
    frs9ImpCaLgdRecData,
    frs9ImpCaEadPaymAvg,
    frs9ImpCaResultH,
    frs9ImpMovementData,
    frs9ImpCaPdData
} from '../db/schema'
import { desc, eq, sql } from 'drizzle-orm'
import { z } from 'zod'

const app = new Hono()

// Helper to handle pagination and filtering
const getPagination = (c: any) => {
    const page = Number(c.req.query('page') || '1')
    const limit = Number(c.req.query('limit') || '10')
    const offset = (page - 1) * limit
    return { page, limit, offset }
}

// GET /lifetime-pd/yearly
app.get('/lifetime-pd/yearly', async (c) => {
    try {
        const { limit, offset } = getPagination(c)
        // Linking to PD TS (Term Structure) or PD Data
        const data = await db.select().from(frs9ImpCaPdTs)
            .limit(limit).offset(offset)

        return c.json({ success: true, data })
    } catch (e) {
        return c.json({ success: false, message: String(e) }, 500)
    }
})

// GET /lifetime-pd/monthly
app.get('/lifetime-pd/monthly', async (c) => {
    try {
        const { limit, offset } = getPagination(c)
        // Monthly usually implies a different view or table, but using PD TS for now as placeholder
        const data = await db.select().from(frs9ImpCaPdTs)
            .limit(limit).offset(offset)

        return c.json({ success: true, data })
    } catch (e) {
        return c.json({ success: false, message: String(e) }, 500)
    }
})

// GET /lifetime-lgd
app.get('/lifetime-lgd', async (c) => {
    try {
        const { limit, offset } = getPagination(c)
        const data = await db.select().from(frs9ImpCaLgdRecData)
            .limit(limit).offset(offset)

        return c.json({ success: true, data })
    } catch (e) {
        return c.json({ success: false, message: String(e) }, 500)
    }
})

// GET /ead-model
app.get('/ead-model', async (c) => {
    try {
        const { limit, offset } = getPagination(c)
        const data = await db.select().from(frs9ImpCaEadPaymAvg)
            .limit(limit).offset(offset)

        return c.json({ success: true, data })
    } catch (e) {
        return c.json({ success: false, message: String(e) }, 500)
    }
})

// GET /ecl-result
app.get('/ecl-result', async (c) => {
    try {
        const { limit, offset } = getPagination(c)
        const data = await db.select().from(frs9ImpCaResultH)
            .orderBy(desc(frs9ImpCaResultH.prcDate))
            .limit(limit).offset(offset)

        return c.json({ success: true, data })
    } catch (e) {
        return c.json({ success: false, message: String(e) }, 500)
    }
})

// GET /ecl-movement
app.get('/ecl-movement', async (c) => {
    try {
        const { limit, offset } = getPagination(c)
        const data = await db.select().from(frs9ImpMovementData)
            .limit(limit).offset(offset)

        return c.json({ success: true, data })
    } catch (e) {
        return c.json({ success: false, message: String(e) }, 500)
    }
})

// GET /gca-movement
app.get('/gca-movement', async (c) => {
    try {
        const { limit, offset } = getPagination(c)
        // Sharing movement data table as it likely contains both ECL and GCA (Outstanding) movements
        const data = await db.select().from(frs9ImpMovementData)
            .limit(limit).offset(offset)

        return c.json({ success: true, data })
    } catch (e) {
        return c.json({ success: false, message: String(e) }, 500)
    }
})

// POST /export
app.post('/export', async (c) => {
    return c.json({ success: true, message: "Export initiated" })
})

export default app
