import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import type { AppContext } from '../app'
import { openApiValidationHook } from '../lib/http/openapi-validation-hook'

/**
 * Forms Routes (STUB)
 * TODO: Implement dynamic forms engine
 */
export const formsRoutes = new OpenAPIHono<AppContext>({ defaultHook: openApiValidationHook })

// ============================================================================
// SCHEMAS
// ============================================================================

const FormFieldSchema = z.object({
    id: z.string(),
    type: z.string(),
    label: z.string(),
    required: z.boolean(),
}).openapi('FormField')

const FormSchema = z.object({
    id: z.string(),
    name: z.string(),
    fields: z.array(FormFieldSchema).optional(),
    status: z.string(),
}).openapi('Form')

const MetaSchema = z.object({
    total: z.number(),
    page: z.number(),
    limit: z.number(),
}).openapi('Meta')

const CreateFormSchema = FormSchema.omit({ id: true, status: true }).openapi('CreateFormInput')
const UpdateFormSchema = FormSchema.partial().omit({ id: true }).openapi('UpdateFormInput')

const FormListResponse = z.object({
    success: z.boolean(),
    data: z.array(FormSchema),
    meta: MetaSchema,
    message: z.string().optional(),
}).openapi('FormListResponse')

const FormResponse = z.object({
    success: z.boolean(),
    data: FormSchema,
    message: z.string().optional(),
}).openapi('FormResponse')

const SubmissionSchema = z.object({
    formId: z.string(),
    submissionId: z.string(),
    submittedAt: z.string(),
    data: z.record(z.any()).optional(),
}).openapi('FormSubmission')

const SubmissionResponse = z.object({
    success: z.boolean(),
    data: SubmissionSchema,
    message: z.string().optional(),
}).openapi('SubmissionResponse')

const SubmissionListResponse = z.object({
    success: z.boolean(),
    data: z.array(SubmissionSchema),
    meta: z.object({ formId: z.string(), total: z.number() }),
    message: z.string().optional(),
}).openapi('SubmissionListResponse')

const ErrorResponse = z.object({
    success: z.boolean(),
    message: z.string(),
}).openapi('ErrorResponse')

// ============================================================================
// FORMS ENDPOINTS
// ============================================================================

formsRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/',
        tags: ['Forms'],
        summary: 'List Forms',
        responses: {
            200: { content: { 'application/json': { schema: FormListResponse } }, description: 'Form list' }
        }
    }),
    async (c) => {
        return c.json({
            success: true,
            data: [],
            meta: { total: 0, page: 1, limit: 10 },
            message: 'Forms list - stub implementation',
        })
    }
)

formsRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/{id}',
        tags: ['Forms'],
        summary: 'Get Form',
        request: {
            params: z.object({ id: z.string() })
        },
        responses: {
            200: { content: { 'application/json': { schema: FormResponse } }, description: 'Form details' }
        }
    }),
    async (c) => {
        const id = c.req.param('id')
        return c.json({
            success: true,
            data: { id, name: 'Sample Form', fields: [], status: 'active' },
            message: 'Form detail - stub implementation',
        })
    }
)

formsRoutes.openapi(
    createRoute({
        method: 'post',
        path: '/',
        tags: ['Forms'],
        summary: 'Create Form',
        request: {
            body: { content: { 'application/json': { schema: CreateFormSchema } } }
        },
        responses: {
            201: { content: { 'application/json': { schema: FormResponse } }, description: 'Form created' }
        }
    }),
    async (c) => {
        const body = c.req.valid('json')
        return c.json({
            success: true,
            data: { id: 'new-form-id', status: 'active', name: body.name || 'New form', fields: body.fields || [] },
            message: 'Form created - stub implementation',
        }, 201)
    }
)

formsRoutes.openapi(
    createRoute({
        method: 'put',
        path: '/{id}',
        tags: ['Forms'],
        summary: 'Update Form',
        request: {
            params: z.object({ id: z.string() }),
            body: { content: { 'application/json': { schema: UpdateFormSchema } } }
        },
        responses: {
            200: { content: { 'application/json': { schema: FormResponse } }, description: 'Form updated' }
        }
    }),
    async (c) => {
        const id = c.req.param('id')
        const body = c.req.valid('json')
        return c.json({
            success: true,
            data: { id, name: body.name || 'Updated', status: 'active', fields: body.fields || [] },
            message: 'Form updated - stub implementation',
        })
    }
)

formsRoutes.openapi(
    createRoute({
        method: 'delete',
        path: '/{id}',
        tags: ['Forms'],
        summary: 'Delete Form',
        request: {
            params: z.object({ id: z.string() })
        },
        responses: {
            200: { content: { 'application/json': { schema: z.object({ success: z.boolean(), message: z.string() }) } }, description: 'Form deleted' }
        }
    }),
    async (c) => {
        const id = c.req.param('id')
        return c.json({
            success: true,
            message: `Form ${id} deleted - stub implementation`,
        })
    }
)

// Submit form data
formsRoutes.openapi(
    createRoute({
        method: 'post',
        path: '/{id}/submit',
        tags: ['Forms'],
        summary: 'Submit Form Data',
        request: {
            params: z.object({ id: z.string() }),
            body: { content: { 'application/json': { schema: z.record(z.any()) } } }
        },
        responses: {
            200: { content: { 'application/json': { schema: SubmissionResponse } }, description: 'Form submitted' }
        }
    }),
    async (c) => {
        const id = c.req.param('id')
        const body = c.req.valid('json')
        return c.json({
            success: true,
            data: {
                formId: id,
                submissionId: 'sub-' + Date.now(),
                submittedAt: new Date().toISOString(),
                data: body
            },
            message: 'Form submitted - stub implementation',
        })
    }
)

// Get form submissions
formsRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/{id}/submissions',
        tags: ['Forms'],
        summary: 'Get Form Submissions',
        request: {
            params: z.object({ id: z.string() })
        },
        responses: {
            200: { content: { 'application/json': { schema: SubmissionListResponse } }, description: 'Form submissions' }
        }
    }),
    async (c) => {
        const id = c.req.param('id')
        return c.json({
            success: true,
            data: [],
            meta: {
                formId: id,
                total: 0,
            },
            message: 'Form submissions - stub implementation',
        })
    }
)
