import { Effect, pipe } from 'effect'
import { EclConfigurationsRepository } from '../repositories/ecl-configurations.repository'
import { NotFoundError, DatabaseError } from '../lib/errors'
import { frs9ImpCaEclConfigh, frs9ImpCaEclConfigd, frs9ImpCaResultHPrv, frs9ImpCaResultDPrv } from '../db/schema'
import { legacyDb } from '../config'
import { asc, eq, sql } from 'drizzle-orm'

export const EclConfigurationsService = {
    /**
     * List all ECL configurations with simplified header information.
     * 
     * @returns An Effect resolving to an array of transformed ECL headers
     */
    list: () => {
        return pipe(
            EclConfigurationsRepository.findAllHeaders(),
            Effect.map(headers => headers.map(transformHeader))
        ) as any
    },

    /**
     * Get an ECL configuration by ID, including its details.
     * 
     * @param id - The ECL configuration ID
     * @returns An Effect resolving to the transformed configuration with details, or NotFoundError
     */
    get: (id: number) => {
        return pipe(
            Effect.all([
                EclConfigurationsRepository.findHeaderById(BigInt(id)),
                EclConfigurationsRepository.findDetailsByHeaderId(BigInt(id))
            ]),
            Effect.flatMap(([header, details]) =>
                header
                    ? Effect.succeed({
                        ...transformHeader(header),
                        details: details.map(transformDetail)
                    })
                    : Effect.fail(new NotFoundError({ message: 'ECL Configuration not found', resource: 'ECL Configuration', id: String(id) })) as any
            )
        ) as any
    },

    getPreviewResults: (id: number) => {
        return Effect.tryPromise({
            try: async () => {
                const rows = await legacyDb
                    .select()
                    .from(frs9ImpCaResultHPrv)
                    .where(eq(frs9ImpCaResultHPrv.eclModelId, id))
                    .orderBy(asc(frs9ImpCaResultHPrv.accountId))

                return rows.map(transformPreviewHeader)
            },
            catch: (error) => new DatabaseError({ message: 'Failed to fetch ECL preview results', operation: 'query', cause: error })
        }) as any
    },

    getPreviewResultDetail: (id: number, accountId: number) => {
        return Effect.tryPromise({
            try: async () => {
                const rows = await legacyDb
                    .select()
                    .from(frs9ImpCaResultDPrv)
                    .where(eq(frs9ImpCaResultDPrv.eclModelId, id))

                return rows
                    .filter((row) => Number(row.accountId) === accountId)
                    .sort((a, b) => {
                        const scenarioNoA = Number(a.scenarioNo ?? 0)
                        const scenarioNoB = Number(b.scenarioNo ?? 0)
                        if (scenarioNoA !== scenarioNoB) return scenarioNoA - scenarioNoB

                        const flYearA = Number(a.flYear ?? 0)
                        const flYearB = Number(b.flYear ?? 0)
                        if (flYearA !== flYearB) return flYearA - flYearB

                        return Number(a.flMotnh ?? 0) - Number(b.flMotnh ?? 0)
                    })
                    .map(transformPreviewDetail)
            },
            catch: (error) => new DatabaseError({ message: 'Failed to fetch ECL preview result detail', operation: 'query', cause: error })
        }) as any
    },

    /**
     * Create a new ECL configuration.
     * 
     * @param data - The configuration data (header and details)
     * @param userId - The ID of the user creating the configuration
     * @returns An Effect resolving to the created configuration with details
     */
    create: (data: any, userId: string) => {
        const now = new Date().toISOString()
        const headerData = {
            eclModelName: data.modelName,
            module: data.module,
            effectiveDate: data.effectiveDate,
            activeFlag: data.activeFlag,
            createdby: userId,
            createdhost: 'localhost',
            createddate: now,
            updatedby: userId,
            updatedhost: 'localhost',
            updateddate: now
        }

        const detailsData = (data.details || []).map((d: any) => ({
            pfSegmentId: d.pfSegmentId,
            stageRuleId: d.stageRuleId,
            pdModelId: d.pdModelId,
            lgdModelId: d.lgdModelId,
            eadModelId: d.eadModelId,
            overlayRate: d.overlayRate,
            periodType: d.periodType,
            periodDate: d.periodDate,
            createdby: userId,
            createdhost: 'localhost',
            createddate: now,
            updatedby: userId,
            updatedhost: 'localhost',
            updateddate: now
        }))

        return pipe(
            EclConfigurationsRepository.create(headerData as any, detailsData as any),
            Effect.flatMap(header =>
                // Currently repository returns header. Should we refetch details?
                // The route logic fetched details again. 
                // Let's assume we want to return full object.
                EclConfigurationsRepository.findDetailsByHeaderId(BigInt(header.pkid)).pipe(
                    Effect.map(details => ({
                        ...transformHeader(header),
                        details: details.map(transformDetail)
                    }))
                )
            )
        ) as any
    },

    /**
     * Update an existing ECL configuration.
     * 
     * @param id - The ECL configuration ID
     * @param data - The data to update
     * @param userId - The ID of the user updating the configuration
     * @returns An Effect resolving to the updated configuration with details or NotFoundError
     */
    update: (id: number, data: any, userId: string) => {
        const now = new Date().toISOString()
        const headerData = {
            eclModelName: data.modelName,
            module: data.module,
            effectiveDate: data.effectiveDate,
            activeFlag: data.activeFlag,
            updatedby: userId,
            updateddate: now,
            updatedhost: 'localhost',
        }

        let detailsData
        if (data.details) {
            detailsData = data.details.map((d: any) => ({
                pfSegmentId: d.pfSegmentId,
                stageRuleId: d.stageRuleId,
                pdModelId: d.pdModelId,
                lgdModelId: d.lgdModelId,
                eadModelId: d.eadModelId,
                overlayRate: d.overlayRate,
                periodType: d.periodType,
                periodDate: d.periodDate,
                createdby: userId,
                createdhost: 'localhost',
                createddate: now,
                updatedby: userId,
                updatedhost: 'localhost',
                updateddate: now
            }))
        }

        return pipe(
            EclConfigurationsRepository.update(BigInt(id), headerData as any, detailsData as any),
            Effect.flatMap(updated =>
                updated
                    ? EclConfigurationsRepository.findDetailsByHeaderId(BigInt(updated.pkid)).pipe(
                        Effect.map(details => ({
                            ...transformHeader(updated),
                            details: details.map(transformDetail)
                        }))
                    )
                    : Effect.fail(new NotFoundError({ message: 'ECL Configuration not found', resource: 'ECL Configuration', id: String(id) })) as any
            )
        ) as any
    },

    /**
     * Delete an ECL configuration.
     * 
     * @param id - The ECL configuration ID
     * @returns An Effect resolving to a success message
     */
    delete: (id: number) => {
        return pipe(
            EclConfigurationsRepository.delete(BigInt(id)),
            Effect.map(() => ({ message: 'Deleted successfully' }))
        ) as any
    },

    getPdModelOutputs: () => {
        return Effect.tryPromise({
            try: async () => {
                const rows: any[] = await legacyDb.execute(sql`
                    SELECT DISTINCT m.model_id, s.model_name
                    FROM frs9_r_pd_output_monthly m
                    LEFT JOIN frs9_r_model_summary s ON m.model_id = s.model_id
                    WHERE m.model_id IS NOT NULL
                    ORDER BY m.model_id
                `)
                const data = (rows as any).rows
                    ? (rows as any).rows.map((r: any) => ({ model_id: Number(r.model_id), model_name: r.model_name }))
                    : rows.map((r: any) => ({ model_id: Number(r.model_id), model_name: r.model_name }))
                return { success: true, data }
            },
            catch: (error) => new DatabaseError({ message: 'Failed to fetch PD model outputs', operation: 'query', cause: error })
        }) as any
    }
}

