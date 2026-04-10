import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { Effect, pipe } from 'effect'
import { db, legacyDb } from '@/config'
import { sql } from 'drizzle-orm'
import { dbOperation, runEffect } from '@/lib/effect'

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
                        code: z.string().optional(),
                    }),
                },
            },
        },
    },
})

healthRoutes.openapi(healthCheckRoute, async (c) => {
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
            return c.json({
                success: false,
                error: (payload as any).error || 'Health check failed',
                code: 'HEALTH_CHECK_FAILED',
            }, 500)
        }
        return c.json({
            success: true,
            data: payload,
        }, 200)
    }

    const error = result.cause as unknown as Error
    return c.json({
        success: false,
        error: error.message || 'Internal server error',
        code: 'INTERNAL_ERROR',
    }, 500)
})

const legacyHealthRoute = createRoute({
    method: 'get',
    path: '/legacy',
    tags: ['Health'],
    description: 'Check legacy database connectivity and presence of IFRS9 calculation tables',
    responses: {
        200: {
            description: 'Legacy DB reachable',
            content: {
                'application/json': {
                    schema: z.object({
                        success: z.boolean(),
                        data: z.object({
                            database: z.string(),
                            serverAddr: z.string().nullable(),
                            serverPort: z.number().nullable(),
                            searchPath: z.string().nullable(),
                            hasPublicTable: z.boolean(),
                            hasIfrs9SchemaTable: z.boolean(),
                            totalRows: z.number(),
                            maxPrcDate: z.string().nullable(),
                        }),
                    }),
                },
            },
        },
        500: {
            description: 'Legacy DB unreachable or query failed',
            content: {
                'application/json': {
                    schema: z.object({
                        success: z.boolean(),
                        error: z.string(),
                        code: z.string().optional(),
                    }),
                },
            },
        },
    },
})

healthRoutes.openapi(legacyHealthRoute, async (c) => {
    try {
        const metaRows = await legacyDb.execute(sql`
            select
                current_database()::text as "database",
                inet_server_addr()::text as "serverAddr",
                inet_server_port()::int as "serverPort",
                current_setting('search_path', true)::text as "searchPath",
                to_regclass('frs9_imp_ca_result_h') is not null as "hasPublicTable",
                to_regclass('ifrs9.frs9_imp_ca_result_h') is not null as "hasIfrs9SchemaTable"
        `)

        const meta = (metaRows as any[])[0] || {}
        const hasPublic = Boolean(meta.hasPublicTable)
        const hasIfrs9 = Boolean(meta.hasIfrs9SchemaTable)

        let totalRows = 0
        let maxPrcDate: string | null = null

        if (hasPublic || hasIfrs9) {
            const tableRef = hasPublic ? 'frs9_imp_ca_result_h' : 'ifrs9.frs9_imp_ca_result_h'
            const rows = await legacyDb.execute(sql.raw(`
                select
                    count(*)::bigint as "totalRows",
                    to_char(max(prc_date), 'YYYY-MM-DD') as "maxPrcDate"
                from ${tableRef}
            `))
            const row = (rows as any[])[0] || {}
            totalRows = Number(row.totalRows || 0)
            maxPrcDate = row.maxPrcDate || null
        }

        return c.json({
            success: true,
            data: {
                database: String(meta.database || ''),
                serverAddr: meta.serverAddr ?? null,
                serverPort: meta.serverPort ?? null,
                searchPath: meta.searchPath ?? null,
                hasPublicTable: hasPublic,
                hasIfrs9SchemaTable: hasIfrs9,
                totalRows,
                maxPrcDate,
            },
        }, 200)
    } catch (error: any) {
        return c.json({
            success: false,
            error: error?.message || String(error),
            code: 'LEGACY_HEALTH_CHECK_FAILED',
        }, 500)
    }
})


