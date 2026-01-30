import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { legacyDb as db } from '../config'
import { frs9ImpCaFlScalarh, frs9ImpCaFlScalard } from '../db/schema'
import { eq, desc, inArray } from 'drizzle-orm'
import type { AppContext } from '../app'
import { authMiddleware } from '../middleware'

/**
 * FL Scalar Routes
 * Handles CRUD operations for Forward Looking (FL) Scalars.
 * 
 * Base Path: /api/v1/banking/collective/fl-scalar
 */
export const flScalarRoutes = new OpenAPIHono<AppContext>()

flScalarRoutes.use('*', authMiddleware)

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const CreateDetailSchema = z.object({
    period: z.number().int().min(1),
    weighted_scalar: z.number().min(0)
}).openapi('CreateFlScalarDetailInput')

const CreateFlScalarSchema = z.object({
    scalar_name: z.string().min(1).max(30),
    active_flag: z.boolean().default(true),
    details: z.array(CreateDetailSchema).optional().default([])
}).openapi('CreateFlScalarInput')

const UpdateFlScalarSchema = CreateFlScalarSchema.partial().openapi('UpdateFlScalarInput')

const FlScalarDetailSchema = z.object({
    pkid: z.number(),
    scalar_id: z.number(),
    period: z.number(),
    weighted_scalar: z.number(),
    created_by: z.string().nullable(),
    created_date: z.string().nullable(),
    updated_by: z.string().nullable(),
    updated_date: z.string().nullable(),
}).openapi('FlScalarDetail')

const FlScalarHeaderSchema = z.object({
    pkid: z.number(),
    scalar_name: z.string().nullable(), // Allow null
    active_flag: z.boolean().nullable(),
    created_by: z.string().nullable(),
    created_date: z.string().nullable(),
    updated_by: z.string().nullable(),
    updated_date: z.string().nullable(),
    details: z.array(FlScalarDetailSchema).optional()
}).openapi('FlScalarHeader')

const FlScalarListResponse = z.object({
    success: z.boolean(),
    data: z.array(FlScalarHeaderSchema),
    total: z.number(),
}).openapi('FlScalarListResponse')

const FlScalarResponse = z.object({
    success: z.boolean(),
    data: FlScalarHeaderSchema,
    message: z.string().optional()
}).openapi('FlScalarResponse')

const ErrorResponse = z.object({
    success: z.boolean(),
    message: z.string(),
    details: z.string().optional()
}).openapi('ErrorResponse')

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const transformHeader = (header: typeof frs9ImpCaFlScalarh.$inferSelect, details: (typeof frs9ImpCaFlScalard.$inferSelect)[] = []) => ({
    pkid: header.pkid,
    scalar_name: header.scalarName,
    active_flag: header.activeFlag,
    created_by: header.createdby,
    created_date: header.createddate,
    updated_by: header.updatedby,
    updated_date: header.updateddate,
    details: details.map(d => ({
        pkid: d.pkid,
        scalar_id: d.scalarId,
        period: d.period,
        weighted_scalar: d.weightedScalar,
        created_by: d.createdby,
        created_date: d.createddate,
        updated_by: d.updatedby,
        updated_date: d.updateddate,
    }))
})

// ============================================================================
// ROUTES
// ============================================================================

