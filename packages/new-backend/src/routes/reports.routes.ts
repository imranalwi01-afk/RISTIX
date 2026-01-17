import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { legacyDb as db } from '../config'
import {
    frs9ImpCaPdTs,
    frs9ImpCaLgdRecData,
    frs9ImpCaResultH,
    frs9ImpMovementData,
    frs9AccountId
} from '../db/schema'
import { desc, eq, getTableColumns } from 'drizzle-orm'
import type { AppContext } from '../app'
import { authMiddleware } from '../middleware'

export const reportsRoutes = new OpenAPIHono<AppContext>()

reportsRoutes.use('*', authMiddleware)

// ============================================================================
// SCHEMAS
// ============================================================================

const PaginationSchema = z.object({
    page: z.string().optional(),
    limit: z.string().optional()
})

const GenericListResponse = (schema: z.ZodTypeAny) => z.object({
    success: z.boolean(),
    data: z.array(schema)
}).openapi('GenericListResponse')

const ErrorResponse = z.object({
    success: z.boolean(),
    message: z.string(),
    error: z.string().optional()
}).openapi('ErrorResponse')

// Schemas for report data (Generic for now as they are direct table dumps)
// In a real scenario, these should be explicitly typed based on table schemas.
const ReportDataSchema = z.record(z.any()).openapi('ReportData')

// ============================================================================
// HELPERS
// ============================================================================

const getPagination = (c: any) => {
    const page = Number(c.req.query('page') || '1')
    const limit = Number(c.req.query('limit') || '10')
    const offset = (page - 1) * limit
    return { page, limit, offset }
}

// ============================================================================
// ENDPOINTS
// ============================================================================

// ... (keeping imports)

// GET /lifetime-pd/yearly
reportsRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/lifetime-pd/yearly',
        tags: ['Reports'],
        summary: 'Get Lifetime PD Yearly',
        request: {
            query: PaginationSchema
        },
        responses: {
            200: { content: { 'application/json': { schema: GenericListResponse(ReportDataSchema) } }, description: 'Report Data' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c) => {
        try {
            const { limit, offset } = getPagination(c)
            const data = await db.select().from(frs9ImpCaPdTs)
                .limit(limit).offset(offset)
            return c.json({ success: true, data } as any)
        } catch (e) {
            return c.json({ success: false, message: String(e) }, 500)
        }
    }
)

// GET /lifetime-pd/monthly
reportsRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/lifetime-pd/monthly',
        tags: ['Reports'],
        summary: 'Get Lifetime PD Monthly',
        request: {
            query: PaginationSchema
        },
        responses: {
            200: { content: { 'application/json': { schema: GenericListResponse(ReportDataSchema) } }, description: 'Report Data' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c) => {
        try {
            const { limit, offset } = getPagination(c)
            const data = await db.select().from(frs9ImpCaPdTs)
                .limit(limit).offset(offset)
            return c.json({ success: true, data } as any)
        } catch (e) {
            return c.json({ success: false, message: String(e) }, 500)
        }
    }
)

// GET /lifetime-lgd
reportsRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/lifetime-lgd',
        tags: ['Reports'],
        summary: 'Get Lifetime LGD',
        request: {
            query: PaginationSchema
        },
        responses: {
            200: { content: { 'application/json': { schema: GenericListResponse(ReportDataSchema) } }, description: 'Report Data' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c) => {
        try {
            const { limit, offset } = getPagination(c)
            const data = await db.select({
                ...getTableColumns(frs9ImpCaLgdRecData),
                cifName: frs9AccountId.cifName,
                accountNumber: frs9AccountId.accountNumber
            })
                .from(frs9ImpCaLgdRecData)
                .leftJoin(frs9AccountId, eq(frs9ImpCaLgdRecData.accountId, frs9AccountId.accountId as any))
                .limit(limit).offset(offset)
            return c.json({ success: true, data } as any)
        } catch (e) {
            return c.json({ success: false, message: String(e) }, 500)
        }
    }
)

// GET /ead-model
reportsRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/ead-model',
        tags: ['Reports'],
        summary: 'Get EAD Model',
        request: {
            query: PaginationSchema
        },
        responses: {
            200: { content: { 'application/json': { schema: GenericListResponse(ReportDataSchema) } }, description: 'Report Data' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c) => {
        try {
            const { limit, offset } = getPagination(c)
            const data = await db.select({
                ...getTableColumns(frs9ImpCaResultH),
                cifName: frs9AccountId.cifName,
                accountNumber: frs9AccountId.accountNumber
            })
                .from(frs9ImpCaResultH)
                .leftJoin(frs9AccountId, eq(frs9ImpCaResultH.accountId, frs9AccountId.accountId as any))
                .limit(limit).offset(offset)
            return c.json({ success: true, data } as any)
        } catch (e) {
            return c.json({ success: false, message: String(e) }, 500)
        }
    }
)

// GET /ecl-result
reportsRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/ecl-result',
        tags: ['Reports'],
        summary: 'Get ECL Result',
        request: {
            query: PaginationSchema
        },
        responses: {
            200: { content: { 'application/json': { schema: GenericListResponse(ReportDataSchema) } }, description: 'Report Data' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c) => {
        try {
            const { limit, offset } = getPagination(c)
            const data = await db.select({
                ...getTableColumns(frs9ImpCaResultH),
                cifName: frs9AccountId.cifName,
                accountNumber: frs9AccountId.accountNumber
            })
                .from(frs9ImpCaResultH)
                .leftJoin(frs9AccountId, eq(frs9ImpCaResultH.accountId, frs9AccountId.accountId as any))
                .orderBy(desc(frs9ImpCaResultH.prcDate))
                .limit(limit).offset(offset)
            return c.json({ success: true, data } as any)
        } catch (e) {
            return c.json({ success: false, message: String(e) }, 500)
        }
    }
)

// GET /ecl-movement
reportsRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/ecl-movement',
        tags: ['Reports'],
        summary: 'Get ECL Movement',
        request: {
            query: PaginationSchema
        },
        responses: {
            200: { content: { 'application/json': { schema: GenericListResponse(ReportDataSchema) } }, description: 'Report Data' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c) => {
        try {
            const { limit, offset } = getPagination(c)
            const data = await db.select()
                .from(frs9ImpMovementData)
                .limit(limit).offset(offset)
            return c.json({ success: true, data } as any)
        } catch (e) {
            return c.json({ success: false, message: String(e) }, 500)
        }
    }
)

// GET /gca-movement
reportsRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/gca-movement',
        tags: ['Reports'],
        summary: 'Get GCA Movement',
        request: {
            query: PaginationSchema
        },
        responses: {
            200: { content: { 'application/json': { schema: GenericListResponse(ReportDataSchema) } }, description: 'Report Data' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c) => {
        try {
            const { limit, offset } = getPagination(c)
            const data = await db.select()
                .from(frs9ImpMovementData)
                .limit(limit).offset(offset)
            return c.json({ success: true, data } as any)
        } catch (e) {
            return c.json({ success: false, message: String(e) }, 500)
        }
    }
)

// POST /export
reportsRoutes.openapi(
    createRoute({
        method: 'post',
        path: '/export',
        tags: ['Reports'],
        summary: 'Export Report',
        responses: {
            200: { content: { 'application/json': { schema: z.object({ success: z.boolean(), message: z.string() }) } }, description: 'Export Initiated' }
        }
    }),
    async (c) => {
        return c.json({ success: true, message: "Export initiated" })
    }
)
