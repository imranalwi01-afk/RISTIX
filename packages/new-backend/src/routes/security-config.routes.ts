import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import type { AppContext } from '../app'
import { openApiValidationHook } from '../lib/http/openapi-validation-hook'

/**
 * Security Config Routes (STUB)
 * TODO: Implement security configuration
 */
export const securityConfigRoutes = new OpenAPIHono<AppContext>({ defaultHook: openApiValidationHook })

// ============================================================================
// SCHEMAS
// ============================================================================

const SecurityConfigSchema = z.object({
    passwordPolicy: z.record(z.any()).optional(),
    sessionTimeout: z.number().optional(),
    mfaEnabled: z.boolean().optional(),
}).openapi('SecurityConfig')

const UpdateSecurityConfigSchema = SecurityConfigSchema.openapi('UpdateSecurityConfigInput')

const SecurityConfigResponse = z.object({
    success: z.boolean(),
    data: SecurityConfigSchema,
    message: z.string().optional(),
}).openapi('SecurityConfigResponse')

// ============================================================================
// ENDPOINTS
// ============================================================================

securityConfigRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/',
        tags: ['Security Config'],
        summary: 'Get Security Config',
        responses: {
            200: { content: { 'application/json': { schema: SecurityConfigResponse } }, description: 'Security Config' }
        }
    }),
    async (c) => {
        return c.json({
            success: true,
            data: {
                passwordPolicy: {},
                sessionTimeout: 3600,
                mfaEnabled: false,
            },
            message: 'Security config - stub implementation',
        })
    }
)

securityConfigRoutes.openapi(
    createRoute({
        method: 'put',
        path: '/',
        tags: ['Security Config'],
        summary: 'Update Security Config',
        request: {
            body: { content: { 'application/json': { schema: UpdateSecurityConfigSchema } } }
        },
        responses: {
            200: { content: { 'application/json': { schema: SecurityConfigResponse } }, description: 'Updated' }
        }
    }),
    async (c) => {
        const body = c.req.valid('json')
        return c.json({
            success: true,
            data: body,
            message: 'Security config updated - stub implementation',
        })
    }
)
