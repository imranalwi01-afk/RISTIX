// @ts-nocheck
import { sql, desc, eq, and, lte } from 'drizzle-orm';
// Use the centralized schema export
import {
    frs9ImpIaHeader,
    frs9ImpCaResultH,
    frs9NominativeOutput,
    frs9ImpCaPdStructure,
    vwPdStructureYearly,
    vwPdStructureMonthly,
    frs9AccountId,
    frs9ImpCaLgdData,
    frs9ImpCaLgdRecD,
    frs9ImpCaLgdH,
    frs9ImpCaLgdConfig,
    frs9ImpCaEad,
    frs9ImpCaEadPaymAvg,
    frs9MasterAccount,
    frs9ImpCaResultD,
    frs9ParamSegmenth,
} from '../db/schema';
import { legacyDb } from '@/config';
import { decodeCursor, encodeCursor } from '@/lib/http/list-query';

export interface LifetimePDParams {
    prc_date: string;
    pd_config_id?: number;
    pd_method?: number;
    scalar_id?: number;
    segment_id?: number;
    fl_flag?: boolean;
}

export interface LifetimeLGDParams {
    prc_date: string;
    lgd_config_id?: number;
    lgd_method?: number;
    model_id?: number;
    segment_id?: number;
    fl_flag?: boolean;
    search?: string;
    sort?: Array<{ field: string; direction: 'asc' | 'desc' }>;
    detailFilters?: Record<string, unknown>;
}

export interface EADModelParams {
    prc_date: string;
    ead_config_id?: number;
    segment_id?: number;
    search?: string;
    sort?: Array<{ field: string; direction: 'asc' | 'desc' }>;
    detailFilters?: Record<string, unknown>;
}

export interface ECLResultParams {
    prc_date: string;
    segment_id?: number;
    stage?: string | string[];
    account_status?: string | string[];
    search?: string;
    sort?: Array<{ field: string; direction: 'asc' | 'desc' }>;
    detailFilters?: Record<string, unknown>;
}

export interface MovementParams {
    prc_date: string;
    segment_id?: number;
    stage?: string | string[];
    group_segment?: string;
    search?: string;
    sort?: Array<{ field: string; direction: 'asc' | 'desc' }>;
    detailFilters?: Record<string, unknown>;
}

export class Ifrs9ReportsService {
    // Helper to get pagination params
    private getPagination(page: number = 1, limit: number = 20) {
        const offset = (page - 1) * limit;
        return { limit, offset };
    }

    private toNumber(value: unknown): number {
        if (value === null || value === undefined) return 0;
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : 0;
    }

    private normalizeText(value: unknown): string {
        if (value === null || value === undefined) return '';
        return String(value).trim().toLowerCase();
    }

    private compareValues(a: unknown, b: unknown): number {
        if (a === b) return 0;
        if (a === null || a === undefined) return -1;
        if (b === null || b === undefined) return 1;

        const aNumber = Number(a);
        const bNumber = Number(b);
        if (Number.isFinite(aNumber) && Number.isFinite(bNumber)) {
            return aNumber - bNumber;
        }

        return String(a).localeCompare(String(b), 'en', { sensitivity: 'base', numeric: true });
    }

    private filterLifetimeLgdRows(
        rows: any[],
        search?: string,
        detailFilters?: Record<string, unknown>,
    ) {
        const reportKeys = new Set(['prc_date', 'lgd_config_id', 'lgd_method', 'model_id', 'segment_id', 'fl_flag']);
        const entries = Object.entries(detailFilters ?? {}).filter(([key]) => !reportKeys.has(key.split('.')[0] ?? key));

        return rows.filter((row) => {
            if (search) {
                const needle = this.normalizeText(search);
                const haystacks = [
                    row.account_number,
                    row.cif_name,
                    row.account_id,
                ].map((value) => this.normalizeText(value));

                if (!haystacks.some((value) => value.includes(needle))) {
                    return false;
                }
            }

            for (const [key, rawValue] of entries) {
                const [field, operator = 'equals'] = key.split('.');
                const rowValue = row[field];

                if (rawValue === undefined || rawValue === null || rawValue === '') continue;

                if (field === 'account_number' || field === 'cif_name') {
                    const actual = this.normalizeText(rowValue);
                    const expected = this.normalizeText(rawValue);
                    if (operator === 'contains' && !actual.includes(expected)) return false;
                    if (operator === 'equals' && actual !== expected) return false;
                    continue;
                }

                if (field === 'first_npl_date') {
                    const actual = String(rowValue ?? '').slice(0, 10);
                    const expected = String(rawValue).slice(0, 10);
                    if (operator === 'equals' && actual !== expected) return false;
                    if (operator === 'from' && actual < expected) return false;
                    if (operator === 'to' && actual > expected) return false;
                    continue;
                }

                const actualNumber = this.toNumber(rowValue);
                const expectedNumber = this.toNumber(rawValue);
                if (operator === 'equals' && actualNumber !== expectedNumber) return false;
                if ((operator === 'min' || operator === 'from') && actualNumber < expectedNumber) return false;
                if ((operator === 'max' || operator === 'to') && actualNumber > expectedNumber) return false;
            }

            return true;
        });
    }

    private sortLifetimeLgdRows(
        rows: any[],
        sort?: Array<{ field: string; direction: 'asc' | 'desc' }>,
    ) {
        const sortModel = sort?.length ? sort : [{ field: 'account_number', direction: 'asc' as const }];

        return [...rows].sort((left, right) => {
            for (const item of sortModel) {
                const baseComparison = this.compareValues(left?.[item.field], right?.[item.field]);
                if (baseComparison !== 0) {
                    return item.direction === 'desc' ? -baseComparison : baseComparison;
                }
            }

            return this.compareValues(left?.account_number, right?.account_number);
        });
    }

    private filterEclResultRows(
        rows: any[],
        search?: string,
        detailFilters?: Record<string, unknown>,
    ) {
        const reportKeys = new Set(['prc_date', 'segment_id', 'stage']);
        const entries = Object.entries(detailFilters ?? {}).filter(([key]) => !reportKeys.has(key.split('.')[0] ?? key));

        return rows.filter((row) => {
            if (search) {
                const needle = this.normalizeText(search);
                const haystacks = [
                    row.branch_code,
                    row.group_segment,
                    row.segment,
                    row.sub_segment,
                    row.currency,
                ].map((value) => this.normalizeText(value));

                if (!haystacks.some((value) => value.includes(needle))) {
                    return false;
                }
            }

            for (const [key, rawValue] of entries) {
                const [field, operator = 'equals'] = key.split('.');
                const rowValue = row[field];
                if (rawValue === undefined || rawValue === null || rawValue === '') continue;

                if (typeof rowValue === 'boolean' || field === 'impaired_flag' || field === 'sicr_flag') {
                    const actual = Boolean(rowValue);
                    const expected = rawValue === true || String(rawValue).toLowerCase() === 'true';
                    if (actual !== expected) return false;
                    continue;
                }

                if (['branch_code', 'group_segment', 'segment', 'sub_segment', 'currency'].includes(field)) {
                    const actual = this.normalizeText(rowValue);
                    const expected = this.normalizeText(rawValue);
                    if (operator === 'contains' && !actual.includes(expected)) return false;
                    if (operator === 'equals' && actual !== expected) return false;
                    continue;
                }

                const actualNumber = this.toNumber(rowValue);
                const expectedNumber = this.toNumber(rawValue);
                if (operator === 'equals' && actualNumber !== expectedNumber) return false;
                if ((operator === 'min' || operator === 'from') && actualNumber < expectedNumber) return false;
                if ((operator === 'max' || operator === 'to') && actualNumber > expectedNumber) return false;
            }

            return true;
        });
    }

    private sortEclResultRows(
        rows: any[],
        sort?: Array<{ field: string; direction: 'asc' | 'desc' }>,
    ) {
        const sortModel = sort?.length ? sort : [
            { field: 'segment_id', direction: 'asc' as const },
            { field: 'stage', direction: 'asc' as const },
        ];

        return [...rows].sort((left, right) => {
            for (const item of sortModel) {
                const baseComparison = this.compareValues(left?.[item.field], right?.[item.field]);
                if (baseComparison !== 0) {
                    return item.direction === 'desc' ? -baseComparison : baseComparison;
                }
            }

            return this.compareValues(left?.id, right?.id);
        });
    }

    private filterEadModelRows(
        rows: any[],
        search?: string,
        detailFilters?: Record<string, unknown>,
    ) {
        const reportKeys = new Set(['prc_date', 'ead_config_id', 'segment_id']);
        const entries = Object.entries(detailFilters ?? {}).filter(([key]) => !reportKeys.has(key.split('.')[0] ?? key));

        return rows.filter((row) => {
            if (search) {
                const needle = this.normalizeText(search);
                const dynamicValues = Object.entries(row ?? {})
                    .filter(([key]) => key === 'lt_month' || key === 'tenor' || key.startsWith('seq_'))
                    .map(([, value]) => this.normalizeText(value));

                if (!dynamicValues.some((value) => value.includes(needle))) {
                    return false;
                }
            }

            for (const [key, rawValue] of entries) {
                const [field, operator = 'equals'] = key.split('.');
                const rowValue = row[field];
                if (rawValue === undefined || rawValue === null || rawValue === '') continue;

                const actualNumber = this.toNumber(rowValue);
                const expectedNumber = this.toNumber(rawValue);
                if (operator === 'equals' && actualNumber !== expectedNumber) return false;
                if ((operator === 'min' || operator === 'from') && actualNumber < expectedNumber) return false;
                if ((operator === 'max' || operator === 'to') && actualNumber > expectedNumber) return false;
            }

            return true;
        });
    }

    private sortEadModelRows(
        rows: any[],
        sort?: Array<{ field: string; direction: 'asc' | 'desc' }>,
    ) {
        const sortModel = sort?.length ? sort : [{ field: 'tenor', direction: 'asc' as const }];

        return [...rows].sort((left, right) => {
            for (const item of sortModel) {
                const baseComparison = this.compareValues(left?.[item.field], right?.[item.field]);
                if (baseComparison !== 0) {
                    return item.direction === 'desc' ? -baseComparison : baseComparison;
                }
            }

            return this.compareValues(left?.tenor, right?.tenor);
        });
    }

    private filterMovementRows(
        rows: any[],
        search?: string,
        detailFilters?: Record<string, unknown>,
    ) {
        const reportKeys = new Set(['prc_date', 'segment_id', 'stage', 'group_segment']);
        const entries = Object.entries(detailFilters ?? {}).filter(([key]) => !reportKeys.has(key.split('.')[0] ?? key));

        return rows.filter((row) => {
            if (search) {
                const needle = this.normalizeText(search);
                const haystacks = [
                    row.movement,
                    row.prc_date,
                ].map((value) => this.normalizeText(value));
                if (!haystacks.some((value) => value.includes(needle))) {
                    return false;
                }
            }

            for (const [key, rawValue] of entries) {
                const [field, operator = 'equals'] = key.split('.');
                const rowValue = row[field];
                if (rawValue === undefined || rawValue === null || rawValue === '') continue;

                if (field === 'movement' || field === 'prc_date') {
                    const actual = this.normalizeText(rowValue);
                    const expected = this.normalizeText(rawValue);
                    if (operator === 'contains' && !actual.includes(expected)) return false;
                    if (operator === 'equals' && actual !== expected) return false;
                    continue;
                }

                const actualNumber = this.toNumber(rowValue);
                const expectedNumber = this.toNumber(rawValue);
                if (operator === 'equals' && actualNumber !== expectedNumber) return false;
                if ((operator === 'min' || operator === 'from') && actualNumber < expectedNumber) return false;
                if ((operator === 'max' || operator === 'to') && actualNumber > expectedNumber) return false;
            }

            return true;
        });
    }

