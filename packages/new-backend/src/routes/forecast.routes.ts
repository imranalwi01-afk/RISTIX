import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import type { AppContext } from '../app';
import { authMiddleware } from '../middleware';
import { forecastController } from '../controllers/forecast.controller';

export const forecastRoutes: any = new OpenAPIHono<AppContext>();

forecastRoutes.use('*', authMiddleware);

// --- SCHEMAS ---
const SuccessResponseSchema = z.object({
    success: z.boolean(),
    message: z.string().optional(),
    data: z.any().optional()
}).openapi('SuccessResponse');

const ErrorResponse = z.object({
    success: z.boolean(),
    message: z.string(),
    error: z.string().optional()
}).openapi('ErrorResponse');


// --- ROUTES ---

forecastRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/',
        tags: ['Forecast'],
        summary: 'Get Forecasts',
        request: {
            query: z.object({
                limit: z.string().optional(),
                offset: z.string().optional()
            })
        },
        responses: {
            200: { content: { 'application/json': { schema: SuccessResponseSchema } }, description: 'Forecast List' },
            401: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Unauthorized' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    (c: any) => forecastController.getForecasts(c)
);

forecastRoutes.openapi(
    createRoute({
        method: 'post',
        path: '/trigger',
        tags: ['Forecast'],
        summary: 'Trigger new forecast calculation',
        request: {
            body: {
                content: {
                    'application/json': {
                        schema: z.object({
                            scenario: z.string().optional(),
                            timeHorizon: z.number().optional()
                        })
                    }
                }
            }
        },
        responses: {
            200: { content: { 'application/json': { schema: SuccessResponseSchema } }, description: 'Forecast Queued' },
            401: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Unauthorized' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    (c: any) => forecastController.triggerForecast(c)
);
