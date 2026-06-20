import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { legacyDb as db } from '../config'
import {
    frs9EirEcf,
    frs9AccountId,
    frs9MasterTransactionCost,
    frs9EventChanges,
    frs9AmortJournalData,
    frs9MasterAccount,
} from '../db/schema'
import { frs9PrcDate } from '../db/schema/legacy'
import { and, asc, desc, eq, getTableColumns, ilike, or, sql } from 'drizzle-orm'
import { buildErrorResponse } from '../lib/http/error-response'
import { openApiValidationHook } from '../lib/http/openapi-validation-hook'

export const amortizationRoutes = new OpenAPIHono({ defaultHook: openApiValidationHook })

// =============================================================================
// SCHEMA DEFINITIONS
// =============================================================================

const PaginationSchema = z.object({
    page: z.number().openapi({ example: 1 }),
    limit: z.number().openapi({ example: 10 }),
    total: z.number().openapi({ example: 100 }),
    totalPages: z.number().openapi({ example: 10 }),
}).openapi('Pagination')

const Frs9EirEcfSchema = z.object({
    id: z.string().optional(), // bigserial -> string
    accountId: z.number().nullable().optional(), // bigint mode:number in schema def
    accountNumber: z.string().nullable().optional(),
    customerName: z.string().nullable().optional(),
    prcDate: z.string().nullable().optional(),
    nLoanAmt: z.string().nullable().optional(), // numeric -> string
    nIntRate: z.number().nullable().optional(), // double
    nEffIntRate: z.number().nullable().optional(),
    startamortdate: z.string().nullable().optional(),
    endamortdate: z.string().nullable().optional(),
    nOsprn: z.string().nullable().optional(),
    nInstallment: z.string().nullable().optional(),
    nEffIntAmt: z.string().nullable().optional(),
    nAmortAmt: z.string().nullable().optional(),
    nFairvalue: z.string().nullable().optional(),
    nUnamortAmt: z.string().nullable().optional(),
    // Add other fields as needed based on UI reqs, but allowing permissive partials for now
}).openapi('Frs9EirEcf')

const AmortizationModuleListRowSchema = z.object({
    pkid: z.string(),
    accountId: z.number(),
}).passthrough().openapi('AmortizationModuleListRow')

const AmortizationModuleDetailSchema = z.object({
    contractDetail: z.record(z.string(), z.unknown()).nullable(),
    feeCosts: z.array(z.record(z.string(), z.unknown())),
    amortizationSchedule: z.array(z.record(z.string(), z.unknown())),
    events: z.array(z.record(z.string(), z.unknown())),
    journalDetails: z.array(z.record(z.string(), z.unknown())),
}).openapi('AmortizationModuleDetail')

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

    if (normalized) return normalized

    const row = await db
        .select({ currdate: frs9PrcDate.currdate })
        .from(frs9PrcDate)
        .orderBy(desc(frs9PrcDate.currdate))
        .limit(1)

    return row[0]?.currdate ?? null
}

