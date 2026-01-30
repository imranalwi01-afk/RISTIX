import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { Context } from 'hono'
import type { AppContext } from '../app'
import { ifrs9CalculationsController } from '../controllers/ifrs9-calculations.controller'
import { ifrs9ReportsController } from '../controllers/ifrs9-reports.controller'

/**
 * IFRS9 Main Routes (STUB)
 * TODO: Implement IFRS9 calculations
 */
export const ifrs9Routes = new OpenAPIHono<AppContext>()

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

// --- Report Routes ---

ifrs9Routes.openapi(
    createRoute({
        method: 'get',
        path: '/reports/ecl-movement',
        tags: ['IFRS9 Reports'],
        summary: 'Get ECL Movement Report',
        responses: {
            200: { content: { 'application/json': { schema: ReportResponse } }, description: 'Report Data' }
        }
    }),
    (c: Context) => ifrs9ReportsController.getECLMovement(c)
)

ifrs9Routes.openapi(
    createRoute({
        method: 'get',
        path: '/reports/gca-movement',
        tags: ['IFRS9 Reports'],
        summary: 'Get GCA Movement Report',
        responses: {
            200: { content: { 'application/json': { schema: ReportResponse } }, description: 'Report Data' }
        }
    }),
    (c: Context) => ifrs9ReportsController.getGCAMovement(c)
)

ifrs9Routes.openapi(
    createRoute({
        method: 'get',
        path: '/reports/ecl-result',
        tags: ['IFRS9 Reports'],
        summary: 'Get ECL Result Report',
        request: {
            query: z.object({
                prc_date: z.string().optional(),
                segment_id: z.string().optional(),
                stage: z.string().optional(),
                page: z.string().optional(),
                limit: z.string().optional()
            })
        },
        responses: {
            200: { content: { 'application/json': { schema: ReportResponse } }, description: 'Report Data' }
        }
    }),
    (c: Context) => ifrs9ReportsController.getECLResult(c)
)

ifrs9Routes.openapi(
    createRoute({
        method: 'get',
        path: '/reports/nominative-report',
        tags: ['IFRS9 Reports'],
        summary: 'Get Nominative Report',
        request: {
            query: z.object({
                prc_date: z.string().optional(),
                segment_id: z.string().optional(),
                stage: z.string().optional(),
                branch_code: z.string().optional(),
                page: z.string().optional(),
                limit: z.string().optional()
            })
        },
        responses: {
            200: { content: { 'application/json': { schema: ReportResponse } }, description: 'Report Data' }
        }
    }),
    (c: Context) => ifrs9ReportsController.getNominativeReport(c)
)

ifrs9Routes.openapi(
    createRoute({
        method: 'get',
        path: '/reports/ead-model',
        tags: ['IFRS9 Reports'],
        summary: 'Get EAD Model Report',
        request: {
            query: z.object({
                prc_date: z.string().optional(),
                ead_config_id: z.string().optional(),
                segment_id: z.string().optional(),
                page: z.string().optional(),
                limit: z.string().optional()
            })
        },
        responses: {
            200: { content: { 'application/json': { schema: ReportResponse } }, description: 'Report Data' }
        }
    }),
    (c: Context) => ifrs9ReportsController.getEADModel(c)
)

ifrs9Routes.openapi(
    createRoute({
        method: 'get',
        path: '/reports/lifetime-pd/yearly',
        tags: ['IFRS9 Reports'],
        summary: 'Get Lifetime PD Yearly Report',
        request: {
            query: z.object({
                prc_date: z.string().optional(),
                pd_config_id: z.string().optional(),
                pd_method: z.string().optional(),
                scalar_id: z.string().optional(),
                fl_flag: z.string().optional(),
                page: z.string().optional(),
                limit: z.string().optional()
            })
        },
        responses: {
            200: { content: { 'application/json': { schema: ReportResponse } }, description: 'Report Data' }
        }
    }),
    (c: Context) => ifrs9ReportsController.getLifetimePDYearly(c)
)

ifrs9Routes.openapi(
    createRoute({
        method: 'get',
        path: '/reports/lifetime-pd/monthly',
        tags: ['IFRS9 Reports'],
        summary: 'Get Lifetime PD Monthly Report',
        request: {
            query: z.object({
                prc_date: z.string().optional(),
                pd_config_id: z.string().optional(),
                pd_method: z.string().optional(),
                scalar_id: z.string().optional(),
                fl_flag: z.string().optional(),
                page: z.string().optional(),
                limit: z.string().optional()
            })
        },
        responses: {
            200: { content: { 'application/json': { schema: ReportResponse } }, description: 'Report Data' }
        }
    }),
    (c: Context) => ifrs9ReportsController.getLifetimePDMonthly(c)
)

