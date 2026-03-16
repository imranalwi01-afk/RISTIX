import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { Effect, pipe } from 'effect'
import type { AppContext } from '../app'
import { authMiddleware } from '../middleware'
import { RuleBaseSettingsService } from '../services/rule-base-settings.service'
import { runEffect } from '../lib/effect/runtime'
import { interceptCreate, interceptUpdate, interceptDelete } from '../middleware/approval-interceptor.middleware'
import type { ApprovalResponse } from '../lib/approval-helpers'

const app = new OpenAPIHono<AppContext>()

app.use('*', authMiddleware)

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const CreateHeaderSchema = z.object({
    rule_name: z.string().min(1).max(150),
    rule_type: z.string().min(1).max(50),
    updated_table: z.string().min(1).max(30),
    updated_column: z.string().min(1).max(30),
    value: z.string().optional(),
    seq: z.number().int().default(1),
    active_flag: z.boolean().default(true),
}).openapi('CreateRuleHeaderInput')

const UpdateHeaderSchema = CreateHeaderSchema.partial().openapi('UpdateRuleHeaderInput')

const CreateDetailSchema = z.object({
    query_group: z.number().int().default(1),
    seq: z.number().int().default(1),
    table_name: z.string().min(1).max(30),
    column_name: z.string().min(1).max(30),
    data_type: z.string().min(1).max(15),
    operator: z.string().max(10).optional(),
    value1: z.string().optional(),
    value2: z.string().optional(),
    condition: z.string().max(3).default('AND'),
    detail_type: z.string().max(50).optional(),
    stage_from: z.string().max(2).optional(),
    stage_to: z.string().max(2).optional(),
}).openapi('CreateRuleDetailInput')

const UpdateDetailSchema = CreateDetailSchema.partial().openapi('UpdateRuleDetailInput')

const RuleHeaderResponse = z.object({
    id: z.number(),
    rule_name: z.string().nullable(),
    rule_type: z.string().nullable(),
    updated_table: z.string().nullable(),
    updated_column: z.string().nullable(),
    value: z.string().nullable(),
    seq: z.number().nullable(),
    active_flag: z.boolean().nullable(),
    created_by: z.string().nullable(),
    updated_by: z.string().nullable(),
    created_date: z.string().nullable(),
    updated_date: z.string().nullable(),
}).openapi('RuleHeaderResponse')

const RuleListResponse = z.object({
    success: z.boolean(),
    data: z.array(RuleHeaderResponse)
}).openapi('RuleListResponse')

const RuleDetailResponseSingle = z.object({
    success: z.boolean(),
    data: RuleHeaderResponse,
    message: z.string().optional(),
}).openapi('RuleDetailResponseSingle')

const RuleDetailSchema = z.object({
    id: z.number(),
    rule_id: z.number().nullable(),
    query_group: z.number().nullable(),
    seq: z.number().nullable(),
    table_name: z.string().nullable(),
    column_name: z.string().nullable(),
    data_type: z.string().nullable(),
    operator: z.string().nullable(),
    value1: z.string().nullable(),
    value2: z.string().nullable(),
    condition: z.string().nullable(),
    detail_type: z.string().nullable(),
    stage_from: z.string().nullable(),
    stage_to: z.string().nullable(),
    created_by: z.string().nullable(),
    updated_by: z.string().nullable(),
    created_date: z.string().nullable(),
    updated_date: z.string().nullable(),
}).openapi('RuleDetail')

const RuleDetailsListResponse = z.object({
    success: z.boolean(),
    data: z.array(RuleDetailSchema)
}).openapi('RuleDetailsListResponse')

const RuleDetailItemResponse = z.object({
    success: z.boolean(),
    data: RuleDetailSchema,
    message: z.string().optional()
}).openapi('RuleDetailItemResponse')

const MetadataOptionSchema = z.object({
    value: z.string(),
    label: z.string(),
    supportsMultiple: z.boolean().optional(),
    requiresNoValues: z.boolean().optional(),
    requiresValue2: z.boolean().optional(),
})

