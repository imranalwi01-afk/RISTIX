import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { Effect } from 'effect'
import { legacyDb as db } from '../config'
import { frs9ParamSegmenth, frs9ParamSegmentd, frs9ParamCommond } from '../db/schema'
import { eq, desc, asc, sql } from 'drizzle-orm'
import type { AppContext } from '../app'
import { authMiddleware } from '../middleware'
import { interceptCreate, interceptUpdate, interceptDelete } from '../middleware/approval-interceptor.middleware'
import { runEffect } from '../lib/effect/runtime'

export const segmentationRoutes = new OpenAPIHono<AppContext>()

segmentationRoutes.use('*', authMiddleware)

// ============================================================================
// SCHEMAS
// ============================================================================

const SegmentDetailInputSchema = z.object({
    query_group: z.number().int().optional(),
    seq: z.number().int().optional(),
    table_name: z.string().max(30).optional(),
    column_name: z.string().max(30).optional(),
    data_type: z.string().max(15).optional(),
    operator: z.string().max(10).optional(),
    value1: z.string().optional(),
    value2: z.string().optional(),
    condition: z.string().max(3).optional(),
}).openapi('SegmentDetailInput')

const SegmentHeaderInputSchema = z.object({
    group_segment: z.string().max(150),
    segment: z.string().max(150),
    sub_segment: z.string().max(150).optional(),
    segment_type: z.string().max(50),
    seq: z.number().int().optional(),
    active_flag: z.boolean().default(true),
    createdby: z.string().max(50).default('SYSTEM'),
}).openapi('SegmentHeaderInput')

const SegmentHeaderResponse = z.object({
    success: z.boolean(),
    data: z.any(),
    message: z.string().optional(),
}).openapi('SegmentHeaderResponse')

const SegmentListResponse = z.object({
    success: z.boolean(),
    data: z.array(z.any()),
    total: z.number().optional(),
}).openapi('SegmentListResponse')

const SegmentDetailListResponse = z.object({
    success: z.boolean(),
    data: z.array(z.any()),
}).openapi('SegmentDetailListResponse')

const MetadataListResponse = z.object({
    success: z.boolean(),
    data: z.array(z.object({
        type_code: z.string(),
        type_name: z.string()
    }))
}).openapi('MetadataListResponse')

