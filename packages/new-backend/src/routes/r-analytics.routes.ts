import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import type { AppContext } from '../app'
import { buildErrorResponse } from '../lib/http/error-response'
import { openApiValidationHook } from '../lib/http/openapi-validation-hook'

/**
 * R Analytics Routes (STUB)
 * TODO: Implement R bridge integration
 */
export const rAnalyticsRoutes = new OpenAPIHono<AppContext>({ defaultHook: openApiValidationHook })

// ============================================================================
// SCHEMAS
// ============================================================================

const RExecuteSchema = z.object({
    scriptId: z.string().optional(),
    scriptContent: z.string().optional(),
    parameters: z.record(z.any()).optional(),
}).openapi('RScriptInput')

const RJobStatusResponse = z.object({
    success: z.boolean(),
    data: z.object({
        jobId: z.string(),
        status: z.string(),
        progress: z.number().optional(),
        submittedAt: z.string().optional(),
        startedAt: z.string().optional(),
        completedAt: z.string().optional(),
        error: z.string().optional(),
    }),
    message: z.string().optional(),
}).openapi('RJobStatusResponse')

const RJobResultsResponse = z.object({
    success: z.boolean(),
    data: z.object({
        jobId: z.string(),
        results: z.any().optional(),
        plots: z.array(z.string()).optional(), // Base64 encoded or URLs
        tables: z.array(z.any()).optional(),
    }),
    message: z.string().optional(),
}).openapi('RJobResultsResponse')

const RScriptSchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().optional(),
    parameters: z.array(z.any()).optional(), // Definitions of parameters
}).openapi('RScript')

const RScriptListResponse = z.object({
    success: z.boolean(),
    data: z.array(RScriptSchema),
    message: z.string().optional(),
}).openapi('RScriptListResponse')

const RScriptDetailResponse = z.object({
    success: z.boolean(),
    data: RScriptSchema,
    message: z.string().optional(),
}).openapi('RScriptDetailResponse')

const ErrorResponse = z.object({
    success: z.boolean(),
    message: z.string(),
    error: z.string().optional(),
    code: z.string().optional(),
    requestId: z.string().nullable().optional(),
    timestamp: z.string().optional(),
    details: z.unknown().optional(),
}).openapi('ErrorResponse')

// ============================================================================
// R ANALYTICS ENDPOINTS
// ============================================================================

// Execute R script
rAnalyticsRoutes.openapi(
    createRoute({
        method: 'post',
        path: '/execute',
        tags: ['R Analytics'],
        summary: 'Execute R Script',
        request: {
            body: { content: { 'application/json': { schema: RExecuteSchema } } }
        },
        responses: {
            200: { content: { 'application/json': { schema: RJobStatusResponse } }, description: 'Job Queued' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c): Promise<any> => {
        try {
            const body = await c.req.json()
            return c.json({
                success: true,
                data: {
                    jobId: 'r-job-' + Date.now(),
                    status: 'queued',
                    submittedAt: new Date().toISOString(),
                },
                message: 'R analytics job submitted - stub implementation',
            })
        } catch (error) {
            return c.json(buildErrorResponse(c, { error: 'Failed to submit R job', message: 'Failed to submit R job', code: 'R_ANALYTICS_ERROR' }), 500)
        }
    }
)

// Get job status
rAnalyticsRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/status/{jobId}',
        tags: ['R Analytics'],
        summary: 'Get Job Status',
        request: {
            params: z.object({ jobId: z.string() })
        },
        responses: {
            200: { content: { 'application/json': { schema: RJobStatusResponse } }, description: 'Job Status' },
            404: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Not Found' }
        }
    }),
    async (c): Promise<any> => {
        const jobId = c.req.param('jobId')
        return c.json({
            success: true,
            data: {
                jobId,
                status: 'completed',
                progress: 100,
                startedAt: new Date().toISOString(),
                completedAt: new Date().toISOString(),
            },
            message: 'R analytics job status - stub implementation',
        })
    }
)

// Get job results
rAnalyticsRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/results/{jobId}',
        tags: ['R Analytics'],
        summary: 'Get Job Results',
        request: {
            params: z.object({ jobId: z.string() })
        },
        responses: {
            200: { content: { 'application/json': { schema: RJobResultsResponse } }, description: 'Job Results' },
            404: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Not Found' }
        }
    }),
    async (c): Promise<any> => {
        const jobId = c.req.param('jobId')
        return c.json({
            success: true,
            data: {
                jobId,
                results: { output: 'Stub results' },
                plots: [],
                tables: [],
            },
            message: 'R analytics results - stub implementation',
        })
    }
)

