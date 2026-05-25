import { individualImpairmentService } from '@/services/individual-impairment.service';
import { Context } from 'hono';
import path from 'path'
import { promises as fs } from 'fs'
import { Effect } from 'effect';
import { createApprovalRequest } from '@/services/approval.service';
import { formatApprovalRequiredResponse } from '@/lib/approval-helpers';
import { buildErrorResponse } from '@/lib/http/error-response';
import {
    INDIVIDUAL_IMPAIRMENT_V2_ENTITY_TYPE,
    INDIVIDUAL_IMPAIRMENT_V2_SUBTYPES,
    isIndividualImpairmentV2Path,
} from '@/lib/individual-impairment-approval';
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

const INDIVIDUAL_REPORT_LIST_QUERY_CONFIG: ListQueryConfig = {
    defaultLimit: 25,
    maxLimit: 200,
    defaultSort: [{ field: 'downloadDate', direction: 'desc' }],
    searchableColumns: ['accountNumber', 'cifName', 'cifNumber'],
    filterableColumns: ['reportPeriod', 'dateFrom', 'dateTo', 'status', 'impaired_flag', 'account_number', 'cif_name'],
    sortableColumns: [
        'pkid',
        'downloadDate',
        'prc_date',
        'accountNumber',
        'account_number',
        'cifName',
        'cif_name',
        'outstanding',
        'dpd',
        'collectability',
        'eadAmt',
        'pvDcfAmt',
        'eclIaAmt',
        'status',
    ],
    filterAliases: {
        reportPeriod: 'reportPeriod',
        downloadDate: 'dateFrom',
        'date_range.start': 'dateFrom',
        'date_range.from': 'dateFrom',
        'date_range.end': 'dateTo',
        'date_range.to': 'dateTo',
    },
}

function getIndividualImpairmentApiBase(c: Context): string {
    return c.req.path.startsWith('/api/v2/')
        ? '/api/v2/individual-impairment'
        : '/api/v1/banking/individual/impairment'
}

const stringFilter = (value: unknown): string | undefined => {
    if (value === undefined || value === null) return undefined
    if (Array.isArray(value)) return value[0] === undefined ? undefined : String(value[0])
    return String(value)
}

export class IndividualImpairmentController {
    private individualImpairmentService: any;