const MetadataListResponse = z.object({
    success: z.boolean(),
    data: z.array(MetadataOptionSchema)
}).openapi('MetadataListResponse')

const ErrorResponse = z.object({
    success: z.boolean(),
    message: z.string(),
    error: z.string().optional()
}).openapi('ErrorResponse')

const ApprovalWorkflowResponse = z.object({
    success: z.boolean(),
    approvalRequired: z.boolean(),
    requestId: z.string().optional(),
    data: z.any().optional(),
    message: z.string().optional()
}).openapi('ApprovalWorkflowResponse')

// ============================================================================
// HEADER ROUTES
// ============================================================================

/**
 * List Rule Headers.
 * Retrieve a list of rule headers with optional filtering.
 * 
 * @route GET /api/v1/banking/collective/rule-base
 */
app.openapi(
    createRoute({
        method: 'get',
        path: '/',
        tags: ['Rule Base Settings'],
        summary: 'List Rule Headers',
        request: {
            query: z.object({
                search: z.string().optional(),
                rule_type: z.string().optional(),
                active_flag: z.enum(['true', 'false']).optional()
            })
        },
        responses: {
            200: { content: { 'application/json': { schema: RuleListResponse } }, description: 'List Rules' },
            400: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Bad Request' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c) => {
        const query = c.req.valid('query')
        return runEffect(c, RuleBaseSettingsService.listHeaders({
            ...query,
            activeFlag: query.active_flag ? query.active_flag === 'true' : undefined
        }) as any) as any
    }
)

/**
 * Get Rule Header.
 * Retrieve a specific rule header by ID.
 * 
 * @route GET /api/v1/banking/collective/rule-base/:id
 */
app.openapi(
    createRoute({
        method: 'get',
        path: '/{id}',
        tags: ['Rule Base Settings'],
        summary: 'Get Rule Header',
        request: {
            params: z.object({ id: z.string().transform(Number) })
        },
        responses: {
            200: { content: { 'application/json': { schema: RuleDetailResponseSingle } }, description: 'Rule Header' },
            400: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Bad Request' },
            404: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Not Found' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c) => {
        const { id } = c.req.valid('param')
        if (isNaN(id)) return c.json({ success: false, message: 'Invalid ID' }, 400)
        return runEffect(c, RuleBaseSettingsService.getHeader(id) as any) as any
    }
)

/**
 * Create Rule Header.
 * Create a new rule header configuration.
 * 
 * @route POST /api/v1/banking/collective/rule-base
 */
app.openapi(
    createRoute({
        method: 'post',
        path: '/',
        tags: ['Rule Base Settings'],
        summary: 'Create Rule Header',
        request: {
            body: { content: { 'application/json': { schema: CreateHeaderSchema } } }
        },
        responses: {
            201: { content: { 'application/json': { schema: RuleDetailResponseSingle } }, description: 'Created' },
            202: { content: { 'application/json': { schema: ApprovalWorkflowResponse } }, description: 'Pending Approval' },
            400: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Bad Request' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c) => {
        const data = c.req.valid('json')
        const userId = c.get('userId') as string || 'system'
        const tenantId = c.get('tenantId') as string
        const userPermissions = c.get('permissions') || []

        const payload = {
            ruleName: data.rule_name,
            ruleType: data.rule_type,
            updatedTable: data.updated_table,
            updatedColumn: data.updated_column,
            value: data.value,
            seq: data.seq,
            activeFlag: data.active_flag
        }

        const effect = interceptCreate(
            tenantId,
            userId,
            userPermissions,
            'rule_base_setting',
            payload,
            () => RuleBaseSettingsService.createHeader(payload, userId) as any
        )
        return runEffect(c, effect, (result: any) => result.approvalRequired ? 202 : 201)
    }
)

/**
 * Update Rule Header.
 * Update an existing rule header configuration.
 * 
 * @route PUT /api/v1/banking/collective/rule-base/:id
 */
app.openapi(
    createRoute({
        method: 'put',
        path: '/{id}',
        tags: ['Rule Base Settings'],
        summary: 'Update Rule Header',
        request: {
            params: z.object({ id: z.string().transform(Number) }),
            body: { content: { 'application/json': { schema: UpdateHeaderSchema } } }
        },
        responses: {
            200: { content: { 'application/json': { schema: RuleDetailResponseSingle } }, description: 'Updated' },
            202: { content: { 'application/json': { schema: ApprovalWorkflowResponse } }, description: 'Update Pending Approval' },
            400: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Bad Request' },
            404: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Not Found' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c) => {
        const { id } = c.req.valid('param')
        const data = c.req.valid('json')
        const userId = c.get('userId') as string || 'system'
        const tenantId = c.get('tenantId') as string
        const userPermissions = c.get('permissions') || []
        if (isNaN(id)) return c.json({ success: false, message: 'Invalid ID' }, 400)

        const payload = {
            ruleName: data.rule_name,
            ruleType: data.rule_type,
            updatedTable: data.updated_table,
            updatedColumn: data.updated_column,
            value: data.value,
            seq: data.seq,
            activeFlag: data.active_flag
        }

        const effect = pipe(
            RuleBaseSettingsService.getHeader(id) as Effect.Effect<any, any>,
            Effect.flatMap((oldValues) =>
                interceptUpdate(
                    tenantId,
                    userId,
                    userPermissions,
                    'rule_base_setting',
                    id.toString(),
                    payload,
                    () => RuleBaseSettingsService.updateHeader(id, payload, userId) as any,
                    'medium',
                    oldValues
                )
            )
        )
        return runEffect(c, effect, (result: any) => result.approvalRequired ? 202 : 200)
    }
)

/**
 * Delete Rule Header.
 * Delete a rule header and its associated details.
 * 
 * @route DELETE /api/v1/banking/collective/rule-base/:id
 */
app.openapi(
    createRoute({
        method: 'delete',
        path: '/{id}',
        tags: ['Rule Base Settings'],
        summary: 'Delete Rule Header',
        request: {
            params: z.object({ id: z.string().transform(Number) })
        },
        responses: {
            200: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Deleted' },
            202: { content: { 'application/json': { schema: ApprovalWorkflowResponse } }, description: 'Deletion Pending Approval' },
            400: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Invalid ID' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c) => {
        const { id } = c.req.valid('param')
        const userId = c.get('userId') as string || 'system'
        const tenantId = c.get('tenantId') as string
        const userPermissions = c.get('permissions') || []
        if (isNaN(id)) return c.json({ success: false, message: 'Invalid ID' }, 400)

        const effect = pipe(
            RuleBaseSettingsService.getHeader(id) as Effect.Effect<any, any>,
            Effect.flatMap((oldValues) =>
                interceptDelete(
                    tenantId,
                    userId,
                    userPermissions,
                    'rule_base_setting',
                    id.toString(),
                    () => RuleBaseSettingsService.deleteHeader(id) as any,
                    'high',
                    oldValues
                )
            )
        )
        return runEffect(c, effect, (result: any) => result.approvalRequired ? 202 : 200)
    }
)

// ============================================================================
// DETAIL ROUTES
// ============================================================================

/**
 * List Rule Details.
 * Retrieve details for a specific rule header.
 * 
 * @route GET /api/v1/banking/collective/rule-base/:ruleId/details
 */
app.openapi(
    createRoute({
        method: 'get',
        path: '/{ruleId}/details',
        tags: ['Rule Base Settings'],
        summary: 'List Rule Details',
        request: {
            params: z.object({ ruleId: z.string().transform(Number) })
        },
        responses: {
            200: { content: { 'application/json': { schema: RuleDetailsListResponse } }, description: 'List Details' },
            400: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Bad Request' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c) => {
        const { ruleId } = c.req.valid('param')
        if (isNaN(ruleId)) return c.json({ success: false, message: 'Invalid ID' }, 400)
        return runEffect(c, RuleBaseSettingsService.listDetails(ruleId) as any) as any
    }
)

/**
 * Create Rule Detail.
 * Add a new detail condition to a rule.
 * 
 * @route POST /api/v1/banking/collective/rule-base/:ruleId/details
 */
app.openapi(
    createRoute({
        method: 'post',
        path: '/{ruleId}/details',
        tags: ['Rule Base Settings'],
        summary: 'Create Rule Detail',
        request: {
            params: z.object({ ruleId: z.string().transform(Number) }),
            body: { content: { 'application/json': { schema: CreateDetailSchema } } }
        },
        responses: {
            201: { content: { 'application/json': { schema: RuleDetailItemResponse } }, description: 'Created' },
            202: { content: { 'application/json': { schema: ApprovalWorkflowResponse } }, description: 'Pending Approval' },
            400: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Bad Request' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c) => {
        const { ruleId } = c.req.valid('param')
        const data = c.req.valid('json')
        const userId = c.get('userId') as string || 'system'
        const tenantId = c.get('tenantId') as string
        const userPermissions = c.get('permissions') || []
        if (isNaN(ruleId)) return c.json({ success: false, message: 'Invalid ID' }, 400)

        const payload = {
            queryGroup: data.query_group,
            seq: data.seq,
            tableName: data.table_name,
            columnName: data.column_name,
            dataType: data.data_type,
            operator: data.operator,
            value1: data.value1,
            value2: data.value2,
            condition: data.condition,
            detailType: data.detail_type,
            stageFrom: data.stage_from,
            stageTo: data.stage_to
        }

        const effect = interceptCreate(
            tenantId,
            userId,
            userPermissions,
            'rule_base_setting',
            { ...payload, ruleId, scope: 'detail' },
            () => RuleBaseSettingsService.createDetail(ruleId, payload, userId) as any
        )
        return runEffect(c, effect as any, (result: ApprovalResponse | { success: boolean; data: unknown }) =>
            'approvalRequired' in result && result.approvalRequired ? 202 : 201
        ) as any
    }
)

/**
 * Update Rule Detail.
 * Update an existing rule detail condition.
 * 
 * @route PUT /api/v1/banking/collective/rule-base/details/:detailId
 */
app.openapi(
    createRoute({
        method: 'put',
        path: '/details/{detailId}',
        tags: ['Rule Base Settings'],
        summary: 'Update Rule Detail',
        request: {
            params: z.object({ detailId: z.string().transform(Number) }),
            body: { content: { 'application/json': { schema: UpdateDetailSchema } } }
        },
        responses: {
            200: { content: { 'application/json': { schema: RuleDetailItemResponse } }, description: 'Updated' },
            202: { content: { 'application/json': { schema: ApprovalWorkflowResponse } }, description: 'Pending Approval' },
            400: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Bad Request' },
            404: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Not Found' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c) => {
        const { detailId } = c.req.valid('param')
        const data = c.req.valid('json')
        const userId = c.get('userId') as string || 'system'
        const tenantId = c.get('tenantId') as string
        const userPermissions = c.get('permissions') || []
        if (isNaN(detailId)) return c.json({ success: false, message: 'Invalid ID' }, 400)

        const payload = {
            queryGroup: data.query_group,
            seq: data.seq,
            tableName: data.table_name,
            columnName: data.column_name,
            dataType: data.data_type,
            operator: data.operator,
            value1: data.value1,
            value2: data.value2,
            condition: data.condition,
            detailType: data.detail_type,
            stageFrom: data.stage_from,
            stageTo: data.stage_to
        }

        const effect = pipe(
            RuleBaseSettingsService.getDetail(detailId) as Effect.Effect<any, any>,
            Effect.flatMap((oldValues) =>
                interceptUpdate(
                    tenantId,
                    userId,
                    userPermissions,
                    'rule_base_setting',
                    `detail:${detailId}`,
                    { ...payload, detailId, scope: 'detail' },
                    () => RuleBaseSettingsService.updateDetail(detailId, payload, userId) as any,
                    'medium',
                    oldValues
                )
            )
        )
        return runEffect(c, effect as any, (result: ApprovalResponse | { success: boolean; data: unknown }) =>
            'approvalRequired' in result && result.approvalRequired ? 202 : 200
        ) as any
    }
)

/**
 * Delete Rule Detail.
 * Remove a detail condition from a rule.
 * 
 * @route DELETE /api/v1/banking/collective/rule-base/details/:detailId
 */
app.openapi(
    createRoute({
        method: 'delete',
        path: '/details/{detailId}',
        tags: ['Rule Base Settings'],
        summary: 'Delete Rule Detail',
        request: {
            params: z.object({ detailId: z.string().transform(Number) })
        },
        responses: {
            200: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Deleted' },
            202: { content: { 'application/json': { schema: ApprovalWorkflowResponse } }, description: 'Pending Approval' },
            400: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Invalid ID' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c) => {
        const { detailId } = c.req.valid('param')
        const userId = c.get('userId') as string || 'system'
        const tenantId = c.get('tenantId') as string
        const userPermissions = c.get('permissions') || []
        if (isNaN(detailId)) return c.json({ success: false, message: 'Invalid ID' }, 400)

        const effect = pipe(
            RuleBaseSettingsService.getDetail(detailId) as Effect.Effect<any, any>,
            Effect.flatMap((oldValues) =>
                interceptDelete(
                    tenantId,
                    userId,
                    userPermissions,
                    'rule_base_setting',
                    `detail:${detailId}`,
                    () => RuleBaseSettingsService.deleteDetail(detailId) as any,
                    'high',
                    oldValues
                )
            )
        )
        return runEffect(c, effect as any, (result: ApprovalResponse | { success: boolean; message: string }) =>
            'approvalRequired' in result && result.approvalRequired ? 202 : 200
        ) as any
    }
)

// ============================================================================
// METADATA ROUTES
// ============================================================================

/**
 * Get Rule Types.
 * Retrieve available rule types metadata.
 * 
 * @route GET /api/v1/banking/collective/rule-base/metadata/rule-types
 */
app.openapi(
    createRoute({
        method: 'get',
        path: '/metadata/rule-types',
        tags: ['Rule Base Settings'],
        summary: 'Get Rule Types',
        responses: {
            200: { content: { 'application/json': { schema: MetadataListResponse } }, description: 'Types' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c) => {
        return runEffect(c, RuleBaseSettingsService.getRuleTypes() as any) as any
    }
)

/**
 * Get Operators.
 * Retrieve available operators for a data type.
 * 
 * @route GET /api/v1/banking/collective/rule-base/metadata/operators/:dataType
 */
app.openapi(
    createRoute({
        method: 'get',
        path: '/metadata/operators/{dataType}',
        tags: ['Rule Base Settings'],
        summary: 'Get Operators',
        request: {
            params: z.object({ dataType: z.string() })
        },
        responses: {
            200: { content: { 'application/json': { schema: MetadataListResponse } }, description: 'Operators' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c) => {
        const { dataType } = c.req.valid('param')
        return runEffect(c, RuleBaseSettingsService.getOperators(dataType) as any) as any
    }
)

/**
 * Get Conditions.
 * Retrieve available logic conditions (AND, OR).
 * 
 * @route GET /api/v1/banking/collective/rule-base/metadata/conditions
 */
app.openapi(
    createRoute({
        method: 'get',
        path: '/metadata/conditions',
        tags: ['Rule Base Settings'],
        summary: 'Get Conditions',
        responses: {
            200: { content: { 'application/json': { schema: MetadataListResponse } }, description: 'Conditions' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c) => {
        return runEffect(c, RuleBaseSettingsService.getConditions() as any) as any
    }
)

/**
 * Get Stages.
 * Retrieve available stages metadata.
 * 
 * @route GET /api/v1/banking/collective/rule-base/metadata/stages
 */
app.openapi(
    createRoute({
        method: 'get',
        path: '/metadata/stages',
        tags: ['Rule Base Settings'],
        summary: 'Get Stages',
        responses: {
            200: { content: { 'application/json': { schema: MetadataListResponse } }, description: 'Stages' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c) => {
        return runEffect(c, RuleBaseSettingsService.getStages() as any) as any
    }
)

export const ruleBaseSettingsRoutes = app
