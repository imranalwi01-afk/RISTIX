import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import type { AppContext } from '../app'
import { authMiddleware } from '../middleware'
import { JournalParametersService } from '../services/journal-parameters.service'
import { runEffect } from '../lib/effect/runtime'
import { interceptCreate, interceptUpdate, interceptDelete } from '../middleware/approval-interceptor.middleware'
import type { ApprovalResponse } from '../lib/approval-helpers'

const app = new OpenAPIHono<AppContext>()

app.use('*', authMiddleware)

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const JournalParamSchema = z.object({
    glGroup: z.string().max(20).optional(),
    currency: z.string().length(3).optional(),
    glType: z.string().max(20).optional(),
    glCode: z.string().max(20).optional(),
    glNumber: z.string().max(20).optional(),
    dbcr: z.string().length(1).optional(),
    glDesc: z.string().max(255).optional(),
    activeFlag: z.boolean().default(true),
    createdby: z.string().max(50).default('SYSTEM'),
}).openapi('CreateJournalParamInput')

const UpdateJournalParamSchema = JournalParamSchema.partial().openapi('UpdateJournalParamInput')

const JournalParamResponse = z.object({
    id: z.number(),
    glGroup: z.string().nullable(),
    currency: z.string().nullable(),
    glType: z.string().nullable(),
    glCode: z.string().nullable(),
    glNumber: z.string().nullable(),
    dbcr: z.string().nullable(),
    glDesc: z.string().nullable(),
    activeFlag: z.boolean().nullable(),
    createdby: z.string().nullable(),
    createddate: z.string().nullable(),
    updatedby: z.string().nullable(),
    updateddate: z.string().nullable(),
}).openapi('JournalParamResponse')

const JournalListResponse = z.object({
    success: z.boolean(),
    data: z.array(JournalParamResponse)
}).openapi('JournalListResponse')

const JournalDetailResponse = z.object({
    success: z.boolean(),
    data: JournalParamResponse
}).openapi('JournalDetailResponse')

const OptionSchema = z.object({
    id: z.string(),
    name: z.string(),
})

const OptionListResponse = z.object({
    success: z.boolean(),
    data: z.array(OptionSchema)
}).openapi('OptionListResponse')

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
// LOOKUP ROUTES (Must be defined BEFORE parameterized routes)
// ============================================================================

const createLookupRoute = (path: string, summary: string, provider: () => any) => {
    app.openapi(
        createRoute({
            method: 'get',
            path: path,
            tags: ['Journal Parameters'],
            summary: summary,
            responses: {
                200: { content: { 'application/json': { schema: OptionListResponse } }, description: 'Options' },
                500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
            }
        }),
        async (c) => {
            return runEffect(c, provider() as any) as any
        }
    )
}

createLookupRoute('/gl-group-options', 'Get GL Group Options', JournalParametersService.getGlGroupOptions)
createLookupRoute('/currency-options', 'Get Currency Options', JournalParametersService.getCurrencyOptions)
createLookupRoute('/journal-type-options', 'Get Journal Type Options', JournalParametersService.getJournalTypeOptions)
createLookupRoute('/journal-code-options', 'Get Journal Code Options', JournalParametersService.getJournalCodeOptions)
createLookupRoute('/dbcr-options', 'Get DB/CR Options', JournalParametersService.getDbCrOptions)

// ============================================================================
// ROUTES
// ============================================================================

// GET /api/v1/banking/collective/journal
app.openapi(
    createRoute({
        method: 'get',
        path: '/',
        tags: ['Journal Parameters'],
        summary: 'List Journal Parameters',
        responses: {
            200: { content: { 'application/json': { schema: JournalListResponse } }, description: 'List Journals' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c) => {
        return runEffect(c, JournalParametersService.list() as any) as any
    }
)

// GET /api/v1/banking/collective/journal/:id
app.openapi(
    createRoute({
        method: 'get',
        path: '/{id}',
        tags: ['Journal Parameters'],
        summary: 'Get Journal Parameter',
        request: {
            params: z.object({ id: z.string().transform(Number) })
        },
        responses: {
            200: { content: { 'application/json': { schema: JournalDetailResponse } }, description: 'Journal Detail' },
            400: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Invalid ID' },
            404: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Not Found' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c) => {
        const { id } = c.req.valid('param')
        if (isNaN(id)) return c.json({ success: false, message: 'Invalid ID' } as any, 400)
        return runEffect(c, JournalParametersService.get(id) as any) as any
    }
)

// POST /api/v1/banking/collective/journal
app.openapi(
    createRoute({
        method: 'post',
        path: '/',
        tags: ['Journal Parameters'],
        summary: 'Create Journal Parameter',
        request: {
            body: { content: { 'application/json': { schema: JournalParamSchema } } }
        },
        responses: {
            201: { content: { 'application/json': { schema: JournalDetailResponse } }, description: 'Created' },
            202: { content: { 'application/json': { schema: ApprovalWorkflowResponse } }, description: 'Pending Approval' },
            400: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Invalid Input' },
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
            'journal_parameter',
            data,
            () => JournalParametersService.create(data, userId)
        )
        return runEffect(c, effect, (result: any) => result.approvalRequired ? 202 : 201)
    }
)

// PUT /api/v1/banking/collective/journal/:id
app.openapi(
    createRoute({
        method: 'put',
        path: '/{id}',
        tags: ['Journal Parameters'],
        summary: 'Update Journal Parameter',
        request: {
            params: z.object({ id: z.string().transform(Number) }),
            body: { content: { 'application/json': { schema: UpdateJournalParamSchema } } }
        },
        responses: {
            200: { content: { 'application/json': { schema: JournalDetailResponse } }, description: 'Updated' },
            202: { content: { 'application/json': { schema: ApprovalWorkflowResponse } }, description: 'Update Pending Approval' },
            400: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Invalid ID / Input' },
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
        if (isNaN(id)) return c.json({ success: false, message: 'Invalid ID' } as any, 400)

        const effect = interceptUpdate(
            tenantId,
            userId,
            userPermissions,
            'journal_parameter',
            id.toString(),
            data,
            () => JournalParametersService.update(id, data, userId)
        )
        return runEffect(c, effect, (result: any) => result.approvalRequired ? 202 : 200)
    }
)

// DELETE /api/v1/banking/collective/journal/:id
app.openapi(
    createRoute({
        method: 'delete',
        path: '/{id}',
        tags: ['Journal Parameters'],
        summary: 'Delete Journal Parameter',
        request: {
            params: z.object({ id: z.string().transform(Number) })
        },
        responses: {
            200: { content: { 'application/json': { schema: z.object({ success: z.boolean(), message: z.string() }) } }, description: 'Deleted' },
            202: { content: { 'application/json': { schema: ApprovalWorkflowResponse } }, description: 'Deletion Pending Approval' },
            400: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Invalid ID' },
            404: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Not Found' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c) => {
        const { id } = c.req.valid('param')
        const userId = c.get('userId') as string || 'system'
        const tenantId = c.get('tenantId') as string
        const userPermissions = c.get('permissions') || []
        if (isNaN(id)) return c.json({ success: false, message: 'Invalid ID' } as any, 400)

        const effect = interceptDelete(
            tenantId,
            userId,
            userPermissions,
            'journal_parameter',
            id.toString(),
            () => JournalParametersService.delete(id)
        )
        return runEffect(c, effect, (result: any) => result.approvalRequired ? 202 : 200)
    }
)

// Lookup routes moved to top to prevent shadowing

export const journalParameterRoutes = app
