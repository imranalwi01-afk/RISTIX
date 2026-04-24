import { individualImpairmentService } from '@/services/individual-impairment.service';
import { Context } from 'hono';
import path from 'path'
import { promises as fs } from 'fs'
import { buildErrorResponse } from '@/lib/http/error-response';
import {
    ListQueryValidationError,
    buildCursorPagination,
    buildListResponse,
    buildOffsetPagination,
    parseListQuery,
    type ListQueryConfig,
} from '@/lib/http/list-query';

const MASTER_ACCOUNT_LIST_QUERY_CONFIG: ListQueryConfig = {
    defaultLimit: 25,
    maxLimit: 200,
    defaultSort: [{ field: 'prcDate', direction: 'desc' }],
    searchableColumns: ['accountNumber', 'cifName', 'cifNumber'],
    filterableColumns: [
        'stage',
        'assessment_status',
        'impaired_flag',
        'priority_level',
        'rating_code',
        'dateFrom',
        'dateTo',
    ],
    sortableColumns: [
        'pkid',
        'prcDate',
        'prc_date',
        'accountNumber',
        'account_number',
        'cifName',
        'cif_name',
        'outstanding',
        'stage',
        'dpd',
    ],
    filterAliases: {
        impairedFlag: 'impaired_flag',
        priorityLevel: 'priority_level',
        ratingCode: 'rating_code',
        status: 'assessment_status',
        'date_range.start': 'dateFrom',
        'date_range.from': 'dateFrom',
        'date_range.end': 'dateTo',
        'date_range.to': 'dateTo',
    },
}

const CUSTOMER_LIST_QUERY_CONFIG: ListQueryConfig = {
    ...MASTER_ACCOUNT_LIST_QUERY_CONFIG,
    filterableColumns: ['dateFrom', 'dateTo'],
}

const stringFilter = (value: unknown): string | undefined => {
    if (value === undefined || value === null) return undefined
    if (Array.isArray(value)) return value[0] === undefined ? undefined : String(value[0])
    return String(value)
}

export class IndividualImpairmentController {
    private individualImpairmentService: any;

    constructor() {
        this.individualImpairmentService = individualImpairmentService;
    }

    private unauthorized(c: Context) {
        return c.json(buildErrorResponse(c, { error: 'Unauthorized', message: 'Unauthorized', code: 'UNAUTHORIZED' }), 401);
    }

    private badRequest(c: Context, message: string) {
        return c.json(buildErrorResponse(c, { error: message, message, code: 'BAD_REQUEST' }), 400);
    }

    private listQueryBadRequest(c: Context, error: ListQueryValidationError) {
        return c.json({
            ...buildErrorResponse(c, {
                error: error.message,
                message: error.message,
                code: 'INVALID_LIST_QUERY',
            }),
            details: error.details,
        }, 400);
    }

    private notFound(c: Context, message: string) {
        return c.json(buildErrorResponse(c, { error: message, message, code: 'NOT_FOUND' }), 404);
    }

    // ================= WATCHLIST =================
    async getWatchlist(c: Context) {
        try {
            const user = c.get('user');
            if (!user?.tenantId) return this.unauthorized(c);

            const query = parseListQuery(c, MASTER_ACCOUNT_LIST_QUERY_CONFIG);
            const filters = query.filters;
            const stageValue = filters.stage === undefined ? undefined : Number(stringFilter(filters.stage));

            const result = await individualImpairmentService.getWatchlist(user.tenantId, { 
                search: query.search,
                stage: Number.isFinite(stageValue) ? stageValue : undefined,
                status: stringFilter(filters.assessment_status),
                impaired_flag: stringFilter(filters.impaired_flag),
                priority_level: stringFilter(filters.priority_level),
                rating_code: stringFilter(filters.rating_code),
                dateFrom: stringFilter(filters.dateFrom),
                dateTo: stringFilter(filters.dateTo),
                limit: query.limit,
                offset: query.offset,
                cursor: query.cursor,
                paginationMode: query.paginationMode,
                sort: query.sort,
            });

            const pagination = query.paginationMode === 'cursor'
                ? buildCursorPagination(query, {
                    nextCursor: result.nextCursor,
                    previousCursor: result.previousCursor,
                    hasNextPage: result.hasNextPage,
                    hasPreviousPage: result.hasPreviousPage,
                })
                : buildOffsetPagination(query, result.total ?? 0);

            return c.json(buildListResponse(result.data, query, pagination));
        } catch (error: any) {
            if (error instanceof ListQueryValidationError) return this.listQueryBadRequest(c, error);
            return this.handleError(c, error);
        }
    }