function buildAmortizationMasterSelection() {
    return {
        pkid: sql<string>`${frs9MasterAccount.pkid}::text`.as('pkid'),
        prcDate: frs9MasterAccount.prcDate,
        accountId: frs9MasterAccount.accountId,
        accountNumber: frs9MasterAccount.accountNumber,
        cifNumber: frs9MasterAccount.cifNumber,
        cifName: frs9MasterAccount.cifName,
        facilityNumber: frs9MasterAccount.facilityNumber,
        branchCode: frs9MasterAccount.branchCode,
        dataSource: frs9MasterAccount.dataSource,
        prdCode: frs9MasterAccount.prdCode,
        prdType: frs9MasterAccount.prdType,
        currency: frs9MasterAccount.currency,
        exchangeRate: sql<number>`COALESCE(${frs9MasterAccount.exchangeRate}, 0)`.as('exchangeRate'),
        collectability: frs9MasterAccount.collectability,
        dpd: frs9MasterAccount.dpd,
        interestRate: sql<number>`COALESCE(${frs9MasterAccount.interestRate}, 0)`.as('interestRate'),
        effInterestRate: sql<number>`COALESCE(${frs9MasterAccount.effInterestRate}, 0)`.as('effInterestRate'),
        startDate: frs9MasterAccount.startDate,
        maturityDate: frs9MasterAccount.maturityDate,
        restructureFlag: frs9MasterAccount.restructureFlag,
        restructureDate: frs9MasterAccount.restructureDate,
        assetClass: frs9MasterAccount.assetClass,
        amortizationType: frs9MasterAccount.amortizationType,
        outstanding: sql<number>`COALESCE(${frs9MasterAccount.outstanding}, 0)`.as('outstanding'),
        plafond: sql<number>`COALESCE(${frs9MasterAccount.plafond}, 0)`.as('plafond'),
        initialFeeAmt: sql<number>`COALESCE(${frs9MasterAccount.initialFeeAmt}, 0)`.as('initialFeeAmt'),
        initialCostAmt: sql<number>`COALESCE(${frs9MasterAccount.initialCostAmt}, 0)`.as('initialCostAmt'),
        unamortFeeAmt: sql<number>`COALESCE(${frs9MasterAccount.unamortFeeAmt}, 0)`.as('unamortFeeAmt'),
        unamortCostAmt: sql<number>`COALESCE(${frs9MasterAccount.unamortCostAmt}, 0)`.as('unamortCostAmt'),
        amortFeeAmt: sql<number>`COALESCE(${frs9MasterAccount.amortFeeAmt}, 0)`.as('amortFeeAmt'),
        amortCostAmt: sql<number>`COALESCE(${frs9MasterAccount.amortCostAmt}, 0)`.as('amortCostAmt'),
    }
}

const ContractDetailsSchema = z.object({
    accountId: z.string().optional(),
    accountNumber: z.string().nullable().optional(),
    facilityNumber: z.string().nullable().optional(),
    cifNumber: z.string().nullable().optional(),
    cifName: z.string().nullable().optional(),
    createdby: z.string().nullable().optional(),
    createddate: z.string().nullable().optional(),
}).openapi('ContractDetails')

const FeeCostSchema = z.object({
    prcDate: z.string().nullable().optional(),
    accountId: z.number().nullable().optional(),
    accountNumber: z.string().nullable().optional(),
    paramsId: z.string().nullable().optional(),
    feeCostId: z.string().nullable().optional(),
    orgCcyAmt: z.string().nullable().optional(),
    eqvLcyAmt: z.string().nullable().optional(),
    trxCode: z.string().nullable().optional(),
}).openapi('FeeCost')

const EventChangeSchema = z.object({
    prcDate: z.string().nullable().optional(),
    accountId: z.number().nullable().optional(),
    accountNumber: z.string().nullable().optional(),
    effectiveDate: z.string().nullable().optional(),
    beforeValue: z.string().nullable().optional(),
    afterValue: z.string().nullable().optional(),
    eventId: z.number().nullable().optional(),
    remarks: z.string().nullable().optional(),
}).openapi('EventChange')

const JournalDetailSchema = z.object({
    id: z.string().optional(),
    prcDate: z.string().nullable().optional(),
    accountId: z.number().nullable().optional(),
    glno: z.string().nullable().optional(),
    nAmount: z.string().nullable().optional(),
    nAmountIdr: z.string().nullable().optional(),
    journalDesc: z.string().nullable().optional(),
    drcr: z.string().nullable().optional(),
    currency: z.string().nullable().optional(), // ccy in DB
}).openapi('JournalDetail')

const RunCalculationSchema = z.object({
    calculationName: z.string().optional(),
    portfolioId: z.string().optional(),
    financialAssetId: z.string().optional(),
    amortizationMethod: z.string().optional(),
    nominalRate: z.number().optional(),
    effectiveInterestRate: z.number().optional(),
    originalBookValue: z.number().optional(),
    amortizationStartDate: z.string().optional(),
    currency: z.string().default('IDR').optional(),
}).openapi('RunCalculationInput')

