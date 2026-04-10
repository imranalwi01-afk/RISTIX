import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { legacyDb as db } from '../config'
import { eq, desc, sql, and } from 'drizzle-orm'
import {
    frs9ImpCaEclSum,
    frs9ImpCaEclConfigh,
    frs9ImpCaResultH,
    frs9ImpCaResultD
} from '../db/schema'
import type { AppContext } from '../app'
import { authMiddleware } from '../middleware'
import { buildErrorResponse } from '../lib/http/error-response'
import { openApiValidationHook } from '../lib/http/openapi-validation-hook'

export const impairmentRoutes: any = new OpenAPIHono<AppContext>({ defaultHook: openApiValidationHook })

impairmentRoutes.use('*', authMiddleware)

// ============================================================================
// SCHEMAS
// ============================================================================

const RunCalculationSchema = z.object({
    calculationName: z.string().openapi({ example: 'Run 2024 Q1' }),
    calculationType: z.enum(['ECL', 'PD', 'LGD', 'EAD', 'STAGING']).openapi({ example: 'ECL' }),
    portfolioId: z.string().optional(),
    reportingDate: z.string().openapi({ example: '2024-03-31' }),
    currency: z.string().default('IDR'),
    assumptions: z.string().optional()
}).openapi('RunCalculationInput')

const ImpResultHSchema = z.object({
    pkid: z.number(),
    runId: z.string().nullable(),
    prcDate: z.string().nullable(),
    totalAccounts: z.number().nullable(),
    // Add other fields as per schema if needed, keeping it flexible for now
}).openapi('ImpairmentResultHeader')

const CalculationAggregateSchema = z.object({
    id: z.string(),
    calculationName: z.string().nullable(),
    calculationType: z.string(),
    portfolioId: z.string(),
    portfolioName: z.string(),
    calculationDate: z.string().nullable(),
    reportingDate: z.string().nullable(),
    currency: z.string(),
    totalExposure: z.number().nullable(),
    totalECL: z.number().nullable(),
    stage1Exposure: z.number().nullable(),
    stage2Exposure: z.number().nullable(),
    stage3Exposure: z.number().nullable(),
    stage1ECL: z.number().nullable(),
    stage2ECL: z.number().nullable(),
    stage3ECL: z.number().nullable(),
    modelVersion: z.number(),
    status: z.string(),
    progress: z.number(),
    createdBy: z.string().nullable(),
    createdAt: z.string().nullable(),
    coverageRatio: z.number(),
    assumptions: z.string()
}).openapi('CalculationAggregate')

const ConfigurationSchema = z.object({
    id: z.string(),
    configName: z.string().nullable(),
    configType: z.string(),
    isActive: z.boolean().nullable(),
    parameters: z.object({
        module: z.string().nullable(),
        effectiveDate: z.string().nullable()
    }),
    modelVersion: z.string(),
    lastUpdated: z.string().nullable(),
    updatedBy: z.string().nullable()
}).openapi('ImpairmentConfiguration')

const ImpResultDSchema = z.object({
    // Define essential fields from frs9ImpCaResultD
    pkid: z.number(),
    runId: z.string().nullable(),
    prcDate: z.string().nullable(),
    accountId: z.number().nullable(),
    // ...
}).openapi('ImpairmentResultDetail')

const StagingAnalysisSchema = z.object({
    prcDate: z.string().nullable(),
    stage: z.string().nullable(),
    segmentId: z.number().nullable(),
    totalOutstanding: z.number().nullable(),
    totalECL: z.number().nullable(),
    avgOutstanding: z.number().nullable()
}).openapi('StagingAnalysis')

const ProvisionSummarySchema = z.object({
    prcDate: z.string().nullable(),
    totalAccounts: z.number(),
    totalOutstanding: z.number().nullable(),
    totalECLOnBalance: z.number().nullable(),
    totalECLOffBalance: z.number().nullable(),
    totalECL: z.number().nullable(),
    stage1Provision: z.number().nullable(),
    stage2Provision: z.number().nullable(),
    stage3Provision: z.number().nullable(),
    coverageRatio: z.number()
}).openapi('ProvisionSummary')

const PaginationSchema = z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number()
}).openapi('Pagination')

const ListResponse = (schema: z.ZodTypeAny) => z.object({
    success: z.boolean(),
    data: z.array(schema),
    pagination: PaginationSchema.optional()
}).openapi('ListResponse')

const ErrorResponse = z.object({
    success: z.boolean(),
    message: z.string(),
    error: z.string().optional(),
    code: z.string().optional(),
    requestId: z.string().nullable().optional(),
    timestamp: z.string().optional(),
    details: z.unknown().optional(),
}).openapi('ErrorResponse')

