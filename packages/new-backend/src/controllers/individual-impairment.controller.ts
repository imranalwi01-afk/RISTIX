import { individualImpairmentService } from '@/services/individual-impairment.service';
import { Context } from 'hono';

export class IndividualImpairmentController {
    private individualImpairmentService: any;

    constructor() {
        this.individualImpairmentService = individualImpairmentService;
    }

    // ================= WATCHLIST =================
    async getWatchlist(c: Context) {
        try {
            const user = c.get('user');
            if (!user?.tenantId) return c.json({ success: false, message: 'Unauthorized' }, 401);

            // 1. Extract Pagination Parameters
            const page = Number(c.req.query('page')) || 1;
            const limit = Number(c.req.query('limit')) || 25;
            const offset = (page - 1) * limit;

            // 2. Extract Filters
            // The frontend sends filters either as top-level params or in a 'filter' object
            // Hono query(key) handles simple keys. 
            const search = c.req.query('search');
            const stage = Number(c.req.query('filter[stage]') || c.req.query('stage'));
            const status = c.req.query('filter[assessment_status]') || c.req.query('status');
            const impaired_flag = c.req.query('filter[impaired_flag]') || c.req.query('impairedFlag');
            const rating_code = c.req.query('filter[rating_code]') || c.req.query('ratingCode');
            const dateFrom =
                c.req.query('dateFrom') ||
                c.req.query('filter[date_range][start]') ||
                c.req.query('filter[date_range][from]') ||
                c.req.query('filter[dateFrom]');
            const dateTo =
                c.req.query('dateTo') ||
                c.req.query('filter[date_range][end]') ||
                c.req.query('filter[date_range][to]') ||
                c.req.query('filter[dateTo]');

            // 3. Call Service
            const result = await individualImpairmentService.getWatchlist(user.tenantId, { 
                search,
                stage,
                status,
                impaired_flag,
                rating_code,
                dateFrom,
                dateTo,
                limit, 
                offset 
            });

            // 4. Return Standard Pagination Response
            return c.json({ 
                success: true, 
                data: result.data,
                pagination: {
                    page,
                    limit,
                    total: result.total,
                    totalPages: Math.ceil(result.total / limit)
                }
            });
        } catch (error: any) {
            return this.handleError(c, error);
        }
    }

    async getCustomerList(c: Context) {
        try {
            const user = c.get('user');
            if (!user?.tenantId) return c.json({ success: false, message: 'Unauthorized' }, 401);

            const page = Number(c.req.query('page')) || 1;
            const limit = Number(c.req.query('limit')) || 25;
            const offset = (page - 1) * limit;

            const search = c.req.query('search');
            const dateFrom =
                c.req.query('dateFrom') ||
                c.req.query('filter[date_range][start]') ||
                c.req.query('filter[date_range][from]') ||
                c.req.query('filter[dateFrom]');
            const dateTo =
                c.req.query('dateTo') ||
                c.req.query('filter[date_range][end]') ||
                c.req.query('filter[date_range][to]') ||
                c.req.query('filter[dateTo]');

            const result = await individualImpairmentService.getCustomerList(user.tenantId, {
                search,
                dateFrom,
                dateTo,
                limit,
                offset
            });

            return c.json({
                success: true,
                data: result.data,
                pagination: {
                    page,
                    limit,
                    total: result.total,
                    totalPages: Math.ceil(result.total / limit)
                }
            });
        } catch (error: any) {
            return this.handleError(c, error);
        }
    }

    async addToWatchlist(c: Context) {
        try {
            const user = c.get('user');
            if (!user?.tenantId) return c.json({ success: false, message: 'Unauthorized' }, 401);

            const body = await c.req.json();
            const data = await individualImpairmentService.addToWatchlist({
                ...body,
                tenantId: user.tenantId,
                addedBy: user.id
            });
            return c.json({ success: true, data: data[0] });
        } catch (error: any) {
            return this.handleError(c, error);
        }
    }

    async removeFromWatchlist(c: Context) {
        try {
            const user = c.get('user');
            const tenantId = user?.tenantId;
            if (!tenantId) return c.json({ success: false, message: 'Unauthorized' }, 401);

            const id = c.req.param('id');
            if (!id) return c.json({ success: false, message: 'ID required' }, 400);
            await individualImpairmentService.removeFromWatchlist(id, tenantId);
            return c.json({ success: true, message: 'Removed from watchlist' });
        } catch (error: any) {
            return this.handleError(c, error);
        }
    }

