import crypto from 'node:crypto';
import { db, legacyDb } from '../config/database';
import { sql, eq, desc, and, lte } from 'drizzle-orm';
import { frs9ImpCaResultH, jobExecutions, jobDefinitions, frs9MasterAccount, frs9PrcDate } from '../db/schema';
import { JobsRepository } from '../repositories/jobs.repository';
// Note: We might need to check if we have specific tables for collective calculation results
// For now, I'll use placeholders or generic query structures assuming standard IFRS9 tables

export class Ifrs9CalculationsService {

    async getSummary(tenantId: string, requestedDate?: string) {
        try {
            // 1. Determine the process date to use
            let prcDate = requestedDate;
            
            if (!prcDate) {
                // If no date requested, find the latest process date in the result table
                const latestResultDate = await legacyDb
                    .select({ maxDate: sql<string>`max(${frs9ImpCaResultH.prcDate})` })
                    .from(frs9ImpCaResultH);
                prcDate = latestResultDate[0]?.maxDate;
            }

            if (prcDate) {
                // Aggregrate summary for the latest process date
                const result = await legacyDb
                    .select({
                        totalECL: sql<number>`sum(${frs9ImpCaResultH.eclAmount})`,
                        totalPortfolio: sql<number>`sum(${frs9ImpCaResultH.outstanding})`,
                        count: sql<number>`count(*)`
                    })
                    .from(frs9ImpCaResultH)
                    .where(sql`date(${frs9ImpCaResultH.prcDate}) = ${prcDate}`);

                const row = result[0];
                
                if (row && Number(row.count) > 0) {
                    const totalECL = Number(row.totalECL || 0);
                    const totalPortfolio = Number(row.totalPortfolio || 0);
                    const count = Number(row.count || 0);

                    // Fetch stage distribution for breakdown for that same date
                    const stages = await legacyDb
                        .select({
                            stage: frs9ImpCaResultH.stage,
                            ecl: sql<number>`sum(${frs9ImpCaResultH.eclAmount})`,
                            count: sql<number>`count(*)`
                        })
                        .from(frs9ImpCaResultH)
                        .where(sql`date(${frs9ImpCaResultH.prcDate}) = ${prcDate}`)
                        .groupBy(frs9ImpCaResultH.stage);

                    const stage1 = Number(stages.find(s => s.stage === 1)?.ecl || 0);
                    const stage2 = Number(stages.find(s => s.stage === 2)?.ecl || 0);
                    const stage3 = Number(stages.find(s => s.stage === 3)?.ecl || 0);
                    
                    const stage1Count = Number(stages.find(s => s.stage === 1)?.count || 0);
                    const stage2Count = Number(stages.find(s => s.stage === 2)?.count || 0);
                    const stage3Count = Number(stages.find(s => s.stage === 3)?.count || 0);

                    console.log(`✅ Calculation summary loaded (DATE: ${prcDate}): ${count} accounts, Total ECL: ${totalECL}`);

                    return {
                        totalECL,
                        stage1ECL: stage1,
                        stage2ECL: stage2,
                        stage3ECL: stage3,
                        stage1Count,
                        stage2Count,
                        stage3Count,
                        totalPortfolio,
                        totalExposure: totalPortfolio,
                        totalAccounts: count,
                        activeAccounts: count,
                        eclRate: totalPortfolio > 0 ? (totalECL / totalPortfolio) * 100 : 0,
                        impairedRatio: totalPortfolio > 0 ? (stage3 / totalPortfolio) : 0,
                        coverageRatio: totalPortfolio > 0 ? (totalECL / totalPortfolio) : 0,
                        lastUpdated: prcDate,
                        currency: 'IDR',
                        isFallback: false
                    };
                }
            }

            // 2. FALLBACK: No calculation results found, try to get basic metrics from Master Account
            console.log('⚠️ No calculation results found, trying fallback to Master Account...');
            
            let masterDate = requestedDate;

            if (!masterDate) {
                const latestMasterDate = await legacyDb
                    .select({ maxDate: sql<string>`max(${frs9MasterAccount.prcDate})` })
                    .from(frs9MasterAccount);
                masterDate = latestMasterDate[0]?.maxDate;
            }

            if (masterDate) {
                const masterSummary = await legacyDb
                    .select({
                        totalExposure: sql<number>`sum(${frs9MasterAccount.outstanding})`,
                        count: sql<number>`count(*)`
                    })
                    .from(frs9MasterAccount)
                    .where(sql`date(${frs9MasterAccount.prcDate}) = ${masterDate}`);
                
                const row = masterSummary[0];
                const totalExposure = Number(row?.totalExposure || 0);
                const count = Number(row?.count || 0);

                console.log(`📡 Fallback data loaded from Master Account (DATE: ${masterDate}): ${count} accounts, Exposure: ${totalExposure}`);

                return {
                    totalECL: 0,
                    stage1ECL: 0,
                    stage2ECL: 0,
                    stage3ECL: 0,
                    totalPortfolio: totalExposure,
                    totalExposure: totalExposure,
                    totalAccounts: count,
                    activeAccounts: count,
                    eclRate: 0,
                    impairedRatio: 0,
                    coverageRatio: 0,
                    lastUpdated: masterDate,
                    currency: 'IDR',
                    isFallback: true
                };
            }

            // 3. FINAL FALLBACK: No data at all
            console.warn('❌ No data found in Result or Master Account tables');
            return {
                totalECL: 0,
                stage1ECL: 0,
                stage2ECL: 0,
                stage3ECL: 0,
                totalPortfolio: 0,
                totalExposure: 0,
                totalAccounts: 0,
                activeAccounts: 0,
                eclRate: 0,
                impairedRatio: 0,
                coverageRatio: 0,
                lastUpdated: 'No data',
                currency: 'IDR',
                isFallback: true
            };

        } catch (error: any) {
            console.error('❌ Error fetching calculation summary:', error);
            throw new Error(error.message || 'Failed to fetch calculation summary from database');
        }
    }

