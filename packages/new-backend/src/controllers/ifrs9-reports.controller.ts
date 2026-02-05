
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
            const user = c.get('user');
            const page = Number(c.req.query('page') || 1);
            const limit = Number(c.req.query('limit') || 20);

            // Extract filter parameters
            const prc_date = c.req.query('prc_date') || '2023-12-31';
            const pd_config_id = c.req.query('pd_config_id') ? Number(c.req.query('pd_config_id')) : 1;
            const pd_method = c.req.query('pd_method') ? Number(c.req.query('pd_method')) : 1;
            const scalar_id = c.req.query('scalar_id') ? Number(c.req.query('scalar_id')) : undefined;
            const fl_flag = c.req.query('fl_flag') === 'true';

            const result = await ifrs9ReportsService.getLifetimePDYearly(
                user?.tenantId || 'default',
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
                message: result.total === 0 ? "No Lifetime PD Data available" : undefined
            });
        } catch (error: any) {
            console.error('❌ [IFRS9] Error in getLifetimePDYearly:', error);
            return c.json({ success: false, message: error.message }, 500);
        }
    },

    getLifetimePDMonthly: async (c: Context) => {
        try {
            const user = c.get('user');
            const page = Number(c.req.query('page') || 1);
            const limit = Number(c.req.query('limit') || 20);

            // Extract filter parameters
            const prc_date = c.req.query('prc_date') || '2023-12-31';
            const pd_config_id = c.req.query('pd_config_id') ? Number(c.req.query('pd_config_id')) : 1;
            const pd_method = c.req.query('pd_method') ? Number(c.req.query('pd_method')) : 1;
            const scalar_id = c.req.query('scalar_id') ? Number(c.req.query('scalar_id')) : undefined;
            const fl_flag = c.req.query('fl_flag') === 'true';

            const result = await ifrs9ReportsService.getLifetimePDMonthly(
                user?.tenantId || 'default',
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
                message: result.total === 0 ? "No Lifetime PD Monthly Data available" : undefined
            });
        } catch (error: any) {
            console.error('❌ [IFRS9] Error in getLifetimePDMonthly:', error);
            return c.json({ success: false, message: error.message }, 500);
        }
    },

    getLifetimeLGD: async (c: Context) => {
        try {
            const user = c.get('user');
            const page = Number(c.req.query('page') || 1);
            const limit = Number(c.req.query('limit') || 20);

            // Extract filter parameters
            const prc_date = c.req.query('prc_date') || '2023-12-31';
            const lgd_config_id = c.req.query('lgd_config_id') ? Number(c.req.query('lgd_config_id')) : 1;
            const lgd_method = c.req.query('lgd_method') ? Number(c.req.query('lgd_method')) : undefined;
            const model_id = c.req.query('model_id') ? Number(c.req.query('model_id')) : undefined;

            const result = await ifrs9ReportsService.getLifetimeLGDDetail(
                user?.tenantId || 'default',
                page,
                limit,
                { prc_date, lgd_config_id, lgd_method, model_id }
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
                message: result.total === 0 ? "No Lifetime LGD Data available" : undefined
            });
        } catch (error: any) {
            console.error('❌ [IFRS9] Error in getLifetimeLGD:', error);
            return c.json({ success: false, message: error.message }, 500);
        }
    },

    getEADModel: async (c: Context) => {
        try {
            const user = c.get('user');
            const page = Number(c.req.query('page') || 1);
            const limit = Number(c.req.query('limit') || 20);

            // Extract filter parameters
            const prc_date = c.req.query('prc_date') || '2023-12-31';
            const ead_config_id = c.req.query('ead_config_id') ? Number(c.req.query('ead_config_id')) : undefined;
            const segment_id = c.req.query('segment_id') ? Number(c.req.query('segment_id')) : undefined;

            const result = await ifrs9ReportsService.getEADModel(
                user?.tenantId || 'default',
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
                message: result.total === 0 ? "No EAD Model Data available" : undefined
            });
        } catch (error: any) {
            console.error('❌ [IFRS9] Error in getEADModel:', error);
            return c.json({ success: false, message: error.message }, 500);
        }
    },

    getECLResult: async (c: Context) => {
        try {
            const user = c.get('user');
            const page = Number(c.req.query('page') || 1);
            const limit = Number(c.req.query('limit') || 20);

            // Extract filter parameters matching SQL script
            const prc_date = c.req.query('prc_date') || '2023-12-31';
            const segment_id = c.req.query('segment_id') ? Number(c.req.query('segment_id')) : undefined;
            const stage = c.req.query('stage') || undefined;

            const result = await ifrs9ReportsService.getECLResult(
                user?.tenantId || 'default',
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
                message: result.total === 0 ? "No ECL Result Data available" : undefined
            });
        } catch (error: any) {
            console.error('❌ [IFRS9] Error in getECLResult:', error);
            return c.json({ success: false, message: error.message }, 500);
        }
    },

    getECLMovement: async (c: Context) => {
        try {
            const user = c.get('user');
            const prc_date = c.req.query('prc_date') || '2023-12-31';
            const segment_id = c.req.query('segment_id') ? Number(c.req.query('segment_id')) : undefined;
            const stage = c.req.query('stage') || undefined;
            const result = await ifrs9ReportsService.getECLMovement(
                user?.tenantId || 'default',
                { prc_date, segment_id, stage }
            );
            return c.json({
                success: true,
                data: result.data,
                message: result.data.length === 0 ? "No ECL Movement Data available" : undefined
            });
        } catch (error: any) {
            console.error('❌ [IFRS9] Error in getECLMovement:', error);
            return c.json({ success: false, message: error.message }, 500);
        }
    },

    getGCAMovement: async (c: Context) => {
        try {
            const user = c.get('user');
            const prc_date = c.req.query('prc_date') || '2023-12-31';
            const segment_id = c.req.query('segment_id') ? Number(c.req.query('segment_id')) : undefined;
            const stage = c.req.query('stage') || undefined;
            const result = await ifrs9ReportsService.getGCAMovement(
                user?.tenantId || 'default',
                { prc_date, segment_id, stage }
            );
            return c.json({
                success: true,
                data: result.data,
                message: result.data.length === 0 ? "No GCA Movement Data available" : undefined
            });
        } catch (error: any) {
            console.error('❌ [IFRS9] Error in getGCAMovement:', error);
            return c.json({ success: false, message: error.message }, 500);
        }
    },

    getNominativeReport: async (c: Context) => {
        try {
            const user = c.get('user');
            const page = Number(c.req.query('page') || 1);
            const limit = Number(c.req.query('limit') || 20);
            // Extract filter parameters
            const prc_date = c.req.query('prc_date') || '2023-12-31';
            const segment_id = c.req.query('segment_id') ? Number(c.req.query('segment_id')) : undefined;
            const stage = c.req.query('stage') || undefined;
            const branch_code = c.req.query('branch_code') || undefined;
            const result = await ifrs9ReportsService.getNominativeReport(
                user?.tenantId || 'default',
                page,
                limit,
                { prc_date, segment_id, stage, branch_code }
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
                message: result.total === 0 ? "No Nominative Report Data available" : undefined
            });
        } catch (error: any) {
            console.error('❌ [IFRS9] Error in getNominativeReport:', error);
            return c.json({ success: false, message: error.message }, 500);
        }
    },

    exportReport: async (c: Context) => {
        // Mock export - return usage of text for now
        return c.text("Export function placeholder");
    }
};
