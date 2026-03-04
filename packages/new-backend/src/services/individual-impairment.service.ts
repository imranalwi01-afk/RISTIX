// @ts-nocheck

import { db, legacyDb } from '../config';
import {
    frs9ImpIaHeader,
    frs9ImpIaDetail,
    frs9ImpIaDcf,
    frs9ImpIaResultH,
    frs9ImpIaResultD
} from '../db/schema/legacy';
import { frs9MasterAccount, users, individualImpairmentScenarios } from '../db/schema';
import { and, eq, desc, sql, inArray, ilike, or } from 'drizzle-orm';


// Helper to map Legacy Status (Int) <-> Frontend Status (String)
// Assumption: 0=Pending, 1=Approved, 2=Rejected
const STATUS_MAP_TO_STRING: Record<number, string> = {
    0: 'PENDING',
    1: 'APPROVED',
    2: 'REJECTED'
};
const STATUS_MAP_TO_INT: Record<string, number> = {
    'PENDING': 0,
    'APPROVED': 1,
    'REJECTED': 2
};

export class IndividualImpairmentService {

    // =========================================================================
    // AUDIT TRAIL / HISTORY
    // =========================================================================

    async getAuditTrails(tenantId: string, filters: { entityType?: string; limit?: number; offset?: number }) {
        return []; // Generic audit not supported in legacy
    }

    async getAssessmentHistory(tenantId: string, accountId: number) {
        try {
            // Fetch the Assessment Record
            const result = await legacyDb.select()
                .from(frs9ImpIaHeader)
                .where(eq(frs9ImpIaHeader.accountId, Number(accountId)))
                .limit(1);

            if (!result.length) return [];

            const row = result[0];
            const history = [];

            // 1. Creation Event
            if (row.createddate) {
                history.push({
                    id: `HIST-C-${row.pkid}`,
                    entityId: row.pkid.toString(),
                    entityType: 'ASSESSMENT',
                    action: 'CREATE',
                    actor: row.createdby,
                    timestamp: row.createddate,
                    details: 'Assessment created',
                    status: 'PENDING'
                });
            }

            // 2. Update Event
            if (row.updateddate) {
                history.push({
                    id: `HIST-U-${row.pkid}`,
                    entityId: row.pkid.toString(),
                    entityType: 'ASSESSMENT',
                    action: 'UPDATE',
                    actor: row.updatedby || 'SYSTEM',
                    timestamp: row.updateddate,
                    details: row.triggerRemarks || 'Assessment details updated',
                    status: STATUS_MAP_TO_STRING[row.status] || 'IN_PROGRESS'
                });
            }

            // 3. Review Event
            if (row.revieweddate) {
                history.push({
                    id: `HIST-R-${row.pkid}`,
                    entityId: row.pkid.toString(),
                    entityType: 'ASSESSMENT',
                    action: 'REVIEW',
                    actor: row.reviewedby || 'SYSTEM',
                    timestamp: row.revieweddate,
                    details: 'Assessment reviewed',
                    status: 'REVIEWED'
                });
            }

            // Sort by timestamp desc
            return history.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        } catch (error) {
            console.error('❌ Error fetching assessment history:', error);
            return [];
        }
    }

    async createAuditLog(entry: any) {
        return [];
    }

    // =========================================================================
    // LIST OF INDIVIDUAL REPORT (1.4.2) -> frs9_imp_ia_result_h
    // =========================================================================

    async getReports(tenantId: string, filters: { reportPeriod?: string; limit?: number; offset?: number }) {
        const { reportPeriod, limit = 50, offset = 0 } = filters;
        const conditions = [];

        if (reportPeriod) {
            conditions.push(sql`TO_CHAR(${frs9ImpIaResultH.prcDate}, 'YYYY-MM') = ${reportPeriod}`);
        }

        return legacyDb.select()
            .from(frs9ImpIaResultH)
            .where(and(...conditions))
            .orderBy(desc(frs9ImpIaResultH.createddate))
            .limit(limit)
            .offset(offset);
    }

    async createReport(data: any) {
        return legacyDb.insert(frs9ImpIaResultH).values(data).returning();
    }

    // =========================================================================
    // REVIEW SCENARIO DETAILS (1.4.4)
    // =========================================================================

