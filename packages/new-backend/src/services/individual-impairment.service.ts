// @ts-nocheck

import { Effect } from 'effect';
import { legacyDb } from '../config';
import {
    frs9ImpIaHeader,
    frs9ImpIaDetail,
    frs9ImpIaDcf,
    frs9ImpIaResultH,
    frs9ImpIaResultD,
    frs9ImpIaRr
} from '../db/schema/legacy';
import { frs9MasterAccount, users } from '../db/schema';
import { and, eq, desc, asc, sql, inArray, ilike, or } from 'drizzle-orm';
import { MasterAccountRepository } from '@/repositories/master-account.repository';
import { decodeCursor, encodeCursor } from '@/lib/http/list-query';


// Helper to map Legacy Status (Int) <-> Frontend Status (String)
// Assumption: 0=Pending, 1=Approved, 2=Rejected
const STATUS_MAP_TO_STRING: Record<number, string> = {
    0: 'SUBMITTED',
    1: 'APPROVED',
    2: 'REJECTED'
};
const STATUS_MAP_TO_INT: Record<string, number> = {
    'PENDING': 0,
    'APPROVED': 1,
    'REJECTED': 2
};

export class IndividualImpairmentService {
    private toNumber(value: unknown) {
        if (value == null || value === '') return 0;
        if (typeof value === 'string') {
            // Remove commas and other formatting characters
            const clean = value.replace(/,/g, '').trim();
            const parsed = Number(clean);
            return Number.isFinite(parsed) ? parsed : 0;
        }
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : 0;
    }

    private toDateString(value?: string | Date | null) {
        if (!value) return new Date().toISOString().slice(0, 10);
        
        // 1. Handle Date objects
        if (value instanceof Date) {
            if (Number.isNaN(value.getTime())) return new Date().toISOString().slice(0, 10);
            return value.toISOString().slice(0, 10);
        }

        // 2. Handle Numeric values (Excel Serial Dates)
        // Excel serial dates are numbers like 43737 (Sep 2019)
        const numericValue = Number(value);
        if (!isNaN(numericValue) && (typeof value === 'number' || (typeof value === 'string' && /^\d+(\.\d+)?$/.test(value.trim())))) {
            // Excel dates are usually between 1 (1900) and 100000 (2173)
            if (numericValue > 0 && numericValue < 1000000) {
                // 25569 is the offset between Unix epoch (1970-01-01) and Excel epoch (1899-12-30)
                const date = new Date(Math.round((numericValue - 25569) * 86400 * 1000));
                if (!Number.isNaN(date.getTime())) {
                    return date.toISOString().slice(0, 10);
                }
            }
        }

        const str = String(value).trim();
        if (!str) return new Date().toISOString().slice(0, 10);

        // 3. Try standard ISO (YYYY-MM-DD)
        // Pre-check to avoid bare numbers being parsed as years (e.g. "43737" -> Year 43737)
        if (str.includes('-') || str.includes('/')) {
             const date = new Date(str);
             if (!Number.isNaN(date.getTime())) {
                 // Heuristic: Ensure it's a "reasonable" year to avoid parsing errors
                 const y = date.getFullYear();
                 if (y > 1900 && y < 2100) {
                     return date.toISOString().slice(0, 10);
                 }
             }
        }

        // 4. Handle DD-MM-YYYY or DD/MM/YYYY or DD-MM-YY
        const parts = str.split(/[-/]/);
        if (parts.length === 3) {
            let d, m, y;
            
            // Check if it's YYYY-MM-DD or DD-MM-YYYY
            if (parts[0].length === 4) {
                y = parseInt(parts[0], 10);
                m = parseInt(parts[1], 10) - 1;
                d = parseInt(parts[2], 10);
            } else {
                d = parseInt(parts[0], 10);
                m = parseInt(parts[1], 10) - 1;
                y = parseInt(parts[2], 10);
                // Handle 2-digit years
                if (y < 100) y += (y > 50 ? 1900 : 2000);
            }

            if (!isNaN(d) && !isNaN(m) && !isNaN(y)) {
                // Return YYYY-MM-DD string directly to avoid timezone shifts
                return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            }
        }

        return str.slice(0, 10);
    }

    private mapDcfCashflowRow(row: any) {
        return {
            pkid: Number(row.pkid),
            iaId: row.iaId ? Number(row.iaId) : null,
            prcDate: row.prcDate || null,
            accountId: row.accountId ? Number(row.accountId) : null,
            accountNumber: row.accountNumber || '',
            mob: Number(row.mob || 0),
            periode: row.periode || null,
            principal: this.toNumber(row.principal),
            interest: this.toNumber(row.interest),
            collateral: this.toNumber(row.collateral),
            status: row.status || null,
            createdby: row.createdby || '',
            createddate: row.createddate || null
        };
    }

    private mapIaResultHeaderRow(header: any) {
        return {
            pkid: Number(header.pkid),
            iaId: header.iaId ? Number(header.iaId) : null,
            prcDate: header.prcDate || null,
            effectiveDate: header.effDate || header.prcDate || null,
            accountId: header.accountId ? Number(header.accountId) : null,
            accountNumber: header.accountNumber || '',
            cifNumber: header.cifNumber || '',
            cifName: header.cifName || '',
            currency: header.currency || '',
            dpd: this.toNumber(header.dpd),
            collectability: this.toNumber(header.collectability),
            ratingCode: header.ratingCode || '',
            interestRate: this.toNumber(header.interestRate),
            effInterestRate: this.toNumber(header.effInterestRate),
            outstanding: this.toNumber(header.outstanding),
            accruedInterest: this.toNumber(header.accruedInterest),
            carryingAmt: this.toNumber(header.carryingAmt),
            eadAmt: this.toNumber(header.eadAmt),
            pvDcfAmt: this.toNumber(header.pvDcfAmt),
            eclIaAmt: this.toNumber(header.eclIaAmt),
            createdby: header.createdby || '',
            createddate: header.createddate || null
        };
    }

    private mapIaResultDetailRow(row: any) {
        return {
            pkid: Number(row.pkid),
            iaId: row.iaId ? Number(row.iaId) : null,
            prcDate: row.prcDate || null,
            accountId: row.accountId ? Number(row.accountId) : null,
            mob: this.toNumber(row.mob),
            periode: row.periode || null,
            principal: this.toNumber(row.principal),
            interest: this.toNumber(row.interest),
            installment: this.toNumber(row.installment),
            collateral: this.toNumber(row.collateral),
            poRate1: this.toNumber(row.poRate1),
            rrRate1: this.toNumber(row.rrRate1),
            default1: this.toNumber(row.default1),
            poRate2: this.toNumber(row.poRate2),
            rrRate2: this.toNumber(row.rrRate2),
            default2: this.toNumber(row.default2),
            poRate3: this.toNumber(row.poRate3),
            rrRate3: this.toNumber(row.rrRate3),
            default3: this.toNumber(row.default3),
            pwAmt: this.toNumber(row.pwAmt),
            discountFactor: this.toNumber(row.discountFactor),
            pvAmt: this.toNumber(row.pvAmt),
            beginningBalance: this.toNumber(row.beginningBalance),
            eirAmt: this.toNumber(row.eirAmt),
            endingBalance: this.toNumber(row.endingBalance)
        };
    }

    private async ensureLegacyIaHeader(
        tx: any,
        accountId: number,
        createdBy: string,
        createdHost: string
    ) {
        // SERIALIZE per account to prevent duplicate headers during parallel DCF uploads
        await tx.execute(sql`SELECT pg_advisory_xact_lock(${accountId})`);

        const existing = await tx.select()
            .from(frs9ImpIaHeader)
            .where(eq(frs9ImpIaHeader.accountId, accountId))
            .orderBy(desc(frs9ImpIaHeader.updateddate), desc(frs9ImpIaHeader.createddate))
            .limit(1);

        if (existing.length > 0) {
            return existing[0];
        }

        const assessment = await this.getAssessment('legacy', accountId);
        if (!assessment) {
            throw new Error(`Assessment source for account ${accountId} not found`);
        }

        const iaId = await this.generateIaId(tx);
        const now = new Date().toISOString();
        const prcDate = this.toDateString(assessment.prc_date || new Date());
        const impairedFlag = String(assessment.impaired_flag || 'N').toUpperCase() === 'I' ? 'T' : 'F';

        const [inserted] = await tx.insert(frs9ImpIaHeader).values({
            iaId,
            prcDate,
            effDate: this.toDateString(assessment.eff_date || prcDate),
            cifNumber: assessment.cif_number || 'UNKNOWN',
            cifName: assessment.cif_name || 'UNKNOWN',
            accountId,
            accountNumber: assessment.account_number || String(accountId),
            currency: assessment.currency || 'IDR',
            effInterestRate: this.toNumber(assessment.eff_interest_rate),
            interestRate: this.toNumber(assessment.interest_rate),
            dpd: this.toNumber(assessment.dpd),
            collectability: this.toNumber(assessment.collectability),
            ratingCode: assessment.rating_code || null,
            impairedFlag,
            method: 'DCF',
            plafond: String(this.toNumber(assessment.plafond || assessment.outstanding_balance)),
            outstanding: String(this.toNumber(assessment.outstanding_balance)),
            accruedInterest: String(this.toNumber(assessment.accrued_interest)),
            carryingAmt: String(this.toNumber(assessment.carrying_amt || assessment.outstanding_balance)),
            eadAmt: String(this.toNumber(assessment.ead_amt || assessment.outstanding_balance)),
            pvDcfAmt: '0',
            eclIaAmt: '0',
            triggerRemarks: String(assessment.impairment_reason || assessment.analyst_comments || ''),
            triggerFilename: assessment.supporting_documents?.[0] || null,
            scenarioId: 1,
            nOfScenario: 1,
            poRate1: 100,
            poRate2: 0,
            poRate3: 0,
            scName1: 'DEFAULT',
            scName2: null,
            scName3: null,
            status: 1,
            createdby: createdBy,
            createddate: now,
            createdhost: createdHost
        }).returning();

        return inserted;
    }