// GET /api/v1/banking/collective/fl-scalar
flScalarRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/',
        tags: ['FL Scalar'],
        summary: 'List FL Scalars',
        responses: {
            200: { content: { 'application/json': { schema: FlScalarListResponse } }, description: 'List Scalars' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c) => {
        try {
            // Fetch all headers
            const headers = await db
                .select()
                .from(frs9ImpCaFlScalarh)
                .orderBy(desc(frs9ImpCaFlScalarh.createddate))

            // Fetch all details if headers exist
            let allDetails: (typeof frs9ImpCaFlScalard.$inferSelect)[] = []
            if (headers.length > 0) {
                const headerIds = headers.map(h => h.pkid)
                allDetails = await db
                    .select()
                    .from(frs9ImpCaFlScalard)
                    .where(inArray(frs9ImpCaFlScalard.scalarId, headerIds))
            }

            // Map details to headers
            const result = headers.map(header => {
                const details = allDetails.filter(d => d.scalarId === header.pkid)
                return transformHeader(header, details)
            })

            return c.json({
                success: true,
                data: result,
                total: result.length,
            } as any)
        } catch (error: any) {
            console.error('Error fetching FL scalars:', error)
            return c.json({
                success: false,
                message: `Failed to load FL Scalars: ${error.message}`,
                details: error.stack
            } as any, 500)
        }
    }
)

// GET /api/v1/banking/collective/fl-scalar/:id
flScalarRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/{id}',
        tags: ['FL Scalar'],
        summary: 'Get FL Scalar',
        request: {
            params: z.object({ id: z.string().transform(Number) })
        },
        responses: {
            200: { content: { 'application/json': { schema: FlScalarResponse } }, description: 'Scalar Details' },
            400: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Bad Request' },
            404: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Not Found' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c) => {
        try {
            const { id } = c.req.valid('param')
            if (isNaN(id)) return c.json({ success: false, message: 'Invalid ID' }, 400);

            const [header] = await db
                .select()
                .from(frs9ImpCaFlScalarh)
                .where(eq(frs9ImpCaFlScalarh.pkid, id))

            if (!header) {
                return c.json({ success: false, message: 'FL Scalar not found' }, 404)
            }

            const details = await db
                .select()
                .from(frs9ImpCaFlScalard)
                .where(eq(frs9ImpCaFlScalard.scalarId, id))

            return c.json({ success: true, data: transformHeader(header, details) } as any)
        } catch (error) {
            return c.json({ success: false, message: 'Failed to fetch FL scalar' }, 500)
        }
    }
)