    async getScenarios(tenantId: string, filters: { status?: string; limit?: number; offset?: number; accountId?: number }) {
        try {
            // Base conditions: Active scenarios only by default
            const conditions = [eq(individualImpairmentScenarios.isActive, true)];

            // Filter by Account ID if provided
            if (filters.accountId) {
                conditions.push(eq(individualImpairmentScenarios.accountId, BigInt(filters.accountId)));
            }

            // Execute Query
            const results = await db.select()
                .from(individualImpairmentScenarios)
                .where(and(...conditions))
                .orderBy(desc(individualImpairmentScenarios.createdAt));

            // Map DB result to Frontend format
            return results.map(r => ({
                pkid: r.id,
                scenarioCode: r.name.toUpperCase().replace(/\s+/g, '_'),
                scenarioName: r.name,
                description: `Scenario with DR=${r.discountRate}%, RR=${r.recoveryRate}%, GR=${r.growthRate}%`,
                status: 'APPROVED',
                activeFlag: r.isActive,
                createdDate: r.createdAt?.toISOString(),
                createdBy: r.createdBy || 'System',
                discountRate: r.discountRate,
                recoveryRate: r.recoveryRate,
                growthRate: r.growthRate,
                timeHorizon: r.timeHorizon,
                paymentFrequency: r.paymentFrequency
            }));

        } catch (error) {
            console.error('Error fetching scenarios:', error);
            return [];
        }
    }

    async createScenario(data: any) {
        try {
            const [inserted] = await db.insert(individualImpairmentScenarios).values({
                accountId: BigInt(data.accountId || 0), // 0 if global template? But schema says not null.
                name: data.scenarioName,
                discountRate: Number(data.discountRate || 0),
                recoveryRate: Number(data.recoveryRate || 0),
                growthRate: Number(data.growthRate || 0),
                timeHorizon: Number(data.timeHorizon || 60),
                paymentFrequency: data.paymentFrequency || 'monthly',
                createdBy: data.createdBy || 'System',
                isActive: true
            }).returning();

            return [{
                pkid: inserted.id,
                scenarioCode: inserted.name.toUpperCase().replace(/\s+/g, '_'),
                scenarioName: inserted.name,
                status: 'APPROVED',
                activeFlag: inserted.isActive,
                createdDate: inserted.createdAt?.toISOString(),
                createdBy: inserted.createdBy,
                discountRate: inserted.discountRate,
                recoveryRate: inserted.recoveryRate,
                growthRate: inserted.growthRate
            }];
        } catch (error) {
            console.error('Error creating scenario:', error);
            throw error;
        }
    }

    async updateScenarioStatus(id: string, tenantId: string, status: string, approverId?: string) {
        // Not implemented fully yet as table structure is simple
        return [];
    }

    // =========================================================================
    // REVIEW DCF UPLOAD (1.4.6) & CASHFLOW (1.4.7) -> frs9_imp_ia_dcf
    // =========================================================================

    async getDcfUploads(tenantId: string, limit = 50, offset = 0) {
        return legacyDb.select()
            .from(frs9ImpIaDcf)
            .orderBy(desc(frs9ImpIaDcf.createddate))
            .limit(limit)
            .offset(offset);
    }

    async createDcfUpload(data: any) {
        const iaId = await this.generateIaId();
        return legacyDb.insert(frs9ImpIaDcf).values({
            ...data,
            iaId,
            createdby: 'SYSTEM',
            createddate: new Date().toISOString(),
            createdhost: 'localhost',
            status: '0' // Default status
        }).returning();
    }

    async getDcfCashflows(tenantId: string, uploadId: string) {
        return legacyDb.select()
            .from(frs9ImpIaDcf)
            .where(eq(frs9ImpIaDcf.iaId, Number(uploadId)))
            .orderBy(frs9ImpIaDcf.periode);
    }

    async getDcfCalculations(tenantId: string) {
        // Mengambil 100 data kalkulasi terakhir dari tabel Result Header
        return await legacyDb.select()
            .from(frs9ImpIaResultH)
            .orderBy(desc(frs9ImpIaResultH.createddate))
            .limit(100);
    }

    async createDcfCashflows(data: any[]) {
        return [];
    }