// Helpers
const transformHeader = (header: typeof frs9ImpCaEclConfigh.$inferSelect) => ({
    id: header.pkid,
    model_name: header.eclModelName,
    module: header.module,
    effective_date: header.effectiveDate,
    active_flag: header.activeFlag,
    last_run_period: header.lastRunPeriod,
    last_run_status: header.lastRunStatus,
    last_run_date: header.lastRunDate,
    created_by: header.createdby,
    created_date: header.createddate,
})

const transformDetail = (detail: typeof frs9ImpCaEclConfigd.$inferSelect) => ({
    id: detail.pkid,
    pf_segment_id: detail.pfSegmentId,
    stage_rule_id: detail.stageRuleId,
    pd_model_id: detail.pdModelId,
    lgd_model_id: detail.lgdModelId,
    ead_model_id: detail.eadModelId,
    overlay_rate: detail.overlayRate,
    period_type: detail.periodType,
    period_date: detail.periodDate,
})

const transformPreviewHeader = (row: typeof frs9ImpCaResultHPrv.$inferSelect) => ({
    prc_date: row.prcDate,
    account_id: row.accountId,
    facility_number: row.facilityNumber,
    cif_number: row.cifNumber,
    segment_id: row.segmentId,
    remaining_tenor: row.remainingTenor,
    stage: row.stage,
    bucket_group: row.bucketGroup,
    bucket_id: row.bucketId,
    currency: row.currency,
    dpd: row.dpd,
    internal_rating_code: row.internalRatingCode,
    ext_rating_code: row.extRatingCode,
    outstanding: row.outstanding,
    plafond: row.plafond,
    fib_amt: row.fibAmt,
    accrued_interest: row.accruedInterest,
    unamort_cost_amt: row.unamortCostAmt,
    unamort_fee_amt: row.unamortFeeAmt,
    ecl_amount: row.eclAmount,
    overlay_amount: row.overlayAmount,
    ecl_final: row.eclFinal,
    ecl_model_id: row.eclModelId,
})

const transformPreviewDetail = (row: typeof frs9ImpCaResultDPrv.$inferSelect) => ({
    prc_date: row.prcDate,
    account_id: row.accountId,
    facility_number: row.facilityNumber,
    cif_number: row.cifNumber,
    segment_id: row.segmentId,
    remaining_tenor: row.remainingTenor,
    stage: row.stage,
    scenario_no: row.scenarioNo,
    fl_seq: row.flSeq,
    fl_year: row.flYear,
    fl_month: row.flMotnh,
    bucket_group: row.bucketGroup,
    bucket_id: row.bucketId,
    currency: row.currency,
    dpd: row.dpd,
    internal_rating_code: row.internalRatingCode,
    ext_rating_code: row.extRatingCode,
    outstanding: row.outstanding,
    plafond: row.plafond,
    fib_amt: row.fibAmt,
    accrued_interest: row.accruedInterest,
    unamort_cost_amt: row.unamortCostAmt,
    unamort_fee_amt: row.unamortFeeAmt,
    ead_balance: row.eadBalance,
    principal_amt: row.principalAmt,
    sum_principal_amt: row.sumPrincipalAmt,
    next_interest: row.nextInterest,
    sum_next_interest: row.sumNextInterest,
    ead: row.ead,
    pd: row.pd,
    lgd: row.lgd,
    ecl_amount: row.eclAmount,
    probability: row.probability,
    ecl_weighted: row.eclWeighted,
    ecl_model_id: row.eclModelId,
})
