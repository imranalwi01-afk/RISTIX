import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import type { AppContext } from '../app'
import { authMiddleware } from '../middleware'
import { individualImpairmentV2Controller as individualImpairmentController } from '../controllers/individual-impairment-v2.controller'
import { openApiValidationHook } from '../lib/http/openapi-validation-hook'

export const individualImpairmentV2Routes: any = new OpenAPIHono<AppContext>({ defaultHook: openApiValidationHook })

individualImpairmentV2Routes.use('*', authMiddleware)

// ============================================================================
// SCHEMAS
// ============================================================================

const SuccessResponseSchema = z.object({
    success: z.boolean(),
    message: z.string().optional(),
    data: z.any().optional()
}).openapi('SuccessResponse')

const ErrorResponse = z.object({
    success: z.boolean(),
    message: z.string(),
    error: z.string().optional()
}).openapi('ErrorResponse')

// --- Watchlist ---
const WatchlistItemSchema = z.object({
    pkid: z.number().int(),
    ia_id: z.number().int().optional(),
    prc_date: z.string().optional(),
    cif_number: z.string().optional(),
    cif_name: z.string().optional(),
    account_id: z.number().int().optional(),
    account_number: z.string().optional(),
    outstanding_balance: z.number().optional(),
    stage: z.number().int().optional(),
    assessment_status: z.string().optional(),
    provision_amount: z.number().optional(),
    impaired_flag: z.string().optional(),
    method: z.string().optional(),
    is_override: z.boolean().optional()
}).openapi('WatchlistItem')

const WatchlistListResponse = z.object({
    success: z.boolean(),
    data: z.array(WatchlistItemSchema),
    pagination: z.object({
        limit: z.number(),
        mode: z.enum(['offset', 'cursor']).optional(),
        page: z.number().optional(),
        offset: z.number().optional(),
        total: z.number().optional(),
        totalPages: z.number().optional(),
        nextCursor: z.string().nullable().optional(),
        previousCursor: z.string().nullable().optional(),
        hasNextPage: z.boolean().optional(),
        hasPreviousPage: z.boolean().optional()
    }).optional(),
    appliedQuery: z.any().optional()
}).openapi('WatchlistListResponse')

const CustomerListItemSchema = z.object({
    pkid: z.number().int().optional(),
    prc_date: z.string().optional(),
    account_id: z.number().int().optional(),
    account_number: z.string().optional(),
    cif_number: z.string().optional(),
    cif_name: z.string().optional(),
    group_segment: z.string().optional(),
    segment: z.string().optional(),
    sub_segment: z.string().optional(),
    stage: z.number().int().optional(),
    impaired_flag: z.string().optional(),
    outstanding_balance: z.union([z.number(), z.string()]).optional(),
    provision_amount: z.union([z.number(), z.string()]).optional(),
    rating_code: z.string().optional(),
    dpd: z.union([z.number(), z.string()]).optional(),
    assessment_status: z.string().optional(),
    remarks: z.string().nullable().optional()
}).openapi('CustomerListItem')

const CustomerListResponse = z.object({
    success: z.boolean(),
    data: z.array(CustomerListItemSchema),
    pagination: z.object({
        limit: z.number(),
        mode: z.enum(['offset', 'cursor']).optional(),
        page: z.number().optional(),
        offset: z.number().optional(),
        total: z.number().optional(),
        totalPages: z.number().optional(),
        nextCursor: z.string().nullable().optional(),
        previousCursor: z.string().nullable().optional(),
        hasNextPage: z.boolean().optional(),
        hasPreviousPage: z.boolean().optional()
    }).optional(),
    appliedQuery: z.any().optional()
}).openapi('CustomerListResponse')

const AddWatchlistSchema = z.object({
    accountId: z.number().int(),
    remarks: z.string().optional(),
}).openapi('AddWatchlistInput')

// --- Assessment ---
const AssessmentSchema = z.object({
    pkid: z.number().int(),
    accountId: z.number().int(),
    stage: z.number().int(),
    provisionAmount: z.number(),
    assessmentDate: z.string(),
    status: z.string()
}).openapi('Assessment')