    // ================= ASSESSMENT =================
    async getAssessment(c: Context) {
        try {
            const user = c.get('user');
            if (!user?.tenantId) return c.json({ success: false, message: 'Unauthorized' }, 401);

            const accountId = Number(c.req.param('accountId'));
            if (!accountId) return c.json({ success: false, message: 'Account ID required' }, 400);

            const data = await individualImpairmentService.getAssessment(user.tenantId, accountId);
            if (!data) return c.json({ success: false, message: 'Assessment not found' }, 404);

            return c.json({ success: true, data });
        } catch (error: any) {
            return this.handleError(c, error);
        }
    }

    async submitAssessment(c: Context) {
        try {
            const user = c.get('user');
            if (!user?.tenantId) return c.json({ success: false, message: 'Unauthorized' }, 401);

            const id = Number(c.req.param('id'));
            const { comments } = await c.req.json();
            
            const data = await individualImpairmentService.submitAssessment(id, comments, user.id);
            return c.json({ success: true, data: data });
        } catch (error: any) {
            return this.handleError(c, error);
        }
    }

    async approveAssessment(c: Context) {
        try {
            const user = c.get('user');
            if (!user?.tenantId) return c.json({ success: false, message: 'Unauthorized' }, 401);

            const id = Number(c.req.param('id'));
            const { comments } = await c.req.json();
            
            const data = await individualImpairmentService.approveAssessment(id, comments, user.id);
            return c.json({ success: true, data: data });
        } catch (error: any) {
            return this.handleError(c, error);
        }
    }

    async rejectAssessment(c: Context) {
        try {
            const user = c.get('user');
            if (!user?.tenantId) return c.json({ success: false, message: 'Unauthorized' }, 401);

            const id = Number(c.req.param('id'));
            const { reason } = await c.req.json();
            
            const data = await individualImpairmentService.rejectAssessment(id, reason, user.id);
            return c.json({ success: true, data: data });
        } catch (error: any) {
            return this.handleError(c, error);
        }
    }

    async createAssessment(c: Context) {
        try {
            const user = c.get('user');
            if (!user?.tenantId) return c.json({ success: false, message: 'Unauthorized' }, 401);

            const body = await c.req.json();
            const data = await individualImpairmentService.createAssessment({
                ...body,
                tenantId: user.tenantId,
                createdBy: user.id
            });
            return c.json({ success: true, data: data });
        } catch (error: any) {
            return this.handleError(c, error);
        }
    }

    // ================= OVERRIDES =================
    async getOverrides(c: Context) {
        try {
            const user = c.get('user');
            if (!user?.tenantId) return c.json({ success: false, message: 'Unauthorized' }, 401);

            const status = c.req.query('status');
            const limit = Number(c.req.query('limit')) || 50;
            const offset = Number(c.req.query('offset')) || 0;

            const data = await individualImpairmentService.getOverrides(user.tenantId, { status, limit, offset });
            return c.json({ success: true, data });
        } catch (error: any) {
            return this.handleError(c, error);
        }
    }

    async createOverride(c: Context) {
        try {
            const user = c.get('user');
            if (!user?.tenantId) return c.json({ success: false, message: 'Unauthorized' }, 401);

            const body = await c.req.json();
            const data = await individualImpairmentService.createOverride({
                ...body,
                tenantId: user.tenantId,
                requestedBy: user.id
            });
            return c.json({ success: true, data: data[0] });
        } catch (error: any) {
            return this.handleError(c, error);
        }
    }

    // ================= HISTORY =================
    async getHistory(c: Context) {
        try {
            const user = c.get('user');
            if (!user?.tenantId) return c.json({ success: false, message: 'Unauthorized' }, 401);

            const entityType = c.req.query('entityType');
            const limit = Number(c.req.query('limit')) || 50;
            const offset = Number(c.req.query('offset')) || 0;

            const data = await individualImpairmentService.getAuditTrails(user.tenantId, { entityType, limit, offset });

            return c.json({ success: true, data, meta: { limit, offset, count: data.length } });
        } catch (error: any) {
            return this.handleError(c, error);
        }
    }

