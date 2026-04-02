import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import type { AppContext } from '../app'
import { openApiValidationHook } from '../lib/http/openapi-validation-hook'

/**
 * Banking Resource Routes (STUB)
 * TODO: Implement banking resource management
 */
export const bankingResourceRoutes = new OpenAPIHono<AppContext>({ defaultHook: openApiValidationHook })

// ============================================================================
// SCHEMAS
// ============================================================================

const BankingResourceSchema = z.object({
    id: z.string(),
    name: z.string(),
    type: z.string(),
    url: z.string().optional(),
}).openapi('BankingResource')

const BankingResourceListResponse = z.object({
    success: z.boolean(),
    data: z.array(BankingResourceSchema),
    message: z.string().optional(),
}).openapi('BankingResourceListResponse')

const BankingResourceResponse = z.object({
    success: z.boolean(),
    data: BankingResourceSchema,
    message: z.string().optional(),
}).openapi('BankingResourceResponse')

// ============================================================================
// ENDPOINTS
// ============================================================================

bankingResourceRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/',
        tags: ['Banking Resource'],
        summary: 'List Banking Resources',
        responses: {
            200: { content: { 'application/json': { schema: BankingResourceListResponse } }, description: 'List Resources' }
        }
    }),
    async (c) => {
        return c.json({
            success: true,
            data: [],
            message: 'Banking resources - stub implementation',
        })
    }
)

bankingResourceRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/{id}',
        tags: ['Banking Resource'],
        summary: 'Get Banking Resource',
        request: {
            params: z.object({ id: z.string() })
        },
        responses: {
            200: { content: { 'application/json': { schema: BankingResourceResponse } }, description: 'Resource Details' }
        }
    }),
    async (c) => {
        const id = c.req.param('id')
        return c.json({
            success: true,
            data: {
                id,
                name: 'Sample Resource',
                type: 'document',
            },
            message: 'Banking resource detail - stub implementation',
        })
    }
)