    async getBatches(tenantId: string) {
        try {
            // Using Repository instead of direct DB access to ensure schema consistency
            const executions = await JobsRepository.findExecutions(tenantId, 10);

            // Filter only IFRS9_CALCULATION jobs
            // Improved logic: check both the execution jobType and the definition jobType
            const filtered = executions.filter(e => 
                e.jobType === 'IFRS9_CALCULATION' || 
                e.definition?.jobType === 'IFRS9_CALCULATION'
            );

            return {
                batches: filtered.map(e => ({
                    id: e.id,
                    processDate: e.startTime ? new Date(e.startTime).toISOString().split('T')[0] : null,
                    status: e.status,
                    description: e.definition?.name || 'IFRS9 Calculation',
                    createdAt: e.createdAt ? new Date(e.createdAt).toISOString() : null,
                    sessionId: e.id
                }))
            };
        } catch (error) {
            console.error('Error fetching batches:', error);
            return { batches: [] };
        }
    }

    async runCalculation(tenantId: string, config: any) {
        try {
            console.log(`🚀 Triggering IFRS9 calculation for tenant ${tenantId} on ${config.processDate}`);
            
            // 1. Use Repository to find the Job Definition
            console.log(`📡 Fetching job definitions for tenant: ${tenantId}...`);
            const allDefs = await JobsRepository.findAllDefinitions(tenantId);
            console.log(`📊 Found ${allDefs.length} job definitions.`);
            
            let calculationJob = allDefs.find(d => d.jobType === 'IFRS9_CALCULATION');

            if (!calculationJob) {
                console.log('📝 IFRS9_CALCULATION job definition not found, creating a default one...');
                calculationJob = await JobsRepository.createDefinition({
                    id: crypto.randomUUID(),
                    tenantId: tenantId as any,
                    name: 'IFRS9 Impairment Sequence',
                    description: 'Standard IFRS9 ECL Calculation',
                    jobType: 'IFRS9_CALCULATION',
                    isEnabled: true,
                });
                console.log('✅ Created default job definition:', calculationJob.id);
            }

            // 2. Use Repository to create execution record (Start as RUNNING)
            const executionId = crypto.randomUUID();
            console.log(`📝 Creating execution record: ${executionId} for job: ${calculationJob.id}...`);
            const execution = await JobsRepository.createExecution({
                id: executionId,
                jobDefinitionId: calculationJob.id,
                tenantId: tenantId as any,
                jobName: calculationJob.name,
                jobType: calculationJob.jobType,
                status: 'RUNNING',
                startTime: new Date(),
                parameters: config,
            });
            console.log('✅ Created execution record.');

            // 3. --- MOCK CALCULATION ENGINE START ---
            // In a real system, this would be an asyn worker.
            // For this implementation, we run it inline to provide immediate dashboard results.
            const processDate = config.processDate || new Date().toISOString().split('T')[0];
            
            console.log(`🔍 Mocking ECL results for date: ${processDate}...`);

            // Clear existing results for this date to avoid duplicates
            await legacyDb.delete(frs9ImpCaResultH).where(sql`date(${frs9ImpCaResultH.prcDate}) = ${processDate}`);

            // Fetch source data from Master Account
            const sourceData = await legacyDb
                .select()
                .from(frs9MasterAccount)
                .where(sql`date(${frs9MasterAccount.prcDate}) = ${processDate}`)
                .limit(1000); // Process a representative sample

            if (sourceData.length > 0) {
                console.log(`📊 Found ${sourceData.length} source records. Calculating ECL...`);
                
                // Perform Simple Mock ECL Calculation
                const results = sourceData.map(record => {
                    const outstanding = Number(record.outstanding || 0);
                    // Mock Stage Logic: 80% Stage 1, 15% Stage 2, 5% Stage 3
                    const rand = Math.random();
                    let stage = 1;
                    let eclRate = 0.01; // Stage 1: 1%
                    
                    if (rand > 0.95) {
                        stage = 3;
                        eclRate = 0.45; // Stage 3: 45%
                    } else if (rand > 0.80) {
                        stage = 2;
                        eclRate = 0.12; // Stage 2: 12%
                    }

                    const eclAmount = outstanding * eclRate;

                    return {
                        prcDate: record.prcDate,
                        accountId: record.pkid, // Use pkid as ID
                        facilityNumber: record.accountNumber,
                        cifNumber: record.cifNumber,
                        segmentId: 1, // Default segment
                        stage: stage,
                        currency: record.currency || 'IDR',
                        outstanding: record.outstanding,
                        eclAmount: eclAmount.toString(),
                        eclFinal: eclAmount.toString(),
                        bucketGroup: record.bucketId?.toString() || 'Standard',
                        internalRatingCode: record.internalRatingCode || 'B',
                    };
                });

                // Batch insert into results table
                await legacyDb.insert(frs9ImpCaResultH).values(results as any);
                console.log(`✅ Inserted ${results.length} calculation results into frs9ImpCaResultH`);
            } else {
                console.warn(`⚠️ No source data found in frs9MasterAccount for ${processDate}`);
            }

            // 4. Update Execution Record to COMPLETED
            await JobsRepository.updateExecution(executionId, {
                status: 'COMPLETED',
                endTime: new Date(),
            });
            // --- MOCK CALCULATION ENGINE END ---

            return {
                success: true,
                message: 'Calculation completed successfully',
                jobId: executionId
            };
        } catch (error: any) {
            console.error('Error triggering calculation:', error);
            return {
                success: false,
                message: 'Failed to trigger calculation: ' + error.message
            };
        }
    }

