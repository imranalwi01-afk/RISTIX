import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import type { AppContext } from '../app'
import { authMiddleware } from '../middleware'
import { JournalParametersService } from '../services/journal-parameters.service'
import { runEffect } from '../lib/effect/runtime'

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
            404: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Not Found' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c) => {
        const { id } = c.req.valid('param')
        if (isNaN(id)) return c.json({ success: false, message: 'Invalid ID' }, 400)
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
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c) => {
        const data = c.req.valid('json')
        const userId = c.get('userId') as string || 'system'
        return runEffect(c, JournalParametersService.create(data, userId) as any) as any
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
            404: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Not Found' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c) => {
        const { id } = c.req.valid('param')
        const data = c.req.valid('json')
        const userId = c.get('userId') as string || 'system'
        if (isNaN(id)) return c.json({ success: false, message: 'Invalid ID' }, 400)
        return runEffect(c, JournalParametersService.update(id, data, userId) as any) as any
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
            200: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Deleted' },
            400: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Invalid ID' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c) => {
        const { id } = c.req.valid('param')
        if (isNaN(id)) return c.json({ success: false, message: 'Invalid ID' }, 400)
        return runEffect(c, JournalParametersService.delete(id) as any) as any
    }
)

// ============================================================================
// LOOKUP ROUTES
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

export default app
