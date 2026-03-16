import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { Effect, pipe } from 'effect'
import type { AppContext } from '../app'
import { authMiddleware } from '../middleware'
import { ParametersService } from '../services/parameters.service'
import * as auditService from '../services/audit.service'
import { runEffect } from '../lib/effect/runtime'
import { interceptCreate, interceptUpdate, interceptDelete } from '../middleware/approval-interceptor.middleware'
import type { ApprovalResponse } from '../lib/approval-helpers'

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
    is_active: z.boolean().nullable(),
    requires_approval: z.boolean().nullable(),
    details: z.array(AppSettingDetailSchema).optional(),
}).openapi('AppSetting')

const CreateAppSettingSchema = z.object({
    // Accept both camelCase and snake_case from frontend
    paramCode: z.string().max(10).optional(),
    param_code: z.string().max(10).optional(),
    paramName: z.string().max(255).optional(),
    param_name: z.string().max(255).optional(),
    paramUsage: z.string().max(255).optional(),
    param_usage: z.string().max(255).optional(),
    paramType: z.string().max(10).optional(),
    param_type: z.string().max(10).optional(),
    isActive: z.boolean().optional(),
    is_active: z.boolean().optional(),
    requiresApproval: z.boolean().optional(),
    requires_approval: z.boolean().optional(),
}).transform(data => ({
    // Normalize to camelCase, preferring snake_case if both provided
    paramCode: data.param_code || data.paramCode || '',
    paramName: data.param_name || data.paramName || '',
    paramUsage: data.param_usage || data.paramUsage || '',
    paramType: data.param_type || data.paramType || 'S',
    isActive: data.is_active ?? data.isActive ?? true,
    requiresApproval: data.requires_approval ?? data.requiresApproval ?? false,
})).openapi('CreateAppSettingInput')

const UpdateAppSettingSchema = z.object({
    // Accept both camelCase and snake_case from frontend
    paramCode: z.string().max(10).optional(),
    param_code: z.string().max(10).optional(),
    paramName: z.string().max(255).optional(),
    param_name: z.string().max(255).optional(),
    paramUsage: z.string().max(255).optional(),
    param_usage: z.string().max(255).optional(),
    paramType: z.string().max(10).optional(),
    param_type: z.string().max(10).optional(),
    isActive: z.boolean().optional(),
    is_active: z.boolean().optional(),
    requiresApproval: z.boolean().optional(),
    requires_approval: z.boolean().optional(),
}).transform(data => ({
    // Normalize to camelCase, only include defined fields
    ...(data.param_code || data.paramCode ? { paramCode: data.param_code || data.paramCode } : {}),
    ...(data.param_name || data.paramName ? { paramName: data.param_name || data.paramName } : {}),
    ...(data.param_usage || data.paramUsage ? { paramUsage: data.param_usage || data.paramUsage } : {}),
    ...(data.param_type || data.paramType ? { paramType: data.param_type || data.paramType } : {}),
    ...(data.is_active !== undefined || data.isActive !== undefined ? { isActive: data.is_active ?? data.isActive } : {}),
    ...(data.requires_approval !== undefined || data.requiresApproval !== undefined ? { requiresApproval: data.requires_approval ?? data.requiresApproval } : {}),
})).openapi('UpdateAppSettingInput')

const CreateAppSettingDetailSchema = z.object({
    // Accept both snake_case and camelCase
    param_code: z.string().max(50).optional(),
    paramCode: z.string().max(50).optional(),
    param_seq: z.number().int().optional(),
    paramSeq: z.number().int().optional(),
    value1: z.string().max(100),
    value2: z.string().max(100).optional(),
    value3: z.string().max(50).optional(),
    paramdesc: z.string().max(1000).optional(),
}).transform(data => ({
    paramCode: data.param_code || data.paramCode || '',
    paramSeq: data.param_seq ?? data.paramSeq,
    value1: data.value1,
    value2: data.value2 || '',
    value3: data.value3 || '',
    paramdesc: data.paramdesc || '',
})).openapi('CreateAppSettingDetailInput')

const UpdateAppSettingDetailSchema = z.object({
    // Accept both snake_case and camelCase
    param_seq: z.number().int().optional(),
    paramSeq: z.number().int().optional(),
    value1: z.string().max(100).optional(),
    value2: z.string().max(100).optional(),
    value3: z.string().max(50).optional(),
    paramdesc: z.string().max(1000).optional(),
}).transform(data => ({
    ...(data.param_seq !== undefined || data.paramSeq !== undefined ? { paramSeq: data.param_seq ?? data.paramSeq } : {}),
    ...(data.value1 !== undefined ? { value1: data.value1 } : {}),
    ...(data.value2 !== undefined ? { value2: data.value2 } : {}),
    ...(data.value3 !== undefined ? { value3: data.value3 } : {}),
    ...(data.paramdesc !== undefined ? { paramdesc: data.paramdesc } : {}),
})).openapi('UpdateAppSettingDetailInput')

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