    async getCustomerList(c: Context) {
        try {
            const user = c.get('user');
            if (!user?.tenantId) return this.unauthorized(c);

            const query = parseListQuery(c, CUSTOMER_LIST_QUERY_CONFIG);
            const filters = query.filters;

            const result = await individualImpairmentService.getCustomerList(user.tenantId, {
                search: query.search,
                dateFrom: stringFilter(filters.dateFrom),
                dateTo: stringFilter(filters.dateTo),
                limit: query.limit,
                offset: query.offset,
                cursor: query.cursor,
                paginationMode: query.paginationMode,
                sort: query.sort,
            });

            const pagination = query.paginationMode === 'cursor'
                ? buildCursorPagination(query, {
                    nextCursor: result.nextCursor,
                    previousCursor: result.previousCursor,
                    hasNextPage: result.hasNextPage,
                    hasPreviousPage: result.hasPreviousPage,
                })
                : buildOffsetPagination(query, result.total ?? 0);

            return c.json(buildListResponse(result.data, query, pagination));
        } catch (error: any) {
            if (error instanceof ListQueryValidationError) return this.listQueryBadRequest(c, error);
            return this.handleError(c, error);
        }
    }

    async addToWatchlist(c: Context) {
        try {
            const user = c.get('user');
            if (!user?.tenantId) return this.unauthorized(c);

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
            if (!tenantId) return this.unauthorized(c);

            const id = c.req.param('id');
            if (!id) return this.badRequest(c, 'ID required');
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
            if (!user?.tenantId) return this.unauthorized(c);

            const accountId = Number(c.req.param('accountId'));
            if (!accountId) return this.badRequest(c, 'Account ID required');

            const data = await individualImpairmentService.getAssessment(user.tenantId, accountId);
            if (!data) return this.notFound(c, 'Assessment not found');

            return c.json({ success: true, data });
        } catch (error: any) {
            return this.handleError(c, error);
        }
    }

    async submitAssessment(c: Context) {
        try {
            const user = c.get('user');
            if (!user?.tenantId) return this.unauthorized(c);

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
            if (!user?.tenantId) return this.unauthorized(c);

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
            if (!user?.tenantId) return this.unauthorized(c);

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
            if (!user?.tenantId) return this.unauthorized(c);

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
            if (!user?.tenantId) return this.unauthorized(c);

            const status = c.req.query('status');
            const accountId = c.req.query('accountId');
            const accountNumber = c.req.query('accountNumber');
            const limit = Number(c.req.query('limit')) || 50;
            const offset = Number(c.req.query('offset')) || 0;

            const data = await individualImpairmentService.getOverrides(user.tenantId, {
                status,
                accountId: accountId ? Number(accountId) : undefined,
                accountNumber,
                limit,
                offset,
            });
            return c.json({ success: true, data });
        } catch (error: any) {
            return this.handleError(c, error);
        }
    }

