import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { Effect, pipe } from 'effect'
import { db } from '@/config'
import { sql } from 'drizzle-orm'
import { dbOperation, runEffect } from '@/lib/effect'
import { buildErrorResponse } from '@/lib/http/error-response'

// Health check routes
export const healthRoutes = new OpenAPIHono()

const healthCheckRoute = createRoute({
    method: 'get',
    path: '/',
    tags: ['Health'],
    description: 'Check system health and database connectivity',
    responses: {
        200: {
            description: 'System is healthy',
            content: {
                'application/json': {
                    schema: z.object({
                        success: z.boolean().default(true),
                        data: z.object({
                            status: z.string().openapi({ example: 'ok' }),
                            timestamp: z.string().datetime().openapi({ example: '2023-01-01T00:00:00.000Z' }),
                            service: z.string().openapi({ example: 'ifrs9-backend' }),
                            database: z.string().openapi({ example: 'connected' }),
                        }),
                    }),
                },
            },
        },
        500: {
            description: 'System unhealthy',
            content: {
                'application/json': {
                    schema: z.object({
                        success: z.boolean().default(false),
                        error: z.string(),
                        message: z.string().optional(),
                        code: z.string().optional(),
                        requestId: z.string().nullable().optional(),
                        timestamp: z.string().optional(),
                        details: z.unknown().optional(),
                    }),
                },
            },
        },
    },
})

healthRoutes.openapi(healthCheckRoute, async (c): Promise<any> => {
    const healthCheck = pipe(
        dbOperation('query', () => db.execute(sql`SELECT 1`)),
        Effect.map(() => ({
            status: 'ok',
            timestamp: new Date().toISOString(),
            service: 'ifrs9-backend',
            database: 'connected',
        })),
        Effect.catchAll((error) =>
            Effect.succeed({
                status: 'error',
                timestamp: new Date().toISOString(),
                service: 'ifrs9-backend',
                database: 'disconnected',
                error: (error as Error).message,
            })
        )
    )
    const result = await Effect.runPromiseExit(healthCheck)

    if (result._tag === 'Success') {
        const payload = result.value
        if (payload.status === 'error') {
            return c.json(buildErrorResponse(c, {
                error: (payload as any).error || 'Health check failed',
                message: (payload as any).error || 'Health check failed',
                code: 'HEALTH_CHECK_FAILED',
            }), 500)
        }
        return c.json({
            success: true,
            data: payload,
        }, 200)
    }

    const error = result.cause as unknown as Error
    return c.json(buildErrorResponse(c, {
        error: error.message || 'Internal server error',
        message: error.message || 'Internal server error',
        code: 'INTERNAL_ERROR',
    }), 500)
})