const AssessmentResponse = z.object({
    success: z.boolean(),
    data: AssessmentSchema
}).openapi('AssessmentResponse')

const CreateAssessmentSchema = z.object({
    accountId: z.number().int(),
    stage: z.number().int(),
    provisionAmount: z.number(),
    remarks: z.string().optional()
}).openapi('CreateAssessmentInput')

// --- Overrides ---
const OverrideSchema = z.object({
    pkid: z.number().int(),
    accountId: z.number().int(),
    originalStage: z.number().int(),
    proposedStage: z.number().int(),
    status: z.string(),
    requestedBy: z.string(),
    createdAt: z.string()
}).openapi('OverrideItem')

const OverrideListResponse = z.object({
    success: z.boolean(),
    data: z.array(OverrideSchema)
}).openapi('OverrideListResponse')

const AddOverrideSchema = z.object({
    accountId: z.number().int().optional(),
    accountNumber: z.string().optional(),
    customerName: z.string().optional(),
    cifNumber: z.string().optional(),
    overrideStage: z.union([z.number().int(), z.string()]),
    justification: z.string(),
    supportingDocumentName: z.string().optional(),
    supportingDocumentContent: z.string().optional(),
}).openapi('AddOverrideInput')

const OverrideDocumentParamSchema = z.object({
    fileName: z.string()
})

// --- History ---
const AuditTrailSchema = z.object({
    pkid: z.number().int(),
    entityType: z.string(),
    entityId: z.string(),
    action: z.string(),
    performedBy: z.string(),
    performedAt: z.string(),
    oldValue: z.string().optional(),
    newValue: z.string().optional(),
    reason: z.string().optional()
}).openapi('AuditTrail')

const HistoryListResponse = z.object({
    success: z.boolean(),
    data: z.array(AuditTrailSchema),
    meta: z.object({
        limit: z.number(),
        offset: z.number(),
        count: z.number()
    }).optional()
}).openapi('HistoryListResponse')

// --- Reports ---
const ReportSchema = z.object({
    pkid: z.number().int(),
    reportPeriod: z.string(),
    reportType: z.string(),
    status: z.string(),
    generatedBy: z.string(),
    createdAt: z.string()
}).openapi('ReportItem')

const ReportListResponse = z.object({
    success: z.boolean(),
    data: z.array(ReportSchema)
}).openapi('ReportListResponse')

const CreateReportSchema = z.object({
    reportPeriod: z.string(),
    reportType: z.string()
}).openapi('CreateReportInput')

// --- Scenarios ---
const ScenarioSchema = z.object({
    pkid: z.number().int(),
    scenarioCode: z.string(),
    scenarioName: z.string(),
    description: z.string().optional(),
    status: z.string(),
    activeFlag: z.boolean()
}).openapi('ScenarioItem')

const ScenarioListResponse = z.object({
    success: z.boolean(),
    data: z.array(ScenarioSchema)
}).openapi('ScenarioListResponse')

const CreateScenarioSchema = z.object({
    accountId: z.number().int().optional(),
    scenarioId: z.number().int().min(1).max(3).optional(),
    scenarioCode: z.string().optional(),
    scenarioName: z.string(),
    description: z.string().optional(),
    nOfScenario: z.number().int().min(1).max(3).optional(),
    scenarioRows: z.array(z.object({
        possibleOutcomeRate: z.number().optional(),
        scenarioName: z.string().optional(),
        periodStart: z.string().optional(),
        periodEnd: z.string().optional(),
        repaymentRate: z.number().optional()
    })).optional(),
    configuration: z.any().optional()
}).openapi('CreateScenarioInput')

const UpdateScenarioStatusSchema = z.object({
    status: z.string()
}).openapi('UpdateScenarioStatusInput')

// --- DCF ---
const DcfUploadSchema = z.object({
    pkid: z.number().int(),
    fileName: z.string(),
    batchId: z.string(),
    recordCount: z.number().int(),
    uploadedBy: z.string(),
    createdAt: z.string()
}).openapi('DcfUpload')

const DcfUploadListResponse = z.object({
    success: z.boolean(),
    data: z.array(DcfUploadSchema)
}).openapi('DcfUploadListResponse')

