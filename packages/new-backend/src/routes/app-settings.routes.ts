import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import type { AppContext } from '../app'
import { authMiddleware } from '../middleware'
import { ParametersService } from '../services/parameters.service'
import { runEffect } from '../lib/effect/runtime'

const app = new OpenAPIHono<AppContext>()

app.use('*', authMiddleware)

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const AppSettingDetailSchema = z.object({
    id: z.number(),
    param_code: z.string(),
    param_seq: z.number(),
    value1: z.string().nullable(),
    value2: z.string().nullable(),
    value3: z.string().nullable(),
    param_desc: z.string().nullable(),
    is_active: z.boolean().nullable(),
}).openapi('AppSettingDetail')

const AppSettingSchema = z.object({
    pkid: z.number().int(),
    param_code: z.string(),
    param_name: z.string().nullable(),
    param_usage: z.string().nullable(),
    param_type: z.string().nullable(),
    banking_type: z.string().nullable(),
    is_active: z.boolean().nullable(),
    requires_approval: z.boolean().nullable(),
    details: z.array(AppSettingDetailSchema).optional(),
}).openapi('AppSetting')

const CreateAppSettingSchema = z.object({
    paramCode: z.string().max(10),
    paramName: z.string().max(255),
    paramUsage: z.string().max(255).optional(),
    paramType: z.string().max(10).optional(),
    bankingType: z.enum(['conventional', 'syariah', 'dual']).default('conventional'),
    isActive: z.boolean().default(true),
    requiresApproval: z.boolean().default(false),
}).openapi('CreateAppSettingInput')

const UpdateAppSettingSchema = CreateAppSettingSchema.partial().openapi('UpdateAppSettingInput')

const CreateAppSettingDetailSchema = z.object({
    paramCode: z.string().max(50),
    paramSeq: z.number().int(),
    value1: z.string().max(100),
    value2: z.string().max(100),
    value3: z.string().max(50),
    paramdesc: z.string().max(1000),
}).openapi('CreateAppSettingDetailInput')

const AppSettingListResponse = z.object({
    success: z.boolean(),
    data: z.array(AppSettingSchema)
}).openapi('AppSettingListResponse')

const AppSettingResponse = z.object({
    success: z.boolean(),
    data: AppSettingSchema
}).openapi('AppSettingResponse')

const AppSettingDetailResponse = z.object({
    success: z.boolean(),
    data: AppSettingDetailSchema,
    message: z.string().optional()
}).openapi('AppSettingDetailResponse')

const ErrorResponse = z.object({
    success: z.boolean(),
    message: z.string(),
    error: z.string().optional()
}).openapi('ErrorResponse')

// ============================================================================
// ENDPOINTS
// ============================================================================

// GET /api/v1/app-settings
app.openapi(
    createRoute({
        method: 'get',
        path: '/',
        tags: ['Application Settings'],
        summary: 'List Application Settings',
        request: {
            query: z.object({
                code: z.string().optional()
            })
        },
        responses: {
            200: { content: { 'application/json': { schema: AppSettingListResponse } }, description: 'List Settings' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c) => {
        const { code } = c.req.valid('query')
        return runEffect(c, ParametersService.listAppSettings(code)) as any
    }
)

// GET /api/v1/app-settings/:code
app.openapi(
    createRoute({
        method: 'get',
        path: '/{code}',
        tags: ['Application Settings'],
        summary: 'Get Application Setting',
        request: {
            params: z.object({ code: z.string() })
        },
        responses: {
            200: { content: { 'application/json': { schema: AppSettingResponse } }, description: 'Setting Detail' },
            404: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Not Found' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c) => {
        const { code } = c.req.valid('param');
        return runEffect(c, ParametersService.getAppSetting(code) as any) as any
    }
)

// POST /api/v1/app-settings
app.openapi(
    createRoute({
        method: 'post',
        path: '/',
        tags: ['Application Settings'],
        summary: 'Create Application Setting',
        request: {
            body: { content: { 'application/json': { schema: CreateAppSettingSchema } } }
        },
        responses: {
            201: { content: { 'application/json': { schema: AppSettingResponse } }, description: 'Created' },
            409: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Conflict' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c) => {
        const data = c.req.valid('json');
        const userId = c.get('userId') as string || 'system';

        return runEffect(c, ParametersService.createAppSetting(data, userId)) as any
    }
)

// PUT /api/v1/app-settings/:code
app.openapi(
    createRoute({
        method: 'put',
        path: '/{code}',
        tags: ['Application Settings'],
        summary: 'Update Application Setting',
        request: {
            params: z.object({ code: z.string() }),
            body: { content: { 'application/json': { schema: UpdateAppSettingSchema } } }
        },
        responses: {
            200: { content: { 'application/json': { schema: AppSettingResponse } }, description: 'Updated' },
            404: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Not Found' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c) => {
        const { code } = c.req.valid('param');
        const data = c.req.valid('json');
        const userId = c.get('userId') as string || 'system';

        return runEffect(c, ParametersService.updateAppSetting(code, data, userId) as any) as any
    }
)

// POST /api/v1/app-settings/details
app.openapi(
    createRoute({
        method: 'post',
        path: '/details',
        tags: ['Application Settings'],
        summary: 'Create Application Setting Detail',
        request: {
            body: { content: { 'application/json': { schema: CreateAppSettingDetailSchema } } }
        },
        responses: {
            201: { content: { 'application/json': { schema: AppSettingDetailResponse } }, description: 'Created' },
            404: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Parent Not Found' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c) => {
        const data = c.req.valid('json');
        const userId = c.get('userId') as string || 'system';

        return runEffect(c, ParametersService.createAppSettingDetail(data, userId) as any) as any
    }
)

// DELETE /api/v1/app-settings/details/:id
app.openapi(
    createRoute({
        method: 'delete',
        path: '/details/{id}',
        tags: ['Application Settings'],
        summary: 'Delete Application Setting Detail',
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
        const id = c.req.valid('param').id;
        if (isNaN(id)) return c.json({ success: false, message: 'Invalid ID' }, 400);

        return runEffect(c, ParametersService.deleteAppSettingDetail(id) as any) as any
    }
)

export const appSettingsRoutes = app
