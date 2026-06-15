import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { Context } from 'hono'
import type { AppContext } from '../app'
import { ifrs9CalculationsController } from '../controllers/ifrs9-calculations.controller'
import { ifrs9ReportsController } from '../controllers/ifrs9-reports.controller'
import { openApiValidationHook } from '../lib/http/openapi-validation-hook'
import { JobsRepository } from '../repositories/jobs.repository'
import { Effect } from 'effect'
import { tenantsRepository } from '../repositories/tenants.repository'

/**
 * IFRS9 Main Routes (STUB)
 * TODO: Implement IFRS9 calculations
 */
export const ifrs9Routes: any = new OpenAPIHono<AppContext>({ defaultHook: openApiValidationHook })

// ============================================================================
// SCHEMAS
// ============================================================================

const CalculationSchema = z.object({
    calculationId: z.string(),
    status: z.string(),
    results: z.record(z.any()).optional(),
}).openapi('Calculation')

const CreateCalculationSchema = z.object({
    modelId: z.string().optional(),
    parameters: z.record(z.any()).optional(),
}).openapi('CreateCalculationInput')

const CalculationListResponse = z.object({
    success: z.boolean(),
    data: z.array(CalculationSchema),
    message: z.string().optional(),
}).openapi('CalculationListResponse')

const CalculationResponse = z.object({
    success: z.boolean(),
    data: z.any(),
    message: z.string().optional()
}).openapi('CalculationResponse')

const ReportResponse = z.object({
    success: z.boolean(),
    data: z.array(z.any()),
    pagination: z.object({
        page: z.number(),
        limit: z.number(),
        total: z.number(),
        totalPages: z.number()
    }).optional(),
    message: z.string().optional()
}).openapi('ReportResponse')

// ============================================================================
// IFRS9 ENDPOINTS
// ============================================================================

// --- Calculation Routes ---

ifrs9Routes.openapi(
    createRoute({
        method: 'get',
        path: '/calculations/summary',
        tags: ['IFRS9'],
        summary: 'Get Calculation Summary',
        request: {
            query: z.object({ date: z.string().optional(), mode: z.string().optional() })
        },
        responses: {
            200: { content: { 'application/json': { schema: z.object({ success: z.boolean(), data: z.any() }) } }, description: 'Summary' }
        }
    }),
    (c: any) => ifrs9CalculationsController.getSummary(c)
)

ifrs9Routes.openapi(
    createRoute({
        method: 'get',
        path: '/calculations/portfolio-trend',
        tags: ['IFRS9'],
        summary: 'Get Portfolio Trend',
        request: {
            query: z.object({ date: z.string().optional(), mode: z.string().optional() })
        },
        responses: {
            200: { content: { 'application/json': { schema: z.object({ success: z.boolean(), data: z.any() }) } }, description: 'Trend' }
        }
    }),
    (c: any) => ifrs9CalculationsController.getPortfolioTrend(c)
)

ifrs9Routes.openapi(
    createRoute({
        method: 'get',
        path: '/available-dates',
        tags: ['IFRS9'],
        summary: 'Get Available Process Dates',
        request: {
            query: z.object({
                mode: z.string().optional(),
                groupBy: z.enum(['year']).optional(),
            })
        },
        responses: {
            200: {
                content: {
                    'application/json': {
                        schema: z.object({
                            success: z.boolean(),
                            data: z.union([z.array(z.string()), z.record(z.array(z.string()))]),
                        }),
                    },
                },
                description: 'Available Dates',
            },
        }
    }),
    (c: any) => ifrs9CalculationsController.getAvailableDates(c)
)

ifrs9Routes.openapi(
    createRoute({
        method: 'get',
        path: '/calculation-batches',
        tags: ['IFRS9'],
        summary: 'Get Calculation Batches',
        request: {
            query: z.object({ mode: z.string().optional() })
        },
        responses: {
            200: { content: { 'application/json': { schema: z.object({ success: z.boolean(), data: z.any() }) } }, description: 'Batches' }
        }
    }),
    (c: any) => ifrs9CalculationsController.getBatches(c)
)

ifrs9Routes.openapi(
    createRoute({
        method: 'post',
        path: '/calculations/ecl',
        tags: ['IFRS9'],
        summary: 'Run ECL Calculation',
        request: {
            body: { content: { 'application/json': { schema: z.any() } } }
        },
        responses: {
            200: { content: { 'application/json': { schema: z.any() } }, description: 'Result' }
        }
    }),
    (c: any) => ifrs9CalculationsController.runCalculation(c)
)

ifrs9Routes.openapi(
    createRoute({
        method: 'post',
        path: '/calculations/ecl/preview',
        tags: ['IFRS9'],
        summary: 'Run ECL Preview Calculation',
        request: {
            body: { content: { 'application/json': { schema: z.any() } } }
        },
        responses: {
            200: { content: { 'application/json': { schema: z.any() } }, description: 'Result' }
        }
    }),
    (c: any) => ifrs9CalculationsController.runPreviewCalculation(c)
)

// --- Legacy Stub Routes ---