    async calculateDcf(tenantId: string, params: any) {
        const { accountId, assumptions } = params;

        // 1. Ambil Data Akun
        const account = await this.getAssessment(tenantId, accountId);
        if (!account) throw new Error("Account not found");
        const outstanding = Number(account.outstanding_balance) || 0;

        // 2. Hitung PV (Discounted Cash Flow)
        const discountRate = (Number(assumptions.discountRate) || 12) / 100;
        const growthRate = (Number(assumptions.projectedGrowthRate) || 0) / 100;
        const timeHorizon = Number(assumptions.timeHorizon) || 12;
        let pv = 0;
        let details = [];
        const r_m = discountRate / 12;
        const g_m = growthRate / 12;
        const baseMonthlyFlow = outstanding / timeHorizon;
        for (let t = 1; t <= timeHorizon; t++) {
            const cf = baseMonthlyFlow * Math.pow(1 + g_m, t);
            const df = 1 / Math.pow(1 + r_m, t);
            const presentValue = cf * df;

            pv += presentValue;

            details.push({
                period: t,
                cashflow: cf,
                discountFactor: df,
                pv: presentValue
            });
        }

        // 3. Hitung LGD & Provision
        const lgd = Math.max(0, outstanding - pv);
        const provision = lgd;
        // --- PERSISTENCE: Save Result Header ---
        let savedId = null;
        try {
            const [saved] = await legacyDb.insert(frs9ImpIaResultH).values({
                prcDate: new Date().toISOString().split('T')[0],
                accountId: accountId,
                outstanding: outstanding.toString(),
                pvDcfAmt: pv.toString(),
                eclIaAmt: provision.toString(),
                createdby: 'SYSTEM',
                createddate: new Date().toISOString()
            }).returning();
            if (saved) savedId = saved.pkid;
        } catch (e) {
            console.error('Failed to persist DCF Result:', e);
        }
        return {
            account_id: accountId,
            scenario: assumptions.scenarioType || 'base',
            presentValue: pv,
            outstanding: outstanding,
            lgd: lgd,
            recommendedProvision: provision,
            assumptions: assumptions,
            details: details,
            savedId: savedId
        };
    }

    // =========================================================================
    // WATCHLIST (1.4.1) -> frs9_imp_ia_header
    // =========================================================================

    async getWatchlist(tenantId: string, filters: {
        search?: string;
        stage?: number;
        impaired_flag?: string;
        status?: string;
        rating_code?: string;
        dateFrom?: string;
        dateTo?: string;
        limit?: number;
        offset?: number
    }) {
        try {
            const { limit = 50, offset = 0, search, stage, impaired_flag, status, rating_code, dateFrom, dateTo } = filters;

            // 1. Build Query Conditions for Master Account (Source Data)
            const conditions = [];

            if (search) {
                conditions.push(or(
                    ilike(frs9MasterAccount.accountNumber, `%${search}%`),
                    ilike(frs9MasterAccount.cifName, `%${search}%`),
                    ilike(frs9MasterAccount.cifNumber, `%${search}%`)
                ));
            }

            if (dateFrom) {
                conditions.push(sql`${frs9MasterAccount.prcDate} >= ${dateFrom}`);
            }

            if (dateTo) {
                conditions.push(sql`${frs9MasterAccount.prcDate} <= ${dateTo}`);
            }

            if (rating_code) {
                conditions.push(eq(frs9MasterAccount.internalRatingCode, rating_code));
            }

            if (stage) {
                conditions.push(eq(frs9MasterAccount.stage, String(stage)));
            }

            if (impaired_flag) {
                conditions.push(eq(frs9MasterAccount.impairedFlag, impaired_flag === 'I'));
            }

            // 2. Fetch Total Count
            const countResult = await legacyDb.select({ count: sql<number>`count(*)` })
                .from(frs9MasterAccount)
                .where(and(...conditions));

            const total = Number(countResult[0]?.count || 0);

            if (total === 0) return { data: [], total: 0 };

            // 3. Fetch Paginated Results from Master Account
            const results = await legacyDb.select()
                .from(frs9MasterAccount)
                .where(and(...conditions))
                .orderBy(desc(frs9MasterAccount.prcDate), desc(frs9MasterAccount.outstanding))
                .limit(limit)
                .offset(offset);

            // 4. Fetch Overrides (Manual Interventions) from Header
            const accountNumbers = results.map(r => r.accountNumber).filter((n): n is string => !!n);
            const overrides = accountNumbers.length > 0
                ? await legacyDb.select()
                    .from(frs9ImpIaHeader)
                    .where(inArray(frs9ImpIaHeader.accountNumber, accountNumbers))
                : [];

            // 5. Merge Logic: Override > Master Account
            const mergedData = results.map(row => {
                const override = overrides.find(o => o.accountNumber === row.accountNumber);

                // Base values from Master Account
                let currentStage = Number(row.stage) || 1;
                let currentStatus = 'PENDING'; // Master accounts are pending assessment by default
                let currentNotes = '';
                let currentImpaired = row.impairedFlag ? 'I' : 'N';

                if (override) {
                    currentStage = override.impairedFlag === 'T' ? 3 : 1;
                    currentStatus = STATUS_MAP_TO_STRING[override.status as number] || 'IN_PROGRESS';
                    currentNotes = override.triggerRemarks || 'Manual Override';
                    currentImpaired = override.impairedFlag === 'T' ? 'I' : 'N';
                }

                return {
                    pkid: Number(row.pkid), // Use actual unique row ID
                    ia_id: override ? Number(override.iaId) : null,
                    prc_date: row.prcDate,
                    eff_date: row.prcDate,
                    cif_number: row.cifNumber,
                    cif_name: row.cifName,
                    account_id: Number(row.accountId),
                    account_number: row.accountNumber,
                    currency: row.currency,
                    eff_interest_rate: Number(row.effInterestRate || 0),
                    interest_rate: Number(row.interestRate || 0),
                    dpd: row.dpd || 0,
                    collectability: row.collectability || 0,
                    rating_code: row.internalRatingCode,
                    impaired_flag: currentImpaired,
                    method: 'DCF',
                    outstanding_balance: Number(row.outstanding || 0),
                    provision_amount: Number(row.eclFinalAmt || 0),
                    ecl_amount: Number(row.eclFinalAmt || 0),
                    stage: currentStage,
                    priority_level: (Number(row.outstanding) > 1000000000) ? 'HIGH' : 'MEDIUM',
                    assessment_status: currentStatus,
                    notes: currentNotes,
                    createdby: 'SYSTEM',
                    createddate: row.prcDate, // Use process date as creation date for list
                    is_override: !!override
                };
            });

            // 6. Final Filter (Status filtering applies to Overrides primarily)
            let filteredResponse = mergedData;
            if (status) {
                filteredResponse = mergedData.filter(item => item.assessment_status === status);
            }

            return {
                data: filteredResponse,
                total: total
            };
        } catch (error) {
            console.error('❌ Database Query Failed in getWatchlist:', error);
            return { data: [], total: 0 };
        }
    }