    private buildLegacyIaDetailRows(
        header: any,
        rrRows: any[],
        dcfRows: any[],
        createdBy: string,
        createdHost: string
    ) {
        const poRate1 = this.toNumber(header.poRate1);
        const poRate2 = this.toNumber(header.poRate2);
        const poRate3 = this.toNumber(header.poRate3);
        const effInterestRate = this.toNumber(header.effInterestRate);
        const effectiveMonthlyRate = (effInterestRate > 0 ? effInterestRate : 12) / 100 / 12;
        const now = new Date().toISOString();

        const sortedDcfRows = [...dcfRows].sort((left, right) => {
            const leftMob = this.toNumber(left.mob);
            const rightMob = this.toNumber(right.mob);
            if (leftMob !== rightMob) return leftMob - rightMob;
            const leftDate = Date.parse(this.toDateString(left.periode));
            const rightDate = Date.parse(this.toDateString(right.periode));
            return leftDate - rightDate;
        });

        const normalizedRrRows = rrRows.length > 0
            ? rrRows
            : [{
                periodStart: sortedDcfRows[0]?.periode || header.prcDate,
                periodEnd: sortedDcfRows[sortedDcfRows.length - 1]?.periode || header.prcDate,
                rrRate1: 0,
                rrRate2: 0,
                rrRate3: 0
            }];

        const detailRows = sortedDcfRows.map((row) => {
            const periode = this.toDateString(row.periode);
            const periodeTime = Date.parse(periode);
            const matchedRr = normalizedRrRows.find((rr) => {
                const start = Date.parse(this.toDateString(rr.periodStart));
                const end = Date.parse(this.toDateString(rr.periodEnd));
                return periodeTime >= start && periodeTime <= end;
            }) || normalizedRrRows[0];

            const principal = this.toNumber(row.principal);
            const interest = this.toNumber(row.interest);
            const collateral = this.toNumber(row.collateral);
            const installment = principal + interest;
            const exposure = principal + interest + collateral;
            const rrRate1 = this.toNumber(matchedRr.rrRate1);
            const rrRate2 = this.toNumber(matchedRr.rrRate2);
            const rrRate3 = this.toNumber(matchedRr.rrRate3);
            const default1 = exposure * poRate1 / 100 * rrRate1 / 100;
            const default2 = exposure * poRate2 / 100 * rrRate2 / 100;
            const default3 = exposure * poRate3 / 100 * rrRate3 / 100;
            const pwAmt = default1 + default2 + default3;
            const mob = this.toNumber(row.mob);
            const discountFactor = Math.pow(1 / (1 + effectiveMonthlyRate), mob);
            const pvAmt = Number((pwAmt * discountFactor).toFixed(6));

            return {
                iaId: Number(header.iaId),
                accountId: Number(header.accountId),
                effInterestRate,
                mob,
                periode,
                principal,
                interest,
                installment,
                collateral,
                poRate1,
                rrRate1,
                default1,
                poRate2,
                rrRate2,
                default2,
                poRate3,
                rrRate3,
                default3,
                pwAmt,
                discountFactor,
                pvAmt,
                beginningBalance: 0,
                eirAmt: 0,
                endingBalance: 0,
                createdby: createdBy,
                createddate: now,
                createdhost: createdHost
            };
        });

        const npv = detailRows.reduce((sum, row) => sum + this.toNumber(row.pvAmt), 0);
        let previousEndingBalance = 0;

        detailRows.forEach((row, index) => {
            const beginningBalance = index === 0 ? npv : previousEndingBalance;
            const eirAmt = beginningBalance * effectiveMonthlyRate;
            const endingBalance = beginningBalance + eirAmt - this.toNumber(row.pwAmt);

            row.beginningBalance = Number(beginningBalance.toFixed(6));
            row.eirAmt = Number(eirAmt.toFixed(6));
            row.endingBalance = Number(endingBalance.toFixed(6));
            previousEndingBalance = row.endingBalance;
        });

        return detailRows;
    }

    private getScenarioMethodTemplates() {
        return [
            {
                scenarioId: 1,
                scenarioCode: 'POSSIBLE_OUTCOME_AND_REPAYMENT_RATE',
                scenarioName: 'Possible Outcome and Repayment Rate',
                description: 'Legacy DCF scenario method using possible outcome and repayment rate.'
            },
            {
                scenarioId: 2,
                scenarioCode: 'DCF',
                scenarioName: 'DCF',
                description: 'Legacy DCF scenario method.'
            },
            {
                scenarioId: 3,
                scenarioCode: 'COLLATERAL',
                scenarioName: 'Collateral',
                description: 'Legacy collateral-based scenario method.'
            }
        ];
    }

    private normalizeScenarioMethodId(input: unknown) {
        const numeric = Number(input);
        if (Number.isFinite(numeric) && numeric >= 1 && numeric <= 3) {
            return numeric;
        }

        const raw = String(input || '').trim().toLowerCase();
        if (raw.includes('possible outcome')) return 1;
        if (raw === 'dcf') return 2;
        if (raw.includes('collateral')) return 3;
        return 1;
    }

    private buildLegacyScenarioRows(header: any, rrRows: any[]) {
        const count = Math.max(
            1,
            Math.min(
                3,
                Number(
                    header?.nOfScenario
                    || [header?.scName1, header?.scName2, header?.scName3].filter(Boolean).length
                    || 1
                )
            )
        );

        const poRates = [
            Number(header?.poRate1 || 0),
            Number(header?.poRate2 || 0),
            Number(header?.poRate3 || 0)
        ];

        const scenarioNames = [
            String(header?.scName1 || 'Scenario 1'),
            String(header?.scName2 || 'Scenario 2'),
            String(header?.scName3 || 'Scenario 3')
        ];

        return Array.from({ length: count }, (_, index) => {
            const rrRow = rrRows[index] || rrRows[0];
            const repaymentRate = index === 0
                ? Number(rrRow?.rrRate1 || 0)
                : index === 1
                    ? Number(rrRow?.rrRate2 || 0)
                    : Number(rrRow?.rrRate3 || 0);

            return {
                id: `legacy-${header?.iaId || header?.pkid || 'scenario'}-${index + 1}`,
                possibleOutcomeRate: poRates[index] || 0,
                scenarioName: scenarioNames[index] || `Scenario ${index + 1}`,
                periodStart: rrRow?.periodStart || header?.prcDate || null,
                periodEnd: rrRow?.periodEnd || header?.prcDate || null,
                repaymentRate
            };
        });
    }

    private mapLegacyScenarioHeader(header: any, rrRows: any[]) {
        const method = this.getScenarioMethodTemplates().find((item) => item.scenarioId === Number(header?.scenarioId))
            || this.getScenarioMethodTemplates()[0];
        const scenarioRows = this.buildLegacyScenarioRows(header, rrRows);

        return {
            pkid: Number(header.pkid),
            id: String(header.pkid),
            iaId: Number(header.iaId),
            accountId: Number(header.accountId),
            accountNumber: header.accountNumber,
            scenarioId: Number(header.scenarioId || method.scenarioId),
            scenarioCode: method.scenarioCode,
            scenarioName: method.scenarioName,
            description: header.triggerRemarks || method.description,
            status: STATUS_MAP_TO_STRING[Number(header.status || 0)] || 'PENDING',
            activeFlag: true,
            createdAt: header.createddate,
            createdDate: header.createddate,
            createdBy: header.createdby,
            discountRate: Number(scenarioRows[0]?.repaymentRate || 0),
            recoveryRate: Number(scenarioRows[0]?.possibleOutcomeRate || 0),
            growthRate: 0,
            timeHorizon: scenarioRows.length,
            paymentFrequency: 'monthly',
            configuration: {
                nScenarios: scenarioRows.length,
                weights: {
                    base: Number(header.poRate1 || 0),
                    best: Number(header.poRate2 || 0),
                    worst: Number(header.poRate3 || 0)
                },
                scenarioRows,
                repaymentPlan: rrRows.map((row) => ({
                    periodStart: row.periodStart,
                    periodEnd: row.periodEnd,
                    rrRate1: Number(row.rrRate1 || 0),
                    rrRate2: Number(row.rrRate2 || 0),
                    rrRate3: Number(row.rrRate3 || 0)
                }))
            }
        };
    }

    private async syncLegacyScenarioForHeader(
        tx: any,
        header: any,
        accountId: number,
        scenarioInput: any,
        createdBy: string,
        createdHost: string
    ) {
        const scenarioMethodId = this.normalizeScenarioMethodId(
            scenarioInput?.scenarioId
            || scenarioInput?.scenarioCode
            || scenarioInput?.scenarioName
        );

        const inputRows = Array.isArray(scenarioInput?.scenarioRows)
            ? scenarioInput.scenarioRows
            : [];

        const boundedRows = (inputRows.length > 0 ? inputRows : [{
            possibleOutcomeRate: Number(scenarioInput?.recoveryRate || header?.poRate1 || 100),
            scenarioName: scenarioInput?.scenarioName || header?.scName1 || 'Scenario 1',
            periodStart: scenarioInput?.periodStart || header?.prcDate || new Date().toISOString().slice(0, 10),
            periodEnd: scenarioInput?.periodEnd || header?.prcDate || new Date().toISOString().slice(0, 10),
            repaymentRate: Number(scenarioInput?.discountRate || 0)
        }]).slice(0, 3);

        const scenarioCount = Math.max(
            1,
            Math.min(3, Number(scenarioInput?.nOfScenario || boundedRows.length || 1))
        );
        const poRates = [0, 0, 0];
        const scNames = [null, null, null];

        boundedRows.forEach((row, index) => {
            poRates[index] = Number(row.possibleOutcomeRate || 0);
            scNames[index] = String(row.scenarioName || `Scenario ${index + 1}`).slice(0, 20);
        });

        const now = new Date().toISOString();
        const [updatedHeader] = await tx.update(frs9ImpIaHeader)
            .set({
                scenarioId: scenarioMethodId,
                nOfScenario: scenarioCount,
                poRate1: poRates[0] || 0,
                poRate2: poRates[1] || 0,
                poRate3: poRates[2] || 0,
                scName1: scNames[0],
                scName2: scNames[1],
                scName3: scNames[2],
                triggerRemarks: String(scenarioInput?.description || header?.triggerRemarks || ''),
                updatedby: createdBy,
                updateddate: now,
                updatedhost: createdHost
            })
            .where(eq(frs9ImpIaHeader.pkid, Number(header.pkid)))
            .returning();

        await tx.delete(frs9ImpIaRr)
            .where(eq(frs9ImpIaRr.iaId, Number(header.iaId)));

        const rrRowsPayload = boundedRows.map((row, index) => ({
            iaId: Number(header.iaId),
            accountId,
            periodStart: this.toDateString(row.periodStart || updatedHeader?.prcDate || header?.prcDate || new Date()),
            periodEnd: this.toDateString(row.periodEnd || row.periodStart || updatedHeader?.prcDate || header?.prcDate || new Date()),
            rrRate1: index === 0 ? Number(row.repaymentRate || 0) : 0,
            rrRate2: index === 1 ? Number(row.repaymentRate || 0) : 0,
            rrRate3: index === 2 ? Number(row.repaymentRate || 0) : 0,
            createdby: createdBy,
            createddate: now,
            createdhost: createdHost
        }));

        if (rrRowsPayload.length > 0) {
            await tx.insert(frs9ImpIaRr).values(rrRowsPayload);
        }

        return {
            header: updatedHeader || header,
            rrRows: rrRowsPayload
        };
    }

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

            if (!result.length) {
                const masterRows = await legacyDb.select()
                    .from(frs9MasterAccount)
                    .where(eq(frs9MasterAccount.accountId, Number(accountId)))
                    .orderBy(desc(frs9MasterAccount.prcDate))
                    .limit(1);

                if (!masterRows.length) return [];

                const master = masterRows[0];
                return [{
                    id: `HIST-SRC-${master.pkid}`,
                    entityId: String(master.accountId),
                    entityType: 'MASTER_ACCOUNT',
                    action: 'CREATE',
                    actor: 'SYSTEM',
                    timestamp: master.prcDate,
                    details: `Source account loaded from FRS9_MASTER_ACCOUNT (${master.accountNumber || accountId})`,
                    status: master.impairedFlag ? 'IMPAIRED_SOURCE' : 'SOURCE'
                }];
            }

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
    // LIST OF INDIVIDUAL REPORT (1.4.2) -> frs9_imp_ia_header
    // =========================================================================

