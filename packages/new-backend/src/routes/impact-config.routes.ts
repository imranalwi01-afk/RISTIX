import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { platformDb } from '../config/database'
import { platformSettings } from '../db/schema/platform.schema'
import { eq } from 'drizzle-orm'
import { getImpactConfig, clearImpactConfigCache, ImpactConfig } from '../services/impact-config.service'
import type { AppContext } from '../app'
import { authMiddleware } from '../middleware'
import { buildErrorResponse } from '../lib/http/error-response'
import { openApiValidationHook } from '../lib/http/openapi-validation-hook'

export const impactConfigRoutes = new OpenAPIHono<AppContext>({ defaultHook: openApiValidationHook })

impactConfigRoutes.use('*', authMiddleware)

const SYSTEM_USER_ID = '00000000-0000-0000-0000-000000000000'

// GET /impact-config - Get current impact configuration
impactConfigRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/',
        tags: ['Impact Config'],
        summary: 'Get impact level configuration',
        responses: { 200: { description: 'Impact configuration' } },
    }),
    async (c) => {
        const config = await getImpactConfig()
        return c.json({ success: true, data: config })
    }
)

// PUT /impact-config - Update impact configuration
impactConfigRoutes.openapi(
    createRoute({
        method: 'put',
        path: '/',
        tags: ['Impact Config'],
        summary: 'Update impact level configuration',
        request: {
            body: { content: { 'application/json': { schema: z.record(z.string(), z.unknown()) } } },
        },
        responses: { 200: { description: 'Configuration updated' } },
    }),
    async (c) => {
        const userId = c.get('userId') || SYSTEM_USER_ID
        const body = c.req.valid('json') as Partial<ImpactConfig>

        const existing = await platformDb
            .select({ value: platformSettings.value })
            .from(platformSettings)
            .where(eq(platformSettings.key, 'impact_level_config'))
            .limit(1)

        const merged = existing.length > 0
            ? { ...existing[0].value as object, ...body }
            : body

        await platformDb
            .insert(platformSettings)
            .values({
                key: 'impact_level_config',
                value: merged as any,
                description: 'Impact level configuration for approval workflows',
                updatedAt: new Date(),
            } as any)
            .onConflictDoUpdate({
                target: platformSettings.key,
                set: { value: merged as any, updatedAt: new Date() } as any,
            })

        clearImpactConfigCache()
        const config = await getImpactConfig()
        return c.json({ success: true, data: config })
    }
)

// POST /impact-config/reset - Reset to defaults
impactConfigRoutes.openapi(
    createRoute({
        method: 'post',
        path: '/reset',
        tags: ['Impact Config'],
        summary: 'Reset impact configuration to defaults',
        responses: { 200: { description: 'Configuration reset' } },
    }),
    async (c) => {
        await platformDb.delete(platformSettings)
            .where(eq(platformSettings.key, 'impact_level_config'))

        clearImpactConfigCache()
        const config = await getImpactConfig()
        return c.json({ success: true, data: config, message: 'Reset to default configuration' })
    }
)
