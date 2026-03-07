import crypto from 'node:crypto';
import { getDatabase, legacyDb } from '../config/database';
import { sql, eq, desc, and, inArray } from 'drizzle-orm';
import { frs9ImpCaResultH, jobExecutions, frs9MasterAccount, frs9PrcDate, frs9ImpCaEclConfigh, frs9ParamSegmenth } from '../db/schema';
import { JobsRepository } from '../repositories/jobs.repository';
import { addJob } from './queue.service';

export class Ifrs9CalculationsService {
    private static readonly IFRS9_PREVIEW_SP_NAME = 'sp_frs9_preview_sequence';
    private static readonly IFRS9_IMPAIRMENT_SP_NAME = 'sp_frs9_imp_sequence';
    private static readonly IFRS9_PREVIEW_SQL_SP_JOB_NAME = 'IFRS9 Preview Sequence';
    private static readonly IFRS9_IMPAIRMENT_SQL_SP_JOB_NAME = 'IFRS9 Impairment Sequence';

    private normalizeProcedureName(value: unknown): string {
        return String(value || '').trim().toLowerCase();
    }

    private isIfrs9PreviewSqlSpParameters(parameters: any): boolean {
        const procedureName = this.normalizeProcedureName(parameters?.procedureName);
        return (
            procedureName === Ifrs9CalculationsService.IFRS9_PREVIEW_SP_NAME
            || procedureName.endsWith(`.${Ifrs9CalculationsService.IFRS9_PREVIEW_SP_NAME}`)
        );
    }

    private isIfrs9ImpairmentSqlSpParameters(parameters: any): boolean {
        const procedureName = this.normalizeProcedureName(parameters?.procedureName);
        return (
            procedureName === Ifrs9CalculationsService.IFRS9_IMPAIRMENT_SP_NAME
            || procedureName.endsWith(`.${Ifrs9CalculationsService.IFRS9_IMPAIRMENT_SP_NAME}`)
        );
    }

    private isIfrs9CalculationExecution(execution: any): boolean {
        const executionJobType = String(execution?.jobType || '').toUpperCase();
        if (executionJobType === 'IFRS9_CALCULATION') return true;

        if (executionJobType === 'SQL_SP') {
            if (this.isIfrs9PreviewSqlSpParameters(execution?.parameters)) return true;
            if (this.isIfrs9PreviewSqlSpParameters(execution?.defaultParameters)) return true;
            if (this.isIfrs9PreviewSqlSpParameters(execution?.definition?.defaultParameters)) return true;
            if (this.isIfrs9ImpairmentSqlSpParameters(execution?.parameters)) return true;
            if (this.isIfrs9ImpairmentSqlSpParameters(execution?.defaultParameters)) return true;
            if (this.isIfrs9ImpairmentSqlSpParameters(execution?.definition?.defaultParameters)) return true;
        }

        return false;
    }

    private buildIfrs9PreviewSqlSpDefaultParameters() {
        return {
            schemaName: 'public',
            procedureName: Ifrs9CalculationsService.IFRS9_PREVIEW_SP_NAME,
            targetDatabase: 'LEGACY',
            parameters: [] as any[],
        };
    }

    private buildIfrs9ImpairmentSqlSpDefaultParameters() {
        return {
            schemaName: 'public',
            procedureName: Ifrs9CalculationsService.IFRS9_IMPAIRMENT_SP_NAME,
            targetDatabase: 'LEGACY',
            parameters: [] as any[],
        };
    }

    private async syncLegacyProcessDate(processDate: string): Promise<void> {
        const normalizedDate = String(processDate || '').trim();
        if (!normalizedDate) return;

        const [existingPrcDate] = await legacyDb
            .select({ pkid: frs9PrcDate.pkid })
            .from(frs9PrcDate)
            .limit(1);

        if (!existingPrcDate) {
            console.warn('⚠️ frs9_prc_date is empty; IFRS9 process date could not be synchronized');
            return;
        }

        await legacyDb
            .update(frs9PrcDate)
            .set({
                currdate: normalizedDate as any,
                updateddate: new Date().toISOString(),
                updatedby: 'system',
                updatedhost: 'new-backend',
                remark: 'IFRS9 Impairment Sequence - queued',
            })
            .where(eq(frs9PrcDate.pkid, existingPrcDate.pkid));
    }