    async getReports(tenantId: string, filters: {
        reportPeriod?: string;
        search?: string;
        status?: string;
        impaired_flag?: string;
        dateFrom?: string;
        dateTo?: string;
        limit?: number;
        offset?: number;
        sort?: Array<{ field: string; direction: 'asc' | 'desc' }>;
    }) {
        const { reportPeriod, search, status, impaired_flag, dateFrom, dateTo, limit = 50, offset = 0 } = filters;
        const conditions = [
            // Techspec uses IMPAIRED_FLAG = 'I'. Keep T compatibility because existing override flow writes T/F.
            sql`(${frs9ImpIaHeader.impairedFlag} = 'I' OR ${frs9ImpIaHeader.impairedFlag} = 'T')`,
        ];

        if (reportPeriod) {
            conditions.push(sql`TO_CHAR(${frs9ImpIaHeader.prcDate}, 'YYYY-MM') = ${reportPeriod}`);
        }

        if (dateFrom) {
            conditions.push(sql`${frs9ImpIaHeader.prcDate} >= ${dateFrom}`);
        }

        if (dateTo) {
            conditions.push(sql`${frs9ImpIaHeader.prcDate} <= ${dateTo}`);
        }

        if (search) {
            conditions.push(or(
                ilike(frs9ImpIaHeader.accountNumber, `%${search}%`),
                ilike(frs9ImpIaHeader.cifName, `%${search}%`),
                ilike(frs9ImpIaHeader.cifNumber, `%${search}%`)
            ));
        }

        if (status) {
            const statusInt = STATUS_MAP_TO_INT[String(status).toUpperCase()];
            if (statusInt !== undefined) {
                conditions.push(eq(frs9ImpIaHeader.status, statusInt));
            }
        }

        if (impaired_flag) {
            conditions.push(eq(frs9ImpIaHeader.impairedFlag, impaired_flag));
        }

        const whereClause = and(...conditions);
        const countResult = await legacyDb.select({ count: sql<number>`count(*)` })
            .from(frs9ImpIaHeader)
            .where(whereClause);
        const total = Number(countResult[0]?.count || 0);

        const reportSortColumns = {
            pkid: frs9ImpIaHeader.pkid,
            downloadDate: frs9ImpIaHeader.prcDate,
            prc_date: frs9ImpIaHeader.prcDate,
            accountNumber: frs9ImpIaHeader.accountNumber,
            account_number: frs9ImpIaHeader.accountNumber,
            cifName: frs9ImpIaHeader.cifName,
            cif_name: frs9ImpIaHeader.cifName,
            outstanding: frs9ImpIaHeader.outstanding,
            dpd: frs9ImpIaHeader.dpd,
            collectability: frs9ImpIaHeader.collectability,
            eadAmt: frs9ImpIaHeader.eadAmt,
            pvDcfAmt: frs9ImpIaHeader.pvDcfAmt,
            eclIaAmt: frs9ImpIaHeader.eclIaAmt,
            status: frs9ImpIaHeader.status,
        };

        const sortExpressions = (filters.sort || [])
            .map((sort) => {
                const column = reportSortColumns[sort.field];
                if (!column) return null;
                return sort.direction === 'asc' ? asc(column) : desc(column);
            })
            .filter(Boolean);

        const rows = await legacyDb.select()
            .from(frs9ImpIaHeader)
            .where(whereClause)
            .orderBy(...(sortExpressions.length > 0
                ? [...sortExpressions, desc(frs9ImpIaHeader.pkid)]
                : [desc(frs9ImpIaHeader.prcDate), desc(frs9ImpIaHeader.createddate), desc(frs9ImpIaHeader.pkid)]))
            .limit(limit)
            .offset(offset);

        return {
            data: rows.map((row) => ({
                pkid: Number(row.pkid),
                ia_id: row.iaId ? Number(row.iaId) : null,
                download_date: row.prcDate,
                prc_date: row.prcDate,
                customer_number: row.cifNumber,
                cif_number: row.cifNumber,
                customer_name: row.cifName,
                cif_name: row.cifName,
                account_id: row.accountId ? Number(row.accountId) : null,
                account_number: row.accountNumber,
                currency: row.currency,
                outstanding: Number(row.outstanding || 0),
                day_past_due: Number(row.dpd || 0),
                dpd: Number(row.dpd || 0),
                collectability: row.collectability ?? null,
                rating: row.ratingCode,
                rating_code: row.ratingCode,
                ead_amt: Number(row.eadAmt || 0),
                pv_dcf_amt: Number(row.pvDcfAmt || 0),
                ecl_ia_amt: Number(row.eclIaAmt || 0),
                status: STATUS_MAP_TO_STRING[row.status] || String(row.status ?? ''),
                raw_status: row.status,
                trigger_remarks: row.triggerRemarks,
                trigger_filename: row.triggerFilename,
                createdby: row.createdby,
                createddate: row.createddate,
                updatedby: row.updatedby,
                updateddate: row.updateddate,
            })),
            total,
        };
    }

    async createReport(data: any) {
        return legacyDb.insert(frs9ImpIaResultH).values(data).returning();
    }

    // =========================================================================
    // REVIEW SCENARIO DETAILS (1.4.4)
    // =========================================================================

    async getScenarios(tenantId: string, filters: { status?: string; limit?: number; offset?: number; accountId?: number }) {
        try {
            const conditions = [sql`${frs9ImpIaHeader.scenarioId} is not null`];

            if (filters.status) {
                const statusInt = STATUS_MAP_TO_INT[String(filters.status).toUpperCase()];
                if (typeof statusInt === 'number') {
                    conditions.push(eq(frs9ImpIaHeader.status, statusInt));
                }
            }

            if (filters.accountId && Number.isFinite(filters.accountId)) {
                conditions.push(eq(frs9ImpIaHeader.accountId, Number(filters.accountId)));
            }

            const headers = await legacyDb.select()
                .from(frs9ImpIaHeader)
                .where(and(...conditions))
                .orderBy(desc(frs9ImpIaHeader.updateddate), desc(frs9ImpIaHeader.createddate))
                .limit(filters.limit || 100);

            const iaIds = headers.map((item) => Number(item.iaId)).filter((value) => Number.isFinite(value));
            const rrRows = iaIds.length > 0
                ? await legacyDb.select()
                    .from(frs9ImpIaRr)
                    .where(inArray(frs9ImpIaRr.iaId, iaIds))
                    .orderBy(frs9ImpIaRr.periodStart, frs9ImpIaRr.periodEnd)
                : [];

            const mappedSavedScenarios = headers.map((header) => {
                const headerRows = rrRows.filter((row) => Number(row.iaId) === Number(header.iaId));
                return this.mapLegacyScenarioHeader(header, headerRows);
            });

            if (filters.accountId) {
                const templates = this.getScenarioMethodTemplates().map((template) => {
                    const saved = mappedSavedScenarios.find((item) => Number(item.scenarioId) === Number(template.scenarioId));
                    return saved || {
                        ...template,
                        pkid: 0,
                        id: `template-${template.scenarioId}`,
                        iaId: null,
                        accountId: Number(filters.accountId),
                        accountNumber: null,
                        status: 'APPROVED',
                        activeFlag: true,
                        createdAt: null,
                        createdDate: null,
                        createdBy: 'SYSTEM',
                        discountRate: 0,
                        recoveryRate: template.scenarioId === 1 ? 60 : 0,
                        growthRate: 0,
                        timeHorizon: 2,
                        paymentFrequency: 'monthly',
                        configuration: {
                            nScenarios: 2,
                            weights: {
                                base: 60,
                                best: 20,
                                worst: 20
                            },
                            scenarioRows: [],
                            repaymentPlan: []
                        }
                    };
                });

                return templates;
            }

            return mappedSavedScenarios;
        } catch (error) {
            console.error('Error fetching scenarios:', error);
            return [];
        }
    }

