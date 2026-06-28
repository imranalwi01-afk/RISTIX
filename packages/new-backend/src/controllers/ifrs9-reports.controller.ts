import { Context } from 'hono';
import { ifrs9ReportsService } from '../services/ifrs9-reports.service';
import { buildErrorResponse } from '../lib/http/error-response';
import { reportDebugSettingsService } from '../services/report-debug-settings.service';
import {
    ListQueryValidationError,
    buildCursorPagination,
    buildListResponse,
    buildOffsetPagination,
    parseListQuery,
    type ListQueryConfig,
} from '../lib/http/list-query';

type ReportKey =
    | 'lifetime-pd-yearly'
    | 'lifetime-pd-monthly'
    | 'lifetime-pd-account-details'
    | 'lifetime-lgd'
    | 'ead-model'
    | 'ecl-result'
    | 'ecl-movement'
    | 'gca-movement'
    | 'nominative-report'

type ReportDebugCatalogEntry = {
    title: string
    sourceTables: string[]
    joins?: string[]
    filterKeys: string[]
    sqlPreview: string
}

// Helper: choose cursor or offset pagination based on query mode
function toPagination(query: import('../lib/http/list-query').ListQuery, result: { total?: number; hasMore?: boolean; nextCursor?: string | null; hasPreviousPage?: boolean }) {
    if (query.paginationMode === 'cursor') {
        return buildCursorPagination(query, {
            nextCursor: result.nextCursor ?? null,
            hasNextPage: result.hasMore ?? false,
            total: result.total,
        })
    }
    return buildOffsetPagination(query, result.total ?? 0)
}

const NOMINATIVE_LIST_QUERY_CONFIG: ListQueryConfig = {
    defaultLimit: 20,
    maxLimit: 500,
    paginationMode: 'cursor',
    defaultSort: [{ field: 'account_number', direction: 'asc' }],
    filterDefinitions: {
        prc_date: { field: 'prc_date', label: 'Processing Date', type: 'date', operators: ['equals', 'from', 'to'] },
        download_date: { field: 'download_date', label: 'Download Date', type: 'date', operators: ['from', 'to'] },
        group_segment: { field: 'group_segment', label: 'Group Segment', type: 'enum' },
        segment: { field: 'segment', label: 'Segment', type: 'enum' },
        stage: {
            field: 'stage',
            label: 'Stage',
            type: 'enum',
            options: [
                { label: 'Stage 1', value: '1' },
                { label: 'Stage 2', value: '2' },
                { label: 'Stage 3', value: '3' },
            ],
        },
        branch_code: { field: 'branch_code', label: 'Branch', type: 'enum' },
    },
    sortableColumns: [
        'account_number',
        'cif_name',
        'branch_code',
        'stage',
        'outstanding',
        'ecl_final_amt',
        'prc_date',
    ],
    filterAliases: {
        download_start_date: 'download_date.from',
        download_end_date: 'download_date.to',
    },
}

const LIFETIME_PD_DETAIL_QUERY_CONFIG: ListQueryConfig = {
    defaultLimit: 100,
    maxLimit: 500,
    paginationMode: 'cursor',
    defaultSort: [{ field: 'account_number', direction: 'asc' }],
    filterableColumns: ['prc_date', 'pd_config_id'],
    filterDefinitions: {
        prc_date: { field: 'prc_date', label: 'Processing Date', type: 'date', operators: ['equals', 'from', 'to'] },
        pd_config_id: { field: 'pd_config_id', label: 'PD Config', type: 'number', operators: ['equals', 'min', 'max'] },
    },
    sortableColumns: ['account_number', 'segment_id', 'stage', 'outstanding', 'pd_rate', 'ecl_amount'],
}

const LIFETIME_LGD_DETAIL_QUERY_CONFIG: ListQueryConfig = {
    defaultLimit: 100,
    maxLimit: 500,
    paginationMode: 'cursor',
    defaultSort: [{ field: 'account_number', direction: 'asc' }],
    filterableColumns: ['prc_date', 'lgd_config_id', 'lgd_method', 'model_id', 'segment_id', 'fl_flag'],
    filterDefinitions: {
        prc_date: { field: 'prc_date', label: 'Processing Date', type: 'date', operators: ['equals', 'from', 'to'] },
        lgd_config_id: { field: 'lgd_config_id', label: 'LGD Config', type: 'number', operators: ['equals', 'min', 'max'] },
        lgd_method: { field: 'lgd_method', label: 'LGD Method', type: 'number', operators: ['equals', 'min', 'max'] },
        model_id: { field: 'model_id', label: 'Model', type: 'number', operators: ['equals', 'min', 'max'] },
        segment_id: { field: 'segment_id', label: 'Segment', type: 'number', operators: ['equals', 'min', 'max'] },
        fl_flag: {
            field: 'fl_flag',
            label: 'FL Flag',
            type: 'boolean',
            options: [
                { label: 'Yes', value: true },
                { label: 'No', value: false },
            ],
        },
        account_number: { field: 'account_number', label: 'Account Number', type: 'text', operators: ['contains', 'equals'] },
        cif_name: { field: 'cif_name', label: 'CIF Name', type: 'text', operators: ['contains', 'equals'] },
        first_npl_date: { field: 'first_npl_date', label: 'First NPL Date', type: 'date', operators: ['equals', 'from', 'to'] },
        os_at_default: { field: 'os_at_default', label: 'OS At Default', type: 'number', operators: ['equals', 'min', 'max'] },
        lgd_rate: { field: 'lgd_rate', label: 'LGD Rate', type: 'number', operators: ['equals', 'min', 'max'] },
        recovery_rate: { field: 'recovery_rate', label: 'Recovery Rate', type: 'number', operators: ['equals', 'min', 'max'] },
        recovery_amount_pv: { field: 'recovery_amount_pv', label: 'Recovery Amount PV', type: 'number', operators: ['equals', 'min', 'max'] },
    },
    sortableColumns: [
        'account_number',
        'cif_name',
        'first_npl_date',
        'os_at_default',
        'lgd_rate',
        'recovery_rate',
        'recovery_amount_pv',
    ],
}

