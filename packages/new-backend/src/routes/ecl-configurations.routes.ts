import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import type { AppContext } from '../app'
import { authMiddleware } from '../middleware'
import { EclConfigurationsService } from '../services/ecl-configurations.service'
import { runEffect } from '../lib/effect/runtime'
import { interceptCreate, interceptUpdate, interceptDelete } from '../middleware/approval-interceptor.middleware'
import type { ApprovalResponse } from '../lib/approval-helpers'

const app = new OpenAPIHono<AppContext>()

app.use('*', authMiddleware)

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const EclDetailItemSchema = z.object({
    id: z.number(),
    pf_segment_id: z.number().nullable(),
    stage_rule_id: z.number().nullable(),
    pd_model_id: z.number().nullable(),
    lgd_model_id: z.number().nullable(),
    ead_model_id: z.number().nullable(),
    overlay_rate: z.number().nullable(),
    period_type: z.number().nullable(),
    period_date: z.string().nullable(),
}).openapi('EclDetailItem')

const EclHeaderSchema = z.object({
    id: z.number(),
    model_name: z.string().nullable(),
    module: z.string().nullable(),
    effective_date: z.string().nullable(),
    active_flag: z.boolean().nullable(),
    last_run_period: z.string().nullable(),
    last_run_status: z.number().nullable(),
    last_run_date: z.string().nullable(),
    created_by: z.string().nullable(),
    created_date: z.string().nullable(),
}).openapi('EclHeader')

const EclResponse = z.object({
    success: z.boolean(),
    data: EclHeaderSchema.extend({
        details: z.array(EclDetailItemSchema).optional()
    }),
    message: z.string().optional()
}).openapi('EclResponse')

const EclListResponse = z.object({
    success: z.boolean(),
    data: z.array(EclHeaderSchema)
}).openapi('EclListResponse')

const EclDetailInputSchema = z.object({
    pkid: z.number().int().optional(),
    pfSegmentId: z.number().int().optional(),
    stageRuleId: z.number().int().optional(),
    pdModelId: z.number().int().optional(),
    lgdModelId: z.number().int().optional(),
    eadModelId: z.number().int().optional(),
    overlayRate: z.number().optional().default(100),
    periodType: z.number().int().optional(),
    periodDate: z.string().optional(),
}).openapi('EclDetailInput')

const CreateEclConfigSchema = z.object({
    modelName: z.string().min(1).max(50),
    module: z.string().max(10).optional(),
    effectiveDate: z.string(),
    activeFlag: z.boolean().default(true),
    details: z.array(EclDetailInputSchema).optional(),
}).openapi('CreateEclConfigInput')

const UpdateEclConfigSchema = CreateEclConfigSchema.partial().openapi('UpdateEclConfigInput')

const ErrorResponse = z.object({
    success: z.boolean(),
    message: z.string()
}).openapi('ErrorResponse')

const ApprovalWorkflowResponse = z.object({
    success: z.boolean(),
    approvalRequired: z.boolean(),
    requestId: z.string().optional(),
    data: z.any().optional(),
    message: z.string().optional()
}).openapi('ApprovalWorkflowResponse')

// ============================================================================
// ENDPOINTS
// ============================================================================

// GET /api/v1/banking/collective/ecl-configurations
app.openapi(
    createRoute({
        method: 'get',
        path: '/',
        tags: ['ECL Configurations'],
        summary: 'List ECL Configurations',
        responses: {
            200: { content: { 'application/json': { schema: EclListResponse } }, description: 'List' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c) => {
        return runEffect(c, EclConfigurationsService.list() as any) as any
    }
)

app.openapi(
    createRoute({
        method: 'get',
        path: '/{id}',
        tags: ['ECL Configurations'],
        summary: 'Get ECL Configuration',
        request: {
            params: z.object({ id: z.string().transform(Number) })
        },
        responses: {
            200: { content: { 'application/json': { schema: EclResponse } }, description: 'Detail' },
            404: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Not found' }
        }
    }),
    async (c) => {
        const { id } = c.req.valid('param')
        if (isNaN(id)) return c.json({ success: false, message: 'Invalid ID' }, 400)
        return runEffect(c, EclConfigurationsService.get(id) as any) as any
    }
)

app.openapi(
    createRoute({
        method: 'post',
        path: '/',
        tags: ['ECL Configurations'],
        summary: 'Create ECL Configuration',
        request: {
            body: { content: { 'application/json': { schema: CreateEclConfigSchema } } }
        },
        responses: {
            201: { content: { 'application/json': { schema: EclResponse } }, description: 'Created' },
            202: { content: { 'application/json': { schema: ApprovalWorkflowResponse } }, description: 'Pending Approval' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c) => {
        const data = c.req.valid('json')
        const userId = c.get('userId') as string || 'system'
        const tenantId = c.get('tenantId') as string
        const userPermissions = c.get('permissions') || []

        const effect = interceptCreate(
            tenantId,
            userId,
            userPermissions,
            'ecl_configuration',
            data,
            () => EclConfigurationsService.create(data, userId) as any
        )

        const result = await runEffect(c, effect)
        return c.json(result, result.approvalRequired ? 202 : 201)
    }
)

app.openapi(
    createRoute({
        method: 'put',
        path: '/{id}',
        tags: ['ECL Configurations'],
        summary: 'Update ECL Configuration',
        request: {
            params: z.object({ id: z.string().transform(Number) }),
            body: { content: { 'application/json': { schema: UpdateEclConfigSchema } } }
        },
        responses: {
            200: { content: { 'application/json': { schema: EclResponse } }, description: 'Updated' },
            202: { content: { 'application/json': { schema: ApprovalWorkflowResponse } }, description: 'Update Pending Approval' },
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

        const effect = interceptUpdate(
            tenantId,
            userId,
            userPermissions,
            'ecl_configuration',
            id.toString(),
            data,
            () => EclConfigurationsService.update(id, data, userId) as any
        )

        const result = await runEffect(c, effect)
        return c.json(result, result.approvalRequired ? 202 : 200)
    }
)

app.openapi(
    createRoute({
        method: 'delete',
        path: '/{id}',
        tags: ['ECL Configurations'],
        summary: 'Delete ECL Configuration',
        request: {
            params: z.object({ id: z.string().transform(Number) })
        },
        responses: {
            200: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Deleted' },
            202: { content: { 'application/json': { schema: ApprovalWorkflowResponse } }, description: 'Deletion Pending Approval' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c) => {
        const { id } = c.req.valid('param')
        const userId = c.get('userId') as string || 'system'
        const tenantId = c.get('tenantId') as string
        const userPermissions = c.get('permissions') || []

        if (isNaN(id)) return c.json({ success: false, message: 'Invalid ID' }, 400)

        const effect = interceptDelete(
            tenantId,
            userId,
            userPermissions,
            'ecl_configuration',
            id.toString(),
            () => EclConfigurationsService.delete(id) as any
        )

        const result = await runEffect(c, effect)
        return c.json(result, result.approvalRequired ? 202 : 200)
    }
)

export const eclConfigurationsRoutes = app
