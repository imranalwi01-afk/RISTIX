import crypto from 'node:crypto';
import { db, getDatabase, legacyDb } from '../config/database';
import { sql, eq, desc, and, inArray } from 'drizzle-orm';
import { frs9ImpCaResultH, jobExecutions, frs9MasterAccount, frs9PrcDate, frs9ImpCaEclConfigh, frs9ParamSegmenth, frs9EclSummary } from '../db/schema';
import { JobsRepository } from '../repositories/jobs.repository';
import { addJob } from './queue.service';

type DashboardQueryDebug = {
    endpoint: string;
    sourceTables: string[];
    selectedSource: string;
    filtersApplied: Record<string, unknown>;
    sqlPreview: string;
    notes?: string[];
};

type DashboardSummaryResult = {
    totalECL: number;
    stage1ECL: number;
    stage2ECL: number;
    stage3ECL: number;
    stage1Count?: number;
    stage2Count?: number;
    stage3Count?: number;
    totalPortfolio: number;
    totalExposure: number;
    totalAccounts: number;
    activeAccounts: number;
    eclRate: number;
    impairedRatio: number;
    coverageRatio: number;
    lastUpdated: string;
    currency: string;
    isFallback: boolean;
};

type DashboardSummaryPayload = {
    data: DashboardSummaryResult;
    debug: DashboardQueryDebug;
};

type DashboardTrendPoint = {
    month: string;
    stage1: number;
    stage2: number;
    stage3: number;
    totalECL: number;
    totalPortfolio: number;
    fullDate: unknown;
};

type DashboardTrendPayload = {
    data: DashboardTrendPoint[];
    debug: DashboardQueryDebug;
};

export class Ifrs9CalculationsService {
    private static readonly IFRS9_PREVIEW_SP_NAME = 'sp_frs9_preview_sequence';
    private static readonly IFRS9_IMPAIRMENT_SP_NAME = 'sp_frs9_imp_sequence';
    private static readonly IFRS9_PREVIEW_SQL_SP_JOB_NAME = 'IFRS9 Preview Sequence';
    private static readonly IFRS9_IMPAIRMENT_SQL_SP_JOB_NAME = 'IFRS9 Impairment Sequence';

    private isLegacySchemaError(error: any): boolean {
        const code = error?.code || error?.cause?.code
        if (code === '42P01') return true
        if (code === '42703') return true
        if (code === '3F000') return true
        const message = String(error?.message || '')
        return /relation .* does not exist/i.test(message) || /column .* does not exist/i.test(message)
    }

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

    private buildSummaryDebug(
        selectedSource: string,
        requestedDate: string | undefined,
        effectiveDate: string | undefined,
        mode: string | undefined,
        segmentIds: number[],
        sqlPreview: string,
        notes: string[] = [],
    ): DashboardQueryDebug {
        return {
            endpoint: '/api/v1/ifrs9/calculations/summary',
            sourceTables: [
                'public.frs9_ecl_summary',
                'public.frs9_imp_ca_result_h',
                'public.frs9_master_account',
            ],
            selectedSource,
            filtersApplied: {
                requestedDate: requestedDate || 'latest',
                effectiveDate: effectiveDate || null,
                mode: mode || 'all',
                segmentIds,
            },
            sqlPreview,
            notes,
        };
    }

    private buildTrendDebug(
        selectedSource: string,
        endDate: string | undefined,
        mode: string | undefined,
        segmentIds: number[],
        sqlPreview: string,
        notes: string[] = [],
    ): DashboardQueryDebug {
        return {
            endpoint: '/api/v1/ifrs9/calculations/portfolio-trend',
            sourceTables: [
                'public.frs9_ecl_summary',
                'public.frs9_imp_ca_result_h',
                'public.frs9_master_account',
            ],
            selectedSource,
            filtersApplied: {
                endDate: endDate || 'latest-12-periods',
                mode: mode || 'all',
                segmentIds,
            },
            sqlPreview,
            notes,
        };
    }

