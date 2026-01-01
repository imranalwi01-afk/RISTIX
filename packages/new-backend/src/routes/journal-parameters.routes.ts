import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { db } from '../config'
import { frs9ParamJournal } from '../db/schema'
import { eq, desc } from 'drizzle-orm'

export const journalParameterRoutes = new Hono()

// Schema definitions
const journalParamSchema = z.object({
    glGroup: z.string().max(20).optional(),
    currency: z.string().length(3).optional(),
    glType: z.string().max(20).optional(),
    glCode: z.string().max(20).optional(),
    glNumber: z.string().max(20).optional(),
    dbcr: z.string().length(1).optional(),
    glDesc: z.string().max(255).optional(),
    activeFlag: z.boolean().default(true),
    createdby: z.string().max(50).default('SYSTEM'),
})

// Options Endpoints
journalParameterRoutes.get('/gl-group-options', (c) => c.json({
    success: true,
    data: [
        { id: 'ASSETS', name: 'Assets' },
        { id: 'LIABILITIES', name: 'Liabilities' },
        { id: 'EQUITY', name: 'Equity' },
        { id: 'INCOME', name: 'Income' },
        { id: 'EXPENSE', name: 'Expense' }
    ]
}))

journalParameterRoutes.get('/currency-options', (c) => c.json({
    success: true,
    data: [
        { id: 'IDR', name: 'Indonesian Rupiah' },
        { id: 'USD', name: 'US Dollar' },
        { id: 'EUR', name: 'Euro' }
    ]
}))

journalParameterRoutes.get('/journal-type-options', (c) => c.json({
    success: true,
    data: [
        { id: 'ACCRUAL', name: 'Accrual' },
        { id: 'PAYMENT', name: 'Payment' },
        { id: 'REVERSAL', name: 'Reversal' }
    ]
}))

journalParameterRoutes.get('/journal-code-options', (c) => c.json({
    success: true,
    data: [
        { id: 'J001', name: 'J001 - Standard Accrual' },
        { id: 'J002', name: 'J002 - Payment' }
    ]
}))

journalParameterRoutes.get('/dbcr-options', (c) => c.json({
    success: true,
    data: [
        { id: 'D', name: 'Debit' },
        { id: 'C', name: 'Credit' }
    ]
}))

// GET / - List all journal parameters
journalParameterRoutes.get('/', async (c) => {
    try {
        const result = await db.select().from(frs9ParamJournal).orderBy(desc(frs9ParamJournal.createddate));
        return c.json({ success: true, data: result });
    } catch (error) {
        console.error('Error fetching journal parameters:', error);
        return c.json({ error: 'Failed to fetch journal parameters' }, 500);
    }
})

// GET /:id - Get by ID
journalParameterRoutes.get('/:id', async (c) => {
    const id = Number(c.req.param('id'));
    if (isNaN(id)) return c.json({ error: 'Invalid ID' }, 400);

    try {
        const [item] = await db.select().from(frs9ParamJournal).where(eq(frs9ParamJournal.pkid, id));
        if (!item) return c.json({ error: 'Journal parameter not found' }, 404);
        return c.json({ success: true, data: item });
    } catch (error) {
        return c.json({ error: 'Failed to fetch journal parameter' }, 500);
    }
})

// POST / - Create
journalParameterRoutes.post('/', zValidator('json', journalParamSchema), async (c) => {
    const data = c.req.valid('json');
    try {
        const [newItem] = await db.insert(frs9ParamJournal).values({
            ...data,
            createdhost: 'localhost',
            createddate: new Date().toISOString()
        }).returning();
        return c.json({ success: true, data: newItem }, 201);
    } catch (error) {
        console.error('Error creating journal parameter:', error);
        return c.json({ error: 'Failed to create journal parameter' }, 500);
    }
})

// PUT /:id - Update
journalParameterRoutes.put('/:id', zValidator('json', journalParamSchema.partial()), async (c) => {
    const id = Number(c.req.param('id'));
    if (isNaN(id)) return c.json({ error: 'Invalid ID' }, 400);

    const data = c.req.valid('json');

    try {
        const [updated] = await db.update(frs9ParamJournal)
            .set({
                ...data,
                updateddate: new Date().toISOString(),
                updatedhost: 'localhost', // placeholder
                updatedby: data.createdby || 'SYSTEM'
            })
            .where(eq(frs9ParamJournal.pkid, id))
            .returning();

        if (!updated) return c.json({ error: 'Journal parameter not found' }, 404);
        return c.json({ success: true, data: updated });
    } catch (error) {
        console.error('Error updating journal parameter:', error);
        return c.json({ error: 'Failed to update journal parameter' }, 500);
    }
})

// DELETE /:id
journalParameterRoutes.delete('/:id', async (c) => {
    const id = Number(c.req.param('id'));
    if (isNaN(id)) return c.json({ error: 'Invalid ID' }, 400);

    try {
        await db.delete(frs9ParamJournal).where(eq(frs9ParamJournal.pkid, id));
        return c.json({ success: true, message: 'Deleted successfully' });
    } catch (error) {
        console.error('Error deleting journal parameter:', error);
        return c.json({ error: 'Failed to delete journal parameter' }, 500);
    }
})