    private async resolveConfigHeader(config: any): Promise<string> {
        const explicitConfigHeader = String(
            config?.configHeader
            || config?.eclModelName
            || config?.modelName
            || ''
        ).trim();

        if (explicitConfigHeader) {
            return explicitConfigHeader;
        }

        const [activeConfig] = await legacyDb
            .select({
                eclModelName: frs9ImpCaEclConfigh.eclModelName,
            })
            .from(frs9ImpCaEclConfigh)
            .where(eq(frs9ImpCaEclConfigh.activeFlag, true))
            .orderBy(
                desc(frs9ImpCaEclConfigh.effectiveDate),
                desc(frs9ImpCaEclConfigh.updateddate),
                desc(frs9ImpCaEclConfigh.pkid),
            )
            .limit(1);

        const fallbackConfigHeader = String(activeConfig?.eclModelName || '').trim();
        if (fallbackConfigHeader) {
            return fallbackConfigHeader;
        }

        throw new Error(
            'No active ECL model found to run SP_FRS9_PREVIEW_SEQUENCE. Please activate ECL configuration first.'
        );
    }

    private async getSegmentIdsForMode(mode: string): Promise<number[]> {
        if (!mode || mode === 'all') return [];
        try {
            // Filter segments by segmentType (e.g., 'Conventional', 'Syariah')
            const segments = await legacyDb
                .select({ id: frs9ParamSegmenth.pkid })
                .from(frs9ParamSegmenth)
                .where(sql`lower(${frs9ParamSegmenth.segmentType}) = ${mode.toLowerCase()}`);
            
            return segments.map(s => s.id);
        } catch (e) {
            console.warn('⚠️ Failed to resolve segments for mode:', mode, e);
            return [];
        }
    }