    async getSummary(tenantId: string, requestedDate?: string, mode?: string): Promise<DashboardSummaryPayload> {
        try {
            // Resolve segment IDs if mode is provided
            const segmentIds = mode ? await this.getSegmentIdsForMode(mode) : [];
            const hasSegmentFilter = segmentIds.length > 0;
            const stage1Values = ['1', 'stage 1', 'stage1'];
            const stage2Values = ['2', 'stage 2', 'stage2'];
            const stage3Values = ['3', 'stage 3', 'stage3'];

            // 1. Determine the process date to use
            let prcDate = requestedDate;

            if (!prcDate) {
                try {
                    const latestSummaryDate = await legacyDb
                        .select({ maxDate: sql<string>`max(${frs9EclSummary.prcDate})` })
                        .from(frs9EclSummary)
                        .where(hasSegmentFilter ? inArray(frs9EclSummary.segmentId, segmentIds) : sql`true`);
                    prcDate = latestSummaryDate[0]?.maxDate;
                } catch (error: any) {
                    if (!this.isLegacySchemaError(error)) throw error
                    prcDate = undefined
                }
            }

            if (!prcDate) {
                // If no date requested, find the latest process date in the result table
                // If filtered, we should only look at dates relevant to that segment, but usually max date is global.
                try {
                    const latestResultDate = await legacyDb
                        .select({ maxDate: sql<string>`max(${frs9ImpCaResultH.prcDate})` })
                        .from(frs9ImpCaResultH);
                    prcDate = latestResultDate[0]?.maxDate;
                } catch (error: any) {
                    if (!this.isLegacySchemaError(error)) throw error
                    prcDate = undefined
                }
            }

            if (requestedDate === 'all') {
                console.log(`📊 Calculating Grand Total (All Periods)${mode ? ' [Mode: ' + mode + ']' : ''}...`);

                try {
                    const conditions = [];
                    if (hasSegmentFilter) {
                        conditions.push(inArray(frs9EclSummary.segmentId, segmentIds));
                    }

                    const [row] = await legacyDb
                        .select({
                            totalECL: sql<number>`coalesce(sum(${frs9EclSummary.eclFinalAmt})::double precision, 0)`,
                            totalPortfolio: sql<number>`coalesce(sum(${frs9EclSummary.outstanding})::double precision, 0)`,
                            totalAccounts: sql<number>`coalesce(sum(${frs9EclSummary.noa})::bigint, 0)`,
                            stage1ECL: sql<number>`coalesce(sum(case when lower(trim(${frs9EclSummary.stage})) in (${sql.join(stage1Values.map((value) => sql`${value}`), sql`, `)}) then ${frs9EclSummary.eclFinalAmt} else 0 end)::double precision, 0)`,
                            stage2ECL: sql<number>`coalesce(sum(case when lower(trim(${frs9EclSummary.stage})) in (${sql.join(stage2Values.map((value) => sql`${value}`), sql`, `)}) then ${frs9EclSummary.eclFinalAmt} else 0 end)::double precision, 0)`,
                            stage3ECL: sql<number>`coalesce(sum(case when lower(trim(${frs9EclSummary.stage})) in (${sql.join(stage3Values.map((value) => sql`${value}`), sql`, `)}) then ${frs9EclSummary.eclFinalAmt} else 0 end)::double precision, 0)`,
                            stage1Count: sql<number>`coalesce(sum(case when lower(trim(${frs9EclSummary.stage})) in (${sql.join(stage1Values.map((value) => sql`${value}`), sql`, `)}) then coalesce(${frs9EclSummary.noa}, 0) else 0 end)::bigint, 0)`,
                            stage2Count: sql<number>`coalesce(sum(case when lower(trim(${frs9EclSummary.stage})) in (${sql.join(stage2Values.map((value) => sql`${value}`), sql`, `)}) then coalesce(${frs9EclSummary.noa}, 0) else 0 end)::bigint, 0)`,
                            stage3Count: sql<number>`coalesce(sum(case when lower(trim(${frs9EclSummary.stage})) in (${sql.join(stage3Values.map((value) => sql`${value}`), sql`, `)}) then coalesce(${frs9EclSummary.noa}, 0) else 0 end)::bigint, 0)`,
                        })
                        .from(frs9EclSummary)
                        .where(conditions.length > 0 ? and(...(conditions as any)) : sql`true`);

                    if (row && Number(row.totalAccounts) > 0) {
                        const totalECL = Number(row.totalECL || 0);
                        const totalPortfolio = Number(row.totalPortfolio || 0);
                        const count = Number(row.totalAccounts || 0);
                        const stage1 = Number(row.stage1ECL || 0);
                        const stage2 = Number(row.stage2ECL || 0);
                        const stage3 = Number(row.stage3ECL || 0);
                        const stage1Count = Number(row.stage1Count || 0);
                        const stage2Count = Number(row.stage2Count || 0);
                        const stage3Count = Number(row.stage3Count || 0);

                        return {
                            data: {
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
                            },
                            debug: this.buildSummaryDebug(
                                'public.frs9_ecl_summary',
                                requestedDate,
                                'all',
                                mode,
                                segmentIds,
                                `select sum(ecl_final_amt) as total_ecl, sum(outstanding) as total_exposure, sum(noa) as total_accounts, sum(case when lower(trim(stage)) in ('1','stage 1','stage1') then ecl_final_amt else 0 end) as stage1_ecl, sum(case when lower(trim(stage)) in ('2','stage 2','stage2') then ecl_final_amt else 0 end) as stage2_ecl, sum(case when lower(trim(stage)) in ('3','stage 3','stage3') then ecl_final_amt else 0 end) as stage3_ecl from public.frs9_ecl_summary${hasSegmentFilter ? ' where segment_id in (...)' : ''}`,
                                [
                                    'Active Accounts currently mirrors totalAccounts.',
                                    'High Risk card on UI uses stage3ECL amount, not stage3Count.',
                                    'ECL Distribution chart also derives from stage1ECL/stage2ECL/stage3ECL.'
                                ],
                            ),
                        };
                    }
                } catch (error: any) {
                    if (!this.isLegacySchemaError(error)) throw error
                }

                try {
                    const conditions = [];
                    if (hasSegmentFilter) {
                        conditions.push(inArray(frs9ImpCaResultH.segmentId, segmentIds));
                    }

                    const [row] = await legacyDb
                        .select({
                            totalECL: sql<number>`coalesce(sum(${frs9ImpCaResultH.eclAmount})::double precision, 0)`,
                            totalPortfolio: sql<number>`coalesce(sum(${frs9ImpCaResultH.outstanding})::double precision, 0)`,
                            totalAccounts: sql<number>`count(*)`,
                            stage1ECL: sql<number>`coalesce(sum(case when ${frs9ImpCaResultH.stage} = 1 then ${frs9ImpCaResultH.eclAmount} else 0 end)::double precision, 0)`,
                            stage2ECL: sql<number>`coalesce(sum(case when ${frs9ImpCaResultH.stage} = 2 then ${frs9ImpCaResultH.eclAmount} else 0 end)::double precision, 0)`,
                            stage3ECL: sql<number>`coalesce(sum(case when ${frs9ImpCaResultH.stage} = 3 then ${frs9ImpCaResultH.eclAmount} else 0 end)::double precision, 0)`,
                            stage1Count: sql<number>`coalesce(sum(case when ${frs9ImpCaResultH.stage} = 1 then 1 else 0 end)::int, 0)`,
                            stage2Count: sql<number>`coalesce(sum(case when ${frs9ImpCaResultH.stage} = 2 then 1 else 0 end)::int, 0)`,
                            stage3Count: sql<number>`coalesce(sum(case when ${frs9ImpCaResultH.stage} = 3 then 1 else 0 end)::int, 0)`,
                        })
                        .from(frs9ImpCaResultH)
                        .where(conditions.length > 0 ? and(...(conditions as any)) : sql`true`);

                    if (row && Number(row.totalAccounts) > 0) {
                        const totalECL = Number(row.totalECL || 0);
                        const totalPortfolio = Number(row.totalPortfolio || 0);
                        const count = Number(row.totalAccounts || 0);
                        const stage1 = Number(row.stage1ECL || 0);
                        const stage2 = Number(row.stage2ECL || 0);
                        const stage3 = Number(row.stage3ECL || 0);
                        const stage1Count = Number(row.stage1Count || 0);
                        const stage2Count = Number(row.stage2Count || 0);
                        const stage3Count = Number(row.stage3Count || 0);

                        console.log(`✅ Grand Total Summary loaded: ${count} total system records`);

                        return {
                            data: {
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
                            },
                            debug: this.buildSummaryDebug(
                                'public.frs9_imp_ca_result_h',
                                requestedDate,
                                'all',
                                mode,
                                segmentIds,
                                `select sum(ecl_amount) as total_ecl, sum(outstanding) as total_exposure, count(*) as total_accounts, sum(case when stage = 1 then ecl_amount else 0 end) as stage1_ecl, sum(case when stage = 2 then ecl_amount else 0 end) as stage2_ecl, sum(case when stage = 3 then ecl_amount else 0 end) as stage3_ecl from public.frs9_imp_ca_result_h${hasSegmentFilter ? ' where segment_id in (...)' : ''}`,
                                [
                                    'Used because frs9_ecl_summary had no rows for the requested scope.',
                                    'Active Accounts currently mirrors totalAccounts.',
                                ],
                            ),
                        };
                    }
                } catch (error: any) {
                    if (!this.isLegacySchemaError(error)) throw error
                }
            } else if (prcDate) {
                // Aggregrate summary for the latest process date
                try {
                    const conditions = [eq(frs9EclSummary.prcDate, prcDate as any)];
                    if (hasSegmentFilter) {
                        conditions.push(inArray(frs9EclSummary.segmentId, segmentIds));
                    }

                    const [row] = await legacyDb
                        .select({
                            totalECL: sql<number>`coalesce(sum(${frs9EclSummary.eclFinalAmt})::double precision, 0)`,
                            totalPortfolio: sql<number>`coalesce(sum(${frs9EclSummary.outstanding})::double precision, 0)`,
                            totalAccounts: sql<number>`coalesce(sum(${frs9EclSummary.noa})::bigint, 0)`,
                            stage1ECL: sql<number>`coalesce(sum(case when lower(trim(${frs9EclSummary.stage})) in (${sql.join(stage1Values.map((value) => sql`${value}`), sql`, `)}) then ${frs9EclSummary.eclFinalAmt} else 0 end)::double precision, 0)`,
                            stage2ECL: sql<number>`coalesce(sum(case when lower(trim(${frs9EclSummary.stage})) in (${sql.join(stage2Values.map((value) => sql`${value}`), sql`, `)}) then ${frs9EclSummary.eclFinalAmt} else 0 end)::double precision, 0)`,
                            stage3ECL: sql<number>`coalesce(sum(case when lower(trim(${frs9EclSummary.stage})) in (${sql.join(stage3Values.map((value) => sql`${value}`), sql`, `)}) then ${frs9EclSummary.eclFinalAmt} else 0 end)::double precision, 0)`,
                            stage1Count: sql<number>`coalesce(sum(case when lower(trim(${frs9EclSummary.stage})) in (${sql.join(stage1Values.map((value) => sql`${value}`), sql`, `)}) then coalesce(${frs9EclSummary.noa}, 0) else 0 end)::bigint, 0)`,
                            stage2Count: sql<number>`coalesce(sum(case when lower(trim(${frs9EclSummary.stage})) in (${sql.join(stage2Values.map((value) => sql`${value}`), sql`, `)}) then coalesce(${frs9EclSummary.noa}, 0) else 0 end)::bigint, 0)`,
                            stage3Count: sql<number>`coalesce(sum(case when lower(trim(${frs9EclSummary.stage})) in (${sql.join(stage3Values.map((value) => sql`${value}`), sql`, `)}) then coalesce(${frs9EclSummary.noa}, 0) else 0 end)::bigint, 0)`,
                        })
                        .from(frs9EclSummary)
                        .where(and(...(conditions as any)));

                    if (row && Number(row.totalAccounts) > 0) {
                        const totalECL = Number(row.totalECL || 0);
                        const totalPortfolio = Number(row.totalPortfolio || 0);
                        const count = Number(row.totalAccounts || 0);
                        const stage1 = Number(row.stage1ECL || 0);
                        const stage2 = Number(row.stage2ECL || 0);
                        const stage3 = Number(row.stage3ECL || 0);
                        const stage1Count = Number(row.stage1Count || 0);
                        const stage2Count = Number(row.stage2Count || 0);
                        const stage3Count = Number(row.stage3Count || 0);

                        return {
                            data: {
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
                            },
                            debug: this.buildSummaryDebug(
                                'public.frs9_ecl_summary',
                                requestedDate,
                                prcDate,
                                mode,
                                segmentIds,
                                `select sum(ecl_final_amt) as total_ecl, sum(outstanding) as total_exposure, sum(noa) as total_accounts, sum(case when lower(trim(stage)) in ('1','stage 1','stage1') then ecl_final_amt else 0 end) as stage1_ecl, sum(case when lower(trim(stage)) in ('2','stage 2','stage2') then ecl_final_amt else 0 end) as stage2_ecl, sum(case when lower(trim(stage)) in ('3','stage 3','stage3') then ecl_final_amt else 0 end) as stage3_ecl from public.frs9_ecl_summary where prc_date = :effectiveDate${hasSegmentFilter ? ' and segment_id in (...)' : ''}`,
                                [
                                    'Active Accounts currently mirrors totalAccounts.',
                                    'High Risk card on UI uses stage3ECL amount, not stage3Count.',
                                ],
                            ),
                        };
                    }
                } catch (error: any) {
                    if (!this.isLegacySchemaError(error)) throw error
                }

                try {
                    const conditions = [eq(frs9ImpCaResultH.prcDate, prcDate as any)];
                    if (hasSegmentFilter) {
                        conditions.push(inArray(frs9ImpCaResultH.segmentId, segmentIds));
                    }

                    const [row] = await legacyDb
                        .select({
                            totalECL: sql<number>`coalesce(sum(${frs9ImpCaResultH.eclAmount})::double precision, 0)`,
                            totalPortfolio: sql<number>`coalesce(sum(${frs9ImpCaResultH.outstanding})::double precision, 0)`,
                            totalAccounts: sql<number>`count(*)`,
                            stage1ECL: sql<number>`coalesce(sum(case when ${frs9ImpCaResultH.stage} = 1 then ${frs9ImpCaResultH.eclAmount} else 0 end)::double precision, 0)`,
                            stage2ECL: sql<number>`coalesce(sum(case when ${frs9ImpCaResultH.stage} = 2 then ${frs9ImpCaResultH.eclAmount} else 0 end)::double precision, 0)`,
                            stage3ECL: sql<number>`coalesce(sum(case when ${frs9ImpCaResultH.stage} = 3 then ${frs9ImpCaResultH.eclAmount} else 0 end)::double precision, 0)`,
                            stage1Count: sql<number>`coalesce(sum(case when ${frs9ImpCaResultH.stage} = 1 then 1 else 0 end)::int, 0)`,
                            stage2Count: sql<number>`coalesce(sum(case when ${frs9ImpCaResultH.stage} = 2 then 1 else 0 end)::int, 0)`,
                            stage3Count: sql<number>`coalesce(sum(case when ${frs9ImpCaResultH.stage} = 3 then 1 else 0 end)::int, 0)`,
                        })
                        .from(frs9ImpCaResultH)
                        .where(and(...(conditions as any)));

                    if (row && Number(row.totalAccounts) > 0) {
                        const totalECL = Number(row.totalECL || 0);
                        const totalPortfolio = Number(row.totalPortfolio || 0);
                        const count = Number(row.totalAccounts || 0);
                        const stage1 = Number(row.stage1ECL || 0);
                        const stage2 = Number(row.stage2ECL || 0);
                        const stage3 = Number(row.stage3ECL || 0);
                        const stage1Count = Number(row.stage1Count || 0);
                        const stage2Count = Number(row.stage2Count || 0);
                        const stage3Count = Number(row.stage3Count || 0);

                        console.log(`✅ Calculation summary loaded (DATE: ${prcDate}): ${count} accounts, Total ECL: ${totalECL}`);

                        return {
                            data: {
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
                            },
                            debug: this.buildSummaryDebug(
                                'public.frs9_imp_ca_result_h',
                                requestedDate,
                                prcDate,
                                mode,
                                segmentIds,
                                `select sum(ecl_amount) as total_ecl, sum(outstanding) as total_exposure, count(*) as total_accounts, sum(case when stage = 1 then ecl_amount else 0 end) as stage1_ecl, sum(case when stage = 2 then ecl_amount else 0 end) as stage2_ecl, sum(case when stage = 3 then ecl_amount else 0 end) as stage3_ecl from public.frs9_imp_ca_result_h where prc_date = :effectiveDate${hasSegmentFilter ? ' and segment_id in (...)' : ''}`,
                                [
                                    'Used because frs9_ecl_summary had no rows for the requested date/scope.',
                                    'Active Accounts currently mirrors totalAccounts.',
                                ],
                            ),
                        };
                    }
                } catch (error: any) {
                    if (!this.isLegacySchemaError(error)) throw error
                }
            }

            // 2. FALLBACK: No calculation results found, try to get basic metrics from Master Account
            console.log('⚠️ No calculation results found, trying fallback to Master Account...');

            let masterDate = requestedDate;

            if (!masterDate) {
                try {
                    const latestMasterDate = await legacyDb
                        .select({ maxDate: sql<string>`max(${frs9MasterAccount.prcDate})` })
                        .from(frs9MasterAccount);
                    masterDate = latestMasterDate[0]?.maxDate;
                } catch (error: any) {
                    if (!this.isLegacySchemaError(error)) throw error
                    masterDate = undefined
                }
            }

            if (masterDate) {
                try {
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
                        data: {
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
                        },
                        debug: this.buildSummaryDebug(
                            'public.frs9_master_account',
                            requestedDate,
                            masterDate,
                            mode,
                            segmentIds,
                            `select sum(outstanding) as total_exposure, count(*) as total_accounts from public.frs9_master_account where date(prc_date) = :effectiveDate${hasSegmentFilter ? ' and segment_id in (...)' : ''}`,
                            [
                                'Fallback path because no calculation result rows were found.',
                                'Total ECL and stage values are zero on this fallback path.',
                            ],
                        ),
                    };
                } catch (error: any) {
                    if (!this.isLegacySchemaError(error)) throw error
                }
            }

            // 3. FINAL FALLBACK: No data at all
            console.warn('❌ No data found in Result or Master Account tables');
            return {
                data: {
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
                },
                debug: this.buildSummaryDebug(
                    'none',
                    requestedDate,
                    prcDate || undefined,
                    mode,
                    segmentIds,
                    'No query produced rows from frs9_ecl_summary, frs9_imp_ca_result_h, or frs9_master_account.',
                    ['No dashboard source rows were found for the current filter scope.'],
                ),
            };

        } catch (error: any) {
            console.error('❌ Error fetching calculation summary:', error);
            if (this.isLegacySchemaError(error)) {
                return {
                    data: {
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
                    },
                    debug: this.buildSummaryDebug(
                        'none',
                        requestedDate,
                        undefined,
                        mode,
                        [],
                        'Legacy schema error prevented summary debug query resolution.',
                        ['Legacy schema fallback returned an empty summary.'],
                    ),
                };
            }
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

            const resolvedTenantId = await JobsRepository.resolveTenantId(tenantId)
            await JobsRepository.ensureCoreTenantRow(resolvedTenantId)

            const [activeExecution] = await db
                .select({
                    id: jobExecutions.id,
                    startTime: jobExecutions.startTime,
                })
                .from(jobExecutions)
                .where(and(
                    eq(jobExecutions.tenantId, resolvedTenantId as any),
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

            const resolvedTenantId = await JobsRepository.resolveTenantId(tenantId)
            await JobsRepository.ensureCoreTenantRow(resolvedTenantId)

            const [activeExecution] = await db
                .select({
                    id: jobExecutions.id,
                    startTime: jobExecutions.startTime,
                })
                .from(jobExecutions)
                .where(and(
                    eq(jobExecutions.tenantId, resolvedTenantId as any),
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

    async getPortfolioTrend(tenantId: string, endDate?: string, _mode?: string): Promise<DashboardTrendPayload> {
        try {
            const normalizedEndDate = typeof endDate === 'string' ? endDate.trim() : undefined;
            const hasDateLimit = Boolean(normalizedEndDate && normalizedEndDate !== 'all');
            const stage1Values = ['1', 'stage 1', 'stage1'];
            const stage2Values = ['2', 'stage 2', 'stage2'];
            const stage3Values = ['3', 'stage 3', 'stage3'];
            const segmentIds = _mode ? await this.getSegmentIdsForMode(_mode) : [];
            const hasSegmentFilter = segmentIds.length > 0;

            // 1. Try summary table first - aggregated ECL by stage over time
            let trend: any[] = []
            let selectedSource = 'public.frs9_ecl_summary'
            let sqlPreview = `select prc_date, sum(ecl_final_amt) as total_ecl, sum(outstanding) as total_portfolio from public.frs9_ecl_summary${hasDateLimit ? ' where date(prc_date) <= :endDate' : ''}${hasSegmentFilter ? `${hasDateLimit ? ' and' : ' where'} segment_id in (...)` : ''} group by prc_date order by prc_date desc limit 12`;
            try {
                const trendQuery = legacyDb
                    .select({
                        date: frs9EclSummary.prcDate,
                        stage1: sql<number>`sum(CASE WHEN lower(trim(${frs9EclSummary.stage})) in (${sql.join(stage1Values.map((value) => sql`${value}`), sql`, `)}) THEN ${frs9EclSummary.eclFinalAmt} ELSE 0 END)`,
                        stage2: sql<number>`sum(CASE WHEN lower(trim(${frs9EclSummary.stage})) in (${sql.join(stage2Values.map((value) => sql`${value}`), sql`, `)}) THEN ${frs9EclSummary.eclFinalAmt} ELSE 0 END)`,
                        stage3: sql<number>`sum(CASE WHEN lower(trim(${frs9EclSummary.stage})) in (${sql.join(stage3Values.map((value) => sql`${value}`), sql`, `)}) THEN ${frs9EclSummary.eclFinalAmt} ELSE 0 END)`,
                        totalECL: sql<number>`sum(${frs9EclSummary.eclFinalAmt})`,
                        totalPortfolio: sql<number>`sum(${frs9EclSummary.outstanding})`
                    })
                    .from(frs9EclSummary);

                if (hasDateLimit) {
                    trendQuery.where(and(
                        sql`date(${frs9EclSummary.prcDate}) <= ${normalizedEndDate}`,
                        hasSegmentFilter ? inArray(frs9EclSummary.segmentId, segmentIds) : sql`true`
                    ));
                } else if (hasSegmentFilter) {
                    trendQuery.where(inArray(frs9EclSummary.segmentId, segmentIds));
                }

                trend = await trendQuery
                    .groupBy(frs9EclSummary.prcDate)
                    .orderBy(desc(frs9EclSummary.prcDate))
                    .limit(12);
            } catch (error: any) {
                if (!this.isLegacySchemaError(error)) throw error
                trend = []
            }

            // 2. Fallback to Result table if summary is empty
            if (!trend || trend.length === 0) {
                try {
                    selectedSource = 'public.frs9_imp_ca_result_h';
                    sqlPreview = `select prc_date, sum(ecl_amount) as total_ecl, sum(outstanding) as total_portfolio from public.frs9_imp_ca_result_h${hasDateLimit ? ' where date(prc_date) <= :endDate' : ''}${hasSegmentFilter ? `${hasDateLimit ? ' and' : ' where'} segment_id in (...)` : ''} group by prc_date order by prc_date desc limit 12`;
                    const trendQuery = legacyDb
                        .select({
                            date: frs9ImpCaResultH.prcDate,
                            stage1: sql<number>`sum(CASE WHEN cast(${frs9ImpCaResultH.stage} as int) = 1 THEN ${frs9ImpCaResultH.eclAmount} ELSE 0 END)`,
                            stage2: sql<number>`sum(CASE WHEN cast(${frs9ImpCaResultH.stage} as int) = 2 THEN ${frs9ImpCaResultH.eclAmount} ELSE 0 END)`,
                            stage3: sql<number>`sum(CASE WHEN cast(${frs9ImpCaResultH.stage} as int) = 3 THEN ${frs9ImpCaResultH.eclAmount} ELSE 0 END)`,
                            totalECL: sql<number>`sum(${frs9ImpCaResultH.eclAmount})`,
                            totalPortfolio: sql<number>`sum(${frs9ImpCaResultH.outstanding})`
                        })
                        .from(frs9ImpCaResultH);

                    if (hasDateLimit) {
                        trendQuery.where(and(
                            sql`date(${frs9ImpCaResultH.prcDate}) <= ${normalizedEndDate}`,
                            hasSegmentFilter ? inArray(frs9ImpCaResultH.segmentId, segmentIds) : sql`true`
                        ));
                    } else if (hasSegmentFilter) {
                        trendQuery.where(inArray(frs9ImpCaResultH.segmentId, segmentIds));
                    }

                    trend = await trendQuery
                        .groupBy(frs9ImpCaResultH.prcDate)
                        .orderBy(desc(frs9ImpCaResultH.prcDate))
                        .limit(12);
                } catch (error: any) {
                    if (!this.isLegacySchemaError(error)) throw error
                    trend = []
                }
            }

            // 3. Fallback to Master Account if Result table is empty
            if (!trend || trend.length === 0) {
                console.log('📉 No trend data in Result table, falling back to Master Account...');
                try {
                    selectedSource = 'public.frs9_master_account';
                    sqlPreview = `select prc_date, sum(outstanding) as total_portfolio from public.frs9_master_account${hasDateLimit ? ' where date(prc_date) <= :endDate' : ''} group by prc_date order by prc_date desc limit 12`;
                    const masterTrendQuery = legacyDb
                        .select({
                            date: frs9MasterAccount.prcDate,
                            value: sql<number>`sum(${frs9MasterAccount.outstanding})`
                        })
                        .from(frs9MasterAccount);

                    if (hasDateLimit) {
                        masterTrendQuery.where(sql`date(${frs9MasterAccount.prcDate}) <= ${normalizedEndDate}`);
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
                } catch (error: any) {
                    if (!this.isLegacySchemaError(error)) throw error
                    trend = []
                }
            }

            if (!trend || trend.length === 0) {
                return {
                    data: [],
                    debug: this.buildTrendDebug(
                        'none',
                        normalizedEndDate,
                        _mode,
                        segmentIds,
                        'No query produced rows from frs9_ecl_summary, frs9_imp_ca_result_h, or frs9_master_account.',
                        ['No trend rows were found for the current filter scope.'],
                    ),
                };
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
            return {
                data: formattedTrend,
                debug: this.buildTrendDebug(
                    selectedSource,
                    normalizedEndDate,
                    _mode,
                    segmentIds,
                    sqlPreview,
                    ['Portfolio Exposure Trend chart uses totalPortfolio per period.'],
                ),
            };
        } catch (error: any) {
            console.error('❌ Error fetching portfolio trend:', error);
            if (this.isLegacySchemaError(error)) {
                return {
                    data: [],
                    debug: this.buildTrendDebug(
                        'none',
                        endDate,
                        _mode,
                        [],
                        'Legacy schema error prevented trend debug query resolution.',
                        ['Legacy schema fallback returned an empty trend dataset.'],
                    ),
                };
            }
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
    async getAvailableDates(tenantId: string, mode?: string, groupBy?: string) {
        try {
            console.log(`📅 Fetching available process dates from all sources [Mode: ${mode || 'all'}]...`);
            
            const segmentIds = mode ? await this.getSegmentIdsForMode(mode) : [];
            const hasSegmentFilter = segmentIds.length > 0;

            const normalizeDate = (value: unknown): string | null => {
                if (!value) return null
                if (value instanceof Date) return value.toISOString().slice(0, 10)
                const raw = String(value).trim()
                if (!raw) return null
                if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw
                const parsed = new Date(raw)
                if (!Number.isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10)
                return null
            }

            let prcDateRows: Array<{ currdate: unknown }> = []
            let summaryDateRows: Array<{ date: unknown }> = []
            let masterDateRows: Array<{ date: unknown }> = []
            let resultDateRows: Array<{ date: unknown }> = []

            try {
                prcDateRows = await legacyDb
                    .select({ currdate: frs9PrcDate.currdate })
                    .from(frs9PrcDate)
                    .orderBy(desc(frs9PrcDate.currdate))
            } catch (err: any) {
                console.warn('⚠️ frs9_prc_date not available:', err?.message || err)
            }

            try {
                const baseSummaryQuery = legacyDb
                    .select({ date: frs9EclSummary.prcDate })
                    .from(frs9EclSummary)

                const summaryQuery = hasSegmentFilter
                    ? baseSummaryQuery.where(inArray(frs9EclSummary.segmentId, segmentIds))
                    : baseSummaryQuery

                summaryDateRows = await summaryQuery.groupBy(frs9EclSummary.prcDate)
            } catch (err: any) {
                console.warn('⚠️ frs9_ecl_summary not available:', err?.message || err)
            }

            try {
                const baseMasterQuery = legacyDb
                    .select({ date: frs9MasterAccount.prcDate })
                    .from(frs9MasterAccount)

                const masterQuery = hasSegmentFilter
                    ? baseMasterQuery.where(inArray(frs9MasterAccount.segmentId, segmentIds))
                    : baseMasterQuery

                masterDateRows = await masterQuery.groupBy(frs9MasterAccount.prcDate)
            } catch (err: any) {
                console.warn('⚠️ frs9_master_account not available:', err?.message || err)
            }

            try {
                const baseResultQuery = legacyDb
                    .select({ date: frs9ImpCaResultH.prcDate })
                    .from(frs9ImpCaResultH)

                const resultQuery = hasSegmentFilter
                    ? baseResultQuery.where(inArray(frs9ImpCaResultH.segmentId, segmentIds))
                    : baseResultQuery

                resultDateRows = await resultQuery.groupBy(frs9ImpCaResultH.prcDate)
            } catch (err: any) {
                console.warn('⚠️ frs9_imp_ca_result_h not available:', err?.message || err)
            }

            // Collect all unique dates
            const allDates = new Set<string>();

            // Process frs9_prc_date
            prcDateRows.forEach(r => {
                const normalized = normalizeDate(r.currdate)
                if (normalized) allDates.add(normalized)
            });

            // Process frs9_ecl_summary
            summaryDateRows.forEach(r => {
                const normalized = normalizeDate(r.date)
                if (normalized) allDates.add(normalized)
            });

            // Process frs9_master_account
            masterDateRows.forEach(r => {
                const normalized = normalizeDate(r.date)
                if (normalized) allDates.add(normalized)
            });

            // Process frs9_imp_ca_result_h
            resultDateRows.forEach(r => {
                const normalized = normalizeDate(r.date)
                if (normalized) allDates.add(normalized)
            });

            // Convert to array and sort descending (newest first)
            const sortedDates = Array.from(allDates).sort((a, b) => {
                return new Date(b).getTime() - new Date(a).getTime();
            });

            console.log(`✅ Consolidated available dates: ${sortedDates.length} unique dates found across all tables`);

            if (groupBy === 'year') {
                const byYear: Record<string, string[]> = {}
                sortedDates.forEach((date) => {
                    const year = date.slice(0, 4)
                    if (!byYear[year]) byYear[year] = []
                    byYear[year].push(date)
                })

                const years = Object.keys(byYear).sort((a, b) => Number(b) - Number(a))
                const ordered: Record<string, string[]> = {}
                years.forEach((year) => {
                    ordered[year] = byYear[year]
                })
                return ordered
            }

            return sortedDates;

        } catch (err: any) {
            console.error('❌ Error fetching available dates:', err.message || err);
            // Return empty array instead of throwing to prevent UI crash
            return [];
        }
    }
}

export const ifrs9CalculationsService = new Ifrs9CalculationsService();
