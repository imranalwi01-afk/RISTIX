import { Hono } from 'hono'
import type { AppContext } from '../app'
import { authMiddleware } from '../middleware'

const app = new Hono<AppContext>()

app.use('*', authMiddleware)

// GET /watchlist - Stub endpoint returning empty data
app.get('/watchlist', async (c) => {
    try {
        const page = Number(c.req.query('page') || '1')
        const limit = Number(c.req.query('limit') || '20')

        return c.json({
            success: true,
            data: [],
            pagination: {
                page,
                limit,
                total: 0,
                totalPages: 0
            }
        })
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
