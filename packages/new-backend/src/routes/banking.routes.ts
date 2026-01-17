import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import type { AppContext } from '../app'

/**
 * Banking Routes (STUB)
 * TODO: Implement real database queries
 */
export const bankingRoutes = new OpenAPIHono<AppContext>()

// ============================================================================
// SCHEMAS
// ============================================================================

const MetaSchema = z.object({
    total: z.number(),
    page: z.number(),
    limit: z.number(),
}).openapi('Meta')

const PortfolioSchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().optional(),
    status: z.string(),
}).openapi('Portfolio')

const AccountSchema = z.object({
    id: z.string(),
    accountNumber: z.string(),
    accountName: z.string(),
    balance: z.number(),
    status: z.string(),
}).openapi('Account')

const CustomerSchema = z.object({
    id: z.string(),
    name: z.string(),
    email: z.string().email(),
    status: z.string(),
}).openapi('Customer')

const ProductSchema = z.object({
    id: z.string(),
    name: z.string(),
    code: z.string(),
    type: z.string(),
    status: z.string(),
}).openapi('Product')

const TransactionSchema = z.object({
    id: z.string(),
    type: z.string(),
    amount: z.number(),
    date: z.string(),
    status: z.string(),
}).openapi('Transaction')

const createListResponse = (schema: z.ZodTypeAny, name: string) => z.object({
    success: z.boolean(),
    data: z.array(schema),
    meta: MetaSchema,
    message: z.string().optional(),
}).openapi(`${name}ListResponse`)

const createResponse = (schema: z.ZodTypeAny, name: string) => z.object({
    success: z.boolean(),
    data: schema,
    message: z.string().optional(),
}).openapi(`${name}Response`)

// ============================================================================
// PORTFOLIO ENDPOINTS
// ============================================================================

bankingRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/portfolio',
        tags: ['Banking - Portfolio'],
        summary: 'List Portfolios',
        responses: {
            200: {
                content: { 'application/json': { schema: createListResponse(PortfolioSchema, 'Portfolio') } },
                description: 'Portfolio list'
            }
        }
    }),
    async (c) => {
        return c.json({
            success: true,
            data: [],
            meta: { total: 0, page: 1, limit: 10 },
            message: 'Portfolio list - stub implementation',
        })
    }
)

bankingRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/portfolio/{id}',
        tags: ['Banking - Portfolio'],
        summary: 'Get Portfolio',
        request: {
            params: z.object({ id: z.string() })
        },
        responses: {
            200: {
                content: { 'application/json': { schema: createResponse(PortfolioSchema, 'Portfolio') } },
                description: 'Portfolio details'
            }
        }
    }),
    async (c) => {
        const id = c.req.param('id')
        return c.json({
            success: true,
            data: { id, name: 'Sample Portfolio', description: 'Stub data', status: 'active' },
            message: 'Portfolio detail - stub implementation',
        })
    }
)

bankingRoutes.openapi(
    createRoute({
        method: 'post',
        path: '/portfolio',
        tags: ['Banking - Portfolio'],
        summary: 'Create Portfolio',
        request: {
            body: {
                content: { 'application/json': { schema: PortfolioSchema.omit({ id: true }) } },
            }
        },
        responses: {
            201: {
                content: { 'application/json': { schema: createResponse(PortfolioSchema, 'Portfolio') } },
                description: 'Portfolio created'
            }
        }
    }),
    async (c) => {
        const body = c.req.valid('json')
        return c.json({
            success: true,
            data: { id: 'new-id', ...body, status: 'active' },
            message: 'Portfolio created - stub implementation',
        }, 201)
    }
)

bankingRoutes.openapi(
    createRoute({
        method: 'put',
        path: '/portfolio/{id}',
        tags: ['Banking - Portfolio'],
        summary: 'Update Portfolio',
        request: {
            params: z.object({ id: z.string() }),
            body: {
                content: { 'application/json': { schema: PortfolioSchema.partial().omit({ id: true }) } },
            }
        },
        responses: {
            200: {
                content: { 'application/json': { schema: createResponse(PortfolioSchema, 'Portfolio') } },
                description: 'Portfolio updated'
            }
        }
    }),
    async (c) => {
        const id = c.req.param('id')
        const body = c.req.valid('json')
        return c.json({
            success: true,
            data: { id, name: 'Updated', status: 'active', ...body },
            message: 'Portfolio updated - stub implementation',
        })
    }
)

bankingRoutes.openapi(
    createRoute({
        method: 'delete',
        path: '/portfolio/{id}',
        tags: ['Banking - Portfolio'],
        summary: 'Delete Portfolio',
        request: {
            params: z.object({ id: z.string() }),
        },
        responses: {
            200: {
                content: { 'application/json': { schema: z.object({ success: z.boolean(), message: z.string() }) } },
                description: 'Portfolio deleted'
            }
        }
    }),
    async (c) => {
        const id = c.req.param('id')
        return c.json({
            success: true,
            message: `Portfolio ${id} deleted - stub implementation`,
        })
    }
)

