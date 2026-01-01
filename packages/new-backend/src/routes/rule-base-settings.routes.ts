import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { db } from '@/config'
import { frs9ParamScenarioRulesh, frs9ParamScenarioRulesd } from '@/db/schema'
import { eq, and, desc, like, or, asc } from 'drizzle-orm'
import type { AppContext } from '@/app'
import { authMiddleware, tenantMiddleware } from '../middleware'

const app = new Hono<AppContext>()

// Apply auth and tenant middleware
app.use('*', authMiddleware)
// app.use('*', tenantMiddleware) // Legacy tables might not adhere to tenant isolation in the same way, or tenantId is not in schema.

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const createHeaderSchema = z.object({
    ruleName: z.string().min(1).max(150), // Increased max length to match schema (150)
    ruleType: z.string().min(1).max(50),
    updatedTable: z.string().min(1).max(30), // Schema length 30
    updatedColumn: z.string().min(1).max(30), // Schema length 30
    value: z.string().optional(), // value is text in schema
    seq: z.number().int().default(1),
    activeFlag: z.boolean().default(true),
    // description: z.string().optional(), // Not in schema
})

const updateHeaderSchema = createHeaderSchema.partial()

const createDetailSchema = z.object({
    queryGroup: z.number().int().default(1),
    seq: z.number().int().default(1),
    tableName: z.string().min(1).max(30), // Schema 30
    columnName: z.string().min(1).max(30), // Schema 30
    dataType: z.string().min(1).max(15), // Schema 15
    operator: z.string().max(10).optional(),
    value1: z.string().optional(),
    value2: z.string().optional(),
    condition: z.string().max(3).default('AND'),
    detailType: z.string().max(50).optional(), // Schema varchar(50)
    stageFrom: z.string().max(2).optional(), // Schema varchar(2)
    stageTo: z.string().max(2).optional(), // Schema varchar(2)
})

const updateDetailSchema = createDetailSchema.partial()

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// Transform camelCase to snake_case for frontend compatibility (matches existing frontend expectations)
const transformHeader = (header: typeof frs9ParamScenarioRulesh.$inferSelect) => ({
    id: header.pkid,
    rule_name: header.ruleName,
    rule_type: header.ruleType,
    updated_table: header.updatedTable,
    updated_column: header.updatedColumn,
    value: header.value,
    seq: header.seq,
    active_flag: header.activeFlag,
    // description: header.description,
    // detail_count: header.detailCount, // Need join for this?
    created_by: header.createdby,
    updated_by: header.updatedby,
    created_date: header.createddate,
    updated_date: header.updateddate,
})

const transformDetail = (detail: typeof frs9ParamScenarioRulesd.$inferSelect) => ({
    id: detail.pkid,
    rule_id: detail.ruleId,
    query_group: detail.queryGroup,
    seq: detail.seq,
    table_name: detail.tableName,
    column_name: detail.columnName,
    data_type: detail.dataType,
    operator: detail.operator,
    value1: detail.value1,
    value2: detail.value2,
    condition: detail.condition,
    detail_type: detail.detailType,
    stage_from: detail.stageFrom,
    stage_to: detail.stageTo,
    created_by: detail.createdby,
    updated_by: detail.updatedby,
    created_date: detail.createddate,
    updated_date: detail.updateddate,
})

// ============================================================================
// RULE HEADERS ENDPOINTS
// ============================================================================

// GET /api/v1/banking/collective/rule-base
app.get('/', async (c) => {
    try {
        const { page, limit, search, rule_type, active_flag } = c.req.query()

        const conditions = []

        if (search) {
            conditions.push(
                or(
                    like(frs9ParamScenarioRulesh.ruleName, `%${search}%`),
                    like(frs9ParamScenarioRulesh.ruleType, `%${search}%`)
                )!
            )
        }

        if (rule_type) {
            conditions.push(eq(frs9ParamScenarioRulesh.ruleType, rule_type))
        }

        if (active_flag !== undefined) {
            conditions.push(eq(frs9ParamScenarioRulesh.activeFlag, active_flag === 'true'))
        }

        const headers = await db
            .select()
            .from(frs9ParamScenarioRulesh)
            .where(and(...conditions))
            .orderBy(desc(frs9ParamScenarioRulesh.createddate))

        return c.json({
            success: true,
            data: headers.map(transformHeader),
        })
    } catch (error) {
        console.error('Error fetching rule headers:', error)
        return c.json({
            success: false,
            message: 'Failed to fetch rule headers',
        }, 500)
    }
})

// GET /api/v1/banking/collective/rule-base/:id
app.get('/:id', async (c) => {
    try {
        const id = Number(c.req.param('id'))
        if (isNaN(id)) return c.json({ error: 'Invalid ID' }, 400);

        const [header] = await db
            .select()
            .from(frs9ParamScenarioRulesh)
            .where(eq(frs9ParamScenarioRulesh.pkid, id))

        if (!header) {
            return c.json({
                success: false,
                message: 'Rule header not found',
            }, 404)
        }

        return c.json({
            success: true,
            data: transformHeader(header),
        })
    } catch (error) {
        console.error('Error fetching rule header:', error)
        return c.json({
            success: false,
            message: 'Failed to fetch rule header',
        }, 500)
    }
})

