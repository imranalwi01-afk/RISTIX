import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { legacyDb as db } from '../config'
import { frs9ImpCaEadConfig } from '../db/schema'
import { eq, and, like, desc } from 'drizzle-orm'
import { Effect, pipe } from 'effect'
import type { AppContext } from '../app'
import { authMiddleware } from '../middleware'
import { interceptCreate, interceptUpdate, interceptDelete } from '../middleware/approval-interceptor.middleware'
import { runEffect } from '../lib/effect/runtime'
import { buildErrorResponse } from '../lib/http/error-response'
import { openApiValidationHook } from '../lib/http/openapi-validation-hook'

export const eadConfigurationsRoutes = new OpenAPIHono<AppContext>({ defaultHook: openApiValidationHook })

eadConfigurationsRoutes.use('*', authMiddleware)

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const CreateEadConfigSchema = z.object({
    model_name: z.string().min(1).max(250).openapi({ example: 'EAD Model 2024' }),
    segment_id: z.number().int().optional(),
    ead_method: z.string().max(10).openapi({ example: 'CCF' }),
    calc_method: z.string().max(10).openapi({ example: 'Revolving' }),
    is_active: z.boolean().default(true),
}).openapi('CreateEadConfigInput')

const UpdateEadConfigSchema = CreateEadConfigSchema.partial().openapi('UpdateEadConfigInput')

const EadConfigSchema = z.object({
    id: z.number(),
    model_name: z.string().nullable(),
    segment_id: z.number().nullable().optional(),
    ead_method: z.string().nullable().optional(),
    calc_method: z.string().nullable().optional(),
    is_active: z.boolean(),
    created_by: z.string(),
    updated_by: z.string().nullable(),
    created_date: z.string(),
    updated_date: z.string().nullable(),
}).openapi('EadConfig')

const EadConfigListResponse = z.object({
    success: z.boolean(),
    data: z.array(EadConfigSchema),
}).openapi('EadConfigListResponse')

const EadConfigResponse = z.object({
    success: z.boolean(),
    data: EadConfigSchema,
    message: z.string().optional(),
}).openapi('EadConfigResponse')

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

const MetadataOptionSchema = z.object({
    value: z.string(),
    label: z.string(),
}).openapi('MetadataOption')

const MetadataResponse = z.object({
    success: z.boolean(),
    data: z.array(MetadataOptionSchema),
}).openapi('MetadataResponse')


// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const transformEadConfig = (config: typeof frs9ImpCaEadConfig.$inferSelect) => ({
    id: config.pkid,
    model_name: config.eadModelName,
    segment_id: config.segmentId,
    ead_method: config.eadMethod,
    calc_method: config.calcMethod,
    is_active: config.activeFlag,
    created_by: config.createdby,
    updated_by: config.updatedby,
    created_date: config.createddate,
    updated_date: config.updateddate,
})

const getEadConfigSnapshot = (id: number) =>
    Effect.tryPromise({
        try: async () => {
            const [config] = await db
                .select()
                .from(frs9ImpCaEadConfig)
                .where(eq(frs9ImpCaEadConfig.pkid, id))

            if (!config) {
                throw new Error('EAD configuration not found')
            }

            return transformEadConfig(config)
        },
        catch: (error: any) => error
    })

// ============================================================================
// ENDPOINTS
// ============================================================================

// GET /api/v1/banking/parameters/ead-configurations
eadConfigurationsRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/',
        tags: ['EAD Configurations'],
        summary: 'List EAD Configurations',
        request: {
            query: z.object({
                search: z.string().optional(),
                ead_method: z.string().optional(),
                is_active: z.string().optional().openapi({ description: 'true/false' }),
            } as any),
        },
        responses: {
            200: { content: { 'application/json': { schema: EadConfigListResponse } }, description: 'List Configurations' },
            400: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Bad Request' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c) => {
        try {
            const { search, ead_method, is_active } = c.req.valid('query')
            const conditions = []

            if (search) {
                conditions.push(like(frs9ImpCaEadConfig.eadModelName, `%${search}%`))
            }

            if (ead_method) {
                conditions.push(eq(frs9ImpCaEadConfig.eadMethod, ead_method))
            }

            if (is_active !== undefined) {
                conditions.push(eq(frs9ImpCaEadConfig.activeFlag, is_active === 'true'))
            }

            const configs = await db
                .select()
                .from(frs9ImpCaEadConfig)
                .where(and(...conditions))
                .orderBy(desc(frs9ImpCaEadConfig.createddate))

            return c.json({
                success: true,
                data: configs.map(transformEadConfig),
            } as any)
        } catch (error) {
            console.error('Error fetching EAD configurations:', error)
            return c.json(buildErrorResponse(c, { error: 'Failed to fetch EAD configurations', message: 'Failed to fetch EAD configurations', code: 'EAD_CONFIGURATION_ERROR', details: String(error) }), 500)
        }
    }
)

