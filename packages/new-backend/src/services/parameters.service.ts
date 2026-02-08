import { Effect, pipe } from 'effect'
import { ParametersRepository } from '../repositories/parameters.repository'
import { NotFoundError, DatabaseError } from '../lib/errors'
import { frs9ParamCommond } from '../db/schema'

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
                    : Effect.fail(new NotFoundError({ resource: 'App Setting', id: code }))) as any
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
                    return Effect.fail(new Error(`Parameter code '${data.paramCode}' already exists`)) as any
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
                return ParametersRepository.createHeader(payload as any)
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
                    : Effect.fail(new NotFoundError({ resource: 'App Setting', id: code }))) as any
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
                if (!header) return Effect.fail(new NotFoundError({ resource: 'Parent Setting', id: data.paramCode })) as any

                const now = new Date().toISOString()
                const payload = {
                    paramCode: data.paramCode,
                    paramSeq: data.paramSeq,
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

                return ParametersRepository.createDetail(payload as any) as any
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

        return pipe(
            ParametersRepository.updateDetail(id, payload),
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
                    ? Effect.succeed({ message: 'Detail deleted' })
                    : Effect.fail(new NotFoundError({ resource: 'App Setting Detail', id: String(id) }))) as any
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
                    : Effect.fail(new NotFoundError({ resource: 'App Setting', id: code }))) as any
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