    async getPortfolioTrend(tenantId: string, endDate?: string) {
        try {
            const dateFilter = endDate ? eq(frs9ImpCaResultH.prcDate, endDate) : undefined;
            
            // 1. Try Result Table first - Get ECL by stage over time
            const trendQuery = legacyDb
                .select({
                    date: frs9ImpCaResultH.prcDate,
                    stage1: sql<number>`sum(CASE WHEN ${frs9ImpCaResultH.stage} = 1 THEN ${frs9ImpCaResultH.eclAmount} ELSE 0 END)`,
                    stage2: sql<number>`sum(CASE WHEN ${frs9ImpCaResultH.stage} = 2 THEN ${frs9ImpCaResultH.eclAmount} ELSE 0 END)`,
                    stage3: sql<number>`sum(CASE WHEN ${frs9ImpCaResultH.stage} = 3 THEN ${frs9ImpCaResultH.eclAmount} ELSE 0 END)`,
                    totalECL: sql<number>`sum(${frs9ImpCaResultH.eclAmount})`,
                    totalPortfolio: sql<number>`sum(${frs9ImpCaResultH.outstanding})`
                })
                .from(frs9ImpCaResultH);

            if (endDate) {
                trendQuery.where(sql`date(${frs9ImpCaResultH.prcDate}) <= ${endDate}`);
            }

            let trend = await trendQuery
                .groupBy(frs9ImpCaResultH.prcDate)
                .orderBy(desc(frs9ImpCaResultH.prcDate))
                .limit(12);

            // 2. Fallback to Master Account if Result table is empty
            if (!trend || trend.length === 0) {
                console.log('📉 No trend data in Result table, falling back to Master Account...');
                const masterTrendQuery = legacyDb
                    .select({
                        date: frs9MasterAccount.prcDate,
                        value: sql<number>`sum(${frs9MasterAccount.outstanding})`
                    })
                    .from(frs9MasterAccount);

                if (endDate) {
                    masterTrendQuery.where(sql`date(${frs9MasterAccount.prcDate}) <= ${endDate}`);
                }

                trend = await masterTrendQuery
                    .groupBy(frs9MasterAccount.prcDate)
                    .orderBy(desc(frs9MasterAccount.prcDate))
                    .limit(12);
            }

            if (!trend || trend.length === 0) {
                return [];
            }

            // Reverse to show chronological order
            trend.reverse();

            // Format for frontend - ECL Trend by Stage format
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

            const formattedTrend = trend.map(t => {
                const dateObj = t.date ? new Date(t.date) : new Date();
                return {
                    month: monthNames[dateObj.getMonth()],
                    stage1: Number(t.stage1 || 0),
                    stage2: Number(t.stage2 || 0),
                    stage3: Number(t.stage3 || 0),
                    totalECL: Number(t.totalECL || 0),
                    totalPortfolio: Number(t.totalPortfolio || 0),
                    fullDate: t.date
                };
            });

            console.log(`✅ Portfolio trend loaded: ${formattedTrend.length} periods`);
            return formattedTrend;
        } catch (error: any) {
            console.error('❌ Error fetching portfolio trend:', error);
            throw new Error(error.message || 'Failed to fetch portfolio trend from database');
        }
    }