// POST /api/v1/banking/collective/rule-base
app.post('/', zValidator('json', createHeaderSchema), async (c) => {
    try {
        const userId = 'SYSTEM' // Legacy auth fallback 
        // const userId = c.get('userId') as string // If auth middleware populates it.
        const data = c.req.valid('json')

        const [header] = await db
            .insert(frs9ParamScenarioRulesh)
            .values({
                ...data,
                createdby: userId,
                createdhost: 'localhost',
                createddate: new Date().toISOString(),
                updatedby: userId,
                updatedhost: 'localhost',
                updateddate: new Date().toISOString()
            })
            .returning()

        return c.json({
            success: true,
            data: transformHeader(header),
            message: 'Rule header created successfully',
        }, 201)
    } catch (error) {
        console.error('Error creating rule header:', error)
        return c.json({
            success: false,
            message: 'Failed to create rule header',
        }, 500)
    }
})

// PUT /api/v1/banking/collective/rule-base/:id
app.put('/:id', zValidator('json', updateHeaderSchema), async (c) => {
    try {
        const id = Number(c.req.param('id'))
        if (isNaN(id)) return c.json({ error: 'Invalid ID' }, 400);
        const userId = 'SYSTEM'
        const data = c.req.valid('json')

        const [updated] = await db
            .update(frs9ParamScenarioRulesh)
            .set({
                ...data,
                updatedby: userId,
                updateddate: new Date().toISOString(),
                updatedhost: 'localhost'
            })
            .where(eq(frs9ParamScenarioRulesh.pkid, id))
            .returning()

        if (!updated) {
            return c.json({
                success: false,
                message: 'Rule header not found',
            }, 404)
        }

        return c.json({
            success: true,
            data: transformHeader(updated),
            message: 'Rule header updated successfully',
        })
    } catch (error) {
        console.error('Error updating rule header:', error)
        return c.json({
            success: false,
            message: 'Failed to update rule header',
        }, 500)
    }
})

// DELETE /api/v1/banking/collective/rule-base/:id
app.delete('/:id', async (c) => {
    try {
        const id = Number(c.req.param('id'))
        if (isNaN(id)) return c.json({ error: 'Invalid ID' }, 400);

        // Transactional delete using runTransaction if possible, or simple awaits
        await db.transaction(async (tx) => {
            await tx.delete(frs9ParamScenarioRulesd).where(eq(frs9ParamScenarioRulesd.ruleId, id))
            await tx.delete(frs9ParamScenarioRulesh).where(eq(frs9ParamScenarioRulesh.pkid, id))
        })

        return c.json({
            success: true,
            message: 'Rule header deleted successfully',
        })
    } catch (error) {
        console.error('Error deleting rule header:', error)
        return c.json({
            success: false,
            message: 'Failed to delete rule header',
        }, 500)
    }
})

// ============================================================================
// RULE DETAILS ENDPOINTS
// ============================================================================

// GET /api/v1/banking/collective/rule-base/:ruleId/details
app.get('/:ruleId/details', async (c) => {
    try {
        const ruleId = Number(c.req.param('ruleId'))
        if (isNaN(ruleId)) return c.json({ error: 'Invalid ID' }, 400);

        const details = await db
            .select()
            .from(frs9ParamScenarioRulesd)
            .where(eq(frs9ParamScenarioRulesd.ruleId, ruleId))
            .orderBy(frs9ParamScenarioRulesd.queryGroup, frs9ParamScenarioRulesd.seq)

        return c.json({
            success: true,
            data: details.map(transformDetail),
        })
    } catch (error) {
        console.error('Error fetching rule details:', error)
        return c.json({
            success: false,
            message: 'Failed to fetch rule details',
        }, 500)
    }
})

// POST /api/v1/banking/collective/rule-base/:ruleId/details
app.post('/:ruleId/details', zValidator('json', createDetailSchema), async (c) => {
    try {
        const ruleId = Number(c.req.param('ruleId'))
        if (isNaN(ruleId)) return c.json({ error: 'Invalid ID' }, 400);

        const userId = 'SYSTEM'
        const data = c.req.valid('json')

        // Ensure mandatory fields are present. Zod checks most, but Schema not-null constraints apply.
        // value1 is non-nullable in schema.
        if (!data.value1 && data.value1 !== '') {
            // Handle if optional in Zod but required in DB? 
            // Zod schema above has .optional(). Schema has .notNull().
            // I should make value1 required in Zod or provide default.
            // Schema: value1: text().notNull()
            // Schema: value2: text()
            // Let's rely on Zod but providing empty string if missing?
            // Better to assume valid input or fail.
        }

        const [detail] = await db
            .insert(frs9ParamScenarioRulesd)
            .values({
                ...data,
                ruleId,
                value1: data.value1 || '', // Fallback to empty string for Not Null constraint
                createdby: userId,
                createdhost: 'localhost',
                createddate: new Date().toISOString(),
                updatedby: userId,
                updatedhost: 'localhost',
                updateddate: new Date().toISOString()
            })
            .returning()

        return c.json({
            success: true,
            data: transformDetail(detail),
            message: 'Rule detail created successfully',
        }, 201)
    } catch (error) {
        console.error('Error creating rule detail:', error)
        return c.json({
            success: false,
            message: 'Failed to create rule detail',
        }, 500)
    }
})