    async getAssessmentHistory(c: Context) {
        try {
            const user = c.get('user');
            if (!user?.tenantId) return c.json({ success: false, message: 'Unauthorized' }, 401);

            const accountId = Number(c.req.param('accountId'));
            if (!accountId) return c.json({ success: false, message: 'Account ID required' }, 400);

            const data = await individualImpairmentService.getAssessmentHistory(user.tenantId, accountId);
            return c.json({ success: true, data });
        } catch (error: any) {
            return this.handleError(c, error);
        }
    }

    // ================= REPORTS =================
    async getReports(c: Context) {
        try {
            const user = c.get('user');
            if (!user?.tenantId) return c.json({ success: false, message: 'Unauthorized' }, 401);

            const reportPeriod = c.req.query('reportPeriod');
            const limit = Number(c.req.query('limit')) || 50;
            const offset = Number(c.req.query('offset')) || 0;

            const data = await individualImpairmentService.getReports(user.tenantId, { reportPeriod, limit, offset });
            return c.json({ success: true, data });
        } catch (error: any) {
            return this.handleError(c, error);
        }
    }

    async createReport(c: Context) {
        try {
            const user = c.get('user');
            if (!user?.tenantId) return c.json({ success: false, message: 'Unauthorized' }, 401);

            const body = await c.req.json();
            const data = await individualImpairmentService.createReport({
                ...body,
                tenantId: user.tenantId,
                generatedBy: user.id
            });
            return c.json({ success: true, data: data[0] });
        } catch (error: any) {
            return this.handleError(c, error);
        }
    }

    // ================= SCENARIOS =================
    async getScenarios(c: Context) {
        try {
            const user = c.get('user');
            if (!user?.tenantId) return c.json({ success: false, message: 'Unauthorized' }, 401);

            const status = c.req.query('status');
            const accountId = Number(c.req.query('accountId'));

            const data = await individualImpairmentService.getScenarios(user.tenantId, { status, accountId });
            return c.json({ success: true, data });
        } catch (error: any) {
            return this.handleError(c, error);
        }
    }

    async createScenario(c: Context) {
        try {
            const user = c.get('user');
            if (!user?.tenantId) return c.json({ success: false, message: 'Unauthorized' }, 401);

            const body = await c.req.json();
            const data = await individualImpairmentService.createScenario({
                ...body,
                tenantId: user.tenantId,
                createdBy: user.id
            });
            return c.json({ success: true, data: data[0] });
        } catch (error: any) {
            return this.handleError(c, error);
        }
    }

    async updateScenarioStatus(c: Context) {
        try {
            const user = c.get('user');
            const tenantId = user?.tenantId;
            const userId = user?.id;
            if (!tenantId || !userId) return c.json({ success: false, message: 'Unauthorized' }, 401);

            const id = c.req.param('id');
            const { status } = await c.req.json(); // { status: "APPROVED" }
            if (!id) return c.json({ success: false, message: 'ID required' }, 400);
            if (!status) return c.json({ success: false, message: 'Status required' }, 400);

            const data = await individualImpairmentService.updateScenarioStatus(id, tenantId, status, userId);
            return c.json({ success: true, data: data[0] });
        } catch (error: any) {
            return this.handleError(c, error);
        }
    }

    // ================= DCF & CASHFLOWS =================
    async getDcfUploads(c: Context) {
        try {
            const user = c.get('user');
            if (!user?.tenantId) return c.json({ success: false, message: 'Unauthorized' }, 401);

            const data = await individualImpairmentService.getDcfUploads(user.tenantId);
            return c.json({ success: true, data });
        } catch (error: any) {
            return this.handleError(c, error);
        }
    }

    async getDcfCashflows(c: Context) {
        try {
            const user = c.get('user');
            const tenantId = user?.tenantId;
            if (!tenantId) return c.json({ success: false, message: 'Unauthorized' }, 401);

            const uploadId = c.req.param('uploadId');
            if (!uploadId) return c.json({ success: false, message: 'Upload ID required' }, 400);
            const data = await individualImpairmentService.getDcfCashflows(tenantId, uploadId);
            return c.json({ success: true, data });
        } catch (error: any) {
            return this.handleError(c, error);
        }
    }
    async getDcfCalculations(c: Context) {
        try {
            const user = c.get('user');
            if (!user?.tenantId) return c.json({ success: false, message: 'Unauthorized' }, 401);

            const data = await individualImpairmentService.getDcfCalculations(user.tenantId);
            return c.json({ success: true, data });
        } catch (error: any) {
            return this.handleError(c, error);
        }
    }

