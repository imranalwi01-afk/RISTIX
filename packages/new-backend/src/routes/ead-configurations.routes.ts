import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { legacyDb as db } from '../config'
import { frs9ImpCaEadConfig } from '../db/schema'
import { eq, and, like, desc } from 'drizzle-orm'
import type { AppContext } from '../app'
import { authMiddleware } from '../middleware'

export const eadConfigurationsRoutes = new OpenAPIHono<AppContext>()

eadConfigurationsRoutes.use('*', authMiddleware)

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const CreateEadConfigSchema = z.object({
    modelName: z.string().min(1).max(250).openapi({ example: 'EAD Model 2024' }),
    segmentId: z.number().int().optional(),
    eadMethod: z.string().max(10).openapi({ example: 'CCF' }),
    calcMethod: z.string().max(10).openapi({ example: 'Revolving' }),
    isActive: z.boolean().default(true),
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
            return c.json({ success: false, message: 'Failed to fetch EAD configurations', error: String(error) }, 500)
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
            404: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Not Found' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c) => {
        try {
            const { id } = c.req.valid('param')
            if (isNaN(id)) return c.json({ success: false, message: 'Invalid ID' }, 400) as any;

            const [config] = await db
                .select()
                .from(frs9ImpCaEadConfig)
                .where(eq(frs9ImpCaEadConfig.pkid, id))

            if (!config) {
                return c.json({ success: false, message: 'EAD configuration not found' }, 404) as any
            }

            return c.json({ success: true, data: transformEadConfig(config) } as any)
        } catch (error) {
            return c.json({ success: false, message: 'Failed to fetch EAD configuration', error: String(error) }, 500)
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
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c) => {
        try {
            const userId = c.get('userId') as string
            const data = c.req.valid('json')

            const [config] = await db
                .insert(frs9ImpCaEadConfig)
                .values({
                    eadModelName: data.modelName,
                    segmentId: data.segmentId,
                    eadMethod: data.eadMethod,
                    calcMethod: data.calcMethod,
                    activeFlag: data.isActive,
                    createdby: userId,
                    createdhost: 'localhost',
                    createddate: new Date().toISOString(),
                    updatedby: userId,
                    updatedhost: 'localhost',
                    updateddate: new Date().toISOString()
                } as any)
                .returning()

            return c.json({
                success: true,
                data: transformEadConfig(config),
                message: 'EAD configuration created successfully',
            } as any, 201)
        } catch (error) {
            console.error('Error creating EAD configuration:', error)
            return c.json({ success: false, message: 'Failed to create EAD configuration', error: String(error) }, 500)
        }
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
            404: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Not Found' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c) => {
        try {
            const { id } = c.req.valid('param')
            if (isNaN(id)) return c.json({ success: false, message: 'Invalid ID' }, 400) as any;
            const userId = c.get('userId') as string
            const data = c.req.valid('json')

            const [updated] = await db
                .update(frs9ImpCaEadConfig)
                .set({
                    eadModelName: data.modelName,
                    segmentId: data.segmentId,
                    eadMethod: data.eadMethod,
                    calcMethod: data.calcMethod,
                    activeFlag: data.isActive,
                    updatedby: userId,
                    updateddate: new Date().toISOString(),
                    updatedhost: 'localhost',
                } as any)
                .where(eq(frs9ImpCaEadConfig.pkid, id))
                .returning()

            if (!updated) {
                return c.json({ success: false, message: 'EAD configuration not found' }, 404)
            }

            return c.json({
                success: true,
                data: transformEadConfig(updated),
                message: 'EAD configuration updated successfully',
            } as any)
        } catch (error) {
            console.error('Error updating EAD configuration:', error)
            return c.json({ success: false, message: 'Failed to update EAD configuration', error: String(error) }, 500)
        }
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
            404: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Not Found' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c) => {
        try {
            const { id } = c.req.valid('param')
            if (isNaN(id)) return c.json({ success: false, message: 'Invalid ID' }, 400);

            const [deleted] = await db
                .delete(frs9ImpCaEadConfig)
                .where(eq(frs9ImpCaEadConfig.pkid, id))
                .returning()

            if (!deleted) {
                return c.json({ success: false, message: 'EAD configuration not found' }, 404) as any
            }

            return c.json({ success: true, message: 'EAD configuration deleted successfully' } as any)
        } catch (error) {
            return c.json({ success: false, message: 'Failed to delete EAD configuration', error: String(error) }, 500) as any
        }
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