const ErrorResponse = z.object({
    success: z.literal(false),
    error: z.string(),
    message: z.string().optional()
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

// Metadata Endpoint: Segment Types
segmentationRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/business-settings/segment-types',
        tags: ['Segmentation'],
        summary: 'Get Segment Types',
        responses: {
            200: { content: { 'application/json': { schema: MetadataListResponse } }, description: 'Segment Types' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c) => {
        try {
            const results = await db.select({
                type_code: frs9ParamCommond.value1,
                type_name: frs9ParamCommond.paramdesc
            })
                .from(frs9ParamCommond)
                .where(eq(frs9ParamCommond.paramCode, 'B0011'))
                .orderBy(asc(frs9ParamCommond.paramSeq));

            return c.json({
                success: true,
                data: results.map(r => ({
                    type_code: r.type_code || '',
                    type_name: r.type_name || r.type_code || ''
                }))
            });
        } catch (error) {
            console.error('Error fetching segment types:', error);
            return c.json({ success: false, error: 'Failed to fetch segment types' }, 500);
        }
    }
)

// GET / - List all Segment Headers
segmentationRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/',
        tags: ['Segmentation'],
        summary: 'List Segment Headers',
        request: {
            query: z.object({
                limit: z.string().optional().transform(v => v ? parseInt(v, 10) : 50),
                page: z.string().optional().transform(v => v ? parseInt(v, 10) : 0),
            })
        },
        responses: {
            200: { content: { 'application/json': { schema: SegmentListResponse } }, description: 'List Headers' },
            400: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Bad Request' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c) => {
        const { limit, page } = c.req.valid('query');
        const offset = page * limit;

        try {
            // Get total count for pagination efficiently
            const countResult = await db.execute(sql`SELECT count(*) as count FROM frs9_param_segmenth`);
            const total = Number(countResult[0]?.count || 0);

            const result = await db.select({
                id: frs9ParamSegmenth.pkid,
                group_segment: frs9ParamSegmenth.groupSegment,
                segment: frs9ParamSegmenth.segment,
                sub_segment: frs9ParamSegmenth.subSegment,
                segment_type: frs9ParamSegmenth.segmentType,
                seq: frs9ParamSegmenth.seq,
                active_flag: frs9ParamSegmenth.activeFlag,
                createdby: frs9ParamSegmenth.createdby,
                createddate: frs9ParamSegmenth.createddate,
                createdhost: frs9ParamSegmenth.createdhost,
                updatedby: frs9ParamSegmenth.updatedby,
                updateddate: frs9ParamSegmenth.updateddate,
                updatedhost: frs9ParamSegmenth.updatedhost
            })
                .from(frs9ParamSegmenth)
                .orderBy(desc(frs9ParamSegmenth.createddate))
                .limit(limit)
                .offset(offset);

            return c.json({
                success: true,
                data: result,
                total,
                pagination: {
                    total,
                    limit,
                    page,
                    pages: Math.ceil(total / limit)
                }
            });
        } catch (error) {
            console.error('Error fetching segments:', error);
            return c.json({ error: 'Failed to fetch segments' }, 500);
        }
    }
)

// GET /:id - Get Segment Header
segmentationRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/{id}',
        tags: ['Segmentation'],
        summary: 'Get Segment Header',
        request: {
            params: z.object({ id: z.string().transform(Number) })
        },
        responses: {
            200: { content: { 'application/json': { schema: SegmentHeaderResponse } }, description: 'Segment Header' },
            400: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Invalid ID' },
            404: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Not Found' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c) => {
        const id = c.req.valid('param').id
        if (isNaN(id)) return c.json({ error: 'Invalid ID' }, 400);

        try {
            const result = await db.select({
                id: frs9ParamSegmenth.pkid,
                group_segment: frs9ParamSegmenth.groupSegment,
                segment: frs9ParamSegmenth.segment,
                sub_segment: frs9ParamSegmenth.subSegment,
                segment_type: frs9ParamSegmenth.segmentType,
                seq: frs9ParamSegmenth.seq,
                active_flag: frs9ParamSegmenth.activeFlag,
                createdby: frs9ParamSegmenth.createdby,
                createddate: frs9ParamSegmenth.createddate,
                createdhost: frs9ParamSegmenth.createdhost,
                updatedby: frs9ParamSegmenth.updatedby,
                updateddate: frs9ParamSegmenth.updateddate,
                updatedhost: frs9ParamSegmenth.updatedhost
            }).from(frs9ParamSegmenth).where(eq(frs9ParamSegmenth.pkid, id));

            const header = result[0];
            if (!header) return c.json({ error: 'Segment not found' }, 404);

            return c.json({ success: true, data: header });
        } catch (error) {
            console.error('Error fetching segment details:', error);
            return c.json({ error: 'Failed to fetch segment details' }, 500);
        }
    }
)