    async getSummary(tenantId: string, requestedDate?: string, mode?: string) {
        try {
            // Resolve segment IDs if mode is provided
            const segmentIds = mode ? await this.getSegmentIdsForMode(mode) : [];
            const hasSegmentFilter = segmentIds.length > 0;

            // 1. Determine the process date to use
            let prcDate = requestedDate;

            if (!prcDate) {
                // If no date requested, find the latest process date in the result table
                // If filtered, we should only look at dates relevant to that segment, but usually max date is global.
                const latestResultDate = await legacyDb
                    .select({ maxDate: sql<string>`max(${frs9ImpCaResultH.prcDate})` })
                    .from(frs9ImpCaResultH);
                prcDate = latestResultDate[0]?.maxDate;
            }

            if (requestedDate === 'all') {
                console.log(`📊 Calculating Grand Total (All Periods)${mode ? ' [Mode: ' + mode + ']' : ''}...`);
                
                let query = legacyDb
                    .select({
                        totalECL: sql<string>`cast(sum(${frs9ImpCaResultH.eclAmount}) as text)`,
                        totalPortfolio: sql<string>`cast(sum(${frs9ImpCaResultH.outstanding}) as text)`,
                        count: sql<string>`cast(count(*) as text)`
                    })
                    .from(frs9ImpCaResultH);
                
                if (hasSegmentFilter) {
                    query.where(inArray(frs9ImpCaResultH.segmentId, segmentIds));
                }

                const result = await query;

                const row = result[0];
                if (row && Number(row.count) > 0) {
                    const totalECL = parseFloat(row.totalECL || '0');
                    const totalPortfolio = parseFloat(row.totalPortfolio || '0');
                    const count = parseInt(row.count || '0', 10);

                    let stageQuery = legacyDb
                        .select({
                            stage: frs9ImpCaResultH.stage,
                            ecl: sql<string>`cast(sum(${frs9ImpCaResultH.eclAmount}) as text)`,
                            count: sql<string>`cast(count(*) as text)`
                        })
                        .from(frs9ImpCaResultH);
                    
                    if (hasSegmentFilter) {
                        stageQuery.where(inArray(frs9ImpCaResultH.segmentId, segmentIds));
                    }
                        
                    const stages = await stageQuery.groupBy(frs9ImpCaResultH.stage);

                    const findStage = (sNum: number) => stages.find(s => Number(s.stage) === sNum);

                    const stage1 = parseFloat(findStage(1)?.ecl || '0');
                    const stage2 = parseFloat(findStage(2)?.ecl || '0');
                    const stage3 = parseFloat(findStage(3)?.ecl || '0');

                    const stage1Count = parseInt(findStage(1)?.count || '0', 10);
                    const stage2Count = parseInt(findStage(2)?.count || '0', 10);
                    const stage3Count = parseInt(findStage(3)?.count || '0', 10);

                    console.log(`✅ Grand Total Summary loaded: ${count} total system records`);

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
                        lastUpdated: 'Cumulative Grand Total (All Periods)',
                        currency: 'IDR',
                        isFallback: false
                    };
                }
            } else if (prcDate) {
                // Aggregrate summary for the latest process date
                let query = legacyDb
                    .select({
                        totalECL: sql<number>`sum(${frs9ImpCaResultH.eclAmount})`,
                        totalPortfolio: sql<number>`sum(${frs9ImpCaResultH.outstanding})`,
                        count: sql<number>`count(*)`
                    })
                    .from(frs9ImpCaResultH);
                
                const conditions = [sql`date(${frs9ImpCaResultH.prcDate}) = ${prcDate}`];
                if (hasSegmentFilter) {
                    conditions.push(inArray(frs9ImpCaResultH.segmentId, segmentIds));
                }
                
                const result = await query.where(and(...conditions));

                const row = result[0];

                if (row && Number(row.count) > 0) {
                    const totalECL = Number(row.totalECL || 0);
                    const totalPortfolio = Number(row.totalPortfolio || 0);
                    const count = Number(row.count || 0);

                    // Fetch stage distribution for breakdown for that same date
                    let stageQuery = legacyDb
                        .select({
                            stage: frs9ImpCaResultH.stage,
                            ecl: sql<number>`sum(${frs9ImpCaResultH.eclAmount})`,
                            count: sql<number>`count(*)`
                        })
                        .from(frs9ImpCaResultH);
                    
                    const stageConditions = [sql`date(${frs9ImpCaResultH.prcDate}) = ${prcDate}`];
                    if (hasSegmentFilter) {
                        stageConditions.push(inArray(frs9ImpCaResultH.segmentId, segmentIds));
                    }

                    const stages = await stageQuery
                        .where(and(...stageConditions))
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
                let masterQuery = legacyDb
                    .select({
                        totalExposure: sql<number>`sum(${frs9MasterAccount.outstanding})`,
                        count: sql<number>`count(*)`
                    })
                    .from(frs9MasterAccount);
                
                const masterConditions = [sql`date(${frs9MasterAccount.prcDate}) = ${masterDate}`];
                if (hasSegmentFilter) {
                    masterConditions.push(inArray(frs9MasterAccount.segmentId, segmentIds));
                }

                const masterSummary = await masterQuery.where(and(...masterConditions));

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

    async getBatches(tenantId: string, mode?: string) {
        try {
            // Using Repository instead of direct DB access to ensure schema consistency
            const executions = await JobsRepository.findExecutions(tenantId, 10);

            // Include legacy IFRS9_CALCULATION jobs and the new SQL_SP preview-sequence jobs.
            const filtered = executions.filter((e: any) => this.isIfrs9CalculationExecution(e));

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

    async runPreviewCalculation(tenantId: string, config: any) {
        try {
            const processDate = config.processDate || new Date().toISOString().split('T')[0];
            console.log(`🚀 Queueing IFRS9 preview calculation (SP) for tenant ${tenantId} on ${processDate}`);

            // 1. Resolve ECL model header for SP argument.
            const configHeader = await this.resolveConfigHeader(config);

            // 2. Resolve or create SQL_SP definition bound to SP_FRS9_PREVIEW_SEQUENCE.
            const allDefs = await JobsRepository.findAllDefinitions(tenantId);
            let calculationJob = allDefs.find((definition: any) => (
                String(definition.jobType || '').toUpperCase() === 'SQL_SP'
                && this.isIfrs9PreviewSqlSpParameters(definition.defaultParameters)
            ));

            if (!calculationJob) {
                const legacyDefinition = allDefs.find((definition: any) => (
                    String(definition.jobType || '').toUpperCase() === 'IFRS9_CALCULATION'
                ));

                if (legacyDefinition) {
                    calculationJob = await JobsRepository.updateDefinition(
                        legacyDefinition.id,
                        {
                            name: Ifrs9CalculationsService.IFRS9_PREVIEW_SQL_SP_JOB_NAME,
                            description: 'IFRS9 calculation execution using SP_FRS9_PREVIEW_SEQUENCE',
                            jobType: 'SQL_SP',
                            isEnabled: true,
                            defaultParameters: this.buildIfrs9PreviewSqlSpDefaultParameters(),
                            priority: 'HIGH',
                            timeout: 3600,
                            maxRetries: 0,
                        } as any,
                        tenantId,
                    );
                } else {
                    calculationJob = await JobsRepository.createDefinition({
                        id: crypto.randomUUID(),
                        tenantId: tenantId as any,
                        name: Ifrs9CalculationsService.IFRS9_PREVIEW_SQL_SP_JOB_NAME,
                        description: 'IFRS9 calculation execution using SP_FRS9_PREVIEW_SEQUENCE',
                        jobType: 'SQL_SP',
                        isEnabled: true,
                        defaultParameters: this.buildIfrs9PreviewSqlSpDefaultParameters(),
                        priority: 'HIGH',
                        timeout: 3600,
                        maxRetries: 0,
                    } as any);
                }
            }

            if (!calculationJob?.id) {
                throw new Error('Unable to resolve IFRS9 SQL_SP job definition');
            }

            const targetDb = getDatabase(tenantId);
            const [activeExecution] = await targetDb
                .select({
                    id: jobExecutions.id,
                    startTime: jobExecutions.startTime,
                })
                .from(jobExecutions)
                .where(and(
                    eq(jobExecutions.jobDefinitionId, calculationJob.id),
                    sql`${jobExecutions.endTime} is null and lower(${jobExecutions.status}) in ('pending', 'waiting', 'queued', 'active', 'running', 'pending_approval')`,
                ))
                .orderBy(desc(jobExecutions.startTime))
                .limit(1);

            if (activeExecution) {
                return {
                    success: false,
                    status: 'CONFLICT',
                    message: 'IFRS9 calculation is already running or queued.',
                    activeExecutionId: activeExecution.id,
                    startTime: activeExecution.startTime ? new Date(activeExecution.startTime).toISOString() : null,
                };
            }

            const previewData = config.previewData ?? {
                segmentIds: config.segmentIds ?? [],
                calculationType: config.calculationType ?? null,
                recalculate: Boolean(config.recalculate),
                scenarios: config.scenarios ?? [],
            };

            const executionParameters = {
                ...(calculationJob.defaultParameters || this.buildIfrs9PreviewSqlSpDefaultParameters()),
                parameters: [configHeader, previewData, processDate],
                processDate,
                configHeader,
                source: 'ifrs9-calculations',
                executionMode: 'preview',
            };

            // 3. Create execution row before queueing to avoid race with worker events.
            const executionId = crypto.randomUUID();
            await JobsRepository.createExecution({
                id: executionId,
                jobDefinitionId: calculationJob.id,
                tenantId: tenantId as any,
                jobName: calculationJob.name || Ifrs9CalculationsService.IFRS9_PREVIEW_SQL_SP_JOB_NAME,
                jobType: 'SQL_SP',
                status: 'pending',
                progress: 0,
                parameters: executionParameters as any,
                startTime: new Date(),
                approvalStatus: 'not_required',
            } as any);

            // 4. Enqueue into Bull; worker executes SQL_SP via JobExecutorService.
            try {
                await addJob('SQL_SP', {
                    definitionId: calculationJob.id,
                    tenantId,
                    parameters: executionParameters,
                }, {
                    jobId: executionId,
                    priority: calculationJob.priority === 'CRITICAL' ? 0 : calculationJob.priority === 'HIGH' ? 1 : 5,
                    attempts: (calculationJob.maxRetries || 0) + 1,
                    timeout: (calculationJob.timeout || 3600) * 1000,
                });
            } catch (queueError: any) {
                const queueErrorMessage = queueError?.message || 'Failed to enqueue job';
                await JobsRepository.updateExecution(executionId, {
                    status: 'failed',
                    error: `Queue enqueue failed: ${queueErrorMessage}`,
                    endTime: new Date(),
                } as any, tenantId);

                return {
                    success: false,
                    status: 'FAILED',
                    message: `Queue enqueue failed: ${queueErrorMessage}`,
                    jobId: executionId,
                    executionId,
                };
            }

            return {
                success: true,
                status: 'QUEUED',
                message: 'Preview calculation queued using SP_FRS9_PREVIEW_SEQUENCE',
                jobId: executionId,
                executionId,
                processDate,
                configHeader,
            };
        } catch (error: any) {
            console.error('Error triggering calculation:', error);
            return {
                success: false,
                message: 'Failed to trigger calculation: ' + error.message
            };
        }
    }

    async runCalculation(tenantId: string, config: any) {
        try {
            const processDate = config.processDate || new Date().toISOString().split('T')[0];
            console.log(`🚀 Queueing IFRS9 impairment calculation (SP) for tenant ${tenantId} on ${processDate}`);

            // 1. Keep legacy process date synchronized before running full impairment sequence.
            await this.syncLegacyProcessDate(processDate);

            // 2. Resolve or create SQL_SP definition bound to SP_FRS9_IMP_SEQUENCE.
            const allDefs = await JobsRepository.findAllDefinitions(tenantId);
            let calculationJob = allDefs.find((definition: any) => (
                String(definition.jobType || '').toUpperCase() === 'SQL_SP'
                && this.isIfrs9ImpairmentSqlSpParameters(definition.defaultParameters)
            ));

            if (!calculationJob) {
                calculationJob = await JobsRepository.createDefinition({
                    id: crypto.randomUUID(),
                    tenantId: tenantId as any,
                    name: Ifrs9CalculationsService.IFRS9_IMPAIRMENT_SQL_SP_JOB_NAME,
                    description: 'IFRS9 calculation execution using SP_FRS9_IMP_SEQUENCE',
                    jobType: 'SQL_SP',
                    isEnabled: true,
                    defaultParameters: this.buildIfrs9ImpairmentSqlSpDefaultParameters(),
                    priority: 'HIGH',
                    timeout: 3600,
                    maxRetries: 0,
                } as any);
            }

            if (!calculationJob?.id) {
                throw new Error('Unable to resolve IFRS9 SQL_SP impairment job definition');
            }

            const targetDb = getDatabase(tenantId);
            const [activeExecution] = await targetDb
                .select({
                    id: jobExecutions.id,
                    startTime: jobExecutions.startTime,
                })
                .from(jobExecutions)
                .where(and(
                    eq(jobExecutions.jobDefinitionId, calculationJob.id),
                    sql`${jobExecutions.endTime} is null and lower(${jobExecutions.status}) in ('pending', 'waiting', 'queued', 'active', 'running', 'pending_approval')`,
                ))
                .orderBy(desc(jobExecutions.startTime))
                .limit(1);

            if (activeExecution) {
                return {
                    success: false,
                    status: 'CONFLICT',
                    message: 'IFRS9 impairment calculation is already running or queued.',
                    activeExecutionId: activeExecution.id,
                    startTime: activeExecution.startTime ? new Date(activeExecution.startTime).toISOString() : null,
                };
            }

            const executionParameters = {
                ...(calculationJob.defaultParameters || this.buildIfrs9ImpairmentSqlSpDefaultParameters()),
                parameters: [] as any[],
                processDate,
                calculationType: config.calculationType ?? 'full',
                recalculate: Boolean(config.recalculate),
                scenarios: config.scenarios ?? [],
                source: 'ifrs9-calculations',
                executionMode: 'impairment',
            };

            const executionId = crypto.randomUUID();
            await JobsRepository.createExecution({
                id: executionId,
                jobDefinitionId: calculationJob.id,
                tenantId: tenantId as any,
                jobName: calculationJob.name || Ifrs9CalculationsService.IFRS9_IMPAIRMENT_SQL_SP_JOB_NAME,
                jobType: 'SQL_SP',
                status: 'pending',
                progress: 0,
                parameters: executionParameters as any,
                startTime: new Date(),
                approvalStatus: 'not_required',
            } as any);

            try {
                await addJob('SQL_SP', {
                    definitionId: calculationJob.id,
                    tenantId,
                    parameters: executionParameters,
                }, {
                    jobId: executionId,
                    priority: calculationJob.priority === 'CRITICAL' ? 0 : calculationJob.priority === 'HIGH' ? 1 : 5,
                    attempts: (calculationJob.maxRetries || 0) + 1,
                    timeout: (calculationJob.timeout || 3600) * 1000,
                });
            } catch (queueError: any) {
                const queueErrorMessage = queueError?.message || 'Failed to enqueue job';
                await JobsRepository.updateExecution(executionId, {
                    status: 'failed',
                    error: `Queue enqueue failed: ${queueErrorMessage}`,
                    endTime: new Date(),
                } as any, tenantId);

                return {
                    success: false,
                    status: 'FAILED',
                    message: `Queue enqueue failed: ${queueErrorMessage}`,
                    jobId: executionId,
                    executionId,
                };
            }

            return {
                success: true,
                status: 'QUEUED',
                message: 'Calculation queued using SP_FRS9_IMP_SEQUENCE',
                jobId: executionId,
                executionId,
                processDate,
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
            const segmentIds = mode ? await this.getSegmentIdsForMode(mode) : [];
            const hasSegmentFilter = segmentIds.length > 0;

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

            const conditions = [];
            if (endDate && endDate !== 'all') {
                conditions.push(sql`date(${frs9ImpCaResultH.prcDate}) <= ${endDate}`);
            }
            if (hasSegmentFilter) {
                conditions.push(inArray(frs9ImpCaResultH.segmentId, segmentIds));
            }
            
            if (conditions.length > 0) {
                trendQuery.where(and(...conditions));
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

                const masterConditions = [];
                if (endDate && endDate !== 'all') {
                    masterConditions.push(sql`date(${frs9MasterAccount.prcDate}) <= ${endDate}`);
                }
                if (hasSegmentFilter) {
                    masterConditions.push(inArray(frs9MasterAccount.segmentId, segmentIds));
                }

                if (masterConditions.length > 0) {
                    masterTrendQuery.where(and(...masterConditions));
                }

                trend = (await masterTrendQuery
                    .groupBy(frs9MasterAccount.prcDate)
                    .orderBy(desc(frs9MasterAccount.prcDate))
                    .limit(12)).map(t => ({
                        date: t.date,
                        stage1: 0,
                        stage2: 0,
                        stage3: 0,
                        totalECL: 0,
                        totalPortfolio: Number(t.value || 0)
                    })) as any;
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

    async getBatchResults(tenantId: string, processDate: string, mode?: string) {
        try {
            const segmentIds = mode ? await this.getSegmentIdsForMode(mode) : [];
            const hasSegmentFilter = segmentIds.length > 0;
            
            const conditions = [sql`date(${frs9ImpCaResultH.prcDate}) = ${processDate}`];
            if (hasSegmentFilter) {
                conditions.push(inArray(frs9ImpCaResultH.segmentId, segmentIds));
            }

            const results = await legacyDb
                .select()
                .from(frs9ImpCaResultH)
                .where(and(...conditions))
                .limit(100); // Limit for UI display

            return {
                data: results.map((r) => ({
                    accountId: r.accountId,
                    accountNumber: r.facilityNumber || r.accountId?.toString(),
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
    async getAvailableDates(tenantId: string, mode?: string) {
        try {
            console.log(`📅 Fetching available process dates from all sources [Mode: ${mode || 'all'}]...`);
            
            const segmentIds = mode ? await this.getSegmentIdsForMode(mode) : [];
            const hasSegmentFilter = segmentIds.length > 0;

            // Run queries in parallel for better performance and complete coverage
            
            // 2. frs9_master_account (Source Data)
            let masterQuery = legacyDb
                .select({ date: frs9MasterAccount.prcDate })
                .from(frs9MasterAccount);
            
            if (hasSegmentFilter) {
                masterQuery.where(inArray(frs9MasterAccount.segmentId, segmentIds));
            }
            
            // 3. frs9_imp_ca_result_h (Calculation Results)
            let resultQuery = legacyDb
                .select({ date: frs9ImpCaResultH.prcDate })
                .from(frs9ImpCaResultH);
                
            if (hasSegmentFilter) {
                resultQuery.where(inArray(frs9ImpCaResultH.segmentId, segmentIds));
            }

            const [prcDateRows, masterDateRows, resultDateRows] = await Promise.all([
                // 1. frs9_prc_date (System Process Dates) - Global
                legacyDb
                    .select({ currdate: frs9PrcDate.currdate })
                    .from(frs9PrcDate)
                    .orderBy(desc(frs9PrcDate.currdate)),
                
                masterQuery.groupBy(frs9MasterAccount.prcDate),
                resultQuery.groupBy(frs9ImpCaResultH.prcDate)
            ]);

            // Collect all unique dates
            const allDates = new Set<string>();

            // Process frs9_prc_date
            prcDateRows.forEach(r => {
                if (r.currdate) allDates.add(r.currdate.toString());
            });

            // Process frs9_master_account
            masterDateRows.forEach(r => {
                if (r.date) allDates.add(r.date.toString());
            });

            // Process frs9_imp_ca_result_h
            resultDateRows.forEach(r => {
                if (r.date) allDates.add(r.date.toString());
            });

            // Convert to array and sort descending (newest first)
            const sortedDates = Array.from(allDates).sort((a, b) => {
                return new Date(b).getTime() - new Date(a).getTime();
            });

            console.log(`✅ Consolidated available dates: ${sortedDates.length} unique dates found across all tables`);
            return sortedDates;

        } catch (err: any) {
            console.error('❌ Error fetching available dates:', err.message || err);
            // Return empty array instead of throwing to prevent UI crash
            return [];
        }
    }
}

export const ifrs9CalculationsService = new Ifrs9CalculationsService();