// =============================================================================
// ROUTES
// =============================================================================

// ... (keeping imports)

// Fix: Add 500 response to all routes that don't have it and use `as any` for c.json to satisfy strict typing for now.

/**
 * GET / - Get Amortization Results (frs9EirEcf)
 */
amortizationRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/',
        tags: ['Amortization'],
        summary: 'Get Amortization Results',
        request: {
            query: z.object({
                page: z.string().optional().default('1').openapi({ example: '1' }),
                limit: z.string().optional().default('10').openapi({ example: '10' }),
                prcDate: z.string().optional(),
                search: z.string().optional(),
            } as any),
        },
        responses: {
            200: {
                content: {
                    'application/json': {
                        schema: z.object({
                            success: z.boolean(),
                            data: z.array(AmortizationModuleListRowSchema),
                            effectivePrcDate: z.string().nullable(),
                            pagination: PaginationSchema,
                        } as any),
                    },
                },
                description: 'Amortization results',
            },
            500: {
                description: 'Server error',
                content: {
                    'application/json': {
                        schema: z.object({
                            success: z.boolean(),
                            message: z.string(),
                            error: z.string().optional(),
                        } as any)
                    }
                }
            }
        },
    }),
    async (c) => {
        try {
            const page = Number(c.req.query('page') || '0')
            const limit = Number(c.req.query('limit') || '10')
            const cursor = c.req.query('cursor') || ''
            const search = c.req.query('search')?.trim()
            const requestedPrcDate = c.req.query('prcDate')
            const effectivePrcDate = await resolveEffectivePrcDate(requestedPrcDate)
            const shouldFilterByPrcDate = Boolean(requestedPrcDate) || !search

            if (shouldFilterByPrcDate && !effectivePrcDate) {
                return c.json({
                    success: true,
                    data: [],
                    effectivePrcDate: null,
                    pagination: { page: 0, limit, total: 0, totalPages: 0, cursor: null, nextCursor: null, hasMore: false },
                } as any)
            }

            const conditions = shouldFilterByPrcDate
                ? [eq(frs9MasterAccount.prcDate, effectivePrcDate as string)]
                : []
            if (search) {
                conditions.push(or(
                    ilike(frs9MasterAccount.accountNumber, `%${search}%`),
                    ilike(frs9MasterAccount.facilityNumber, `%${search}%`),
                    ilike(frs9MasterAccount.cifNumber, `%${search}%`),
                    ilike(frs9MasterAccount.cifName, `%${search}%`),
                ) as any)
            }

            // Cursor-based pagination
            if (cursor) {
                try {
                    const decoded = Buffer.from(cursor, 'base64').toString('utf-8')
                    const [lastAcct, lastFac] = decoded.split('|')
                    if (lastAcct) {
                        conditions.push(sql`(${frs9MasterAccount.accountNumber}, ${frs9MasterAccount.facilityNumber}) > (${lastAcct}::varchar, ${lastFac || ''}::varchar)`)
                    }
                } catch {
                    // Invalid cursor — return from start
                }
            }

            const data = await db.select(buildAmortizationMasterSelection() as any)
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
                data: data as any,
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
            console.error('Error fetching amortization results:', error)
            return c.json({
                success: false,
                message: 'Failed to fetch amortization results',
                error: String(error)
            } as any, 500)
        }
    }
)

amortizationRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/results/{pkid}/details',
        tags: ['Amortization'],
        summary: 'Get Amortization Detail Tabs',
        request: {
            params: z.object({ pkid: z.string() }),
        },
        responses: {
            200: {
                content: {
                    'application/json': {
                        schema: z.object({
                            success: z.boolean(),
                            data: AmortizationModuleDetailSchema,
                        } as any),
                    },
                },
                description: 'Amortization detail tabs',
            },
            404: {
                description: 'Not found',
                content: { 'application/json': { schema: z.object({ success: z.boolean(), message: z.string() } as any) } },
            },
            500: {
                description: 'Server error',
                content: { 'application/json': { schema: z.object({ success: z.boolean(), message: z.string(), error: z.string().optional() } as any) } },
            },
        },
    }),
    async (c) => {
        try {
            const { pkid } = c.req.valid('param')
            const contractRows = await db
                .select(buildAmortizationMasterSelection() as any)
                .from(frs9MasterAccount)
                .where(eq(frs9MasterAccount.pkid, BigInt(pkid)))
                .limit(1)

            const contractDetail = contractRows[0]
            if (!contractDetail) {
                return c.json(buildErrorResponse(c, {
                    error: 'Amortization contract not found',
                    message: 'Amortization contract not found',
                    code: 'NOT_FOUND',
                }) as any, 404)
            }

            const [feeCosts, amortizationSchedule, events, journalDetails] = await Promise.all([
                db.select({
                    reportingDate: frs9MasterTransactionCost.prcDate,
                    accountNumber: frs9MasterTransactionCost.accountNumber,
                    transactionCode: frs9MasterTransactionCost.trxCode,
                    debitCreditFlag: frs9MasterTransactionCost.debetCreditFlag,
                    transactionType: frs9MasterTransactionCost.feeCostId,
                    currency: frs9MasterTransactionCost.currencyCode,
                    transactionAmount: frs9MasterTransactionCost.orgCcyAmt,
                    accountId: frs9MasterTransactionCost.accountId,
                } as any)
                    .from(frs9MasterTransactionCost)
                    .where(eq(frs9MasterTransactionCost.accountId, contractDetail.accountId))
                    .orderBy(
                        asc(frs9MasterTransactionCost.feeCostId),
                        asc(frs9MasterTransactionCost.prcDate),
                        asc(frs9MasterTransactionCost.trxCode),
                    ),
                db.select({
                    accountNumber: frs9AccountId.accountNumber,
                    counter: frs9EirEcf.counter,
                    paymentDate: frs9EirEcf.pmtDate,
                    interestRate: frs9EirEcf.nIntRate,
                    effectiveInterestRate: frs9EirEcf.nEffIntRate,
                    outstandingPrincipal: frs9EirEcf.nOsprn,
                    principal: frs9EirEcf.nPrnPayment,
                    interestContractual: frs9EirEcf.nIntPayment,
                    accruedInterest: frs9EirEcf.nAccruInt,
                    installment: frs9EirEcf.nInstallment,
                    nocfOutstandingPrincipal: frs9EirEcf.nocfOsprn,
                    nocfPrincipal: frs9EirEcf.nocfPrnPayment,
                    eyrStructureDiff: frs9EirEcf.nocfAmortAmt,
                    marginEyrWithTc: frs9EirEcf.nEffIntAmt,
                    amortTotal: frs9EirEcf.nAmortAmt,
                    unamortTotal: frs9EirEcf.nUnamortAmt,
                    carryingAmount: frs9EirEcf.nFairvalue,
                    amortCost: frs9EirEcf.nCostAmortAmt,
                    amortFee: frs9EirEcf.nFeeAmortAmt,
                    unamortCost: frs9EirEcf.nCostUnamortAmt,
                    unamortFee: frs9EirEcf.nFeeUnamortAmt,
                    unamortGainLoss: frs9EirEcf.nGainLossUnamortAmt,
                    amortGainLoss: frs9EirEcf.nGainLossAmortAmt,
                    prcDate: frs9EirEcf.prcDate,
                    accountId: frs9EirEcf.accountId,
                } as any)
                    .from(frs9EirEcf)
                    .innerJoin(frs9AccountId, eq(frs9EirEcf.accountId, frs9AccountId.accountId as any))
                    .where(eq(frs9EirEcf.accountId, contractDetail.accountId))
                    .orderBy(asc(frs9EirEcf.prcDate), asc(frs9EirEcf.counter)),
                db.select({
                    eventDate: frs9EventChanges.prcDate,
                    accountNumber: frs9EventChanges.accountNumber,
                    eventId: frs9EventChanges.eventId,
                    eventDescription: frs9EventChanges.remarks,
                    effectiveDate: frs9EventChanges.effectiveDate,
                    beforeValue: frs9EventChanges.beforeValue,
                    afterValue: frs9EventChanges.afterValue,
                } as any)
                    .from(frs9EventChanges)
                    .where(eq(frs9EventChanges.accountId, contractDetail.accountId))
                    .orderBy(desc(frs9EventChanges.prcDate)),
                db.select({
                    reportingDate: frs9AmortJournalData.prcDate,
                    accountId: frs9AmortJournalData.accountId,
                    branchCode: frs9AmortJournalData.branch,
                    currency: frs9AmortJournalData.ccy,
                    journalType: frs9AmortJournalData.journalcode,
                    journalDescription: frs9AmortJournalData.journalDesc,
                    glAccount: frs9AmortJournalData.glno,
                    debitCredit: frs9AmortJournalData.drcr,
                    journalAmount: frs9AmortJournalData.nAmount,
                    eqvJournalAmount: frs9AmortJournalData.nAmountIdr,
                } as any)
                    .from(frs9AmortJournalData)
                    .where(eq(frs9AmortJournalData.accountId, contractDetail.accountId))
                    .orderBy(
                        asc(frs9AmortJournalData.prcDate),
                        asc(frs9AmortJournalData.branch),
                        asc(frs9AmortJournalData.ccy),
                        asc(frs9AmortJournalData.journalcode),
                        asc(frs9AmortJournalData.glno),
                        asc(frs9AmortJournalData.drcr),
                    ),
            ])

            return c.json({
                success: true,
                data: {
                    contractDetail,
                    feeCosts,
                    amortizationSchedule,
                    events,
                    journalDetails,
                },
            } as any)
        } catch (error) {
            console.error('Error fetching amortization detail:', error)
            return c.json({
                success: false,
                message: 'Failed to fetch amortization detail',
                error: String(error),
            } as any, 500)
        }
    },
)