const DcfCashflowSchema = z.object({
    pkid: z.number().int(),
    iaId: z.number().nullable().optional(),
    prcDate: z.string().nullable().optional(),
    accountId: z.number().nullable().optional(),
    accountNumber: z.string().optional(),
    mob: z.number().optional(),
    periode: z.string().nullable().optional(),
    principal: z.number(),
    interest: z.number(),
    collateral: z.number(),
    status: z.string().nullable().optional(),
    createdby: z.string().optional(),
    createddate: z.string().nullable().optional()
}).openapi('DcfCashflow')

const DcfCashflowListResponse = z.object({
    success: z.boolean(),
    data: z.array(DcfCashflowSchema)
}).openapi('DcfCashflowListResponse')

const DcfCalculationSchema = z.object({
    accountId: z.string(),
    totalCashflow: z.number(),
    totalPV: z.number(),
    scenarioName: z.string().optional(),
    fileName: z.string().optional()
}).openapi('DcfCalculation')

const DcfCalculationListResponse = z.object({
    success: z.boolean(),
    data: z.array(DcfCalculationSchema)
}).openapi('DcfCalculationListResponse')

const IaResultHeaderSchema = z.object({
    pkid: z.number(),
    iaId: z.number().nullable(),
    prcDate: z.string().nullable(),
    effectiveDate: z.string().nullable(),
    accountId: z.number().nullable(),
    accountNumber: z.string(),
    cifNumber: z.string(),
    cifName: z.string(),
    currency: z.string(),
    dpd: z.number(),
    collectability: z.number(),
    ratingCode: z.string(),
    interestRate: z.number(),
    effInterestRate: z.number(),
    outstanding: z.number(),
    accruedInterest: z.number(),
    carryingAmt: z.number(),
    eadAmt: z.number(),
    pvDcfAmt: z.number(),
    eclIaAmt: z.number(),
    createdby: z.string(),
    createddate: z.string().nullable()
}).openapi('IaResultHeader')

const IaResultDetailSchema = z.object({
    pkid: z.number(),
    iaId: z.number().nullable(),
    prcDate: z.string().nullable(),
    accountId: z.number().nullable(),
    mob: z.number(),
    periode: z.string().nullable(),
    principal: z.number(),
    interest: z.number(),
    installment: z.number(),
    collateral: z.number(),
    poRate1: z.number(),
    rrRate1: z.number(),
    default1: z.number(),
    poRate2: z.number(),
    rrRate2: z.number(),
    default2: z.number(),
    poRate3: z.number(),
    rrRate3: z.number(),
    default3: z.number(),
    pwAmt: z.number(),
    discountFactor: z.number(),
    pvAmt: z.number(),
    beginningBalance: z.number(),
    eirAmt: z.number(),
    endingBalance: z.number()
}).openapi('IaResultDetail')

const IaResultDetailResponse = z.object({
    success: z.boolean(),
    data: z.object({
        header: IaResultHeaderSchema.nullable(),
        cashflows: z.array(DcfCashflowSchema),
        details: z.array(IaResultDetailSchema)
    })
}).openapi('IaResultDetailResponse')

const CreateBatchUploadSchema = z.object({
    fileName: z.string(),
    batchId: z.string().optional(),
    cashflows: z.array(z.object({
        accountId: z.union([z.number(), z.string()]),
        accountNumber: z.string().optional(),
        prcDate: z.string().optional(),
        periodDate: z.string().optional(),
        periode: z.string().optional(),
        mob: z.number().optional(),
        principal: z.number().optional(),
        interest: z.number().optional(),
        collateral: z.number().optional(),
        status: z.string().optional()
    }))
}).openapi('CreateBatchUploadInput')

// ============================================================================
// ROUTES
// ============================================================================

// --- WATCHLIST ---

