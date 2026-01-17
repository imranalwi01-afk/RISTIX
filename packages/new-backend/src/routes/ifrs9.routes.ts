import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import type { AppContext } from '../app'

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
    data: CalculationSchema,
    message: z.string().optional(),
}).openapi('CalculationResponse')

// ============================================================================
// IFRS9 ENDPOINTS
// ============================================================================

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
    async (c) => {
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
    async (c) => {
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
    async (c) => {
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