    async addToWatchlist(data: any) {
        const iaId = await this.generateIaId();
        return legacyDb.insert(frs9ImpIaHeader).values({
            ...data,
            iaId,
            createdby: 'SYSTEM',
            createddate: new Date().toISOString(),
            createdhost: 'localhost',
        }).returning();
    }

    async removeFromWatchlist(accountId: string | number, tenantId: string) {
        return legacyDb.delete(frs9ImpIaHeader)
            .where(eq(frs9ImpIaHeader.accountId, Number(accountId)))
            .returning();
    }

    // =========================================================================
    // ASSESSMENT MANAGEMENT (1.4.2)
    // =========================================================================

    async getAssessment(tenantId: string, accountId: number) {
        // 1. Try to fetch existing assessment/override from Header
        const result = await legacyDb.select()
            .from(frs9ImpIaHeader)
            .where(eq(frs9ImpIaHeader.accountId, Number(accountId)))
            .orderBy(desc(frs9ImpIaHeader.createddate))
            .limit(1);

        if (result.length > 0) {
            const row = result[0];
            return {
                pkid: row.pkid,
                ia_id: Number(row.iaId),
                account_id: Number(row.accountId),
                account_number: row.accountNumber,
                cif_number: row.cifNumber,
                cif_name: row.cifName,
                prc_date: row.prcDate,
                eff_date: row.effDate,
                currency: row.currency,
                outstanding_balance: Number(row.outstanding),
                interest_rate: row.interestRate,
                eff_interest_rate: row.effInterestRate,
                dpd: row.dpd,
                collectability: row.collectability,
                rating_code: row.ratingCode,
                impaired_flag: row.impairedFlag === 'T' ? 'I' : 'N',
                method: row.method,
                stage: row.impairedFlag === 'T' ? 3 : 1,
                previous_stage: 1, // Placeholder
                impairment_reason: row.triggerRemarks, // Mapping trigger remarks to reason
                assessment_basis: 'Individual Assessment', // Default
                supporting_documents: row.triggerFilename ? [row.triggerFilename] : [],
                analyst_comments: row.triggerRemarks, // Mapping trigger remarks to comments
                reviewer_comments: null,
                // Map status to Approval Status string
                approval_status: STATUS_MAP_TO_STRING[row.status] || 'PENDING',
                createdby: row.createdby,
                createddate: row.createddate,
                updatedby: row.updatedby,
                updateddate: row.updateddate,
                is_override: true
            };
        }

        // 2. If not found, fetch from Master Account (Source Data)
        // Note: accountId param here corresponds to frs9MasterAccount.accountId
        const masterResult = await legacyDb.select()
            .from(frs9MasterAccount)
            .where(eq(frs9MasterAccount.accountId, Number(accountId)))
            .limit(1);

        if (masterResult.length > 0) {
            const row = masterResult[0];
            return {
                pkid: Number(row.pkid), // Use master pkid
                ia_id: null,
                account_id: Number(row.accountId),
                account_number: row.accountNumber,
                cif_number: row.cifNumber,
                cif_name: row.cifName,
                prc_date: row.prcDate,
                eff_date: row.prcDate,
                currency: row.currency,
                outstanding_balance: Number(row.outstanding),
                interest_rate: Number(row.interestRate || 0),
                eff_interest_rate: Number(row.effInterestRate || 0),
                dpd: row.dpd || 0,
                collectability: row.collectability || 0,
                rating_code: row.internalRatingCode,
                impaired_flag: row.impairedFlag ? 'I' : 'N',
                method: 'DCF',
                stage: Number(row.stage) || 1,
                previous_stage: 1,
                impairment_reason: '',
                assessment_basis: 'Individual Assessment',
                supporting_documents: [],
                analyst_comments: '',
                reviewer_comments: null,
                approval_status: 'PENDING', // Default for new assessment
                createdby: 'SYSTEM',
                createddate: row.prcDate,
                updatedby: null,
                updateddate: null,
                is_override: false
            };
        }

        return null;
    }