ifrs9Routes.openapi(
    createRoute({
        method: 'get',
        path: '/reports/lifetime-lgd',
        tags: ['IFRS9 Reports'],
        summary: 'Get Lifetime LGD Report',
        request: {
            query: z.object({
                prc_date: z.string().optional(),
                lgd_config_id: z.string().optional(),
                lgd_method: z.string().optional(),
                model_id: z.string().optional(),
                page: z.string().optional(),
                limit: z.string().optional()
            })
        },
        responses: {
            200: { content: { 'application/json': { schema: ReportResponse } }, description: 'Report Data' }
        }
    }),
    (c: Context) => ifrs9ReportsController.getLifetimeLGD(c)
)

ifrs9Routes.openapi(
    createRoute({
        method: 'get',
        path: '/reports/metadata',
        tags: ['IFRS9 Reports'],
        summary: 'Get Reports Metadata',
        responses: {
            200: { content: { 'application/json': { schema: z.object({ success: z.boolean(), data: z.any() }) } }, description: 'Metadata' }
        }
    }),
    (c: Context) => ifrs9ReportsController.getMetadata(c)
)

ifrs9Routes.openapi(
    createRoute({
        method: 'post',
        path: '/reports/export',
        tags: ['IFRS9 Reports'],
        summary: 'Export Report',
        request: {
            body: { content: { 'application/json': { schema: z.any() } } }
        },
        responses: {
            200: { content: { 'text/plain': { schema: z.string() } }, description: 'Exported File' }
        }
    }),
    (c: Context) => ifrs9ReportsController.exportReport(c)
)

// --- Calculation Routes ---

ifrs9Routes.openapi(
    createRoute({
        method: 'get',
        path: '/calculations/summary',
        tags: ['IFRS9'],
        summary: 'Get Calculation Summary',
        responses: {
            200: { content: { 'application/json': { schema: z.object({ success: z.boolean(), data: z.any() }) } }, description: 'Summary' }
        }
    }),
    (c: Context) => ifrs9CalculationsController.getSummary(c)
)

ifrs9Routes.openapi(
    createRoute({
        method: 'get',
        path: '/calculations/portfolio-trend',
        tags: ['IFRS9'],
        summary: 'Get Portfolio Trend',
        responses: {
            200: { content: { 'application/json': { schema: z.object({ success: z.boolean(), data: z.any() }) } }, description: 'Trend' }
        }
    }),
    (c: Context) => ifrs9CalculationsController.getPortfolioTrend(c)
)

ifrs9Routes.openapi(
    createRoute({
        method: 'get',
        path: '/calculation-batches',
        tags: ['IFRS9'],
        summary: 'Get Calculation Batches',
        responses: {
            200: { content: { 'application/json': { schema: z.object({ success: z.boolean(), data: z.any() }) } }, description: 'Batches' }
        }
    }),
    (c: Context) => ifrs9CalculationsController.getBatches(c)
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
    (c: Context) => ifrs9CalculationsController.runCalculation(c)
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
    async (c: Context) => {
        return c.json({
            success: true,
            data: [],
            message: 'IFRS9 calculations - stub implementation',
        })
    }
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
    async (c: Context) => {
        const id = c.req.param('id')
        return c.json({
            success: true,
            data: {
                calculationId: id,
                status: 'completed',
                results: {},
            },
            message: 'IFRS9 calculation result - stub implementation',
        })
    }
)

// ifrs9Routes.get(
//   "/calculations/batch-results",
//   ifrs9CalculationsController.getBatchResults,
// );

ifrs9Routes.openapi(
    createRoute({
        method: 'get',
        path: '/calculations/batch-results',
        tags: ['IFRS9'],
        summary: 'Get Calculation Batch Results',
        request: {
            query: z.object({ date: z.string().optional() })
        },
        responses: {
            200: { content: { 'application/json': { schema: CalculationListResponse } }, description: 'Batch Results' }
        }
    }),
    async (c: Context) => ifrs9CalculationsController.getBatchResults(c)
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
    async (c: Context) => {
        return c.json({
            success: true,
            data: {
                calculationId: 'calc-' + Date.now(),
                status: 'queued',
            },
            message: 'IFRS9 calculation started - stub implementation',
        })
    }
)
