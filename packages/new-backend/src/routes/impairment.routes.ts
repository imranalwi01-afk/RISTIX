import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { legacyDb as db } from '../config'
import { eq, desc, sql, and, asc, or, ilike } from 'drizzle-orm'
import {
    frs9AccountId,
    frs9ImpCaEclSum,
    frs9ImpCaEclConfigh,
    frs9ImpCaResultH,
    frs9ImpCaResultD,
    frs9MasterAccount,
    frs9ImpIaResultH,
    frs9ImpIaResultD,
    frs9ImpJournalData,
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

const ImpairmentModuleListRowSchema = z.object({
    pkid: z.string(),
    accountId: z.number(),
}).passthrough().openapi('ImpairmentModuleListRow')

const ImpairmentModuleDetailSchema = z.object({
    contractDetail: z.record(z.string(), z.unknown()).nullable(),
    collectiveDetails: z.array(z.record(z.string(), z.unknown())),
    individualSummary: z.record(z.string(), z.unknown()).nullable(),
    individualDetails: z.array(z.record(z.string(), z.unknown())),
    journalDetails: z.array(z.record(z.string(), z.unknown())),
}).openapi('ImpairmentModuleDetail')

function normalizePrcDateInput(value?: string | null) {
    if (!value) return null
    const trimmed = value.trim()
    if (/^\d{8}$/.test(trimmed)) {
        return `${trimmed.slice(0, 4)}-${trimmed.slice(4, 6)}-${trimmed.slice(6, 8)}`
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
        return trimmed
    }

    return null
}

async function resolveEffectivePrcDate(requestedPrcDate?: string | null) {
    const normalized = normalizePrcDateInput(requestedPrcDate)
    if (requestedPrcDate && !normalized) {
        throw new Error('Invalid PRC date format. Use YYYY-MM-DD or YYYYMMDD.')
    }

    if (normalized) {
        return normalized
    }

    const latest = await db
        .select({ prcDate: frs9MasterAccount.prcDate })
        .from(frs9MasterAccount)
        .orderBy(desc(frs9MasterAccount.prcDate))
        .limit(1)

    return latest[0]?.prcDate ?? null
}

function buildImpairmentMasterSelection() {
    return {
        pkid: sql<string>`${frs9MasterAccount.pkid}::text`.as('pkid'),
        prcDate: frs9MasterAccount.prcDate,
        accountId: frs9MasterAccount.accountId,
        accountNumber: frs9MasterAccount.accountNumber,
        facilityNumber: frs9MasterAccount.facilityNumber,
        cifNumber: frs9MasterAccount.cifNumber,
        cifName: frs9MasterAccount.cifName,
        accountStatus: frs9MasterAccount.accountStatus,
        dataSource: frs9MasterAccount.dataSource,
        prdGroup: frs9MasterAccount.prdGroup,
        prdType: frs9MasterAccount.prdType,
        prdCode: frs9MasterAccount.prdCode,
        branchCode: frs9MasterAccount.branchCode,
        tenorOrg: frs9MasterAccount.tenorOrg,
        startDate: frs9MasterAccount.startDate,
        maturityDate: frs9MasterAccount.maturityDate,
        paidOffDate: frs9MasterAccount.paidOffDate,
        writeOffDate: frs9MasterAccount.writeOffDate,
        firstPaymentDate: frs9MasterAccount.firstPaymentDate,
        nextPaymentDate: frs9MasterAccount.nextPaymentDate,
        lastPaymentDate: frs9MasterAccount.lastPaymentDate,
        graceType: frs9MasterAccount.graceType,
        graceStartDate: frs9MasterAccount.graceStartDate,
        graceEndDate: frs9MasterAccount.graceEndDate,
        interestRate: sql<number>`COALESCE(${frs9MasterAccount.interestRate}, 0)`.as('interestRate'),
        effInterestRate: sql<number>`COALESCE(${frs9MasterAccount.effInterestRate}, 0)`.as('effInterestRate'),
        collectability: frs9MasterAccount.collectability,
        dpd: frs9MasterAccount.dpd,
        extRatingCodeInitial: frs9MasterAccount.extRatingCodeInitial,
        extRatingAgencyInitial: frs9MasterAccount.extRatingAgencyInitial,
        extRatingCode: frs9MasterAccount.extRatingCode,
        extRatingAgency: frs9MasterAccount.extRatingAgency,
        paymentCode: frs9MasterAccount.paymentCode,
        paymentTerm: frs9MasterAccount.paymentTerm,
        paymentFreq: frs9MasterAccount.paymentFreq,
        intPmtTerm: frs9MasterAccount.intPmtTerm,
        intPmtFreq: frs9MasterAccount.intPmtFreq,
        nplFlag: frs9MasterAccount.nplFlag,
        nplDate: frs9MasterAccount.nplDate,
        restructureFlag: frs9MasterAccount.restructureFlag,
        restructureDate: frs9MasterAccount.restructureDate,
        restructureReviewDate: frs9MasterAccount.restructureReviewDate,
        interestBase: frs9MasterAccount.interestBase,
        assetClass: frs9MasterAccount.assetClass,
        currency: frs9MasterAccount.currency,
        exchangeRate: sql<number>`COALESCE(${frs9MasterAccount.exchangeRate}, 0)`.as('exchangeRate'),
        plafond: sql<number>`COALESCE(${frs9MasterAccount.plafond}, 0)`.as('plafond'),
        unusedAmt: sql<number>`COALESCE(${frs9MasterAccount.unusedAmt}, 0)`.as('unusedAmt'),
        outstanding: sql<number>`COALESCE(${frs9MasterAccount.outstanding}, 0)`.as('outstanding'),
        outstandingWo: sql<number>`COALESCE(${frs9MasterAccount.outstandingWo}, 0)`.as('outstandingWo'),
        accruedInterest: sql<number>`COALESCE(${frs9MasterAccount.accruedInterest}, 0)`.as('accruedInterest'),
        installmentAmt: sql<number>`COALESCE(${frs9MasterAccount.installmentAmt}, 0)`.as('installmentAmt'),
        fixPrincipalAmt: sql<number>`COALESCE(${frs9MasterAccount.fixPrincipalAmt}, 0)`.as('fixPrincipalAmt'),
        fixInterestAmt: sql<number>`COALESCE(${frs9MasterAccount.fixInterestAmt}, 0)`.as('fixInterestAmt'),
        impairedFlag: frs9MasterAccount.impairedFlag,
        impairedStatus: frs9MasterAccount.impairedStatus,
        groupSegment: frs9MasterAccount.groupSegment,
        segment: frs9MasterAccount.segment,
        subSegment: frs9MasterAccount.subSegment,
        bucketId: frs9MasterAccount.bucketId,
        sicrFlag: frs9MasterAccount.sicrFlag,
        stage: frs9MasterAccount.stage,
        eclCaOnbsAmt: sql<number>`COALESCE(${frs9MasterAccount.eclCaOnbsAmt}, 0)`.as('eclCaOnbsAmt'),
        eclCaOffbsAmt: sql<number>`COALESCE(${frs9MasterAccount.eclCaOffbsAmt}, 0)`.as('eclCaOffbsAmt'),
        eclIaOnbsAmt: sql<number>`COALESCE(${frs9MasterAccount.eclIaOnbsAmt}, 0)`.as('eclIaOnbsAmt'),
        eclOverlayAmt: sql<number>`COALESCE(${frs9MasterAccount.eclOverlayAmt}, 0)`.as('eclOverlayAmt'),
        eclFinalAmt: sql<number>`COALESCE(${frs9MasterAccount.eclFinalAmt}, 0)`.as('eclFinalAmt'),
        eclCoverage: sql<number>`
            CASE
                WHEN COALESCE(${frs9MasterAccount.outstanding}, 0) = 0 THEN 0
                ELSE COALESCE(${frs9MasterAccount.eclFinalAmt}, 0) / NULLIF(COALESCE(${frs9MasterAccount.outstanding}, 0), 0)
            END
        `.as('eclCoverage'),
        unwindingCaAmt: sql<number>`COALESCE(${frs9MasterAccount.unwindingCaAmt}, 0)`.as('unwindingCaAmt'),
        unwindingIaAmt: sql<number>`COALESCE(${frs9MasterAccount.unwindingIaAmt}, 0)`.as('unwindingIaAmt'),
        unwindingIaSumAmt: sql<number>`COALESCE(${frs9MasterAccount.unwindingIaSumAmt}, 0)`.as('unwindingIaSumAmt'),
    }
}

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
                limit: z.string().optional(),
                prcDate: z.string().optional(),
                search: z.string().optional(),
            } as any)
        },
        responses: {
            200: {
                content: {
                    'application/json': {
                        schema: z.object({
                            success: z.boolean(),
                            data: z.array(ImpairmentModuleListRowSchema),
                            effectivePrcDate: z.string().nullable(),
                            pagination: PaginationSchema,
                        }),
                    },
                },
                description: 'Results'
            },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c: any): Promise<any> => {
        try {
            const page = Number(c.req.query('page') || '0')
            const limit = Number(c.req.query('limit') || '10')
            const cursor = c.req.query('cursor') || ''
            const search = c.req.query('search')?.trim()
            const effectivePrcDate = await resolveEffectivePrcDate(c.req.query('prcDate'))

            if (!effectivePrcDate) {
                return c.json({
                    success: true,
                    data: [],
                    effectivePrcDate: null,
                    pagination: { page: 0, limit, total: 0, totalPages: 0, cursor: null, hasMore: false },
                } as any)
            }

            const conditions = [eq(frs9MasterAccount.prcDate, effectivePrcDate)]

            if (search) {
                conditions.push(or(
                    ilike(frs9MasterAccount.accountNumber, `%${search}%`),
                    ilike(frs9MasterAccount.facilityNumber, `%${search}%`),
                    ilike(frs9MasterAccount.cifNumber, `%${search}%`),
                    ilike(frs9MasterAccount.cifName, `%${search}%`),
                ) as any)
            }

            // Cursor-based pagination: decode cursor to get last row's sort keys
            if (cursor) {
                try {
                    const decoded = Buffer.from(cursor, 'base64').toString('utf-8')
                    const [lastAcct, lastFac] = decoded.split('|')
                    if (lastAcct) {
                        conditions.push(sql`(${frs9MasterAccount.accountNumber}, ${frs9MasterAccount.facilityNumber}) > (${lastAcct}::varchar, ${lastFac || ''}::varchar)`)
                    }
                } catch {
                    // Invalid cursor — ignore and return data from start
                }
            }

            // Fetch limit + 1 to determine hasMore
            const data = await db
                .select(buildImpairmentMasterSelection() as any)
                .from(frs9MasterAccount)
                .where(and(...conditions))
                .orderBy(asc(frs9MasterAccount.accountNumber), asc(frs9MasterAccount.facilityNumber))
                .limit(limit + 1)

            const hasMore = data.length > limit
            if (hasMore) data.pop()

            const lastRow = data[data.length - 1]
            const nextCursor = lastRow
                ? Buffer.from(`${lastRow.accountNumber || ''}|${lastRow.facilityNumber || ''}`).toString('base64')
                : null

            return c.json({
                success: true,
                data: data,
                effectivePrcDate,
                pagination: {
                    page: cursor ? 0 : (page || 1),
                    limit,
                    total: 0,
                    totalPages: 0,
                    cursor: cursor || null,
                    nextCursor,
                    hasMore,
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

// GET /api/v1/banking/ifrs9/impairment-module/results/{pkid}/details
impairmentRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/results/{pkid}/details',
        tags: ['Impairment Module'],
        summary: 'Get Impairment Result Details',
        request: {
            params: z.object({ pkid: z.string() }),
        },
        responses: {
            200: { content: { 'application/json': { schema: z.object({ success: z.boolean(), data: ImpairmentModuleDetailSchema }) } }, description: 'Impairment detail' },
            404: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Not found' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' },
        },
    }),
    async (c: any): Promise<any> => {
        try {
            const { pkid } = c.req.valid('param')

            const contractRows = await db
                .select(buildImpairmentMasterSelection() as any)
                .from(frs9MasterAccount)
                .where(eq(frs9MasterAccount.pkid, BigInt(pkid)))
                .limit(1)

            const contractDetail = contractRows[0]

            if (!contractDetail) {
                return c.json(buildErrorResponse(c, {
                    error: 'Impairment result not found',
                    message: 'Impairment result not found',
                    code: 'NOT_FOUND',
                }) as any, 404)
            }

            const collectiveDetails = await db
                .select({
                    prcDate: frs9ImpCaResultD.prcDate,
                    accountId: frs9ImpCaResultD.accountId,
                    accountNumber: frs9AccountId.accountNumber,
                    eclConfigId: frs9ImpCaResultD.eclConfigId,
                    eclModelId: frs9ImpCaResultD.eclModelId,
                    defaultRuleId: frs9ImpCaResultD.defaultRuleId,
                    periodDate: frs9ImpCaResultD.periodDate,
                    pdConfigId: frs9ImpCaResultD.pdConfigId,
                    bucketId: frs9ImpCaResultD.bucketId,
                    lgd: frs9ImpCaResultD.lgd,
                    cifNumber: frs9ImpCaResultD.cifNumber,
                    fibAmt: frs9ImpCaResultD.fibAmt,
                    accruedInterest: frs9ImpCaResultD.accruedInterest,
                    stage: frs9ImpCaResultD.stage,
                    eqvOutstanding: frs9ImpCaResultD.eqvOutstanding,
                    eir: frs9ImpCaResultD.eir,
                    eadConfigId: frs9ImpCaResultD.eadConfigId,
                    eadMethod: frs9ImpCaResultD.eadMethod,
                    eadCalcMethod: frs9ImpCaResultD.eadCalcMethod,
                    flSeq: frs9ImpCaResultD.flSeq,
                    paymentEom: frs9ImpCaResultD.paymentEom,
                    paymAvg: frs9ImpCaResultD.paymAvg,
                    principal: frs9ImpCaResultD.principal,
                    sumPrincipal: frs9ImpCaResultD.sumPrincipal,
                    interest: frs9ImpCaResultD.interest,
                    nextInterest: frs9ImpCaResultD.nextInterest,
                    sumNextInterest: frs9ImpCaResultD.sumNextInterest,
                    ead: frs9ImpCaResultD.ead,
                    probability: frs9ImpCaResultD.probability,
                    pdNonFl: frs9ImpCaResultD.pdNonFl,
                    pd: frs9ImpCaResultD.pd,
                    eclBfl: frs9ImpCaResultD.eclBfl,
                    eclAfl: frs9ImpCaResultD.eclAfl,
                    eclWeightedBfl: frs9ImpCaResultD.eclWeightedBfl,
                    eclWeightedAfl: frs9ImpCaResultD.eclWeightedAfl,
                } as any)
                .from(frs9ImpCaResultD)
                .innerJoin(frs9AccountId, eq(frs9ImpCaResultD.accountId, frs9AccountId.accountId))
                .where(and(
                    eq(frs9ImpCaResultD.accountId, contractDetail.accountId),
                    eq(frs9ImpCaResultD.prcDate, contractDetail.prcDate),
                ))
                .orderBy(asc(frs9ImpCaResultD.flSeq))
            const [individualSummaryRows, individualDetails, journalDetails] = await Promise.all([
                db
                    .select({
                        reportingDate: frs9ImpIaResultH.prcDate,
                        accountNumber: frs9ImpIaResultH.accountNumber,
                        cifNumber: frs9ImpIaResultH.cifNumber,
                        cifName: frs9ImpIaResultH.cifName,
                        currency: frs9ImpIaResultH.currency,
                        dpd: frs9ImpIaResultH.dpd,
                        collectability: frs9ImpIaResultH.collectability,
                        ratingCode: frs9ImpIaResultH.ratingCode,
                        interestRate: sql<number>`COALESCE(${frs9ImpIaResultH.interestRate}, 0)`.as('interestRate'),
                        effInterestRate: sql<number>`COALESCE(${frs9ImpIaResultH.effInterestRate}, 0)`.as('effInterestRate'),
                        outstanding: sql<number>`COALESCE(${frs9ImpIaResultH.outstanding}, 0)`.as('outstanding'),
                        accruedInterest: sql<number>`COALESCE(${frs9ImpIaResultH.accruedInterest}, 0)`.as('accruedInterest'),
                        carryingAmt: sql<number>`COALESCE(${frs9ImpIaResultH.carryingAmt}, 0)`.as('carryingAmt'),
                        eadAmt: sql<number>`COALESCE(${frs9ImpIaResultH.eadAmt}, 0)`.as('eadAmt'),
                        pvDcfAmt: sql<number>`COALESCE(${frs9ImpIaResultH.pvDcfAmt}, 0)`.as('pvDcfAmt'),
                        eclIaAmt: sql<number>`COALESCE(${frs9ImpIaResultH.eclIaAmt}, 0)`.as('eclIaAmt'),
                    } as any)
                    .from(frs9ImpIaResultH)
                    .where(and(
                        eq(frs9ImpIaResultH.accountId, contractDetail.accountId),
                        eq(frs9ImpIaResultH.prcDate, contractDetail.prcDate),
                    ))
                    .limit(1),
                db
                    .select({
                        mob: frs9ImpIaResultD.mob,
                        periode: frs9ImpIaResultD.periode,
                        principal: sql<number>`COALESCE(${frs9ImpIaResultD.principal}, 0)`.as('principal'),
                        interest: sql<number>`COALESCE(${frs9ImpIaResultD.interest}, 0)`.as('interest'),
                        installment: sql<number>`COALESCE(${frs9ImpIaResultD.installment}, 0)`.as('installment'),
                        collateral: sql<number>`COALESCE(${frs9ImpIaResultD.collateral}, 0)`.as('collateral'),
                        poRate1: sql<number>`COALESCE(${frs9ImpIaResultD.poRate1}, 0)`.as('poRate1'),
                        rrRate1: sql<number>`COALESCE(${frs9ImpIaResultD.rrRate1}, 0)`.as('rrRate1'),
                        default1: sql<number>`COALESCE(${frs9ImpIaResultD.default1}, 0)`.as('default1'),
                        poRate2: sql<number>`COALESCE(${frs9ImpIaResultD.poRate2}, 0)`.as('poRate2'),
                        rrRate2: sql<number>`COALESCE(${frs9ImpIaResultD.rrRate2}, 0)`.as('rrRate2'),
                        default2: sql<number>`COALESCE(${frs9ImpIaResultD.default2}, 0)`.as('default2'),
                        poRate3: sql<number>`COALESCE(${frs9ImpIaResultD.poRate3}, 0)`.as('poRate3'),
                        rrRate3: sql<number>`COALESCE(${frs9ImpIaResultD.rrRate3}, 0)`.as('rrRate3'),
                        default3: sql<number>`COALESCE(${frs9ImpIaResultD.default3}, 0)`.as('default3'),
                        pwAmt: sql<number>`COALESCE(${frs9ImpIaResultD.pwAmt}, 0)`.as('pwAmt'),
                        discountFactor: sql<number>`COALESCE(${frs9ImpIaResultD.discountFactor}, 0)`.as('discountFactor'),
                        pvAmt: sql<number>`COALESCE(${frs9ImpIaResultD.pvAmt}, 0)`.as('pvAmt'),
                        beginningBalance: sql<number>`COALESCE(${frs9ImpIaResultD.beginningBalance}, 0)`.as('beginningBalance'),
                        eirAmt: sql<number>`COALESCE(${frs9ImpIaResultD.eirAmt}, 0)`.as('eirAmt'),
                        endingBalance: sql<number>`COALESCE(${frs9ImpIaResultD.endingBalance}, 0)`.as('endingBalance'),
                    } as any)
                    .from(frs9ImpIaResultD)
                    .where(and(
                        eq(frs9ImpIaResultD.accountId, contractDetail.accountId),
                        eq(frs9ImpIaResultD.prcDate, contractDetail.prcDate),
                    ))
                    .orderBy(asc(frs9ImpIaResultD.mob)),
                db
                    .select({
                        downloadDate: frs9ImpJournalData.prcDate,
                        accountId: frs9ImpJournalData.accountId,
                        accountNumber: frs9AccountId.accountNumber,
                        branchCode: frs9ImpJournalData.branch,
                        branch: frs9ImpJournalData.branch,
                        currency: frs9ImpJournalData.currency,
                        journalType: frs9ImpJournalData.journalcode,
                        journalCode: frs9ImpJournalData.journalcode,
                        journalDescription: frs9ImpJournalData.glDesc,
                        glDesc: frs9ImpJournalData.glDesc,
                        glAccount: frs9ImpJournalData.glNumber,
                        glNumber: frs9ImpJournalData.glNumber,
                        dbCr: frs9ImpJournalData.dbcr,
                        originalAmount: frs9ImpJournalData.nAmount,
                        amount: frs9ImpJournalData.nAmount,
                        eqvIdrAmount: frs9ImpJournalData.nAmountIdr,
                        amountIdr: frs9ImpJournalData.nAmountIdr,
                    } as any)
                    .from(frs9ImpJournalData)
                    .innerJoin(frs9AccountId, eq(frs9ImpJournalData.accountId, frs9AccountId.accountId))
                    .where(eq(frs9ImpJournalData.accountId, contractDetail.accountId))
                    .orderBy(
                        asc(frs9ImpJournalData.prcDate),
                        asc(frs9ImpJournalData.branch),
                        asc(frs9ImpJournalData.currency),
                        asc(frs9ImpJournalData.journalcode),
                        asc(frs9ImpJournalData.glNumber),
                        asc(frs9ImpJournalData.dbcr),
                    ),
            ])

            return c.json({
                success: true,
                data: {
                    contractDetail,
                    collectiveDetails,
                    individualSummary: individualSummaryRows[0] ?? null,
                    individualDetails,
                    journalDetails,
                },
            } as any)
        } catch (error) {
            console.error('Error fetching impairment detail:', error)
            return c.json(buildErrorResponse(c, {
                error: 'Failed to fetch impairment detail',
                message: 'Failed to fetch impairment detail',
                code: 'IMPAIRMENT_ERROR',
                details: String(error),
            }), 500)
        }
    },
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

            let eclQuery = db
                .select({
                    prcDate: frs9ImpCaResultD.prcDate,
                    accountId: frs9ImpCaResultD.accountId,
                    accountNumber: frs9AccountId.accountNumber,
                    eclConfigId: frs9ImpCaResultD.eclConfigId,
                    eclModelId: frs9ImpCaResultD.eclModelId,
                    defaultRuleId: frs9ImpCaResultD.defaultRuleId,
                    periodDate: frs9ImpCaResultD.periodDate,
                    pdConfigId: frs9ImpCaResultD.pdConfigId,
                    bucketId: frs9ImpCaResultD.bucketId,
                    lgd: frs9ImpCaResultD.lgd,
                    cifNumber: frs9ImpCaResultD.cifNumber,
                    fibAmt: frs9ImpCaResultD.fibAmt,
                    accruedInterest: frs9ImpCaResultD.accruedInterest,
                    stage: frs9ImpCaResultD.stage,
                    eqvOutstanding: frs9ImpCaResultD.eqvOutstanding,
                    eir: frs9ImpCaResultD.eir,
                    eadConfigId: frs9ImpCaResultD.eadConfigId,
                    eadMethod: frs9ImpCaResultD.eadMethod,
                    eadCalcMethod: frs9ImpCaResultD.eadCalcMethod,
                    flSeq: frs9ImpCaResultD.flSeq,
                    paymentEom: frs9ImpCaResultD.paymentEom,
                    paymAvg: frs9ImpCaResultD.paymAvg,
                    principal: frs9ImpCaResultD.principal,
                    sumPrincipal: frs9ImpCaResultD.sumPrincipal,
                    interest: frs9ImpCaResultD.interest,
                    nextInterest: frs9ImpCaResultD.nextInterest,
                    sumNextInterest: frs9ImpCaResultD.sumNextInterest,
                    ead: frs9ImpCaResultD.ead,
                    probability: frs9ImpCaResultD.probability,
                    pdNonFl: frs9ImpCaResultD.pdNonFl,
                    pd: frs9ImpCaResultD.pd,
                    eclBfl: frs9ImpCaResultD.eclBfl,
                    eclAfl: frs9ImpCaResultD.eclAfl,
                    eclWeightedBfl: frs9ImpCaResultD.eclWeightedBfl,
                    eclWeightedAfl: frs9ImpCaResultD.eclWeightedAfl,
                } as any)
                .from(frs9ImpCaResultD)
                .leftJoin(frs9AccountId, eq(frs9ImpCaResultD.accountId, frs9AccountId.accountId))
                .orderBy(desc(frs9ImpCaResultD.prcDate))
                .limit(limit)
                .offset(offset)

            if (accountId) {
                eclQuery = eclQuery.where(eq(frs9ImpCaResultD.accountId, Number(accountId))) as any
            }

            const data = await eclQuery

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
