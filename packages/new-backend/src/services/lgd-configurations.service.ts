import { Effect, pipe } from 'effect'
import { LgdConfigurationsRepository } from '../repositories/lgd-configurations.repository'
import { NotFoundError } from '../lib/errors'
import { frs9ImpCaLgdConfig } from '../db/schema'

export const LgdConfigurationsService = {
    /**
     * List LGD configurations with filtering.
     * 
     * @param options - Filter options
     * @returns An Effect resolving to an array of transformed configurations
     */
    list: (options: {
        search?: string
        lgd_method?: string
        is_active?: string
    }) => {
        return pipe(
            LgdConfigurationsRepository.findAll({
                search: options.search,
                lgdMethod: options.lgd_method ? parseInt(options.lgd_method) : undefined,
                isActive: options.is_active ? options.is_active === 'true' : undefined
            }),
            Effect.map(configs => configs.map(transformLgdConfig))
        )
    },

    /**
     * Get an LGD configuration by ID.
     * 
     * @param id - The configuration ID
     * @returns An Effect resolving to the configuration or NotFoundError
     */
    get: (id: number) => {
        return pipe(
            LgdConfigurationsRepository.findById(id),
            Effect.flatMap(config =>
                config
                    ? Effect.succeed(transformLgdConfig(config))
                    : Effect.fail(new NotFoundError({ resource: 'LGD Configuration', id: String(id) }))
            )
        )
    },

    /**
     * Create a new LGD configuration.
     * 
     * @param data - The configuration data
     * @param userId - The ID of the user creating the configuration
     * @returns An Effect resolving to the created configuration
     */
    create: (data: any, userId: string) => {
        const payload = {
            lgdModelName: data.modelName,
            segmentId: data.segmentId,
            lgdMethod: data.lgdMethod,
            populationType: data.populationType,
            observationPeriod: data.observationPeriod,
            workoutPeriod: data.workoutPeriod,
            flFlag: data.flFlag,
            flScalarId: data.flScalarId,
            lgdRate: data.lgdRate,
            activeFlag: data.isActive,
            observationStartDate: data.observationStartDate,
            createdby: userId,
            createdhost: 'localhost',
            createddate: new Date().toISOString(),
            updatedby: userId,
            updatedhost: 'localhost',
            updateddate: new Date().toISOString(),
        }

        return pipe(
            LgdConfigurationsRepository.create(payload),
            Effect.map(transformLgdConfig)
        )
    },

    /**
     * Update an existing LGD configuration.
     * 
     * @param id - The configuration ID
     * @param data - The data to update
     * @param userId - The ID of the user updating the configuration
     * @returns An Effect resolving to the updated configuration or NotFoundError
     */
    update: (id: number, data: any, userId: string) => {
        const payload = {
            lgdModelName: data.modelName,
            segmentId: data.segmentId,
            lgdMethod: data.lgdMethod,
            populationType: data.populationType,
            observationPeriod: data.observationPeriod,
            workoutPeriod: data.workoutPeriod,
            flFlag: data.flFlag,
            flScalarId: data.flScalarId,
            lgdRate: data.lgdRate,
            activeFlag: data.isActive,
            observationStartDate: data.observationStartDate,
            updatedby: userId,
            updateddate: new Date().toISOString(),
            updatedhost: 'localhost',
        }

        return pipe(
            LgdConfigurationsRepository.update(id, payload),
            Effect.flatMap(updated =>
                updated
                    ? Effect.succeed(transformLgdConfig(updated))
                    : Effect.fail(new NotFoundError({ resource: 'LGD Configuration', id: String(id) }))
            )
        )
    },

    /**
     * Delete an LGD configuration.
     * 
     * @param id - The configuration ID
     * @returns An Effect resolving to a success message or NotFoundError
     */
    delete: (id: number) => {
        return pipe(
            LgdConfigurationsRepository.delete(id),
            Effect.flatMap(deleted =>
                deleted
                    ? Effect.succeed({ message: 'LGD configuration deleted successfully' })
                    : Effect.fail(new NotFoundError({ resource: 'LGD Configuration', id: String(id) }))
            )
        )
    },

    /** Get available LGD methods options. */
    getMethods: () => {
        return Effect.succeed([
            { value: 1, label: 'Linear' },
            { value: 2, label: 'Vintage' },
            { value: 3, label: 'Recovery Rate' },
        ])
    },

    /** Get available population types options. */
    getPopulationTypes: () => {
        return Effect.succeed([
            { value: 'Monthly', label: 'Monthly' },
            { value: 'Quarterly', label: 'Quarterly' },
        ])
    }
}

// Transform Helper
const transformLgdConfig = (config: typeof frs9ImpCaLgdConfig.$inferSelect) => ({
    id: config.pkid,
    model_name: config.lgdModelName,
    segment_id: config.segmentId,
    lgd_method: config.lgdMethod,
    population_type: config.populationType,
    observation_period: config.observationPeriod,
    observation_start_date: config.observationStartDate ? new Date(config.observationStartDate).toISOString() : null,
    workout_period: config.workoutPeriod,
    fl_flag: config.flFlag,
    fl_scalar_id: config.flScalarId,
    lgd_rate: config.lgdRate,
    is_active: config.activeFlag,
    created_by: config.createdby,
    updated_by: config.updatedby,
    created_date: config.createddate,
    updated_date: config.updateddate,
})
