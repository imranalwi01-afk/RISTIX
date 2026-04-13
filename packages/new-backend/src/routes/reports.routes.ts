import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { legacyDb as db } from '../config'
import {
    frs9ImpCaPdTs,
    frs9ImpCaLgdRecData,
    frs9ImpCaResultH,
    frs9ImpMovementData,
    frs9AccountId,
    frs9ImpCaResultD
} from '../db/schema'
import { desc, eq, getTableColumns, and } from 'drizzle-orm'
import type { AppContext } from '../app'
import { authMiddleware } from '../middleware'
import { ifrs9ReportsController } from '../controllers/ifrs9-reports.controller'
import { openApiValidationHook } from '../lib/http/openapi-validation-hook'

export const reportsRoutes: any = new OpenAPIHono<AppContext>({ defaultHook: openApiValidationHook })

reportsRoutes.use('*', authMiddleware)

// ============================================================================
// SCHEMAS
// ============================================================================

const PaginationSchema = z.object({
    page: z.string().optional(),
    limit: z.string().optional()
})

const PDReportQuerySchema = PaginationSchema.extend({
    prcDate: z.string().optional(),
    pdModelId: z.string().optional(),
    pdYear: z.string().optional(),
})

const NominativeReportQuerySchema = PaginationSchema.extend({
    prc_date: z.string().optional(),
    download_start_date: z.string().optional(),
    download_end_date: z.string().optional(),
    group_segment: z.union([z.string(), z.array(z.string())]).optional(),
    segment: z.union([z.string(), z.array(z.string())]).optional(),
    stage: z.union([z.string(), z.array(z.string())]).optional(),
    branch_code: z.union([z.string(), z.array(z.string())]).optional(),
})

const NominativeAvailableDatesQuerySchema = z.object({
    download_start_date: z.string().optional(),
    download_end_date: z.string().optional(),
    limit: z.string().optional(),
})

const GenericListResponse = (schema: z.ZodTypeAny) => z.object({
    success: z.boolean(),
    data: z.array(schema),
    pagination: z.object({
        page: z.number(),
        limit: z.number(),
        total: z.number(),
        totalPages: z.number()
    }).optional(),
    message: z.string().optional()
}).openapi('GenericListResponse')

const ErrorResponse = z.object({
    success: z.boolean(),
    message: z.string().optional(),
    error: z.string().optional()
}).openapi('ErrorResponse')

const ReportDebugConfigSchema = z.object({
    enabled: z.boolean(),
    source: z.enum(['db', 'default']),
    paramCode: z.string(),
}).openapi('ReportDebugConfig')

// Schemas for report data (Generic for now as they are direct table dumps)
// In a real scenario, these should be explicitly typed based on table schemas.
const ReportDataSchema = z.record(z.any()).openapi('ReportData')

const NominativeAvailableDateSchema = z.object({
    prc_date: z.string(),
    total_accounts: z.number(),
    total_outstanding: z.number(),
    total_ecl: z.number(),
}).openapi('NominativeAvailableDate')

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

reportsRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/debug-config',
        tags: ['Reports'],
        summary: 'Get IFRS9 report debug configuration',
        responses: {
            200: {
                content: {
                    'application/json': {
                        schema: z.object({
                            success: z.boolean(),
                            data: ReportDebugConfigSchema,
                        }),
                    },
                },
                description: 'Report debug config',
            },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    (c: any) => ifrs9ReportsController.getDebugConfig(c)
)

reportsRoutes.openapi(
    createRoute({
        method: 'put',
        path: '/debug-config',
        tags: ['Reports'],
        summary: 'Update IFRS9 report debug configuration',
        request: {
            body: {
                content: {
                    'application/json': {
                        schema: z.object({
                            enabled: z.boolean(),
                        }),
                    },
                },
            },
        },
        responses: {
            200: {
                content: {
                    'application/json': {
                        schema: z.object({
                            success: z.boolean(),
                            data: ReportDebugConfigSchema,
                            message: z.string().optional(),
                        }),
                    },
                },
                description: 'Updated report debug config',
            },
            403: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Forbidden' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    (c: any) => ifrs9ReportsController.updateDebugConfig(c)
)

// GET /lifetime-pd/yearly
reportsRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/lifetime-pd/yearly',
        tags: ['Reports'],
        summary: 'Get Lifetime PD Yearly',
        request: {
            query: PDReportQuerySchema
        },
        responses: {
            200: { content: { 'application/json': { schema: GenericListResponse(ReportDataSchema) } }, description: 'Report Data' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    (c: any) => ifrs9ReportsController.getLifetimePDYearly(c)
)

// GET /lifetime-pd/monthly
reportsRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/lifetime-pd/monthly',
        tags: ['Reports'],
        summary: 'Get Lifetime PD Monthly',
        request: {
            query: PDReportQuerySchema
        },
        responses: {
            200: { content: { 'application/json': { schema: GenericListResponse(ReportDataSchema) } }, description: 'Report Data' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    (c: any) => ifrs9ReportsController.getLifetimePDMonthly(c)
)

// GET /lifetime-pd/account-details
reportsRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/lifetime-pd/account-details',
        tags: ['Reports'],
        summary: 'Get Lifetime PD Account Details',
        request: {
            query: PDReportQuerySchema
        },
        responses: {
            200: { content: { 'application/json': { schema: GenericListResponse(ReportDataSchema) } }, description: 'Report Data' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    (c: any) => ifrs9ReportsController.getLifetimePDAccountDetails(c)
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
    (c: any) => ifrs9ReportsController.getLifetimeLGD(c)
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
    (c: any) => ifrs9ReportsController.getEADModel(c)
)

// GET /ead-model/summary
reportsRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/ead-model/summary',
        tags: ['Reports'],
        summary: 'Get EAD Model Summary',
        request: {
            query: PaginationSchema
        },
        responses: {
            200: { content: { 'application/json': { schema: GenericListResponse(ReportDataSchema) } }, description: 'Report Data' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    (c: any) => ifrs9ReportsController.getEADModelSummary(c)
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
    (c: any) => ifrs9ReportsController.getECLResult(c)
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
    (c: any) => ifrs9ReportsController.getECLMovement(c)
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
    (c: any) => ifrs9ReportsController.getGCAMovement(c)
)

// GET /nominative-report
reportsRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/nominative-report',
        tags: ['Reports'],
        summary: 'Get Nominative Report',
        request: {
            query: NominativeReportQuerySchema
        },
        responses: {
            200: { content: { 'application/json': { schema: GenericListResponse(ReportDataSchema) } }, description: 'Report Data' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    (c: any) => ifrs9ReportsController.getNominativeReport(c)
)

// GET /nominative-report/available-dates
reportsRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/nominative-report/available-dates',
        tags: ['Reports'],
        summary: 'Get available prc_date snapshots for Nominative Report',
        request: {
            query: NominativeAvailableDatesQuerySchema
        },
        responses: {
            200: { content: { 'application/json': { schema: z.object({ success: z.boolean(), data: z.array(NominativeAvailableDateSchema) }) } }, description: 'Available dates' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    (c: any) => ifrs9ReportsController.getNominativeAvailableDates(c)
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
    (c: any) => ifrs9ReportsController.exportReport(c)
)
