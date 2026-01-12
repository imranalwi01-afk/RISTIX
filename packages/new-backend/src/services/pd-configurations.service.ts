import { Effect, pipe } from 'effect'
import { PdConfigurationsRepository } from '../repositories/pd-configurations.repository'
import { NotFoundError } from '../lib/errors'
import { frs9ImpCaPdConfig } from '../db/schema'

export const PdConfigurationsService = {
    // CRUD Operations
    list: (query: { search?: string, selected_method?: string, bucket?: string, is_active?: boolean }) => {
        return pipe(
            PdConfigurationsRepository.findAll(query.search, query.selected_method, query.bucket, query.is_active),
            Effect.map(configs => configs.map(transformPdConfig))
        )
    },

    get: (id: number) => {
        return pipe(
            PdConfigurationsRepository.findById(BigInt(id)),
            Effect.flatMap(config =>
                config
                    ? Effect.succeed(transformPdConfig(config))
                    : Effect.fail(new NotFoundError({ resource: 'PD Configuration', id: String(id) }))
            )
        )
    },

    create: (data: any, userId: string) => {
        const now = new Date().toISOString()
        const payload = {
            pdModelName: data.model_name,
            segmentId: data.population_segment_id,
            pdMethod: String(data.selected_method),
            interval: data.migration_interval,
            populationType: String(data.population_type),
            observationPeriod: data.historical_month,
            observationStartDate: data.first_historical_date ? new Date(data.first_historical_date).toISOString() : null,
            multiplication: data.multiplication,
            flFlag: data.fl_flag,
            iaFlag: data.ia_flag,
            bucketGroup: data.bucket,
            activeFlag: data.is_active,
            createdby: userId,
            createdhost: 'localhost',
            createddate: now,
            updatedby: userId,
            updatedhost: 'localhost',
            updateddate: now
        }
        return pipe(
            PdConfigurationsRepository.create(payload as any),
            Effect.map(transformPdConfig)
        )
    },

    update: (id: number, data: any, userId: string) => {
        const now = new Date().toISOString()
        const updateData: any = {
            updatedby: userId,
            updateddate: now,
            updatedhost: 'localhost'
        }

        if (data.model_name) updateData.pdModelName = data.model_name
        if (data.population_segment_id) updateData.segmentId = data.population_segment_id
        if (data.selected_method) updateData.pdMethod = String(data.selected_method)
        if (data.migration_interval) updateData.interval = data.migration_interval
        if (data.population_type) updateData.populationType = String(data.population_type)
        if (data.historical_month) updateData.observationPeriod = data.historical_month
        if (data.first_historical_date) updateData.observationStartDate = new Date(data.first_historical_date).toISOString()
        if (data.multiplication !== undefined) updateData.multiplication = data.multiplication
        if (data.fl_flag !== undefined) updateData.flFlag = data.fl_flag
        if (data.ia_flag !== undefined) updateData.iaFlag = data.ia_flag
        if (data.bucket) updateData.bucketGroup = data.bucket
        if (data.is_active !== undefined) updateData.activeFlag = data.is_active

        return pipe(
            PdConfigurationsRepository.update(BigInt(id), updateData),
            Effect.flatMap(updated =>
                updated
                    ? Effect.succeed(transformPdConfig(updated))
                    : Effect.fail(new NotFoundError({ resource: 'PD Configuration', id: String(id) }))
            )
        )
    },

    delete: (id: number) => {
        return pipe(
            PdConfigurationsRepository.delete(BigInt(id)),
            Effect.map(() => ({ message: 'Deleted' }))
        )
    },

    // Metadata
    getMethods: () => {
        return Effect.succeed([
            { value: 1, label: 'NOA Migration' },
            { value: 3, label: 'Proxy PD' },
        ])
    },

    getPopulationTypes: () => {
        return Effect.succeed([
            { value: 2, label: 'Window Moving Period' },
        ])
    }
}

// Helper
const transformPdConfig = (config: typeof frs9ImpCaPdConfig.$inferSelect) => ({
    id: config.pkid,
    model_name: config.pdModelName,
    population_segment_id: config.segmentId,
    selected_method: parseInt(config.pdMethod || '0'),
    migration_interval: config.interval,
    population_type: parseInt(config.populationType || '0'),
    historical_month: config.observationPeriod,
    first_historical_date: config.observationStartDate ? config.observationStartDate.split('T')[0] : null,
    multiplication: config.multiplication,
    fl_flag: config.flFlag,
    fl_scalar_id: config.flScalarId,
    ia_flag: config.iaFlag,
    bucket: config.bucketGroup,
    is_active: config.activeFlag,
    created_by: config.createdby,
    updated_by: config.updatedby,
    created_date: config.createddate,
    updated_date: config.updateddate,
})
