import { Effect, pipe } from 'effect'
import { EclConfigurationsRepository } from '../repositories/ecl-configurations.repository'
import { NotFoundError } from '../lib/errors'
import { frs9ImpCaEclConfigh, frs9ImpCaEclConfigd } from '../db/schema'

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
                    : Effect.fail(new NotFoundError({ resource: 'ECL Configuration', id: String(id) })) as any
            )
        ) as any
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
                    : Effect.fail(new NotFoundError({ resource: 'ECL Configuration', id: String(id) })) as any
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