/**
 * GET /calculations - Alias to /
 */
amortizationRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/calculations',
        tags: ['Amortization'],
        summary: 'Get Calculations (Alias)',
        request: {
            query: z.object({
                page: z.string().optional(),
                limit: z.string().optional(),
            } as any),
        },
        responses: {
            200: {
                content: {
                    'application/json': {
                        schema: z.object({
                            success: z.boolean(),
                            data: z.array(Frs9EirEcfSchema),
                            pagination: PaginationSchema,
                        } as any),
                    },
                },
                description: 'Amortization results',
            },
            500: {
                description: 'Server error',
                content: {
                    'application/json': {
                        schema: z.object({
                            success: z.boolean(),
                            message: z.string(),
                            error: z.string().optional(),
                        } as any)
                    }
                }
            }
        }
    }),
    async (c) => {
        const page = Number(c.req.query('page') || '1')
        const limit = Number(c.req.query('limit') || '10')
        const offset = (page - 1) * limit

        try {
            const totalRows = await db
                .select({ count: sql<number>`count(*)::int` })
                .from(frs9EirEcf)

            const data = await db
                .select({
                    ...getTableColumns(frs9EirEcf),
                    accountNumber: frs9AccountId.accountNumber,
                    customerName: frs9AccountId.cifName
                } as any)
                .from(frs9EirEcf)
                .leftJoin(frs9AccountId, eq(frs9EirEcf.accountId, frs9AccountId.accountId as any))
                .orderBy(desc(frs9EirEcf.id))
                .limit(limit)
                .offset(offset)

            return c.json({
                success: true,
                data: data as any,
                pagination: {
                    page,
                    limit,
                    total: totalRows[0]?.count ?? 0,
                    totalPages: Math.ceil((totalRows[0]?.count ?? 0) / limit)
                }
            } as any)
        } catch (e) {
            return c.json(buildErrorResponse(c, { error: 'Error', message: 'Error', code: 'AMORTIZATION_ERROR', details: String(e) }), 500)
        }
    }
)

