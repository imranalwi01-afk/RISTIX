import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import type { AppContext } from '../app'
import { sendDiscordAlert } from '../services/discord-alert.service'

export const monitoringRoutes = new OpenAPIHono<AppContext>()

const FrontendLogLevelSchema = z.enum(['debug', 'info', 'warn', 'error', 'critical'])

const FrontendLogEntrySchema = z.object({
    id: z.string().optional(),
    timestamp: z.string().optional(),
    level: FrontendLogLevelSchema,
    category: z.string().optional(),
    message: z.string(),
    data: z.unknown().optional(),
    userId: z.string().optional(),
    userRole: z.string().optional(),
    stakeholderType: z.string().optional(),
    sessionId: z.string().optional(),
    pathname: z.string().optional(),
    userAgent: z.string().optional(),
    environment: z.string().optional(),
})

const FrontendLogBatchSchema = z.object({
    logs: z.array(FrontendLogEntrySchema).max(200).default([]),
})

const FrontendLogBatchResponseSchema = z.object({
    success: z.boolean(),
    data: z.object({
        received: z.number(),
        forwarded: z.number(),
    }),
})

function isFrontendErrorLevel(level: string): boolean {
    return level === 'error' || level === 'critical'
}

type FrontendLogBatch = z.infer<typeof FrontendLogBatchSchema>

async function forwardFrontendLogBatch(params: {
    payload: FrontendLogBatch
    requestId?: string
    tenantId?: string
    userId?: string
}) {
    const { payload, requestId, tenantId, userId } = params

    const errorLogs = payload.logs.filter((entry) => isFrontendErrorLevel(String(entry.level)))

    if (errorLogs.length > 0) {
        await Promise.allSettled(
            errorLogs.slice(0, 50).map((entry) =>
                sendDiscordAlert({
                    source: 'frontend',
                    severity: entry.level === 'critical' ? 'critical' : 'error',
                    event: 'frontend_runtime_error',
                    message: entry.message,
                    requestId,
                    tenantId,
                    userId: entry.userId || userId,
                    context: {
                        category: entry.category,
                        pathname: entry.pathname,
                        timestamp: entry.timestamp,
                        environment: entry.environment,
                        sessionId: entry.sessionId,
                        userRole: entry.userRole,
                        stakeholderType: entry.stakeholderType,
                        userAgent: entry.userAgent,
                        data: entry.data,
                    },
                })
            )
        )
    }

    return {
        received: payload.logs.length,
        forwarded: errorLogs.length,
    }
}

monitoringRoutes.openapi(
    createRoute({
        method: 'post',
        path: '/frontend-errors',
        tags: ['Monitoring'],
        summary: 'Capture frontend runtime log batch for alerting',
        request: {
            body: {
                content: {
                    'application/json': {
                        schema: FrontendLogBatchSchema,
                    },
                },
            },
        },
        responses: {
            200: {
                content: {
                    'application/json': {
                        schema: FrontendLogBatchResponseSchema,
                    },
                },
                description: 'Frontend logs accepted',
            },
        },
    }),
    async (c) => {
        const payload = c.req.valid('json')
        const result = await forwardFrontendLogBatch({
            payload,
            requestId: c.get('requestId'),
            tenantId: c.get('tenantId'),
            userId: c.get('userId'),
        })

        return c.json({
            success: true,
            data: result,
        })
    }
)

// Compatibility alias for previous client path naming.
monitoringRoutes.openapi(
    createRoute({
        method: 'post',
        path: '/frontend-logs',
        tags: ['Monitoring'],
        summary: 'Capture frontend runtime log batch for alerting (legacy alias)',
        request: {
            body: {
                content: {
                    'application/json': {
                        schema: FrontendLogBatchSchema,
                    },
                },
            },
        },
        responses: {
            200: {
                content: {
                    'application/json': {
                        schema: FrontendLogBatchResponseSchema,
                    },
                },
                description: 'Frontend logs accepted',
            },
        },
    }),
    async (c) => {
        const payload = c.req.valid('json')
        const result = await forwardFrontendLogBatch({
            payload,
            requestId: c.get('requestId'),
            tenantId: c.get('tenantId'),
            userId: c.get('userId'),
        })

        return c.json({
            success: true,
            data: result,
        })
    }
)
