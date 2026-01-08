import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { db } from '../config'
import { frs9ParamJournal, frs9ParamCommonh } from '../db/schema'
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

// Helper to get options from business settings (frs9_param_commonh - Type B)
const getOptionsFromParam = async (paramCode: string) => {
    try {
        const param = await db.query.frs9ParamCommonh.findFirst({
            where: (t, { and, eq }) => and(eq(t.paramType, 'B'), eq(t.paramCode, paramCode)),
            with: { details: true }
        });

        if (!param || !param.details) return [];

        return param.details.map(d => ({
            id: d.value1 || d.param_value || '',
            name: d.paramdesc || d.param_desc || d.value1 || ''
        }));
    } catch (error) {
        console.error(`Error fetching param options for ${paramCode}:`, error);
        return [];
    }
};

// Options Endpoints - Using DB Lookups based on Spec
// B0004: GL Group (GL01, GL02, etc.)
journalParameterRoutes.get('/gl-group-options', async (c) => {
    const options = await getOptionsFromParam('B0004');
    return c.json({
        success: true, data: options.length > 0 ? options : [
            { id: 'ASSETS', name: 'Assets (Fallback)' },
            { id: 'LIABILITIES', name: 'Liabilities (Fallback)' }
        ]
    });
})

// B0001: Currency (IDR, USD, etc.)
journalParameterRoutes.get('/currency-options', async (c) => {
    const options = await getOptionsFromParam('B0001');
    return c.json({
        success: true, data: options.length > 0 ? options : [
            { id: 'IDR', name: 'IDR (Fallback)' },
            { id: 'USD', name: 'USD (Fallback)' }
        ]
    });
})

// B0006: Journal Type (IMPC, IMPI, etc.)
journalParameterRoutes.get('/journal-type-options', async (c) => {
    const options = await getOptionsFromParam('B0006');
    return c.json({
        success: true, data: options.length > 0 ? options : [
            { id: 'ACCRUAL', name: 'Accrual (Fallback)' },
            { id: 'PAYMENT', name: 'Payment (Fallback)' }
        ]
    });
})

// B0008: Journal Code (GL, etc.)
journalParameterRoutes.get('/journal-code-options', async (c) => {
    const options = await getOptionsFromParam('B0008');
    return c.json({
        success: true, data: options.length > 0 ? options : [
            { id: 'J001', name: 'Standard Accrual (Fallback)' }
        ]
    });
})

// B0007: DB/CR (D, C)
journalParameterRoutes.get('/dbcr-options', async (c) => {
    const options = await getOptionsFromParam('B0007');
    return c.json({
        success: true, data: options.length > 0 ? options : [
            { id: 'D', name: 'Debit (Fallback)' },
            { id: 'C', name: 'Credit (Fallback)' }
        ]
    });
})

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
