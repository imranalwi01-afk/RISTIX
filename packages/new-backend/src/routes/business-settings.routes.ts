import { Hono } from 'hono'
import { db } from '../config'
import { frs9ParamCommond } from '../db/schema'
import { eq, and, sql } from 'drizzle-orm'

export const businessSettingsRoutes = new Hono()

/**
 * B0012: Table Dropdown
 * Returns distinct VALUE1 from frs9_param_commond where param_code = 'B0012'
 */
businessSettingsRoutes.get('/tables', async (c) => {
    try {
        const results = await db
            .selectDistinct({ value1: frs9ParamCommond.value1 })
            .from(frs9ParamCommond)
            .where(eq(frs9ParamCommond.paramCode, 'B0012'))
            .orderBy(frs9ParamCommond.value1);

        const tables = results.map(r => r.value1);
        return c.json({ success: true, data: tables });
    } catch (error) {
        console.error('Error fetching tables:', error);
        return c.json({ error: 'Failed to fetch tables' }, 500);
    }
})

/**
 * B0013: Column Dropdown
 * Returns distinct VALUE1 from frs9_param_commond where param_code = 'B0013' AND value3 = table
 */
businessSettingsRoutes.get('/columns', async (c) => {
    const table = c.req.query('table');
    if (!table) return c.json({ error: 'Table parameter required' }, 400);

    try {
        const results = await db
            .selectDistinct({ value1: frs9ParamCommond.value1 })
            .from(frs9ParamCommond)
            .where(
                and(
                    eq(frs9ParamCommond.paramCode, 'B0013'),
                    eq(frs9ParamCommond.value3, table)
                )
            )
            .orderBy(frs9ParamCommond.value1);

        const columns = results.map(r => r.value1);
        return c.json({ success: true, data: columns });
    } catch (error) {
        console.error('Error fetching columns:', error);
        return c.json({ error: 'Failed to fetch columns' }, 500);
    }
})

/**
 * B0013: Data Type Detection
 * Returns distinct VALUE2 (Data Type) from frs9_param_commond 
 * where param_code = 'B0013' AND value1 = column AND value3 = table
 */
businessSettingsRoutes.get('/data-type', async (c) => {
    const column = c.req.query('column');
    const table = c.req.query('table');

    if (!column || !table) return c.json({ error: 'Column and Table parameters required' }, 400);

    try {
        const result = await db
            .select({ value2: frs9ParamCommond.value2 })
            .from(frs9ParamCommond)
            .where(
                and(
                    eq(frs9ParamCommond.paramCode, 'B0013'),
                    eq(frs9ParamCommond.value1, column),
                    eq(frs9ParamCommond.value3, table)
                )
            )
            .limit(1);

        const dataType = result.length > 0 ? result[0].value2 : null;
        return c.json({ success: true, data: dataType });
    } catch (error) {
        console.error('Error fetching data type:', error);
        return c.json({ error: 'Failed to fetch data type' }, 500);
    }
})

/**
 * B0014: Operator Dropdown
 * Returns distinct VALUE1 (Operator) from frs9_param_commond 
 * where param_code = 'B0014' AND value2 = dataType
 */
businessSettingsRoutes.get('/operators', async (c) => {
    const dataType = c.req.query('dataType');
    if (!dataType) return c.json({ error: 'DataType parameter required' }, 400);

    try {
        const results = await db
            .selectDistinct({ value1: frs9ParamCommond.value1 })
            .from(frs9ParamCommond)
            .where(
                and(
                    eq(frs9ParamCommond.paramCode, 'B0014'),
                    eq(frs9ParamCommond.value2, dataType)
                )
            )
            .orderBy(frs9ParamCommond.value1);

        const operators = results.map(r => r.value1);
        return c.json({ success: true, data: operators });
    } catch (error) {
        console.error('Error fetching operators:', error);
        return c.json({ error: 'Failed to fetch operators' }, 500);
    }
})

/**
 * B0015: Condition Dropdown
 * Returns distinct VALUE1 (Condition) from frs9_param_commond where param_code = 'B0015'
 */
businessSettingsRoutes.get('/conditions', async (c) => {
    try {
        const results = await db
            .selectDistinct({ value1: frs9ParamCommond.value1 })
            .from(frs9ParamCommond)
            .where(eq(frs9ParamCommond.paramCode, 'B0015'))
            .orderBy(frs9ParamCommond.value1);

        const conditions = results.map(r => r.value1);
        return c.json({ success: true, data: conditions });
    } catch (error) {
        console.error('Error fetching conditions:', error);
        return c.json({ error: 'Failed to fetch conditions' }, 500);
    }
})

/**
 * B0016: Column Values (Multi-select)
 * Returns distinct VALUE1 from frs9_param_commond 
 * where param_code = 'B0016' AND value2 = column AND value3 = table
 */
businessSettingsRoutes.get('/column-values', async (c) => {
    const column = c.req.query('column');
    const table = c.req.query('table');

    if (!column || !table) return c.json({ error: 'Column and Table parameters required' }, 400);

    try {
        const results = await db
            .select({ value1: frs9ParamCommond.value1 })
            .from(frs9ParamCommond)
            .where(
                and(
                    eq(frs9ParamCommond.paramCode, 'B0016'),
                    eq(frs9ParamCommond.value2, column),
                    eq(frs9ParamCommond.value3, table)
                )
            )
            .orderBy(frs9ParamCommond.value1);

        const values = results.map(r => r.value1);
        return c.json({ success: true, data: values });
    } catch (error) {
        console.error('Error fetching column values:', error);
        return c.json({ error: 'Failed to fetch column values' }, 500);
    }
})