// ============================================================================
// ACCOUNTS ENDPOINTS
// ============================================================================

bankingRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/accounts',
        tags: ['Banking - Accounts'],
        summary: 'List Accounts',
        responses: {
            200: {
                content: { 'application/json': { schema: createListResponse(AccountSchema, 'Account') } },
                description: 'Accounts list'
            }
        }
    }),
    async (c) => {
        return c.json({
            success: true,
            data: [],
            meta: { total: 0, page: 1, limit: 10 },
            message: 'Accounts list - stub implementation',
        })
    }
)

bankingRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/accounts/{id}',
        tags: ['Banking - Accounts'],
        summary: 'Get Account',
        request: { params: z.object({ id: z.string() }) },
        responses: {
            200: {
                content: { 'application/json': { schema: createResponse(AccountSchema, 'Account') } },
                description: 'Account details'
            }
        }
    }),
    async (c) => {
        const id = c.req.param('id')
        return c.json({
            success: true,
            data: { id, accountNumber: 'ACC-001', accountName: 'Sample', balance: 0, status: 'active' },
            message: 'Account detail - stub implementation',
        })
    }
)

// ============================================================================
// CUSTOMERS ENDPOINTS
// ============================================================================

bankingRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/customers',
        tags: ['Banking - Customers'],
        summary: 'List Customers',
        responses: {
            200: {
                content: { 'application/json': { schema: createListResponse(CustomerSchema, 'Customer') } },
                description: 'Customers list'
            }
        }
    }),
    async (c) => {
        return c.json({
            success: true,
            data: [],
            meta: { total: 0, page: 1, limit: 10 },
            message: 'Customers list - stub implementation',
        })
    }
)

bankingRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/customers/{id}',
        tags: ['Banking - Customers'],
        summary: 'Get Customer',
        request: { params: z.object({ id: z.string() }) },
        responses: {
            200: {
                content: { 'application/json': { schema: createResponse(CustomerSchema, 'Customer') } },
                description: 'Customer details'
            }
        }
    }),
    async (c) => {
        const id = c.req.param('id')
        return c.json({
            success: true,
            data: { id, name: 'Sample', email: 'customer@example.com', status: 'active' },
            message: 'Customer detail - stub implementation',
        })
    }
)

// ============================================================================
// PRODUCTS ENDPOINTS
// ============================================================================

bankingRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/products',
        tags: ['Banking - Products'],
        summary: 'List Products',
        responses: {
            200: {
                content: { 'application/json': { schema: createListResponse(ProductSchema, 'Product') } },
                description: 'Products list'
            }
        }
    }),
    async (c) => {
        return c.json({
            success: true,
            data: [],
            meta: { total: 0, page: 1, limit: 10 },
            message: 'Products list - stub implementation',
        })
    }
)

bankingRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/products/{id}',
        tags: ['Banking - Products'],
        summary: 'Get Product',
        request: { params: z.object({ id: z.string() }) },
        responses: {
            200: {
                content: { 'application/json': { schema: createResponse(ProductSchema, 'Product') } },
                description: 'Product details'
            }
        }
    }),
    async (c) => {
        const id = c.req.param('id')
        return c.json({
            success: true,
            data: { id, name: 'Sample', code: 'PROD-001', type: 'loan', status: 'active' },
            message: 'Product detail - stub implementation',
        })
    }
)

// ============================================================================
// TRANSACTIONS ENDPOINTS
// ============================================================================

bankingRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/transactions',
        tags: ['Banking - Transactions'],
        summary: 'List Transactions',
        responses: {
            200: {
                content: { 'application/json': { schema: createListResponse(TransactionSchema, 'Transaction') } },
                description: 'Transactions list'
            }
        }
    }),
    async (c) => {
        return c.json({
            success: true,
            data: [],
            meta: { total: 0, page: 1, limit: 10 },
            message: 'Transactions list - stub implementation',
        })
    }
)

bankingRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/transactions/{id}',
        tags: ['Banking - Transactions'],
        summary: 'Get Transaction',
        request: { params: z.object({ id: z.string() }) },
        responses: {
            200: {
                content: { 'application/json': { schema: createResponse(TransactionSchema, 'Transaction') } },
                description: 'Transaction details'
            }
        }
    }),
    async (c) => {
        const id = c.req.param('id')
        return c.json({
            success: true,
            data: { id, type: 'debit', amount: 0, date: new Date().toISOString(), status: 'completed' },
            message: 'Transaction detail - stub implementation',
        })
    }
)
