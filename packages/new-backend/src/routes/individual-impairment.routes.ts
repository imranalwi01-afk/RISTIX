import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import type { AppContext } from '../app'
import { authMiddleware } from '../middleware'
import { individualImpairmentController } from '../controllers/individual-impairment.controller'

export const individualImpairmentRoutes: any = new OpenAPIHono<AppContext>()

individualImpairmentRoutes.use('*', authMiddleware)

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
        page: z.number(),
        limit: z.number(),
        total: z.number(),
        totalPages: z.number()
    }).optional()
}).openapi('WatchlistListResponse')

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
    accountId: z.number().int(),
    originalStage: z.number().int(),
    proposedStage: z.number().int(),
    justification: z.string(),
}).openapi('AddOverrideInput')

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
    scenarioCode: z.string(),
    scenarioName: z.string(),
    description: z.string().optional(),
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
    accountId: z.string(),
    periodDate: z.string(),
    cashflowAmount: z.number(),
    discountRate: z.number(),
    discountFactor: z.number().optional(),
    presentValue: z.number().optional()
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

const CreateBatchUploadSchema = z.object({
    fileName: z.string(),
    batchId: z.string().optional(),
    cashflows: z.array(z.object({
        accountId: z.string(),
        periodDate: z.string(),
        cashflowAmount: z.number(),
        discountRate: z.number().optional()
    }))
}).openapi('CreateBatchUploadInput')

// ============================================================================
// ROUTES
// ============================================================================

// --- WATCHLIST ---

individualImpairmentRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/watchlist',
        tags: ['Individual Impairment'],
        summary: 'Get Watchlist',
        request: {
            query: z.object({
                search: z.string().optional(),
                page: z.string().optional(),
                limit: z.string().optional(),
                // Filter object patterns for documentation
                'filter[stage]': z.string().optional(),
                'filter[assessment_status]': z.string().optional(),
                'filter[impaired_flag]': z.string().optional(),
                'filter[rating_code]': z.string().optional(),
                // Legacy support
                segment: z.string().optional(),
                status: z.string().optional(),
                offset: z.string().optional()
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

individualImpairmentRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/watchlist/summary',
        tags: ['Individual Impairment'],
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

individualImpairmentRoutes.openapi(
    createRoute({
        method: 'post',
        path: '/watchlist',
        tags: ['Individual Impairment'],
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

individualImpairmentRoutes.openapi(
    createRoute({
        method: 'delete',
        path: '/watchlist/{id}',
        tags: ['Individual Impairment'],
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

individualImpairmentRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/staging-analysis',
        tags: ['Individual Impairment'],
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

individualImpairmentRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/staging-summary',
        tags: ['Individual Impairment'],
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

individualImpairmentRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/{accountId}',
        tags: ['Individual Impairment'],
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

individualImpairmentRoutes.openapi(
    createRoute({
        method: 'post',
        path: '/assessment',
        tags: ['Individual Impairment'],
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

individualImpairmentRoutes.openapi(
    createRoute({
        method: 'post',
        path: '/assessment/{id}/submit',
        tags: ['Individual Impairment'],
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

individualImpairmentRoutes.openapi(
    createRoute({
        method: 'post',
        path: '/assessment/{id}/approve',
        tags: ['Individual Impairment'],
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

individualImpairmentRoutes.openapi(
    createRoute({
        method: 'post',
        path: '/assessment/{id}/reject',
        tags: ['Individual Impairment'],
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

individualImpairmentRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/overrides',
        tags: ['Individual Impairment'],
        summary: 'Get Overrides',
        request: {
            query: z.object({
                status: z.string().optional(),
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

individualImpairmentRoutes.openapi(
    createRoute({
        method: 'post',
        path: '/overrides',
        tags: ['Individual Impairment'],
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

// --- HISTORY ---

individualImpairmentRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/history',
        tags: ['Individual Impairment'],
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

individualImpairmentRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/assessment/{accountId}/history',
        tags: ['Individual Impairment'],
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

individualImpairmentRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/reports',
        tags: ['Individual Impairment'],
        summary: 'Get Reports',
        request: {
            query: z.object({
                reportPeriod: z.string().optional(),
                limit: z.string().optional(),
                offset: z.string().optional()
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

individualImpairmentRoutes.openapi(
    createRoute({
        method: 'post',
        path: '/reports',
        tags: ['Individual Impairment'],
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

individualImpairmentRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/scenarios',
        tags: ['Individual Impairment'],
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

individualImpairmentRoutes.openapi(
    createRoute({
        method: 'post',
        path: '/scenarios',
        tags: ['Individual Impairment'],
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

individualImpairmentRoutes.openapi(
    createRoute({
        method: 'put',
        path: '/scenarios/{id}/status',
        tags: ['Individual Impairment'],
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

individualImpairmentRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/dcf-uploads',
        tags: ['Individual Impairment'],
        summary: 'Get DCF Uploads',
        responses: {
            200: { content: { 'application/json': { schema: DcfUploadListResponse } }, description: 'Uploads' },
            401: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Unauthorized' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    (c: any) => individualImpairmentController.getDcfUploads(c)
)

individualImpairmentRoutes.openapi(
    createRoute({
        method: 'post',
        path: '/dcf/calculate',
        tags: ['Individual Impairment'],
        summary: 'Get DCF Calculations',
        responses: {
            200: { content: { 'application/json': { schema: DcfCalculationListResponse } }, description: 'Calculations' },
            401: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Unauthorized' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    (c: any) => individualImpairmentController.calculateDcf(c)
)

individualImpairmentRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/dcf-calculations',
        tags: ['Individual Impairment'],
        summary: 'Get DCF Calculations',
        responses: {
            200: { content: { 'application/json': { schema: DcfCalculationListResponse } }, description: 'Calculations' },
            401: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Unauthorized' },
            500: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Error' }
        }
    }),
    (c: any) => individualImpairmentController.getDcfCalculations(c)
)

individualImpairmentRoutes.openapi(
    createRoute({
        method: 'post',
        path: '/dcf-uploads',
        tags: ['Individual Impairment'],
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

individualImpairmentRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/dcf-uploads/{uploadId}/cashflows',
        tags: ['Individual Impairment'],
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

// End of individual impairment routes