// POST /api/v1/banking/collective/fl-scalar
flScalarRoutes.openapi(
    createRoute({
        method: 'post',
        path: '/',
        tags: ['FL Scalar'],
        summary: 'Create FL Scalar',
        request: {
            body: { content: { 'application/json': { schema: CreateFlScalarSchema } } }
        },
        responses: {
            201: { content: { 'application/json': { schema: FlScalarResponse } }, description: 'Created' },
            400: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Bad Request' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c) => {
        try {
            const userId = c.get('userId') as string || 'SYSTEM'
            const data = c.req.valid('json')

            // Transaction to save header and details
            const result = await db.transaction(async (tx) => {
                // 1. Insert Header
                const [header] = await tx
                    .insert(frs9ImpCaFlScalarh)
                    .values({
                        scalarName: data.scalar_name,
                        activeFlag: data.active_flag,
                        createdby: userId,
                        createdhost: 'localhost',
                        createddate: new Date().toISOString(),
                        updatedby: userId,
                        updatedhost: 'localhost',
                        updateddate: new Date().toISOString()
                    } as any)
                    .returning()

                // 2. Insert Details if any
                let details: (typeof frs9ImpCaFlScalard.$inferSelect)[] = []
                if (data.details && data.details.length > 0) {
                    details = await tx
                        .insert(frs9ImpCaFlScalard)
                        .values(data.details.map(d => ({
                            scalarId: header.pkid,
                            period: d.period,
                            weightedScalar: d.weighted_scalar,
                            createdby: userId,
                            createdhost: 'localhost',
                            createddate: new Date().toISOString(),
                            updatedby: userId,
                            updatedhost: 'localhost',
                            updateddate: new Date().toISOString()
                        } as any)))
                        .returning()
                }

                return transformHeader(header, details)
            })

            return c.json({ success: true, data: result } as any, 201)
        } catch (error) {
            console.error('Error creating FL scalar:', error)
            return c.json({ success: false, message: 'Failed to create FL scalar' }, 500)
        }
    }
)

// PUT /api/v1/banking/collective/fl-scalar/:id
flScalarRoutes.openapi(
    createRoute({
        method: 'put',
        path: '/{id}',
        tags: ['FL Scalar'],
        summary: 'Update FL Scalar',
        request: {
            params: z.object({ id: z.string().transform(Number) }),
            body: { content: { 'application/json': { schema: UpdateFlScalarSchema } } }
        },
        responses: {
            200: { content: { 'application/json': { schema: FlScalarResponse } }, description: 'Updated' },
            400: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Bad Request' },
            404: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Not Found' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c) => {
        try {
            const { id } = c.req.valid('param')
            if (isNaN(id)) return c.json({ success: false, message: 'Invalid ID' }, 400);
            const userId = c.get('userId') as string || 'SYSTEM'
            const data = c.req.valid('json')

            const result = await db.transaction(async (tx) => {
                // 1. Update Header
                const [header] = await tx
                    .update(frs9ImpCaFlScalarh)
                    .set({
                        scalarName: data.scalar_name,
                        activeFlag: data.active_flag,
                        updatedby: userId,
                        updateddate: new Date().toISOString(),
                        updatedhost: 'localhost'
                    } as any)
                    .where(eq(frs9ImpCaFlScalarh.pkid, id))
                    .returning()

                if (!header) {
                    throw new Error('FL Scalar not found')
                }

                // 2. Update Details (Full Replace Strategy for simplicity)
                // First delete existing details
                await tx
                    .delete(frs9ImpCaFlScalard)
                    .where(eq(frs9ImpCaFlScalard.scalarId, id))

                // Then insert new details
                let details: (typeof frs9ImpCaFlScalard.$inferSelect)[] = []
                if (data.details && data.details.length > 0) {
                    details = await tx
                        .insert(frs9ImpCaFlScalard)
                        .values(data.details.map(d => ({
                            scalarId: id,
                            period: d.period,
                            weightedScalar: d.weighted_scalar,
                            createdby: userId,
                            createdhost: 'localhost',
                            createddate: new Date().toISOString(),
                            updatedby: userId,
                            updatedhost: 'localhost',
                            updateddate: new Date().toISOString()
                        } as any)))
                        .returning()
                }

                return transformHeader(header, details)
            })

            return c.json({ success: true, data: result } as any)
        } catch (error: any) {
            console.error('Error updating FL scalar:', error)
            if (error.message === 'FL Scalar not found') {
                return c.json({ success: false, message: 'FL Scalar not found' }, 404)
            }
            return c.json({ success: false, message: 'Failed to update FL scalar' }, 500)
        }
    }
)

// DELETE /api/v1/banking/collective/fl-scalar/:id
flScalarRoutes.openapi(
    createRoute({
        method: 'delete',
        path: '/{id}',
        tags: ['FL Scalar'],
        summary: 'Delete FL Scalar',
        request: {
            params: z.object({ id: z.string().transform(Number) })
        },
        responses: {
            200: { content: { 'application/json': { schema: z.object({ success: z.boolean(), message: z.string() }) } }, description: 'Deleted' },
            400: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Bad Request' },
            404: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Not Found' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c) => {
        try {
            const { id } = c.req.valid('param')
            if (isNaN(id)) return c.json({ success: false, message: 'Invalid ID' }, 400);

            await db.transaction(async (tx) => {
                // Delete details first (FK constraint)
                await tx.delete(frs9ImpCaFlScalard).where(eq(frs9ImpCaFlScalard.scalarId, id))
                // Delete header
                await tx.delete(frs9ImpCaFlScalarh).where(eq(frs9ImpCaFlScalarh.pkid, id))
            })

            return c.json({ success: true, message: 'Deleted successfully' } as any)
        } catch (error) {
            return c.json({ success: false, message: 'Failed to delete FL scalar' }, 500)
        }
    }
)