/**
 * POST /run-calculation - Trigger calculation
 */
amortizationRoutes.openapi(
    createRoute({
        method: 'post',
        path: '/run-calculation',
        tags: ['Amortization'],
        summary: 'Run Calculation',
        request: {
            body: {
                content: {
                    'application/json': {
                        schema: RunCalculationSchema,
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
                            message: z.string(),
                        } as any),
                    },
                },
                description: 'Job submitted',
            },
            500: {
                description: 'Server error',
                content: {
                    'application/json': {
                        schema: z.object({
                            success: z.boolean(),
                            message: z.string(),
                            error: z.string().optional(),
                        } as any)
                    }
                }
            }
        },
    }),
    async (c) => {
        return c.json({
            success: true,
            message: 'Amortization calculation job submitted (Mock)',
        })
    }
)

/**
 * GET /contract-details - Get contract/account details
 */
amortizationRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/contract-details',
        tags: ['Amortization'],
        summary: 'Get Contract Details',
        request: {
            query: z.object({
                accountNumber: z.string().optional(),
                page: z.string().optional().default('1'),
                limit: z.string().optional().default('20'),
            } as any),
        },
        responses: {
            200: {
                content: {
                    'application/json': {
                        schema: z.object({
                            success: z.boolean(),
                            data: z.array(ContractDetailsSchema),
                            pagination: PaginationSchema,
                        } as any),
                    },
                },
                description: 'Contract details',
            },
            500: {
                description: 'Server error',
                content: {
                    'application/json': {
                        schema: z.object({
                            success: z.boolean(),
                            message: z.string(),
                            error: z.string().optional(),
                        } as any)
                    }
                }
            }
        },
    }),
    async (c) => {
        try {
            const accountNumber = c.req.query('accountNumber')
            const page = Number(c.req.query('page') || '1')
            const limit = Number(c.req.query('limit') || '20')
            const offset = (page - 1) * limit

            let query = db.select().from(frs9AccountId)

            if (accountNumber) {
                query = query.where(eq(frs9AccountId.accountNumber, accountNumber)) as any
            }

            const data = await query.limit(limit).offset(offset)

            return c.json({
                success: true,
                data: data.map(d => ({
                    ...d,
                    accountId: String(d.accountId), // Cast bigserial to string
                } as any)) as any,
                pagination: {
                    page,
                    limit,
                    total: data.length, // Should be real count
                    totalPages: Math.ceil(data.length / limit)
                }
            } as any)
        } catch (error) {
            console.error('Error fetching contract details:', error)
            return c.json({
                success: false,
                message: 'Failed to fetch contract details',
                error: String(error)
            } as any, 500)
        }
    }
)

/**
 * GET /fees-costs - Get transaction fees and costs
 */
amortizationRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/fees-costs',
        tags: ['Amortization'],
        summary: 'Get Fees and Costs',
        request: {
            query: z.object({
                page: z.string().optional().default('1'),
                limit: z.string().optional().default('20'),
            } as any),
        },
        responses: {
            200: {
                content: {
                    'application/json': {
                        schema: z.object({
                            success: z.boolean(),
                            data: z.array(FeeCostSchema),
                            pagination: PaginationSchema,
                        } as any),
                    },
                },
                description: 'Fees and costs',
            },
            500: {
                description: 'Server error',
                content: {
                    'application/json': {
                        schema: z.object({
                            success: z.boolean(),
                            message: z.string(),
                            error: z.string().optional(),
                        } as any)
                    }
                }
            }
        },
    }),
    async (c) => {
        try {
            const page = Number(c.req.query('page') || '1')
            const limit = Number(c.req.query('limit') || '20')
            const offset = (page - 1) * limit

            const data = await db
                .select()
                .from(frs9MasterTransactionCost)
                .limit(limit)
                .offset(offset)

            return c.json({
                success: true,
                data: data as any,
                pagination: {
                    page,
                    limit,
                    total: data.length,
                    totalPages: Math.ceil(data.length / limit)
                }
            } as any)
        } catch (error) {
            return c.json({
                success: false,
                message: 'Failed to fetch fees and costs',
                error: String(error)
            } as any, 500)
        }
    }
)