// GET /api/v1/banking/parameters/ead-configurations/:id
eadConfigurationsRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/{id}',
        tags: ['EAD Configurations'],
        summary: 'Get EAD Configuration',
        request: {
            params: z.object({ id: z.string().transform(Number) }),
        },
        responses: {
            200: { content: { 'application/json': { schema: EadConfigResponse } }, description: 'Configuration Details' },
            400: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Bad Request' },
            404: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Not Found' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c) => {
        try {
            const { id } = c.req.valid('param')
            if (isNaN(id)) return c.json(buildErrorResponse(c, { error: 'Invalid ID', message: 'Invalid ID', code: 'BAD_REQUEST' }), 400) as any;

            const [config] = await db
                .select()
                .from(frs9ImpCaEadConfig)
                .where(eq(frs9ImpCaEadConfig.pkid, id))

            if (!config) {
                return c.json(buildErrorResponse(c, { error: 'EAD configuration not found', message: 'EAD configuration not found', code: 'NOT_FOUND' }), 404) as any
            }

            return c.json({ success: true, data: transformEadConfig(config) } as any)
        } catch (error) {
            return c.json(buildErrorResponse(c, { error: 'Failed to fetch EAD configuration', message: 'Failed to fetch EAD configuration', code: 'EAD_CONFIGURATION_ERROR', details: String(error) }), 500)
        }
    }
)