    async createOverride(c: Context) {
        try {
            const user = c.get('user');
            if (!user?.tenantId) return this.unauthorized(c);

            const body = await c.req.json();

            const supportingDocumentName = body?.supportingDocumentName
            const supportingDocumentContent = body?.supportingDocumentContent

            if (supportingDocumentName && supportingDocumentContent) {
                const base64 = String(supportingDocumentContent)
                const buffer = Buffer.from(base64, 'base64')
                if (buffer.byteLength > 5 * 1024 * 1024) {
                    return c.json({ success: false, message: 'Supporting document too large (max 5MB)' }, 413);
                }

                const ext = path.extname(String(supportingDocumentName)).toLowerCase()
                const baseName = path.basename(String(supportingDocumentName), ext)
                const safeBase = baseName
                    .replace(/[^a-zA-Z0-9._-]+/g, '_')
                    .slice(0, 60) || 'document'
                const suffix = crypto.randomUUID().slice(0, 8)
                const storedName = `${Date.now()}_${suffix}_${safeBase}`.slice(0, 96) + ext

                const storageDir = path.resolve(process.cwd(), 'storage', 'individual-impairment', 'overrides')
                await fs.mkdir(storageDir, { recursive: true })
                const filePath = path.join(storageDir, storedName)
                await fs.writeFile(filePath, buffer)

                body.supportingDocument = storedName
            }

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

    async downloadOverrideDocument(c: Context) {
        try {
            const user = c.get('user');
            if (!user?.tenantId) return c.json({ success: false, message: 'Unauthorized' }, 401);

            const fileName = c.req.param('fileName');
            const safeName = String(fileName || '').replace(/[^a-zA-Z0-9._-]+/g, '')
            if (!safeName || safeName !== fileName || safeName === '.' || safeName === '..') {
                return c.json({ success: false, message: 'Invalid file name' }, 400);
            }

            const storageDir = path.resolve(process.cwd(), 'storage', 'individual-impairment', 'overrides')
            const filePath = path.resolve(storageDir, safeName)
            if (!filePath.startsWith(storageDir + path.sep)) {
                return c.json({ success: false, message: 'Invalid file name' }, 400);
            }

            try {
                await fs.access(filePath)
            } catch {
                return c.json({ success: false, message: 'File not found' }, 404);
            }

            const file = Bun.file(filePath)
            const ext = path.extname(safeName).toLowerCase()
            const contentType =
                ext === '.pdf' ? 'application/pdf' :
                ext === '.png' ? 'image/png' :
                ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' :
                ext === '.xlsx' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' :
                ext === '.csv' ? 'text/csv' :
                'application/octet-stream'

            c.header('Content-Type', contentType)
            c.header('Content-Disposition', `attachment; filename="${safeName}"`)
            return c.body(file.stream() as any)
        } catch (error: any) {
            return this.handleError(c, error);
        }
    }

    // ================= HISTORY =================
    async getHistory(c: Context) {
        try {
            const user = c.get('user');
            if (!user?.tenantId) return this.unauthorized(c);

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
            if (!user?.tenantId) return this.unauthorized(c);

            const accountId = Number(c.req.param('accountId'));
            if (!accountId) return this.badRequest(c, 'Account ID required');

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
            if (!user?.tenantId) return this.unauthorized(c);

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
            if (!user?.tenantId) return this.unauthorized(c);

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
            if (!user?.tenantId) return this.unauthorized(c);

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
            if (!user?.tenantId) return this.unauthorized(c);

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
            if (!tenantId || !userId) return this.unauthorized(c);

            const id = c.req.param('id');
            const { status } = await c.req.json(); // { status: "APPROVED" }
            if (!id) return this.badRequest(c, 'ID required');
            if (!status) return this.badRequest(c, 'Status required');

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
            if (!user?.tenantId) return this.unauthorized(c);

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
            if (!tenantId) return this.unauthorized(c);

            const uploadId = c.req.param('uploadId');
            if (!uploadId) return this.badRequest(c, 'Upload ID required');
            const data = await individualImpairmentService.getDcfCashflows(tenantId, uploadId);
            return c.json({ success: true, data });
        } catch (error: any) {
            return this.handleError(c, error);
        }
    }
    async getDcfCalculations(c: Context) {
        try {
            const user = c.get('user');
            if (!user?.tenantId) return this.unauthorized(c);

            const data = await individualImpairmentService.getDcfCalculations(user.tenantId);
            return c.json({ success: true, data });
        } catch (error: any) {
            return this.handleError(c, error);
        }
    }

    async getIaResultDetail(c: Context) {
        try {
            const user = c.get('user');
            if (!user?.tenantId) return this.unauthorized(c);

            const accountIdRaw = c.req.query('accountId');
            const accountNumber = c.req.query('accountNumber');
            const accountId = accountIdRaw ? Number(accountIdRaw) : undefined;

            const data = await individualImpairmentService.getIaResultDetail(user.tenantId, {
                accountId: Number.isFinite(accountId) ? accountId : undefined,
                accountNumber: accountNumber || undefined
            });

            return c.json({ success: true, data });
        } catch (error: any) {
            return this.handleError(c, error);
        }
    }

    async calculateDcf(c: Context) {
        try {
            const user = c.get('user');
            if (!user?.tenantId) return this.unauthorized(c);
            const body = await c.req.json();

            // Panggil Service untuk hitung matematika
            const data = await individualImpairmentService.calculateDcf(user.tenantId, body);

            return c.json({ success: true, data });
        } catch (error: any) {
            return this.handleError(c, error);
        }
    }

    async createBatchUpload(c: Context) {
        try {
            const user = c.get('user');
            if (!user?.tenantId) return this.unauthorized(c);

            const body = await c.req.json();
            const { fileName, batchId, cashflows } = body;

            // Basic validation
            if (!fileName || !cashflows || !Array.isArray(cashflows)) {
                return this.badRequest(c, 'Invalid payload');
            }
            const normalizedBatchId = batchId || `BATCH-${Date.now()}`;
            const createdAt = new Date().toISOString();
            const cashflowData = cashflows.map((cf: any) => ({
                ...cf,
                tenantId: user.tenantId,
                createdBy: user.id,
                createdHost: c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'web',
            }));
            const inserted = await individualImpairmentService.createDcfCashflows(cashflowData);

            return c.json({
                success: true,
                data: {
                    batchId: normalizedBatchId,
                    fileName,
                    recordCount: inserted.length,
                    validationStatus: 'VALID',
                    createdAt
                }
            });
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
            return c.json(buildErrorResponse(c, { error: msg, message: msg, code: 'BAD_REQUEST' }), 400);
        }

        // 2. Conflict Errors
        if (msg.includes('duplicate') || msg.includes('unique constraint') || msg.includes('already exists')) {
            return c.json(buildErrorResponse(c, { error: 'Data conflict: Record already exists or violates unique constraint.', message: 'Data conflict: Record already exists or violates unique constraint.', code: 'CONFLICT' }), 409);
        }

        // 3. Unauthorized (handled usually by middleware, but just in case)
        if (msg.includes('Unauthorized')) {
            return this.unauthorized(c);
        }

        // 4. Default System Error
        return c.json(buildErrorResponse(c, { error: 'System Error: ' + msg, message: 'System Error: ' + msg, code: 'INDIVIDUAL_IMPAIRMENT_ERROR' }), 500);
    }

    // Get Watchlist Summary
    async getWatchlistSummary(c: Context) {
        try {
            const user = c.get('user');
            if (!user?.tenantId) return this.unauthorized(c);
            
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
                return this.badRequest(c, 'Tenant ID required');
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
            if (!user?.tenantId) return this.unauthorized(c);

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