individualImpairmentV2Routes.openapi(
    createRoute({
        method: 'get',
        path: '/watchlist',
        tags: ['Individual Impairment V2'],
        summary: 'Get Watchlist',
        request: {
            query: z.object({
                search: z.string().optional(),
                page: z.string().optional(),
                offset: z.string().optional(),
                limit: z.string().optional(),
                cursor: z.string().optional(),
                paginationMode: z.enum(['offset', 'cursor']).optional(),
                sort: z.string().optional(),
                sortField: z.string().optional(),
                sortOrder: z.enum(['asc', 'desc']).optional(),
                filters: z.string().optional(),
                dateFrom: z.string().optional(),
                dateTo: z.string().optional(),
                // Filter object patterns for documentation
                'filter[stage]': z.string().optional(),
                'filter[assessment_status]': z.string().optional(),
                'filter[impaired_flag]': z.string().optional(),
                'filter[rating_code]': z.string().optional(),
                // Legacy support
                segment: z.string().optional(),
                status: z.string().optional(),
            })
        },
        responses: {
            200: { content: { 'application/json': { schema: WatchlistListResponse } }, description: 'Watchlist' },
            401: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Unauthorized' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    (c: any) => individualImpairmentController.getWatchlist(c)
)

individualImpairmentV2Routes.openapi(
    createRoute({
        method: 'get',
        path: '/watchlist/summary',
        tags: ['Individual Impairment V2'],
        summary: 'Get watchlist summary statistics',
        description: 'Returns aggregated statistics for the watchlist (Total Accounts, Impaired, Pending, Provisions)',
        responses: {
            200: {
                description: 'Summary statistics',
                content: {
                    'application/json': {
                        schema: z.object({
                            success: z.boolean(),
                            data: z.object({
                                totalAccounts: z.number().or(z.string()),
                                impairedAccounts: z.number().or(z.string()),
                                pendingAssessments: z.number().or(z.string()),
                                totalProvisions: z.number().or(z.string())
                            })
                        })
                    }
                }
            }
        }
    }),
    (c: any) => individualImpairmentController.getWatchlistSummary(c)
)

individualImpairmentV2Routes.openapi(
    createRoute({
        method: 'get',
        path: '/watchlist/customers',
        tags: ['Individual Impairment V2'],
        summary: 'Get Customer List',
        description: 'Returns one latest row per account (distinct account/customer list) with optional date range and search.',
        request: {
            query: z.object({
                search: z.string().optional(),
                page: z.string().optional(),
                offset: z.string().optional(),
                limit: z.string().optional(),
                cursor: z.string().optional(),
                paginationMode: z.enum(['offset', 'cursor']).optional(),
                sort: z.string().optional(),
                sortField: z.string().optional(),
                sortOrder: z.enum(['asc', 'desc']).optional(),
                filters: z.string().optional(),
                dateFrom: z.string().optional(),
                dateTo: z.string().optional(),
                'filter[date_range][start]': z.string().optional(),
                'filter[date_range][end]': z.string().optional()
            })
        },
        responses: {
            200: { content: { 'application/json': { schema: CustomerListResponse } }, description: 'Customer List' },
            401: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Unauthorized' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    (c: any) => individualImpairmentController.getCustomerList(c)
)

individualImpairmentV2Routes.openapi(
    createRoute({
        method: 'post',
        path: '/watchlist',
        tags: ['Individual Impairment V2'],
        summary: 'Add to Watchlist',
        request: {
            body: { content: { 'application/json': { schema: AddWatchlistSchema } } }
        },
        responses: {
            200: { content: { 'application/json': { schema: SuccessResponseSchema } }, description: 'Added' },
            401: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Unauthorized' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    (c: any) => individualImpairmentController.addToWatchlist(c)
)

individualImpairmentV2Routes.openapi(
    createRoute({
        method: 'delete',
        path: '/watchlist/{id}',
        tags: ['Individual Impairment V2'],
        summary: 'Remove from Watchlist',
        request: {
            params: z.object({ id: z.string() })
        },
        responses: {
            200: { content: { 'application/json': { schema: SuccessResponseSchema } }, description: 'Removed' },
            401: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Unauthorized' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    (c: any) => individualImpairmentController.removeFromWatchlist(c)
)

// --- STAGING ANALYSIS & SUMMARY ---

individualImpairmentV2Routes.openapi(
    createRoute({
        method: 'get',
        path: '/staging-analysis',
        tags: ['Individual Impairment V2'],
        summary: 'Get Staging Analysis',
        request: {
            query: z.object({
                stage: z.string().optional(),
                segmentId: z.string().optional(),
                startDate: z.string().optional(),
                endDate: z.string().optional()
            })
        },
        responses: {
            200: { content: { 'application/json': { schema: z.object({ success: z.boolean(), data: z.array(z.any()) }) } }, description: 'Staging Analysis' },
            401: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Unauthorized' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    (c: any) => individualImpairmentController.getStagingAnalysis(c)
)

individualImpairmentV2Routes.openapi(
    createRoute({
        method: 'get',
        path: '/staging-summary',
        tags: ['Individual Impairment V2'],
        summary: 'Get Staging Summary',
        responses: {
            200: { content: { 'application/json': { schema: z.object({ success: z.boolean(), data: z.any() }) } }, description: 'Staging Summary' },
            401: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Unauthorized' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    (c: any) => individualImpairmentController.getStagingSummary(c)
)

// --- ASSESSMENT ---

individualImpairmentV2Routes.openapi(
    createRoute({
        method: 'post',
        path: '/assessment',
        tags: ['Individual Impairment V2'],
        summary: 'Create Assessment',
        request: {
            body: { content: { 'application/json': { schema: CreateAssessmentSchema } } }
        },
        responses: {
            200: { content: { 'application/json': { schema: SuccessResponseSchema } }, description: 'Created' },
            401: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Unauthorized' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    (c: any) => individualImpairmentController.createAssessment(c)
)

individualImpairmentV2Routes.openapi(
    createRoute({
        method: 'post',
        path: '/assessment/{id}/submit',
        tags: ['Individual Impairment V2'],
        summary: 'Submit Assessment',
        request: {
            params: z.object({ id: z.string() }),
            body: { content: { 'application/json': { schema: z.object({ comments: z.string().optional() }) } } }
        },
        responses: {
            200: { content: { 'application/json': { schema: SuccessResponseSchema } }, description: 'Submitted' },
            401: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Unauthorized' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    (c: any) => individualImpairmentController.submitAssessment(c)
)

individualImpairmentV2Routes.openapi(
    createRoute({
        method: 'post',
        path: '/assessment/{id}/approve',
        tags: ['Individual Impairment V2'],
        summary: 'Approve Assessment',
        request: {
            params: z.object({ id: z.string() }),
            body: { content: { 'application/json': { schema: z.object({ comments: z.string().optional() }) } } }
        },
        responses: {
            200: { content: { 'application/json': { schema: SuccessResponseSchema } }, description: 'Approved' },
            401: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Unauthorized' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    (c: any) => individualImpairmentController.approveAssessment(c)
)

individualImpairmentV2Routes.openapi(
    createRoute({
        method: 'post',
        path: '/assessment/{id}/reject',
        tags: ['Individual Impairment V2'],
        summary: 'Reject Assessment',
        request: {
            params: z.object({ id: z.string() }),
            body: { content: { 'application/json': { schema: z.object({ reason: z.string() }) } } }
        },
        responses: {
            200: { content: { 'application/json': { schema: SuccessResponseSchema } }, description: 'Rejected' },
            401: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Unauthorized' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    (c: any) => individualImpairmentController.rejectAssessment(c)
)

// --- OVERRIDES ---

individualImpairmentV2Routes.openapi(
    createRoute({
        method: 'get',
        path: '/overrides',
        tags: ['Individual Impairment V2'],
        summary: 'Get Overrides',
        request: {
            query: z.object({
                status: z.string().optional(),
                accountId: z.string().optional(),
                accountNumber: z.string().optional(),
                limit: z.string().optional(),
                offset: z.string().optional()
            })
        },
        responses: {
            200: { content: { 'application/json': { schema: OverrideListResponse } }, description: 'Overrides' },
            401: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Unauthorized' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    (c: any) => individualImpairmentController.getOverrides(c)
)

individualImpairmentV2Routes.openapi(
    createRoute({
        method: 'post',
        path: '/overrides',
        tags: ['Individual Impairment V2'],
        summary: 'Create Override',
        request: {
            body: { content: { 'application/json': { schema: AddOverrideSchema } } }
        },
        responses: {
            200: { content: { 'application/json': { schema: SuccessResponseSchema } }, description: 'Created' },
            401: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Unauthorized' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    (c: any) => individualImpairmentController.createOverride(c)
)

individualImpairmentV2Routes.openapi(
    createRoute({
        method: 'get',
        path: '/overrides/documents/{fileName}',
        tags: ['Individual Impairment V2'],
        summary: 'Download override supporting document',
        request: {
            params: OverrideDocumentParamSchema
        },
        responses: {
            200: { description: 'File' },
            400: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Bad request' },
            404: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Not found' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    async (c: any) => individualImpairmentController.downloadOverrideDocument(c)
)

// --- HISTORY ---

individualImpairmentV2Routes.openapi(
    createRoute({
        method: 'get',
        path: '/history',
        tags: ['Individual Impairment V2'],
        summary: 'Get History',
        request: {
            query: z.object({
                entityType: z.string().optional(),
                limit: z.string().optional(),
                offset: z.string().optional()
            })
        },
        responses: {
            200: { content: { 'application/json': { schema: HistoryListResponse } }, description: 'History' },
            401: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Unauthorized' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    (c: any) => individualImpairmentController.getHistory(c)
)

individualImpairmentV2Routes.openapi(
    createRoute({
        method: 'get',
        path: '/assessment/{accountId}/history',
        tags: ['Individual Impairment V2'],
        summary: 'Get Assessment History',
        request: {
            params: z.object({ accountId: z.string() })
        },
        responses: {
            200: { content: { 'application/json': { schema: HistoryListResponse } }, description: 'Assessment History' },
            401: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Unauthorized' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    (c: any) => individualImpairmentController.getAssessmentHistory(c)
)

// --- REPORTS ---

individualImpairmentV2Routes.openapi(
    createRoute({
        method: 'get',
        path: '/reports',
        tags: ['Individual Impairment V2'],
        summary: 'Get Reports',
        request: {
            query: z.object({
                reportPeriod: z.string().optional(),
                search: z.string().optional(),
                page: z.string().optional(),
                limit: z.string().optional(),
                offset: z.string().optional(),
                paginationMode: z.enum(['offset', 'cursor']).optional(),
                sort: z.string().optional(),
                sortField: z.string().optional(),
                sortOrder: z.enum(['asc', 'desc', 'ASC', 'DESC']).optional(),
                dateFrom: z.string().optional(),
                dateTo: z.string().optional(),
                downloadDate: z.string().optional(),
                status: z.string().optional(),
                impaired_flag: z.string().optional(),
                filters: z.string().optional()
            })
        },
        responses: {
            200: { content: { 'application/json': { schema: ReportListResponse } }, description: 'Reports' },
            401: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Unauthorized' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    (c: any) => individualImpairmentController.getReports(c)
)

individualImpairmentV2Routes.openapi(
    createRoute({
        method: 'post',
        path: '/reports',
        tags: ['Individual Impairment V2'],
        summary: 'Create Report',
        request: {
            body: { content: { 'application/json': { schema: CreateReportSchema } } }
        },
        responses: {
            200: { content: { 'application/json': { schema: SuccessResponseSchema } }, description: 'Created' },
            401: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Unauthorized' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    (c: any) => individualImpairmentController.createReport(c)
)

// --- SCENARIOS ---

individualImpairmentV2Routes.openapi(
    createRoute({
        method: 'get',
        path: '/scenarios',
        tags: ['Individual Impairment V2'],
        summary: 'Get Scenarios',
        request: {
            query: z.object({ status: z.string().optional() })
        },
        responses: {
            200: { content: { 'application/json': { schema: ScenarioListResponse } }, description: 'Scenarios' },
            401: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Unauthorized' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    (c: any) => individualImpairmentController.getScenarios(c)
)

individualImpairmentV2Routes.openapi(
    createRoute({
        method: 'post',
        path: '/scenarios',
        tags: ['Individual Impairment V2'],
        summary: 'Create Scenario',
        request: {
            body: { content: { 'application/json': { schema: CreateScenarioSchema } } }
        },
        responses: {
            200: { content: { 'application/json': { schema: SuccessResponseSchema } }, description: 'Created' },
            401: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Unauthorized' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    (c: any) => individualImpairmentController.createScenario(c)
)

individualImpairmentV2Routes.openapi(
    createRoute({
        method: 'put',
        path: '/scenarios/{id}/status',
        tags: ['Individual Impairment V2'],
        summary: 'Update Scenario Status',
        request: {
            params: z.object({ id: z.string() }),
            body: { content: { 'application/json': { schema: UpdateScenarioStatusSchema } } }
        },
        responses: {
            200: { content: { 'application/json': { schema: SuccessResponseSchema } }, description: 'Updated' },
            401: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Unauthorized' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    (c: any) => individualImpairmentController.updateScenarioStatus(c)
)

// --- DCF ---

individualImpairmentV2Routes.openapi(
    createRoute({
        method: 'get',
        path: '/dcf-uploads',
        tags: ['Individual Impairment V2'],
        summary: 'Get DCF Uploads',
        responses: {
            200: { content: { 'application/json': { schema: DcfUploadListResponse } }, description: 'Uploads' },
            401: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Unauthorized' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    (c: any) => individualImpairmentController.getDcfUploads(c)
)

individualImpairmentV2Routes.openapi(
    createRoute({
        method: 'post',
        path: '/dcf/calculate',
        tags: ['Individual Impairment V2'],
        summary: 'Get DCF Calculations',
        responses: {
            200: { content: { 'application/json': { schema: DcfCalculationListResponse } }, description: 'Calculations' },
            401: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Unauthorized' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    (c: any) => individualImpairmentController.calculateDcf(c)
)

individualImpairmentV2Routes.openapi(
    createRoute({
        method: 'get',
        path: '/dcf-calculations',
        tags: ['Individual Impairment V2'],
        summary: 'Get DCF Calculations',
        responses: {
            200: { content: { 'application/json': { schema: DcfCalculationListResponse } }, description: 'Calculations' },
            401: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Unauthorized' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    (c: any) => individualImpairmentController.getDcfCalculations(c)
)

individualImpairmentV2Routes.openapi(
    createRoute({
        method: 'get',
        path: '/ia-results/detail',
        tags: ['Individual Impairment V2'],
        summary: 'Get latest individual impairment result detail',
        request: {
            query: z.object({
                accountId: z.string().optional(),
                accountNumber: z.string().optional()
            })
        },
        responses: {
            200: { content: { 'application/json': { schema: IaResultDetailResponse } }, description: 'IA Result Detail' },
            401: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Unauthorized' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    (c: any) => individualImpairmentController.getIaResultDetail(c)
)

individualImpairmentV2Routes.openapi(
    createRoute({
        method: 'post',
        path: '/dcf-uploads',
        tags: ['Individual Impairment V2'],
        summary: 'Create Batch Upload',
        request: {
            body: { content: { 'application/json': { schema: CreateBatchUploadSchema } } }
        },
        responses: {
            200: { content: { 'application/json': { schema: SuccessResponseSchema } }, description: 'Uploaded' },
            401: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Unauthorized' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    (c: any) => individualImpairmentController.createBatchUpload(c)
)

individualImpairmentV2Routes.openapi(
    createRoute({
        method: 'get',
        path: '/dcf-uploads/{uploadId}/cashflows',
        tags: ['Individual Impairment V2'],
        summary: 'Get DCF Cashflows',
        request: {
            params: z.object({ uploadId: z.string() })
        },
        responses: {
            200: { content: { 'application/json': { schema: DcfCashflowListResponse } }, description: 'Cashflows' },
            401: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Unauthorized' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    (c: any) => individualImpairmentController.getDcfCashflows(c)
)

// Keep generic accountId route last so it doesn't shadow static routes like /scenarios.
individualImpairmentV2Routes.openapi(
    createRoute({
        method: 'get',
        path: '/{accountId}',
        tags: ['Individual Impairment V2'],
        summary: 'Get Assessment',
        request: {
            params: z.object({ accountId: z.string() })
        },
        responses: {
            200: { content: { 'application/json': { schema: AssessmentResponse } }, description: 'Assessment' },
            400: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Bad Request' },
            404: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Not Found' },
            401: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Unauthorized' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    (c: any) => individualImpairmentController.getAssessment(c)
)

// End of individual impairment routes
