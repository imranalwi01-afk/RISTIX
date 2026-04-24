import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { Effect } from 'effect'
import type { AppContext } from '../app'
import { authMiddleware } from '../middleware'
import { JournalParametersService } from '../services/journal-parameters.service'
import { runEffect } from '../lib/effect/runtime'
import { interceptCreate, interceptUpdate, interceptDelete } from '../middleware/approval-interceptor.middleware'
import type { ApprovalResponse } from '../lib/approval-helpers'
import { buildErrorResponse } from '../lib/http/error-response'
import { openApiValidationHook } from '../lib/http/openapi-validation-hook'
import { buildListResponse, buildOffsetPagination, ListQueryValidationError, parseListQuery } from '../lib/http/list-query'

const app = new OpenAPIHono<AppContext>({ defaultHook: openApiValidationHook })

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

const JournalListContractResponse = z.object({
    success: z.boolean(),
    data: z.array(JournalParamResponse),
    pagination: z.object({
        mode: z.literal('offset'),
        limit: z.number(),
        total: z.number(),
        page: z.number(),
        offset: z.number(),
        totalPages: z.number(),
        hasNextPage: z.boolean(),
        hasPreviousPage: z.boolean(),
        nextCursor: z.null(),
        previousCursor: z.null(),
    }).optional(),
    appliedQuery: z.object({
        search: z.string().optional(),
        filters: z.record(z.string(), z.unknown()).optional(),
        sort: z.array(z.object({
            field: z.string(),
            direction: z.enum(['asc', 'desc']),
        })).optional(),
    }).optional(),
}).openapi('JournalListContractResponse')

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

const journalFilterDefinitions = {
    glCode: { field: 'glCode', label: 'GL Code', type: 'text' as const },
    glDesc: { field: 'glDesc', label: 'Description', type: 'text' as const },
    glGroup: { field: 'glGroup', label: 'GL Group', type: 'text' as const },
    glType: { field: 'glType', label: 'GL Type', type: 'text' as const },
    currency: { field: 'currency', label: 'Currency', type: 'text' as const },
    glNumber: { field: 'glNumber', label: 'GL Number', type: 'text' as const },
    dbcr: { field: 'dbcr', label: 'DB/CR', type: 'text' as const },
    activeFlag: {
        field: 'activeFlag',
        label: 'Active',
        type: 'enum' as const,
        options: [
            { label: 'Active', value: 'active' },
            { label: 'Inactive', value: 'inactive' },
            { label: 'True', value: 'true' },
            { label: 'False', value: 'false' },
        ],
    },
}

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
        request: {
            query: z.object({
                page: z.string().optional(),
                offset: z.string().optional(),
                limit: z.string().optional(),
                search: z.string().optional(),
                filters: z.string().optional(),
                sort: z.string().optional(),
                paginationMode: z.string().optional(),
                glGroup: z.string().optional(),
                currency: z.string().optional(),
                activeFlag: z.string().optional(),
            }),
        },
        responses: {
            200: { content: { 'application/json': { schema: JournalListContractResponse } }, description: 'List Journals' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c) => {
        const rawQuery = c.req.query()
        const usesListContract = ['page', 'offset', 'limit', 'search', 'filters', 'sort', 'paginationMode', 'glGroup', 'currency', 'activeFlag'].some((key) => rawQuery[key] !== undefined)

        if (!usesListContract) {
            return runEffect(c, JournalParametersService.list() as any) as any
        }

        try {
            const query = parseListQuery(c, {
                paginationMode: 'offset',
                defaultLimit: 10,
                maxLimit: 100,
                defaultSort: [{ field: 'glCode', direction: 'asc' }],
                sortableColumns: ['glCode', 'glDesc', 'glGroup', 'glType', 'currency', 'glNumber', 'dbcr', 'activeFlag', 'createddate', 'updateddate'],
                filterableColumns: ['glCode', 'glDesc', 'glGroup', 'glType', 'currency', 'glNumber', 'dbcr', 'activeFlag'],
                filterDefinitions: journalFilterDefinitions,
            })

            const result = await Effect.runPromise(JournalParametersService.listPage(query) as any) as { rows: unknown[]; total: number }

            return c.json(
                buildListResponse(
                    result.rows,
                    query,
                    buildOffsetPagination(query, result.total),
                    { filterDefinitions: journalFilterDefinitions },
                ),
            )
        } catch (error) {
            if (error instanceof ListQueryValidationError) {
                return c.json(buildErrorResponse(c, {
                    error: 'Invalid list query',
                    message: error.message,
                    code: 'BAD_REQUEST',
                    details: error.details,
                }) as any, 400)
            }
            throw error
        }
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
        if (isNaN(id)) return c.json(buildErrorResponse(c, { error: 'Invalid ID', message: 'Invalid ID', code: 'BAD_REQUEST' }) as any, 400)
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
        if (isNaN(id)) return c.json(buildErrorResponse(c, { error: 'Invalid ID', message: 'Invalid ID', code: 'BAD_REQUEST' }) as any, 400)

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
        if (isNaN(id)) return c.json(buildErrorResponse(c, { error: 'Invalid ID', message: 'Invalid ID', code: 'BAD_REQUEST' }) as any, 400)

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
