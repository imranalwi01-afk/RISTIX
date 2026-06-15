import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { legacyDb } from '@/config'
import { frs9RPdAfl } from '@/db/schema/legacy'
import { desc, isNull, or, eq } from 'drizzle-orm'
import { openApiValidationHook } from '@/lib/http/openapi-validation-hook'
import { buildErrorResponse } from '@/lib/http/error-response'

export const rAnalyticsRoutes = new OpenAPIHono({ defaultHook: openApiValidationHook })

const getSavedRoute = createRoute({
    method: 'get',
    path: '/saved',
    tags: ['R Analytics'],
    description: 'Get recently saved R Analytics calculation',
    responses: {
        200: {
            description: 'Success',
            content: {
                'application/json': {
                    schema: z.object({
                        success: z.boolean(),
                        data: z.any()
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
})

rAnalyticsRoutes.openapi(getSavedRoute, async (c) => {
    try {
        const result = await legacyDb.select({
            id: frs9RPdAfl.id,
            model_name: frs9RPdAfl.modelName,
            r_squared: frs9RPdAfl.rSquared,
            mape: frs9RPdAfl.mape,
            created_date: frs9RPdAfl.createdDate,
            model_status: frs9RPdAfl.modelStatus
        }).from(frs9RPdAfl)
        .where(
            or(
                isNull(frs9RPdAfl.isDeleted),
                eq(frs9RPdAfl.isDeleted, false)
            )
        )
        .orderBy(desc(frs9RPdAfl.id))
        .limit(1)

        return c.json({
            success: true,
            data: result.length > 0 ? result[0] : null
        }, 200)
    } catch (error: any) {
        console.error('[R Analytics] Get saved error:', error)
        return c.json({
            success: false,
            error: error.message || 'Failed to fetch saved R Analytics data',
            code: 'FETCH_ERROR'
        }, 500)
    }
})

const getHistoryRoute = createRoute({
    method: 'get',
    path: '/pd-afl-history',
    tags: ['R Analytics'],
    description: 'Get R Analytics calculation history',
    responses: {
        200: {
            description: 'Success',
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
})

rAnalyticsRoutes.openapi(getHistoryRoute, async (c) => {
    try {
        const result = await legacyDb.select({
            id: frs9RPdAfl.id,
            model_name: frs9RPdAfl.modelName,
            r_squared: frs9RPdAfl.rSquared,
            mape: frs9RPdAfl.mape,
            created_date: frs9RPdAfl.createdDate,
            model_status: frs9RPdAfl.modelStatus
        }).from(frs9RPdAfl)
        .where(
            or(
                isNull(frs9RPdAfl.isDeleted),
                eq(frs9RPdAfl.isDeleted, false)
            )
        )
        .orderBy(desc(frs9RPdAfl.id))

        return c.json({
            success: true,
            data: result
        }, 200)
    } catch (error: any) {
        console.error('[R Analytics] Get history error:', error)
        return c.json({
            success: false,
            error: error.message || 'Failed to fetch R Analytics history',
            code: 'FETCH_ERROR'
        }, 500)
    }
})

const downloadHistoryRoute = createRoute({
    method: 'get',
    path: '/pd-afl-history/{id}/download',
    tags: ['R Analytics'],
    description: 'Download R Analytics calculation file',
    request: {
        params: z.object({
            id: z.string().openapi({ description: 'ID' })
        })
    },
    responses: {
        200: {
            description: 'Success',
            content: {
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
                    schema: {
                        type: 'string',
                        format: 'binary'
                    }
                }
            }
        },
        404: {
            description: 'Not found',
            content: {
                'application/json': {
                    schema: z.object({
                        success: z.boolean(),
                        error: z.string()
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
})

rAnalyticsRoutes.openapi(downloadHistoryRoute, async (c) => {
    try {
        const id = parseInt(c.req.valid('param').id)
        if (isNaN(id)) {
            return c.json({ success: false, error: 'Invalid ID' }, 404)
        }
        
        const result = await legacyDb.select({
            dataFile: frs9RPdAfl.dataFile,
            modelName: frs9RPdAfl.modelName
        }).from(frs9RPdAfl)
        .where(eq(frs9RPdAfl.id, id))
        .limit(1)

        if (result.length === 0 || !result[0].dataFile) {
            return c.json({ success: false, error: 'File not found' }, 404)
        }

        const fileName = `${result[0].modelName || 'r_analytics_result'}.xlsx`
        
        c.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        c.header('Content-Disposition', `attachment; filename="${fileName}"`)
        
        return c.body(result[0].dataFile as any)
    } catch (error: any) {
        console.error('[R Analytics] Download error:', error)
        return c.json({
            success: false,
            error: error.message || 'Failed to download file',
            code: 'DOWNLOAD_ERROR'
        }, 500)
    }
})