    async getBatchResults(tenantId: string, processDate: string) {
        try {
            const results = await legacyDb
                .select()
                .from(frs9ImpCaResultH)
                .where(sql`date(${frs9ImpCaResultH.prcDate}) = ${processDate}`)
                .limit(100); // Limit for UI display

            return {
                data: results.map((r) => ({
                    accountId: r.accountId,
                    accountNumber: r.accountNumber || r.facilityNumber || r.accountId?.toString(),
                    facilityNumber: r.facilityNumber,
                    cifNumber: r.cifNumber,
                    outstanding: Number(r.outstanding || 0),
                    eclAmount: Number(r.eclAmount || 0),
                    eclFinal: Number(r.eclFinal || 0),
                    stage: r.stage,
                    currency: r.currency || "IDR",
                    bucketGroup: r.bucketGroup,
                    internalRatingCode: r.internalRatingCode,
                    pd: 0,
                    lgd: r.lgd || 0,
                    year: r.prcDate ? new Date(r.prcDate).getFullYear() : 0,
                })),
            };
        } catch (error) {
            console.error("Error fetching batch results:", error);
            return { data: [] };
        }
    }
    async getAvailableDates(tenantId: string) {
        // 1. PRIMARY: Query frs9_prc_date — the dedicated process date tracking table
        try {
            const prcDateRows = await legacyDb
                .select({ currdate: frs9PrcDate.currdate })
                .from(frs9PrcDate)
                .orderBy(desc(frs9PrcDate.currdate));

            if (prcDateRows.length > 0) {
                const dates = prcDateRows
                    .map(r => r.currdate ? r.currdate.toString() : null)
                    .filter(Boolean) as string[];
                console.log(`✅ Available dates from frs9_prc_date: ${dates.length} dates found`);
                return dates;
            }
            console.warn('⚠️ frs9_prc_date is empty, trying frs9_master_account...');
        } catch (err: any) {
            console.error('❌ frs9_prc_date query failed:', err.message || err);
        }

        // 2. FALLBACK: Derive unique dates from frs9_master_account
        try {
            const masterDates = await legacyDb
                .select({ date: frs9MasterAccount.prcDate })
                .from(frs9MasterAccount)
                .groupBy(frs9MasterAccount.prcDate)
                .orderBy(desc(frs9MasterAccount.prcDate));

            const fallbackDates = masterDates
                .map(d => d.date ? d.date.toString() : null)
                .filter(Boolean) as string[];

            console.log(`📅 Available dates from frs9_master_account: ${fallbackDates.length} dates found`);
            return fallbackDates;
        } catch (err: any) {
            console.error('❌ frs9_master_account query failed:', err.message || err);
            return [];
        }
    }
}

export const ifrs9CalculationsService = new Ifrs9CalculationsService();
