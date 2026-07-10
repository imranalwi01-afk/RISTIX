import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { Effect, pipe } from 'effect'
import { ParametersService } from '../services/parameters.service'
import { runEffect } from '../lib/effect/runtime'
import type { AppContext } from '../app'
import { authMiddleware } from '../middleware'
import {
    interceptCreate,
    interceptUpdate,
    interceptDelete,
} from '../middleware/approval-interceptor.middleware'
import type { ApprovalResponse } from '../lib/approval-helpers'
import { buildErrorResponse } from '../lib/http/error-response'
import { openApiValidationHook } from '../lib/http/openapi-validation-hook'
import { buildListResponse, buildOffsetPagination, ListQueryValidationError, parseListQuery } from '../lib/http/list-query'

const app = new OpenAPIHono<AppContext>({ defaultHook: openApiValidationHook })

// app.use('*', authMiddleware) // Removed global auth to allow public metadata endpoints

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const BusinessSettingDetailSchema = z.object({
    id: z.number(),
    param_code: z.string(),
    param_seq: z.number(),
    value1: z.string().nullable(),
    value2: z.string().nullable(),
    value3: z.string().nullable(),
    param_desc: z.string().nullable(),
    is_active: z.boolean().nullable(),
}).openapi('BusinessSettingDetail')

const BusinessSettingHeaderSchema = z.object({
    param_code: z.string(),
    param_name: z.string().nullable(),
    param_usage: z.string().nullable(),
    param_type: z.string().nullable(),
    is_active: z.boolean().nullable(),
    requires_approval: z.boolean().nullable(),
    details: z.array(BusinessSettingDetailSchema).optional(),
}).openapi('BusinessSettingHeader')

const CreateBusinessSettingSchema = z.object({
    // accept both camelCase and snake_case from the frontend
    paramCode: z.string().max(10).optional(),
    param_code: z.string().max(10).optional(),
    paramName: z.string().max(255).optional(),
    param_name: z.string().max(255).optional(),
    param_desc: z.string().max(255).optional(),
    paramUsage: z.string().max(255).optional(),
    param_usage: z.string().max(255).optional(),
    paramType: z.string().max(10).optional(),
    param_type: z.string().max(10).optional(),
    isActive: z.boolean().optional(),
    is_active: z.boolean().optional(),
    active_flag: z.boolean().optional(),
    isEditable: z.boolean().optional(),
    is_editable: z.boolean().optional(),
    requiresApproval: z.boolean().optional(),
    requires_approval: z.boolean().optional(),
}).transform(data => ({
    // normalize to camelCase and provide defaults for business settings
    paramCode: (data.param_code || data.paramCode || '').toString(),
    paramName: data.param_name || data.paramName || data.param_desc || '',
    paramUsage: data.param_usage || data.paramUsage || '',
    paramType: data.param_type || data.paramType || 'B',
    isActive: data.active_flag ?? data.is_active ?? data.isActive ?? true,
    requiresApproval: data.requires_approval ?? data.requiresApproval ?? false,
})).refine(d => typeof d.paramCode === 'string' && d.paramCode.length > 0, { message: 'paramCode is required' }).refine(d => typeof d.paramName === 'string' && d.paramName.length > 0, { message: 'paramName is required' }).openapi('CreateBusinessSettingInput')

const UpdateBusinessSettingSchema = z.object({
    paramCode: z.string().max(10).optional(),
    param_code: z.string().max(10).optional(),
    paramName: z.string().max(255).optional(),
    param_name: z.string().max(255).optional(),
    param_desc: z.string().max(255).optional(),
    paramUsage: z.string().max(255).optional(),
    param_usage: z.string().max(255).optional(),
    paramType: z.string().max(10).optional(),
    param_type: z.string().max(10).optional(),
    isActive: z.boolean().optional(),
    is_active: z.boolean().optional(),
    active_flag: z.boolean().optional(),
    isEditable: z.boolean().optional(),
    is_editable: z.boolean().optional(),
    requiresApproval: z.boolean().optional(),
    requires_approval: z.boolean().optional(),
}).transform(data => ({
    ...(data.param_code || data.paramCode ? { paramCode: data.param_code || data.paramCode } : {}),
    ...(data.param_name || data.paramName || data.param_desc ? { paramName: data.param_name || data.paramName || data.param_desc } : {}),
    ...(data.param_usage || data.paramUsage ? { paramUsage: data.param_usage || data.paramUsage } : {}),
    ...(data.param_type || data.paramType ? { paramType: data.param_type || data.paramType } : {}),
    ...(data.active_flag !== undefined || data.is_active !== undefined || data.isActive !== undefined ? { isActive: data.active_flag ?? data.is_active ?? data.isActive } : {}),
    ...(data.requires_approval !== undefined || data.requiresApproval !== undefined ? { requiresApproval: data.requires_approval ?? data.requiresApproval } : {}),
})).openapi('UpdateBusinessSettingInput')