    async createAssessment(data: any) {
        // Robust UPSERT logic for Assessment
        const accountId = Number(data.account_id || data.accountId);
        if (!accountId) throw new Error("Account ID is required for assessment creation");

        // 1. Check if record exists
        const existing = await legacyDb.select()
            .from(frs9ImpIaHeader)
            .where(eq(frs9ImpIaHeader.accountId, accountId))
            .limit(1);

        const statusInt = STATUS_MAP_TO_INT[data.approval_status || 'PENDING'] ?? 0;
        const remarks = data.analyst_comments || data.justification || '';
        const userId = (data.createdby || data.createdBy || 'SYSTEM').slice(0, 36);

        if (existing.length > 0) {
            // UPDATE
            const [updated] = await legacyDb.update(frs9ImpIaHeader)
                .set({
                    // Update relevant fields
                    impairedFlag: data.overrideStage === '3' ? 'T' : 'F',
                    triggerRemarks: remarks,
                    status: statusInt,
                    updatedby: userId,
                    updateddate: new Date().toISOString(),
                    // If stage is provided
                    stage: data.overrideStage ? String(data.overrideStage) : undefined,
                    // Store filename if provided
                    triggerFilename: data.supportingDocument
                })
                .where(eq(frs9ImpIaHeader.pkid, existing[0].pkid))
                .returning();
            return updated; // Return object directly, not array
        } else {
            // INSERT
            // Need to fetch Master Account details to populate required fields if missing
            const masterAccount = await legacyDb.select()
                .from(frs9MasterAccount)
                .where(eq(frs9MasterAccount.accountId, accountId))
                .limit(1);

            if (!masterAccount.length) throw new Error("Master Account not found");
            const ma = masterAccount[0];

            const iaId = await this.generateIaId();
            const today = new Date().toISOString().split('T')[0];

            const [inserted] = await legacyDb.insert(frs9ImpIaHeader).values({
                iaId: iaId,
                prcDate: ma.prcDate || today,
                effDate: ma.prcDate || today,
                cifNumber: ma.cifNumber || 'UNKNOWN',
                cifName: ma.cifName || 'UNKNOWN',
                accountId: accountId,
                accountNumber: ma.accountNumber || 'UNKNOWN',
                currency: ma.currency || 'IDR',
                effInterestRate: Number(ma.effInterestRate || 0),
                interestRate: Number(ma.interestRate || 0),
                impairedFlag: data.overrideStage === '3' ? 'T' : 'F',
                triggerRemarks: remarks,
                status: statusInt,
                createdby: userId,
                createddate: new Date().toISOString(),
                createdhost: 'localhost',

                // Defaults / Mapped from Master
                outstanding: ma.outstanding || "0",
                plafond: ma.plafond || "0",
                accruedInterest: ma.accruedInterest || "0",
                carryingAmt: ma.carryingAmt || "0",
                eadAmt: ma.eadAmt || "0",
                pvDcfAmt: "0",
                eclIaAmt: "0",
                poRate1: 0, poRate2: 0, poRate3: 0,

                // Store filename if provided
                triggerFilename: data.supportingDocument
            }).returning();
            return inserted; // Return object directly
        }
    }

    // =========================================================================
    // OVERRIDE TRIGGER (1.4.3) -> frs9_imp_ia_header
    // =========================================================================