const ECL_RESULT_QUERY_CONFIG: ListQueryConfig = {
    defaultLimit: 100,
    maxLimit: 500,
    paginationMode: 'cursor',
    defaultSort: [{ field: 'segment_id', direction: 'asc' }, { field: 'stage', direction: 'asc' }],
    filterableColumns: ['prc_date', 'segment_id', 'stage'],
    filterDefinitions: {
        prc_date: { field: 'prc_date', label: 'Processing Date', type: 'date', operators: ['equals', 'from', 'to'] },
        segment_id: { field: 'segment_id', label: 'Segment', type: 'number', operators: ['equals', 'min', 'max'] },
        stage: {
            field: 'stage',
            label: 'Stage',
            type: 'enum',
            options: [
                { label: 'Stage 1', value: '1' },
                { label: 'Stage 2', value: '2' },
                { label: 'Stage 3', value: '3' },
            ],
        },
        branch_code: { field: 'branch_code', label: 'Branch', type: 'text', operators: ['contains', 'equals'] },
        group_segment: { field: 'group_segment', label: 'Group Segment', type: 'text', operators: ['contains', 'equals'] },
        segment: { field: 'segment', label: 'Segment Name', type: 'text', operators: ['contains', 'equals'] },
        sub_segment: { field: 'sub_segment', label: 'Sub Segment', type: 'text', operators: ['contains', 'equals'] },
        currency: { field: 'currency', label: 'Currency', type: 'text', operators: ['contains', 'equals'] },
        impaired_flag: { field: 'impaired_flag', label: 'Impaired Flag', type: 'boolean', options: [{ label: 'Yes', value: true }, { label: 'No', value: false }] },
        sicr_flag: { field: 'sicr_flag', label: 'SICR Flag', type: 'boolean', options: [{ label: 'Yes', value: true }, { label: 'No', value: false }] },
        account_count: { field: 'account_count', label: 'Account Count', type: 'number', operators: ['equals', 'min', 'max'] },
        outstanding: { field: 'outstanding', label: 'Outstanding', type: 'number', operators: ['equals', 'min', 'max'] },
        ecl_final_amt: { field: 'ecl_final_amt', label: 'Final ECL', type: 'number', operators: ['equals', 'min', 'max'] },
        ecl_coverage: { field: 'ecl_coverage', label: 'ECL Coverage', type: 'number', operators: ['equals', 'min', 'max'] },
    },
    sortableColumns: [
        'period',
        'branch_code',
        'segment_id',
        'group_segment',
        'segment',
        'sub_segment',
        'currency',
        'stage',
        'account_count',
        'outstanding',
        'accrued_interest',
        'ecl_ca_onbs_amt',
        'ecl_ca_offbs_amt',
        'ecl_ia_onbs_amt',
        'ecl_overlay_amt',
        'ecl_final_amt',
        'ecl_coverage',
        'unwinding_ca_amt',
        'unwinding_ia_amt',
        'unwinding_ia_sum_amt',
    ],
}

const EAD_MODEL_QUERY_CONFIG: ListQueryConfig = {
    defaultLimit: 100,
    maxLimit: 500,
    paginationMode: 'cursor',
    defaultSort: [{ field: 'tenor', direction: 'asc' }],
    filterableColumns: ['prc_date', 'ead_config_id', 'segment_id'],
    filterDefinitions: {
        prc_date: { field: 'prc_date', label: 'Processing Date', type: 'date', operators: ['equals', 'from', 'to'] },
        ead_config_id: { field: 'ead_config_id', label: 'EAD Config', type: 'number', operators: ['equals', 'min', 'max'] },
        segment_id: { field: 'segment_id', label: 'Segment', type: 'number', operators: ['equals', 'min', 'max'] },
        tenor: { field: 'tenor', label: 'Tenor', type: 'number', operators: ['equals', 'min', 'max'] },
        lt_month: { field: 'lt_month', label: 'LT/Month', type: 'number', operators: ['equals', 'min', 'max'] },
    },
    sortableColumns: ['tenor', 'lt_month'],
}

const MOVEMENT_QUERY_CONFIG: ListQueryConfig = {
    defaultLimit: 50,
    maxLimit: 200,
    paginationMode: 'cursor',
    defaultSort: [{ field: 'movement_order', direction: 'asc' }],
    filterableColumns: ['prc_date', 'segment_id', 'stage', 'group_segment'],
    filterDefinitions: {
        prc_date: { field: 'prc_date', label: 'Processing Date', type: 'date', operators: ['equals', 'from', 'to'] },
        segment_id: { field: 'segment_id', label: 'Segment', type: 'number', operators: ['equals', 'min', 'max'] },
        stage: {
            field: 'stage',
            label: 'Stage',
            type: 'enum',
            options: [
                { label: 'Stage 1', value: '1' },
                { label: 'Stage 2', value: '2' },
                { label: 'Stage 3', value: '3' },
            ],
        },
        group_segment: { field: 'group_segment', label: 'Group Segment', type: 'text', operators: ['contains', 'equals'] },
        movement_order: { field: 'movement_order', label: 'Movement Order', type: 'number', operators: ['equals', 'min', 'max'] },
        movement: { field: 'movement', label: 'Movement', type: 'text', operators: ['contains', 'equals'] },
        stage_1_collective: { field: 'stage_1_collective', label: 'Stage 1 Collective', type: 'number', operators: ['equals', 'min', 'max'] },
        stage_2_collective: { field: 'stage_2_collective', label: 'Stage 2 Collective', type: 'number', operators: ['equals', 'min', 'max'] },
        stage_3_collective: { field: 'stage_3_collective', label: 'Stage 3 Collective', type: 'number', operators: ['equals', 'min', 'max'] },
        stage_1_individual: { field: 'stage_1_individual', label: 'Stage 1 Individual', type: 'number', operators: ['equals', 'min', 'max'] },
        stage_2_individual: { field: 'stage_2_individual', label: 'Stage 2 Individual', type: 'number', operators: ['equals', 'min', 'max'] },
        stage_3_individual: { field: 'stage_3_individual', label: 'Stage 3 Individual', type: 'number', operators: ['equals', 'min', 'max'] },
        poci: { field: 'poci', label: 'POCI', type: 'number', operators: ['equals', 'min', 'max'] },
        total: { field: 'total', label: 'Total', type: 'number', operators: ['equals', 'min', 'max'] },
    },
    sortableColumns: [
        'prc_date',
        'movement_order',
        'movement',
        'stage_1_collective',
        'stage_2_collective',
        'stage_3_collective',
        'stage_1_individual',
        'stage_2_individual',
        'stage_3_individual',
        'poci',
        'total',
    ],
}