// Get history of PD-AFL submissions
rAnalyticsRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/pd-afl-history',
        tags: ['R Analytics'],
        summary: 'Get PD-AFL Submission History',
        responses: {
            200: {
                description: 'History retrieved successfully',
                content: {
                    'application/json': {
                        schema: z.object({
                            success: z.boolean(),
                            data: z.array(z.any())
                        })
                    }
                }
            },
            500: {
                description: 'Server error',
                content: {
                    'application/json': {
                        schema: z.object({
                            success: z.boolean(),
                            error: z.string(),
                            code: z.string().optional()
                        })
                    }
                }
            }
        }
    }),
    async (c) => {
        try {
            const [{ legacyDb }, schema, { desc }] = await Promise.all([
                import('../config'),
                import('../db/schema'),
                import('drizzle-orm')
            ])

            const history = await legacyDb
                .select({
                    id: schema.frs9RPdAfl.id,
                    modelId: schema.frs9RPdAfl.modelId,
                    modelName: schema.frs9RPdAfl.modelName,
                    rSquared: schema.frs9RPdAfl.rSquared,
                    mape: schema.frs9RPdAfl.mape,
                    modelStatus: schema.frs9RPdAfl.modelStatus,
                    createdBy: schema.frs9RPdAfl.createdBy,
                    createdDate: schema.frs9RPdAfl.createdDate,
                    updatedDate: schema.frs9RPdAfl.updatedDate,
                    isDeleted: schema.frs9RPdAfl.isDeleted
                })
                .from(schema.frs9RPdAfl)
                .orderBy(desc(schema.frs9RPdAfl.id))
                .limit(50)

            return c.json({
                success: true,
                data: history
            }, 200)
        } catch (error: any) {
            console.error('Error fetching PD-AFL history:', error)
            return c.json(buildErrorResponse(c, { error: error.message, message: 'Failed to fetch history', code: 'HISTORY_ERROR' }) as any, 500)
        }
    }
)

// List available R scripts
rAnalyticsRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/scripts',
        tags: ['R Analytics'],
        summary: 'List R Scripts',
        responses: {
            200: { content: { 'application/json': { schema: RScriptListResponse } }, description: 'List Scripts' }
        }
    }),
    async (c): Promise<any> => {
        return c.json({
            success: true,
            data: [],
            message: 'R scripts list - stub implementation',
        })
    }
)

// Get R script details
rAnalyticsRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/scripts/{scriptId}',
        tags: ['R Analytics'],
        summary: 'Get R Script Details',
        request: {
            params: z.object({ scriptId: z.string() })
        },
        responses: {
            200: { content: { 'application/json': { schema: RScriptDetailResponse } }, description: 'Script Details' },
            404: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Not Found' }
        }
    }),
    async (c): Promise<any> => {
        const scriptId = c.req.param('scriptId')
        return c.json({
            success: true,
            data: {
                id: scriptId,
                name: 'Sample R Script',
                description: 'Stub R script',
                parameters: [],
            },
            message: 'R script details - stub implementation',
        })
    }
)

// ============================================================================
// INTEGRATION ENDPOINTS (PLAN B)
// ============================================================================

import { legacyDb } from '../config/database';
import { frs9RModelSummary, frs9RPdAfl } from '../db/schema';
import { desc } from 'drizzle-orm';

const SavedModelResponse = z.object({
    success: z.boolean(),
    data: z.any(),
    message: z.string().optional()
}).openapi('SavedModelResponse');

// Get latest saved model summary for approval submission
rAnalyticsRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/saved',
        tags: ['R Analytics'],
        summary: 'Get Latest Saved Model',
        responses: {
            200: { content: { 'application/json': { schema: SavedModelResponse } }, description: 'Latest Model' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c): Promise<any> => {
        try {
            // Fetch the most recent model saved by R Shiny
            const latestModel = await legacyDb.query.frs9RModelSummary.findFirst({
                orderBy: [desc(frs9RModelSummary.modelId)],
                columns: {
                    modelId: true,
                    modelName: true,
                    rSquared: true,
                    mape: true,
                    createdDate: true
                }
            });

            if (!latestModel) {
                return c.json({ success: true, data: null, message: 'No models found' });
            }

            return c.json({
                success: true,
                data: {
                    id: latestModel.modelId,
                    model_name: latestModel.modelName,
                    r_squared: latestModel.rSquared,
                    mape: latestModel.mape,
                    created_date: latestModel.createdDate
                }
            });
        } catch (error: any) {
            console.error('Error fetching latest saved model:', error);
            return c.json(buildErrorResponse(c, { error: error.message, message: 'Failed to fetch saved model', code: 'FETCH_ERROR' }), 500);
        }
    }
)