// ============================================================================
// ROUTES
// ============================================================================

// GET /api/v1/banking/ifrs9/impairment-module/results
impairmentRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/results',
        tags: ['Impairment Module'],
        summary: 'Get Impairment Results',
        request: {
            query: z.object({
                page: z.string().optional(),
                limit: z.string().optional()
            } as any)
        },
        responses: {
            200: { content: { 'application/json': { schema: ListResponse(ImpResultHSchema) } }, description: 'Results' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c: any): Promise<any> => {
        try {
            const page = Number(c.req.query('page') || '1')
            const limit = Number(c.req.query('limit') || '10')
            const offset = (page - 1) * limit

            const data = await db
                .select()
                .from(frs9ImpCaResultH)
                .orderBy(desc(frs9ImpCaResultH.prcDate))
                .limit(limit)
                .offset(offset)

            const total = 1000 // Placeholder

            return c.json({
                success: true,
                data: data,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            } as any)
        } catch (error) {
            console.error('Error fetching impairment results:', error)
            return c.json(buildErrorResponse(c, {
                error: 'Failed to fetch results',
                message: 'Failed to fetch results',
                code: 'IMPAIRMENT_ERROR',
                details: String(error),
            }), 500)
        }
    }
)

// GET /api/v1/banking/ifrs9/impairment-module/calculations
impairmentRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/calculations',
        tags: ['Impairment Module'],
        summary: 'Get Calculation Aggregates',
        responses: {
            200: { content: { 'application/json': { schema: ListResponse(CalculationAggregateSchema) } }, description: 'Calculations' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c: any): Promise<any> => {
        try {
            const results = await db
                .select({
                    id: sql<string>`CONCAT(${frs9ImpCaEclSum.prcDate}, '-', ${frs9ImpCaEclSum.eclModelId})`.as('id'),
                    calculationName: frs9ImpCaEclConfigh.eclModelName,
                    calculationType: sql<string>`'ECL'`,
                    portfolioId: sql<string>`'ALL'`,
                    portfolioName: sql<string>`'All Segments'`,
                    calculationDate: frs9ImpCaEclSum.prcDate,
                    reportingDate: frs9ImpCaEclSum.prcDate,
                    currency: sql<string>`'IDR'`,
                    totalExposure: sql<number>`SUM(COALESCE(${frs9ImpCaEclSum.outstanding}, 0))`,
                    totalECL: sql<number>`SUM(COALESCE(${frs9ImpCaEclSum.eclAmtCaOnbs}, 0) + COALESCE(${frs9ImpCaEclSum.eclAmtCaOffbs}, 0))`,
                    stage1Exposure: sql<number>`SUM(CASE WHEN ${frs9ImpCaEclSum.stage} = '1' THEN COALESCE(${frs9ImpCaEclSum.outstanding}, 0) ELSE 0 END)`,
                    stage2Exposure: sql<number>`SUM(CASE WHEN ${frs9ImpCaEclSum.stage} = '2' THEN COALESCE(${frs9ImpCaEclSum.outstanding}, 0) ELSE 0 END)`,
                    stage3Exposure: sql<number>`SUM(CASE WHEN ${frs9ImpCaEclSum.stage} = '3' THEN COALESCE(${frs9ImpCaEclSum.outstanding}, 0) ELSE 0 END)`,
                    stage1ECL: sql<number>`SUM(CASE WHEN ${frs9ImpCaEclSum.stage} = '1' THEN (COALESCE(${frs9ImpCaEclSum.eclAmtCaOnbs}, 0) + COALESCE(${frs9ImpCaEclSum.eclAmtCaOffbs}, 0)) ELSE 0 END)`,
                    stage2ECL: sql<number>`SUM(CASE WHEN ${frs9ImpCaEclSum.stage} = '2' THEN (COALESCE(${frs9ImpCaEclSum.eclAmtCaOnbs}, 0) + COALESCE(${frs9ImpCaEclSum.eclAmtCaOffbs}, 0)) ELSE 0 END)`,
                    stage3ECL: sql<number>`SUM(CASE WHEN ${frs9ImpCaEclSum.stage} = '3' THEN (COALESCE(${frs9ImpCaEclSum.eclAmtCaOnbs}, 0) + COALESCE(${frs9ImpCaEclSum.eclAmtCaOffbs}, 0)) ELSE 0 END)`,
                    modelVersion: frs9ImpCaEclConfigh.pkid,
                    status: sql<string>`'COMPLETED'`,
                    progress: sql<number>`100`,
                    createdBy: frs9ImpCaEclConfigh.createdby,
                    createdAt: frs9ImpCaEclConfigh.createddate,
                } as any)
                .from(frs9ImpCaEclSum)
                .leftJoin(frs9ImpCaEclConfigh, eq(frs9ImpCaEclSum.eclModelId, frs9ImpCaEclConfigh.pkid))
                .groupBy(
                    frs9ImpCaEclSum.prcDate,
                    frs9ImpCaEclSum.eclModelId,
                    frs9ImpCaEclConfigh.eclModelName,
                    frs9ImpCaEclConfigh.pkid,
                    frs9ImpCaEclConfigh.createdby,
                    frs9ImpCaEclConfigh.createddate
                )
                .orderBy(desc(frs9ImpCaEclSum.prcDate))
                .limit(50);

            const formattedResults = (results as any[]).map(r => ({
                ...r,
                coverageRatio: r.totalExposure && r.totalExposure > 0 ? (r.totalECL / r.totalExposure) * 100 : 0,
                assumptions: `Based on model ${r.calculationName} (ID: ${r.modelVersion})`
            } as any));

            return c.json({
                success: true,
                data: formattedResults,
                pagination: { total: results.length, page: 1, limit: 50, totalPages: 1 }
            } as any)
        } catch (error) {
            console.error('Error fetching impairment calculations:', error)
            return c.json(buildErrorResponse(c, {
                error: 'Failed to fetch calculations',
                message: 'Failed to fetch calculations',
                code: 'IMPAIRMENT_ERROR',
                details: String(error),
            }), 500)
        }
    }
)