ifrs9Routes.openapi(
    createRoute({
        method: 'get',
        path: '/calculations',
        tags: ['IFRS9'],
        summary: 'List Calculations',
        responses: {
            200: { content: { 'application/json': { schema: CalculationListResponse } }, description: 'List Calculations' }
        }
    }),
    async (c: any) => {
        try {
            const rawTenantId = c.get('tenantId');
            let tenantId = rawTenantId;
            if (!tenantId) {
                tenantId = 'iaf';
            }
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            if (!uuidRegex.test(tenantId)) {
                if (tenantId === 'iaf') {
                    tenantId = 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be';
                } else {
                    try {
                        const tenant = await Effect.runPromise(tenantsRepository.findBySlug(tenantId));
                        if (tenant) tenantId = tenant.id;
                    } catch {}
                }
            }
            const executions = await JobsRepository.findExecutions(tenantId, 50);
            const calculations = executions
                .filter((e: any) => {
                    const jobType = String(e.jobType || '').toUpperCase();
                    return jobType === 'IFRS9_CALCULATION' || jobType === 'SQL_SP';
                })
                .map((e: any) => ({
                    calculationId: e.id,
                    status: e.status || 'unknown',
                    jobType: e.jobType,
                    jobName: e.jobName || e.definition?.name || 'IFRS9 Calculation',
                    processDate: e.startTime ? new Date(e.startTime).toISOString().split('T')[0] : null,
                    createdAt: e.createdAt ? new Date(e.createdAt).toISOString() : null,
                    completedAt: e.endTime ? new Date(e.endTime).toISOString() : null,
                    progress: e.progress ?? 0,
                    results: e.result || null,
                }));
            return c.json({
                success: true,
                data: calculations,
            });
        } catch (error: any) {
            console.error('Error fetching IFRS9 calculations:', error);
            return c.json({
                success: false,
                data: [],
                message: error.message || 'Failed to fetch calculations',
            }, 500);
        }
    }
)

// Move specific routes before parameterized routes
ifrs9Routes.openapi(
    createRoute({
        method: 'get',
        path: '/calculations/batch-results',
        tags: ['IFRS9'],
        summary: 'Get Calculation Batch Results',
        request: {
            query: z.object({ date: z.string().optional(), mode: z.string().optional() })
        },
        responses: {
            200: { content: { 'application/json': { schema: CalculationListResponse } }, description: 'Batch Results' }
        }
    }),
    async (c: any) => ifrs9CalculationsController.getBatchResults(c)
)

ifrs9Routes.openapi(
    createRoute({
        method: 'get',
        path: '/calculations/{id}',
        tags: ['IFRS9'],
        summary: 'Get Calculation',
        request: {
            params: z.object({ id: z.string() })
        },
        responses: {
            200: { content: { 'application/json': { schema: CalculationResponse } }, description: 'Calculation Result' }
        }
    }),
    async (c: any) => {
        try {
            const id = c.req.param('id')
            const execution = await JobsRepository.findExecutionById(id) as any
            if (!execution) {
                return c.json({
                    success: false,
                    data: null,
                    message: 'Calculation not found',
                }, 404)
            }
            return c.json({
                success: true,
                data: {
                    calculationId: execution.id,
                    status: execution.status || 'unknown',
                    jobType: execution.jobType,
                    jobName: execution.jobName || execution.definition?.name || 'IFRS9 Calculation',
                    processDate: execution.startTime ? new Date(execution.startTime).toISOString().split('T')[0] : null,
                    createdAt: execution.createdAt ? new Date(execution.createdAt).toISOString() : null,
                    completedAt: execution.endTime ? new Date(execution.endTime).toISOString() : null,
                    progress: execution.progress ?? 0,
                    results: execution.result || null,
                    inputParams: execution.inputParams || null,
                    definition: execution.definition || null,
                },
            })
        } catch (error: any) {
            console.error('Error fetching IFRS9 calculation:', error)
            return c.json({
                success: false,
                data: null,
                message: error.message || 'Failed to fetch calculation',
            }, 500)
        }
    }
)

ifrs9Routes.openapi(
    createRoute({
        method: 'post',
        path: '/calculate',
        tags: ['IFRS9'],
        summary: 'Start Calculation',
        request: {
            body: { content: { 'application/json': { schema: CreateCalculationSchema } } }
        },
        responses: {
            200: { content: { 'application/json': { schema: CalculationResponse } }, description: 'Started' }
        }
    }),
    async (c: any) => {
        try {
            const rawTenantId = c.get('tenantId');
            let tenantId = rawTenantId;
            if (!tenantId) {
                tenantId = 'iaf';
            }
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            if (!uuidRegex.test(tenantId)) {
                if (tenantId === 'iaf') {
                    tenantId = 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be';
                } else {
                    try {
                        const tenant = await Effect.runPromise(tenantsRepository.findBySlug(tenantId));
                        if (tenant) tenantId = tenant.id;
                    } catch {}
                }
            }
            const body = await c.req.json();
            const runId = `ifrs9-run-${Date.now()}`;
            const execution = await JobsRepository.createExecution({
                id: runId,
                tenantId: tenantId,
                jobType: 'IFRS9_CALCULATION',
                jobName: body.processType || 'IFRS9 Full Calculation',
                status: 'pending',
                inputParams: body,
                progress: 0,
            });
            return c.json({
                success: true,
                data: {
                    calculationId: execution.id,
                    status: execution.status,
                    message: 'IFRS9 calculation queued successfully',
                },
            })
        } catch (error: any) {
            console.error('Error starting IFRS9 calculation:', error)
            return c.json({
                success: false,
                data: null,
                message: error.message || 'Failed to start calculation',
            }, 500)
        }
    }
)
