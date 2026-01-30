import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { legacyDb as db } from '../config'
import { frs9ParamSegmenth } from '../db/schema'
import { eq, and, like, desc } from 'drizzle-orm'
import type { AppContext } from '../app'
import { authMiddleware } from '../middleware'

export const populationSegmentsRoutes = new OpenAPIHono<AppContext>()

populationSegmentsRoutes.use('*', authMiddleware)

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const SegmentSchema = z.object({
    id: z.number(),
    segment_name: z.string().nullable(),
    description: z.string().optional(),
    active_flag: z.boolean().nullable(),
    created_by: z.string().nullable(),
    updated_by: z.string().nullable(),
    created_date: z.string().nullable(),
    updated_date: z.string().nullable(),
}).openapi('PopulationSegment')

const CreateSegmentSchema = z.object({
    segmentName: z.string().min(1).max(150),
    description: z.string().optional(),
    activeFlag: z.boolean().default(true),
}).openapi('CreatePopulationSegmentInput')

const UpdateSegmentSchema = CreateSegmentSchema.partial().openapi('UpdatePopulationSegmentInput')

const SegmentListResponse = z.object({
    success: z.boolean(),
    data: z.array(SegmentSchema)
}).openapi('PopulationSegmentListResponse')

const SegmentResponse = z.object({
    success: z.boolean(),
    data: SegmentSchema,
    message: z.string().optional()
}).openapi('PopulationSegmentResponse')

const ErrorResponse = z.object({
    success: z.boolean(),
    message: z.string(),
    error: z.string().optional()
}).openapi('ErrorResponse')

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const transformSegment = (segment: typeof frs9ParamSegmenth.$inferSelect) => ({
    id: segment.pkid,
    segment_name: segment.segment,
    description: segment.subSegment || '',
    active_flag: segment.activeFlag,
    created_by: segment.createdby,
    updated_by: segment.updatedby,
    created_date: segment.createddate,
    updated_date: segment.updateddate,
})

// ============================================================================
// ENDPOINTS
// ============================================================================

// ... (keeping imports)

// GET /api/v1/banking/parameters/population-segments
populationSegmentsRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/',
        tags: ['Population Segments'],
        summary: 'List Population Segments',
        request: {
            query: z.object({
                search: z.string().optional(),
                active_flag: z.string().optional()
            })
        },
        responses: {
            200: { content: { 'application/json': { schema: SegmentListResponse } }, description: 'List Segments' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c) => {
        try {
            const { search, active_flag } = c.req.valid('query')
            const conditions = []

            if (search) {
                conditions.push(like(frs9ParamSegmenth.segment, `%${search}%`))
            }

            if (active_flag !== undefined) {
                conditions.push(eq(frs9ParamSegmenth.activeFlag, active_flag === 'true'))
            }

            const segments = await db
                .select()
                .from(frs9ParamSegmenth)
                .where(and(...conditions))
                .orderBy(frs9ParamSegmenth.segment)

            return c.json({
                success: true,
                data: segments.map(transformSegment),
            } as any)
        } catch (error) {
            console.error('Error fetching population segments:', error)
            return c.json({ success: false, message: 'Failed to fetch population segments', error: String(error) }, 500)
        }
    }
)

// GET /api/v1/banking/parameters/population-segments/:id
populationSegmentsRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/{id}',
        tags: ['Population Segments'],
        summary: 'Get Population Segment',
        request: {
            params: z.object({ id: z.string().transform(Number) })
        },
        responses: {
            200: { content: { 'application/json': { schema: SegmentResponse } }, description: 'Segment Details' },
            400: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Bad Request' },
            404: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Not Found' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c) => {
        try {
            const { id } = c.req.valid('param')
            if (isNaN(id)) return c.json({ success: false, message: 'Invalid ID' }, 400);

            const [segment] = await db
                .select()
                .from(frs9ParamSegmenth)
                .where(eq(frs9ParamSegmenth.pkid, id))

            if (!segment) {
                return c.json({ success: false, message: 'Population segment not found' }, 404)
            }

            return c.json({ success: true, data: transformSegment(segment) } as any)
        } catch (error) {
            return c.json({ success: false, message: 'Failed to fetch population segment', error: String(error) }, 500)
        }
    }
)