// GET /api/v1/banking/ifrs9/impairment-module/configurations
impairmentRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/configurations',
        tags: ['Impairment Module'],
        summary: 'Get Configurations',
        responses: {
            200: { content: { 'application/json': { schema: z.object({ success: z.boolean(), data: z.array(ConfigurationSchema) }) } }, description: 'Configurations' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c: any): Promise<any> => {
        try {
            const configs = await db
                .select()
                .from(frs9ImpCaEclConfigh)
                .orderBy(desc(frs9ImpCaEclConfigh.createddate))
                .limit(20);

            const formattedConfigs = configs.map(cfg => ({
                id: String(cfg.pkid),
                configName: cfg.eclModelName,
                configType: 'ECL_MODEL',
                isActive: cfg.activeFlag,
                parameters: { module: cfg.module, effectiveDate: cfg.effectiveDate },
                modelVersion: '1.0',
                lastUpdated: cfg.updateddate || cfg.createddate,
                updatedBy: cfg.updatedby || cfg.createdby
            } as any));

            return c.json({ success: true, data: formattedConfigs } as any)
        } catch (error) {
            console.error('Error fetching configurations:', error)
            return c.json(buildErrorResponse(c, {
                error: 'Failed to fetch configurations',
                message: 'Failed to fetch configurations',
                code: 'IMPAIRMENT_ERROR',
                details: String(error),
            }), 500)
        }
    }
)