// GET /api/v1/app-settings/:code/details
app.openapi(
    createRoute({
        method: 'get',
        path: '/{code}/details',
        tags: ['Application Settings'],
        summary: 'Get Application Setting Details',
        description: 'Gets detail records for a specific application setting by its param_code',
        request: {
            params: z.object({ code: z.string() })
        },
        responses: {
            200: {
                content: {
                    'application/json': {
                        schema: z.object({
                            success: z.boolean(),
                            data: z.array(AppSettingDetailSchema),
                            total: z.number(),
                            message: z.string().optional()
                        })
                    }
                },
                description: 'Detail records for the setting'
            },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c) => {
        const { code } = c.req.valid('param');
        return runEffect(c, ParametersService.getAppSettingDetails(code) as any) as any
    }
)

// POST /api/v1/app-settings/:code/details - Create a detail record for param_code
app.openapi(
    createRoute({
        method: 'post',
        path: '/{code}/details',
        tags: ['Application Settings'],
        summary: 'Create Application Setting Detail',
        description: 'Creates a new detail record for a specific application setting',
        request: {
            params: z.object({ code: z.string() }),
            body: {
                content: {
                    'application/json': {
                        schema: z.object({
                            // Accept both snake_case and camelCase
                            param_seq: z.number().int().optional(),
                            paramSeq: z.number().int().optional(),
                            value1: z.string().max(100),
                            value2: z.string().max(100).optional(),
                            value3: z.string().max(50).optional(),
                            paramdesc: z.string().max(1000).optional(),
                        }).transform(data => ({
                            paramSeq: data.param_seq ?? data.paramSeq,
                            value1: data.value1,
                            value2: data.value2 || '',
                            value3: data.value3 || '',
                            paramdesc: data.paramdesc || '',
                        }))
                    }
                }
            }
        },
        responses: {
            201: { content: { 'application/json': { schema: AppSettingDetailResponse } }, description: 'Created' },
            404: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Parent Not Found' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c) => {
        const { code } = c.req.valid('param');
        const data = c.req.valid('json');
        const userId = c.get('userId') as string || 'system';

        // Add paramCode from URL to data
        const payload = { paramCode: code, ...data };
        return runEffect(c, ParametersService.createAppSettingDetail(payload, userId) as any) as any
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
            202: { content: { 'application/json': { schema: ApprovalWorkflowResponse } }, description: 'Pending Approval' },
            409: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Conflict' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c) => {
        const tenantId = c.get('tenantId')!
        const userId = c.get('userId') as string || 'system'
        const userPermissions = (c.get('permissions') as string[]) || []
        const data = c.req.valid('json')

        const executeCreate = () => ParametersService.createAppSetting(data, userId) as Effect.Effect<any, any, never>

        const effect = pipe(
            interceptCreate(
                tenantId,
                userId,
                userPermissions,
                'parameter',
                data,
                executeCreate,
                'medium'
            ),
            Effect.map((response: ApprovalResponse) => {
                if (response.approvalRequired) {
                    return response
                } else {
                    return { success: true, approvalRequired: false, data: response.data }
                }
            })
        )
        return runEffect(c, effect, (result: any) => result.approvalRequired ? 202 : 201)
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
            202: { content: { 'application/json': { schema: ApprovalWorkflowResponse } }, description: 'Pending Approval' },
            404: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Not Found' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c) => {
        const { code } = c.req.valid('param')
        const tenantId = c.get('tenantId')!
        const userId = c.get('userId') as string || 'system'
        const userPermissions = (c.get('permissions') as string[]) || []
        const data = c.req.valid('json')

        const executeUpdate = () => ParametersService.updateAppSetting(code, data, userId) as Effect.Effect<any, any, never>

        const effect = pipe(
            ParametersService.getAppSetting(code) as Effect.Effect<any, any>,
            Effect.flatMap((oldValues) =>
                interceptUpdate(
                    tenantId,
                    userId,
                    userPermissions,
                    'parameter',
                    code,
                    data,
                    executeUpdate,
                    'medium',
                    oldValues
                )
            ),
            Effect.map((response: ApprovalResponse) => {
                if (response.approvalRequired) {
                    return response
                } else {
                    return { success: true, approvalRequired: false, data: response.data }
                }
            })
        )
        return runEffect(c, effect, (result: any) => result.approvalRequired ? 202 : 200)
    }
)

// DELETE /api/v1/app-settings/:code
app.openapi(
    createRoute({
        method: 'delete',
        path: '/{code}',
        tags: ['Application Settings'],
        summary: 'Delete Application Setting',
        description: 'Deletes an application setting by its param_code',
        request: {
            params: z.object({ code: z.string() })
        },
        responses: {
            200: { content: { 'application/json': { schema: z.object({ success: z.boolean(), message: z.string() }) } }, description: 'Deleted' },
            202: { content: { 'application/json': { schema: ApprovalWorkflowResponse } }, description: 'Deletion Pending Approval' },
            404: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Not Found' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c) => {
        const { code } = c.req.valid('param')
        const tenantId = c.get('tenantId')!
        const userId = c.get('userId')!
        const userPermissions = (c.get('permissions') as string[]) || []

        const executeDelete = () => ParametersService.deleteAppSetting(code) as Effect.Effect<any, any, never>

        const effect = pipe(
            ParametersService.getAppSetting(code) as Effect.Effect<any, any>,
            Effect.flatMap((oldValues) =>
                interceptDelete(
                    tenantId,
                    userId,
                    userPermissions,
                    'parameter',
                    code,
                    executeDelete,
                    'high',
                    oldValues
                )
            ),
            Effect.map((response: ApprovalResponse) => {
                if (response.approvalRequired) {
                    return response
                } else {
                    return { success: true, approvalRequired: false, message: 'Parameter deleted successfully' }
                }
            })
        )
        return runEffect(c, effect, (result: any) => result.approvalRequired ? 202 : 200)
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
        const tenantId = c.get('tenantId') as string

        const effect = pipe(
            ParametersService.createAppSettingDetail(data, userId) as Effect.Effect<any, any>,
            Effect.tap((created: any) =>
                Effect.tryPromise({
                    try: async () => {
                        await auditService.logDataChange.create(
                            'parameter_detail',
                            String(created.id),
                            created,
                            userId,
                            tenantId
                        )
                    },
                    catch: (error) => error
                })
            )
        )

        return runEffect(c, effect as any) as any
    }
)

// PUT /api/v1/app-settings/details/:id
app.openapi(
    createRoute({
        method: 'put',
        path: '/details/{id}',
        tags: ['Application Settings'],
        summary: 'Update Application Setting Detail',
        request: {
            params: z.object({ id: z.string().transform(Number) }),
            body: { content: { 'application/json': { schema: UpdateAppSettingDetailSchema } } }
        },
        responses: {
            200: { content: { 'application/json': { schema: AppSettingDetailResponse } }, description: 'Updated' },
            404: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Not Found' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c) => {
        const id = c.req.valid('param').id;
        const data = c.req.valid('json');
        const userId = c.get('userId') as string || 'system';
        const tenantId = c.get('tenantId') as string

        const effect = pipe(
            ParametersService.getAppSettingDetail(id) as Effect.Effect<any, any>,
            Effect.flatMap((oldValues) =>
                pipe(
                    ParametersService.updateAppSettingDetail(id, data, userId) as Effect.Effect<any, any>,
                    Effect.tap((updated: any) =>
                        Effect.tryPromise({
                            try: async () => {
                                await auditService.logDataChange.update(
                                    'parameter_detail',
                                    String(id),
                                    oldValues,
                                    updated,
                                    userId,
                                    tenantId
                                )
                            },
                            catch: (error) => error
                        })
                    )
                )
            )
        )

        return runEffect(c, effect as any) as any
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
        const userId = c.get('userId') as string || 'system'
        const tenantId = c.get('tenantId') as string

        const effect = pipe(
            ParametersService.getAppSettingDetail(id) as Effect.Effect<any, any>,
            Effect.flatMap((oldValues) =>
                pipe(
                    ParametersService.deleteAppSettingDetail(id) as Effect.Effect<any, any>,
                    Effect.tap(() =>
                        Effect.tryPromise({
                            try: async () => {
                                await auditService.logDataChange.delete(
                                    'parameter_detail',
                                    String(id),
                                    oldValues,
                                    userId,
                                    tenantId
                                )
                            },
                            catch: (error) => error
                        })
                    )
                )
            )
        )

        return runEffect(c, effect as any) as any
    }
)

export const appSettingsRoutes = app