// POST /api/v1/banking/parameters/population-segments
populationSegmentsRoutes.openapi(
    createRoute({
        method: 'post',
        path: '/',
        tags: ['Population Segments'],
        summary: 'Create Population Segment',
        request: {
            body: { content: { 'application/json': { schema: CreateSegmentSchema } } }
        },
        responses: {
            201: { content: { 'application/json': { schema: SegmentResponse } }, description: 'Created' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c) => {
        try {
            const userId = c.get('userId') as string || 'system'
            const data = c.req.valid('json')

            const [segment] = await db
                .insert(frs9ParamSegmenth)
                .values({
                    segment: data.segmentName,
                    subSegment: data.description || null,
                    activeFlag: data.activeFlag,
                    createdby: userId,
                    createdhost: 'localhost',
                    createddate: new Date().toISOString(),
                    updatedby: userId,
                    updatedhost: 'localhost',
                    updateddate: new Date().toISOString(),
                })
                .returning()

            return c.json({
                success: true,
                data: transformSegment(segment),
                message: 'Population segment created successfully',
            } as any, 201)
        } catch (error) {
            console.error('Error creating population segment:', error)
            return c.json({ success: false, message: 'Failed to create population segment', error: String(error) }, 500)
        }
    }
)

// PUT /api/v1/banking/parameters/population-segments/:id
populationSegmentsRoutes.openapi(
    createRoute({
        method: 'put',
        path: '/{id}',
        tags: ['Population Segments'],
        summary: 'Update Population Segment',
        request: {
            params: z.object({ id: z.string().transform(Number) }),
            body: { content: { 'application/json': { schema: UpdateSegmentSchema } } }
        },
        responses: {
            200: { content: { 'application/json': { schema: SegmentResponse } }, description: 'Updated' },
            400: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Bad Request' },
            404: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Not Found' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c) => {
        try {
            const { id } = c.req.valid('param')
            if (isNaN(id)) return c.json({ success: false, message: 'Invalid ID' }, 400);

            const userId = c.get('userId') as string || 'system'
            const data = c.req.valid('json')

            const updateData: any = {
                updatedby: userId,
                updatedhost: 'localhost',
                updateddate: new Date().toISOString(),
            }

            if (data.segmentName) updateData.segment = data.segmentName
            if (data.description !== undefined) updateData.subSegment = data.description
            if (data.activeFlag !== undefined) updateData.activeFlag = data.activeFlag

            const [updated] = await db
                .update(frs9ParamSegmenth)
                .set(updateData)
                .where(eq(frs9ParamSegmenth.pkid, id))
                .returning()

            if (!updated) {
                return c.json({ success: false, message: 'Population segment not found' }, 404)
            }

            return c.json({
                success: true,
                data: transformSegment(updated),
                message: 'Population segment updated successfully',
            } as any)
        } catch (error) {
            console.error('Error updating population segment:', error)
            return c.json({ success: false, message: 'Failed to update population segment', error: String(error) }, 500)
        }
    }
)

// DELETE /api/v1/banking/parameters/population-segments/:id
populationSegmentsRoutes.openapi(
    createRoute({
        method: 'delete',
        path: '/{id}',
        tags: ['Population Segments'],
        summary: 'Delete Population Segment',
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

            const [deleted] = await db
                .delete(frs9ParamSegmenth)
                .where(eq(frs9ParamSegmenth.pkid, id))
                .returning()

            if (!deleted) {
                return c.json({ success: false, message: 'Population segment not found' }, 404)
            }

            return c.json({ success: true, message: 'Population segment deleted successfully' } as any)
        } catch (error) {
            console.error('Error deleting population segment:', error)
            return c.json({ success: false, message: 'Failed to delete population segment', error: String(error) }, 500)
        }
    }
)
