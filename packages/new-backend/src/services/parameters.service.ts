// @ts-nocheck
import { Effect, pipe } from 'effect'
import { eq } from 'drizzle-orm'
import { ParametersRepository } from '../repositories/parameters.repository'
import { NotFoundError, DatabaseError, ValidationError } from '../lib/errors'
import { frs9ParamCommond } from '../db/schema'
import { legacyDb } from '../config'
import type { ListQuery } from '../lib/http/list-query'

/**
 * Service for managing Application and Business parameters.
 * Handles CRUD operations for parameters and metadata.
 */
export const ParametersService = {
    // App Settings

    /**
     * List application settings (parameters).
     * 
     * @param code - Optional parameter code to filter by
     * @param paramType - Parameter type filter (default 'S' for System)
     * @returns An Effect resolving to an array of parameter headers
     */
    listAppSettings: (code?: string, paramType: string | string[] = ['S', 'A']) => {
        return pipe(
            ParametersRepository.findHeaders(paramType, code),
            Effect.map(headers => headers.map(transformHeader))
        )
    },

    /**
     * Get a specific app setting by code.
     * 
     * @param code - The parameter code
     * @returns An Effect resolving to the parameter header
     * @throws NotFoundError if the setting is not found
     */
    getAppSetting: (code: string) => {
        return pipe(
            ParametersRepository.findHeaderByCode(code),
            Effect.flatMap(header =>
                (header
                    ? Effect.succeed(transformHeader(header))
                    : Effect.fail(new NotFoundError({ message: 'App Setting not found', resource: 'App Setting', id: code }))) as any
            )
        )
    },

    /**
     * Get details for a specific app setting.
     * 
     * @param code - The parameter code
     * @returns An Effect resolving to an array of parameter details
     */
    getAppSettingDetails: (code: string) => {
        return pipe(
            ParametersRepository.findDetailByCode(code),
            Effect.map(details => details.map(transformDetail))
        )
    },

    /**
     * Get a specific app/business setting detail by ID.
     *
     * @param id - The detail ID
     * @returns An Effect resolving to the parameter detail
     * @throws NotFoundError if the detail is not found
     */
    getAppSettingDetail: (id: number) => {
        return pipe(
            Effect.tryPromise({
                try: async () => {
                    const results = await legacyDb.select().from(frs9ParamCommond).where(eq(frs9ParamCommond.pkid, BigInt(id)))
                    return results[0] || null
                },
                catch: (e) => new DatabaseError({ message: 'Failed to fetch detail', operation: 'query', cause: e })
            }),
            Effect.flatMap(detail =>
                (detail
                    ? Effect.succeed(transformDetail(detail))
                    : Effect.fail(new NotFoundError({ message: 'App Setting Detail not found', resource: 'App Setting Detail', id: String(id) }))) as any
            )
        )
    },

    /**
     * Create a new app setting.
     * 
     * @param data - The setting data
     * @param userId - The ID of the user creating the setting
     * @returns An Effect resolving to the created setting header
     */
    createAppSetting: (data: any, userId: string) => {
        return pipe(
            ParametersRepository.findHeaderByCode(data.paramCode),
            Effect.flatMap(existing => {
                if (existing) {
                    return Effect.fail(new ValidationError({
                        message: `Parameter code '${data.paramCode}' already exists`,
                        errors: ['paramCode already exists'],
                    })) as any
                }

                const now = new Date().toISOString()
                const payload = {
                    paramCode: data.paramCode,
                    paramName: data.paramName,
                    paramUsage: data.paramUsage,
                    paramType: data.paramType,
                    // bankingType, isActive, requiresApproval removed as they don't exist in physical legacy DB
                    createdby: userId,
                    createdhost: 'localhost',
                    createddate: now,
                    updatedby: userId,
                    updatedhost: 'localhost',
                    updateddate: now,
                }
                return pipe(
                    ParametersRepository.createHeader(payload as any),
                    Effect.catchAll((error: any) => {
                        const message = String(error?.message ?? '')
                        const duplicateCode =
                            message.includes('duplicate key value') &&
                            (message.includes('param_code') || message.includes('frs9_param_commonh'))

                        if (duplicateCode) {
                            return Effect.fail(new ValidationError({
                                message: `Parameter code '${data.paramCode}' already exists`,
                                errors: ['paramCode already exists'],
                            })) as any
                        }

                        return Effect.fail(error) as any
                    })
                )
            }),
            Effect.map(transformHeader)
        )
    },

    /**
     * Update an existing app setting.
     * 
     * @param code - The parameter code
     * @param data - The data to update
     * @param userId - The ID of the user updating the setting
     * @returns An Effect resolving to the updated setting header
     * @throws NotFoundError if the setting is not found
     */
    updateAppSetting: (code: string, data: any, userId: string) => {
        const now = new Date().toISOString()
        const payload = {
            paramName: data.paramName,
            paramUsage: data.paramUsage,
            paramType: data.paramType,
            // bankingType, isActive, requiresApproval removed as they don't exist in physical legacy DB
            updatedby: userId,
            updatedhost: 'localhost',
            updateddate: now,
        }
        return pipe(
            ParametersRepository.updateHeader(code, payload as any),
            Effect.flatMap(updated =>
                (updated
                    ? Effect.succeed(transformHeader(updated))
                    : Effect.fail(new NotFoundError({ message: 'App Setting not found', resource: 'App Setting', id: code }))) as any
            )
        )
    },

    /**
     * Create a new detail for an app setting.
     * 
     * @param data - The detail data
     * @param userId - The ID of the user creating the detail
     * @returns An Effect resolving to the created detail
     * @throws NotFoundError if the parent setting is not found
     */
    createAppSettingDetail: (data: any, userId: string) => {
        return pipe(
            ParametersRepository.findHeaderByCode(data.paramCode),
            Effect.flatMap(header => {
                if (!header) return Effect.fail(new NotFoundError({ message: 'Parent Setting not found', resource: 'Parent Setting', id: data.paramCode })) as any

                const resolveParamSeq = data.paramSeq !== undefined && data.paramSeq !== null
                    ? Effect.succeed(Number(data.paramSeq))
                    : pipe(
                        ParametersRepository.findDetailByCode(data.paramCode),
                        Effect.map((details) => {
                            const maxSeq = details.reduce((max, d) => Math.max(max, Number(d.paramSeq || 0)), 0)
                            return maxSeq + 1
                        })
                    )

                return pipe(
                    resolveParamSeq,
                    Effect.flatMap((resolvedParamSeq) =>
                        pipe(
                            ParametersRepository.findDetailBySeq(data.paramCode, resolvedParamSeq),
                            Effect.flatMap(existingSeq => {
                                if (existingSeq) {
                                    return Effect.fail(new ValidationError({
                                        message: 'Sequence already exists',
                                        errors: ['paramSeq already exists for this parameter code']
                                    })) as any
                                }

                                // For Business Setup (paramType='B'), also check for duplicate value combinations
                                if (header.paramType === 'B') {
                                    return pipe(
                                        ParametersRepository.findDetailByValues(
                                            data.paramCode,
                                            data.value1 || '',
                                            data.value2 || '',
                                            data.value3 || ''
                                        ),
                                        Effect.flatMap(existingValues => {
                                            if (existingValues) {
                                                return Effect.fail(new ValidationError({
                                                    message: 'data already exist',
                                                    errors: ['Duplicate combination of Value1, Value2, and Value3']
                                                })) as any
                                            }
                                            return Effect.succeed(resolvedParamSeq)
                                        })
                                    )
                                }

                                return Effect.succeed(resolvedParamSeq)
                            }),
                            Effect.flatMap((finalParamSeq) => {
                                const now = new Date().toISOString()
                                const payload = {
                                    paramCode: data.paramCode,
                                    paramSeq: finalParamSeq,
                                    value1: data.value1,
                                    value2: data.value2,
                                    value3: data.value3,
                                    paramdesc: data.paramdesc,
                                    createdby: userId,
                                    createdhost: 'localhost',
                                    createddate: now,
                                    updatedby: userId,
                                    updatedhost: 'localhost',
                                    updateddate: now,
                                }

                                return pipe(
                                    ParametersRepository.createDetail(payload as any),
                                    Effect.catchAll((error: any) => {
                                        const message = String(error?.message ?? '')
                                        const duplicateSeq =
                                            message.includes('frs9_param_commond_param_code_seq_unique') ||
                                            (message.includes('duplicate key value') &&
                                                message.includes('param_code_seq'))

                                        if (duplicateSeq) {
                                            return Effect.fail(new ValidationError({
                                                message: 'Sequence already exists',
                                                errors: ['paramSeq already exists for this parameter code']
                                            })) as any
                                        }

                                        return Effect.fail(error) as any
                                    })
                                ) as any
                            })
                        )
                    )
                )
            }),
            Effect.map(d => transformDetail(d as any))
        )
    },

    /**
     * Update an app setting detail.
     * 
     * @param id - The ID of the detail
     * @param data - The data to update
     * @param userId - The ID of the user updating the detail
     * @returns An Effect resolving to the updated detail
     */
    updateAppSettingDetail: (id: number, data: any, userId: string) => {
        return pipe(
            // Need to get current detail to have paramCode for duplicate checks
            Effect.tryPromise({
                try: async () => {
                    const results = await legacyDb.select().from(frs9ParamCommond).where(eq(frs9ParamCommond.pkid, BigInt(id)))
                    return results[0]
                },
                catch: (e) => new DatabaseError({ message: 'Failed to fetch detail for update', operation: 'query', cause: e })
            }),
            Effect.flatMap(current => {
                if (!current) return Effect.fail(new NotFoundError({ message: 'App Setting Detail not found', resource: 'App Setting Detail', id: String(id) })) as any

                const paramCode = current.paramCode

                return pipe(
                    ParametersRepository.findHeaderByCode(paramCode),
                    Effect.flatMap(header => {
                        const checks = []

                        // Check duplicate sequence if updated
                        if (data.paramSeq !== undefined && data.paramSeq !== current.paramSeq) {
                            checks.push(
                                pipe(
                                    ParametersRepository.findDetailBySeq(paramCode, data.paramSeq),
                                    Effect.flatMap(existing => {
                                        if (existing && BigInt(existing.pkid) !== BigInt(id)) {
                                            return Effect.fail(new ValidationError({ message: 'Sequence already exists', errors: ['Sequence already assigned to another record'] })) as any
                                        }
                                        return Effect.succeed(null)
                                    })
                                )
                            )
                        }

                        // Check duplicate values if updated ONLY for Business parameters (paramType='B')
                        if (header && header.paramType === 'B') {
                            const v1 = data.value1 !== undefined ? data.value1 : current.value1
                            const v2 = data.value2 !== undefined ? data.value2 : current.value2
                            const v3 = data.value3 !== undefined ? data.value3 : current.value3

                            if (data.value1 !== undefined || data.value2 !== undefined || data.value3 !== undefined) {
                                checks.push(
                                    pipe(
                                        ParametersRepository.findDetailByValues(paramCode, v1 || '', v2 || '', v3 || ''),
                                        Effect.flatMap(existing => {
                                            if (existing && BigInt(existing.pkid) !== BigInt(id)) {
                                                return Effect.fail(new ValidationError({ message: 'data already exist', errors: ['Combination already assigned to another record'] })) as any
                                            }
                                            return Effect.succeed(null)
                                        })
                                    )
                                )
                            }
                        }

                        return pipe(
                            Effect.all(checks),
                            Effect.flatMap(() => {
                                const now = new Date().toISOString()
                                const payload: any = {
                                    updatedby: userId,
                                    updatedhost: 'localhost',
                                    updateddate: now,
                                }

                                if (data.paramSeq !== undefined) payload.paramSeq = data.paramSeq
                                if (data.value1 !== undefined) payload.value1 = data.value1
                                if (data.value2 !== undefined) payload.value2 = data.value2
                                if (data.value3 !== undefined) payload.value3 = data.value3
                                if (data.paramdesc !== undefined) payload.paramdesc = data.paramdesc

                                return ParametersRepository.updateDetail(id, payload)
                            }),
                            Effect.map(d => transformDetail(d as any))
                        )
                    })
                )
            }),
            Effect.flatMap(updated =>
                (updated
                    ? Effect.succeed(transformDetail(updated as any))
                    : Effect.fail(new NotFoundError({ resource: 'App Setting Detail', id: String(id) }))) as any
            )
        )
    },

    /**
     * Delete an app setting detail.
     * 
     * @param id - The ID of the detail to delete
     * @returns An Effect resolving to a success message
     * @throws NotFoundError if the detail is not found
     */
    deleteAppSettingDetail: (id: number) => {
        return pipe(
            ParametersRepository.deleteDetail(BigInt(id)),
            Effect.flatMap(deleted =>
                (deleted
                    ? Effect.succeed(transformDetail(deleted as any))
                    : Effect.fail(new NotFoundError({ message: 'App Setting Detail not found', resource: 'App Setting Detail', id: String(id) }))) as any
            )
        )
    },

    /**
     * Delete an app setting header.
     * 
     * @param code - The parameter code
     * @returns An Effect resolving to a success message
     * @throws NotFoundError if the setting is not found
     */
    deleteAppSetting: (code: string) => {
        return pipe(
            ParametersRepository.deleteHeader(code),
            Effect.flatMap(deleted =>
                (deleted
                    ? Effect.succeed({ message: `Application setting '${code}' deleted successfully` })
                    : Effect.fail(new NotFoundError({ message: 'App Setting not found', resource: 'App Setting', id: code }))) as any
            )
        )
    },

    // Business Settings Queries

    /**
     * List business settings or get details for a specific setting.
     * 
     * @param code - Optional parameter code to filter by (if provided, returns details)
     * @returns An Effect resolving to an array of details or success
     */
    listBusinessSettings: (code?: string) => {
        // If code provided, return details
        if (code) {
            return pipe(
                ParametersRepository.findDetailByCode(code),
                Effect.map(details => details.map(transformDetail))
            )
        }
        // Return headers for type 'B'
        return pipe(
            ParametersRepository.findHeaders('B'),
            Effect.map(headers => headers.map(transformHeader))
        )
    },

    listAppSettingsPage: (query: ListQuery, paramType: string | string[] = ['S', 'A']) => {
        return pipe(
            ParametersRepository.findHeadersPage(paramType, {
                code: typeof query.filters.code === 'string' ? query.filters.code : undefined,
                search: query.search,
                filters: query.filters,
                sort: query.sort,
                limit: query.limit,
                offset: query.offset ?? 0,
            }),
            Effect.map(({ rows, total }) => ({
                rows: rows.map(transformHeader),
                total,
            })),
        )
    },

    listBusinessSettingsPage: (query: ListQuery) => {
        return pipe(
            ParametersRepository.findHeadersPage('B', {
                code: typeof query.filters.code === 'string' ? query.filters.code : undefined,
                search: query.search,
                filters: query.filters,
                sort: query.sort,
                limit: query.limit,
                offset: query.offset ?? 0,
            }),
            Effect.map(({ rows, total }) => ({
                rows: rows.map(transformHeader),
                total,
            })),
        )
    },

    /**
     * Get list of distinct tables (metadata: B0012).
     * 
     * @returns An Effect resolving to an array of table names
     */
    getTables: () => {
        return pipe(
            ParametersRepository.findDistinct('B0012', 'value1'),
            Effect.map(results => results.map(r => r.value as string))
        )
    },

    /**
     * Get list of columns for a specific table (metadata: B0013).
     * 
     * @param table - The table name
     * @returns An Effect resolving to an array of column names
     */
    getColumns: (table: string) => {
        return pipe(
            ParametersRepository.findDistinct('B0013', 'value1', { value3: table }),
            Effect.map(results => results.map(r => r.value as string))
        )
    },

    /**
     * Get data type for a specific column (metadata: B0013).
     * 
     * @param table - The table name
     * @param column - The column name
     * @returns An Effect resolving to the data type or null
     */
    getDataType: (table: string, column: string) => {
        return pipe(
            ParametersRepository.findByFilters('B0013', { value1: column, value3: table }),
            Effect.map(results => results.length > 0 ? results[0].value2 : null)
        )
    },

    /**
     * Get list of operators for a specific data type (metadata: B0014).
     * 
     * @param dataType - The data type
     * @returns An Effect resolving to an array of operators
     */
    getOperators: (dataType: string) => {
        return pipe(
            ParametersRepository.findDistinct('B0014', 'value1', { value2: dataType }),
            Effect.map(results => results.map(r => r.value as string))
        )
    },

    /**
     * Get list of conditions (metadata: B0015).
     * 
     * @returns An Effect resolving to an array of conditions
     */
    getConditions: () => {
        return pipe(
            ParametersRepository.findDistinct('B0015', 'value1'),
            Effect.map(results => results.map(r => r.value as string))
        )
    },

    /**
     * Get list of valid values for a column (metadata: B0016).
     * 
     * @param table - The table name
     * @param column - The column name
     * @returns An Effect resolving to an array of valid values
     */
    getColumnValues: (table: string, column: string) => {
        return pipe(
            ParametersRepository.findDistinct('B0016', 'value1', { value2: column, value3: table }),
            Effect.map(results => results.map(r => r.value as string))
        )
    }
}

// Helpers
const transformDetail = (d: typeof frs9ParamCommond.$inferSelect) => ({
    id: Number(d.pkid),
    param_code: d.paramCode,
    param_seq: d.paramSeq,
    value1: d.value1,
    value2: d.value2,
    value3: d.value3,
    param_desc: d.paramdesc,
    is_active: true, // Mocking active as true since column missing
})

const transformHeader = (h: any) => ({
    pkid: Number(h.pkid),
    param_code: h.paramCode,
    param_name: h.paramName,
    param_usage: h.paramUsage,
    param_type: h.paramType,
    banking_type: h.bankingType,
    is_active: h.isActive,
    requires_approval: h.requiresApproval,
    created_date: h.createddate,
    details: h.details ? h.details.map(transformDetail) : [],
})
