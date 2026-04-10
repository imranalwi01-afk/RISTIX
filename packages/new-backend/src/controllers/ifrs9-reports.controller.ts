
import { Context } from 'hono';
import { ifrs9ReportsService } from '../services/ifrs9-reports.service';

export const ifrs9ReportsController = {
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
                effectivePrcDate: result.effectivePrcDate,
                message: result.total === 0 ? "No Lifetime PD Data available" : undefined
            });
        } catch (error: any) {
            console.error('❌ [IFRS9] Error in getLifetimePDYearly:', error);
            return c.json({ success: false, message: error.message }, 500);
        }
    },

    getLifetimePDMonthly: async (c: Context) => {
        try {
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
                effectivePrcDate: result.effectivePrcDate,
                message: result.total === 0 ? "No Lifetime PD Monthly Data available" : undefined
            });
        } catch (error: any) {
            console.error('❌ [IFRS9] Error in getLifetimePDMonthly:', error);
            return c.json({ success: false, message: error.message }, 500);
        }
    },

    getLifetimePDAccountDetails: async (c: Context) => {
        try {
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
                effectivePrcDate: result.effectivePrcDate,
                message: result.total === 0 ? "No Lifetime PD Account Details available" : undefined
            });
        } catch (error: any) {
            console.error('❌ [IFRS9] Error in getLifetimePDAccountDetails:', error);
            return c.json({ success: false, message: error.message }, 500);
        }
    },

    getLifetimeLGD: async (c: Context) => {
        try {
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
                effectivePrcDate: result.effectivePrcDate,
                message: result.total === 0 ? "No Lifetime LGD Data available" : undefined
            });
        } catch (error: any) {
            console.error('❌ [IFRS9] Error in getLifetimeLGD:', error);
            return c.json({ success: false, message: error.message }, 500);
        }
    },

    getEADModel: async (c: Context) => {
        try {
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
                effectivePrcDate: (result as any).effectivePrcDate ?? null,
                message: result.total === 0 ? "No EAD Model Data available" : undefined
            });
        } catch (error: any) {
            console.error('❌ [IFRS9] Error in getEADModel:', error);
            return c.json({ success: false, message: error.message }, 500);
        }
    },

    getEADModelSummary: async (c: Context) => {
        try {
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
                effectivePrcDate: (result as any).effectivePrcDate ?? null,
                message: (!result.data || result.data.length === 0) ? "No EAD Model Summary Data available" : undefined
            });
        } catch (error: any) {
            console.error('❌ [IFRS9] Error in getEADModelSummary:', error);
            return c.json({ success: false, message: error.message }, 500);
        }
    },

    getECLResult: async (c: Context) => {
        try {
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
                effectivePrcDate: result.effectivePrcDate,
                message: result.total === 0 ? "No ECL Result Data available" : undefined
            });
        } catch (error: any) {
            console.error('❌ [IFRS9] Error in getECLResult:', error);
            return c.json({ success: false, message: error.message }, 500);
        }
    },

    getECLMovement: async (c: Context) => {
        try {
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
                effectivePrcDate: (result as any).effectivePrcDate,
                message: result.data.length === 0 ? "No ECL Movement Data available" : undefined
            });
        } catch (error: any) {
            console.error('❌ [IFRS9] Error in getECLMovement:', error);
            return c.json({ success: false, message: error.message }, 500);
        }
    },

    getGCAMovement: async (c: Context) => {
        try {
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
                effectivePrcDate: (result as any).effectivePrcDate,
                message: result.data.length === 0 ? "No GCA Movement Data available" : undefined
            });
        } catch (error: any) {
            console.error('❌ [IFRS9] Error in getGCAMovement:', error);
            return c.json({ success: false, message: error.message }, 500);
        }
    },

    getNominativeReport: async (c: Context) => {
        try {
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
                summary: result.summary,
                effectivePrcDate: result.effectivePrcDate,
                message: result.total === 0 ? "No Nominative Report Data available" : undefined
            });
        } catch (error: any) {
            console.error('❌ [IFRS9] Error in getNominativeReport:', error);
            return c.json({ success: false, message: error.message }, 500);
        }
    },

    getNominativeAvailableDates: async (c: Context) => {
        try {
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
                data: result.data
            });
        } catch (error: any) {
            console.error('❌ [IFRS9] Error in getNominativeAvailableDates:', error);
            return c.json({ success: false, message: error.message }, 500);
        }
    },

    exportReport: async (c: Context) => {
        // Mock export - return usage of text for now
        return c.text("Export function placeholder");
    }
};
