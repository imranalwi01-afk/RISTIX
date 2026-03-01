
import { IEclEngine, EclCalculationRequest, EclResult } from './types';
import { legacyDb } from '../../config/database';
import { frs9MasterAccount, frs9ImpCaResultH } from '../../db/schema';
import { sql, eq, and } from 'drizzle-orm';

export class TSEclEngine implements IEclEngine {
    async calculate(request: EclCalculationRequest) {
        console.log(`🚀 [TSEclEngine] Starting TypeScript-based calculation for date: ${request.processDate}...`);

        try {
            const { tenantId, processDate, parameters } = request;

            // Step 1: Fetch Portfolio Data from Master Account
            console.log(`📡 [TSEclEngine] Fetching portfolio data from frs9_master_account for ${processDate}...`);
            const portfolio = await legacyDb
                .select()
                .from(frs9MasterAccount)
                .where(sql`date(${frs9MasterAccount.prcDate}) = ${processDate}`);

            if (portfolio.length === 0) {
                return {
                    success: false,
                    error: `No portfolio data found for date ${processDate}`
                };
            }

            console.log(`📊 [TSEclEngine] Processing ${portfolio.length} accounts...`);

            // Step 2: Calculate PD, LGD, EAD and Stage for each account
            // This mirrors the R implementation logic

            const results = portfolio.map(account => {
                const accountId = account.accountId;

                // --- PD CALCULATION (Historical) ---
                const pdResults = this.calculateBasicPd(account, parameters.pdMethod);

                // --- LGD CALCULATION ---
                const lgd = this.calculateBasicLgd(account, parameters.lgdMethod);

                // --- EAD CALCULATION ---
                const ead = this.calculateBasicEad(account, parameters.eadMethod);

                // --- STAGE CLASSIFICATION ---
                const stage = this.classifyIfrs9Stage(account, pdResults.pd12m);

                // --- ECL CALCULATION ---
                const ecl12m = pdResults.pd12m * lgd * ead;
                const eclLifetime = pdResults.pdLifetime * lgd * ead;

                let eclFinal = ecl12m;
                if (stage === 2 || stage === 3) {
                    eclFinal = eclLifetime;
                }

                return {
                    prcDate: processDate,
                    accountId: accountId,
                    facilityNumber: account.facilityNumber || accountId.toString(),
                    cifNumber: account.cifNumber || '',
                    segmentId: account.segmentId || 1,
                    stage: stage,
                    currency: account.currency || 'IDR',
                    outstanding: account.outstanding || '0',
                    eclAmount: eclFinal.toFixed(6),
                    eclFinal: eclFinal.toFixed(6),
                    lgd: lgd,
                    bucketGroup: account.groupSegment || 'Standard',
                    internalRatingCode: account.internalRatingCode || '',
                    createdby: 'TS_ENGINE',
                    createddate: new Date().toISOString()
                };
            });

            // Step 3: Insert results into database
            console.log(`💾 [TSEclEngine] Inserting ${results.length} results into frs9_imp_ca_resulth...`);

            // Clear existing for this date first (handled in service, but good to be safe or skip if handled)
            // The service already deletes for this date before calling engine

            const CHUNK_SIZE = 1000;
            for (let i = 0; i < results.length; i += CHUNK_SIZE) {
                const chunk = results.slice(i, i + CHUNK_SIZE);
                await legacyDb.insert(frs9ImpCaResultH).values(chunk as any);
            }

            // Step 4: Aggregate Summary
            const totalEcl = results.reduce((sum, r) => sum + parseFloat(r.eclFinal), 0);
            const stage3Ecl = results.reduce((sum, r) => sum + (r.stage === 3 ? parseFloat(r.eclFinal) : 0), 0);

            console.log(`✅ [TSEclEngine] Calculation completed. Total ECL: ${totalEcl}`);

            return {
                success: true,
                data: {
                    result: {
                        total_ecl: totalEcl,
                        stage_3_ecl: stage3Ecl
                    }
                }
            };

        } catch (error: any) {
            console.error(`❌ [TSEclEngine] Error:`, error);
            return {
                success: false,
                error: error.message || 'TS ECL engine failed'
            };
        }
    }