    async calculateDcf(c: Context) {
        try {
            const user = c.get('user');
            if (!user?.tenantId) return c.json({ success: false, message: 'Unauthorized' }, 401);
            const body = await c.req.json();

            // Panggil Service untuk hitung matematika
            const data = await individualImpairmentService.calculateDcf(user.tenantId, body);

            return c.json({ success: true, data });
        } catch (error: any) {
            // Error Handling standar
            return c.json({ success: false, message: error.message }, 500);
        }
    }

    async createBatchUpload(c: Context) {
        try {
            const user = c.get('user');
            if (!user?.tenantId) return c.json({ success: false, message: 'Unauthorized' }, 401);

            const body = await c.req.json();
            const { fileName, batchId, cashflows } = body;

            // Basic validation
            if (!fileName || !cashflows || !Array.isArray(cashflows)) {
                return c.json({ success: false, message: 'Invalid payload' }, 400);
            }

            // Create Upload Header
            const [upload] = await individualImpairmentService.createDcfUpload({
                tenantId: user.tenantId,
                fileName,
                batchId: batchId || `BATCH-${Date.now()}`,
                uploadedBy: user.id,
                recordCount: cashflows.length
            });

            // Create Cashflows
            if (upload && cashflows.length > 0) {
                const cashflowData = cashflows.map((cf: any) => ({
                    ...cf,
                    tenantId: user.tenantId,
                    uploadId: upload.pkid
                }));
                await individualImpairmentService.createDcfCashflows(cashflowData);
            }

            return c.json({ success: true, data: upload });
        } catch (error: any) {
            return this.handleError(c, error);
        }
    }

    // Standardized Error Handler for User Feedback
    private handleError(c: Context, error: any) {
        const msg = error.message || 'Unknown error';
        console.error('Controller Error:', msg); // Log for server side debugging

        // 1. Validation / Business Logic Errors (User can fix these)
        if (msg.includes('not found') || msg.includes('validation') || msg.includes('Master Data') || msg.includes('Invalid payload') || msg.includes('not found in Master Data')) {
            return c.json({ success: false, message: msg }, 400);
        }

        // 2. Conflict Errors
        if (msg.includes('duplicate') || msg.includes('unique constraint') || msg.includes('already exists')) {
            return c.json({ success: false, message: 'Data conflict: Record already exists or violates unique constraint.' }, 409);
        }

        // 3. Unauthorized (handled usually by middleware, but just in case)
        if (msg.includes('Unauthorized')) {
            return c.json({ success: false, message: 'Unauthorized Access' }, 401);
        }

        // 4. Default System Error
        return c.json({ success: false, message: 'System Error: ' + msg }, 500);
    }

    // Get Watchlist Summary
    async getWatchlistSummary(c: Context) {
        try {
            const user = c.get('user');
            if (!user?.tenantId) return c.json({ success: false, message: 'Unauthorized' }, 401);
            
            const date = c.req.query('date'); // Extract date from query params
            const summary = await individualImpairmentService.getWatchlistSummary(user.tenantId, date);
            return c.json({ success: true, data: summary });
        } catch (error: any) {
            return this.handleError(c, error);
        }
    }

    // Get Staging Summary - for dashboard cards
    async getStagingSummary(c: Context) {
        try {
            const user = c.get('user');
            const tenantId = user?.tenantId || c.get('tenantId');
            
            if (!tenantId) {
                return c.json({ success: false, message: 'Tenant ID required' }, 400);
            }

            // Get staging summary from calculation results
            const summary = await this.individualImpairmentService.getStagingSummary(tenantId);
            
            return c.json({ success: true, data: summary });
        } catch (error: any) {
            return this.handleError(c, error);
        }
    }

    // Get Staging Analysis - for detailed staging data
    async getStagingAnalysis(c: Context) {
        try {
            const user = c.get('user');
            if (!user?.tenantId) return c.json({ success: false, message: 'Unauthorized' }, 401);

            // Extract filter parameters
            const stage = c.req.query('stage');
            const segmentId = c.req.query('segmentId');
            const startDate = c.req.query('startDate');
            const endDate = c.req.query('endDate');

            // Get staging analysis from calculation results with filters
            const analysis = await this.individualImpairmentService.getStagingAnalysis(user.tenantId, {
                stage,
                segmentId,
                startDate,
                endDate
            });
            
            return c.json({ success: true, data: analysis });
        } catch (error: any) {
            return this.handleError(c, error);
        }
    }
}

export const individualImpairmentController = new IndividualImpairmentController();