    async getOverrides(tenantId: string, filters: { status?: string; limit?: number; offset?: number }) {
        const { status, limit = 50, offset = 0 } = filters;
        const conditions = [];

        // Map status string to legacy int if present
        if (status) {
            const statusInt = STATUS_MAP_TO_INT[status] ?? 0;
            conditions.push(eq(frs9ImpIaHeader.status, statusInt));
        }

        const results = await legacyDb.select()
            .from(frs9ImpIaHeader)
            .where(and(...conditions))
            .orderBy(desc(frs9ImpIaHeader.createddate))
            .limit(limit)
            .offset(offset);

        // Map back to Frontend structure
        return results.map(row => ({
            id: row.pkid.toString(),
            tenantId: 'legacy', // Hardcode or derive
            customerName: row.cifName,
            accountNumber: row.accountNumber,
            originalStage: '1', // Default or derive from 'impairedFlag'?
            overrideStage: row.impairedFlag === 'T' ? '3' : '2', // Rough mapping
            justification: row.triggerRemarks,
            status: STATUS_MAP_TO_STRING[row.status] || 'PENDING',
            createdAt: row.createddate,
            createdBy: row.createdby,
            documentUrl: row.triggerFilename
        }));
    }

    async createOverride(data: any) {
        const statusInt = STATUS_MAP_TO_INT[data.status] ?? 0;
        const accountNumber = data.accountNumber || '0';

        // 1. Lookup Account ID from Master Account
        const account = await legacyDb.select({ id: frs9MasterAccount.accountId })
            .from(frs9MasterAccount)
            .where(eq(frs9MasterAccount.accountNumber, accountNumber))
            .limit(1);

        const realAccountId = account[0]?.id;

        if (!realAccountId) {
            throw new Error(`Account Number ${accountNumber} not found in Master Data.`);
        }

        // 2. Check if Override already exists for this Account
        const existing = await legacyDb.select()
            .from(frs9ImpIaHeader)
            .where(eq(frs9ImpIaHeader.accountId, realAccountId))
            .limit(1);

        if (existing.length > 0) {
            // UPSERT: Update existing record
            const updated = await legacyDb.update(frs9ImpIaHeader)
                .set({
                    impairedFlag: data.overrideStage === '3' ? 'T' : 'F',
                    triggerRemarks: data.justification,
                    status: statusInt,
                    updatedby: (data.createdBy || 'SYSTEM').slice(0, 36),
                    updateddate: new Date().toISOString(),
                    // Update other fields if necessary
                })
                .where(eq(frs9ImpIaHeader.pkid, existing[0].pkid))
                .returning();
            return updated;
        } else {
            // INSERT: Create new record
            const iaId = await this.generateIaId();
            const today = new Date().toISOString().split('T')[0]; // Format YYYY-MM-DD

            const result = await legacyDb.insert(frs9ImpIaHeader).values({
                iaId: iaId,
                prcDate: today,
                effDate: today,
                cifNumber: data.cifNumber || 'UNKNOWN',
                cifName: data.customerName || 'UNKNOWN',
                accountId: realAccountId,
                accountNumber: accountNumber,
                currency: 'IDR',
                effInterestRate: 0,
                interestRate: 0,
                impairedFlag: data.overrideStage === '3' ? 'T' : 'F',
                triggerRemarks: data.justification,
                status: statusInt,
                createdby: (data.createdBy || 'SYSTEM').slice(0, 36),
                createddate: new Date().toISOString(), // TIMESTAMP column accepts ISO
                createdhost: 'localhost', // Max 36, safe
                // Defaults for NOT NULL constraints
                outstanding: "0",
                plafond: "0",
                accruedInterest: "0",
                carryingAmt: "0",
                eadAmt: "0",
                pvDcfAmt: "0",
                eclIaAmt: "0",
                poRate1: 0, poRate2: 0, poRate3: 0
            }).returning();
            return result;
        }
    }

    async submitAssessment(accountId: number, comments: string, userId: string) {
        // Find existing header
        const existing = await legacyDb.select()
            .from(frs9ImpIaHeader)
            .where(eq(frs9ImpIaHeader.accountId, Number(accountId)))
            .limit(1);

        if (existing.length === 0) {
            // Should not happen in normal flow, but if submitting without saving first
            throw new Error(`Assessment for account ${accountId} not found. Please save first.`);
        }

        const [updated] = await legacyDb.update(frs9ImpIaHeader)
            .set({
                status: STATUS_MAP_TO_INT['PENDING'], // 0
                updatedby: userId,
                updateddate: new Date().toISOString(),
                triggerRemarks: comments
            })
            .where(eq(frs9ImpIaHeader.pkid, existing[0].pkid))
            .returning();

        return updated; // Return object directly
    }