const CreateBusinessDetailSchema = z.object({
    // Accept both snake_case and camelCase
    param_code: z.string().max(50).optional(),
    paramCode: z.string().max(50).optional(),
    param_seq: z.number().int().optional(),
    paramSeq: z.number().int().optional(),
    value1: z.string().max(100),
    value2: z.string().max(100).optional(),
    value3: z.string().max(50).optional(),
    param_desc: z.string().max(1000).optional(),
    paramdesc: z.string().max(1000).optional(),
}).transform(data => ({
    paramCode: data.param_code || data.paramCode || '',
    paramSeq: data.param_seq ?? data.paramSeq,
    value1: data.value1,
    value2: data.value2 || '',
    value3: data.value3 || '',
    paramdesc: data.param_desc || data.paramdesc || '',
})).openapi('CreateBusinessDetailInput')

const UpdateBusinessDetailSchema = z.object({
    // Accept both snake_case and camelCase for updates
    param_seq: z.number().int().optional(),
    paramSeq: z.number().int().optional(),
    value1: z.string().max(100).optional(),
    value2: z.string().max(100).optional(),
    value3: z.string().max(50).optional(),
    param_desc: z.string().max(1000).optional(),
    paramdesc: z.string().max(1000).optional(),
}).transform(data => ({
    ...(data.param_seq !== undefined || data.paramSeq !== undefined ? { paramSeq: data.param_seq ?? data.paramSeq } : {}),
    ...(data.value1 !== undefined ? { value1: data.value1 } : {}),
    ...(data.value2 !== undefined ? { value2: data.value2 } : {}),
    ...(data.value3 !== undefined ? { value3: data.value3 } : {}),
    ...(data.param_desc || data.paramdesc ? { paramdesc: data.param_desc || data.paramdesc } : {}),
})).openapi('UpdateBusinessDetailInput')

const BusinessSettingResponse = z.object({
    success: z.boolean(),
    data: BusinessSettingHeaderSchema
}).openapi('BusinessSettingResponse')

const BusinessSettingListResponse = z.object({
    success: z.boolean(),
    data: z.array(BusinessSettingHeaderSchema)
}).openapi('BusinessSettingListResponse')

const MetadataStringListResponse = z.object({
    success: z.boolean(),
    data: z.array(z.string().nullable())
}).openapi('MetadataStringListResponse')

const MetadataTypeResponse = z.object({
    success: z.boolean(),
    data: z.string().nullable()
}).openapi('MetadataTypeResponse')

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

const BusinessSettingListContractResponse = z.object({
    success: z.boolean(),
    data: z.array(BusinessSettingHeaderSchema),
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
    filterDefinitions: z.record(z.string(), z.object({
        field: z.string(),
        label: z.string().optional(),
        type: z.enum(['text', 'date', 'number', 'enum', 'boolean']),
    })).optional().optional(),
}).openapi('BusinessSettingListContractResponse')

const businessSettingFilterDefinitions = {
    commonCode: { field: 'commonCode', label: 'Code', type: 'text' as const },
    description: { field: 'description', label: 'Description', type: 'text' as const },
    value: { field: 'value', label: 'Value', type: 'text' as const },
    createdBy: { field: 'createdBy', label: 'Created By', type: 'text' as const },
    category: {
        field: 'category',
        label: 'Category',
        type: 'enum' as const,
        options: [
            { label: 'Business', value: 'B' },
            { label: 'Application', value: 'A' },
            { label: 'System', value: 'S' },
        ],
    },
}

// Export schemas for unit testing
export { CreateBusinessSettingSchema, UpdateBusinessSettingSchema }