    private sortMovementRows(
        rows: any[],
        sort?: Array<{ field: string; direction: 'asc' | 'desc' }>,
    ) {
        const sortModel = sort?.length ? sort : [{ field: 'movement_order', direction: 'asc' as const }];

        return [...rows].sort((left, right) => {
            for (const item of sortModel) {
                const baseComparison = this.compareValues(left?.[item.field], right?.[item.field]);
                if (baseComparison !== 0) {
                    return item.direction === 'desc' ? -baseComparison : baseComparison;
                }
            }

            return this.compareValues(left?.movement_order, right?.movement_order);
        });
    }

    private endOfMonth(dateText: string): string {
        const [year, month] = String(dateText).split('-').map((v) => Number(v));
        if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
            return dateText;
        }
        const eom = new Date(Date.UTC(year, month, 0));
        return eom.toISOString().slice(0, 10);
    }

    private normalizeStageFilter(stage?: string | string[]): number[] | null {
        const stageValues = Array.isArray(stage)
            ? stage
            : (stage ? [stage] : []);

        const parsed = Array.from(new Set(
            stageValues
                .flatMap((value) => String(value).split(','))
                .map((value) => Number(String(value).trim()))
                .filter((value) => Number.isInteger(value) && value >= 1 && value <= 3)
        ));

        return parsed.length > 0 ? parsed : null;
    }

    private normalizeTextFilter(values?: string[] | string): string[] | null {
        const rawValues = Array.isArray(values) ? values : (values ? [values] : []);
        const parsed = Array.from(new Set(
            rawValues
                .flatMap((value) => String(value).split(','))
                .map((value) => value.trim())
                .filter((value) => value.length > 0)
        ));

        return parsed.length > 0 ? parsed : null;
    }

    private escapeSqlLiteral(value: string): string {
        return value.replace(/'/g, "''");
    }

    private async resolveNominativePrcDate(
        requestedPrcDate?: string,
        downloadStartDate?: string,
        downloadEndDate?: string,
    ): Promise<string | null> {
        const whereConditions: string[] = [];

        if (requestedPrcDate) {
            whereConditions.push(`prc_date <= '${this.escapeSqlLiteral(requestedPrcDate)}'`);
        }
        if (downloadStartDate) {
            whereConditions.push(`prc_date >= '${this.escapeSqlLiteral(downloadStartDate)}'`);
        }
        if (downloadEndDate) {
            whereConditions.push(`prc_date <= '${this.escapeSqlLiteral(downloadEndDate)}'`);
        }

        const scopedWhereClause = whereConditions.length > 0
            ? `WHERE ${whereConditions.join(' AND ')}`
            : '';

        const scopedDateResult = await legacyDb.execute(sql.raw(`
            SELECT MAX(prc_date) AS effective_date
            FROM public.frs9_nominative_output
            ${scopedWhereClause}
        `));

        const scopedDate = (scopedDateResult as any[])[0]?.effective_date;
        if (scopedDate) {
            return String(scopedDate).slice(0, 10);
        }

        if (requestedPrcDate) {
            const lessEqualDateResult = await legacyDb.execute(sql.raw(`
                SELECT MAX(prc_date) AS effective_date
                FROM public.frs9_nominative_output
                WHERE prc_date <= '${this.escapeSqlLiteral(requestedPrcDate)}'
            `));

            const lessEqualDate = (lessEqualDateResult as any[])[0]?.effective_date;
            if (lessEqualDate) {
                return String(lessEqualDate).slice(0, 10);
            }
        }

        const latestDateResult = await legacyDb.execute(sql.raw(`
            SELECT MAX(prc_date) AS effective_date
            FROM public.frs9_nominative_output
        `));

        const latestDate = (latestDateResult as any[])[0]?.effective_date;
        return latestDate ? String(latestDate).slice(0, 10) : null;
    }

    private async resolveLatestPrcDate(
        tableName: string,
        requestedPrcDate?: string,
        extraWhere: string[] = [],
    ): Promise<string | null> {
        const whereConditions = [...extraWhere];

        if (requestedPrcDate) {
            whereConditions.push(`prc_date <= '${this.escapeSqlLiteral(requestedPrcDate)}'`);
        }

        const whereClause = whereConditions.length > 0
            ? `WHERE ${whereConditions.join(' AND ')}`
            : '';

        const effectiveDateResult = await legacyDb.execute(sql.raw(`
            SELECT MAX(prc_date) AS effective_date
            FROM ${tableName}
            ${whereClause}
        `));

        const effectiveDate = (effectiveDateResult as any[])[0]?.effective_date;
        return effectiveDate ? String(effectiveDate).slice(0, 10) : null;
    }

    private async resolveLifetimeLgdPrcDate(params?: LifetimeLGDParams): Promise<string | null> {
        const conditions: string[] = [];

        if (params?.lgd_config_id !== undefined) {
            conditions.push(`lgd_config_id = ${Number(params.lgd_config_id)}`);
        }

        if (params?.lgd_method !== undefined) {
            conditions.push(`lgd_method = ${Number(params.lgd_method)}`);
        }

        if (params?.model_id !== undefined) {
            conditions.push(`model_id = ${Number(params.model_id)}`);
        }

        return this.resolveLatestPrcDate(
            'public.frs9_imp_ca_lgd_h',
            params?.prc_date,
            conditions,
        );
    }

    private async resolveDefaultLifetimeLgdConfigId(params: LifetimeLGDParams | undefined, effectivePrcDate: string): Promise<number | null> {
        const filters = [sql`prc_date = ${effectivePrcDate}`];

        if (params?.lgd_method !== undefined) {
            filters.push(sql`lgd_method = ${Number(params.lgd_method)}`);
        }

        if (params?.model_id !== undefined) {
            filters.push(sql`model_id = ${Number(params.model_id)}`);
        }

        const result = await legacyDb.execute(sql`
            SELECT lgd_config_id
            FROM public.frs9_imp_ca_lgd_h
            WHERE ${sql.join(filters, sql` AND `)}
            ORDER BY lgd_config_id
            LIMIT 1
        `);

        const row = (result as any[])[0];
        const value = row?.lgd_config_id;
        if (value === null || value === undefined) return null;
        const asNumber = Number(value);
        return Number.isFinite(asNumber) ? asNumber : null;
    }

    private async resolveEclResultPrcDate(params?: ECLResultParams): Promise<string | null> {
        return this.resolveLatestPrcDate(
            'public.frs9_ecl_summary',
            params?.prc_date,
        );
    }

    private async resolveLifetimePdPrcDate(params?: LifetimePDParams): Promise<string | null> {
        const conditions: string[] = [];

        if (params?.pd_config_id !== undefined) {
            conditions.push(`pd_config_id = ${Number(params.pd_config_id)}`);
        }

        if (params?.pd_method !== undefined) {
            conditions.push(`model_id = ${Number(params.pd_method)}`);
        }

        if (params?.scalar_id !== undefined) {
            conditions.push(`scenario_id = ${Number(params.scalar_id)}`);
        }

        return this.resolveLatestPrcDate(
            'public.vw_frs9_pd_structure_yearly',
            params?.prc_date,
            conditions,
        );
    }

    private async resolveLifetimePdAccountDetailsPrcDate(params?: LifetimePDParams): Promise<string | null> {
        const conditions: string[] = [];

        if (params?.pd_config_id !== undefined) {
            conditions.push(`pd_config_id = ${Number(params.pd_config_id)}`);
        }

        return this.resolveLatestPrcDate(
            'public.frs9_imp_ca_result_d',
            params?.prc_date,
            conditions,
        );
    }

    private async refreshMovementData(prcDate: string) {
        try {
            await legacyDb.execute(sql`
                CALL public.sp_frs9_imp_movement_data(${prcDate}::date, ${'M'}::char, ${0}::bigint)
            `);
        } catch (error) {
            // Procedure can fail for missing period snapshots; keep existing movement rows if available.
            console.warn('⚠️ Unable to refresh movement data via SP:', error);
        }
    }

    private async fetchMovementRows(
        prcDate: string,
        segmentId?: number,
        groupSegment?: string,
        valueKind?: 'ecl' | 'gca',
    ) {
        const requestedEom = this.endOfMonth(prcDate);
        await this.refreshMovementData(requestedEom);

        const resolvedGroupSegment = await this.resolveMovementGroupSegment(segmentId, groupSegment);
        if (segmentId !== undefined && segmentId !== null && resolvedGroupSegment === null) {
            return { effectiveDate: null as string | null, rows: [] as any[] };
        }

        const whereSegment = (resolvedGroupSegment && resolvedGroupSegment.trim())
            ? sql`AND lower(group_segment) = lower(${resolvedGroupSegment.trim()})`
            : sql``;

        const sumAbsExpr = sql`
            SUM(
                abs(coalesce(stage1, 0))
                + abs(coalesce(stage2, 0))
                + abs(coalesce(stage3, 0))
                + abs(coalesce(stage1_i, 0))
                + abs(coalesce(stage2_i, 0))
                + abs(coalesce(stage3_i, 0))
                + abs(coalesce(gca_stage1, 0))
                + abs(coalesce(gca_stage2, 0))
                + abs(coalesce(gca_stage3, 0))
                + abs(coalesce(gca_stage1_i, 0))
                + abs(coalesce(gca_stage2_i, 0))
                + abs(coalesce(gca_stage3_i, 0))
                + abs(coalesce(poci, 0))
            )
        `;

        const nonZeroBeforeResult = await legacyDb.execute(sql`
            SELECT prc_date
            FROM public.frs9_imp_movement_data
            WHERE prc_date <= ${requestedEom}::date
              AND NULLIF(trim(group_segment), '') IS NOT NULL
              ${whereSegment}
            GROUP BY prc_date
            HAVING ${sumAbsExpr} > 0
            ORDER BY prc_date DESC
            LIMIT 1
        `);
        const nonZeroBefore = (nonZeroBeforeResult as any[])[0]?.prc_date;

        const nonZeroAfterResult = !nonZeroBefore ? await legacyDb.execute(sql`
            SELECT prc_date
            FROM public.frs9_imp_movement_data
            WHERE prc_date > ${requestedEom}::date
              AND NULLIF(trim(group_segment), '') IS NOT NULL
              ${whereSegment}
            GROUP BY prc_date
            HAVING ${sumAbsExpr} > 0
            ORDER BY prc_date ASC
            LIMIT 1
        `) : [];
        const nonZeroAfter = !nonZeroBefore ? (nonZeroAfterResult as any[])[0]?.prc_date : undefined;

        const fallbackMaxResult = (!nonZeroBefore && !nonZeroAfter) ? await legacyDb.execute(sql`
            SELECT MAX(prc_date) AS max_date
            FROM public.frs9_imp_movement_data
            WHERE prc_date <= ${requestedEom}::date
        `) : [];
        const fallbackMax = (!nonZeroBefore && !nonZeroAfter) ? (fallbackMaxResult as any[])[0]?.max_date : undefined;

        const effectiveDate = nonZeroBefore || nonZeroAfter || fallbackMax;
        if (!effectiveDate) {
            return { effectiveDate: null as string | null, rows: [] as any[] };
        }

        const rows = await legacyDb.execute(sql`
            SELECT
                prc_date,
                urut,
                group_segment,
                stage1,
                stage2,
                stage3,
                stage1_i,
                stage2_i,
                stage3_i,
                gca_stage1,
                gca_stage2,
                gca_stage3,
                gca_stage1_i,
                gca_stage2_i,
                gca_stage3_i,
                poci
            FROM public.frs9_imp_movement_data
            WHERE prc_date = ${effectiveDate}::date
              AND NULLIF(trim(group_segment), '') IS NOT NULL
              ${whereSegment}
            ORDER BY group_segment, urut
        `);

        return {
            effectiveDate: String(effectiveDate),
            rows: Array.from(rows as any[]),
        };
    }

    private async resolveMovementGroupSegment(
        segmentId?: number,
        groupSegment?: string,
    ): Promise<string | null | undefined> {
        if (groupSegment && groupSegment.trim()) {
            return groupSegment.trim();
        }

        if (segmentId === undefined || segmentId === null) {
            return undefined;
        }

        const segmentRow = await legacyDb
            .select({ groupSegment: frs9ParamSegmenth.groupSegment })
            .from(frs9ParamSegmenth)
            .where(eq(frs9ParamSegmenth.pkid, segmentId))
            .limit(1);

        const resolvedGroupSegment = segmentRow[0]?.groupSegment?.trim();
        return resolvedGroupSegment || null;
    }

    private getStageEcl(row: any, stage: number): number {
        if (!row) return 0;
        if (stage === 1) return this.toNumber(row.stage1) + this.toNumber(row.stage1_i);
        if (stage === 2) return this.toNumber(row.stage2) + this.toNumber(row.stage2_i);
        return this.toNumber(row.stage3) + this.toNumber(row.stage3_i);
    }

    private pickNumber(primary: unknown, fallback: unknown): number {
        if (primary !== null && primary !== undefined && primary !== '') {
            return this.toNumber(primary);
        }
        return this.toNumber(fallback);
    }

    private getStageGca(row: any, stage: number): number {
        if (!row) return 0;
        if (stage === 1) return this.pickNumber(row.gca_stage1, row.stage1) + this.pickNumber(row.gca_stage1_i, row.stage1_i);
        if (stage === 2) return this.pickNumber(row.gca_stage2, row.stage2) + this.pickNumber(row.gca_stage2_i, row.stage2_i);
        return this.pickNumber(row.gca_stage3, row.stage3) + this.pickNumber(row.gca_stage3_i, row.stage3_i);
    }

    private getRowEclTotal(row: any, stageFilter: number[] | null): number {
        if (!row) return 0;
        const stages = stageFilter ?? [1, 2, 3];
        const stageTotal = stages.reduce((sum, stage) => sum + this.getStageEcl(row, stage), 0);
        // POCI is separate in movement table and should be included only for non-filtered totals.
        const pociTotal = stageFilter ? 0 : this.toNumber(row.poci);
        return stageTotal + pociTotal;
    }

    private getRowGcaTotal(row: any, stageFilter: number[] | null): number {
        if (!row) return 0;
        const stages = stageFilter ?? [1, 2, 3];
        return stages.reduce((sum, stage) => sum + this.getStageGca(row, stage), 0);
    }

    private getRowEclTransferMagnitude(row: any, stageFilter: number[] | null): number {
        if (!row) return 0;
        const stages = stageFilter ?? [1, 2, 3];
        const stageValues = stages.map((stage) => Math.abs(this.getStageEcl(row, stage)));
        return stageValues.length > 0 ? Math.max(...stageValues) : 0;
    }

    private getMovementLabel(urut: number): string {
        const labels: Record<number, string> = {
            1: 'Beginning Balance',
            2: 'Transfer From Stage 1 to Stage 2',
            3: 'Transfer From Stage 1 to Stage 3',
            4: 'Transfer From Stage 2 to Stage 1',
            5: 'Transfer From Stage 2 to Stage 3',
            6: 'Transfer From Stage 3 to Stage 2',
            7: 'New Financial Assets',
            8: 'Change in Models',
            9: 'Modification of Contractual Cash Flow with No Derecognition',
            10: 'Derecognition / Repayments',
            11: 'Write-offs',
            12: 'Other Reclassifications',
            13: 'Foreign Currencies Effects and Other Movements',
            14: 'Ending Balance',
        };

        return labels[urut] || `Movement ${urut}`;
    }

    private buildMovementMatrixRows(
        rows: any[],
        effectiveDate: string,
        stageFilter: number[] | null,
        valueKind: 'ecl' | 'gca',
    ) {
        const numericFields = [
            'stage1', 'stage2', 'stage3',
            'stage1_i', 'stage2_i', 'stage3_i',
            'gca_stage1', 'gca_stage2', 'gca_stage3',
            'gca_stage1_i', 'gca_stage2_i', 'gca_stage3_i',
            'poci',
        ];

        const aggregatedRows = new Map<number, any>();
        for (const row of rows) {
            const urut = this.toNumber(row.urut);
            if (urut <= 0) continue;

            if (!aggregatedRows.has(urut)) {
                aggregatedRows.set(urut, { urut, prc_date: effectiveDate });
                for (const field of numericFields) {
                    aggregatedRows.get(urut)[field] = 0;
                }
            }

            const current = aggregatedRows.get(urut)!;
            for (const field of numericFields) {
                current[field] += this.toNumber(row[field]);
            }
        }

        const selectedStages = stageFilter ?? [1, 2, 3];
        const includesStage = (stage: number) => selectedStages.includes(stage);

        let useStageFieldsForGca = false;
        if (valueKind === 'gca') {
            let sumAbsGca = 0;
            let sumAbsStage = 0;
            for (const row of aggregatedRows.values()) {
                sumAbsGca += Math.abs(this.toNumber(row.gca_stage1))
                    + Math.abs(this.toNumber(row.gca_stage2))
                    + Math.abs(this.toNumber(row.gca_stage3))
                    + Math.abs(this.toNumber(row.gca_stage1_i))
                    + Math.abs(this.toNumber(row.gca_stage2_i))
                    + Math.abs(this.toNumber(row.gca_stage3_i));
                sumAbsStage += Math.abs(this.toNumber(row.stage1))
                    + Math.abs(this.toNumber(row.stage2))
                    + Math.abs(this.toNumber(row.stage3))
                    + Math.abs(this.toNumber(row.stage1_i))
                    + Math.abs(this.toNumber(row.stage2_i))
                    + Math.abs(this.toNumber(row.stage3_i));
            }
            useStageFieldsForGca = sumAbsGca === 0 && sumAbsStage > 0;
        }

        return Array.from(aggregatedRows.values())
            .sort((a, b) => this.toNumber(a.urut) - this.toNumber(b.urut))
            .map((row) => {
                const stage1Collective = valueKind === 'ecl'
                    ? (includesStage(1) ? this.toNumber(row.stage1) : 0)
                    : (includesStage(1) ? this.toNumber(useStageFieldsForGca ? row.stage1 : row.gca_stage1) : 0);
                const stage2Collective = valueKind === 'ecl'
                    ? (includesStage(2) ? this.toNumber(row.stage2) : 0)
                    : (includesStage(2) ? this.toNumber(useStageFieldsForGca ? row.stage2 : row.gca_stage2) : 0);
                const stage3Collective = valueKind === 'ecl'
                    ? (includesStage(3) ? this.toNumber(row.stage3) : 0)
                    : (includesStage(3) ? this.toNumber(useStageFieldsForGca ? row.stage3 : row.gca_stage3) : 0);
                const stage1Individual = valueKind === 'ecl'
                    ? (includesStage(1) ? this.toNumber(row.stage1_i) : 0)
                    : (includesStage(1) ? this.toNumber(useStageFieldsForGca ? row.stage1_i : row.gca_stage1_i) : 0);
                const stage2Individual = valueKind === 'ecl'
                    ? (includesStage(2) ? this.toNumber(row.stage2_i) : 0)
                    : (includesStage(2) ? this.toNumber(useStageFieldsForGca ? row.stage2_i : row.gca_stage2_i) : 0);
                const stage3Individual = valueKind === 'ecl'
                    ? (includesStage(3) ? this.toNumber(row.stage3_i) : 0)
                    : (includesStage(3) ? this.toNumber(useStageFieldsForGca ? row.stage3_i : row.gca_stage3_i) : 0);
                const poci = stageFilter ? 0 : this.toNumber(row.poci);
                const total = stage1Collective + stage2Collective + stage3Collective
                    + stage1Individual + stage2Individual + stage3Individual + poci;

                return {
                    id: `movement-${row.urut}`,
                    prc_date: effectiveDate,
                    movement_order: this.toNumber(row.urut),
                    movement: this.getMovementLabel(this.toNumber(row.urut)),
                    stage_1_collective: stage1Collective,
                    stage_2_collective: stage2Collective,
                    stage_3_collective: stage3Collective,
                    stage_1_individual: stage1Individual,
                    stage_2_individual: stage2Individual,
                    stage_3_individual: stage3Individual,
                    poci,
                    total,
                };
            });
    }

    /**
     * Transform flat PD data into pivot format (bucket_id as rows, fl_year as columns)
     * Includes cumulative_bfl and cumulative_afl per bucket from the view.
     */
    private transformToPivotYearly(data: any[], flFlag: boolean) {
        if (!data || data.length === 0) return [];

        const bucketMap = new Map<number, any>();
        const years = new Set<number>();
        // Track cumulative per bucket (taken from the last year's cumulative value)
        const cumBflMap = new Map<number, number | null>();
        const cumAflMap = new Map<number, number | null>();

        data.forEach(row => {
            const bucketId = row.bucketId ?? row.bucket_id;
            const flYear = row.flYear;
            const pdRate = flFlag
                ? (row.marginalAfl ?? row.marginalBfl)
                : (row.marginalBfl ?? row.marginalAfl);

            years.add(flYear);

            if (!bucketMap.has(bucketId)) {
                bucketMap.set(bucketId, {
                    id: bucketId,
                    bucket_id: bucketId,
                    bucket_group: `Bucket ${bucketId}`,
                });
            }

            const bucket = bucketMap.get(bucketId);
            bucket[`year_${flYear}`] = pdRate;

            // Track cumulative — last fl_year wins
            if (row.cumulativeBfl !== undefined && row.cumulativeBfl !== null) {
                cumBflMap.set(bucketId, Number(row.cumulativeBfl));
            }
            if (row.cumulativeAfl !== undefined && row.cumulativeAfl !== null) {
                cumAflMap.set(bucketId, Number(row.cumulativeAfl));
            }
        });

        // Attach cumulative values per bucket
        cumBflMap.forEach((val, bucketId) => {
            const bucket = bucketMap.get(bucketId);
            if (bucket) bucket.cumulative_bfl = val;
        });
        cumAflMap.forEach((val, bucketId) => {
            const bucket = bucketMap.get(bucketId);
            if (bucket) bucket.cumulative_afl = val;
        });

        return Array.from(bucketMap.values()).sort((a, b) => a.bucket_id - b.bucket_id);
    }

    /**
     * Transform flat PD data into pivot format (bucket_id as rows, fl_seq as columns)
     * Includes cumulative_bfl and cumulative_monthly per bucket from the view.
     */
    private transformToPivotMonthly(data: any[], flFlag: boolean) {
        if (!data || data.length === 0) return [];

        const bucketMap = new Map<number, any>();
        const cumBflMap = new Map<number, number | null>();
        const cumMonthlyMap = new Map<number, number | null>();

        data.forEach(row => {
            const bucketId = row.bucketId ?? row.bucket_id;
            const flSeq = row.flSeq;
            const pdRate = flFlag
                ? (row.marginalBfl ?? row.marginalMonthly)
                : (row.marginalMonthly ?? row.marginalBfl);

            if (!bucketMap.has(bucketId)) {
                bucketMap.set(bucketId, {
                    id: bucketId,
                    bucket_id: bucketId,
                    bucket_group: `Bucket ${bucketId}`,
                });
            }

            const bucket = bucketMap.get(bucketId);
            bucket[`month_${flSeq}`] = pdRate;

            if (row.cumulativeBfl !== undefined && row.cumulativeBfl !== null) {
                cumBflMap.set(bucketId, Number(row.cumulativeBfl));
            }
            if (row.cumulativeMonthly !== undefined && row.cumulativeMonthly !== null) {
                cumMonthlyMap.set(bucketId, Number(row.cumulativeMonthly));
            }
        });

        cumBflMap.forEach((val, bucketId) => {
            const bucket = bucketMap.get(bucketId);
            if (bucket) bucket.cumulative_bfl = val;
        });
        cumMonthlyMap.forEach((val, bucketId) => {
            const bucket = bucketMap.get(bucketId);
            if (bucket) bucket.cumulative_monthly = val;
        });

        return Array.from(bucketMap.values()).sort((a, b) => a.bucket_id - b.bucket_id);
    }

    /**
     * Get Lifetime PD Report (Yearly)
     * Queries: vw_frs9_pd_structure_yearly with pivot transformation
     */
    async getLifetimePDYearly(tenantId: string, page: number, limit: number, params?: LifetimePDParams) {
        try {
            const requestedPrcDate = params?.prc_date || '2023-12-31';
            const pdConfigId = params?.pd_config_id || 1;
            const modelId = params?.pd_method;
            const scenarioId = params?.scalar_id;
            const flFlag = params?.fl_flag ?? false;
            const effectivePrcDate = await this.resolveLifetimePdPrcDate({
                ...params,
                pd_config_id: pdConfigId,
            });

            if (!effectivePrcDate) {
                return { data: [], total: 0, page, totalPages: 0, effectivePrcDate: null };
            }

            // Build query conditions
            const conditions = [
                eq(vwPdStructureYearly.prcDate, effectivePrcDate),
                eq(vwPdStructureYearly.pdConfigId, pdConfigId),
            ];

            if (modelId !== undefined && modelId !== null) {
                conditions.push(eq(vwPdStructureYearly.modelId, modelId));
            }
            if (scenarioId !== undefined && scenarioId !== null) {
                conditions.push(eq(vwPdStructureYearly.scenarioId, scenarioId));
            }

            // Query view
            const rawData = await legacyDb
                .select()
                .from(vwPdStructureYearly)
                .where(and(...conditions))
                .orderBy(vwPdStructureYearly.bucketId, vwPdStructureYearly.flYear);

            console.log(`📊 [Lifetime PD Yearly] Retrieved ${rawData.length} raw records`);

            // Transform to pivot format with cumulative columns
            const pivotData = this.transformToPivotYearly(rawData, flFlag);

            console.log(`📊 [Lifetime PD Yearly] Transformed to ${pivotData.length} pivot rows`);

            return {
                data: pivotData,
                total: pivotData.length,
                page,
                totalPages: Math.ceil(pivotData.length / limit),
                effectivePrcDate
            };
        } catch (error) {
            console.error('❌ Error in getLifetimePDYearly service:', error);
            return { data: [], total: 0, page, totalPages: 0, effectivePrcDate: null };
        }
    }

    /**
     * Get Lifetime PD Report (Monthly)
     * Queries: vw_frs9_pd_structure_monthly with monthly pivot transformation
     */
    async getLifetimePDMonthly(tenantId: string, page: number, limit: number, params?: LifetimePDParams) {
        try {
            const requestedPrcDate = params?.prc_date || '2023-12-31';
            const pdConfigId = params?.pd_config_id || 1;
            const modelId = params?.pd_method;
            const scenarioId = params?.scalar_id;
            const flFlag = params?.fl_flag ?? false;
            const effectivePrcDate = await this.resolveLifetimePdPrcDate({
                ...params,
                pd_config_id: pdConfigId,
            });

            console.log('📊 [Lifetime PD Monthly] Fetching with params:', {
                requestedPrcDate,
                effectivePrcDate,
                pdConfigId,
                modelId,
                scenarioId,
                flFlag,
            });

            if (!effectivePrcDate) {
                return { data: [], total: 0, page, totalPages: 0, effectivePrcDate: null };
            }

            // Build query conditions
            const conditions = [
                eq(vwPdStructureMonthly.prcDate, effectivePrcDate),
                eq(vwPdStructureMonthly.pdConfigId, pdConfigId),
            ];

            if (modelId !== undefined && modelId !== null) {
                conditions.push(eq(vwPdStructureMonthly.pdModelId, modelId));
            }
            if (scenarioId !== undefined && scenarioId !== null) {
                conditions.push(eq(vwPdStructureMonthly.scenarioId, scenarioId));
            }

            // Query view
            const rawData = await legacyDb
                .select()
                .from(vwPdStructureMonthly)
                .where(and(...conditions))
                .orderBy(vwPdStructureMonthly.bucketId, vwPdStructureMonthly.flSeq);

            console.log(`📊 [Lifetime PD Monthly] Retrieved ${rawData.length} raw records`);

            // Transform to pivot format with cumulative columns
            const pivotData = this.transformToPivotMonthly(rawData, flFlag);

            console.log(`📊 [Lifetime PD Monthly] Transformed to ${pivotData.length} pivot rows`);

            return {
                data: pivotData,
                total: pivotData.length,
                page,
                totalPages: Math.ceil(pivotData.length / limit),
                effectivePrcDate
            };
        } catch (error) {
            console.error('❌ Error in getLifetimePDMonthly service:', error);

            return { data: [], total: 0, page, totalPages: 0, effectivePrcDate: null };
        }
    }

    /**
     * Get Lifetime PD Account Details
     * Queries: frs9_imp_ca_result_d joined with frs9_account_id
     */
    async getLifetimePDAccountDetails(tenantId: string, page: number, limit: number, params?: LifetimePDParams) {
        try {
            const requestedPrcDate = params?.prc_date || '2023-12-31';
            const pdConfigId = params?.pd_config_id;
            const effectivePrcDate = await this.resolveLifetimePdAccountDetailsPrcDate(params);
            
            console.log('📊 [Lifetime PD Account Details] Fetching with params:', {
                requestedPrcDate,
                effectivePrcDate,
                pdConfigId,
            });

            if (!effectivePrcDate) {
                return { data: [], total: 0, page, totalPages: 0, effectivePrcDate: null };
            }

            const conditions = [
                eq(frs9ImpCaResultD.prcDate, effectivePrcDate)
            ];

            if (pdConfigId !== undefined) {
                conditions.push(eq(frs9ImpCaResultD.pdConfigId, pdConfigId));
            }

            const rawData = await legacyDb
                .select({
                    account_number: frs9AccountId.accountNumber,
                    cif_name: frs9AccountId.cifName,
                    facility_number: frs9AccountId.facilityNumber,
                    stage: frs9ImpCaResultD.stage,
                    outstanding: frs9ImpCaResultD.eqvOutstanding,
                    pd_rate: frs9ImpCaResultD.pd,
                    ecl_amount: frs9ImpCaResultD.eclBfl
                })
                .from(frs9ImpCaResultD)
                .innerJoin(frs9AccountId, eq(frs9ImpCaResultD.accountId, frs9AccountId.accountId))
                .where(and(...conditions))
                .limit(limit)
                .offset((page - 1) * limit);

            // Get total count (simple count query is faster)
            const countResult = await legacyDb
                .select({ count: sql<number>`count(*)` })
                .from(frs9ImpCaResultD)
                .where(and(...conditions));
            
            const total = Number(countResult[0]?.count || 0);

            console.log(`📊 [Lifetime PD Account Details] Retrieved ${rawData.length} rows, Total: ${total}`);

            return {
                data: rawData,
                total: total,
                page,
                totalPages: Math.ceil(total / limit),
                effectivePrcDate
            };
        } catch (error) {
            console.error('❌ Error in getLifetimePDAccountDetails service:', error);
            return { data: [], total: 0, page, totalPages: 0, effectivePrcDate: null };
        }
    }

    /**
     * Get ECL Result Report
     * SQL Script aligned with tech spec workbook row 487:
     * aggregates directly from FRS9_MASTER_ACCOUNT.
     */
    async getECLResult(tenantId: string, page: number, limit: number, params?: ECLResultParams) {
        try {
            const requestedPrcDate = params?.prc_date || '2023-12-31';
            const segmentId = params?.segment_id;
            const stage = params?.stage;
            const stageFilter = this.normalizeStageFilter(stage);
            const effectivePrcDate = await this.resolveEclResultPrcDate(params);

            console.log('📊 [ECL Result] Fetching with params:', { requestedPrcDate, effectivePrcDate, segmentId, stage, stageFilter });

            if (!effectivePrcDate) {
                return {
                    data: [],
                    total: 0,
                    page,
                    totalPages: 0,
                    effectivePrcDate: null,
                    debug: {
                        sourceTables: ['public.frs9_ecl_summary'],
                        queryName: 'ifrs9_reports.ecl_result',
                        queryMode: 'techspec-master-account',
                        fallbackUsed: false,
                        emptyReason: 'No snapshot found in public.frs9_ecl_summary for the requested processing date or earlier snapshot.',
                    },
                };
            }

            let whereClause = `prc_date = '${this.escapeSqlLiteral(effectivePrcDate)}'`;
            if (segmentId !== undefined && segmentId !== null) {
                whereClause += ` AND segment_id = ${segmentId}`;
            }

            if (stageFilter) {
                const stageList = stageFilter.map((s) => `'${String(s)}'`).join(',');
                whereClause += ` AND stage IN (${stageList})`;
            }

            const accountStatus = params?.account_status;
            if (accountStatus) {
                const statusList = (Array.isArray(accountStatus) ? accountStatus : [accountStatus])
                    .map((s) => `'${this.escapeSqlLiteral(String(s))}'`)
                    .join(',');
                whereClause += ` AND account_status IN (${statusList})`;
            }

            const rawData = await legacyDb.execute(sql.raw(`
                SELECT 
                    prc_date AS period,
                    account_status,
                    branch_code,
                    segment_id,
                    group_segment,
                    segment,
                    sub_segment,
                    currency,
                    impaired_flag,
                    impaired_status,
                    bucket_id,
                    stage,
                    SUM(noa) AS account_count,
                    SUM(CAST(outstanding AS DECIMAL)) AS outstanding,
                    SUM(CAST(accrued_interest AS DECIMAL)) AS accrued_interest,
                    SUM(CAST(ecl_ca_onbs_amt AS DECIMAL)) AS ecl_ca_onbs_amt,
                    SUM(CAST(ecl_ca_offbs_amt AS DECIMAL)) AS ecl_ca_offbs_amt,
                    SUM(CAST(ecl_ia_amt AS DECIMAL)) AS ecl_ia_onbs_amt,
                    SUM(CAST(ecl_final_amt AS DECIMAL)) AS ecl_final_amt,
                    CASE
                        WHEN SUM(CAST(outstanding AS DECIMAL)) = 0 THEN 0
                        ELSE SUM(CAST(ecl_final_amt AS DECIMAL)) / NULLIF(SUM(CAST(outstanding AS DECIMAL)), 0)
                    END AS ecl_coverage
                FROM public.frs9_ecl_summary
                WHERE ${whereClause}
                GROUP BY 
                    prc_date,
                    account_status,
                    branch_code,
                    segment_id,
                    group_segment,
                    segment,
                    sub_segment,
                    currency,
                    impaired_flag,
                    impaired_status,
                    bucket_id,
                    stage
                ORDER BY segment_id, stage, branch_code, currency
            `));

            const rows = Array.from(rawData as any[]);

            console.log(`📊 [ECL Result] Retrieved ${rows.length} aggregated records`);

            // Add id field for DataGrid
            const data = rows.map((row, index) => ({
                id: index + 1,
                ...row
            }));

            const filteredData = this.filterEclResultRows(
                data,
                params?.search,
                params?.detailFilters,
            );
            const sortedData = this.sortEclResultRows(filteredData, params?.sort);
            const startIndex = (page - 1) * limit;
            const paginatedData = sortedData.slice(startIndex, startIndex + limit);

            const summaryStats = sortedData.reduce((acc, row) => {
                const outstanding = Number(row.outstanding) || 0;
                const eclFinalAmt = Number(row.ecl_final_amt) || 0;
                const stageRaw = String(row.stage ?? '1').trim().toLowerCase();
                
                acc.totalOutstanding += outstanding;
                acc.totalECL += eclFinalAmt;
                
                if (stageRaw.includes('1')) {
                    acc.stage1Outstanding += outstanding;
                    acc.stage1ECL += eclFinalAmt;
                } else if (stageRaw.includes('2')) {
                    acc.stage2Outstanding += outstanding;
                    acc.stage2ECL += eclFinalAmt;
                } else if (stageRaw.includes('3')) {
                    acc.stage3Outstanding += outstanding;
                    acc.stage3ECL += eclFinalAmt;
                }
                
                return acc;
            }, {
                totalOutstanding: 0,
                totalECL: 0,
                stage1Outstanding: 0,
                stage1ECL: 0,
                stage2Outstanding: 0,
                stage2ECL: 0,
                stage3Outstanding: 0,
                stage3ECL: 0
            });

            return {
                data: paginatedData,
                total: sortedData.length,
                page,
                totalPages: Math.ceil(sortedData.length / limit),
                summary: {
                    ...summaryStats,
                    detailRows: sortedData
                },
                effectivePrcDate,
                debug: {
                    sourceTables: ['public.frs9_ecl_summary'],
                    queryName: 'ifrs9_reports.ecl_result',
                    queryMode: 'techspec-master-account',
                    fallbackUsed: false,
                    emptyReason: sortedData.length === 0
                        ? `No aggregated rows returned from public.frs9_ecl_summary for snapshot ${effectivePrcDate}.`
                        : null,
                },
            };
        } catch (error) {
            console.error('❌ Error in getECLResult service:', error);
            return { data: [], total: 0, page, totalPages: 0, effectivePrcDate: null };
        }
    }

    /**
     * Get Nominative Report (Detailed Account Level)
     * Queries: frs9_imp_nominative joined with frs9_master_account (branch enrichment)
     */
    async getNominativeReport(
        tenantId: string,
        page: number,
        limit: number,
        params?: {
            prc_date?: string,
            download_start_date?: string,
            download_end_date?: string,
            group_segment?: string[] | string,
            segment?: string[] | string,
            stage?: string | string[],
            branch_code?: string[] | string,
            cursor?: string,
            paginationMode?: 'offset' | 'cursor',
            sort?: Array<{ field: string, direction: 'asc' | 'desc' }>
        }
    ) {
        try {
            const requestedPrcDate = params?.prc_date || new Date().toISOString().slice(0, 10);
            const downloadStartDate = params?.download_start_date;
            const downloadEndDate = params?.download_end_date;
            const segmentValues = this.normalizeTextFilter(params?.segment);
            const stageValues = this.normalizeStageFilter(params?.stage);
            const branchValues = this.normalizeTextFilter(params?.branch_code);

            const effectivePrcDate = await this.resolveNominativePrcDate(
                requestedPrcDate,
                downloadStartDate,
                downloadEndDate,
            );

            console.log('📊 [Nominative Report] Fetching with params:', {
                requestedPrcDate,
                effectivePrcDate,
                downloadStartDate,
                downloadEndDate,
                segmentValues,
                stageValues,
                branchValues
            });

            if (!effectivePrcDate) {
                return {
                    data: [],
                    total: 0,
                    summary: {
                        totalOutstanding: 0,
                        totalECL: 0
                    },
                    page,
                    totalPages: 0,
                    effectivePrcDate: null
                };
            }

            const stageNumericExpression = `COALESCE(NULLIF(regexp_replace(lower(COALESCE(n.stage::text, '')), '[^0-9]', '', 'g'), '')::int, 1)`;
            let whereClause = `n.prc_date = '${this.escapeSqlLiteral(effectivePrcDate)}'`;

            if (segmentValues) {
                const segmentList = segmentValues
                    .map((value) => `'${this.escapeSqlLiteral(value)}'`)
                    .join(',');
                whereClause += ` AND COALESCE(NULLIF(n.segment, ''), '') IN (${segmentList})`;
            }

            if (stageValues) {
                const stageList = stageValues.join(',');
                whereClause += ` AND ${stageNumericExpression} IN (${stageList})`;
            }

            if (branchValues) {
                const branchList = branchValues
                    .map((value) => `'${this.escapeSqlLiteral(value)}'`)
                    .join(',');
                whereClause += ` AND COALESCE(NULLIF(n.branch_code, ''), '') IN (${branchList})`;
            }

            const sort = params?.sort?.[0] ?? { field: 'account_number', direction: 'asc' };
            const sortMap: Record<string, { expression: string, resultKey: string, numeric?: boolean }> = {
                pkid: { expression: 'COALESCE(n.pkid, 0)', resultKey: 'pkid', numeric: true },
                prc_date: { expression: 'n.prc_date', resultKey: 'prc_date' },
                account_id: { expression: 'COALESCE(n.account_id, 0)', resultKey: 'account_id', numeric: true },
                account_number: { expression: 'n.account_number', resultKey: 'account_number' },
                facility_number: { expression: `COALESCE(n.facility_number, '')`, resultKey: 'facility_number' },
                cif_number: { expression: `COALESCE(n.cif_number, '')`, resultKey: 'cif_number' },
                cif_name: { expression: 'n.cif_name', resultKey: 'cif_name' },
                account_status: { expression: `COALESCE(n.account_status, '')`, resultKey: 'account_status' },
                branch_code: { expression: `COALESCE(n.branch_code, '')`, resultKey: 'branch_code' },
                prd_code: { expression: `COALESCE(n.prd_code, '')`, resultKey: 'prd_code' },
                start_date: { expression: 'n.start_date', resultKey: 'start_date' },
                maturity_date: { expression: 'n.maturity_date', resultKey: 'maturity_date' },
                currency: { expression: `COALESCE(n.currency, '')`, resultKey: 'currency' },
                interest_rate: { expression: 'COALESCE(n.interest_rate, 0)', resultKey: 'interest_rate', numeric: true },
                eff_interest_rate: { expression: 'COALESCE(n.eff_interest_rate, 0)', resultKey: 'eff_interest_rate', numeric: true },
                dpd: { expression: 'COALESCE(n.dpd, 0)', resultKey: 'dpd', numeric: true },
                impaired_status: { expression: `COALESCE(n.impaired_status::text, '')`, resultKey: 'impaired_status' },
                segment: { expression: `COALESCE(n.segment, '')`, resultKey: 'segment' },
                stage: { expression: stageNumericExpression, resultKey: 'stage', numeric: true },
                bucket_id: { expression: 'COALESCE(n.bucket_id, 0)', resultKey: 'bucket_id', numeric: true },
                outstanding: { expression: 'CAST(n.outstanding AS DECIMAL)', resultKey: 'outstanding', numeric: true },
                ecl_final_amt: { expression: 'CAST(n.ecl_final_amt AS DECIMAL)', resultKey: 'ecl_final_amt', numeric: true },
                ecl_coverage: { expression: 'COALESCE(n.ecl_coverage, 0)', resultKey: 'ecl_coverage', numeric: true },
            };
            const sortConfig = sortMap[sort.field] ?? sortMap.account_number;
            const sortDirection = sort.direction === 'desc' ? 'DESC' : 'ASC';
            const cursorPayload = decodeCursor(params?.cursor);
            let cursorClause = '';

            if ((params?.paginationMode === 'cursor' || params?.cursor) && cursorPayload?.sortValue !== undefined && cursorPayload?.accountId !== undefined) {
                const operator = sort.direction === 'desc' ? '<' : '>';
                const tieOperator = sort.direction === 'desc' ? '<' : '>';
                const sortValue = sortConfig.numeric
                    ? String(Number(cursorPayload.sortValue))
                    : `'${this.escapeSqlLiteral(String(cursorPayload.sortValue))}'`;
                const accountIdValue = Number(cursorPayload.accountId);
                const facilityValue = `'${this.escapeSqlLiteral(String(cursorPayload.facilityNumber ?? ''))}'`;
                cursorClause = `
                    AND (
                        ${sortConfig.expression} ${operator} ${sortValue}
                        OR (
                            ${sortConfig.expression} = ${sortValue}
                            AND (
                                n.account_id ${tieOperator} ${accountIdValue}
                                OR (
                                    n.account_id = ${accountIdValue}
                                    AND COALESCE(n.facility_number, '') ${tieOperator} ${facilityValue}
                                )
                            )
                        )
                    )
                `;
            }

            const offset = Math.max(0, (page - 1) * limit);
            const rowLimit = (params?.paginationMode === 'cursor' || params?.cursor) ? limit + 1 : limit;
            const rowOffset = (params?.paginationMode === 'cursor' || params?.cursor) ? 0 : offset;

            const rawData = await legacyDb.execute(sql.raw(`
                SELECT 
                    n.pkid,
                    n.prc_date,
                    n.account_id,
                    n.account_number,
                    n.facility_number,
                    n.cif_number,
                    n.cif_name,
                    n.account_status,
                    n.branch_code,
                    n.prd_code,
                    n.start_date,
                    n.maturity_date,
                    n.currency,
                    n.interest_rate,
                    n.eff_interest_rate,
                    n.dpd,
                    n.impaired_status,
                    n.segment,
                    ${stageNumericExpression} AS stage,
                    n.bucket_id,
                    CAST(n.outstanding AS DECIMAL) AS outstanding,
                    CAST(n.ecl_final_amt AS DECIMAL) AS ecl_final_amt,
                    CAST(n.ecl_coverage AS DOUBLE PRECISION) AS ecl_coverage
                FROM public.frs9_nominative_output n
                WHERE ${whereClause}
                ${cursorClause}
                ORDER BY ${sortConfig.expression} ${sortDirection}, n.account_id ${sortDirection}, COALESCE(n.facility_number, '') ${sortDirection}
                LIMIT ${rowLimit}
                OFFSET ${rowOffset}
            `));

            const allRows = Array.from(rawData as any[]);
            const hasNextPage = (params?.paginationMode === 'cursor' || params?.cursor) && allRows.length > limit;
            const rows = hasNextPage ? allRows.slice(0, limit) : allRows;
            console.log(`📊 [Nominative Report] Retrieved ${rows.length} records`);

            // Add id field for DataGrid
            const data = rows.map((row, index) => ({
                id: params?.paginationMode === 'cursor' || params?.cursor
                    ? `${row.pkid ?? row.account_id}-${row.facility_number ?? index}`
                    : offset + index + 1,
                ...row
            }));

            // Get total count and summary stats
            const summaryResult = await legacyDb.execute(sql.raw(`
                SELECT 
                    COUNT(*) as total,
                    COALESCE(SUM(CAST(n.outstanding AS DECIMAL)), 0) as total_outstanding,
                    COALESCE(SUM(CAST(n.ecl_final_amt AS DECIMAL)), 0) as total_ecl
                FROM public.frs9_nominative_output n
                WHERE ${whereClause}
            `));

            const summaryRow = (summaryResult as any[])[0] || {};
            const total = Number(summaryRow.total || 0);

            return {
                data,
                total,
                summary: {
                    totalOutstanding: Number(summaryRow.total_outstanding || 0),
                    totalECL: Number(summaryRow.total_ecl || 0)
                },
                page,
                totalPages: Math.ceil(total / limit),
                effectivePrcDate,
                nextCursor: hasNextPage && rows.length > 0
                    ? encodeCursor({
                        field: sort.field,
                        direction: sort.direction,
                        sortValue: rows[rows.length - 1][sortConfig.resultKey],
                        accountId: rows[rows.length - 1].account_id,
                        facilityNumber: rows[rows.length - 1].facility_number ?? '',
                    })
                    : null,
                previousCursor: params?.cursor ?? null,
                hasNextPage,
                hasPreviousPage: Boolean(params?.cursor),
            };
        } catch (error) {
            console.error('❌ Error in getNominativeReport service:', error);
            return {
                data: [],
                total: 0,
                summary: {
                    totalOutstanding: 0,
                    totalECL: 0
                },
                page,
                totalPages: 0,
                effectivePrcDate: null
            };
        }
    }

    async getNominativeAvailableDates(
        tenantId: string,
        params?: {
            download_start_date?: string
            download_end_date?: string
            limit?: number
        }
    ) {
        try {
            const downloadStartDate = params?.download_start_date
            const downloadEndDate = params?.download_end_date
            const limit = Math.min(Math.max(Number(params?.limit || 120), 1), 500)

            const whereConditions: string[] = []
            if (downloadStartDate) {
                whereConditions.push(`prc_date >= '${this.escapeSqlLiteral(downloadStartDate)}'`)
            }
            if (downloadEndDate) {
                whereConditions.push(`prc_date <= '${this.escapeSqlLiteral(downloadEndDate)}'`)
            }

            const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : ''

            const rawData = await legacyDb.execute(sql.raw(`
                SELECT
                    prc_date,
                    COUNT(*)::bigint AS total_accounts,
                    COALESCE(SUM(CAST(outstanding AS DECIMAL)), 0) AS total_outstanding,
                    COALESCE(SUM(CAST(ecl_final_amt AS DECIMAL)), 0) AS total_ecl
                FROM public.frs9_nominative_output
                ${whereClause}
                GROUP BY prc_date
                ORDER BY prc_date DESC
                LIMIT ${limit}
            `))

            const rows = Array.from(rawData as any[]).map((row) => ({
                prc_date: String(row.prc_date).slice(0, 10),
                total_accounts: Number(row.total_accounts || 0),
                total_outstanding: Number(row.total_outstanding || 0),
                total_ecl: Number(row.total_ecl || 0),
            }))

            return { data: rows }
        } catch (error) {
            console.error('❌ Error in getNominativeAvailableDates service:', error)
            return { data: [] as any[] }
        }
    }

    /**
     * Get Lifetime LGD Detail Report (Account Level with Recovery Pivot)
     * Queries: frs9_account_id + frs9_imp_ca_lgd_data + frs9_imp_ca_lgd_rec_d
     * Implements pivot on SEQ for recovery sequences
     */
    async getLifetimeLGDDetail(tenantId: string, page: number, limit: number, params?: LifetimeLGDParams) {
        try {
            const requestedPrcDate = params?.prc_date || '2023-12-31';
            let lgdConfigId = params?.lgd_config_id;
            const lgdMethod = params?.lgd_method;
            const segmentId = params?.segment_id;
            const flFlag = params?.fl_flag;
            let effectivePrcDate: string | null = null;

            if (lgdConfigId === undefined || lgdConfigId === null) {
                const conditions: string[] = [];
                if (params?.lgd_method !== undefined) {
                    conditions.push(`lgd_method = ${Number(params.lgd_method)}`);
                }
                if (params?.model_id !== undefined) {
                    conditions.push(`model_id = ${Number(params.model_id)}`);
                }

                effectivePrcDate = await this.resolveLatestPrcDate(
                    'public.frs9_imp_ca_lgd_h',
                    requestedPrcDate,
                    conditions,
                );

                if (!effectivePrcDate) {
                    return { data: [], total: 0, page, totalPages: 0, effectivePrcDate: null };
                }

                const resolvedConfigId = await this.resolveDefaultLifetimeLgdConfigId(params, effectivePrcDate);
                lgdConfigId = resolvedConfigId ?? 1;
            } else {
                effectivePrcDate = await this.resolveLifetimeLgdPrcDate({
                    ...params,
                    lgd_config_id: Number(lgdConfigId),
                });
                lgdConfigId = Number(lgdConfigId);
            }

            console.log('📊 [Lifetime LGD Detail] Fetching with params:', {
                requestedPrcDate,
                effectivePrcDate,
                lgdConfigId,
                lgdMethod,
                paramsModelId: params?.model_id,
                segmentId,
                flFlag,
            });

            if (!effectivePrcDate) {
                return { data: [], total: 0, page, totalPages: 0, effectivePrcDate: null };
            }

            // Tech spec uses B.PRC_DATE <= @DATE for the account-level detail set.
            // Header rows can exist for a later run period than the LGD account data, so an equality
            // filter here incorrectly hides all detail and falls back to summary-only output.
            const filters = [
                sql`B.prc_date <= ${effectivePrcDate}`,
                sql`B.lgd_config_id = ${lgdConfigId}`,
            ];

            if (lgdMethod !== undefined) {
                filters.push(sql`B.lgd_method = ${lgdMethod}`);
            }

            if (segmentId !== undefined) {
                filters.push(sql`F.segment_id = ${segmentId}`);
            }

            if (flFlag !== undefined) {
                filters.push(sql`COALESCE(F.fl_flag, false) = ${flFlag}`);
            }

            const rawData = await legacyDb.execute(sql`
                WITH recovery AS (
                    SELECT
                        account_id,
                        lgd_config_id,
                        seq,
                        SUM(COALESCE(npv_eqv_rec, 0)) AS pv_recovery
                    FROM public.frs9_imp_ca_lgd_rec_d
                    WHERE prc_date <= ${effectivePrcDate}
                    AND lgd_config_id = ${lgdConfigId}
                    ${lgdMethod !== undefined ? sql`AND lgd_method = ${lgdMethod}` : sql``}
                    GROUP BY account_id, lgd_config_id, seq
                ),
                latest_metric_dates AS (
                    SELECT
                        account_id,
                        lgd_config_id,
                        MAX(prc_date) AS prc_date
                    FROM public.frs9_imp_ca_lgd_d
                    WHERE prc_date <= ${effectivePrcDate}
                    AND lgd_config_id = ${lgdConfigId}
                    ${lgdMethod !== undefined ? sql`AND lgd_method = ${lgdMethod}` : sql``}
                    GROUP BY account_id, lgd_config_id
                ),
                latest_metrics AS (
                    SELECT DISTINCT ON (metric.account_id, metric.lgd_config_id)
                        metric.account_id,
                        metric.lgd_config_id,
                        metric.lgd,
                        metric.rec_rate,
                        metric.npv_eqv_rec
                    FROM public.frs9_imp_ca_lgd_d metric
                    INNER JOIN latest_metric_dates latest
                        ON metric.account_id = latest.account_id
                        AND metric.lgd_config_id = latest.lgd_config_id
                        AND metric.prc_date = latest.prc_date
                    WHERE metric.lgd_config_id = ${lgdConfigId}
                    ${lgdMethod !== undefined ? sql`AND metric.lgd_method = ${lgdMethod}` : sql``}
                    ORDER BY metric.account_id, metric.lgd_config_id, metric.prc_date DESC
                )
                SELECT 
                    A.account_id,
                    A.account_number,
                    A.cif_name,
                    B.prc_date AS first_npl_date,
                    B.eqv_at_default AS os_at_default,
                    B.eir_at_default AS eir_at_default,
                    D.lgd AS lgd_rate,
                    D.rec_rate AS recovery_rate,
                    D.npv_eqv_rec AS recovery_amount_pv,
                    C.seq,
                    C.pv_recovery
                FROM public.frs9_account_id A
                INNER JOIN public.frs9_imp_ca_lgd_data B ON A.account_id = B.account_id
                INNER JOIN recovery C ON B.account_id = C.account_id
                    AND B.lgd_config_id = C.lgd_config_id
                LEFT JOIN latest_metrics D ON B.account_id = D.account_id
                    AND B.lgd_config_id = D.lgd_config_id
                LEFT JOIN public.frs9_imp_ca_lgd_config F ON B.lgd_config_id = F.pkid
                WHERE ${sql.join(filters, sql` AND `)}
                ORDER BY A.account_number, C.seq
            `);

            const rows = Array.from(rawData as any[]);
            console.log(`📊 [Lifetime LGD Detail] Retrieved ${rows.length} raw records`);

            // Transform to pivot format (account as rows, seq as columns)
            const pivotData = this.transformLgdToPivot(rows as any[]);

            console.log(`📊 [Lifetime LGD Detail] Transformed to ${pivotData.length} pivot rows`);

            const filteredData = this.filterLifetimeLgdRows(
                pivotData,
                params?.search,
                params?.detailFilters,
            );
            const sortedData = this.sortLifetimeLgdRows(filteredData, params?.sort);

            // Apply pagination (in-memory slicing)
            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + limit;
            const paginatedData = sortedData.slice(startIndex, endIndex);

            return {
                data: paginatedData,
                total: sortedData.length,
                page,
                totalPages: Math.ceil(sortedData.length / limit),
                effectivePrcDate
            };
        } catch (error) {
            console.error('❌ Error in getLifetimeLGDDetail service:', error);
            // Re-throw error to be handled by controller, or return empty structure
            // Returning empty structure is safer to avoid 500 crashing the UI completely
            return { data: [], total: 0, page, totalPages: 0, effectivePrcDate: null };
        }
    }

    /**
     * Transform LGD data to pivot format (account as rows, seq as columns)
     */
    private transformLgdToPivot(data: any[]) {
        if (!data || data.length === 0) return [];

        const accountMap = new Map<string, any>();

        data.forEach(row => {
            const accountNumber = row.account_number;
            const accountId = row.account_id;
            const seq = row.seq;
            const pvRecovery = this.toNumber(row.pv_recovery);
            const key = accountId ?? accountNumber;

            if (!accountMap.has(key)) {
                accountMap.set(key, {
                    id: key,
                    account_id: accountId,
                    account_number: accountNumber,
                    cif_name: row.cif_name,
                    first_npl_date: row.first_npl_date,
                    os_at_default: row.os_at_default,
                    eir_at_default: row.eir_at_default,
                    lgd_rate: row.lgd_rate,
                    recovery_rate: row.recovery_rate,
                    recovery_amount_pv: row.recovery_amount_pv
                });
            }

            const account = accountMap.get(key);
            const seqKey = `seq_${seq}`;
            account[seqKey] = this.toNumber(account[seqKey]) + pvRecovery;
        });

        return Array.from(accountMap.values());
    }

    /**
     * Get Lifetime LGD Summary Report
     * Queries: frs9_imp_ca_lgd_h + frs9_imp_ca_lgd_config
     */
    async getLifetimeLGDSummary(tenantId: string, page: number, limit: number, params?: LifetimeLGDParams) {
        try {
            const requestedPrcDate = params?.prc_date || '2023-12-31';
            let lgdConfigId = params?.lgd_config_id;
            let effectivePrcDate: string | null = null;

            if (lgdConfigId === undefined || lgdConfigId === null) {
                const conditions: string[] = [];
                if (params?.lgd_method !== undefined) {
                    conditions.push(`lgd_method = ${Number(params.lgd_method)}`);
                }
                if (params?.model_id !== undefined) {
                    conditions.push(`model_id = ${Number(params.model_id)}`);
                }

                effectivePrcDate = await this.resolveLatestPrcDate(
                    'public.frs9_imp_ca_lgd_h',
                    requestedPrcDate,
                    conditions,
                );

                if (!effectivePrcDate) {
                    return { data: [], total: 0, page, totalPages: 0, effectivePrcDate: null };
                }

                const resolvedConfigId = await this.resolveDefaultLifetimeLgdConfigId(params, effectivePrcDate);
                lgdConfigId = resolvedConfigId ?? 1;
            } else {
                effectivePrcDate = await this.resolveLifetimeLgdPrcDate({
                    ...params,
                    lgd_config_id: Number(lgdConfigId),
                });
                lgdConfigId = Number(lgdConfigId);
            }

            console.log('📊 [Lifetime LGD Summary] Fetching with params:', { requestedPrcDate, effectivePrcDate, lgdConfigId });

            if (!effectivePrcDate) {
                return { data: [], total: 0, page, totalPages: 0, effectivePrcDate: null };
            }

            // Matching SQL:
            // SELECT PRC_DATE AS PERIOD, B.LGD_MODEL_NAME AS LGD_MODEL, EQV_OS AS TOTAL_EAD,
            //        NPV_EQV_REC AS TOTAL_PV_RECOVERY, REC_RATE, LGD AS LGD_RATE
            // FROM FRS9_IMP_CA_LGD_H A INNER JOIN FRS9_IMP_CA_LGD_CONFIG B ON A.LGD_CONFIG_ID = B.PKID
            // WHERE PRC_DATE = @DATE AND LGD_CONFIG_ID = @LGD_CONFIG_ID
            const rawData = await legacyDb.execute(sql`
                SELECT 
                    A.prc_date AS period,
                    B.lgd_model_name AS lgd_model,
                    A.noa,
                    A.eqv_os AS total_ead,
                    A.npv_eqv_rec AS total_pv_recovery,
                    A.rec_rate,
                    A.lgd AS lgd_rate
                FROM public.frs9_imp_ca_lgd_h A
                INNER JOIN public.frs9_imp_ca_lgd_config B ON A.lgd_config_id = B.pkid
                WHERE A.prc_date = ${effectivePrcDate}
                AND A.lgd_config_id = ${lgdConfigId}
            `);

            const rows = Array.from(rawData as any[]);
            console.log(`📊 [Lifetime LGD Summary] Retrieved ${rows.length} records`);

            // Add id field for DataGrid
            const data = (rows as any[]).map((row, index) => ({
                id: index + 1,
                ...row
            }));

            return {
                data,
                total: data.length,
                page,
                totalPages: Math.ceil(data.length / limit),
                effectivePrcDate
            };
        } catch (error) {
            console.error('❌ Error in getLifetimeLGDSummary service:', error);
            return { data: [], total: 0, page, totalPages: 0, effectivePrcDate: null };
        }
    }

    /**
     * Get EAD Model Report (Payment Average by Tenor)
     * SQL: 
     * ```sql
     * SELECT TENOR AS [LT/MONTH], COUNTER AS SEQ, PAYM_AVG
     * FROM FRS9_IMP_CA_EAD_PAYM_AVG A 
     * WHERE A.PRC_DATE = :PRC_DATE AND A.SEGMENT_ID = :EAD_CONFIG_ID
     * PIVOT (SUM(PAYM_AVG) FOR SEQ IN (...))
     * ```
     */
    private async resolveEadReportSegmentId(params?: EADModelParams): Promise<number | undefined> {
        if (params?.ead_config_id !== undefined && params.ead_config_id !== null) {
            const legacySelectedId = Number(params.ead_config_id);
            if (Number.isFinite(legacySelectedId)) {
                return legacySelectedId;
            }
        }

        const explicitSegmentId = Number(params?.segment_id);
        return Number.isFinite(explicitSegmentId) ? explicitSegmentId : undefined;
    }

    async getEADModel(tenantId: string, page: number, limit: number, params?: EADModelParams) {
        try {
            const requestedPrcDate = params?.prc_date || '2023-12-31';
            const requestedSegmentId = await this.resolveEadReportSegmentId(params);

            const extraWhere: string[] = [];
            if (requestedSegmentId !== undefined && requestedSegmentId !== null) {
                extraWhere.push(`segment_id = ${Number(requestedSegmentId)}`);
            }

            const prcDate = await this.resolveLatestPrcDate(
                'public.frs9_imp_ca_ead_paym_avg',
                requestedPrcDate,
                extraWhere,
            );

            if (!prcDate) {
                return { data: [], total: 0, page, totalPages: 0, effectivePrcDate: null };
            }

            // First, determine which segment ID actually has data for this date
            const segmentsQuery = await legacyDb
                .select({ segmentId: frs9ImpCaEadPaymAvg.segmentId })
                .from(frs9ImpCaEadPaymAvg)
                .where(eq(frs9ImpCaEadPaymAvg.prcDate, prcDate))
                .groupBy(frs9ImpCaEadPaymAvg.segmentId)
                .orderBy(frs9ImpCaEadPaymAvg.segmentId);

            const activeSegments = segmentsQuery.map(s => s.segmentId);
            const segmentId = requestedSegmentId ?? (activeSegments.length > 0 ? activeSegments[0]! : null);

            if (segmentId === null) {
                return { data: [], total: 0, page, totalPages: 0, effectivePrcDate: prcDate };
            }

            console.log('📊 [EAD Model] Fetching with params:', {
                prcDate,
                requestedSegmentId,
                segmentId,
                activeSegments
            });

            // Query frs9_imp_ca_ead_paym_avg matching SQL script
            const conditions = [
                eq(frs9ImpCaEadPaymAvg.prcDate, prcDate),
                eq(frs9ImpCaEadPaymAvg.segmentId, segmentId)
            ];

            const rawData = await legacyDb
                .select()
                .from(frs9ImpCaEadPaymAvg)
                .where(and(...conditions))
                .orderBy(frs9ImpCaEadPaymAvg.tenor, frs9ImpCaEadPaymAvg.counter);

            const rows = Array.from(rawData as any[]);
            console.log(`📊 [EAD Model] Retrieved ${rows.length} records`);

            // Transform to pivot format matching SQL:
            // PIVOT (SUM(PAYM_AVG) FOR SEQ IN (...)) - TENOR as rows, SEQ/COUNTER as columns
            const pivotData = this.transformEadToPivot(rows);
            console.log(`📊 [EAD Model] Transformed to ${pivotData.length} pivot rows`);

            const filteredData = this.filterEadModelRows(
                pivotData,
                params?.search,
                params?.detailFilters,
            );
            const sortedData = this.sortEadModelRows(filteredData, params?.sort);
            const startIndex = (page - 1) * limit;
            const paginatedData = sortedData.slice(startIndex, startIndex + limit);

            return {
                data: paginatedData,
                total: sortedData.length,
                page,
                totalPages: Math.ceil(sortedData.length / limit),
                effectivePrcDate: prcDate
            };
        } catch (error) {
            console.error('❌ Error in getEADModel service:', error);
            return { data: [], total: 0, page, totalPages: 0, effectivePrcDate: null };
        }
    }

    /**
     * Transform EAD data to pivot format (TENOR as rows, SEQ/COUNTER as columns)
     * Matches SQL: PIVOT (SUM(PAYM_AVG) FOR SEQ IN (...))
     */
    private transformEadToPivot(data: any[]) {
        if (!data || data.length === 0) return [];

        const tenorMap = new Map<number, any>();

        data.forEach(row => {
            const tenor = row.tenor;
            const counter = row.counter;  // This is SEQ in SQL script
            const paymAvg = row.paymAvg;

            if (!tenorMap.has(tenor)) {
                tenorMap.set(tenor, {
                    id: tenor,
                    lt_month: tenor,  // [LT/MONTH] in SQL
                    tenor: tenor
                });
            }

            const tenorRow = tenorMap.get(tenor);
            // Dynamic column: seq_1, seq_2, etc. (COUNTER as SEQ in SQL)
            tenorRow[`seq_${counter}`] = paymAvg;
        });

        return Array.from(tenorMap.values()).sort((a, b) => a.tenor - b.tenor);
    }

    /**
     * Get EAD Model Summary Report
     * Calculates metrics: Total Accounts, Avg EAD, Avg CCF, Avg Utilization
     */
    async getEADModelSummary(tenantId: string, params?: { prc_date: string, ead_config_id?: number, segment_id?: number }) {
        try {
            const requestedPrcDate = params?.prc_date || '2023-12-31';
            const requestedSegmentId = await this.resolveEadReportSegmentId(params);

            const prcDate = await this.resolveLatestPrcDate(
                'public.frs9_master_account',
                requestedPrcDate,
            );

            const emptySummaryRow = {
                totalAccounts: 0,
                avgEAD: 0,
                avgCCF: 0,
                avgUtilization: 0,
                eadTrend: [],
                productDistribution: []
            };

            if (!prcDate) {
                return { data: [emptySummaryRow], effectivePrcDate: null };
            }
            
            // Determine which population segments are active for this date
            const activeSegmentsQuery = await legacyDb.execute(sql.raw(`
                SELECT segment_id
                FROM public.frs9_master_account
                WHERE prc_date = '${prcDate}'
                AND segment_id IS NOT NULL
                GROUP BY segment_id
                ORDER BY segment_id
            `));
            const activeSegments = (activeSegmentsQuery as any[]).map(r => r.segment_id).filter(id => id != null);
            let segmentId = requestedSegmentId ?? (activeSegments.length > 0 ? activeSegments[0] : null);

            if (segmentId === null) {
                return { data: [emptySummaryRow], effectivePrcDate: prcDate };
            }

            console.log('📊 [EAD Model Summary] Fetching with params:', {
                prcDate,
                requestedSegmentId,
                segmentId,
                activeSegments
            });

            // Query frs9_master_account for summary
            const querySummary = async (segId: number) => legacyDb.execute(sql.raw(`
                SELECT 
                    COUNT(*) as total_accounts,
                    COALESCE(AVG(CAST(outstanding AS DECIMAL)), 0) as avg_ead,
                    COALESCE(AVG(CASE WHEN CAST(unused_amt AS DECIMAL) > 0 THEN 0.20 ELSE 0 END), 0.25) as avg_ccf,
                    COALESCE(AVG(CASE WHEN CAST(plafond AS DECIMAL) > 0 THEN CAST(outstanding AS DECIMAL) / CAST(plafond AS DECIMAL) ELSE 0 END), 0.75) as avg_utilization
                FROM public.frs9_master_account
                WHERE prc_date = '${prcDate}'
                AND segment_id = ${segId}
            `));

            let rawData = await querySummary(Number(segmentId));

            const defaultMockData = { data: [emptySummaryRow], effectivePrcDate: prcDate };

            const row = (rawData as any[])[0];
            if (!row || Number(row.total_accounts || 0) === 0) {
                const fallbackSegment = activeSegments.length > 0 ? Number(activeSegments[0]) : null;
                if (requestedSegmentId !== undefined && fallbackSegment !== null && fallbackSegment !== Number(segmentId)) {
                    segmentId = fallbackSegment;
                    rawData = await querySummary(segmentId);
                }
            }

            const finalRow = (rawData as any[])[0];
            if (!finalRow || Number(finalRow.total_accounts || 0) === 0) return defaultMockData;

            const totalAccounts = Number(finalRow.total_accounts || 0);
            const avgEAD = Number(finalRow.avg_ead || 0);
            const avgCCF = Number(finalRow.avg_ccf || 0);
            const avgUtilization = Number(finalRow.avg_utilization || 0);

            const trendRows = await legacyDb.execute(sql.raw(`
                SELECT
                    prc_date,
                    COALESCE(AVG(CAST(outstanding AS DECIMAL)), 0) as avg_ead,
                    COALESCE(AVG(CASE WHEN CAST(unused_amt AS DECIMAL) > 0 THEN 0.20 ELSE 0 END), 0.25) as avg_ccf,
                    COALESCE(AVG(CASE WHEN CAST(plafond AS DECIMAL) > 0 THEN CAST(outstanding AS DECIMAL) / CAST(plafond AS DECIMAL) ELSE 0 END), 0.75) as avg_utilization
                FROM public.frs9_master_account
                WHERE prc_date <= '${prcDate}'
                AND segment_id = ${Number(segmentId)}
                GROUP BY prc_date
                ORDER BY prc_date DESC
                LIMIT 12
            `));

            const eadTrend = (Array.from(trendRows as any[]) as any[])
                .reverse()
                .map((row) => {
                    const d = new Date(String(row.prc_date).slice(0, 10))
                    const monthStr = d.toLocaleString('en-US', { month: 'short' }) + ' ' + d.getFullYear().toString().slice(-2)
                    return {
                        month: monthStr,
                        eadAmount: Number(row.avg_ead || 0) * totalAccounts,
                        ccfRate: Number(row.avg_ccf || 0),
                        utilizationRate: Number(row.avg_utilization || 0)
                    }
                });

            // Fallback product distribution matching specific date and segment
            const prodData = await legacyDb.execute(sql.raw(`
                SELECT prd_type as product, COUNT(*) as count 
                FROM public.frs9_master_account 
                WHERE prc_date = '${prcDate}' AND segment_id = ${segmentId} AND prd_type IS NOT NULL
                GROUP BY prd_type 
                ORDER BY count DESC 
                LIMIT 5
            `));
            const totalProdAccounts = (prodData as any[]).reduce((sum, r) => sum + Number(r.count), 0) || 1;
            const productDistribution = (prodData as any[]).map(r => ({
                product: r.product,
                count: Number(r.count),
                percentage: (Number(r.count) / totalProdAccounts) * 100
            }));

            return {
                data: [{
                    requestedSegmentId: requestedSegmentId ?? null,
                    effectiveSegmentId: segmentId,
                    totalAccounts,
                    avgEAD,
                    avgCCF,
                    avgUtilization,
                    eadTrend,
                    productDistribution
                }],
                effectivePrcDate: prcDate
            };
        } catch (error) {
            console.error('❌ Error in getEADModelSummary service:', error);
            return {
                data: [{
                    totalAccounts: 0,
                    avgEAD: 0,
                    avgCCF: 0,
                    avgUtilization: 0,
                    eadTrend: [],
                    productDistribution: []
                }],
                effectivePrcDate: null
            };
        }
    }

    /**
     * Get EAD Payment Average by Tenor
     * Queries: frs9_imp_ca_ead_paym_avg with pivot on counter
     */
    async getEADPaymentAverage(tenantId: string, page: number, limit: number, params?: EADModelParams) {
        try {
            const requestedPrcDate = params?.prc_date || '2023-12-31';
            const requestedSegmentId = params?.segment_id;
            const segmentId = await this.resolveEadReportSegmentId(params);
            const prcDate = await this.resolveLatestPrcDate(
                'public.frs9_imp_ca_ead_paym_avg',
                requestedPrcDate,
                segmentId !== undefined && segmentId !== null ? [`segment_id = ${Number(segmentId)}`] : [],
            );

            console.log('📊 [EAD Payment Avg] Fetching with params:', {
                requestedPrcDate,
                effectivePrcDate: prcDate,
                requestedSegmentId,
                resolvedSegmentId: segmentId,
                eadConfigId: params?.ead_config_id,
            });

            if (!prcDate) {
                return { data: [], total: 0, page, totalPages: 0, effectivePrcDate: null as string | null };
            }

            const conditions = [eq(frs9ImpCaEadPaymAvg.prcDate, prcDate)];
            if (segmentId !== undefined && segmentId !== null) {
                conditions.push(eq(frs9ImpCaEadPaymAvg.segmentId, segmentId));
            }

            const rawData = await legacyDb
                .select()
                .from(frs9ImpCaEadPaymAvg)
                .where(and(...conditions))
                .orderBy(frs9ImpCaEadPaymAvg.tenor, frs9ImpCaEadPaymAvg.counter);

            const rows = Array.from(rawData as any[]);
            console.log(`📊 [EAD Payment Avg] Retrieved ${rows.length} records`);

            // Transform to pivot format (tenor as rows, counter as columns)
            const pivotData = this.transformEadPaymToPivot(rows);

            return {
                data: pivotData,
                total: pivotData.length,
                page,
                totalPages: Math.ceil(pivotData.length / limit),
                effectivePrcDate: prcDate,
            };
        } catch (error) {
            console.error('❌ Error in getEADPaymentAverage service:', error);
            return { data: [], total: 0, page, totalPages: 0, effectivePrcDate: null as string | null };
        }
    }

    /**
     * Transform EAD payment average to pivot (tenor as rows, counter as columns)
     */
    private transformEadPaymToPivot(data: any[]) {
        if (!data || data.length === 0) return [];

        const tenorMap = new Map<number, any>();

        data.forEach(row => {
            const tenor = row.tenor;
            const counter = row.counter;
            const paymAvg = row.paymAvg;

            if (!tenorMap.has(tenor)) {
                tenorMap.set(tenor, {
                    id: tenor,
                    tenor: tenor,
                    segment_id: row.segmentId
                });
            }

            const tenorRow = tenorMap.get(tenor);
            tenorRow[`paym_${counter}`] = paymAvg;
        });

        return Array.from(tenorMap.values()).sort((a, b) => a.tenor - b.tenor);
    }

    /**
     * Get ECL Movement Report
     * Source: frs9_imp_movement_data (generated by SP: sp_frs9_imp_movement_data)
     */
    async getECLMovement(tenantId: string, page: number, limit: number, params?: MovementParams) {
        try {
            const prcDate = params?.prc_date || '2023-12-31';
            const stageFilter = this.normalizeStageFilter(params?.stage);
            const groupSegment = params?.group_segment;

            const { effectiveDate, rows } = await this.fetchMovementRows(prcDate, params?.segment_id, groupSegment, 'ecl');
            if (!effectiveDate || rows.length === 0) {
                return { data: [], total: 0, page, totalPages: 0, effectivePrcDate: null as string | null };
            }

            const matrixRows = this.buildMovementMatrixRows(rows, effectiveDate, stageFilter, 'ecl');
            const filteredRows = this.filterMovementRows(matrixRows, params?.search, params?.detailFilters);
            const sortedRows = this.sortMovementRows(filteredRows, params?.sort);
            const startIndex = (page - 1) * limit;
            const paginatedRows = sortedRows.slice(startIndex, startIndex + limit);

            return {
                data: paginatedRows,
                total: sortedRows.length,
                page,
                totalPages: Math.ceil(sortedRows.length / limit),
                effectivePrcDate: effectiveDate,
            };
        } catch (error) {
            console.error('❌ Error in getECLMovement service:', error);
            return { data: [], total: 0, page, totalPages: 0, effectivePrcDate: null as string | null };
        }
    }

    /**
     * Get GCA Movement Report
     * Source: frs9_imp_movement_data (generated by SP: sp_frs9_imp_movement_data)
     */
    async getGCAMovement(tenantId: string, page: number, limit: number, params?: MovementParams) {
        try {
            const prcDate = params?.prc_date || '2023-12-31';
            const stageFilter = this.normalizeStageFilter(params?.stage);
            const groupSegment = params?.group_segment;

            const { effectiveDate, rows } = await this.fetchMovementRows(prcDate, params?.segment_id, groupSegment, 'gca');
            if (!effectiveDate || rows.length === 0) {
                return { data: [], total: 0, page, totalPages: 0, effectivePrcDate: null as string | null };
            }

            const matrixRows = this.buildMovementMatrixRows(rows, effectiveDate, stageFilter, 'gca');
            const filteredRows = this.filterMovementRows(matrixRows, params?.search, params?.detailFilters);
            const sortedRows = this.sortMovementRows(filteredRows, params?.sort);
            const startIndex = (page - 1) * limit;
            const paginatedRows = sortedRows.slice(startIndex, startIndex + limit);

            return {
                data: paginatedRows,
                total: sortedRows.length,
                page,
                totalPages: Math.ceil(sortedRows.length / limit),
                effectivePrcDate: effectiveDate,
            };
        } catch (error) {
            console.error('❌ Error in getGCAMovement service:', error);
            return { data: [], total: 0, page, totalPages: 0, effectivePrcDate: null as string | null };
        }
    }
}

export const ifrs9ReportsService = new Ifrs9ReportsService();