const SubmitApprovalSchema = z.object({
    id: z.number(),
    model_name: z.string().optional(),
    r_squared: z.number().optional(),
    mape: z.number().optional(),
    snapshot_date: z.string().optional()
});

// Submit model to frs9_r_pd_afl
rAnalyticsRoutes.openapi(
    createRoute({
        method: 'post',
        path: '/submit',
        tags: ['R Analytics'],
        summary: 'Submit Model for Approval',
        request: {
            body: { content: { 'application/json': { schema: SubmitApprovalSchema } } }
        },
        responses: {
            200: { content: { 'application/json': { schema: SavedModelResponse } }, description: 'Success' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c): Promise<any> => {
        try {
            const body = await c.req.json();
            
            // Ambil data_file dari frs9_r_model_summary (Shiny App)
            const sourceModel = await legacyDb.query.frs9RModelSummary.findFirst({
                where: eq(frs9RModelSummary.modelId, body.id)
            });

            // Insert into the new frs9_r_pd_afl table
            const inserted = await legacyDb.insert(frs9RPdAfl).values({
                modelId: body.id,
                modelName: body.model_name,
                rSquared: body.r_squared,
                mape: body.mape,
                dataFile: sourceModel?.dataFile ? Buffer.from(sourceModel.dataFile) : null as any, // Convert string to Buffer
                modelStatus: 'PENDING_APPROVAL',
                createdBy: 'System/Maker', // Hardcoded temporarily, usually from session
                isDeleted: false
            }).returning({
                id: frs9RPdAfl.id,
                modelId: frs9RPdAfl.modelId,
                modelName: frs9RPdAfl.modelName,
                rSquared: frs9RPdAfl.rSquared,
                mape: frs9RPdAfl.mape,
                modelStatus: frs9RPdAfl.modelStatus,
                createdBy: frs9RPdAfl.createdBy,
                createdDate: frs9RPdAfl.createdDate
            });

            return c.json({
                success: true,
                data: inserted[0],
                message: 'Model successfully submitted to frs9_r_pd_afl'
            });
        } catch (error: any) {
            console.error('Error submitting model:', error);
            return c.json(buildErrorResponse(c, { error: error.message, message: 'Failed to submit model', code: 'SUBMIT_ERROR' }), 500);
        }
    }
)

import { eq } from 'drizzle-orm';

// Download bytea data_file from frs9_r_pd_afl
rAnalyticsRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/pd-afl-history/{id}/download',
        tags: ['R Analytics'],
        summary: 'Download Model Data File',
        request: {
            params: z.object({ id: z.string() })
        },
        responses: {
            200: { description: 'File download' },
            404: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Not Found' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c): Promise<any> => {
        try {
            const idParam = c.req.param('id');
            const id = parseInt(idParam, 10);
            if (isNaN(id)) {
                return c.json(buildErrorResponse(c, { error: 'Invalid ID', message: 'Invalid ID', code: 'INVALID_ID' }), 400);
            }

            const record = await legacyDb.query.frs9RPdAfl.findFirst({
                where: eq(frs9RPdAfl.id, id)
            });

            if (!record || !record.dataFile) {
                return c.json(buildErrorResponse(c, { error: 'File not found', message: 'File not found', code: 'FILE_NOT_FOUND' }), 404);
            }

            // Hono response for file download
            const buffer = Buffer.from(record.dataFile as any);
            
            c.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            c.header('Content-Disposition', `attachment; filename="ModelOutput_${id}.xlsx"`);
            return c.body(buffer);
        } catch (error: any) {
            console.error('Error downloading model data:', error);
            return c.json(buildErrorResponse(c, { error: error.message, message: 'Failed to download file', code: 'DOWNLOAD_ERROR' }), 500);
        }
    }
)