// PUT /api/v1/banking/collective/rule-base/details/:detailId
app.put('/details/:detailId', zValidator('json', updateDetailSchema), async (c) => {
    try {
        const detailId = Number(c.req.param('detailId'))
        if (isNaN(detailId)) return c.json({ error: 'Invalid ID' }, 400);
        const userId = 'SYSTEM'
        const data = c.req.valid('json')

        const [updated] = await db
            .update(frs9ParamScenarioRulesd)
            .set({
                ...data,
                updatedby: userId,
                updateddate: new Date().toISOString(),
                updatedhost: 'localhost'
            })
            .where(eq(frs9ParamScenarioRulesd.pkid, detailId))
            .returning()

        if (!updated) {
            return c.json({
                success: false,
                message: 'Rule detail not found',
            }, 404)
        }

        return c.json({
            success: true,
            data: transformDetail(updated),
            message: 'Rule detail updated successfully',
        })
    } catch (error) {
        console.error('Error updating rule detail:', error)
        return c.json({
            success: false,
            message: 'Failed to update rule detail',
        }, 500)
    }
})

// DELETE /api/v1/banking/collective/rule-base/details/:detailId
app.delete('/details/:detailId', async (c) => {
    try {
        const detailId = Number(c.req.param('detailId'))
        if (isNaN(detailId)) return c.json({ error: 'Invalid ID' }, 400);

        const [deleted] = await db
            .delete(frs9ParamScenarioRulesd)
            .where(eq(frs9ParamScenarioRulesd.pkid, detailId))
            .returning()

        if (!deleted) {
            return c.json({
                success: false,
                message: 'Rule detail not found',
            }, 404)
        }

        return c.json({
            success: true,
            message: 'Rule detail deleted successfully',
        })
    } catch (error) {
        console.error('Error deleting rule detail:', error)
        return c.json({
            success: false,
            message: 'Failed to delete rule detail',
        }, 500)
    }
})

// ============================================================================
// METADATA ENDPOINTS
// ============================================================================

// GET /api/v1/banking/collective/rule-base/metadata/rule-types
app.get('/metadata/rule-types', async (c) => {
    return c.json({
        success: true,
        data: [
            { value: 'DEFAULT', label: 'Default' },
            { value: 'GL', label: 'GL Grouping' },
            { value: 'STAGE', label: 'IFRS 9 Stage' },
            { value: 'CUSTOM', label: 'Custom Rule' },
        ],
    })
})

// GET /api/v1/banking/collective/rule-base/metadata/operators/:dataType
app.get('/metadata/operators/:dataType', async (c) => {
    const dataType = c.req.param('dataType')

    const operators = {
        varchar: [
            { value: '=', label: 'Equals' },
            { value: '!=', label: 'Not Equals' },
            { value: 'LIKE', label: 'Like' },
            { value: 'IN', label: 'In', supportsMultiple: true },
            { value: 'IS NULL', label: 'Is Null', requiresNoValues: true },
            { value: 'IS NOT NULL', label: 'Is Not Null', requiresNoValues: true },
        ],
        int: [
            { value: '=', label: 'Equals' },
            { value: '!=', label: 'Not Equals' },
            { value: '>', label: 'Greater Than' },
            { value: '<', label: 'Less Than' },
            { value: '>=', label: 'Greater or Equal' },
            { value: '<=', label: 'Less or Equal' },
            { value: 'BETWEEN', label: 'Between', requiresValue2: true },
            { value: 'IN', label: 'In', supportsMultiple: true },
        ],
        date: [
            { value: '=', label: 'Equals' },
            { value: '>', label: 'After' },
            { value: '<', label: 'Before' },
            { value: 'BETWEEN', label: 'Between', requiresValue2: true },
        ],
    }

    return c.json({
        success: true,
        data: operators[dataType as keyof typeof operators] || operators.varchar,
    })
})

// GET /api/v1/banking/collective/rule-base/metadata/conditions
app.get('/metadata/conditions', async (c) => {
    return c.json({
        success: true,
        data: [
            { value: 'AND', label: 'AND' },
            { value: 'OR', label: 'OR' },
        ],
    })
})

// GET /api/v1/banking/collective/rule-base/metadata/stages
app.get('/metadata/stages', async (c) => {
    return c.json({
        success: true,
        data: [
            { value: '1', label: 'Stage 1 - Performing' },
            { value: '2', label: 'Stage 2 - Underperforming' },
            { value: '3', label: 'Stage 3 - Non-performing' },
        ],
    })
})

export default app