const getFilterText = (filters: Record<string, unknown>, key: string): string | undefined => {
    const value = filters[key]
    if (value === undefined || value === null) return undefined
    if (Array.isArray(value)) return value[0] === undefined ? undefined : String(value[0])
    return String(value)
}

const getFilterNumber = (filters: Record<string, unknown>, key: string): number | undefined => {
    const value = getFilterText(filters, key)
    if (value === undefined) return undefined
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : undefined
}

const listQueryBadRequest = (c: Context, error: ListQueryValidationError) =>
    c.json({
        ...buildErrorResponse(c, {
            error: error.message,
            message: error.message,
            code: 'INVALID_LIST_QUERY',
        }),
        details: error.details,
    }, 400)

const REPORT_DEBUG_CATALOG: Record<ReportKey, ReportDebugCatalogEntry> = {
    'lifetime-pd-yearly': {
        title: 'Lifetime PD Yearly',
        sourceTables: ['public.vw_frs9_pd_structure_yearly'],
        filterKeys: ['prc_date', 'pd_config_id', 'model_id', 'scenario_id'],
        sqlPreview: 'SELECT * FROM public.vw_frs9_pd_structure_yearly WHERE prc_date = :effectivePrcDate AND pd_config_id = :pdConfigId',
    },
    'lifetime-pd-monthly': {
        title: 'Lifetime PD Monthly',
        sourceTables: ['public.vw_frs9_pd_structure_monthly'],
        filterKeys: ['prc_date', 'pd_config_id', 'pd_model_id', 'scenario_id'],
        sqlPreview: 'SELECT * FROM public.vw_frs9_pd_structure_monthly WHERE prc_date = :effectivePrcDate AND pd_config_id = :pdConfigId',
    },
    'lifetime-pd-account-details': {
        title: 'Lifetime PD Account Details',
        sourceTables: ['public.frs9_imp_ca_result_d'],
        filterKeys: ['prc_date', 'pd_config_id', 'pd_method', 'scalar_id', 'fl_flag', 'page', 'limit'],
        sqlPreview: 'SELECT ... FROM public.frs9_imp_ca_result_d WHERE prc_date = :effectivePrcDate',
    },
    'lifetime-lgd': {
        title: 'Lifetime LGD',
        sourceTables: [
            'public.frs9_account_id',
            'public.frs9_imp_ca_lgd_data',
            'public.frs9_imp_ca_lgd_rec_d',
            'public.frs9_imp_ca_lgd_d',
            'public.frs9_imp_ca_lgd_h',
            'public.frs9_imp_ca_lgd_config',
        ],
        joins: [
            'public.frs9_account_id.account_id -> public.frs9_imp_ca_lgd_data.account_id',
            'public.frs9_imp_ca_lgd_data.account_id/lgd_config_id -> public.frs9_imp_ca_lgd_rec_d (recovery rows up to effective date)',
            'public.frs9_imp_ca_lgd_data.account_id/prc_date/lgd_config_id -> public.frs9_imp_ca_lgd_d',
            'public.frs9_imp_ca_lgd_data.prc_date/lgd_config_id/lgd_method -> public.frs9_imp_ca_lgd_h',
            'public.frs9_imp_ca_lgd_data.lgd_config_id -> public.frs9_imp_ca_lgd_config.pkid',
        ],
        filterKeys: ['prc_date', 'lgd_config_id', 'lgd_method', 'model_id', 'segment_id', 'fl_flag'],
        sqlPreview: 'SELECT ... FROM public.frs9_account_id A INNER JOIN public.frs9_imp_ca_lgd_data B ON A.account_id = B.account_id INNER JOIN public.frs9_imp_ca_lgd_rec_d C ON B.account_id = C.account_id AND B.lgd_config_id = C.lgd_config_id AND C.prc_date <= :effectivePrcDate WHERE B.prc_date <= :effectivePrcDate AND B.lgd_config_id = :lgdConfigId',
    },
    'ead-model': {
        title: 'EAD Model',
        sourceTables: ['public.frs9_imp_ca_ead', 'public.frs9_imp_ca_ead_paym_avg', 'public.frs9_account_id'],
        joins: ['public.frs9_imp_ca_ead -> public.frs9_imp_ca_ead_paym_avg', 'public.frs9_imp_ca_ead -> public.frs9_account_id'],
        filterKeys: ['prc_date', 'ead_config_id', 'segment_id', 'page', 'limit'],
        sqlPreview: 'SELECT ... FROM public.frs9_imp_ca_ead A LEFT JOIN public.frs9_account_id B ON ... WHERE A.prc_date = :effectivePrcDate',
    },
    'ecl-result': {
        title: 'ECL Result',
        sourceTables: ['public.frs9_ecl_summary'],
        filterKeys: ['prc_date', 'segment_id', 'stage', 'page', 'limit'],
        sqlPreview: 'SELECT ... FROM public.frs9_ecl_summary WHERE prc_date = :effectivePrcDate AND segment_id = :segmentId AND stage IN (:stageList) GROUP BY prc_date, branch_code, segment_id, group_segment, segment, sub_segment, currency, impaired_flag, impaired_status, bucket_id, stage',
    },
    'ecl-movement': {
        title: 'ECL Movement',
        sourceTables: ['public.frs9_imp_movement_data'],
        filterKeys: ['prc_date', 'segment_id', 'stage', 'group_segment'],
        sqlPreview: 'CALL public.sp_frs9_imp_movement_data(:requestedEomDate, \'M\', 0); SELECT ... FROM public.frs9_imp_movement_data WHERE prc_date = :effectivePrcDate AND group_segment = :resolvedGroupSegment',
    },
    'gca-movement': {
        title: 'GCA Movement',
        sourceTables: ['public.frs9_imp_movement_data'],
        filterKeys: ['prc_date', 'segment_id', 'stage', 'group_segment'],
        sqlPreview: 'CALL public.sp_frs9_imp_movement_data(:requestedEomDate, \'M\', 0); SELECT ... FROM public.frs9_imp_movement_data WHERE prc_date = :effectivePrcDate AND group_segment = :resolvedGroupSegment',
    },
    'nominative-report': {
        title: 'Nominative Report',
        sourceTables: ['public.frs9_nominative_output'],
        filterKeys: ['prc_date', 'download_start_date', 'download_end_date', 'segment', 'stage', 'branch_code', 'page', 'limit'],
        sqlPreview: 'SELECT n.* FROM public.frs9_nominative_output n WHERE n.prc_date = :effectivePrcDate',
    },
}