    constructor(service: any = individualImpairmentService) {
        this.individualImpairmentService = service;
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

            const result = await this.individualImpairmentService.getWatchlist(user.tenantId, {
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

            return c.json(buildListResponse(
                result.data,
                query,
                pagination,
                {
                    debug: {
                        endpoint: `GET ${getIndividualImpairmentApiBase(c)}/watchlist`,
                        selectedSource: 'FRS9_MASTER_ACCOUNT',
                        sourceTables: ['public.frs9_master_account', 'public.frs9_imp_ia_header'],
                        filtersApplied: {
                            search: query.search,
                            ...filters,
                        },
                        sqlPreview: `SELECT A.PRC_DATE AS DOWNLOAD_DATE, A.CIF_NUMBER AS CUSTOMER_NUMBER, A.CIF_NAME AS CUSTOMER_NAME, A.ACCOUNT_NUMBER, A.CURRENCY, A.OUTSTANDING, A.DPD AS DAY_PAST_DUE, A.COLLECTABILITY, A.EXT_RATING_CODE AS RATING FROM FRS9_MASTER_ACCOUNT A WHERE A.DPD > 30 AND A.OUTSTANDING >= 1000000 AND NOT EXISTS (SELECT 1 FROM FRS9_IMP_IA_HEADER B WHERE A.ACCOUNT_ID = B.ACCOUNT_ID AND B.IMPAIRED_FLAG = 'I')`,
                        notes: ['Matches techspec Individual Watchlist. Existing T impaired flag rows are also excluded for compatibility with the current override flow.'],
                    },
                },
            ));
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

            const result = await this.individualImpairmentService.getCustomerList(user.tenantId, {
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
            const data = await this.individualImpairmentService.addToWatchlist({
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
            await this.individualImpairmentService.removeFromWatchlist(id, tenantId);
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

            const data = await this.individualImpairmentService.getAssessment(user.tenantId, accountId);
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
            
            const data = await this.individualImpairmentService.submitAssessment(id, comments, user.id);
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
            
            const data = await this.individualImpairmentService.approveAssessment(id, comments, user.id);
            
            if (comments) {
                await this.saveCheckerComment(id, 'APPROVE', comments, user.id);
            }
            
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
            
            const data = await this.individualImpairmentService.rejectAssessment(id, reason, user.id);
            
            if (reason) {
                await this.saveCheckerComment(id, 'REJECT', reason, user.id);
            }
            
            return c.json({ success: true, data: data });
        } catch (error: any) {
            return this.handleError(c, error);
        }
    }

    private async saveCheckerComment(accountId: number, action: string, comment: string, userId: string) {
        try {
            const storageDir = path.resolve(process.cwd(), 'storage', 'individual-impairment', 'documents', String(accountId));
            await fs.mkdir(storageDir, { recursive: true });
            const fileName = `Checker_${action}_${new Date().toISOString().slice(0, 10)}.txt`;
            const content = `Checker ${action} by ${userId} on ${new Date().toISOString()}\n\nComment: ${comment}`;
            await fs.writeFile(path.join(storageDir, fileName), content, 'utf-8');
        } catch (e) {
            console.warn('Failed to save checker comment document:', e);
        }
    }

    async resetAssessment(c: Context) {
        try {
            const user = c.get('user');
            if (!user?.tenantId) return this.unauthorized(c);

            const id = Number(c.req.param('id'));
            const data = await this.individualImpairmentService.resetAssessment(id, user.id);
            return c.json(data);
        } catch (error: any) {
            return this.handleError(c, error);
        }
    }

    async createAssessment(c: Context) {
        try {
            const user = c.get('user');
            if (!user?.tenantId) return this.unauthorized(c);

            const body = await c.req.json();
            const data = await this.individualImpairmentService.createAssessment({
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

            const data = await this.individualImpairmentService.getOverrides(user.tenantId, {
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

            if (isIndividualImpairmentV2Path(c.req.path)) {
                const accountNumber = String(body?.accountNumber || body?.account_number || '').trim()
                const customerName = String(body?.customerName || body?.customer_name || '').trim()
                const approvalPayload = {
                    ...body,
                    tenantId: user.tenantId,
                    requestedBy: user.id,
                    createdBy: user.id,
                }

                const approvalRequest = await Effect.runPromise(createApprovalRequest({
                    tenantId: user.tenantId,
                    entityType: INDIVIDUAL_IMPAIRMENT_V2_ENTITY_TYPE,
                    entityId: accountNumber || undefined,
                    title: `Individual impairment override${accountNumber ? ` - ${accountNumber}` : ''}`,
                    description: `Request override${customerName ? ` for ${customerName}` : ''}${accountNumber ? ` (${accountNumber})` : ''}`,
                    requestData: {
                        operation: 'create',
                        entityType: INDIVIDUAL_IMPAIRMENT_V2_ENTITY_TYPE,
                        subtype: INDIVIDUAL_IMPAIRMENT_V2_SUBTYPES.OVERRIDE,
                        apiVersion: 'v2',
                        sourceApi: getIndividualImpairmentApiBase(c),
                        data: approvalPayload,
                    },
                    requestedBy: user.id,
                    impactLevel: 'high',
                    bankingMode: c.req.query('mode') || c.req.header('x-banking-mode') || undefined,
                }))

                return c.json(formatApprovalRequiredResponse(approvalRequest), 202)
            }

            const data = await this.individualImpairmentService.createOverride({
                ...body,
                tenantId: user.tenantId,
                requestedBy: user.id,
                createdBy: user.id,
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

    // ================= DOCUMENTS =================

    async listDocuments(c: Context) {
        try {
            const user = c.get('user');
            if (!user?.tenantId) return c.json({ success: false, message: 'Unauthorized' }, 401);

            const accountId = c.req.param('accountId');
            const safeAccountId = String(accountId || '').replace(/[^0-9]/g, '');
            if (!safeAccountId) {
                return c.json({ success: false, message: 'Invalid account ID' }, 400);
            }

            const storageDir = path.resolve(process.cwd(), 'storage', 'individual-impairment', 'documents', safeAccountId);
            let files: any[] = [];

            try {
                const dirEntries = await fs.readdir(storageDir);
                const metaCache = new Map<string, any>();

                // First pass: load metadata
                for (const name of dirEntries) {
                    if (name.endsWith('.meta.json')) {
                        try {
                            const metaContent = await fs.readFile(path.join(storageDir, name), 'utf-8');
                            const meta = JSON.parse(metaContent);
                            const baseName = name.slice(0, -10); // remove '.meta.json'
                            metaCache.set(baseName, meta);
                        } catch { /* skip invalid meta */ }
                    }
                }

                // Second pass: build file list (skip meta files)
                for (const name of dirEntries) {
                    if (name.endsWith('.meta.json')) continue;
                    const fullPath = path.join(storageDir, name);
                    const stat = await fs.stat(fullPath);
                    if (stat.isFile()) {
                        const cached = metaCache.get(name);
                        let source = cached?.source || 'maker';

                        // Naming-based detection for checker comment files
                        if (source === 'maker' && /^Checker_(APPROVE|REJECT)_\d{4}-\d{2}-\d{2}\.txt$/i.test(name)) {
                            source = 'checker';
                        }

                        files.push({
                            name,
                            filename: name,
                            size: stat.size,
                            source,
                            uploaded_at: cached?.uploadedAt || stat.mtime.toISOString(),
                            account_id: Number(safeAccountId)
                        });
                    }
                }
            } catch {
                // Directory doesn't exist yet — return empty list
            }

            files.sort((a, b) => new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime());

            return c.json({ success: true, data: files });
        } catch (error: any) {
            return this.handleError(c, error);
        }
    }

    async downloadDocument(c: Context) {
        try {
            const user = c.get('user');
            if (!user?.tenantId) return c.json({ success: false, message: 'Unauthorized' }, 401);

            const fileName = c.req.param('fileName');
            const safeName = String(fileName || '').replace(/[^a-zA-Z0-9._-]+/g, '')
            if (!safeName || safeName !== fileName || safeName === '.' || safeName === '..') {
                return c.json({ success: false, message: 'Invalid file name' }, 400);
            }

            // Search across all account subdirectories for the file
            const baseDir = path.resolve(process.cwd(), 'storage', 'individual-impairment', 'documents');
            let filePath = '';

            try {
                const accountDirs = await fs.readdir(baseDir);
                for (const dir of accountDirs) {
                    const candidate = path.resolve(baseDir, dir, safeName);
                    if (candidate.startsWith(baseDir + path.sep)) {
                        try {
                            await fs.access(candidate);
                            filePath = candidate;
                            break;
                        } catch { /* not in this dir */ }
                    }
                }
            } catch {
                return c.json({ success: false, message: 'File not found' }, 404);
            }

            if (!filePath) {
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

    async uploadDocument(c: Context) {
        try {
            const user = c.get('user');
            if (!user?.tenantId) return c.json({ success: false, message: 'Unauthorized' }, 401);

            const accountId = c.req.param('accountId');
            const safeAccountId = String(accountId || '').replace(/[^0-9]/g, '');
            if (!safeAccountId) {
                return c.json({ success: false, message: 'Invalid account ID' }, 400);
            }

            const formData = await c.req.formData();
            const file = formData.get('file');
            if (!file || !(file instanceof File)) {
                return c.json({ success: false, message: 'No file provided' }, 400);
            }

            const storageDir = path.resolve(process.cwd(), 'storage', 'individual-impairment', 'documents', safeAccountId);
            await fs.mkdir(storageDir, { recursive: true });

            const buffer = await file.arrayBuffer();
            const filePath = path.resolve(storageDir, file.name);
            if (!filePath.startsWith(storageDir + path.sep)) {
                return c.json({ success: false, message: 'Invalid file name' }, 400);
            }

            await fs.writeFile(filePath, Buffer.from(buffer));

            // Extract metadata.source from formData if provided
            let source = 'maker';
            try {
                const metadataRaw = formData.get('metadata');
                if (metadataRaw) {
                    const metadata = JSON.parse(String(metadataRaw));
                    if (metadata?.source) source = String(metadata.source);
                }
            } catch { /* ignore invalid metadata */ }

            // Persist source metadata alongside the file
            const metaPath = filePath + '.meta.json';
            await fs.writeFile(metaPath, JSON.stringify({ source, uploadedAt: new Date().toISOString() }));

            return c.json({
                success: true,
                message: 'File uploaded successfully',
                data: {
                    name: file.name,
                    filename: file.name,
                    size: file.size,
                    source,
                    uploaded_at: new Date().toISOString(),
                    account_id: Number(safeAccountId)
                }
            });
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

            const data = await this.individualImpairmentService.getAuditTrails(user.tenantId, { entityType, limit, offset });

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

            const data = await this.individualImpairmentService.getAssessmentHistory(user.tenantId, accountId);
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

            const query = parseListQuery(c, INDIVIDUAL_REPORT_LIST_QUERY_CONFIG);
            const filters = query.filters;

            const result = await this.individualImpairmentService.getReports(user.tenantId, {
                search: query.search,
                reportPeriod: stringFilter(filters.reportPeriod),
                dateFrom: stringFilter(filters.dateFrom),
                dateTo: stringFilter(filters.dateTo),
                status: stringFilter(filters.status),
                impaired_flag: stringFilter(filters.impaired_flag),
                accountNumber: stringFilter(filters.account_number),
                cifName: stringFilter(filters.cif_name),
                limit: query.limit,
                offset: query.offset,
                sort: query.sort,
            });

            return c.json(buildListResponse(
                result.data,
                query,
                buildOffsetPagination(query, result.total ?? 0),
                {
                    debug: {
                        endpoint: `GET ${getIndividualImpairmentApiBase(c)}/reports`,
                        selectedSource: 'FRS9_IMP_IA_HEADER',
                        sourceTables: ['public.frs9_imp_ia_header'],
                        filtersApplied: {
                            search: query.search,
                            ...filters,
                        },
                        sqlPreview: `SELECT PRC_DATE AS DOWNLOAD_DATE, CIF_NUMBER AS CUSTOMER_NUMBER, CIF_NAME AS CUSTOMER_NAME, ACCOUNT_NUMBER, CURRENCY, OUTSTANDING, DPD AS DAY_PAST_DUE, COLLECTABILITY, RATING_CODE AS RATING, EAD_AMT, PV_DCF_AMT, ECL_IA_AMT, STATUS FROM FRS9_IMP_IA_HEADER WHERE IMPAIRED_FLAG = 'I'`,
                        notes: ['Matches techspec List of Individual Report. Compatibility also includes legacy T impaired flag rows.'],
                    },
                },
            ));
        } catch (error: any) {
            if (error instanceof ListQueryValidationError) return this.listQueryBadRequest(c, error);
            return this.handleError(c, error);
        }
    }

    async createReport(c: Context) {
        try {
            const user = c.get('user');
            if (!user?.tenantId) return this.unauthorized(c);

            const body = await c.req.json();
            const data = await this.individualImpairmentService.createReport({
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

            const data = await this.individualImpairmentService.getScenarios(user.tenantId, { status, accountId });
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
            const data = await this.individualImpairmentService.createScenario({
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

            const data = await this.individualImpairmentService.updateScenarioStatus(id, tenantId, status, userId);
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

            const data = await this.individualImpairmentService.getDcfUploads(user.tenantId);
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
            const data = await this.individualImpairmentService.getDcfCashflows(tenantId, uploadId);
            return c.json({ success: true, data });
        } catch (error: any) {
            return this.handleError(c, error);
        }
    }
    async getDcfCalculations(c: Context) {
        try {
            const user = c.get('user');
            if (!user?.tenantId) return this.unauthorized(c);

            const data = await this.individualImpairmentService.getDcfCalculations(user.tenantId);
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

            const data = await this.individualImpairmentService.getIaResultDetail(user.tenantId, {
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
            const data = await this.individualImpairmentService.calculateDcf(user.tenantId, {
                ...body,
                userId: user.id,
                host: c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'web'
            });

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
            const { fileName, batchId, cashflows, scenario } = body;

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
            const inserted = await this.individualImpairmentService.createDcfCashflows({
                cashflows: cashflowData,
                scenario
            });

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

        // 2. Conflict Errors (Hardened v2)
        if (msg.includes('duplicate') || msg.includes('unique constraint') || msg.includes('already exists') || error.code === '23505') {
            const errorDetails = {
                message: msg,
                code: error.code,
                detail: error.detail,
                table: error.table,
                constraint: error.constraint,
                internal: JSON.parse(JSON.stringify(error, Object.getOwnPropertyNames(error)))
            };
            const detailedMsg = `[HARDENED-V2] Conflict detected: ${msg} | Constraint: ${error.constraint || 'unknown'}`;
            
            return c.json(buildErrorResponse(c, { 
                error: detailedMsg, 
                message: detailedMsg, 
                code: 'CONFLICT',
                details: errorDetails
            }), 409);
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
            const summary = await this.individualImpairmentService.getWatchlistSummary(user.tenantId, date);
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

    // Get Assessment Summary (Status Breakdown)
    async getAssessmentSummary(c: Context) {
        try {
            const user = c.get('user');
            if (!user?.tenantId) return this.unauthorized(c);
            
            const date = c.req.query('date');
            const summary = await this.individualImpairmentService.getAssessmentSummary(user.tenantId, date);
            return c.json({ success: true, data: summary });
        } catch (error: any) {
            return this.handleError(c, error);
        }
    }
}

export const individualImpairmentController = new IndividualImpairmentController();
