import { OpenAPIHono, createRoute } from '@hono/zod-openapi'
import type { AppContext } from '../app'
import { eq, asc } from 'drizzle-orm'
import { platformDb } from '../config/database'
import { platformSettings } from '../db/schema/platform.schema'

export const impactConfigRoutes = new OpenAPIHono<AppContext>()

// GET /impact-config — returns B0031 config + role levels for frontend
impactConfigRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/',
        tags: ['Impact Config'],
        summary: 'Get impact config and role hierarchy',
        responses: { 200: { description: 'Impact configuration' } },
    }),
    async (c) => {
        const { getImpactConfig } = await import('../services/impact-config.service')
        const config = await getImpactConfig()

        // Also fetch role hierarchy from tenant DB
        const { getDatabase } = await import('../config/database')
        const { roles } = await import('../db/schema/rbac.schema')
        const tenantId = c.get('tenantId') || 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be'
        const db = getDatabase(tenantId)

        const roleRows = await db
            .select({
                roleCode: roles.roleCode,
                roleName: roles.roleName,
                hierarchyLevel: roles.hierarchyLevel,
                maxImpactLevel: roles.maxImpactLevel,
            })
            .from(roles)
            .orderBy(asc(roles.hierarchyLevel))

        return c.json({
            success: true,
            data: {
                ...config,
                roles: roleRows,
            },
        })
    }
)
