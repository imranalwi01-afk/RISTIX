import { Hono } from 'hono'
import { legacyDb as db } from '../config'
import {
    frs9ImpCaPdTs,
    frs9ImpCaLgdRecData,
    frs9ImpCaEadPaymAvg,
    frs9ImpCaResultH,
    frs9ImpMovementData,
    frs9AccountId
} from '../db/schema'
import { desc, eq, getTableColumns } from 'drizzle-orm'

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
        const data = await db.select({
            ...getTableColumns(frs9ImpCaLgdRecData),
            cifName: frs9AccountId.cifName,
            accountNumber: frs9AccountId.accountNumber
        })
            .from(frs9ImpCaLgdRecData)
            .leftJoin(frs9AccountId, eq(frs9ImpCaLgdRecData.accountId, frs9AccountId.accountId as any))
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
        const data = await db.select({
            ...getTableColumns(frs9ImpCaResultH),
            cifName: frs9AccountId.cifName,
            accountNumber: frs9AccountId.accountNumber
        })
            .from(frs9ImpCaResultH)
            .leftJoin(frs9AccountId, eq(frs9ImpCaResultH.accountId, frs9AccountId.accountId as any))
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
        const data = await db.select({
            ...getTableColumns(frs9ImpCaResultH),
            cifName: frs9AccountId.cifName,
            accountNumber: frs9AccountId.accountNumber
        })
            .from(frs9ImpCaResultH)
            .leftJoin(frs9AccountId, eq(frs9ImpCaResultH.accountId, frs9AccountId.accountId as any))
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
        const data = await db.select()
            .from(frs9ImpMovementData)
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
        const data = await db.select()
            .from(frs9ImpMovementData)
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