// ============================================================================
// ENDPOINTS
// ============================================================================

// GET /api/v1/business-settings
// List Business Settings (Headers)
app.openapi(
    createRoute({
        method: 'get',
        path: '/',
        tags: ['Business Settings'],
        summary: 'List Business Settings',
        request: {
            query: z.object({
                code: z.string().optional(),
                page: z.string().optional(),
                offset: z.string().optional(),
                limit: z.string().optional(),
                search: z.string().optional(),
                filters: z.string().optional(),
                sort: z.string().optional(),
                paginationMode: z.string().optional(),
            })
        },
        responses: {
            200: { content: { 'application/json': { schema: BusinessSettingListContractResponse } }, description: 'List Settings' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c) => {
        const rawQuery = c.req.query()
        const usesListContract = ['page', 'offset', 'limit', 'search', 'filters', 'sort', 'paginationMode'].some((key) => rawQuery[key] !== undefined)

        if (!usesListContract) {
            return runEffect(c, ParametersService.listBusinessSettings() as any) as any
        }

        try {
            const query = parseListQuery(c, {
                paginationMode: 'offset',
                defaultLimit: 10,
                maxLimit: 100,
                defaultSort: [{ field: 'commonCode', direction: 'asc' }],
                sortableColumns: [
                    'commonCode',
                    'description',
                    'value',
                    'createdBy',
                    'createdDate',
                    'category',
                    'param_code',
                    'param_desc',
                    'param_value',
                    'created_by',
                    'created_date',
                    'param_category',
                ],
                filterableColumns: ['commonCode', 'description', 'value', 'createdBy', 'category'],
                filterDefinitions: businessSettingFilterDefinitions,
                filterAliases: {
                    param_code: 'commonCode',
                    param_desc: 'description',
                    param_value: 'value',
                    CommonCode: 'commonCode',
                    Description: 'description',
                    Value: 'value',
                    CreatedBy: 'createdBy',
                },
            })

            const result = await Effect.runPromise(ParametersService.listBusinessSettingsPage(query) as any) as { rows: unknown[]; total: number }

            return c.json(
                buildListResponse(
                    result.rows,
                    query,
                    buildOffsetPagination(query, result.total),
                    { filterDefinitions: businessSettingFilterDefinitions },
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

// POST /api/v1/business-settings
// Create Business Setting Header
app.openapi(
    createRoute({
        method: 'post',
        path: '/',
        tags: ['Business Settings'],
        summary: 'Create Business Setting',
        request: {
            body: { content: { 'application/json': { schema: CreateBusinessSettingSchema } } }
        },
        middleware: [authMiddleware] as const,
        responses: {
            201: { content: { 'application/json': { schema: BusinessSettingResponse } }, description: 'Created' },
            202: { content: { 'application/json': { schema: ApprovalWorkflowResponse } }, description: 'Pending Approval' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c) => {
        const tenantId = c.get('tenantId')!
        const userId = c.get('userId') as string || 'system'
        const userPermissions = (c.get('permissions') as string[]) || []
        const data = c.req.valid('json')
        data.paramType = 'B' // Enforce Business Type

        const executeCreate = (): Effect.Effect<any, any> =>
            ParametersService.createAppSetting(data, userId) as Effect.Effect<any, any>

        const effect = pipe(
            interceptCreate(
                tenantId,
                userId,
                userPermissions,
                'business_setting',
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

        return runEffect(c, effect as any, (result: any) => result.approvalRequired ? 202 : 201)
    }
)

// ============================================================================
// METADATA ENDPOINTS (Must be before dynamic routes)
// ============================================================================

// GET /api/v1/business-settings/tables
app.openapi(
    createRoute({
        method: 'get',
        path: '/tables',
        tags: ['Business Settings'],
        summary: 'Get Tables (B0012)',
        responses: {
            200: { content: { 'application/json': { schema: MetadataStringListResponse } }, description: 'List Tables' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c) => {
        return runEffect(c, ParametersService.getTables()) as any
    }
)

// GET /api/v1/business-settings/columns
app.openapi(
    createRoute({
        method: 'get',
        path: '/columns',
        tags: ['Business Settings'],
        summary: 'Get Columns (B0013)',
        request: {
            query: z.object({
                table: z.string().min(1)
            })
        },
        responses: {
            200: { content: { 'application/json': { schema: MetadataStringListResponse } }, description: 'List Columns' },
            400: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Invalid Input' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c) => {
        const { table } = c.req.valid('query')
        return runEffect(c, ParametersService.getColumns(table) as any) as any
    }
)

// GET /api/v1/business-settings/data-type
app.openapi(
    createRoute({
        method: 'get',
        path: '/data-type',
        tags: ['Business Settings'],
        summary: 'Get Data Type (B0013)',
        request: {
            query: z.object({
                column: z.string().min(1),
                table: z.string().min(1)
            })
        },
        responses: {
            200: { content: { 'application/json': { schema: MetadataTypeResponse } }, description: 'Data Type' },
            400: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Invalid Input' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c) => {
        const { column, table } = c.req.valid('query')
        return runEffect(c, ParametersService.getDataType(table, column) as any) as any
    }
)

// GET /api/v1/business-settings/operators
app.openapi(
    createRoute({
        method: 'get',
        path: '/operators',
        tags: ['Business Settings'],
        summary: 'Get Operators (B0014)',
        request: {
            query: z.object({
                dataType: z.string().min(1)
            })
        },
        responses: {
            200: { content: { 'application/json': { schema: MetadataStringListResponse } }, description: 'List Operators' },
            400: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Invalid Input' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c) => {
        const { dataType } = c.req.valid('query')
        return runEffect(c, ParametersService.getOperators(dataType) as any) as any
    }
)

// GET /api/v1/business-settings/conditions
app.openapi(
    createRoute({
        method: 'get',
        path: '/conditions',
        tags: ['Business Settings'],
        summary: 'Get Conditions (B0015)',
        responses: {
            200: { content: { 'application/json': { schema: MetadataStringListResponse } }, description: 'List Conditions' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c) => {
        return runEffect(c, ParametersService.getConditions() as any) as any
    }
)

// GET /api/v1/business-settings/column-values
app.openapi(
    createRoute({
        method: 'get',
        path: '/column-values',
        tags: ['Business Settings'],
        summary: 'Get Column Values (B0016)',
        request: {
            query: z.object({
                column: z.string().min(1),
                table: z.string().min(1)
            })
        },
        responses: {
            200: { content: { 'application/json': { schema: MetadataStringListResponse } }, description: 'List Values' },
            400: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Invalid Input' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c) => {
        const { column, table } = c.req.valid('query')
        return runEffect(c, ParametersService.getColumnValues(table, column) as any) as any
    }
)

// GET /api/v1/business-settings/:code

// Get Business Setting Header
app.openapi(
    createRoute({
        method: 'get',
        path: '/{code}',
        tags: ['Business Settings'],
        summary: 'Get Business Setting',
        request: {
            params: z.object({ code: z.string() })
        },
        middleware: [authMiddleware] as const,
        responses: {
            404: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Not Found' }
        }
    }),
    async (c) => {
        const { code } = c.req.valid('param')
        return runEffect(c, ParametersService.getAppSetting(code) as any) as any
    }
)

// GET /api/v1/business-settings/:code/details
// Get Business Setting Details
app.openapi(
    createRoute({
        method: 'get',
        path: '/{code}/details',
        tags: ['Business Settings'],
        summary: 'Get Business Setting Details',
        request: {
            params: z.object({ code: z.string() })
        },
        middleware: [authMiddleware] as const,
        responses: {
            404: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Not Found' }
        }
    }),
    async (c) => {
        const { code } = c.req.valid('param')
        return runEffect(c, ParametersService.getAppSettingDetails(code) as any) as any
    }
)

// PUT /api/v1/business-settings/:code
// Update Business Setting Header
app.openapi(
    createRoute({
        method: 'put',
        path: '/{code}',
        tags: ['Business Settings'],
        summary: 'Update Business Setting',
        request: {
            params: z.object({ code: z.string() }),
            body: { content: { 'application/json': { schema: UpdateBusinessSettingSchema } } }
        },
        middleware: [authMiddleware] as const,
        responses: {
            200: { content: { 'application/json': { schema: BusinessSettingResponse } }, description: 'Updated' },
            202: { content: { 'application/json': { schema: ApprovalWorkflowResponse } }, description: 'Update Pending Approval' },
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

        const executeUpdate = (): Effect.Effect<any, any> =>
            ParametersService.updateAppSetting(code, data, userId) as Effect.Effect<any, any>

        const effect = pipe(
            ParametersService.getAppSetting(code) as Effect.Effect<any, any>,
            Effect.flatMap((oldValues) =>
                interceptUpdate(
                    tenantId,
                    userId,
                    userPermissions,
                    'business_setting',
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

        return runEffect(c, effect as any, (result: any) => result.approvalRequired ? 202 : 200)
    }
)

// DELETE /api/v1/business-settings/:code
// Delete Business Setting Header
app.openapi(
    createRoute({
        method: 'delete',
        path: '/{code}',
        tags: ['Business Settings'],
        summary: 'Delete Business Setting',
        description: 'Deletes a business setting by its param_code',
        request: {
            params: z.object({ code: z.string() })
        },
        middleware: [authMiddleware] as const,
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

        const executeDelete = (): Effect.Effect<any, any> =>
            ParametersService.deleteAppSetting(code) as Effect.Effect<any, any>

        const effect = pipe(
            ParametersService.getAppSetting(code) as Effect.Effect<any, any>,
            Effect.flatMap((oldValues) =>
                interceptDelete(
                    tenantId,
                    userId,
                    userPermissions,
                    'business_setting',
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
                    return { success: true, approvalRequired: false, message: 'Business setting deleted successfully' }
                }
            })
        )

        return runEffect(c, effect as any, (result: any) => result.approvalRequired ? 202 : 200)
    }
)

// POST /api/v1/business-settings/:code/details
// Create Business Setting Detail (Frontend compatibility)
app.openapi(
    createRoute({
        method: 'post',
        path: '/{code}/details',
        tags: ['Business Settings'],
        summary: 'Create Business Setting Detail',
        request: {
            params: z.object({ code: z.string() }),
            body: { content: { 'application/json': { schema: CreateBusinessDetailSchema } } }
        },
        middleware: [authMiddleware] as const,
        responses: {
            201: { content: { 'application/json': { schema: z.object({ success: z.boolean(), data: BusinessSettingDetailSchema }) } }, description: 'Created' },
            202: { content: { 'application/json': { schema: ApprovalWorkflowResponse } }, description: 'Pending Approval' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c) => {
        const { code } = c.req.valid('param')
        const data = c.req.valid('json')
        const tenantId = c.get('tenantId')!
        const userId = c.get('userId') as string || 'system'
        const userPermissions = (c.get('permissions') as string[]) || []
        // Ensure paramCode matches path
        data.paramCode = code

        const executeCreate = (): Effect.Effect<any, any> =>
            ParametersService.createAppSettingDetail(data, userId) as Effect.Effect<any, any>

        const effect = pipe(
            interceptCreate(
                tenantId,
                userId,
                userPermissions,
                'business_setting',
                { ...data, parentCode: code, scope: 'detail' },
                executeCreate,
                'medium'
            ),
            Effect.map((response: ApprovalResponse) => {
                if (response.approvalRequired) {
                    return response
                }
                return { success: true, approvalRequired: false, data: response.data }
            })
        )

        return runEffect(c, effect as any, (result: any) => result.approvalRequired ? 202 : 201)
    }
)

// POST /api/v1/business-settings/details
// Create Business Setting Detail
app.openapi(
    createRoute({
        method: 'post',
        path: '/details',
        tags: ['Business Settings'],
        summary: 'Create Business Setting Detail',
        request: {
            body: { content: { 'application/json': { schema: CreateBusinessDetailSchema } } }
        },
        middleware: [authMiddleware] as const,
        responses: {
            201: { content: { 'application/json': { schema: z.object({ success: z.boolean(), data: BusinessSettingDetailSchema }) } }, description: 'Created' },
            202: { content: { 'application/json': { schema: ApprovalWorkflowResponse } }, description: 'Pending Approval' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c) => {
        const data = c.req.valid('json')
        const userId = c.get('userId') as string || 'system'
        const tenantId = c.get('tenantId')!
        const userPermissions = (c.get('permissions') as string[]) || []

        const executeCreate = (): Effect.Effect<any, any> =>
            ParametersService.createAppSettingDetail(data, userId) as Effect.Effect<any, any>

        const effect = pipe(
            interceptCreate(
                tenantId,
                userId,
                userPermissions,
                'business_setting',
                { ...data, scope: 'detail' },
                executeCreate,
                'medium'
            ),
            Effect.map((response: ApprovalResponse) => {
                if (response.approvalRequired) {
                    return response
                }
                return { success: true, approvalRequired: false, data: response.data }
            })
        )

        return runEffect(c, effect as any, (result: any) => result.approvalRequired ? 202 : 201)
    }
)

// DELETE /api/v1/business-settings/details/:id
// Delete Business Setting Detail
app.openapi(
    createRoute({
        method: 'delete',
        path: '/details/{id}',
        tags: ['Business Settings'],
        summary: 'Delete Business Setting Detail',
        request: {
            params: z.object({ id: z.string().transform(Number) })
        },
        middleware: [authMiddleware] as const,
        responses: {
            200: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Deleted' },
            202: { content: { 'application/json': { schema: ApprovalWorkflowResponse } }, description: 'Pending Approval' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c) => {
        const { id } = c.req.valid('param')
        if (isNaN(id)) return c.json(buildErrorResponse(c, { error: 'Invalid ID', message: 'Invalid ID', code: 'BAD_REQUEST' }), 400)
        const tenantId = c.get('tenantId')!
        const userId = c.get('userId') as string || 'system'
        const userPermissions = (c.get('permissions') as string[]) || []

        const executeDelete = (): Effect.Effect<any, any> =>
            ParametersService.deleteAppSettingDetail(id) as Effect.Effect<any, any>

        const effect = pipe(
            ParametersService.getAppSettingDetail(id) as Effect.Effect<any, any>,
            Effect.flatMap((oldValues) =>
                interceptDelete(
                    tenantId,
                    userId,
                    userPermissions,
                    'business_setting',
                    `detail:${id}`,
                    executeDelete,
                    'high',
                    oldValues
                )
            ),
            Effect.map((response: ApprovalResponse) => {
                if (response.approvalRequired) {
                    return response
                }
                return { success: true, approvalRequired: false, message: 'Business setting detail deleted successfully' }
            })
        )

        return runEffect(c, effect as any, (result: any) => result.approvalRequired ? 202 : 200)
    }
)

// PUT /api/v1/business-settings/details/:id
// Update Business Setting Detail
app.openapi(
    createRoute({
        method: 'put',
        path: '/details/{id}',
        tags: ['Business Settings'],
        summary: 'Update Business Setting Detail',
        request: {
            params: z.object({ id: z.string().transform(Number) }),
            body: { content: { 'application/json': { schema: UpdateBusinessDetailSchema } } }
        },
        middleware: [authMiddleware] as const,
        responses: {
            200: { content: { 'application/json': { schema: z.object({ success: z.boolean(), data: BusinessSettingDetailSchema }) } }, description: 'Updated' },
            202: { content: { 'application/json': { schema: ApprovalWorkflowResponse } }, description: 'Pending Approval' },
            400: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Invalid Input' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c) => {
        const { id } = c.req.valid('param')
        const data = c.req.valid('json')
        const userId = c.get('userId') as string || 'system'
        const tenantId = c.get('tenantId')!
        const userPermissions = (c.get('permissions') as string[]) || []

        const executeUpdate = (): Effect.Effect<any, any> =>
            ParametersService.updateAppSettingDetail(id, data, userId) as Effect.Effect<any, any>

        const effect = pipe(
            ParametersService.getAppSettingDetail(id) as Effect.Effect<any, any>,
            Effect.flatMap((oldValues) =>
                interceptUpdate(
                    tenantId,
                    userId,
                    userPermissions,
                    'business_setting',
                    `detail:${id}`,
                    { ...data, detailId: id, scope: 'detail' },
                    executeUpdate,
                    'medium',
                    oldValues
                )
            ),
            Effect.map((response: ApprovalResponse) => {
                if (response.approvalRequired) {
                    return response
                }
                return { success: true, approvalRequired: false, data: response.data }
            })
        )

        return runEffect(c, effect as any, (result: any) => result.approvalRequired ? 202 : 200)
    }
)

// ... Preserving Metadata Endpoints ...


/**
 * Business Settings Routes
 * Handles CRUD operations for Business Settings and Metadata.
 * 
 * Base Path: /api/v1/business-settings
 */
export const businessSettingsRoutes = app