    async approveAssessment(accountId: number, comments: string, userId: string) {
        // Find existing header
        const existing = await legacyDb.select()
            .from(frs9ImpIaHeader)
            .where(eq(frs9ImpIaHeader.accountId, Number(accountId)))
            .limit(1);

        if (existing.length === 0) throw new Error("Assessment not found");

        const [updated] = await legacyDb.update(frs9ImpIaHeader)
            .set({
                status: STATUS_MAP_TO_INT['APPROVED'], // 1
                updatedby: userId,
                updateddate: new Date().toISOString(),
                reviewedby: userId,
                revieweddate: new Date().toISOString()
            })
            .where(eq(frs9ImpIaHeader.pkid, existing[0].pkid))
            .returning();

        return updated; // Return object directly
    }

    async rejectAssessment(accountId: number, reason: string, userId: string) {
        // Find existing header
        const existing = await legacyDb.select()
            .from(frs9ImpIaHeader)
            .where(eq(frs9ImpIaHeader.accountId, Number(accountId)))
            .limit(1);

        if (existing.length === 0) throw new Error("Assessment not found");

        const [updated] = await legacyDb.update(frs9ImpIaHeader)
            .set({
                status: STATUS_MAP_TO_INT['REJECTED'], // 2
                updatedby: userId,
                updateddate: new Date().toISOString(),
                reviewedby: userId,
                revieweddate: new Date().toISOString(),
                triggerRemarks: reason
            })
            .where(eq(frs9ImpIaHeader.pkid, existing[0].pkid))
            .returning();

        return updated; // Return object directly
    }

    private async generateIaId(): Promise<number> {
        const result = await legacyDb.execute(sql`SELECT MAX(ia_id) as max_id FROM frs9_imp_ia_header`);
        const maxId = Number(result[0]?.max_id) || 0;
        return maxId + 1;
    }

    // Get Staging Analysis - unified implementation with filters
    async getStagingAnalysis(tenantId: string, filters: {
        stage?: string;
        segmentId?: string;
        startDate?: string;
        endDate?: string
    } = {}) {
        try {
            // Build WHERE conditions for the master account (base)
            const masterConditions = [];

            if (filters.segmentId) {
                masterConditions.push(sql`m.segment = ${filters.segmentId}`);
            }
            if (filters.startDate) {
                masterConditions.push(sql`m.prc_date >= ${filters.startDate}`);
            }
            if (filters.endDate) {
                masterConditions.push(sql`m.prc_date <= ${filters.endDate}`);
            }

            const masterWhere = masterConditions.length > 0
                ? sql`WHERE ${masterConditions.reduce((acc, condition, index) => index === 0 ? condition : sql`${acc} AND ${condition}`)}`
                : sql``;

            // Derive IA stage from override flag (legacy table has no ia.stage column)
            const iaStageExpr = sql`CASE WHEN ia.impaired_flag = 'T' THEN 3 WHEN ia.impaired_flag = 'F' THEN 1 ELSE NULL END`;
            // We apply the stage filter AFTER computing the final unified stage
            const stageFilter = filters.stage
                ? sql`HAVING COALESCE(MAX(${iaStageExpr}), MAX(ca.stage), MAX(m.stage)) = ${Number(filters.stage)}`
                : sql``;

            const query = sql`
                WITH latest_date AS (
                    SELECT MAX(prc_date) as prc_date FROM frs9_master_account
                )
                SELECT 
                    m.prc_date as "prcDate",
                    COALESCE(MAX(${iaStageExpr}), MAX(ca.stage), MAX(m.stage)) as "stage",
                    m.segment as "segmentId",
                    SUM(CAST(m.outstanding AS DECIMAL)) as "totalOutstanding",
                    SUM(COALESCE(CAST(ia.ecl_ia_amt AS DECIMAL), CAST(ca.ecl_amount AS DECIMAL), 0)) as "totalECL",
                    AVG(CAST(m.outstanding AS DECIMAL)) as "avgOutstanding"
                FROM frs9_master_account m
                LEFT JOIN frs9_imp_ia_header ia 
                    ON m.account_id = ia.account_id AND ia.status = 1 -- Only approved IA overrides
                LEFT JOIN frs9_imp_ca_result_h ca 
                    ON m.account_id = ca.account_id AND m.prc_date = ca.prc_date
                ${masterWhere}
                -- If no date filter is provided, default to the latest date
                ${(!filters.startDate && !filters.endDate) ? sql`AND m.prc_date = (SELECT prc_date FROM latest_date)` : sql``}
                GROUP BY m.prc_date, m.segment
                ${stageFilter}
                ORDER BY m.prc_date DESC, "stage", m.segment
            `;

            const result = await legacyDb.execute(query);
            return result;
        } catch (error) {
            console.error('Error in getStagingAnalysis:', error);
            throw error;
        }
    }

