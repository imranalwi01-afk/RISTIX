import { Context } from 'hono';
import { ifrs9ReportsService } from '../services/ifrs9-reports.service';
import { buildErrorResponse } from '../lib/http/error-response';
import { reportDebugSettingsService } from '../services/report-debug-settings.service';

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

const REPORT_DEBUG_CATALOG: Record<ReportKey, ReportDebugCatalogEntry> = {
    'lifetime-pd-yearly': {
        title: 'Lifetime PD Yearly',
        sourceTables: ['public.frs9_imp_ca_pd_structure'],
        filterKeys: ['prc_date', 'pd_config_id', 'pd_method', 'scalar_id', 'fl_flag'],
        sqlPreview: 'SELECT ... FROM public.frs9_imp_ca_pd_structure WHERE prc_date = :effectivePrcDate AND pd_config_id = :pdConfigId AND pd_method = :pdMethod',
    },
    'lifetime-pd-monthly': {
        title: 'Lifetime PD Monthly',
        sourceTables: ['public.frs9_imp_ca_pd_structure'],
        filterKeys: ['prc_date', 'pd_config_id', 'pd_method', 'scalar_id', 'fl_flag'],
        sqlPreview: 'SELECT ... FROM public.frs9_imp_ca_pd_structure WHERE prc_date = :effectivePrcDate AND pd_config_id = :pdConfigId AND pd_method = :pdMethod',
    },
    'lifetime-pd-account-details': {
        title: 'Lifetime PD Account Details',
        sourceTables: ['public.frs9_imp_ca_result_d'],
        filterKeys: ['prc_date', 'pd_config_id', 'pd_method', 'scalar_id', 'fl_flag', 'page', 'limit'],
        sqlPreview: 'SELECT ... FROM public.frs9_imp_ca_result_d WHERE prc_date = :effectivePrcDate',
    },
    'lifetime-lgd': {
        title: 'Lifetime LGD',
        sourceTables: ['public.frs9_imp_ca_lgd_h', 'public.frs9_imp_ca_lgd_rec_d', 'public.frs9_param_segment_h'],
        joins: ['public.frs9_imp_ca_lgd_h -> public.frs9_imp_ca_lgd_rec_d', 'public.frs9_imp_ca_lgd_h -> public.frs9_param_segment_h'],
        filterKeys: ['prc_date', 'lgd_config_id', 'lgd_method', 'model_id', 'segment_id', 'fl_flag'],
        sqlPreview: 'SELECT ... FROM public.frs9_imp_ca_lgd_h B LEFT JOIN public.frs9_imp_ca_lgd_rec_d A ON ... WHERE B.prc_date = :effectivePrcDate',
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
        sourceTables: ['public.frs9_imp_ca_result_h', 'public.frs9_master_account'],
        joins: ['public.frs9_imp_ca_result_h.account_id -> public.frs9_master_account.account_id'],
        filterKeys: ['prc_date', 'segment_id', 'stage', 'page', 'limit'],
        sqlPreview: 'SELECT ... FROM public.frs9_imp_ca_result_h r LEFT JOIN public.frs9_master_account ma ON ma.prc_date = r.prc_date AND ma.account_id = r.account_id WHERE r.prc_date = :effectivePrcDate',
    },
    'ecl-movement': {
        title: 'ECL Movement',
        sourceTables: ['public.frs9_imp_movement_data'],
        filterKeys: ['prc_date', 'segment_id', 'stage', 'group_segment'],
        sqlPreview: 'SELECT ... FROM public.frs9_imp_movement_data WHERE prc_date = :effectivePrcDate',
    },
    'gca-movement': {
        title: 'GCA Movement',
        sourceTables: ['public.frs9_imp_movement_data'],
        filterKeys: ['prc_date', 'segment_id', 'stage', 'group_segment'],
        sqlPreview: 'SELECT ... FROM public.frs9_imp_movement_data WHERE prc_date = :effectivePrcDate',
    },
    'nominative-report': {
        title: 'Nominative Report',
        sourceTables: ['public.frs9_imp_nominative', 'public.frs9_master_account'],
        joins: ['public.frs9_imp_nominative.account_number -> public.frs9_master_account.account_number'],
        filterKeys: ['prc_date', 'download_start_date', 'download_end_date', 'group_segment', 'segment', 'stage', 'branch_code', 'page', 'limit'],
        sqlPreview: 'SELECT ... FROM public.frs9_imp_nominative n LEFT JOIN public.frs9_master_account ma ON ... WHERE n.prc_date = :effectivePrcDate',
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
            const page = Number(c.req.query('page') || 1);
            const limit = Number(c.req.query('limit') || 100);

            // Extract filter parameters
            const prc_date = c.req.query('prc_date') || '2022-10-31';
            const pd_config_id = c.req.query('pd_config_id') ? Number(c.req.query('pd_config_id')) : undefined;

            const result = await ifrs9ReportsService.getLifetimePDAccountDetails(
                tenantId,
                page,
                limit,
                { prc_date, pd_config_id }
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
                meta: await buildReportMeta(c, startedAt, 'lifetime-pd-account-details', { prc_date, pd_config_id, page, limit }, { effectivePrcDate: result.effectivePrcDate, rowCount: result.total }),
                effectivePrcDate: result.effectivePrcDate,
                message: result.total === 0 ? "No Lifetime PD Account Details available" : undefined
            });
        } catch (error: any) {
            return ifrs9ReportsController.handleError(c, error);
        }
    },

    getLifetimeLGD: async (c: Context) => {
        try {
            const startedAt = Date.now();
            const tenantId = (c as any).get('tenantId');
            const page = Number(c.req.query('page') || 1);
            const limit = Number(c.req.query('limit') || 20);

            // Extract filter parameters
            const prc_date = c.req.query('prc_date') || '2023-12-31';
            const lgd_config_id = c.req.query('lgd_config_id') ? Number(c.req.query('lgd_config_id')) : undefined;
            const lgd_method = c.req.query('lgd_method') ? Number(c.req.query('lgd_method')) : undefined;
            const model_id = c.req.query('model_id') ? Number(c.req.query('model_id')) : undefined;
            const segment_id = c.req.query('segment_id') ? Number(c.req.query('segment_id')) : undefined;
            const fl_flag = c.req.query('fl_flag') === 'true' ? true : c.req.query('fl_flag') === 'false' ? false : undefined;

            const result = await ifrs9ReportsService.getLifetimeLGDDetail(
                tenantId,
                page,
                limit,
                { prc_date, lgd_config_id, lgd_method, model_id, segment_id, fl_flag }
            );

            if (result.total === 0) {
                const summary = await ifrs9ReportsService.getLifetimeLGDSummary(
                    tenantId,
                    1,
                    200,
                    { prc_date, lgd_config_id, lgd_method, model_id }
                );

                if (summary.total > 0) {
                    return c.json({
                        success: true,
                        data: summary.data,
                        pagination: {
                            page: summary.page,
                            limit: summary.data.length,
                            total: summary.total,
                            totalPages: summary.totalPages
                        },
                        meta: await buildReportMeta(c, startedAt, 'lifetime-lgd', { prc_date, lgd_config_id, lgd_method, model_id, segment_id, fl_flag }, { effectivePrcDate: summary.effectivePrcDate, rowCount: summary.total, detailFallback: 'summary' }),
                        effectivePrcDate: summary.effectivePrcDate,
                        message: "Lifetime LGD detail is not available; showing summary rows instead"
                    });
                }
            }

            return c.json({
                success: true,
                data: result.data,
                pagination: {
                    page: result.page,
                    limit: limit,
                    total: result.total,
                    totalPages: result.totalPages
                },
                meta: await buildReportMeta(c, startedAt, 'lifetime-lgd', { prc_date, lgd_config_id, lgd_method, model_id, segment_id, fl_flag }, { effectivePrcDate: result.effectivePrcDate, rowCount: result.total }),
                effectivePrcDate: result.effectivePrcDate,
                message: result.total === 0 ? "No Lifetime LGD Data available" : undefined
            });
        } catch (error: any) {
            return ifrs9ReportsController.handleError(c, error);
        }
    },

    getEADModel: async (c: Context) => {
        try {
            const startedAt = Date.now();
            const tenantId = (c as any).get('tenantId');
            const page = Number(c.req.query('page') || 1);
            const limit = Number(c.req.query('limit') || 20);

            // Extract filter parameters
            const prc_date = c.req.query('prc_date') || '2020-12-31';
            const ead_config_id = c.req.query('ead_config_id') ? Number(c.req.query('ead_config_id')) : undefined;
            const segment_id = c.req.query('segment_id') ? Number(c.req.query('segment_id')) : undefined;

            const result = await ifrs9ReportsService.getEADModel(
                tenantId,
                page,
                limit,
                { prc_date, ead_config_id, segment_id }
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
                meta: await buildReportMeta(c, startedAt, 'ead-model', { prc_date, ead_config_id, segment_id, page, limit }, { effectivePrcDate: (result as any).effectivePrcDate ?? null, rowCount: result.total }),
                effectivePrcDate: (result as any).effectivePrcDate ?? null,
                message: result.total === 0 ? "No EAD Model Data available" : undefined
            });
        } catch (error: any) {
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
            const page = Number(c.req.query('page') || 1);
            const limit = Number(c.req.query('limit') || 20);

            // Extract filter parameters matching SQL script
            const prc_date = c.req.query('prc_date') || '2023-12-31';
            const segment_id = c.req.query('segment_id') ? Number(c.req.query('segment_id')) : undefined;
            const stage = c.req.queries('stage') || (c.req.query('stage') ? [c.req.query('stage')!] : undefined);

            const result = await ifrs9ReportsService.getECLResult(
                tenantId,
                page,
                limit,
                { prc_date, segment_id, stage }
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
                meta: await buildReportMeta(c, startedAt, 'ecl-result', { prc_date, segment_id, stage, page, limit }, {
                    effectivePrcDate: result.effectivePrcDate,
                    rowCount: result.total,
                    ...(result as any).debug,
                }),
                effectivePrcDate: result.effectivePrcDate,
                message: result.total === 0
                    ? `No ECL Result data found in public.frs9_imp_ca_result_h for snapshot ${result.effectivePrcDate ?? prc_date}.`
                    : undefined
            });
        } catch (error: any) {
            return ifrs9ReportsController.handleError(c, error);
        }
    },

    getECLMovement: async (c: Context) => {
        try {
            const startedAt = Date.now();
            const tenantId = (c as any).get('tenantId');
            const prc_date = c.req.query('prc_date') || '2023-12-31';
            const segment_id = c.req.query('segment_id') ? Number(c.req.query('segment_id')) : undefined;
            const stage = c.req.queries('stage') || (c.req.query('stage') ? [c.req.query('stage')!] : undefined);
            const group_segment = c.req.query('group_segment') || undefined;
            const result = await ifrs9ReportsService.getECLMovement(
                tenantId,
                { prc_date, segment_id, stage, group_segment }
            );
            return c.json({
                success: true,
                data: result.data,
                meta: await buildReportMeta(c, startedAt, 'ecl-movement', { prc_date, segment_id, stage, group_segment }, { effectivePrcDate: (result as any).effectivePrcDate, rowCount: Array.isArray(result.data) ? result.data.length : 0 }),
                effectivePrcDate: (result as any).effectivePrcDate,
                message: result.data.length === 0 ? "No ECL Movement Data available" : undefined
            });
        } catch (error: any) {
            return ifrs9ReportsController.handleError(c, error);
        }
    },

    getGCAMovement: async (c: Context) => {
        try {
            const startedAt = Date.now();
            const tenantId = (c as any).get('tenantId');
            const prc_date = c.req.query('prc_date') || '2023-12-31';
            const segment_id = c.req.query('segment_id') ? Number(c.req.query('segment_id')) : undefined;
            const stage = c.req.queries('stage') || (c.req.query('stage') ? [c.req.query('stage')!] : undefined);
            const group_segment = c.req.query('group_segment') || undefined;
            const result = await ifrs9ReportsService.getGCAMovement(
                tenantId,
                { prc_date, segment_id, stage, group_segment }
            );
            return c.json({
                success: true,
                data: result.data,
                meta: await buildReportMeta(c, startedAt, 'gca-movement', { prc_date, segment_id, stage, group_segment }, { effectivePrcDate: (result as any).effectivePrcDate, rowCount: Array.isArray(result.data) ? result.data.length : 0 }),
                effectivePrcDate: (result as any).effectivePrcDate,
                message: result.data.length === 0 ? "No GCA Movement Data available" : undefined
            });
        } catch (error: any) {
            return ifrs9ReportsController.handleError(c, error);
        }
    },

    getNominativeReport: async (c: Context) => {
        try {
            const startedAt = Date.now();
            const tenantId = (c as any).get('tenantId');
            const page = Number(c.req.query('page') || 1);
            const limit = Number(c.req.query('limit') || 20);
            // Extract filter parameters
            const prc_date = c.req.query('prc_date') || '2023-12-31';
            const download_start_date = c.req.query('download_start_date') || undefined;
            const download_end_date = c.req.query('download_end_date') || undefined;
            const group_segment = c.req.queries('group_segment')
                || c.req.queries('group_segment[]')
                || (c.req.query('group_segment[]') ? [c.req.query('group_segment[]')!] : undefined)
                || (c.req.query('group_segment') ? [c.req.query('group_segment')!] : undefined);
            const segment = c.req.queries('segment')
                || c.req.queries('segment[]')
                || (c.req.query('segment[]') ? [c.req.query('segment[]')!] : undefined)
                || (c.req.query('segment') ? [c.req.query('segment')!] : undefined);
            const stage = c.req.queries('stage')
                || c.req.queries('stage[]')
                || (c.req.query('stage[]') ? [c.req.query('stage[]')!] : undefined)
                || (c.req.query('stage') ? [c.req.query('stage')!] : undefined);
            const branch_code = c.req.queries('branch_code')
                || c.req.queries('branch_code[]')
                || (c.req.query('branch_code[]') ? [c.req.query('branch_code[]')!] : undefined)
                || (c.req.query('branch_code') ? [c.req.query('branch_code')!] : undefined);
            const result = await ifrs9ReportsService.getNominativeReport(
                tenantId,
                page,
                limit,
                { prc_date, download_start_date, download_end_date, group_segment, segment, stage, branch_code }
            );
            return c.json({
                success: true,
                data: result.data,
                pagination: {
                    page: result.page,
                    limit,
                    total: result.total,
                    totalPages: result.totalPages
                },
                meta: await buildReportMeta(c, startedAt, 'nominative-report', { prc_date, download_start_date, download_end_date, group_segment, segment, stage, branch_code, page, limit }, { effectivePrcDate: result.effectivePrcDate, rowCount: result.total }),
                summary: result.summary,
                effectivePrcDate: result.effectivePrcDate,
                message: result.total === 0 ? "No Nominative Report Data available" : undefined
            });
        } catch (error: any) {
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
        // Mock export - return usage of text for now
        return c.text("Export function placeholder");
    }
};