    async createScenario(data: any) {
        try {
            const accountId = Number(data.accountId || data.account_id || data.configuration?.accountId || 0);
            if (!accountId) {
                throw new Error('Account ID is required to save DCF scenario');
            }

            const scenarioMethodId = this.normalizeScenarioMethodId(
                data.scenarioId
                || data.configuration?.scenarioId
                || data.scenarioCode
                || data.scenarioName
            );

            const inputRows = Array.isArray(data.scenarioRows)
                ? data.scenarioRows
                : Array.isArray(data.configuration?.scenarioRows)
                    ? data.configuration.scenarioRows
                    : [];

            const boundedRows = (inputRows.length > 0 ? inputRows : [{
                possibleOutcomeRate: Number(data.recoveryRate || 100),
                scenarioName: data.scenarioName || 'Scenario 1',
                periodStart: data.periodStart || new Date().toISOString().slice(0, 10),
                periodEnd: data.periodEnd || new Date().toISOString().slice(0, 10),
                repaymentRate: Number(data.discountRate || 0)
            }]).slice(0, 3);

            const scenarioCount = Math.max(1, Math.min(3, Number(data.nOfScenario || data.configuration?.nScenarios || boundedRows.length || 1)));
            const poRates = [0, 0, 0];
            const scNames = [null, null, null];

            boundedRows.forEach((row, index) => {
                poRates[index] = Number(row.possibleOutcomeRate || 0);
                scNames[index] = String(row.scenarioName || `Scenario ${index + 1}`).slice(0, 20);
            });

            return await legacyDb.transaction(async (tx) => {
                // SERIALIZE per account to prevent unique constraint violations on frs9_imp_ia_header
                await tx.execute(sql`SELECT pg_advisory_xact_lock(${accountId})`);

                const assessment = await this.getAssessment(data.tenantId || 'legacy', accountId);
                if (!assessment) {
                    throw new Error(`Assessment source for account ${accountId} not found`);
                }

                const now = new Date().toISOString();
                const createdBy = String(data.createdBy || 'SYSTEM').slice(0, 36) || 'SYSTEM';

                const existing = await tx.select()
                    .from(frs9ImpIaHeader)
                    .where(eq(frs9ImpIaHeader.accountId, accountId))
                    .orderBy(desc(frs9ImpIaHeader.updateddate), desc(frs9ImpIaHeader.createddate))
                    .limit(1);

                const headerPayload = {
                    scenarioId: scenarioMethodId,
                    nOfScenario: scenarioCount,
                    poRate1: poRates[0] || 0,
                    poRate2: poRates[1] || 0,
                    poRate3: poRates[2] || 0,
                    scName1: scNames[0],
                    scName2: scNames[1],
                    scName3: scNames[2],
                    triggerRemarks: String(data.description || assessment.impairment_reason || assessment.analyst_comments || ''),
                    status: STATUS_MAP_TO_INT[String(data.status || 'PENDING').toUpperCase()] ?? 0,
                    updatedby: createdBy,
                    updateddate: now,
                    updatedhost: 'localhost'
                };

                let savedHeader;
                let iaId;

                if (existing.length > 0) {
                    iaId = Number(existing[0].iaId);
                    [savedHeader] = await tx.update(frs9ImpIaHeader)
                        .set(headerPayload)
                        .where(eq(frs9ImpIaHeader.pkid, existing[0].pkid))
                        .returning();
                } else {
                    iaId = await this.generateIaId(tx);
                    const prcDate = assessment.prc_date || new Date().toISOString().slice(0, 10);
                    const impairedFlag = String(assessment.impaired_flag || 'N').toUpperCase() === 'I' ? 'T' : 'F';

                    [savedHeader] = await tx.insert(frs9ImpIaHeader).values({
                        iaId,
                        prcDate,
                        effDate: assessment.eff_date || prcDate,
                        cifNumber: assessment.cif_number || 'UNKNOWN',
                        cifName: assessment.cif_name || 'UNKNOWN',
                        accountId,
                        accountNumber: assessment.account_number || String(accountId),
                        currency: assessment.currency || 'IDR',
                        effInterestRate: Number(assessment.eff_interest_rate || 0),
                        interestRate: Number(assessment.interest_rate || 0),
                        dpd: Number(assessment.dpd || 0),
                        collectability: Number(assessment.collectability || 0),
                        ratingCode: assessment.rating_code || null,
                        impairedFlag,
                        method: 'DCF',
                        plafond: String(assessment.plafond || assessment.outstanding_balance || 0),
                        outstanding: String(assessment.outstanding_balance || 0),
                        accruedInterest: String(assessment.accrued_interest || 0),
                        carryingAmt: String(assessment.carrying_amt || assessment.outstanding_balance || 0),
                        eadAmt: String(assessment.ead_amt || assessment.outstanding_balance || 0),
                        pvDcfAmt: '0',
                        eclIaAmt: '0',
                        triggerFilename: assessment.supporting_documents?.[0] || null,
                        createdby: createdBy,
                        createddate: now,
                        createdhost: 'localhost',
                        ...headerPayload
                    }).returning();
                }

                await tx.delete(frs9ImpIaRr)
                    .where(eq(frs9ImpIaRr.iaId, iaId));

                const rrRowsPayload = boundedRows.map((row, index) => ({
                    iaId,
                    accountId,
                    periodStart: row.periodStart || assessment.prc_date || new Date().toISOString().slice(0, 10),
                    periodEnd: row.periodEnd || row.periodStart || assessment.prc_date || new Date().toISOString().slice(0, 10),
                    rrRate1: index === 0 ? Number(row.repaymentRate || 0) : 0,
                    rrRate2: index === 1 ? Number(row.repaymentRate || 0) : 0,
                    rrRate3: index === 2 ? Number(row.repaymentRate || 0) : 0,
                    createdby: createdBy,
                    createddate: now,
                    createdhost: 'localhost'
                }));

                if (rrRowsPayload.length > 0) {
                    await tx.insert(frs9ImpIaRr).values(rrRowsPayload);
                }

                return [this.mapLegacyScenarioHeader(savedHeader, rrRowsPayload)];
            });
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
        const rows = await legacyDb
            .select({
                id: frs9ImpIaDcf.iaId,
                iaId: frs9ImpIaDcf.iaId,
                accountId: frs9ImpIaDcf.accountId,
                accountNumber: frs9ImpIaDcf.accountNumber,
                prcDate: frs9ImpIaDcf.prcDate,
                createdBy: sql<string>`max(${frs9ImpIaDcf.createdby})`,
                createdAt: sql<string>`max(${frs9ImpIaDcf.createddate})`,
                statusCode: sql<string>`max(${frs9ImpIaDcf.status})`,
                recordCount: sql<number>`count(*)::int`
            })
            .from(frs9ImpIaDcf)
            .groupBy(
                frs9ImpIaDcf.iaId,
                frs9ImpIaDcf.accountId,
                frs9ImpIaDcf.accountNumber,
                frs9ImpIaDcf.prcDate
            )
            .orderBy(sql`max(${frs9ImpIaDcf.createddate}) desc`)
            .limit(limit)
            .offset(offset);

        return rows.map((row) => ({
            id: row.id,
            iaId: row.iaId,
            batchId: `IA-${row.iaId}`,
            fileName: `DCF_UPLOAD_${row.accountNumber || row.iaId}_${row.prcDate || 'CURRENT'}.xlsx`,
            accountId: row.accountId,
            accountNumber: row.accountNumber,
            prcDate: row.prcDate,
            recordCount: Number(row.recordCount || 0),
            validationStatus: STATUS_MAP_TO_STRING[Number(row.statusCode || 0)] || 'PENDING',
            createdBy: row.createdBy || 'SYSTEM',
            createdAt: row.createdAt
        }));
    }

    async createDcfUpload(data: any) {
        const accountId = Number(data.accountId || data.account_id || 0);
        return await legacyDb.transaction(async (tx) => {
            if (accountId) await tx.execute(sql`SELECT pg_advisory_xact_lock(${accountId})`);
            const iaId = await this.generateIaId(tx);
            return tx.insert(frs9ImpIaDcf).values({
                ...data,
                iaId,
                createdby: 'SYSTEM',
                createddate: new Date().toISOString(),
                createdhost: 'localhost',
                status: '0' // Default status
            }).returning();
        });
    }

    async getDcfCashflows(tenantId: string, uploadId: string) {
        const rows = await legacyDb.select()
            .from(frs9ImpIaDcf)
            .where(eq(frs9ImpIaDcf.iaId, Number(uploadId)))
            .orderBy(frs9ImpIaDcf.periode);

        return rows.map((row) => this.mapDcfCashflowRow(row));
    }

    async getDcfCalculations(tenantId: string) {
        // Mengambil 100 data kalkulasi terakhir dari tabel Result Header
        return await legacyDb.select()
            .from(frs9ImpIaResultH)
            .orderBy(desc(frs9ImpIaResultH.createddate))
            .limit(100);
    }

    async getIaResultDetail(
        tenantId: string,
        filters: { accountId?: number; accountNumber?: string }
    ) {
        const { accountId, accountNumber } = filters;

        if (!accountId && !accountNumber) {
            throw new Error('Account reference is required');
        }

        const headerConditions = [];

        if (accountId) {
            headerConditions.push(eq(frs9ImpIaHeader.accountId, Number(accountId)));
        }

        if (!accountId && accountNumber) {
            headerConditions.push(eq(frs9ImpIaHeader.accountNumber, accountNumber));
        }

        const headers = await legacyDb.select()
            .from(frs9ImpIaHeader)
            .where(and(...headerConditions))
            .orderBy(desc(frs9ImpIaHeader.updateddate), desc(frs9ImpIaHeader.createddate), desc(frs9ImpIaHeader.prcDate))
            .limit(1);

        if (!headers.length) {
            return {
                header: null,
                cashflows: [],
                details: []
            };
        }

        const header = headers[0];

        const detailConditions = [];

        if (header.iaId != null) {
            detailConditions.push(eq(frs9ImpIaDetail.iaId, Number(header.iaId)));
        } else if (header.accountId != null) {
            detailConditions.push(eq(frs9ImpIaDetail.accountId, Number(header.accountId)));
        }

        const details = detailConditions.length > 0
            ? await legacyDb.select()
                .from(frs9ImpIaDetail)
                .where(and(...detailConditions))
                .orderBy(frs9ImpIaDetail.mob, frs9ImpIaDetail.periode)
            : [];

        const cashflowConditions = [];
        if (header.iaId != null) {
            cashflowConditions.push(eq(frs9ImpIaDcf.iaId, Number(header.iaId)));
        } else if (header.accountId != null) {
            cashflowConditions.push(eq(frs9ImpIaDcf.accountId, Number(header.accountId)));
        }

        const cashflows = cashflowConditions.length > 0
            ? await legacyDb.select()
                .from(frs9ImpIaDcf)
                .where(and(...cashflowConditions))
                .orderBy(frs9ImpIaDcf.mob, frs9ImpIaDcf.periode)
            : [];

        return {
            header: this.mapIaResultHeaderRow(header),
            cashflows: cashflows.map((row) => this.mapDcfCashflowRow(row)),
            details: details.map((row) => this.mapIaResultDetailRow(row))
        };
    }

    async createDcfCashflows(payload: { cashflows: any[]; scenario?: any }) {
        const data = Array.isArray(payload?.cashflows) ? payload.cashflows : [];
        if (data.length === 0) {
            return [];
        }

        const sample = data[0];
        const accountId = Number(sample.accountId || sample.account_id || 0);
        if (!accountId) {
            throw new Error('Account ID is required for DCF upload');
        }

        const createdBy = String(sample.createdBy || 'SYSTEM').slice(0, 36) || 'SYSTEM';
        const createdHost = String(sample.createdHost || 'localhost').slice(0, 36) || 'localhost';

        return legacyDb.transaction(async (tx) => {
            // SERIALIZE per account to prevent unique constraint violations during cashflow updates
            await tx.execute(sql`SELECT pg_advisory_xact_lock(${accountId})`);

            const existingHeader = await this.ensureLegacyIaHeader(tx, accountId, createdBy, createdHost);
            let activeHeader = existingHeader;
            let rrRows: any[] = [];

            if (payload?.scenario) {
                const syncedScenario = await this.syncLegacyScenarioForHeader(
                    tx,
                    existingHeader,
                    accountId,
                    payload.scenario,
                    createdBy,
                    createdHost
                );
                activeHeader = syncedScenario.header;
                rrRows = syncedScenario.rrRows;
            } else {
                rrRows = await tx.select()
                    .from(frs9ImpIaRr)
                    .where(eq(frs9ImpIaRr.iaId, Number(existingHeader.iaId)))
                    .orderBy(frs9ImpIaRr.periodStart, frs9ImpIaRr.periodEnd);
            }

            const iaId = Number(activeHeader.iaId);
            const prcDate = this.toDateString(sample.prcDate || activeHeader.prcDate || new Date());
            const createdAt = new Date().toISOString();

            await tx.delete(frs9ImpIaDcf).where(eq(frs9ImpIaDcf.accountId, accountId));
            await tx.delete(frs9ImpIaDetail).where(eq(frs9ImpIaDetail.accountId, accountId));

            const seenPeriods = new Set();
            const rows = data.map((row: any, index: number) => {
                // Handle case-insensitive keys from Excel headers (uppercase vs lowercase)
                const rawPeriode = row.periode || row.PERIODE || row.periodDate || row.period;
                const rawPrincipal = row.principal || row.PRINCIPAL;
                const rawInterest = row.interest || row.INTEREST;
                const rawCollateral = row.collateral || row.COLLATERAL;
                const rawMob = row.mob || row.MOB;

                const mob = Number(rawMob || index + 1);
                const periodeStr = this.toDateString(rawPeriode || createdAt.slice(0, 10));

                if (seenPeriods.has(periodeStr)) {
                    throw new Error(`Duplicate Date detected in payload for Account ${accountId}: ${periodeStr}. Each period must be unique.`);
                }
                seenPeriods.add(periodeStr);

                return {
                    iaId,
                    prcDate,
                    accountId,
                    accountNumber: String(row.accountNumber || row.ACCOUNT_NUMBER || activeHeader.accountNumber || ''),
                    mob: mob,
                    periode: periodeStr,
                    principal: String(this.toNumber(rawPrincipal)),
                    interest: String(this.toNumber(rawInterest)),
                    collateral: String(this.toNumber(rawCollateral)),
                    status: String(row.status || row.STATUS || '0').slice(0, 1) || '0',
                    createdby: createdBy,
                    createddate: createdAt,
                    createdhost: createdHost
                };
            });

            const inserted = await tx.insert(frs9ImpIaDcf).values(rows).returning();

            const detailRows = this.buildLegacyIaDetailRows(activeHeader, rrRows, inserted, createdBy, createdHost);
            const npv = detailRows.reduce((sum, row) => sum + this.toNumber(row.pvAmt), 0);
            const eadAmt = this.toNumber(activeHeader.eadAmt);

            await tx.update(frs9ImpIaHeader)
                .set({
                    prcDate,
                    pvDcfAmt: String(Number(npv.toFixed(6))),
                    eclIaAmt: String(Number((eadAmt - npv).toFixed(6))),
                    updatedby: createdBy,
                    updateddate: createdAt,
                    updatedhost: createdHost
                })
                .where(eq(frs9ImpIaHeader.pkid, Number(activeHeader.pkid)));

            if (detailRows.length > 0) {
                await tx.insert(frs9ImpIaDetail).values(
                    detailRows.map((row) => ({
                        ...row,
                        principal: String(Number(row.principal.toFixed(6))),
                        interest: String(Number(row.interest.toFixed(6))),
                        installment: String(Number(row.installment.toFixed(6))),
                        collateral: String(Number(row.collateral.toFixed(6))),
                        default1: String(Number(row.default1.toFixed(6))),
                        default2: String(Number(row.default2.toFixed(6))),
                        default3: String(Number(row.default3.toFixed(6))),
                        pwAmt: String(Number(row.pwAmt.toFixed(6))),
                        pvAmt: String(Number(row.pvAmt.toFixed(6))),
                        beginningBalance: String(Number(row.beginningBalance.toFixed(6))),
                        eirAmt: String(Number(row.eirAmt.toFixed(6))),
                        endingBalance: String(Number(row.endingBalance.toFixed(6)))
                    }))
                );
            }

            return inserted.map((row) => this.mapDcfCashflowRow(row));
        });
    }

    async calculateDcf(tenantId: string, params: any) {
        const { 
            accountId, 
        } = params || {};
        
        // Support various payload structures (assumptions vs scenario, repaymentRates vs rrRows, etc.)
        const assumptions = params.scenario || params.assumptions || {};
        const repaymentRates = params.repaymentRates || params.rrRows || [];
        const cashflows = params.cashflows || params.rows || [];

        const userId = params?.userId || 'SYSTEM';
        const host = params?.host || 'localhost';
        const accountIdNum = Number(accountId);

        return await legacyDb.transaction(async (tx) => {
            // 0. ADVISORY LOCK: Prevent concurrent processing for the same account
            await tx.execute(sql`SELECT pg_advisory_xact_lock(${accountIdNum})`);

            // 1. Fetch Master Account Data
            const masterAccount = await tx.select()
                .from(frs9MasterAccount)
                .where(eq(frs9MasterAccount.accountId, accountIdNum))
                .orderBy(desc(frs9MasterAccount.prcDate))
                .limit(1);

            if (!masterAccount.length) throw new Error("Master Account not found in Database");
            const ma = masterAccount[0];

            // 2. IA ID Management via robust UPSERT
            const headerData = {
                prcDate: ma.prcDate || new Date().toISOString().slice(0, 10),
                effDate: new Date().toISOString().slice(0, 10),
                cifNumber: ma.cifNumber || 'UNKNOWN',
                cifName: ma.cifName || 'UNKNOWN',
                accountId: accountIdNum,
                accountNumber: ma.accountNumber || 'UNKNOWN',
                currency: ma.currency || 'IDR',
                effInterestRate: this.toNumber(ma.effInterestRate),
                interestRate: this.toNumber(ma.interestRate),
                impairedFlag: 'I',
                outstanding: ma.outstanding || "0",
                carryingAmt: ma.carryingAmt || "0",
                eadAmt: ma.outstanding || "0",
                status: 1, // NEW
                nOfScenario: Number(assumptions?.nOfScenario || 3),
                scenarioId: Number(assumptions?.scenarioId || 1),
                scName1: String(assumptions?.scName1 || 'Base').slice(0, 20),
                scName2: assumptions?.scName2 ? String(assumptions.scName2).slice(0, 20) : 'Optimistic',
                scName3: assumptions?.scName3 ? String(assumptions.scName3).slice(0, 20) : 'Pessimistic',
                poRate1: this.toNumber(assumptions?.poRate1),
                poRate2: this.toNumber(assumptions?.poRate2),
                poRate3: this.toNumber(assumptions?.poRate3),
                method: String(assumptions?.method || '3'),
            };

            const insertedHeader = await this.upsertIaHeader(accountIdNum, headerData, userId, host, tx);
            const iaId = insertedHeader.iaId;

            // 3. Save Repayment Rates (RR)
            await tx.delete(frs9ImpIaRr).where(eq(frs9ImpIaRr.iaId, iaId));
            if (repaymentRates && Array.isArray(repaymentRates)) {
                for (const rr of repaymentRates) {
                    await tx.insert(frs9ImpIaRr).values({
                        iaId: iaId,
                        accountId: accountIdNum,
                        periodStart: this.toDateString(rr.periodStart),
                        periodEnd: this.toDateString(rr.periodEnd),
                        rrRate1: this.toNumber(rr.rrRate1),
                        rrRate2: this.toNumber(rr.rrRate2),
                        rrRate3: this.toNumber(rr.rrRate3),
                        createdby: userId,
                        createddate: new Date().toISOString(),
                        createdhost: host
                    });
                }
            }

            // 4. Save DCF Uploads
            await tx.delete(frs9ImpIaDcf).where(eq(frs9ImpIaDcf.iaId, iaId));
            if (cashflows && Array.isArray(cashflows)) {
                for (const cf of cashflows) {
                    await tx.insert(frs9ImpIaDcf).values({
                        iaId: iaId,
                        prcDate: ma.prcDate || new Date().toISOString().slice(0, 10),
                        accountId: accountIdNum,
                        accountNumber: ma.accountNumber || 'UNKNOWN',
                        mob: cf.mob || 0,
                        periode: this.toDateString(cf.periode),
                        principal: this.toNumber(cf.principal).toString(),
                        interest: this.toNumber(cf.interest).toString(),
                        collateral: this.toNumber(cf.collateral).toString(),
                        status: 'A',
                        createdby: userId,
                        createddate: new Date().toISOString(),
                        createdhost: host
                    });
                }
            }

            // 5. THE CALCULATION ENGINE
            const allDcf = await tx.select().from(frs9ImpIaDcf).where(eq(frs9ImpIaDcf.iaId, iaId)).orderBy(asc(frs9ImpIaDcf.mob));
            const allRr = await tx.select().from(frs9ImpIaRr).where(eq(frs9ImpIaRr.iaId, iaId));
            
            const poRate1 = this.toNumber(assumptions.poRate1) / 100;
            const poRate2 = this.toNumber(assumptions.poRate2) / 100;
            const poRate3 = this.toNumber(assumptions.poRate3) / 100;
            
            const rawEir = this.toNumber(ma.effInterestRate);
            const nominalRate = this.toNumber(ma.interestRate);
            const finalEir = rawEir > 0 ? rawEir : nominalRate;
            const eir = finalEir / 100;

            let totalNpv = 0;
            const detailRows = [];

            for (const cf of allDcf) {
                const cfDate = new Date(cf.periode);
                const rr = allRr.find(r => {
                    const start = new Date(r.periodStart);
                    const end = new Date(r.periodEnd);
                    // Match by date range
                    return cfDate >= start && cfDate <= end;
                }) || allRr[0] || { rrRate1: 100, rrRate2: 100, rrRate3: 100 }; // Fallback to first scenario or 100%

                const rr1 = this.toNumber(rr.rrRate1) / 100;
                const rr2 = this.toNumber(rr.rrRate2) / 100;
                const rr3 = this.toNumber(rr.rrRate3) / 100;

                const baseAmount = this.toNumber(cf.principal) + this.toNumber(cf.interest) + this.toNumber(cf.collateral);
                
                const def1 = baseAmount * poRate1 * rr1;
                const def2 = baseAmount * poRate2 * rr2;
                const def3 = baseAmount * poRate3 * rr3;
                
                const pwAmt = def1 + def2 + def3;
                const mob = Number(cf.mob);
                const discountFactor = Math.pow(1 / (1 + eir / 12), mob);
                const pvAmt = pwAmt * discountFactor;

                totalNpv += pvAmt;

                detailRows.push({
                    iaId,
                    accountId: accountIdNum,
                    effInterestRate: ma.effInterestRate,
                    mob,
                    periode: cf.periode,
                    principal: cf.principal,
                    interest: cf.interest,
                    installment: (this.toNumber(cf.principal) + this.toNumber(cf.interest)).toString(),
                    collateral: cf.collateral,
                    poRate1: poRate1 * 100,
                    rrRate1: rr1 * 100,
                    default1: def1.toString(),
                    poRate2: poRate2 * 100,
                    rrRate2: rr2 * 100,
                    default2: def2.toString(),
                    poRate3: poRate3 * 100,
                    rrRate3: rr3 * 100,
                    default3: def3.toString(),
                    pwAmt: pwAmt.toString(),
                    discountFactor,
                    pvAmt: pvAmt.toString(),
                    createdby: userId,
                    createddate: new Date().toISOString(),
                    createdhost: host
                });
            }

            // 6. AMORTIZATION SCHEDULE
            let runningBalance = totalNpv;
            for (let i = 0; i < detailRows.length; i++) {
                const row = detailRows[i];
                const beginningBalance = runningBalance;
                const eirAmt = beginningBalance * (eir / 12);
                const pwAmt = this.toNumber(row.pwAmt);
                const endingBalance = beginningBalance + eirAmt - pwAmt;

                row.beginningBalance = beginningBalance.toString();
                row.interestAccrual = eirAmt.toString();
                row.endingBalance = endingBalance.toString();
                row.weightedFlow = pwAmt.toString();

                runningBalance = endingBalance;
            }

            // 7. Persist Result Details & Update Header
            await tx.delete(frs9ImpIaDetail).where(eq(frs9ImpIaDetail.iaId, iaId));
            if (detailRows.length > 0) {
                await tx.insert(frs9ImpIaDetail).values(detailRows);
            }

            const eadAmt = this.toNumber(ma.outstanding);
            const eclIaAmt = Math.max(0, eadAmt - totalNpv);

            await tx.update(frs9ImpIaHeader)
                .set({
                    pvDcfAmt: totalNpv.toString(),
                    eclIaAmt: eclIaAmt.toString(),
                    updatedby: userId,
                    updateddate: new Date().toISOString()
                })
                .where(eq(frs9ImpIaHeader.iaId, iaId));

            return {
                success: true,
                iaId,
                totalNpv,
                presentValue: totalNpv,
                eadAmt,
                outstandingBalance: eadAmt,
                eclIaAmt,
                recommendedProvision: eclIaAmt,
                lgd: eclIaAmt,
                details: detailRows,
                assumptions: {
                    ...assumptions,
                    effectiveInterestRate: finalEir,
                    discountRate: finalEir
                }
            };
        });
    }

    // =========================================================================
    // WATCHLIST (1.4.1) -> frs9_imp_ia_header
    // =========================================================================

    private async mapWatchlistRows(results: any[]) {
        const accountNumbers = results.map(r => r.accountNumber).filter((n): n is string => !!n);
        const overrides = accountNumbers.length > 0
            ? await legacyDb.select()
                .from(frs9ImpIaHeader)
                .where(inArray(frs9ImpIaHeader.accountNumber, accountNumbers))
            : [];

        return results.map(row => {
            const override = overrides.find(o => o.accountNumber === row.accountNumber);

            let currentStage = Number(row.stage) || 1;
            let currentStatus = 'NEW';
            let currentNotes = '';
            let currentImpaired = row.impairedFlag ? 'I' : 'N';

            if (override) {
                currentStage = override.impairedFlag === 'T' ? 3 : 1;
                currentStatus = STATUS_MAP_TO_STRING[override.status as number] || 'IN_PROGRESS';
                currentNotes = override.triggerRemarks || 'Manual Override';
                currentImpaired = override.impairedFlag === 'T' ? 'I' : 'N';
            }

            return {
                pkid: Number(row.pkid),
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
                group_segment: row.groupSegment,
                segment: row.segment,
                sub_segment: row.subSegment,
                createdby: 'SYSTEM',
                createddate: row.prcDate,
                is_override: !!override
            };
        });
    }

    async getWatchlist(tenantId: string, filters: {
        search?: string;
        stage?: number;
        impaired_flag?: string;
        status?: string;
        priority_level?: string;
        rating_code?: string;
        dateFrom?: string;
        dateTo?: string;
        limit?: number;
        offset?: number;
        cursor?: string;
        paginationMode?: 'offset' | 'cursor';
        sort?: Array<{ field: string; direction: 'asc' | 'desc' }>;
    }) {
        try {
            const { limit = 50, offset = 0, search, stage, impaired_flag, status, priority_level, rating_code, dateFrom, dateTo } = filters;

            if (filters.paginationMode === 'cursor' || filters.cursor) {
                const result = await Effect.runPromise(MasterAccountRepository.findAllCursor({
                    limit,
                    search,
                    stage,
                    impairedFlag: impaired_flag === 'I' || impaired_flag === 'N' ? impaired_flag : undefined,
                    ratingCode: rating_code,
                    dateFrom,
                    dateTo,
                    cursor: filters.cursor,
                    sort: filters.sort,
                }) as any);
                const mergedData = await this.mapWatchlistRows(result.data);
                let filteredResponse = mergedData;
                if (status) {
                    filteredResponse = filteredResponse.filter(item => item.assessment_status === status);
                }
                if (priority_level) {
                    filteredResponse = filteredResponse.filter(item => item.priority_level === priority_level);
                }

                return {
                    data: filteredResponse,
                    total: undefined,
                    nextCursor: result.nextCursor,
                    previousCursor: result.previousCursor,
                    hasNextPage: result.hasNextPage,
                    hasPreviousPage: result.hasPreviousPage,
                };
            }

            // Techspec Individual Watchlist source:
            // FRS9_MASTER_ACCOUNT candidates with DPD > 30, OUTSTANDING >= 1,000,000,
            // excluding accounts already marked individual in IA header.
            const conditions = [
                sql`${frs9MasterAccount.dpd} > 30`,
                sql`${frs9MasterAccount.outstanding} >= 1000000`,
                sql`NOT EXISTS (
                    SELECT 1
                    FROM frs9_imp_ia_header h
                    WHERE h.account_id = ${frs9MasterAccount.accountId}
                    AND (h.impaired_flag = 'I' OR h.impaired_flag = 'T')
                )`,
            ];

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
            if (!dateFrom && !dateTo) {
                // Default to latest full snapshot date (avoid tiny ad-hoc/test dates, e.g. only a few rows)
                conditions.push(sql`${frs9MasterAccount.prcDate} = COALESCE(
                    (
                        SELECT prc_date
                        FROM frs9_master_account
                        GROUP BY prc_date
                        HAVING COUNT(*) >= 100
                        ORDER BY prc_date DESC
                        LIMIT 1
                    ),
                    (SELECT MAX(prc_date) FROM frs9_master_account)
                )`);
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

            // 4. Merge overrides (Manual Interventions): Override > Master Account
            const mergedData = await this.mapWatchlistRows(results);

            // 6. Final Filter (Status filtering applies to Overrides primarily)
            let filteredResponse = mergedData;
            if (status) {
                filteredResponse = mergedData.filter(item => item.assessment_status === status);
            }
            if (priority_level) {
                filteredResponse = filteredResponse.filter(item => item.priority_level === priority_level);
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

    async getCustomerList(tenantId: string, filters: {
        search?: string;
        dateFrom?: string;
        dateTo?: string;
        limit?: number;
        offset?: number;
        cursor?: string;
        paginationMode?: 'offset' | 'cursor';
        sort?: Array<{ field: string; direction: 'asc' | 'desc' }>;
    }) {
        try {
            const { limit = 25, offset = 0, search, dateFrom, dateTo } = filters;
            const conditions: any[] = [sql`m.account_number IS NOT NULL`];

            if (search) {
                const keyword = `%${search}%`;
                conditions.push(sql`(
                    m.account_number ILIKE ${keyword}
                    OR m.cif_name ILIKE ${keyword}
                    OR m.cif_number ILIKE ${keyword}
                )`);
            }

            if (dateFrom) {
                conditions.push(sql`m.prc_date >= ${dateFrom}`);
            }

            if (dateTo) {
                conditions.push(sql`m.prc_date <= ${dateTo}`);
            }

            if (!dateFrom && !dateTo) {
                // Default to latest full snapshot date to avoid tiny ad-hoc/test dates.
                conditions.push(sql`m.prc_date = COALESCE(
                    (
                        SELECT prc_date
                        FROM frs9_master_account
                        GROUP BY prc_date
                        HAVING COUNT(*) >= 100
                        ORDER BY prc_date DESC
                        LIMIT 1
                    ),
                    (SELECT MAX(prc_date) FROM frs9_master_account)
                )`);
            }

            const whereClause = conditions.length > 0
                ? sql`WHERE ${conditions.reduce((acc, condition, index) => index === 0 ? condition : sql`${acc} AND ${condition}`)}`
                : sql``;

            if (filters.paginationMode === 'cursor' || filters.cursor) {
                const sort = filters.sort?.[0] ?? { field: 'prc_date', direction: 'desc' };
                const sortColumnMap = {
                    pkid: sql`f.pkid`,
                    prcDate: sql`f.prc_date`,
                    prc_date: sql`f.prc_date`,
                    accountNumber: sql`f.account_number`,
                    account_number: sql`f.account_number`,
                    cifName: sql`f.cif_name`,
                    cif_name: sql`f.cif_name`,
                    outstanding: sql`f.outstanding`,
                    stage: sql`f.stage`,
                    dpd: sql`f.dpd`,
                };
                const sortResultKey = {
                    pkid: 'pkid',
                    prcDate: 'prc_date',
                    prc_date: 'prc_date',
                    accountNumber: 'account_number',
                    account_number: 'account_number',
                    cifName: 'cif_name',
                    cif_name: 'cif_name',
                    outstanding: 'outstanding_balance',
                    stage: 'stage',
                    dpd: 'dpd',
                }[sort.field] ?? 'prc_date';
                const sortColumn = sortColumnMap[sort.field] ?? sql`f.prc_date`;
                const cursorPayload = decodeCursor(filters.cursor);
                const cursorCondition = cursorPayload?.pkid !== undefined && cursorPayload.sortValue !== undefined
                    ? (sort.direction === 'asc'
                        ? sql`AND (${sortColumn} > ${cursorPayload.sortValue} OR (${sortColumn} = ${cursorPayload.sortValue} AND f.pkid > ${BigInt(String(cursorPayload.pkid))}))`
                        : sql`AND (${sortColumn} < ${cursorPayload.sortValue} OR (${sortColumn} = ${cursorPayload.sortValue} AND f.pkid < ${BigInt(String(cursorPayload.pkid))}))`)
                    : sql``;
                const orderBy = sort.direction === 'asc'
                    ? sql`${sortColumn} ASC, f.pkid ASC`
                    : sql`${sortColumn} DESC, f.pkid DESC`;

                const cursorQuery = sql`
                    WITH filtered AS (
                        SELECT
                            m.pkid,
                            m.prc_date,
                            m.account_id,
                            m.account_number,
                            m.cif_number,
                            m.cif_name,
                            m.group_segment,
                            m.segment,
                            m.sub_segment,
                            m.stage,
                            m.impaired_flag,
                            m.outstanding,
                            m.ecl_final_amt,
                            m.internal_rating_code,
                            m.dpd,
                            ROW_NUMBER() OVER (
                                PARTITION BY m.account_number
                                ORDER BY m.prc_date DESC, m.pkid DESC
                            ) as rn
                        FROM frs9_master_account m
                        ${whereClause}
                    ),
                    latest_header AS (
                        SELECT DISTINCT ON (h.account_number)
                            h.account_number,
                            h.trigger_remarks,
                            h.status
                        FROM frs9_imp_ia_header h
                        WHERE h.account_number IS NOT NULL
                        ORDER BY h.account_number, h.createddate DESC NULLS LAST, h.pkid DESC
                    )
                    SELECT
                        f.pkid,
                        f.prc_date,
                        f.account_id,
                        f.account_number,
                        f.cif_number,
                        f.cif_name,
                        f.group_segment,
                        f.segment,
                        f.sub_segment,
                        COALESCE(NULLIF(REGEXP_REPLACE(CAST(f.stage AS TEXT), '[^0-9]', '', 'g'), '')::INTEGER, 1) as stage,
                        CASE WHEN f.impaired_flag = true THEN 'I' ELSE 'N' END as impaired_flag,
                        COALESCE(CAST(f.outstanding AS DECIMAL), 0) as outstanding_balance,
                        COALESCE(CAST(f.ecl_final_amt AS DECIMAL), 0) as provision_amount,
                        f.internal_rating_code as rating_code,
                        COALESCE(f.dpd, 0) as dpd,
                        COALESCE(
                            CASE lh.status
                                WHEN 0 THEN 'PENDING'
                                WHEN 1 THEN 'APPROVED'
                                WHEN 2 THEN 'REJECTED'
                                ELSE NULL
                            END,
                            'PENDING'
                        ) as assessment_status,
                        NULLIF(TRIM(COALESCE(lh.trigger_remarks, '')), '') as remarks
                    FROM filtered f
                    LEFT JOIN latest_header lh ON lh.account_number = f.account_number
                    WHERE f.rn = 1
                    ${cursorCondition}
                    ORDER BY ${orderBy}
                    LIMIT ${limit + 1}
                `;

                const rows = await legacyDb.execute(cursorQuery);
                const pageRows = rows.slice(0, limit);
                const lastRow = pageRows[pageRows.length - 1];
                const hasNextPage = rows.length > limit;
                const nextCursor = hasNextPage && lastRow
                    ? encodeCursor({
                        field: sort.field,
                        direction: sort.direction,
                        sortValue: lastRow[sortResultKey],
                        pkid: String(lastRow.pkid),
                    })
                    : null;

                return {
                    data: pageRows,
                    total: undefined,
                    nextCursor,
                    previousCursor: filters.cursor ?? null,
                    hasNextPage,
                    hasPreviousPage: Boolean(filters.cursor),
                };
            }

            const countQuery = sql`
                WITH filtered AS (
                    SELECT DISTINCT m.account_number
                    FROM frs9_master_account m
                    ${whereClause}
                )
                SELECT COUNT(*) as total
                FROM filtered
            `;

            const countResult = await legacyDb.execute(countQuery);
            const total = Number(countResult?.[0]?.total || 0);
            if (total === 0) return { data: [], total: 0 };

            const query = sql`
                WITH filtered AS (
                    SELECT
                        m.pkid,
                        m.prc_date,
                        m.account_id,
                        m.account_number,
                        m.cif_number,
                        m.cif_name,
                        m.group_segment,
                        m.segment,
                        m.sub_segment,
                        m.stage,
                        m.impaired_flag,
                        m.outstanding,
                        m.ecl_final_amt,
                        m.internal_rating_code,
                        m.dpd,
                        ROW_NUMBER() OVER (
                            PARTITION BY m.account_number
                            ORDER BY m.prc_date DESC, m.pkid DESC
                        ) as rn
                    FROM frs9_master_account m
                    ${whereClause}
                ),
                latest_header AS (
                    SELECT DISTINCT ON (h.account_number)
                        h.account_number,
                        h.trigger_remarks,
                        h.status
                    FROM frs9_imp_ia_header h
                    WHERE h.account_number IS NOT NULL
                    ORDER BY h.account_number, h.createddate DESC NULLS LAST, h.pkid DESC
                )
                SELECT
                    f.pkid,
                    f.prc_date,
                    f.account_id,
                    f.account_number,
                    f.cif_number,
                    f.cif_name,
                    f.group_segment,
                    f.segment,
                    f.sub_segment,
                    COALESCE(NULLIF(REGEXP_REPLACE(CAST(f.stage AS TEXT), '[^0-9]', '', 'g'), '')::INTEGER, 1) as stage,
                    CASE WHEN f.impaired_flag = true THEN 'I' ELSE 'N' END as impaired_flag,
                    COALESCE(CAST(f.outstanding AS DECIMAL), 0) as outstanding_balance,
                    COALESCE(CAST(f.ecl_final_amt AS DECIMAL), 0) as provision_amount,
                    f.internal_rating_code as rating_code,
                    COALESCE(f.dpd, 0) as dpd,
                    COALESCE(
                        CASE lh.status
                            WHEN 0 THEN 'PENDING'
                            WHEN 1 THEN 'APPROVED'
                            WHEN 2 THEN 'REJECTED'
                            ELSE NULL
                        END,
                        'NEW'
                    ) as assessment_status,
                    NULLIF(TRIM(COALESCE(lh.trigger_remarks, '')), '') as remarks
                FROM filtered f
                LEFT JOIN latest_header lh ON lh.account_number = f.account_number
                WHERE f.rn = 1
                ORDER BY f.prc_date DESC, f.account_number
                LIMIT ${limit}
                OFFSET ${offset}
            `;

            const data = await legacyDb.execute(query);
            return { data, total };
        } catch (error) {
            console.error('❌ Database Query Failed in getCustomerList:', error);
            return { data: [], total: 0 };
        }
    }



    async addToWatchlist(data: any) {
        const accountId = Number(data.accountId || data.account_id || 0);
        return await legacyDb.transaction(async (tx) => {
            if (accountId) await tx.execute(sql`SELECT pg_advisory_xact_lock(${accountId})`);
            const iaId = await this.generateIaId(tx);
            return tx.insert(frs9ImpIaHeader).values({
                ...data,
                iaId,
                createdby: 'SYSTEM',
                createddate: new Date().toISOString(),
                createdhost: 'localhost',
            }).returning();
        });
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

        return await legacyDb.transaction(async (tx) => {
            // 0. ADVISORY LOCK
            await tx.execute(sql`SELECT pg_advisory_xact_lock(${accountId})`);

            const statusInt = STATUS_MAP_TO_INT[data.approval_status || 'PENDING'] ?? 0;
            const remarks = data.analyst_comments || data.justification || '';
            const userId = (data.createdby || data.createdBy || 'SYSTEM').slice(0, 36);
            const host = 'localhost'; // Or pass from controller

            // Fetch Master Account details to populate required fields if needed
            const masterAccount = await tx.select()
                .from(frs9MasterAccount)
                .where(eq(frs9MasterAccount.accountId, accountId))
                .limit(1);

            if (!masterAccount.length) throw new Error("Master Account not found");
            const ma = masterAccount[0];
            const today = new Date().toISOString().split('T')[0];

            const headerData = {
                prcDate: ma.prcDate || today,
                effDate: ma.prcDate || today,
                cifNumber: ma.cifNumber || 'UNKNOWN',
                cifName: ma.cifName || 'UNKNOWN',
                accountId: accountId,
                accountNumber: ma.accountNumber || 'UNKNOWN',
                currency: ma.currency || 'IDR',
                effInterestRate: Number(ma.effInterestRate || 0),
                interestRate: Number(ma.interestRate || 0),
                impairedFlag: Number(data.overrideStage) === 3 ? 'T' : 'F',
                triggerRemarks: remarks,
                status: statusInt,
                outstanding: ma.outstanding || "0",
                plafond: ma.plafond || "0",
                accruedInterest: ma.accruedInterest || "0",
                carryingAmt: ma.carryingAmt || "0",
                eadAmt: ma.eadAmt || "0",
                triggerFilename: data.supportingDocument,
                stage: data.overrideStage ? String(data.overrideStage) : undefined,
            };

            return await this.upsertIaHeader(accountId, headerData, userId, host, tx);
        });
    }

    // =========================================================================
    // OVERRIDE TRIGGER (1.4.3) -> frs9_imp_ia_header
    // =========================================================================

    async getOverrides(tenantId: string, filters: { status?: string; accountId?: number; accountNumber?: string; limit?: number; offset?: number }) {
        const { status, accountId, accountNumber, limit = 50, offset = 0 } = filters;
        const conditions = [];

        // Map status string to legacy int if present
        if (status) {
            const statusInt = STATUS_MAP_TO_INT[status] ?? 0;
            conditions.push(eq(frs9ImpIaHeader.status, statusInt));
        }

        if (accountId && Number.isFinite(accountId)) {
            conditions.push(eq(frs9ImpIaHeader.accountId, accountId));
        }

        if (accountNumber && String(accountNumber).trim()) {
            conditions.push(eq(frs9ImpIaHeader.accountNumber, String(accountNumber).trim()));
        }

        const results = await legacyDb.select()
            .from(frs9ImpIaHeader)
            .where(conditions.length > 0 ? and(...conditions) : undefined)
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

        const headerData = {
            impairedFlag: Number(data.overrideStage) === 3 ? 'T' : 'F',
            triggerRemarks: data.justification,
            triggerFilename: data.supportingDocument || data.triggerFilename,
            status: statusInt,
            currency: 'IDR',
            outstanding: "0",
            plafond: "0",
            accruedInterest: "0",
            carryingAmt: "0",
            eadAmt: "0",
            pvDcfAmt: "0",
            eclIaAmt: "0",
            poRate1: 0, poRate2: 0, poRate3: 0,
            cifNumber: data.cifNumber || 'UNKNOWN',
            cifName: data.customerName || 'UNKNOWN',
            accountNumber: accountNumber,
            prcDate: new Date().toISOString().split('T')[0],
            effDate: new Date().toISOString().split('T')[0],
        };

        return await this.upsertIaHeader(
            realAccountId, 
            headerData, 
            String(data.createdBy || 'SYSTEM').slice(0, 36), 
            'localhost'
        );
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

    /**
     * Resets an individual impairment assessment by deleting all associated records.
     * This effectively returns the account to the 'NEW' assessment state.
     */
    async resetAssessment(accountId: number, userId: string) {
        return legacyDb.transaction(async (tx) => {
            // Advisory lock to prevent race conditions during reset
            await tx.execute(sql`SELECT pg_advisory_xact_lock(${accountId})`);

            console.log(`[IndividualImpairmentService] Resetting assessment for account: ${accountId} by user: ${userId}`);

            // 1. Delete DCF records
            await tx.delete(frs9ImpIaDcf).where(eq(frs9ImpIaDcf.accountId, accountId));
            
            // 2. Delete Details
            await tx.delete(frs9ImpIaDetail).where(eq(frs9ImpIaDetail.accountId, accountId));
            
            // 3. Delete Results (H & D)
            await tx.delete(frs9ImpIaResultH).where(eq(frs9ImpIaResultH.accountId, accountId));
            await tx.delete(frs9ImpIaResultD).where(eq(frs9ImpIaResultD.accountId, accountId));
            
            // 4. Delete Recovery Rate records
            await tx.delete(frs9ImpIaRr).where(eq(frs9ImpIaRr.accountId, accountId));
            
            // 5. Delete Assessment Header
            const [deleted] = await tx.delete(frs9ImpIaHeader)
                .where(eq(frs9ImpIaHeader.accountId, accountId))
                .returning();

            if (!deleted) {
                console.warn(`[IndividualImpairmentService] No assessment header found to delete for account: ${accountId}`);
            }

            return { 
                success: true, 
                message: "Assessment reset successfully",
                deletedAccountId: accountId
            };
        });
    }

    /**
     * Unified UPSERT logic for IA Assessment Header to handle concurrency and race conditions.
     */
    private async upsertIaHeader(accountId: number, data: any, userId: string, host: string, tx?: any) {
        const db = tx || legacyDb;
        
        // 1. SERIALIZE per account to handle concurrency at the database level
        await db.execute(sql`SELECT pg_advisory_xact_lock(${accountId})`);

        // 2. Double-check existence to handle race conditions before attempting insert
        const existing = await db.select().from(frs9ImpIaHeader).where(eq(frs9ImpIaHeader.accountId, accountId)).limit(1);
        
        if (existing.length > 0) {
            // UPDATE EXISTING
            const [updated] = await db.update(frs9ImpIaHeader)
                .set({ 
                    ...data, 
                    updatedby: userId, 
                    updateddate: new Date().toISOString(), 
                    updatedhost: host 
                })
                .where(eq(frs9ImpIaHeader.pkid, existing[0].pkid))
                .returning();
            return updated;
        } else {
            // INSERT NEW (with retry logic for concurrent insertion attempts)
            let attempts = 0;
            const maxAttempts = 3;
            
            while (attempts < maxAttempts) {
                try {
                    const iaId = await this.generateIaId(db);
                    const [inserted] = await db.insert(frs9ImpIaHeader).values({
                        ...data,
                        iaId,
                        createdby: userId,
                        createddate: new Date().toISOString(),
                        createdhost: host
                    }).returning();
                    return inserted;
                } catch (error: any) {
                    const errorMsg = error.message?.toLowerCase() || '';
                    if (errorMsg.includes('unique constraint') || errorMsg.includes('duplicate key') || error.code === '23505') {
                        // Concurrency hit: someone else inserted this account between our initial select and insert.
                        // Wait a tiny bit and retry the select-then-update logic.
                        await new Promise(resolve => setTimeout(resolve, 50));
                        const recheck = await db.select().from(frs9ImpIaHeader).where(eq(frs9ImpIaHeader.accountId, accountId)).limit(1);
                        if (recheck.length > 0) {
                            const [updated] = await db.update(frs9ImpIaHeader)
                                .set({ 
                                    ...data, 
                                    updatedby: userId, 
                                    updateddate: new Date().toISOString(), 
                                    updatedhost: host 
                                })
                                .where(eq(frs9ImpIaHeader.pkid, recheck[0].pkid))
                                .returning();
                            return updated;
                        }
                        attempts++;
                    } else {
                        throw error;
                    }
                }
            }
            throw new Error(`Failed to upsert assessment header for account ${accountId} after ${maxAttempts} attempts due to high concurrency.`);
        }
    }

    private async generateIaId(dbx?: any): Promise<number> {
        const db = dbx || legacyDb;
        // GLOBAL ADVISORY LOCK (ID: 9999) to protect the MAX(id)+1 sequence generation
        await db.execute(sql`SELECT pg_advisory_xact_lock(9999)`);
        const result = await db.execute(sql`SELECT COALESCE(MAX(ia_id), 0) as max_id FROM frs9_imp_ia_header`);
        const maxId = Number(result[0]?.max_id || 0);
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
            // If no date filter is provided, default to the latest process date.
            if (!filters.startDate && !filters.endDate) {
                masterConditions.push(sql`m.prc_date = (SELECT prc_date FROM latest_date)`);
            }

            const masterWhere = masterConditions.length > 0
                ? sql`WHERE ${masterConditions.reduce((acc, condition, index) => index === 0 ? condition : sql`${acc} AND ${condition}`)}`
                : sql``;

            // Derive IA stage from override flag (legacy table has no ia.stage column)
            const iaStageExpr = sql`CASE WHEN ia.impaired_flag = 'T' THEN '3' WHEN ia.impaired_flag = 'F' THEN '1' ELSE NULL END`;
            
            // Map legacy stage values to IFRS 9 standard stages
            const caStageExpr = sql`CASE 
                WHEN ca.stage = '0' THEN '1'  -- Performing loans -> Stage 1 (12-month ECL)
                WHEN ca.stage = '1' THEN '1'  -- Already stage 1
                WHEN ca.stage = '2' THEN '2'  -- Already stage 2  
                WHEN ca.stage = '3' THEN '3'  -- Already stage 3
                ELSE NULL 
            END`;
            
            const mStageExpr = sql`CASE 
                WHEN m.stage = '0' THEN '1'  -- Performing loans -> Stage 1 (12-month ECL)
                WHEN m.stage = '1' THEN '1'  -- Already stage 1
                WHEN m.stage = '2' THEN '2'  -- Already stage 2
                WHEN m.stage = '3' THEN '3'  -- Already stage 3  
                ELSE NULL 
            END`;
            
            // We apply the stage filter AFTER computing the final unified stage
            const requestedStage = Number(filters.stage);
            const hasValidStageFilter = filters.stage !== undefined && Number.isFinite(requestedStage);
            const stageFilter = filters.stage
                ? sql`HAVING COALESCE(MAX(${iaStageExpr}), MAX(${caStageExpr}), MAX(${mStageExpr})) = ${filters.stage}`
                : sql``;

            const query = sql`
                WITH latest_date AS (
                    SELECT MAX(prc_date) as prc_date FROM frs9_master_account
                )
                SELECT 
                    m.prc_date as "prcDate",
                    COALESCE(
                        MAX(${iaStageExpr}), 
                        MAX(${caStageExpr}),
                        MAX(${mStageExpr}),
                        '1' -- Default to stage 1 (performing loans) if all are null
                    ) as "stage",
                    COALESCE(m.segment, 'Unknown') as "segmentId",
                    SUM(CAST(m.outstanding AS DECIMAL) / 1000) as "totalOutstanding",
                    SUM(COALESCE(CAST(ia.ecl_ia_amt AS DECIMAL), CAST(ca.ecl_amount AS DECIMAL), 0)) as "totalECL",
                    AVG(CAST(m.outstanding AS DECIMAL) / 1000) as "avgOutstanding"
                FROM frs9_master_account m
                LEFT JOIN frs9_imp_ia_header ia 
                    ON m.account_id = ia.account_id AND ia.status = 1 -- Only approved IA overrides
                LEFT JOIN frs9_imp_ca_result_h ca 
                    ON m.account_id = ca.account_id AND m.prc_date = ca.prc_date
                ${masterWhere}
                -- If no date filter is provided, default to the latest date
                ${(!filters.startDate && !filters.endDate) ? sql`AND m.prc_date = (SELECT prc_date FROM latest_date)` : sql``}
                GROUP BY m.prc_date, COALESCE(m.segment, 'Unknown')
                ${stageFilter}
                ORDER BY m.prc_date DESC, "stage", "segmentId"
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
            // Get unified staging summary across all available data
            const query = sql`
                WITH latest_date AS (
                    SELECT MAX(prc_date) as prc_date FROM frs9_master_account
                ),
                stage_mapping AS (
                    SELECT 
                        m.account_id,
                        m.outstanding,
                        COALESCE(
                            CASE WHEN ia.impaired_flag = 'T' THEN '3' WHEN ia.impaired_flag = 'F' THEN '1' ELSE NULL END,
                            CASE 
                                WHEN ca.stage = '0' THEN '1'  -- Performing loans -> Stage 1 (12-month ECL)
                                WHEN ca.stage = '1' THEN '1'  -- Already stage 1
                                WHEN ca.stage = '2' THEN '2'  -- Already stage 2  
                                WHEN ca.stage = '3' THEN '3'  -- Already stage 3
                                ELSE NULL 
                            END,
                            CASE 
                                WHEN m.stage = '0' THEN '1'  -- Performing loans -> Stage 1 (12-month ECL)
                                WHEN m.stage = '1' THEN '1'  -- Already stage 1
                                WHEN m.stage = '2' THEN '2'  -- Already stage 2
                                WHEN m.stage = '3' THEN '3'  -- Already stage 3  
                                ELSE NULL 
                            END,
                            '1' -- Default to stage 1 (performing loans) if all are null
                        ) as final_stage,
                        COALESCE(ia.ecl_ia_amt, ca.ecl_amount, 0) as original_ecl
                    FROM frs9_master_account m
                    LEFT JOIN frs9_imp_ia_header ia 
                        ON m.account_id = ia.account_id AND ia.status = 1
                    LEFT JOIN frs9_imp_ca_result_h ca 
                        ON m.account_id = ca.account_id AND m.prc_date = ca.prc_date
                    WHERE m.prc_date = (SELECT prc_date FROM latest_date)
                ),
                ecl_calculation AS (
                    SELECT 
                        account_id,
                        outstanding,
                        final_stage,
                        original_ecl,
                        CASE 
                            WHEN original_ecl != 0 THEN original_ecl
                            WHEN final_stage = '1' THEN CAST(outstanding AS DECIMAL) * 0.005  -- 0.5% untuk Stage 1
                            WHEN final_stage = '2' THEN CAST(outstanding AS DECIMAL) * 0.02   -- 2% untuk Stage 2
                            WHEN final_stage = '3' THEN CAST(outstanding AS DECIMAL) * 0.15    -- 15% untuk Stage 3
                            ELSE 0 
                        END as final_ecl
                    FROM stage_mapping
                )
                SELECT 
                    SUM(CAST(outstanding AS DECIMAL) / 1000) as "totalOutstanding",
                    SUM(CAST(final_ecl AS DECIMAL) / 1000) as "totalECL",
                    COUNT(CASE WHEN final_stage = '1' THEN 1 END) as "stage1Count",
                    COUNT(CASE WHEN final_stage = '2' THEN 1 END) as "stage2Count", 
                    COUNT(CASE WHEN final_stage = '3' THEN 1 END) as "stage3Count",
                    SUM(CASE WHEN final_stage = '1' THEN CAST(final_ecl AS DECIMAL) ELSE 0 END) as "stage1ECL",
                    SUM(CASE WHEN final_stage = '2' THEN CAST(final_ecl AS DECIMAL) ELSE 0 END) as "stage2ECL",
                    SUM(CASE WHEN final_stage = '3' THEN CAST(final_ecl AS DECIMAL) ELSE 0 END) as "stage3ECL"
                FROM ecl_calculation
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

    // Get Assessment Summary (Status Breakdown)
    async getAssessmentSummary(tenantId: string, date?: string) {
        try {
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
                status_counts AS (
                    SELECT 
                        status,
                        COUNT(*) as count
                    FROM frs9_imp_ia_header
                    WHERE prc_date = (SELECT target_date FROM target_date_cte)
                    GROUP BY status
                )
                SELECT 
                    COALESCE((SELECT SUM(count) FROM status_counts), 0) as total,
                    COALESCE((SELECT count FROM status_counts WHERE status = 0), 0) as pending,
                    COALESCE((SELECT count FROM status_counts WHERE status = 0), 0) as approve, -- Mapping pending to 'approve' for frontend compatibility
                    COALESCE((SELECT count FROM status_counts WHERE status = 1), 0) as approved,
                    COALESCE((SELECT count FROM status_counts WHERE status = 2), 0) as rejected
            `;

            const result = await legacyDb.execute(query);
            const row = result[0] || { total: 0, pending: 0, approve: 0, approved: 0, rejected: 0 };
            
            return {
                total: Number(row.total || 0),
                pending: Number(row.pending || 0),
                approve: Number(row.approve || 0),
                approved: Number(row.approved || 0),
                rejected: Number(row.rejected || 0)
            };
        } catch (error) {
            console.error('Error in getAssessmentSummary:', error);
            throw error;
        }
    }
}

export const individualImpairmentService = new IndividualImpairmentService();