    private calculateBasicPd(account: any, method: string) {
        // Only historical ported for now
        const internalRating = account.internalRatingCode || 'UNKNOWN';

        const ratingPdMap: Record<string, number> = {
            "AAA": 0.001, "AA+": 0.002, "AA": 0.003, "AA-": 0.005, "A+": 0.008, "A": 0.012, "A-": 0.018,
            "BBB+": 0.025, "BBB": 0.035, "BBB-": 0.050, "BB+": 0.075, "BB": 0.100, "BB-": 0.150,
            "B+": 0.200, "B": 0.300, "B-": 0.450, "CCC+": 0.600, "CCC": 0.750, "CCC-": 0.900, "CC": 0.950, "C": 0.990, "D": 1.000
        };

        const basePd12m = ratingPdMap[internalRating] || 0.05;

        // Adjust for DPD
        const dpd = account.dpd || 0;
        let dpdAdjustment = 1.0;
        if (dpd > 90) dpdAdjustment = 3.0;
        else if (dpd > 60) dpdAdjustment = 2.0;
        else if (dpd > 30) dpdAdjustment = 1.5;
        else if (dpd > 0) dpdAdjustment = 1.2;

        // Age adjustment (simplified)
        const startDate = account.startDate ? new Date(account.startDate) : new Date();
        const yearsFromOrigination = (new Date().getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
        const ageFactor = Math.min(1 + yearsFromOrigination * 0.1, 2.0);

        const pd12m = Math.min(basePd12m * dpdAdjustment * ageFactor, 1.0);
        const pdLifetime = Math.min(pd12m * 2.5, 1.0);

        return { pd12m, pdLifetime };
    }

    private calculateBasicLgd(account: any, method: string) {
        const prdType = (account.prdType || '').toLowerCase();
        let baseLgd = 0.45;

        if (prdType.includes('mortgage') || prdType.includes('home')) baseLgd = 0.35;
        else if (prdType.includes('auto') || prdType.includes('vehicle')) baseLgd = 0.55;
        else if (prdType.includes('personal') || prdType.includes('unsecured')) baseLgd = 0.75;
        else if (prdType.includes('credit card')) baseLgd = 0.85;

        // Collateral adjustment (logic simplified from R)
        // In R: if collateral_value > 0 then 0.8 else based on type
        let collateralAdjustment = 1.0;
        // Check for syariah
        const isSyariah = account.prdGroup === 'SYARIAH'; // Simplified mapping
        const syariahAdjustment = isSyariah ? 0.9 : 1.0;

        return Math.min(baseLgd * collateralAdjustment * syariahAdjustment, 1.0);
    }

    private calculateBasicEad(account: any, method: string) {
        const outstanding = parseFloat(account.outstanding || '0');
        const committed = parseFloat(account.plafond || '0');
        const undrawn = Math.max(committed - outstanding, 0);

        const prdType = (account.prdType || '').toLowerCase();
        let ccf = 0.75;
        if (prdType.includes('credit card') || prdType.includes('revolving')) ccf = 0.75;
        else if (prdType.includes('line of credit')) ccf = 0.50;
        else if (prdType.includes('term loan') || prdType.includes('mortgage')) ccf = 0.00;

        return outstanding + (undrawn * ccf);
    }

    private classifyIfrs9Stage(account: any, pd12m: number) {
        const dpd = account.dpd || 0;
        const stage3 = dpd > 90 || account.accountStatus === 'default' || pd12m >= 1.0;

        if (stage3) return 3;

        const pdSignificantCount = pd12m > 0.10;
        const stage2 = dpd > 30 || pdSignificantCount;

        if (stage2) return 2;

        return 1;
    }
}
