
import { individualImpairmentService } from '@/services/individual-impairment.service';
import { Context } from 'hono';


export class IndividualImpairmentController {


    // ================= WATCHLIST =================
    async getWatchlist(c: Context) {
        try {
            const user = c.get('user');
            if (!user?.tenantId) return c.json({ success: false, message: 'Unauthorized' }, 401);

            const segment = c.req.query('segment');
            const status = c.req.query('status');
            const limit = Number(c.req.query('limit')) || 50;
            const offset = Number(c.req.query('offset')) || 0;

            const data = await individualImpairmentService.getWatchlist(user.tenantId, { segment, status, limit, offset });
            return c.json({ success: true, data });
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
            if (!user?.tenantId) return c.json({ success: false, message: 'Unauthorized' }, 401);

            const id = c.req.param('id');
            await individualImpairmentService.removeFromWatchlist(id, user.tenantId);
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

            const accountId = Number(c.req.query('account_id'));
            if (!accountId) return c.json({ success: false, message: 'Account ID required' }, 400);

            const data = await individualImpairmentService.getAssessment(user.tenantId, accountId);
            if (!data) return c.json({ success: false, message: 'Assessment not found' }, 404);

            return c.json({ success: true, data });
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
            return c.json({ success: true, data: data[0] });
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
            const data = await individualImpairmentService.getScenarios(user.tenantId, { status });
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
            if (!user?.tenantId) return c.json({ success: false, message: 'Unauthorized' }, 401);

            const id = c.req.param('id');
            const { status } = await c.req.json(); // { status: "APPROVED" }

            const data = await individualImpairmentService.updateScenarioStatus(id, user.tenantId, status, user.id);
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
            if (!user?.tenantId) return c.json({ success: false, message: 'Unauthorized' }, 401);

            const uploadId = c.req.param('uploadId');
            const data = await individualImpairmentService.getDcfCashflows(user.tenantId, uploadId);
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
}

export const individualImpairmentController = new IndividualImpairmentController();