const getPermissions = (c: Context): string[] =>
    (((c.get('permissions') as string[]) || (c.get('userPermissions') as string[]) || [])
        .filter((item): item is string => typeof item === 'string'))

const canManageReportDebug = (c: Context): boolean => {
    const permissions = getPermissions(c)
    return permissions.includes('*')
        || permissions.includes('admin.system.manage')
        || permissions.includes('admin.maintenance.access')
        || permissions.includes('admin.super_admin')
}

const buildReportMeta = async (
    c: Context,
    startedAt: number,
    reportKey: ReportKey,
    filters: Record<string, unknown>,
    extras?: Record<string, unknown>,
) => {
    const meta: Record<string, unknown> = {
        timestamp: new Date().toISOString(),
        requestId: c.get('requestId') ?? '',
        database: 'legacy',
        responseTime: Date.now() - startedAt,
    }

    if (!canManageReportDebug(c)) {
        return meta
    }

    const config = await reportDebugSettingsService.getConfig()
    meta.debugEnabled = config.enabled

    if (!config.enabled) {
        return meta
    }

    const catalog = REPORT_DEBUG_CATALOG[reportKey]
    meta.debug = {
        reportKey,
        reportTitle: catalog.title,
        sourceTables: catalog.sourceTables,
        joins: catalog.joins ?? [],
        filterKeys: catalog.filterKeys,
        filtersApplied: filters,
        sqlPreview: catalog.sqlPreview,
        ...extras,
    }

    return meta
}

