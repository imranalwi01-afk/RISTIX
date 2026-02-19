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

// --- Calculation Routes ---

ifrs9Routes.openapi(
    createRoute({
        method: 'get',
        path: '/calculations/summary',
        tags: ['IFRS9'],
        summary: 'Get Calculation Summary',
        request: {
            query: z.object({ date: z.string().optional() })
        },
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
        request: {
            query: z.object({ date: z.string().optional() })
        },
        responses: {
            200: { content: { 'application/json': { schema: z.object({ success: z.boolean(), data: z.any() }) } }, description: 'Trend' }
        }
    }),
    (c: Context) => ifrs9CalculationsController.getPortfolioTrend(c)
)

ifrs9Routes.openapi(
    createRoute({
        method: 'get',
        path: '/available-dates',
        tags: ['IFRS9'],
        summary: 'Get Available Process Dates',
        responses: {
            200: { content: { 'application/json': { schema: z.array(z.string()) } }, description: 'Available Dates' }
        }
    }),
    (c: Context) => ifrs9CalculationsController.getAvailableDates(c)
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

// Move specific routes before parameterized routes
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
