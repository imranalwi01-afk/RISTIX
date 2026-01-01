import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { db } from '../config'
import { frs9ParamProduct } from '../db/schema'
import { eq, desc } from 'drizzle-orm'

export const productParameterRoutes = new Hono()

// Schema definitions
const productParamSchema = z.object({
    dataSource: z.string().max(20),
    prdGroup: z.string().max(20),
    prdType: z.string().max(20),
    prdCode: z.string().max(20),
    prdDesc: z.string().max(255),
    currency: z.string().max(5),
    amortizationType: z.string().max(10).optional(),
    alFlag: z.string().max(1).optional(),
    impairedFlag: z.boolean().optional(),
    bmFlag: z.boolean().optional(),
    expectedLife: z.number().int().optional(),
    borrowingRate: z.number().optional(),
    marketRate: z.number().optional(),
    activeFlag: z.boolean().default(true),
    createdby: z.string().max(50).default('SYSTEM'),
})

// GET /instrument-class-options - Get options for instrument class
productParameterRoutes.get('/instrument-class-options', async (c) => {
    // Return hardcoded options as per legacy requirement (verified in frontend fallback)
    return c.json({
        success: true,
        data: [
            { id: 'A', name: 'Asset' },
            { id: 'L', name: 'Liabilities' }
        ]
    });
})

// GET / - List all product parameters
productParameterRoutes.get('/', async (c) => {
    try {
        const result = await db.select().from(frs9ParamProduct).orderBy(desc(frs9ParamProduct.createddate));
        return c.json({ success: true, data: result });
    } catch (error) {
        console.error('Error fetching product parameters:', error);
        return c.json({ error: 'Failed to fetch product parameters' }, 500);
    }
})

// GET /:id - Get by ID
productParameterRoutes.get('/:id', async (c) => {
    const id = Number(c.req.param('id'));
    if (isNaN(id)) return c.json({ error: 'Invalid ID' }, 400);

    try {
        const [item] = await db.select().from(frs9ParamProduct).where(eq(frs9ParamProduct.pkid, id));
        if (!item) return c.json({ error: 'Product parameter not found' }, 404);
        return c.json({ success: true, data: item });
    } catch (error) {
        return c.json({ error: 'Failed to fetch product parameter' }, 500);
    }
})

// POST / - Create
productParameterRoutes.post('/', zValidator('json', productParamSchema), async (c) => {
    const data = c.req.valid('json');
    try {
        const [newItem] = await db.insert(frs9ParamProduct).values({
            ...data,
            createdhost: 'localhost',
            createddate: new Date().toISOString()
        }).returning();
        return c.json({ success: true, data: newItem }, 201);
    } catch (error) {
        console.error('Error creating product parameter:', error);
        return c.json({ error: 'Failed to create product parameter' }, 500);
    }
})

// PUT /:id - Update
productParameterRoutes.put('/:id', zValidator('json', productParamSchema.partial()), async (c) => {
    const id = Number(c.req.param('id'));
    if (isNaN(id)) return c.json({ error: 'Invalid ID' }, 400);

    const data = c.req.valid('json');

    try {
        const [updated] = await db.update(frs9ParamProduct)
            .set({
                ...data,
                updateddate: new Date().toISOString(),
                updatedhost: 'localhost', // placeholder
                updatedby: data.createdby || 'SYSTEM'
            })
            .where(eq(frs9ParamProduct.pkid, id))
            .returning();

        if (!updated) return c.json({ error: 'Product parameter not found' }, 404);
        return c.json({ success: true, data: updated });
    } catch (error) {
        console.error('Error updating product parameter:', error);
        return c.json({ error: 'Failed to update product parameter' }, 500);
    }
})

// DELETE /:id
productParameterRoutes.delete('/:id', async (c) => {
    const id = Number(c.req.param('id'));
    if (isNaN(id)) return c.json({ error: 'Invalid ID' }, 400);

    try {
        await db.delete(frs9ParamProduct).where(eq(frs9ParamProduct.pkid, id));
        return c.json({ success: true, message: 'Deleted successfully' });
    } catch (error) {
        console.error('Error deleting product parameter:', error);
        return c.json({ error: 'Failed to delete product parameter' }, 500);
    }
})