export const ifrs9ReportsController = {
    handleError: (c: Context, error: any) => {
        console.error('❌ [IFRS9] Controller error:', error);
        const message = error?.message || 'Internal server error';
        return c.json(
            buildErrorResponse(c, {
                error: message,
                message,
                code: 'REPORT_ERROR',
            }),
            500
        );
    },

    getMetadata: async (c: Context) => {
        return c.json({
            success: true,
            data: {
                reports: ['lifetime-pd-yearly', 'lifetime-pd-monthly', 'lifetime-lgd', 'ead-model', 'ecl-result', 'nominative-report'],
                last_update: new Date().toISOString()
            }
        });
    },

    getLifetimePDYearly: async (c: Context) => {
        try {
            const startedAt = Date.now();
            const tenantId = (c as any).get('tenantId');
            const page = Number(c.req.query('page') || 1);
            const limit = Number(c.req.query('limit') || 20);

            // Extract filter parameters
            const prc_date = c.req.query('prc_date') || '2022-10-31';
            const pd_config_id = c.req.query('pd_config_id') ? Number(c.req.query('pd_config_id')) : 1;
            const pd_method = c.req.query('pd_method') ? Number(c.req.query('pd_method')) : 1;
            const scalar_id = c.req.query('scalar_id') ? Number(c.req.query('scalar_id')) : undefined;
            const fl_flag = c.req.query('fl_flag') === 'true';

            const result = await ifrs9ReportsService.getLifetimePDYearly(
                tenantId,
                page,
                limit,
                { prc_date, pd_config_id, pd_method, scalar_id, fl_flag }
            );

            return c.json({
                success: true,
                data: result.data,
                pagination: {
                    page: result.page,
                    limit: limit,
                    total: result.total,
                    totalPages: result.totalPages
                },
                meta: await buildReportMeta(c, startedAt, 'lifetime-pd-yearly', { prc_date, pd_config_id, pd_method, scalar_id, fl_flag }, { effectivePrcDate: result.effectivePrcDate, rowCount: result.total }),
                effectivePrcDate: result.effectivePrcDate,
                message: result.total === 0 ? "No Lifetime PD Data available" : undefined
            });
        } catch (error: any) {
            return ifrs9ReportsController.handleError(c, error);
        }
    },

    getLifetimePDMonthly: async (c: Context) => {
        try {
            const startedAt = Date.now();
            const tenantId = (c as any).get('tenantId');
            const page = Number(c.req.query('page') || 1);
            const limit = Number(c.req.query('limit') || 20);

            // Extract filter parameters
            const prc_date = c.req.query('prc_date') || '2022-10-31';
            const pd_config_id = c.req.query('pd_config_id') ? Number(c.req.query('pd_config_id')) : 1;
            const pd_method = c.req.query('pd_method') ? Number(c.req.query('pd_method')) : 1;
            const scalar_id = c.req.query('scalar_id') ? Number(c.req.query('scalar_id')) : undefined;
            const fl_flag = c.req.query('fl_flag') === 'true';

            const result = await ifrs9ReportsService.getLifetimePDMonthly(
                tenantId,
                page,
                limit,
                { prc_date, pd_config_id, pd_method, scalar_id, fl_flag }
            );

            return c.json({
                success: true,
                data: result.data,
                pagination: {
                    page: result.page,
                    limit: limit,
                    total: result.total,
                    totalPages: result.totalPages
                },
                meta: await buildReportMeta(c, startedAt, 'lifetime-pd-monthly', { prc_date, pd_config_id, pd_method, scalar_id, fl_flag }, { effectivePrcDate: result.effectivePrcDate, rowCount: result.total }),
                effectivePrcDate: result.effectivePrcDate,
                message: result.total === 0 ? "No Lifetime PD Monthly Data available" : undefined
            });
        } catch (error: any) {
            return ifrs9ReportsController.handleError(c, error);
        }
    },

    getLifetimePDAccountDetails: async (c: Context) => {
        try {
            const startedAt = Date.now();
            const tenantId = (c as any).get('tenantId');
            const query = parseListQuery(c, LIFETIME_PD_DETAIL_QUERY_CONFIG);
            const prc_date = getFilterText(query.filters, 'prc_date') || c.req.query('prc_date') || '2022-10-31';
            const pd_config_id = getFilterNumber(query.filters, 'pd_config_id')
                ?? (c.req.query('pd_config_id') ? Number(c.req.query('pd_config_id')) : undefined);

            const result = await ifrs9ReportsService.getLifetimePDAccountDetails(
                tenantId,
                query.page ?? 1,
                query.limit,
                { prc_date, pd_config_id }
            );

            const response = buildListResponse(
                result.data,
                query,
                toPagination(query, result),
                { filterDefinitions: LIFETIME_PD_DETAIL_QUERY_CONFIG.filterDefinitions },
            );

            return c.json({
                ...response,
                meta: await buildReportMeta(c, startedAt, 'lifetime-pd-account-details', { prc_date, pd_config_id, page: query.page, limit: query.limit, sort: query.sort }, { effectivePrcDate: result.effectivePrcDate, rowCount: result.total }),
                effectivePrcDate: result.effectivePrcDate,
                message: result.total === 0 ? "No Lifetime PD Account Details available" : undefined
            });
        } catch (error: any) {
            if (error instanceof ListQueryValidationError) return listQueryBadRequest(c, error)
            return ifrs9ReportsController.handleError(c, error);
        }
    },

    getLifetimeLGD: async (c: Context) => {
        try {
            const startedAt = Date.now();
            const tenantId = (c as any).get('tenantId');
            const query = parseListQuery(c, LIFETIME_LGD_DETAIL_QUERY_CONFIG);
            const prc_date = getFilterText(query.filters, 'prc_date') || '2023-12-31';
            const lgd_config_id = getFilterNumber(query.filters, 'lgd_config_id');
            const lgd_method = getFilterNumber(query.filters, 'lgd_method');
            const model_id = getFilterNumber(query.filters, 'model_id');
            const segment_id = getFilterNumber(query.filters, 'segment_id');
            const flFlagFilter = query.filters.fl_flag;
            const fl_flag = typeof flFlagFilter === 'boolean' ? flFlagFilter : undefined;

            const result = await ifrs9ReportsService.getLifetimeLGDDetail(
                tenantId,
                query.page ?? 1,
                query.limit,
                {
                    prc_date,
                    lgd_config_id,
                    lgd_method,
                    model_id,
                    segment_id,
                    fl_flag,
                    search: query.search,
                    sort: query.sort,
                    detailFilters: query.filters,
                }
            );

            if (result.total === 0) {
                const summary = await ifrs9ReportsService.getLifetimeLGDSummary(
                    tenantId,
                    1,
                    200,
                    { prc_date, lgd_config_id, lgd_method, model_id }
                );

                if (summary.total > 0) {
                    const response = buildListResponse(
                        summary.data,
                        query,
                        toPagination(query, { total: summary.total }),
                        { filterDefinitions: LIFETIME_LGD_DETAIL_QUERY_CONFIG.filterDefinitions },
                    );

                    return c.json({
                        ...response,
                        meta: await buildReportMeta(c, startedAt, 'lifetime-lgd', { prc_date, lgd_config_id, lgd_method, model_id, segment_id, fl_flag }, { effectivePrcDate: summary.effectivePrcDate, rowCount: summary.total, detailFallback: 'summary' }),
                        effectivePrcDate: summary.effectivePrcDate,
                        message: "Lifetime LGD detail is not available; showing summary rows instead"
                    });
                }
            }

            const response = buildListResponse(
                result.data,
                query,
                toPagination(query, result),
                { filterDefinitions: LIFETIME_LGD_DETAIL_QUERY_CONFIG.filterDefinitions },
            );

            return c.json({
                ...response,
                meta: await buildReportMeta(c, startedAt, 'lifetime-lgd', { prc_date, lgd_config_id, lgd_method, model_id, segment_id, fl_flag }, { effectivePrcDate: result.effectivePrcDate, rowCount: result.total }),
                effectivePrcDate: result.effectivePrcDate,
                message: result.total === 0 ? "No Lifetime LGD Data available" : undefined
            });
        } catch (error: any) {
            if (error instanceof ListQueryValidationError) return listQueryBadRequest(c, error)
            return ifrs9ReportsController.handleError(c, error);
        }
    },

    getLifetimeLGDSummary: async (c: Context) => {
        try {
            const startedAt = Date.now();
            const tenantId = (c as any).get('tenantId');

            const prc_date = c.req.query('prc_date') || '2023-12-31';
            const lgd_config_id = c.req.query('lgd_config_id') ? Number(c.req.query('lgd_config_id')) : undefined;
            const lgd_method = c.req.query('lgd_method') ? Number(c.req.query('lgd_method')) : undefined;
            const model_id = c.req.query('model_id') ? Number(c.req.query('model_id')) : undefined;
            const segment_id = c.req.query('segment_id') ? Number(c.req.query('segment_id')) : undefined;
            const flFlagFilter = c.req.query('fl_flag');
            const fl_flag = flFlagFilter === 'true' ? true : flFlagFilter === 'false' ? false : undefined;

            const result = await ifrs9ReportsService.getLifetimeLGDSummary(
                tenantId,
                1,
                200,
                { prc_date, lgd_config_id, lgd_method, model_id, segment_id, fl_flag }
            );

            return c.json({
                success: true,
                data: result.data,
                meta: await buildReportMeta(
                    c,
                    startedAt,
                    'lifetime-lgd',
                    { prc_date, lgd_config_id, lgd_method, model_id, segment_id, fl_flag },
                    {
                        effectivePrcDate: (result as any).effectivePrcDate ?? null,
                        rowCount: Array.isArray(result.data) ? result.data.length : 0,
                        variant: 'summary',
                    }
                ),
                effectivePrcDate: (result as any).effectivePrcDate ?? null,
                message: (!result.data || result.data.length === 0) ? 'No Lifetime LGD Summary Data available' : undefined
            });
        } catch (error: any) {
            return ifrs9ReportsController.handleError(c, error);
        }
    },

    getEADModel: async (c: Context) => {
        try {
            const startedAt = Date.now();
            const tenantId = (c as any).get('tenantId');
            const query = parseListQuery(c, EAD_MODEL_QUERY_CONFIG);
            const prc_date = getFilterText(query.filters, 'prc_date') || '2020-12-31';
            const ead_config_id = getFilterNumber(query.filters, 'ead_config_id');
            const segment_id = getFilterNumber(query.filters, 'segment_id');

            const result = await ifrs9ReportsService.getEADModel(
                tenantId,
                query.page ?? 1,
                query.limit,
                {
                    prc_date,
                    ead_config_id,
                    segment_id,
                    search: query.search,
                    sort: query.sort,
                    detailFilters: query.filters,
                }
            );

            const response = buildListResponse(
                result.data,
                query,
                toPagination(query, result),
                { filterDefinitions: EAD_MODEL_QUERY_CONFIG.filterDefinitions },
            );

            return c.json({
                ...response,
                meta: await buildReportMeta(c, startedAt, 'ead-model', { prc_date, ead_config_id, segment_id, page: query.page, limit: query.limit, sort: query.sort }, { effectivePrcDate: (result as any).effectivePrcDate ?? null, rowCount: result.total }),
                effectivePrcDate: (result as any).effectivePrcDate ?? null,
                message: result.total === 0 ? "No EAD Model Data available" : undefined
            });
        } catch (error: any) {
            if (error instanceof ListQueryValidationError) return listQueryBadRequest(c, error)
            return ifrs9ReportsController.handleError(c, error);
        }
    },

    getEADModelSummary: async (c: Context) => {
        try {
            const startedAt = Date.now();
            const tenantId = (c as any).get('tenantId');

            // Extract filter parameters
            const prc_date = c.req.query('prc_date') || '2023-12-31';
            const ead_config_id = c.req.query('ead_config_id') ? Number(c.req.query('ead_config_id')) : undefined;
            const segment_id = c.req.query('segment_id') ? Number(c.req.query('segment_id')) : undefined;

            const result = await ifrs9ReportsService.getEADModelSummary(
                tenantId,
                { prc_date, ead_config_id, segment_id }
            );

            return c.json({
                success: true,
                data: result.data,
                meta: await buildReportMeta(c, startedAt, 'ead-model', { prc_date, ead_config_id, segment_id }, { effectivePrcDate: (result as any).effectivePrcDate ?? null, rowCount: Array.isArray(result.data) ? result.data.length : 0, variant: 'summary' }),
                effectivePrcDate: (result as any).effectivePrcDate ?? null,
                message: (!result.data || result.data.length === 0) ? "No EAD Model Summary Data available" : undefined
            });
        } catch (error: any) {
            return ifrs9ReportsController.handleError(c, error);
        }
    },

    getECLResult: async (c: Context) => {
        try {
            const startedAt = Date.now();
            const tenantId = (c as any).get('tenantId');
            const query = parseListQuery(c, ECL_RESULT_QUERY_CONFIG);
            const prc_date = getFilterText(query.filters, 'prc_date') || '2023-12-31';
            const segment_id = getFilterNumber(query.filters, 'segment_id');
            const stageFilter = query.filters.stage;
            const stage = Array.isArray(stageFilter)
                ? stageFilter.map(String)
                : stageFilter !== undefined
                    ? [String(stageFilter)]
                    : undefined;
            const accountStatusFilter = query.filters.account_status;
            const account_status = Array.isArray(accountStatusFilter)
                ? accountStatusFilter.map(String)
                : accountStatusFilter !== undefined
                    ? [String(accountStatusFilter)]
                    : undefined;

            const result = await ifrs9ReportsService.getECLResult(
                tenantId,
                query.page ?? 1,
                query.limit,
                {
                    prc_date,
                    segment_id,
                    stage,
                    account_status,
                    search: query.search,
                    sort: query.sort,
                    detailFilters: query.filters,
                }
            );

            const response = buildListResponse(
                result.data,
                query,
                toPagination(query, result),
                { filterDefinitions: ECL_RESULT_QUERY_CONFIG.filterDefinitions },
            );

            return c.json({
                ...response,
                meta: await buildReportMeta(c, startedAt, 'ecl-result', { prc_date, segment_id, stage, page: query.page, limit: query.limit, sort: query.sort }, {
                    effectivePrcDate: result.effectivePrcDate,
                    rowCount: result.total,
                    ...(result as any).debug,
                }),
                effectivePrcDate: result.effectivePrcDate,
                message: result.total === 0
                    ? `No ECL Result data found in public.frs9_ecl_summary for snapshot ${result.effectivePrcDate ?? prc_date}.`
                    : undefined
            });
        } catch (error: any) {
            if (error instanceof ListQueryValidationError) return listQueryBadRequest(c, error)
            return ifrs9ReportsController.handleError(c, error);
        }
    },

    getECLMovement: async (c: Context) => {
        try {
            const startedAt = Date.now();
            const tenantId = (c as any).get('tenantId');
            const query = parseListQuery(c, MOVEMENT_QUERY_CONFIG);
            const prc_date = getFilterText(query.filters, 'prc_date') || '2023-12-31';
            const segment_id = getFilterNumber(query.filters, 'segment_id');
            const stageFilter = query.filters.stage;
            const stage = Array.isArray(stageFilter)
                ? stageFilter.map(String)
                : stageFilter !== undefined
                    ? [String(stageFilter)]
                    : undefined;
            const group_segment = getFilterText(query.filters, 'group_segment') || undefined;
            const result = await ifrs9ReportsService.getECLMovement(
                tenantId,
                query.page ?? 1,
                query.limit,
                { prc_date, segment_id, stage, group_segment, search: query.search, sort: query.sort, detailFilters: query.filters }
            );
            const response = buildListResponse(
                result.data,
                query,
                toPagination(query, result),
                { filterDefinitions: MOVEMENT_QUERY_CONFIG.filterDefinitions },
            );
            return c.json({
                ...response,
                meta: await buildReportMeta(c, startedAt, 'ecl-movement', { prc_date, segment_id, stage, group_segment, page: query.page, limit: query.limit, sort: query.sort }, { effectivePrcDate: (result as any).effectivePrcDate, rowCount: result.total ?? 0 }),
                effectivePrcDate: (result as any).effectivePrcDate,
                message: (result.total ?? 0) === 0 ? "No ECL Movement Data available" : undefined
            });
        } catch (error: any) {
            if (error instanceof ListQueryValidationError) return listQueryBadRequest(c, error)
            return ifrs9ReportsController.handleError(c, error);
        }
    },

    getGCAMovement: async (c: Context) => {
        try {
            const startedAt = Date.now();
            const tenantId = (c as any).get('tenantId');
            const query = parseListQuery(c, MOVEMENT_QUERY_CONFIG);
            const prc_date = getFilterText(query.filters, 'prc_date') || '2023-12-31';
            const segment_id = getFilterNumber(query.filters, 'segment_id');
            const stageFilter = query.filters.stage;
            const stage = Array.isArray(stageFilter)
                ? stageFilter.map(String)
                : stageFilter !== undefined
                    ? [String(stageFilter)]
                    : undefined;
            const group_segment = getFilterText(query.filters, 'group_segment') || undefined;
            const result = await ifrs9ReportsService.getGCAMovement(
                tenantId,
                query.page ?? 1,
                query.limit,
                { prc_date, segment_id, stage, group_segment, search: query.search, sort: query.sort, detailFilters: query.filters }
            );
            const response = buildListResponse(
                result.data,
                query,
                toPagination(query, result),
                { filterDefinitions: MOVEMENT_QUERY_CONFIG.filterDefinitions },
            );
            return c.json({
                ...response,
                meta: await buildReportMeta(c, startedAt, 'gca-movement', { prc_date, segment_id, stage, group_segment, page: query.page, limit: query.limit, sort: query.sort }, { effectivePrcDate: (result as any).effectivePrcDate, rowCount: result.total ?? 0 }),
                effectivePrcDate: (result as any).effectivePrcDate,
                message: (result.total ?? 0) === 0 ? "No GCA Movement Data available" : undefined
            });
        } catch (error: any) {
            if (error instanceof ListQueryValidationError) return listQueryBadRequest(c, error)
            return ifrs9ReportsController.handleError(c, error);
        }
    },

    getNominativeReport: async (c: Context) => {
        try {
            const startedAt = Date.now();
            const tenantId = (c as any).get('tenantId');
            const query = parseListQuery(c, NOMINATIVE_LIST_QUERY_CONFIG);
            // Extract filter parameters
            const prc_date = getFilterText(query.filters, 'prc_date') || c.req.query('prc_date') || '2023-12-31';
            const download_start_date = getFilterText(query.filters, 'download_date.from') || c.req.query('download_start_date') || undefined;
            const download_end_date = getFilterText(query.filters, 'download_date.to') || c.req.query('download_end_date') || undefined;
            const group_segment = c.req.queries('group_segment')
                || c.req.queries('group_segment[]')
                || (query.filters.group_segment ? [String(query.filters.group_segment)] : undefined)
                || (c.req.query('group_segment[]') ? [c.req.query('group_segment[]')!] : undefined)
                || (c.req.query('group_segment') ? [c.req.query('group_segment')!] : undefined);
            const segment = c.req.queries('segment')
                || c.req.queries('segment[]')
                || (query.filters.segment ? [String(query.filters.segment)] : undefined)
                || (c.req.query('segment[]') ? [c.req.query('segment[]')!] : undefined)
                || (c.req.query('segment') ? [c.req.query('segment')!] : undefined);
            const stage = c.req.queries('stage')
                || c.req.queries('stage[]')
                || (query.filters.stage ? [String(query.filters.stage)] : undefined)
                || (c.req.query('stage[]') ? [c.req.query('stage[]')!] : undefined)
                || (c.req.query('stage') ? [c.req.query('stage')!] : undefined);
            const branch_code = c.req.queries('branch_code')
                || c.req.queries('branch_code[]')
                || (query.filters.branch_code ? [String(query.filters.branch_code)] : undefined)
                || (c.req.query('branch_code[]') ? [c.req.query('branch_code[]')!] : undefined)
                || (c.req.query('branch_code') ? [c.req.query('branch_code')!] : undefined);
            const result = await ifrs9ReportsService.getNominativeReport(
                tenantId,
                query.page ?? 1,
                query.limit,
                {
                    prc_date,
                    download_start_date,
                    download_end_date,
                    group_segment,
                    segment,
                    stage,
                    branch_code,
                    cursor: query.cursor,
                    paginationMode: query.paginationMode,
                    sort: query.sort,
                }
            );
            const pagination = query.paginationMode === 'cursor'
                ? buildCursorPagination(query, {
                    nextCursor: result.nextCursor,
                    previousCursor: result.previousCursor,
                    hasNextPage: Boolean(result.hasNextPage),
                    hasPreviousPage: Boolean(result.hasPreviousPage),
                    total: result.total,
                })
                : buildOffsetPagination(query, result.total ?? 0);
            const response = buildListResponse(
                result.data,
                query,
                pagination,
                { filterDefinitions: NOMINATIVE_LIST_QUERY_CONFIG.filterDefinitions },
            );

            return c.json({
                ...response,
                meta: await buildReportMeta(c, startedAt, 'nominative-report', { prc_date, download_start_date, download_end_date, group_segment, segment, stage, branch_code, page: query.page, limit: query.limit, sort: query.sort }, { effectivePrcDate: result.effectivePrcDate, rowCount: result.total }),
                summary: result.summary,
                effectivePrcDate: result.effectivePrcDate,
                message: result.total === 0 ? "No Nominative Report Data available" : undefined
            });
        } catch (error: any) {
            if (error instanceof ListQueryValidationError) return listQueryBadRequest(c, error)
            return ifrs9ReportsController.handleError(c, error);
        }
    },

    getNominativeAvailableDates: async (c: Context) => {
        try {
            const startedAt = Date.now();
            const tenantId = (c as any).get('tenantId');
            const download_start_date = c.req.query('download_start_date') || undefined;
            const download_end_date = c.req.query('download_end_date') || undefined;
            const limit = c.req.query('limit') ? Number(c.req.query('limit')) : undefined;

            const result = await ifrs9ReportsService.getNominativeAvailableDates(
                tenantId,
                { download_start_date, download_end_date, limit }
            );

            return c.json({
                success: true,
                data: result.data,
                meta: await buildReportMeta(c, startedAt, 'nominative-report', { download_start_date, download_end_date, limit }, { variant: 'available-dates', rowCount: Array.isArray(result.data) ? result.data.length : 0 })
            });
        } catch (error: any) {
            console.error('❌ [IFRS9] Error in getNominativeAvailableDates:', error);
            return c.json({ success: false, message: error.message }, 500);
        }
    },

    getDebugConfig: async (c: Context) => {
        const config = await reportDebugSettingsService.getConfig()
        return c.json({
            success: true,
            data: config,
        })
    },

    getProcessingDate: async (c: Context) => {
        try {
            const { legacyDb } = await import('../config/database');
            const { frs9PrcDate } = await import('../db/schema/legacy');
            const { desc } = await import('drizzle-orm');
            const row = await legacyDb.select({ currdate: frs9PrcDate.currdate }).from(frs9PrcDate).orderBy(desc(frs9PrcDate.currdate)).limit(1);
            return c.json({
                success: true,
                data: { prc_date: row[0]?.currdate ?? null }
            });
        } catch (error: any) {
            console.error('❌ [IFRS9] Error in getProcessingDate:', error);
            return c.json({ success: false, message: error.message }, 500);
        }
    },

    updateDebugConfig: async (c: Context) => {
        try {
            if (!canManageReportDebug(c)) {
                return c.json(
                    buildErrorResponse(c, {
                        error: 'Access denied',
                        message: 'Only administrators can manage report debug settings.',
                        code: 'FORBIDDEN',
                    }),
                    403,
                )
            }

            const body = await c.req.json()
            const userId = String(c.get('userId') || 'system')
            const config = await reportDebugSettingsService.setEnabled(Boolean(body?.enabled), userId)

            return c.json({
                success: true,
                data: config,
                message: `Report debug is now ${config.enabled ? 'enabled' : 'disabled'}.`,
            })
        } catch (error: any) {
            return ifrs9ReportsController.handleError(c, error)
        }
    },

    exportReport: async (c: Context) => {
        try {
            const tenantId = (c as any).get('tenantId');
            const body = await c.req.json().catch(() => ({}));
            const reportType = body.reportType || c.req.query('reportType') || 'ecl-result';
            const format = body.format || c.req.query('format') || 'csv';
            const prc_date = body.prc_date || c.req.query('prc_date') || '2023-12-31';

            const EXPORT_LIMIT = 10000;
            let data: any[] = [];

            switch (reportType) {
                case 'lifetime-pd-yearly': {
                    const result = await ifrs9ReportsService.getLifetimePDYearly(tenantId, 1, EXPORT_LIMIT, { prc_date });
                    data = result.data || [];
                    break;
                }
                case 'lifetime-pd-monthly': {
                    const result = await ifrs9ReportsService.getLifetimePDMonthly(tenantId, 1, EXPORT_LIMIT, { prc_date });
                    data = result.data || [];
                    break;
                }
                case 'lifetime-pd-account-details': {
                    const result = await ifrs9ReportsService.getLifetimePDAccountDetails(tenantId, 1, EXPORT_LIMIT, { prc_date });
                    data = result.data || [];
                    break;
                }
                case 'ecl-result': {
                    const result = await ifrs9ReportsService.getECLResult(tenantId, 1, EXPORT_LIMIT, { prc_date });
                    data = result.data || [];
                    break;
                }
                case 'nominative-report': {
                    const result = await ifrs9ReportsService.getNominativeReport(tenantId, 1, EXPORT_LIMIT, prc_date);
                    data = result.data || [];
                    break;
                }
                default:
                    return c.json({
                        success: false,
                        message: `Unknown report type: ${reportType}. Valid types: lifetime-pd-yearly, lifetime-pd-monthly, lifetime-pd-account-details, ecl-result, nominative-report`,
                    }, 400);
            }

            if (format === 'csv') {
                if (data.length === 0) {
                    return c.text('No data available for export', 200, {
                        'Content-Type': 'text/csv',
                    });
                }
                const headers = Object.keys(data[0]);
                const csvRows = data.map(row =>
                    headers.map(header => {
                        const value = row[header];
                        if (value === null || value === undefined) return '';
                        if (typeof value === 'object') return JSON.stringify(value);
                        return `"${String(value).replace(/"/g, '""')}"`;
                    }).join(',')
                );
                const csv = [headers.join(','), ...csvRows].join('\n');
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                return c.text(csv, 200, {
                    'Content-Type': 'text/csv',
                    'Content-Disposition': `attachment; filename="${reportType}-export-${timestamp}.csv"`,
                });
            }

            return c.json({
                success: true,
                data,
                total: data.length,
                reportType,
            });
        } catch (error: any) {
            return ifrs9ReportsController.handleError(c, error);
        }
    }
};
