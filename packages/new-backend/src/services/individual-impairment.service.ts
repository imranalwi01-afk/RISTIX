
import { legacyDb } from '../config';
import {
    frs9ImpIaHeader,
    frs9ImpIaDetail,
    frs9ImpIaDcf,
    frs9ImpIaResultH,
    frs9ImpIaResultD
} from '../db/schema/legacy';
import { frs9MasterAccount, users } from '../db/schema';
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
            // Fallback mock history
            return [
                {
                    id: 'HIST-MOCK-1',
                    entityId: String(accountId),
                    entityType: 'ASSESSMENT',
                    action: 'CREATE',
                    actor: 'admin',
                    timestamp: new Date().toISOString(),
                    details: 'Mock Assessment created (Fallback)',
                    status: 'PENDING'
                }
            ];
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

    async getScenarios(tenantId: string, filters: { status?: string; limit?: number; offset?: number }) {
        // Return mock scenarios data for development
        const mockScenarios = [
            {
                pkid: 1,
                scenarioCode: 'BASELINE_2024',
                scenarioName: 'Baseline Scenario 2024',
                description: 'Base economic scenario for 2024 with current market conditions',
                status: 'APPROVED',
                activeFlag: true,
                createdDate: '2024-01-15T00:00:00.000Z',
                createdBy: 'System Admin'
            },
            {
                pkid: 2,
                scenarioCode: 'STRESS_SEVERE',
                scenarioName: 'Severe Stress Scenario',
                description: 'Severe economic stress scenario with 30% GDP contraction and high unemployment',
                status: 'PENDING',
                activeFlag: false,
                createdDate: '2024-02-01T00:00:00.000Z',
                createdBy: 'Risk Manager'
            },
            {
                pkid: 3,
                scenarioCode: 'OPTIMISTIC_GROWTH',
                scenarioName: 'Optimistic Growth Scenario',
                description: 'Optimistic scenario with 5% annual GDP growth and low unemployment',
                status: 'DRAFT',
                activeFlag: false,
                createdDate: '2024-01-20T00:00:00.000Z',
                createdBy: 'Economic Analyst'
            },
            {
                pkid: 4,
                scenarioCode: 'INFLATION_SPIKE',
                scenarioName: 'Inflation Spike Scenario',
                description: 'High inflation scenario with 10% annual inflation rate and interest rate hikes',
                status: 'APPROVED',
                activeFlag: true,
                createdDate: '2024-01-25T00:00:00.000Z',
                createdBy: 'Chief Economist'
            }
        ];

        // Apply filters
        let filteredScenarios = mockScenarios;
        if (filters.status) {
            filteredScenarios = filteredScenarios.filter(s => s.status === filters.status);
        }

        return filteredScenarios;
    }

    async createScenario(data: any) {
        // Create new scenario with mock data
        const newScenario = {
            pkid: Date.now(), // Use timestamp as ID for demo
            scenarioCode: data.scenarioCode,
            scenarioName: data.scenarioName,
            description: data.description || '',
            status: 'DRAFT',
            activeFlag: false,
            createdDate: new Date().toISOString(),
            createdBy: data.createdBy || 'Current User'
        };

        return [newScenario];
    }

    async updateScenarioStatus(id: string, tenantId: string, status: string, approverId?: string) {
        // Update scenario status with mock data
        const updatedScenario = {
            pkid: parseInt(id),
            status: status,
            updatedDate: new Date().toISOString(),
            updatedBy: approverId || 'Current User'
        };

        return [updatedScenario];
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
        limit?: number; 
        offset?: number 
    }) {
        try {
            const { limit = 50, offset = 0, search, stage, impaired_flag, status, rating_code } = filters;

            // 1. Build Query Conditions for Base Table (System Results)
            const conditions = [];
            
            if (search) {
                conditions.push(or(
                    ilike(frs9ImpIaResultH.accountNumber, `%${search}%`),
                    ilike(frs9ImpIaResultH.cifName, `%${search}%`),
                    ilike(frs9ImpIaResultH.cifNumber, `%${search}%`)
                ));
            }

            if (rating_code) {
                conditions.push(eq(frs9ImpIaResultH.ratingCode, rating_code));
            }

            // Note: Stage and Status filtering on Base Table is limited because they are derived
            // but we can try basic matching on the columns that determine them (collectability/dpd)
            if (stage === 3) {
                conditions.push(or(sql`${frs9ImpIaResultH.collectability} > 2`, eq(frs9ImpIaResultH.dpd, 3))); // Simplified
            }

            // 2. Fetch Total Count for Pagination
            const countResult = await legacyDb.select({ count: sql<number>`count(*)` })
                .from(frs9ImpIaResultH)
                .where(and(...conditions));
            
            const total = Number(countResult[0]?.count || 0);

            if (total === 0) return { data: [], total: 0 };

            // 3. Fetch Paginated Results
            const results = await legacyDb.select()
                .from(frs9ImpIaResultH)
                .where(and(...conditions))
                .orderBy(desc(frs9ImpIaResultH.createddate))
                .limit(limit)
                .offset(offset);

            // 4. Fetch Overrides (Manual Interventions)
            const accountNumbers = results.map(r => r.accountNumber).filter((n): n is string => !!n);
            const overrides = accountNumbers.length > 0 
                ? await legacyDb.select()
                    .from(frs9ImpIaHeader)
                    .where(inArray(frs9ImpIaHeader.accountNumber, accountNumbers))
                : [];

            // 5. Merge Logic: Override > System Result
            const mergedData = results.map(row => {
                const override = overrides.find(o => o.accountNumber === row.accountNumber);

                // Base values from Result (System)
                let currentStage = (row.collectability && row.collectability > 2) ? 3 : (row.dpd && row.dpd > 30) ? 2 : 1;
                let currentStatus = 'PENDING';
                let currentNotes = 'System Calculated';
                let currentImpaired = (row.collectability && row.collectability > 2) ? 'I' : 'N';

                if (override) {
                    currentStage = override.impairedFlag === 'I' ? 3 : (override.dpd && override.dpd > 30) ? 2 : 1;
                    currentStatus = STATUS_MAP_TO_STRING[override.status as number] || 'IN_PROGRESS';
                    currentNotes = override.triggerRemarks || 'Manual Override';
                    currentImpaired = override.impairedFlag === 'I' ? 'I' : 'N';
                }

                return {
                    pkid: Number(row.pkid),
                    ia_id: Number(row.iaId),
                    prc_date: row.prcDate,
                    eff_date: row.prcDate,
                    cif_number: row.cifNumber,
                    cif_name: row.cifName,
                    account_id: Number(row.accountId),
                    account_number: row.accountNumber,
                    currency: row.currency,
                    eff_interest_rate: Number(row.effInterestRate || 0),
                    interest_rate: Number(row.interestRate || 0),
                    dpd: row.dpd,
                    collectability: row.collectability,
                    rating_code: row.ratingCode,
                    impaired_flag: currentImpaired,
                    method: 'DCF',
                    outstanding_balance: Number(row.outstanding || 0),
                    provision_amount: Number(row.eclIaAmt || 0),
                    ecl_amount: Number(row.eclIaAmt || 0),
                    stage: currentStage,
                    priority_level: (row.eclIaAmt && Number(row.eclIaAmt) > 1000000000) ? 'HIGH' : 'MEDIUM',
                    assessment_status: currentStatus,
                    notes: currentNotes,
                    createdby: row.createdby,
                    createddate: row.createddate,
                    is_override: !!override
                };
            });

            // 6. Final Filter check for derived status/stage if requested
            let filteredResponse = mergedData;
            if (stage || status) {
                filteredResponse = mergedData.filter(item => {
                    const stageMatch = !stage || item.stage === Number(stage);
                    const statusMatch = !status || item.assessment_status === status;
                    return stageMatch && statusMatch;
                });
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

    async removeFromWatchlist(id: string, tenantId: string) {
        return legacyDb.delete(frs9ImpIaHeader)
            .where(eq(frs9ImpIaHeader.pkid, Number(id)))
            .returning();
    }

    // =========================================================================
    // ASSESSMENT MANAGEMENT (1.4.2)
    // =========================================================================

    async getAssessment(tenantId: string, accountId: number) {
        const result = await legacyDb.select()
            .from(frs9ImpIaHeader)
            .where(eq(frs9ImpIaHeader.accountId, Number(accountId)))
            .orderBy(desc(frs9ImpIaHeader.createddate))
            .limit(1);

        if (!result.length) return null;

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
            updateddate: row.updateddate
        };
    }

    async createAssessment(data: any) {
        // Logic to insert/update assessment
        // For now, we reuse addToWatchlist logic as it writes to the same table
        return this.addToWatchlist(data);
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

    private async generateIaId(): Promise<number> {
        const result = await legacyDb.execute(sql`SELECT MAX(ia_id) as max_id FROM frs9_imp_ia_header`);
        const maxId = Number(result[0]?.max_id) || 0;
        return maxId + 1;
    }

    // Get Staging Analysis - real implementation with filters
    async getStagingAnalysis(tenantId: string, filters: { 
        stage?: string; 
        segmentId?: string; 
        startDate?: string; 
        endDate?: string 
    } = {}) {
        try {
            // Build WHERE conditions dynamically
            const whereConditions = [];
            
            if (filters.stage) {
                whereConditions.push(sql`stage = ${filters.stage}`);
            }
            
            if (filters.segmentId) {
                whereConditions.push(sql`segment_id = ${filters.segmentId}`);
            }
            
            if (filters.startDate) {
                whereConditions.push(sql`prc_date >= ${filters.startDate}`);
            }
            
            if (filters.endDate) {
                whereConditions.push(sql`prc_date <= ${filters.endDate}`);
            }

            const whereClause = whereConditions.length > 0 
                ? sql`WHERE ${whereConditions.reduce((acc, condition, index) => 
                    index === 0 ? condition : sql`${acc} AND ${condition}`
                )}`
                : sql``;

            // Query frs9_imp_ca_result_h for staging analysis with filters
            const query = sql`
                SELECT 
                    prc_date as "prcDate",
                    stage,
                    segment_id as "segmentId",
                    SUM(CAST(outstanding AS DECIMAL)) as "totalOutstanding",
                    SUM(CAST(ecl_amount AS DECIMAL)) as "totalECL",
                    AVG(CAST(outstanding AS DECIMAL)) as "avgOutstanding"
                FROM frs9_imp_ca_result_h 
                ${whereClause}
                GROUP BY prc_date, stage, segment_id
                ORDER BY prc_date DESC, stage
            `;
            
            const result = await legacyDb.execute(query);
            return result;
        } catch (error) {
            console.error('Error in getStagingAnalysis:', error);
            throw error;
        }
    }

    // Get Staging Summary - real implementation  
    async getStagingSummary(tenantId: string) {
        try {
            // Get latest staging summary
            const query = sql`
                SELECT 
                    SUM(CAST(outstanding AS DECIMAL)) as "totalOutstanding",
                    SUM(CAST(ecl_amount AS DECIMAL)) as "totalECL",
                    COUNT(CASE WHEN stage = 1 THEN 1 END) as "stage1Count",
                    COUNT(CASE WHEN stage = 2 THEN 1 END) as "stage2Count", 
                    COUNT(CASE WHEN stage = 3 THEN 1 END) as "stage3Count",
                    SUM(CASE WHEN stage = 1 THEN CAST(ecl_amount AS DECIMAL) ELSE 0 END) as "stage1ECL",
                    SUM(CASE WHEN stage = 2 THEN CAST(ecl_amount AS DECIMAL) ELSE 0 END) as "stage2ECL",
                    SUM(CASE WHEN stage = 3 THEN CAST(ecl_amount AS DECIMAL) ELSE 0 END) as "stage3ECL"
                FROM frs9_imp_ca_result_h 
                WHERE prc_date = (
                    SELECT MAX(prc_date) 
                    FROM frs9_imp_ca_result_h 
                )
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