// POST /api/v1/banking/parameters/ead-configurations
eadConfigurationsRoutes.openapi(
    createRoute({
        method: 'post',
        path: '/',
        tags: ['EAD Configurations'],
        summary: 'Create EAD Configuration',
        request: {
            body: { content: { 'application/json': { schema: CreateEadConfigSchema } } }
        },
        responses: {
            201: { content: { 'application/json': { schema: EadConfigResponse } }, description: 'Created' },
            202: { content: { 'application/json': { schema: ApprovalWorkflowResponse } }, description: 'Pending Approval' },
            400: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Bad Request' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c) => {
        const userId = c.get('userId') as string
        const tenantId = c.get('tenantId') as string
        const userPermissions = c.get('permissions') || []
        const data = c.req.valid('json')

        const effect = interceptCreate(
            tenantId,
            userId,
            userPermissions,
            'ead_configuration',
            data,
            () => Effect.tryPromise({
                try: async () => {
                    const [config] = await db
                        .insert(frs9ImpCaEadConfig)
                        .values({
                            eadModelName: data.model_name,
                            segmentId: data.segment_id,
                            eadMethod: data.ead_method,
                            calcMethod: data.calc_method,
                            activeFlag: data.is_active,
                            createdby: userId,
                            createdhost: 'localhost',
                            createddate: new Date().toISOString(),
                            updatedby: userId,
                            updatedhost: 'localhost',
                            updateddate: new Date().toISOString()
                        } as any)
                        .returning()
                    return { success: true, data: transformEadConfig(config) };
                },
                catch: (error) => error
            })
        )
        return runEffect(c, effect, (result: any) => result.approvalRequired ? 202 : 201)
    }
)

// PUT /api/v1/banking/parameters/ead-configurations/:id
eadConfigurationsRoutes.openapi(
    createRoute({
        method: 'put',
        path: '/{id}',
        tags: ['EAD Configurations'],
        summary: 'Update EAD Configuration',
        request: {
            params: z.object({ id: z.string().transform(Number) }),
            body: { content: { 'application/json': { schema: UpdateEadConfigSchema } } }
        },
        responses: {
            200: { content: { 'application/json': { schema: EadConfigResponse } }, description: 'Updated' },
            202: { content: { 'application/json': { schema: ApprovalWorkflowResponse } }, description: 'Update Pending Approval' },
            400: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Bad Request' },
            404: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Not Found' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c) => {
        const { id } = c.req.valid('param')
        if (isNaN(id)) return c.json(buildErrorResponse(c, { error: 'Invalid ID', message: 'Invalid ID', code: 'BAD_REQUEST' }), 400) as any;
        const userId = c.get('userId') as string
        const tenantId = c.get('tenantId') as string
        const userPermissions = c.get('permissions') || []
        const data = c.req.valid('json')

        const effect = pipe(
            getEadConfigSnapshot(id),
            Effect.flatMap((oldValues) =>
                interceptUpdate(
                    tenantId,
                    userId,
                    userPermissions,
                    'ead_configuration',
                    id.toString(),
                    data,
                    () => Effect.tryPromise({
                        try: async () => {
                            const [updated] = await db
                                .update(frs9ImpCaEadConfig)
                                .set({
                                    eadModelName: data.model_name,
                                    segmentId: data.segment_id,
                                    eadMethod: data.ead_method,
                                    calcMethod: data.calc_method,
                                    activeFlag: data.is_active,
                                    updatedby: userId,
                                    updateddate: new Date().toISOString(),
                                    updatedhost: 'localhost',
                                } as any)
                                .where(eq(frs9ImpCaEadConfig.pkid, id))
                                .returning()

                            if (!updated) {
                                throw new Error('EAD configuration not found')
                            }
                            return { success: true, data: transformEadConfig(updated) };
                        },
                        catch: (error: any) => error
                    }),
                    'medium',
                    oldValues
                )
            )
        )
        return runEffect(c, effect, (result: any) => result.approvalRequired ? 202 : 200)
    }
)

// DELETE /api/v1/banking/parameters/ead-configurations/:id
eadConfigurationsRoutes.openapi(
    createRoute({
        method: 'delete',
        path: '/{id}',
        tags: ['EAD Configurations'],
        summary: 'Delete EAD Configuration',
        request: {
            params: z.object({ id: z.string().transform(Number) }),
        },
        responses: {
            200: { content: { 'application/json': { schema: z.object({ success: z.boolean(), message: z.string() }) } }, description: 'Deleted' },
            202: { content: { 'application/json': { schema: ApprovalWorkflowResponse } }, description: 'Deletion Pending Approval' },
            400: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Bad Request' },
            404: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Not Found' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c) => {
        const { id } = c.req.valid('param')
        if (isNaN(id)) return c.json(buildErrorResponse(c, { error: 'Invalid ID', message: 'Invalid ID', code: 'BAD_REQUEST' }), 400);

        const userId = c.get('userId') as string
        const tenantId = c.get('tenantId') as string
        const userPermissions = c.get('permissions') || []

        const effect = pipe(
            getEadConfigSnapshot(id),
            Effect.flatMap((oldValues) =>
                interceptDelete(
                    tenantId,
                    userId,
                    userPermissions,
                    'ead_configuration',
                    id.toString(),
                    () => Effect.tryPromise({
                        try: async () => {
                            const [deleted] = await db
                                .delete(frs9ImpCaEadConfig)
                                .where(eq(frs9ImpCaEadConfig.pkid, id))
                                .returning()

                            if (!deleted) {
                                throw new Error('EAD configuration not found')
                            }
                            return { success: true, message: 'EAD configuration deleted successfully' };
                        },
                        catch: (error: any) => error
                    }),
                    'high',
                    oldValues
                )
            )
        )
        return runEffect(c, effect, (result: any) => result.approvalRequired ? 202 : 200)
    }
)

// METADATA
eadConfigurationsRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/metadata/methods',
        tags: ['EAD Configurations'],
        summary: 'Get EAD Methods',
        responses: {
            200: { content: { 'application/json': { schema: MetadataResponse } }, description: 'List Methods' }
        }
    }),
    async (c) => {
        return c.json({
            success: true,
            data: [
                { value: 'CCF', label: 'CCF' },
                { value: 'Prepayment', label: 'Prepayment' },
            ],
        })
    }
)

eadConfigurationsRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/metadata/calc-methods',
        tags: ['EAD Configurations'],
        summary: 'Get Calc Methods',
        responses: {
            200: { content: { 'application/json': { schema: MetadataResponse } }, description: 'List Calc Methods' }
        }
    }),
    async (c) => {
        return c.json({
            success: true,
            data: [
                { value: 'Revolving', label: 'Revolving' },
                { value: 'Term Loan', label: 'Term Loan' },
            ],
        })
    }
)
