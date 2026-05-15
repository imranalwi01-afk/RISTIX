import { Effect, pipe } from 'effect'
import { LgdConfigurationsRepository } from '../repositories/lgd-configurations.repository'
import { ParametersRepository } from '../repositories/parameters.repository'
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
                lgdMethod: options.lgd_method,
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
                    : Effect.fail(new NotFoundError({ message: 'LGD Configuration not found', resource: 'LGD Configuration', id: String(id) }))
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
            lgdMethod: data.lgdMethod != null ? Number(data.lgdMethod) : null,
            populationType: data.populationType != null ? String(data.populationType) : null,
            observationPeriod: data.observationPeriod,
            workoutPeriod: data.workoutPeriod,
            maxRecoveryPeriod: data.maxRecoveryPeriod,
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
            maxRecoveryPeriod: data.maxRecoveryPeriod,
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
                    : Effect.fail(new NotFoundError({ message: 'LGD Configuration not found', resource: 'LGD Configuration', id: String(id) }))
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
                    : Effect.fail(new NotFoundError({ message: 'LGD Configuration not found', resource: 'LGD Configuration', id: String(id) }))
            )
        )
    },

    /**
     * Get available LGD method options.
     * Dynamically sourced from Business Setting B0022 in FRS9_PARAM_COMMOND.
     * Per tech spec: LGD_METHOD = Combo Box (Business Setting B0022)
     */
    getMethods: () => {
        return pipe(
            ParametersRepository.findDetailByCode('B0022'),
            Effect.map(details =>
                details
                    .filter(d => d.value1 !== null && d.value1 !== '')
                    .map(d => ({
                        value: d.value1!,
                        label: d.value2 ?? d.value1!,
                    }))
            )
        )
    },

    /**
     * Get available LGD population type options.
     * Dynamically sourced from Business Setting B0023 in FRS9_PARAM_COMMOND.
     * Per tech spec: POLUPATION_TYPE = Combo Box (Business Setting B0023)
     */
    getPopulationTypes: () => {
        return pipe(
            ParametersRepository.findDetailByCode('B0023'),
            Effect.map(details =>
                details
                    .filter(d => d.value1 !== null && d.value1 !== '')
                    .map(d => ({
                        value: d.value1!,
                        label: d.value2 ?? d.value1!,
                    }))
            )
        )
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
    max_recovery_period: config.maxRecoveryPeriod,
    fl_flag: config.flFlag,
    fl_scalar_id: config.flScalarId,
    lgd_rate: config.lgdRate,
    is_active: config.activeFlag,
    created_by: config.createdby,
    updated_by: config.updatedby,
    created_date: config.createddate,
    updated_date: config.updateddate,
    created_host: config.createdhost,
    updated_host: config.updatedhost,
})