    // Get Watchlist Summary
    async getWatchlistSummary(tenantId: string, date?: string) {
        try {
            // Determine target date safely
            // Smart Default: If no date provided, prioritize latest date with significant data (>10 rows)
            // to avoid showing empty dashboards due to future test dates with few records.
            const targetDateQuery = date
                ? sql`SELECT ${date}::date as target_date`
                : sql`
                    SELECT prc_date as target_date 
                    FROM frs9_master_account 
                    GROUP BY prc_date 
                    ORDER BY (COUNT(*) > 10) DESC, prc_date DESC 
                    LIMIT 1
                `;

            const query = sql`
                WITH target_date_cte AS (
                    ${targetDateQuery}
                ),
                counts AS (
                    SELECT 
                        COUNT(*) as "totalAccounts",
                        COUNT(CASE WHEN impaired_flag = true THEN 1 END) as "impairedAccounts",
                        SUM(CAST(ecl_final_amt AS DECIMAL)) as "totalProvisions"
                    FROM frs9_master_account
                    WHERE prc_date = (SELECT target_date FROM target_date_cte)
                ),
                completed AS (
                    SELECT COUNT(*) as "completedCount"
                    FROM frs9_imp_ia_header
                    WHERE status IN (1, 2) -- Approved or Rejected
                    AND prc_date = (SELECT target_date FROM target_date_cte)
                )
                SELECT 
                    c."totalAccounts",
                    c."impairedAccounts",
                    (c."totalAccounts" - COALESCE(cmp."completedCount", 0)) as "pendingAssessments",
                    c."totalProvisions",
                    (SELECT target_date FROM target_date_cte) as "dataDate"
                FROM counts c
                CROSS JOIN completed cmp
            `;

            const result = await legacyDb.execute(query);
            const row = result[0];
            return {
                totalAccounts: Number(row?.totalAccounts || 0),
                impairedAccounts: Number(row?.impairedAccounts || 0),
                pendingAssessments: Number(row?.pendingAssessments || 0),
                totalProvisions: Number(row?.totalProvisions || 0),
                dataDate: row?.dataDate // Return the actual date used
            };
        } catch (error) {
            console.error('Error in getWatchlistSummary:', error);
            throw error;
        }
    }

    // Get Staging Summary - unified implementation  
    async getStagingSummary(tenantId: string) {
        try {
            // Get latest unified staging summary
            const query = sql`
                WITH latest_date AS (
                    SELECT MAX(prc_date) as prc_date FROM frs9_master_account
                ),
                unified_data AS (
                    SELECT 
                        m.account_id,
                        m.outstanding,
                        COALESCE(
                            CASE WHEN ia.impaired_flag = 'T' THEN 3 WHEN ia.impaired_flag = 'F' THEN 1 ELSE NULL END,
                            ca.stage,
                            m.stage
                        ) as final_stage,
                        COALESCE(ia.ecl_ia_amt, ca.ecl_amount, 0) as final_ecl
                    FROM frs9_master_account m
                    LEFT JOIN frs9_imp_ia_header ia 
                        ON m.account_id = ia.account_id AND ia.status = 1
                    LEFT JOIN frs9_imp_ca_result_h ca 
                        ON m.account_id = ca.account_id AND m.prc_date = ca.prc_date
                    WHERE m.prc_date = (SELECT prc_date FROM latest_date)
                )
                SELECT 
                    SUM(CAST(outstanding AS DECIMAL)) as "totalOutstanding",
                    SUM(CAST(final_ecl AS DECIMAL)) as "totalECL",
                    COUNT(CASE WHEN final_stage = 1 THEN 1 END) as "stage1Count",
                    COUNT(CASE WHEN final_stage = 2 THEN 1 END) as "stage2Count", 
                    COUNT(CASE WHEN final_stage = 3 THEN 1 END) as "stage3Count",
                    SUM(CASE WHEN final_stage = 1 THEN CAST(final_ecl AS DECIMAL) ELSE 0 END) as "stage1ECL",
                    SUM(CASE WHEN final_stage = 2 THEN CAST(final_ecl AS DECIMAL) ELSE 0 END) as "stage2ECL",
                    SUM(CASE WHEN final_stage = 3 THEN CAST(final_ecl AS DECIMAL) ELSE 0 END) as "stage3ECL"
                FROM unified_data
            `;

            const result = await legacyDb.execute(query);
            return result[0] || {
                totalOutstanding: 0,
                totalECL: 0,
                stage1Count: 0,
                stage2Count: 0,
                stage3Count: 0,
                stage1ECL: 0,
                stage2ECL: 0,
                stage3ECL: 0
            };
        } catch (error) {
            console.error('Error in getStagingSummary:', error);
            throw error;
        }
    }
}

export const individualImpairmentService = new IndividualImpairmentService();
