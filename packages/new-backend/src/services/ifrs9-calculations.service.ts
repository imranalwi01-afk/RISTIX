import { db, legacyDb } from '../config/database';
import { sql, eq, desc, and } from 'drizzle-orm';
import { frs9ImpCaResultH, jobExecutions, jobDefinitions } from '../db/schema';
import { JobsRepository } from '../repositories/jobs.repository';
// Note: We might need to check if we have specific tables for collective calculation results
// For now, I'll use placeholders or generic query structures assuming standard IFRS9 tables

export class Ifrs9CalculationsService {

    async getSummary(tenantId: string) {
        try {
            // Aggregate from latest result
            const result = await legacyDb
                .select({
                    totalECL: sql<number>`sum(${frs9ImpCaResultH.eclAmount})`,
                    totalPortfolio: sql<number>`sum(${frs9ImpCaResultH.outstanding})`,
                    count: sql<number>`count(*)`
                })
                .from(frs9ImpCaResultH);

            const row = result[0];
            
            // ✅ DATA VALIDATION: Check if we have any results
            if (!result || result.length === 0 || !row || row.count === 0) {
                console.warn('⚠️ No calculation results found in database');
                throw new Error('No calculation results available. Please run ECL calculation first.');
            }

            const totalECL = Number(row.totalECL || 0);
            const totalPortfolio = Number(row.totalPortfolio || 0);
            const count = Number(row.count || 0);

            // Fetch stage distribution for breakdown
            const stages = await legacyDb
                .select({
                    stage: frs9ImpCaResultH.stage,
                    ecl: sql<number>`sum(${frs9ImpCaResultH.eclAmount})`
                })
                .from(frs9ImpCaResultH)
                .groupBy(frs9ImpCaResultH.stage);

            const stage1 = Number(stages.find(s => s.stage === 1)?.ecl || 0);
            const stage2 = Number(stages.find(s => s.stage === 2)?.ecl || 0);
            const stage3 = Number(stages.find(s => s.stage === 3)?.ecl || 0);

            console.log(`✅ Calculation summary loaded: ${count} accounts, Total ECL: ${totalECL}`);

            return {
                totalECL,
                stage1ECL: stage1,
                stage2ECL: stage2,
                stage3ECL: stage3,
                totalPortfolio,
                totalExposure: totalPortfolio,
                totalAccounts: count,
                activeAccounts: count,
                eclRate: totalPortfolio > 0 ? (totalECL / totalPortfolio) * 100 : 0,
                impairedRatio: totalPortfolio > 0 ? (stage3 / totalPortfolio) : 0,
                coverageRatio: totalPortfolio > 0 ? (totalECL / totalPortfolio) : 0,
                lastUpdated: new Date().toISOString(),
                currency: 'IDR'
            };
        } catch (error: any) {
            console.error('❌ Error fetching calculation summary:', error);
            // Re-throw the error with context for better debugging
            throw new Error(error.message || 'Failed to fetch calculation summary from database');
        }
    }

    async getBatches(tenantId: string) {
        try {
            // Using Repository instead of direct DB access to ensure schema consistency
            const executions = await JobsRepository.findExecutions(tenantId, 10);

            // Filter only IFRS9_CALCULATION jobs
            // Note: JobsRepository has relations (definition). 
            // Drizzle Relational API returns simplified objects.
            const filtered = executions.filter(e => e.definition?.type === 'IFRS9_CALCULATION');

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
            // 1. Use Repository to find the Job Definition
            // We search for type IFRS9_CALCULATION
            const allDefs = await JobsRepository.findAllDefinitions(tenantId);
            const calculationJob = allDefs.find(d => d.type === 'IFRS9_CALCULATION');

            if (!calculationJob) {
                console.warn('No Job Definition found for IFRS9_CALCULATION.');
                throw new Error('Calculation Job not configured.');
            }

            // 2. Use Repository to create execution record
            const execution = await JobsRepository.createExecution({
                jobId: calculationJob.id,
                tenantId: tenantId as any,
                status: 'PENDING',
                triggerType: 'MANUAL',
                startTime: new Date(),
            });

            return {
                success: true,
                message: 'Calculation queued successfully',
                jobId: execution.id
            };
        } catch (error: any) {
            console.error('Error triggering calculation:', error);
            // LOG MORE CONTEXT
            if (error.sql) {
                console.error('SQL that failed:', error.sql);
            }
            return {
                success: false,
                message: 'Failed to trigger calculation: ' + error.message
            };
        }
    }

    async getPortfolioTrend(tenantId: string) {
        try {
            // Fetch historical totals grouped by process date
            const trend = await legacyDb
                .select({
                    date: frs9ImpCaResultH.prcDate,
                    value: sql<number>`sum(${frs9ImpCaResultH.outstanding})`
                })
                .from(frs9ImpCaResultH)
                .groupBy(frs9ImpCaResultH.prcDate)
                .orderBy(frs9ImpCaResultH.prcDate)
                .limit(12); // Last 12 periods

            // ✅ DATA VALIDATION: Return empty array if no data (not an error)
            if (!trend || trend.length === 0) {
                console.warn('⚠️ No portfolio trend data found');
                return [];
            }

            // Format for frontend (Month names or partial dates)
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

            const formattedTrend = trend.map(t => {
                const dateObj = t.date ? new Date(t.date) : new Date();
                return {
                    name: monthNames[dateObj.getMonth()],
                    value: Number(t.value || 0),
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
                .where(eq(frs9ImpCaResultH.prcDate, processDate))
                .limit(100); // Limit for UI display

            return {
                data: results.map((r) => ({
                    accountId: r.accountId,
                    accountNumber: r.accountNumber || r.accountId?.toString(),
                    outstanding: Number(r.outstanding || 0),
                    eclAmount: Number(r.eclAmount || 0),
                    stage: r.stage,
                    pd: 0,
                    lgd: 0,
                    year: r.prcDate ? new Date(r.prcDate).getFullYear() : 0,
                })),
            };
        } catch (error) {
            console.error("Error fetching batch results:", error);
            return { data: [] };
        }
    }
}

export const ifrs9CalculationsService = new Ifrs9CalculationsService();