// POST /api/v1/banking/ifrs9/impairment-module/run-calculation
impairmentRoutes.openapi(
    createRoute({
        method: 'post',
        path: '/run-calculation',
        tags: ['Impairment Module'],
        summary: 'Trigger Calculation',
        request: {
            body: { content: { 'application/json': { schema: RunCalculationSchema } } }
        },
        responses: {
            200: { content: { 'application/json': { schema: z.object({ success: z.boolean(), message: z.string(), jobId: z.string() }) } }, description: 'Job Started' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c: any): Promise<any> => {
        try {
            const payload = c.req.valid('json');
            console.log('Starting calculation for:', payload.calculationName);
            return c.json({ success: true, message: 'Calculation job submitted successfully', jobId: 'JOB-' + Date.now() })
        } catch (error) {
            return c.json(buildErrorResponse(c, {
                error: 'Failed to submit calculation',
                message: 'Failed to submit calculation',
                code: 'IMPAIRMENT_ERROR',
                details: String(error),
            }), 500)
        }
    }
)

// GET /api/v1/banking/ifrs9/impairment-module/ecl-details
impairmentRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/ecl-details',
        tags: ['Impairment Module'],
        summary: 'Get Detailed ECL Results',
        request: {
            query: z.object({
                page: z.string().optional(),
                limit: z.string().optional(),
                accountId: z.string().optional()
            } as any)
        },
        responses: {
            200: { content: { 'application/json': { schema: ListResponse(ImpResultDSchema) } }, description: 'ECL Details' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c: any): Promise<any> => {
        try {
            const page = Number(c.req.query('page') || '1')
            const limit = Number(c.req.query('limit') || '20')
            const offset = (page - 1) * limit
            const accountId = c.req.query('accountId')

            let query = db.select().from(frs9ImpCaResultD)

            if (accountId) {
                query = query.where(eq(frs9ImpCaResultD.accountId, Number(accountId))) as any
            }

            const data = await query
                .orderBy(desc(frs9ImpCaResultD.prcDate))
                .limit(limit)
                .offset(offset)

            return c.json({
                success: true,
                data: data,
                pagination: { page, limit, total: data.length, totalPages: Math.ceil(data.length / limit) }
            } as any)
        } catch (error) {
            console.error('Error fetching ECL details:', error)
            return c.json(buildErrorResponse(c, {
                error: 'Failed to fetch ECL details',
                message: 'Failed to fetch ECL details',
                code: 'IMPAIRMENT_ERROR',
                details: String(error),
            }), 500)
        }
    }
)

// GET /api/v1/banking/ifrs9/impairment-module/provision-summary
impairmentRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/provision-summary',
        tags: ['Impairment Module'],
        summary: 'Get Provision Summary',
        request: {
            query: z.object({ prcDate: z.string().optional() })
        },
        responses: {
            200: { content: { 'application/json': { schema: z.object({ success: z.boolean(), data: z.array(ProvisionSummarySchema) }) } }, description: 'Provision Summary' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c: any): Promise<any> => {
        try {
            const prcDate = c.req.query('prcDate')

            const results = await db
                .select({
                    prcDate: frs9ImpCaEclSum.prcDate,
                    totalAccounts: sql<number>`COUNT(*)`,
                    totalOutstanding: sql<number>`SUM(COALESCE(${frs9ImpCaEclSum.outstanding}, 0))`,
                    totalECLOnBalance: sql<number>`SUM(COALESCE(${frs9ImpCaEclSum.eclAmtCaOnbs}, 0))`,
                    totalECLOffBalance: sql<number>`SUM(COALESCE(${frs9ImpCaEclSum.eclAmtCaOffbs}, 0))`,
                    totalECL: sql<number>`SUM(COALESCE(${frs9ImpCaEclSum.eclAmtCaOnbs}, 0) + COALESCE(${frs9ImpCaEclSum.eclAmtCaOffbs}, 0))`,
                    stage1Provision: sql<number>`SUM(CASE WHEN ${frs9ImpCaEclSum.stage} = '1' THEN COALESCE(${frs9ImpCaEclSum.eclAmtCaOnbs}, 0) + COALESCE(${frs9ImpCaEclSum.eclAmtCaOffbs}, 0) ELSE 0 END)`,
                    stage2Provision: sql<number>`SUM(CASE WHEN ${frs9ImpCaEclSum.stage} = '2' THEN COALESCE(${frs9ImpCaEclSum.eclAmtCaOnbs}, 0) + COALESCE(${frs9ImpCaEclSum.eclAmtCaOffbs}, 0) ELSE 0 END)`,
                    stage3Provision: sql<number>`SUM(CASE WHEN ${frs9ImpCaEclSum.stage} = '3' THEN COALESCE(${frs9ImpCaEclSum.eclAmtCaOnbs}, 0) + COALESCE(${frs9ImpCaEclSum.eclAmtCaOffbs}, 0) ELSE 0 END)`,
                    coverageRatio: sql<number>`CASE WHEN SUM(COALESCE(${frs9ImpCaEclSum.outstanding}, 0)) > 0 THEN (SUM(COALESCE(${frs9ImpCaEclSum.eclAmtCaOnbs}, 0) + COALESCE(${frs9ImpCaEclSum.eclAmtCaOffbs}, 0)) / SUM(COALESCE(${frs9ImpCaEclSum.outstanding}, 0))) * 100 ELSE 0 END`
                } as any)
                .from(frs9ImpCaEclSum)
                .groupBy(frs9ImpCaEclSum.prcDate)
                .orderBy(desc(frs9ImpCaEclSum.prcDate))
                .limit(prcDate ? 1 : 12)

            return c.json({ success: true, data: results })
        } catch (error) {
            console.error('Error fetching provision summary:', error)
            return c.json(buildErrorResponse(c, {
                error: 'Failed to fetch provision summary',
                message: 'Failed to fetch provision summary',
                code: 'IMPAIRMENT_ERROR',
                details: String(error),
            }), 500)
        }
    }
)
