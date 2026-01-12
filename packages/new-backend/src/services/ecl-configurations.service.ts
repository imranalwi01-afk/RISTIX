import { Effect, pipe } from 'effect'
import { EclConfigurationsRepository } from '../repositories/ecl-configurations.repository'
import { NotFoundError } from '../lib/errors'
import { frs9ImpCaEclConfigh, frs9ImpCaEclConfigd } from '../db/schema'

export const EclConfigurationsService = {
    list: () => {
        return pipe(
            EclConfigurationsRepository.findAllHeaders(),
            Effect.map(headers => headers.map(transformHeader))
        )
    },

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
                    : Effect.fail(new NotFoundError({ resource: 'ECL Configuration', id: String(id) }))
            )
        )
    },

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
        )
    },

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
                    : Effect.fail(new NotFoundError({ resource: 'ECL Configuration', id: String(id) }))
            )
        )
    },

    delete: (id: number) => {
        return pipe(
            EclConfigurationsRepository.delete(BigInt(id)),
            Effect.map(() => ({ message: 'Deleted successfully' }))
        )
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