/**
 * GET /events - Get amortization events
 */
amortizationRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/events',
        tags: ['Amortization'],
        summary: 'Get Events',
        request: {
            query: z.object({
                accountId: z.string().optional(),
                page: z.string().optional().default('1'),
                limit: z.string().optional().default('20'),
            } as any),
        },
        responses: {
            200: {
                content: {
                    'application/json': {
                        schema: z.object({
                            success: z.boolean(),
                            data: z.array(EventChangeSchema),
                            pagination: PaginationSchema,
                        } as any),
                    },
                },
                description: 'Events',
            },
            500: {
                description: 'Server error',
                content: {
                    'application/json': {
                        schema: z.object({
                            success: z.boolean(),
                            message: z.string(),
                            error: z.string().optional(),
                        } as any)
                    }
                }
            }
        },
    }),
    async (c) => {
        try {
            const accountId = c.req.query('accountId')
            const page = Number(c.req.query('page') || '1')
            const limit = Number(c.req.query('limit') || '20')
            const offset = (page - 1) * limit

            let query = db.select().from(frs9EventChanges)

            if (accountId) {
                query = query.where(eq(frs9EventChanges.accountId, Number(accountId))) as any
            }

            const data = await query
                .orderBy(desc(frs9EventChanges.prcDate))
                .limit(limit)
                .offset(offset)

            return c.json({
                success: true,
                data: data as any,
                pagination: {
                    page,
                    limit,
                    total: data.length,
                    totalPages: Math.ceil(data.length / limit)
                }
            } as any)
        } catch (error) {
            return c.json({
                success: false,
                message: 'Failed to fetch events',
                error: String(error)
            } as any, 500)
        }
    }
)

/**
 * GET /journal-details - Get journal entry details
 */
amortizationRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/journal-details',
        tags: ['Amortization'],
        summary: 'Get Journal Details',
        request: {
            query: z.object({
                accountId: z.string().optional(),
                page: z.string().optional().default('1'),
                limit: z.string().optional().default('20'),
            } as any),
        },
        responses: {
            200: {
                content: {
                    'application/json': {
                        schema: z.object({
                            success: z.boolean(),
                            data: z.array(JournalDetailSchema),
                            pagination: PaginationSchema,
                        } as any),
                    },
                },
                description: 'Journal details',
            },
            500: {
                description: 'Server error',
                content: {
                    'application/json': {
                        schema: z.object({
                            success: z.boolean(),
                            message: z.string(),
                            error: z.string().optional(),
                        } as any)
                    }
                }
            }
        },
    }),
    async (c) => {
        try {
            const accountId = c.req.query('accountId')
            const page = Number(c.req.query('page') || '1')
            const limit = Number(c.req.query('limit') || '20')
            const offset = (page - 1) * limit

            let query = db.select().from(frs9AmortJournalData)

            if (accountId) {
                query = query.where(eq(frs9AmortJournalData.accountId, Number(accountId))) as any
            }

            const data = await query
                .orderBy(desc(frs9AmortJournalData.prcDate))
                .limit(limit)
                .offset(offset)

            return c.json({
                success: true,
                data: data.map(d => ({
                    ...d,
                    id: String(d.id),
                    currency: d.ccy,
                } as any)) as any,
                pagination: {
                    page,
                    limit,
                    total: data.length,
                    totalPages: Math.ceil(data.length / limit)
                }
            } as any)
        } catch (error) {
            return c.json({
                success: false,
                message: 'Failed to fetch journal details',
                error: String(error)
            } as any, 500)
        }
    }
)
