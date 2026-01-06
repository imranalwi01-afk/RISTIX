import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { db } from '../config'
import { frs9ParamCommonh, frs9ParamCommond } from '../db/schema'
import { eq, and, sql } from 'drizzle-orm'

export const appSettingsRoutes = new Hono()

const settingSchema = z.object({
    paramCode: z.string().max(10),
    paramName: z.string().max(255),
    paramUsage: z.string().max(255).optional(),
    paramType: z.string().max(10).optional(),
    bankingType: z.enum(['conventional', 'syariah', 'dual']).default('conventional'),
    isActive: z.boolean().default(true),
    requiresApproval: z.boolean().default(false),
})

const detailSchema = z.object({
    paramCode: z.string().max(50),
    paramSeq: z.number().int(),
    value1: z.string().max(100),
    value2: z.string().max(100),
    value3: z.string().max(50),
    paramdesc: z.string().max(1000),
})

// GET /app-settings - List all settings with details
appSettingsRoutes.get('/', async (c) => {
    const code = c.req.query('code');
    try {
        const settings = await db.query.frs9ParamCommonh.findMany({
            where: and(
                eq(frs9ParamCommonh.paramType, 'A'),
                code ? eq(frs9ParamCommonh.paramCode, code) : undefined
            ),
            with: {
                details: true
            },
            orderBy: frs9ParamCommonh.paramCode
        });
        return c.json({ success: true, data: settings });
    } catch (error) {
        console.error('Error fetching app settings:', error);
        return c.json({ error: 'Failed to fetch settings' }, 500);
    }
})

// GET /app-settings/:code - Get specific setting
appSettingsRoutes.get('/:code', async (c) => {
    const code = c.req.param('code');
    const setting = await db.query.frs9ParamCommonh.findFirst({
        where: eq(frs9ParamCommonh.paramCode, code),
        with: {
            details: true
        }
    });

    if (!setting) {
        return c.json({ error: 'Setting not found' }, 404);
    }
    return c.json({ success: true, data: setting });
})

// POST /app-settings - Create new setting header
appSettingsRoutes.post('/', zValidator('json', settingSchema), async (c) => {
    const data = c.req.valid('json');
    try {
        const [newSetting] = await db.insert(frs9ParamCommonh).values(data).returning();
        return c.json({ success: true, data: newSetting }, 201);
    } catch (error: any) {
        console.error('Error creating setting:', error);
        if (error.code === '23505') { // Unique violation
            return c.json({ error: 'Param code already exists' }, 409);
        }
        return c.json({ error: 'Failed to create setting' }, 500);
    }
})

// PUT /app-settings/:code - Update setting header
appSettingsRoutes.put('/:code', zValidator('json', settingSchema.partial()), async (c) => {
    const code = c.req.param('code');
    const data = c.req.valid('json');

    try {
        const [updated] = await db.update(frs9ParamCommonh)
            .set(data)
            .where(eq(frs9ParamCommonh.paramCode, code))
            .returning();

        if (!updated) {
            return c.json({ error: 'Setting not found' }, 404);
        }
        return c.json({ success: true, data: updated });
    } catch (error) {
        console.error('Error updating setting:', error);
        return c.json({ error: 'Failed to update setting' }, 500);
    }
})

// POST /app-settings/details - Create/Add detail to a setting
appSettingsRoutes.post('/details', zValidator('json', detailSchema), async (c) => {
    const data = c.req.valid('json');
    try {
        // Verify header exists
        const header = await db.query.frs9ParamCommonh.findFirst({
            where: eq(frs9ParamCommonh.paramCode, data.paramCode)
        });
        if (!header) {
            return c.json({ error: 'Parent setting header not found' }, 404);
        }

        const [newDetail] = await db.insert(frs9ParamCommond).values(data).returning();
        return c.json({ success: true, data: newDetail }, 201);
    } catch (error) {
        console.error('Error creating detail:', error);
        return c.json({ error: 'Failed to create detail' }, 500);
    }
})

// DELETE /app-settings/details/:id
appSettingsRoutes.delete('/details/:id', async (c) => {
    const id = Number(c.req.param('id'));
    if (isNaN(id)) return c.json({ error: 'Invalid ID' }, 400);

    try {
        await db.delete(frs9ParamCommond).where(eq(frs9ParamCommond.pkid, id));
        return c.json({ message: 'Detail deleted' });
    } catch (error) {
        console.error('Error deleting detail:', error);
        return c.json({ error: 'Failed to delete detail' }, 500);
    }
})
