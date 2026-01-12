import { Hono } from 'hono'
import type { AppContext } from '../app'
import { authMiddleware } from '../middleware'
import { Effect } from 'effect'
import { IndividualImpairmentService } from '../services/individual-impairment.service'

const app = new Hono<AppContext>()

app.use('*', authMiddleware)


// GET /watchlist - Real implementation
app.get('/watchlist', async (c) => {
    try {
        const query = c.req.query()
        const page = Number(query['page'] || '1')
        const limit = Number(query['limit'] || '20')
        const search = query['search']

        // Parse nested params manually since Hono/Zod combination is strict
        const filter = {
            stage: query['filter[stage]'] ? Number(query['filter[stage]']) : undefined,
            impaired_flag: query['filter[impaired_flag]'] as 'I' | 'N' | undefined,
            assessment_status: query['filter[assessment_status]']
        }

        const sort = {
            field: query['sort[field]'],
            order: query['sort[order]'] as 'asc' | 'desc' | undefined
        }

        const program = IndividualImpairmentService.getWatchlist({
            page,
            limit,
            search,
            filter,
            sort
        })

        const result = await Effect.runPromiseExit(program)

        if (result._tag === 'Success') {
            return c.json(result.value)
        } else {
            console.error('Error fetching watchlist:', result.cause)
            return c.json({
                success: false,
                message: 'Failed to fetch watchlist',
                error: String(result.cause)
            }, 500)
        }
    } catch (error) {
        console.error('Error fetching watchlist:', error)
        return c.json({
            success: false,
            message: 'Failed to fetch watchlist',
            error: String(error)
        }, 500)
    }
})

// POST /watchlist - Stub endpoint
app.post('/watchlist', async (c) => {
    try {
        const body = await c.req.json()
        return c.json({
            success: true,
            data: { id: Date.now(), ...body },
            message: 'Added to watchlist'
        })
    } catch (error) {
        return c.json({
            success: false,
            message: 'Failed to add to watchlist'
        }, 500)
    }
})

// DELETE /watchlist/:id - Stub endpoint
app.delete('/watchlist/:id', async (c) => {
    try {
        return c.json({
            success: true,
            message: 'Removed from watchlist'
        })
    } catch (error) {
        return c.json({
            success: false,
            message: 'Failed to remove from watchlist'
        }, 500)
    }
})

// GET /overrides - Stub endpoint
app.get('/overrides', async (c) => {
    try {
        return c.json({
            success: true,
            data: []
        })
    } catch (error) {
        return c.json({
            success: false,
            message: 'Failed to fetch overrides'
        }, 500)
    }
})

// POST /overrides - Stub endpoint
app.post('/overrides', async (c) => {
    try {
        const body = await c.req.json()
        return c.json({
            success: true,
            data: { id: Date.now(), ...body, status: 'PENDING', createdAt: new Date().toISOString() },
            message: 'Override request created'
        })
    } catch (error) {
        return c.json({
            success: false,
            message: 'Failed to create override'
        }, 500)
    }
})

export default app