// POST / - Create Segment Header
segmentationRoutes.openapi(
    createRoute({
        method: 'post',
        path: '/',
        tags: ['Segmentation'],
        summary: 'Create Segment Header',
        request: {
            body: { content: { 'application/json': { schema: SegmentHeaderInputSchema } } }
        },
        responses: {
            201: { content: { 'application/json': { schema: SegmentHeaderResponse } }, description: 'Created' },
            202: { content: { 'application/json': { schema: ApprovalWorkflowResponse } }, description: 'Pending Approval' },
            400: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Bad Request' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c) => {
        const headerData = c.req.valid('json');
        const userId = c.get('userId') as string || 'system'
        const tenantId = c.get('tenantId') as string
        const userPermissions = c.get('permissions') || []

        const effect = interceptCreate(
            tenantId,
            userId,
            userPermissions,
            'segmentation',
            headerData,
            () => Effect.tryPromise({
                try: async () => {
                    const result = await db.insert(frs9ParamSegmenth).values({
                        groupSegment: headerData.group_segment,
                        segment: headerData.segment,
                        subSegment: headerData.sub_segment,
                        segmentType: headerData.segment_type,
                        seq: headerData.seq,
                        activeFlag: headerData.active_flag,
                        createdby: headerData.createdby || userId,
                        createdhost: 'localhost',
                        createddate: new Date().toISOString()
                    }).returning({
                        id: frs9ParamSegmenth.pkid,
                        group_segment: frs9ParamSegmenth.groupSegment,
                        segment: frs9ParamSegmenth.segment,
                        sub_segment: frs9ParamSegmenth.subSegment,
                        segment_type: frs9ParamSegmenth.segmentType,
                        seq: frs9ParamSegmenth.seq,
                        active_flag: frs9ParamSegmenth.activeFlag,
                        createdby: frs9ParamSegmenth.createdby,
                        createddate: frs9ParamSegmenth.createddate,
                        createdhost: frs9ParamSegmenth.createdhost
                    });
                    return { success: true, data: result[0] };
                },
                catch: (error) => error
            })
        )

        const result = await runEffect(c, effect)
        return c.json(result, result.approvalRequired ? 202 : 201);
    }
)

// PUT /:id - Update Segment Header
segmentationRoutes.openapi(
    createRoute({
        method: 'put',
        path: '/{id}',
        tags: ['Segmentation'],
        summary: 'Update Segment Header',
        request: {
            params: z.object({ id: z.string().transform(Number) }),
            body: { content: { 'application/json': { schema: SegmentHeaderInputSchema.partial() } } }
        },
        responses: {
            200: { content: { 'application/json': { schema: SegmentHeaderResponse } }, description: 'Updated' },
            202: { content: { 'application/json': { schema: ApprovalWorkflowResponse } }, description: 'Update Pending Approval' },
            400: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Invalid Request' },
            404: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Not Found' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c) => {
        const id = c.req.valid('param').id
        if (isNaN(id)) return c.json({ error: 'Invalid ID' }, 400);

        const headerData = c.req.valid('json');
        const userId = c.get('userId') as string || 'system'
        const tenantId = c.get('tenantId') as string
        const userPermissions = c.get('permissions') || []

        const effect = interceptUpdate(
            tenantId,
            userId,
            userPermissions,
            'segmentation',
            id.toString(),
            headerData,
            () => Effect.tryPromise({
                try: async () => {
                    const result = await db.update(frs9ParamSegmenth)
                        .set({
                            groupSegment: headerData.group_segment,
                            segment: headerData.segment,
                            subSegment: headerData.sub_segment,
                            segmentType: headerData.segment_type,
                            seq: headerData.seq,
                            activeFlag: headerData.active_flag,
                            updatedby: userId,
                            updateddate: new Date().toISOString(),
                            updatedhost: 'localhost',
                        })
                        .where(eq(frs9ParamSegmenth.pkid, id))
                        .returning({
                            id: frs9ParamSegmenth.pkid,
                            group_segment: frs9ParamSegmenth.groupSegment,
                            segment: frs9ParamSegmenth.segment,
                            sub_segment: frs9ParamSegmenth.subSegment,
                            segment_type: frs9ParamSegmenth.segmentType,
                            seq: frs9ParamSegmenth.seq,
                            active_flag: frs9ParamSegmenth.activeFlag,
                            createdby: frs9ParamSegmenth.createdby,
                            createddate: frs9ParamSegmenth.createddate,
                            createdhost: frs9ParamSegmenth.createdhost,
                            updatedby: frs9ParamSegmenth.updatedby,
                            updateddate: frs9ParamSegmenth.updateddate,
                            updatedhost: frs9ParamSegmenth.updatedhost
                        });
                    return { success: true, data: result[0] };
                },
                catch: (error) => error
            })
        )

        const result = await runEffect(c, effect)
        return c.json(result, result.approvalRequired ? 202 : 200);
    }
)

// DELETE /:id - Delete Segment Header (Cascade)
segmentationRoutes.openapi(
    createRoute({
        method: 'delete',
        path: '/{id}',
        tags: ['Segmentation'],
        summary: 'Delete Segment Header',
        request: {
            params: z.object({ id: z.string().transform(Number) })
        },
        responses: {
            200: { content: { 'application/json': { schema: z.object({ success: z.boolean(), message: z.string() }) } }, description: 'Deleted' },
            202: { content: { 'application/json': { schema: ApprovalWorkflowResponse } }, description: 'Deletion Pending Approval' },
            400: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Invalid ID' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c) => {
        const id = c.req.valid('param').id
        if (isNaN(id)) return c.json({ error: 'Invalid ID' }, 400);

        const userId = c.get('userId') as string || 'system'
        const tenantId = c.get('tenantId') as string
        const userPermissions = c.get('permissions') || []

        const effect = interceptDelete(
            tenantId,
            userId,
            userPermissions,
            'segmentation',
            id.toString(),
            () => Effect.tryPromise({
                try: async () => {
                    await db.transaction(async (tx) => {
                        await tx.delete(frs9ParamSegmentd).where(eq(frs9ParamSegmentd.segmentId, id));
                        await tx.delete(frs9ParamSegmenth).where(eq(frs9ParamSegmenth.pkid, id));
                    });
                    return { success: true, message: 'Deleted successfully' };
                },
                catch: (error) => error
            })
        )

        const result = await runEffect(c, effect)
        return c.json(result, result.approvalRequired ? 202 : 200);
    }
)

// ==========================================
// DETAILS ENDPOINTS
// ==========================================

// GET /:id/details - List Details
segmentationRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/{id}/details',
        tags: ['Segmentation'],
        summary: 'List Segment Details',
        request: {
            params: z.object({ id: z.string().transform(Number) })
        },
        responses: {
            200: { content: { 'application/json': { schema: SegmentDetailListResponse } }, description: 'List Details' },
            400: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Invalid ID' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c) => {
        const id = c.req.valid('param').id
        if (isNaN(id)) return c.json({ error: 'Invalid ID' }, 400);

        try {
            const details = await db.select({
                id: frs9ParamSegmentd.pkid,
                segment_id: frs9ParamSegmentd.segmentId,
                query_group: frs9ParamSegmentd.queryGroup,
                seq: frs9ParamSegmentd.seq,
                table_name: frs9ParamSegmentd.tableName,
                column_name: frs9ParamSegmentd.columnName,
                data_type: frs9ParamSegmentd.dataType,
                operator: frs9ParamSegmentd.operator,
                value1: frs9ParamSegmentd.value1,
                value2: frs9ParamSegmentd.value2,
                condition: frs9ParamSegmentd.condition,
                createdby: frs9ParamSegmentd.createdby,
                createddate: frs9ParamSegmentd.createddate,
                createdhost: frs9ParamSegmentd.createdhost,
                updatedby: frs9ParamSegmentd.updatedby,
                updateddate: frs9ParamSegmentd.updateddate,
                updatedhost: frs9ParamSegmentd.updatedhost
            })
                .from(frs9ParamSegmentd)
                .where(eq(frs9ParamSegmentd.segmentId, id))
                .orderBy(asc(frs9ParamSegmentd.seq));

            return c.json({ success: true, data: details });
        } catch (error) {
            return c.json({ error: 'Failed to fetch details' }, 500);
        }
    }
)

// POST /:id/details - Create Detail
segmentationRoutes.openapi(
    createRoute({
        method: 'post',
        path: '/{id}/details',
        tags: ['Segmentation'],
        summary: 'Create Segment Detail',
        request: {
            params: z.object({ id: z.string().transform(Number) }),
            body: { content: { 'application/json': { schema: SegmentDetailInputSchema } } }
        },
        responses: {
            201: { content: { 'application/json': { schema: SegmentHeaderResponse } }, description: 'Created' },
            400: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Invalid ID' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c) => {
        const id = c.req.valid('param').id
        if (isNaN(id)) return c.json({ error: 'Invalid ID' }, 400);
        const detailData = c.req.valid('json');

        try {
            const result = await db.insert(frs9ParamSegmentd).values({
                segmentId: id,
                queryGroup: detailData.query_group,
                seq: detailData.seq,
                tableName: detailData.table_name,
                columnName: detailData.column_name,
                dataType: detailData.data_type,
                operator: detailData.operator,
                value1: detailData.value1,
                value2: detailData.value2,
                condition: detailData.condition,
                createdhost: 'localhost',
                createddate: new Date().toISOString(),
                createdby: 'SYSTEM'
            }).returning({
                id: frs9ParamSegmentd.pkid,
                segment_id: frs9ParamSegmentd.segmentId,
                query_group: frs9ParamSegmentd.queryGroup,
                seq: frs9ParamSegmentd.seq,
                table_name: frs9ParamSegmentd.tableName,
                column_name: frs9ParamSegmentd.columnName,
                data_type: frs9ParamSegmentd.dataType,
                operator: frs9ParamSegmentd.operator,
                value1: frs9ParamSegmentd.value1,
                value2: frs9ParamSegmentd.value2,
                condition: frs9ParamSegmentd.condition,
                createdby: frs9ParamSegmentd.createdby,
                createddate: frs9ParamSegmentd.createddate,
                createdhost: frs9ParamSegmentd.createdhost,
            });

            return c.json({ success: true, data: result[0] }, 201);
        } catch (error) {
            return c.json({ error: 'Failed to create detail' }, 500);
        }
    }
)

// PUT /details/:detailId - Update Detail
segmentationRoutes.openapi(
    createRoute({
        method: 'put',
        path: '/details/{detailId}',
        tags: ['Segmentation'],
        summary: 'Update Segment Detail',
        request: {
            params: z.object({ detailId: z.string().transform(Number) }),
            body: { content: { 'application/json': { schema: SegmentDetailInputSchema } } }
        },
        responses: {
            200: { content: { 'application/json': { schema: SegmentHeaderResponse } }, description: 'Updated' },
            400: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Invalid ID' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c) => {
        const detailId = c.req.valid('param').detailId
        if (isNaN(detailId)) return c.json({ error: 'Invalid ID' }, 400);
        const detailData = c.req.valid('json');

        try {
            const result = await db.update(frs9ParamSegmentd)
                .set({
                    queryGroup: detailData.query_group,
                    seq: detailData.seq,
                    tableName: detailData.table_name,
                    columnName: detailData.column_name,
                    dataType: detailData.data_type,
                    operator: detailData.operator,
                    value1: detailData.value1,
                    value2: detailData.value2,
                    condition: detailData.condition,
                    updateddate: new Date().toISOString(),
                    updatedhost: 'localhost'
                })
                .where(eq(frs9ParamSegmentd.pkid, detailId))
                .returning({
                    id: frs9ParamSegmentd.pkid,
                    segment_id: frs9ParamSegmentd.segmentId,
                    query_group: frs9ParamSegmentd.queryGroup,
                    seq: frs9ParamSegmentd.seq,
                    table_name: frs9ParamSegmentd.tableName,
                    column_name: frs9ParamSegmentd.columnName,
                    data_type: frs9ParamSegmentd.dataType,
                    operator: frs9ParamSegmentd.operator,
                    value1: frs9ParamSegmentd.value1,
                    value2: frs9ParamSegmentd.value2,
                    condition: frs9ParamSegmentd.condition,
                    updatedby: frs9ParamSegmentd.updatedby,
                    updateddate: frs9ParamSegmentd.updateddate,
                    updatedhost: frs9ParamSegmentd.updatedhost
                });

            return c.json({ success: true, data: result[0] });
        } catch (error) {
            return c.json({ error: 'Failed to update detail' }, 500);
        }
    }
)

// DELETE /details/:detailId - Delete Detail
segmentationRoutes.openapi(
    createRoute({
        method: 'delete',
        path: '/details/{detailId}',
        tags: ['Segmentation'],
        summary: 'Delete Segment Detail',
        request: {
            params: z.object({ detailId: z.string().transform(Number) })
        },
        responses: {
            200: { content: { 'application/json': { schema: z.object({ success: z.boolean(), message: z.string() }) } }, description: 'Deleted' },
            400: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Invalid ID' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c) => {
        const detailId = c.req.valid('param').detailId
        if (isNaN(detailId)) return c.json({ error: 'Invalid ID' }, 400);

        try {
            await db.delete(frs9ParamSegmentd).where(eq(frs9ParamSegmentd.pkid, detailId));
            return c.json({ success: true, message: 'Deleted' });
        } catch (error) {
            return c.json({ error: 'Failed to delete detail' }, 500);
        }
    }
)
