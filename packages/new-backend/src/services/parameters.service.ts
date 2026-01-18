import { Effect, pipe } from 'effect'
import { ParametersRepository } from '../repositories/parameters.repository'
import { NotFoundError, DatabaseError } from '../lib/errors'
import { frs9ParamCommond } from '../db/schema'

export const ParametersService = {
    // App Settings
    listAppSettings: (code?: string, paramType: string = 'S') => {
        return pipe(
            ParametersRepository.findHeaders(paramType, code),
            Effect.map(headers => headers.map(transformHeader))
        )
    },

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

    getAppSettingDetails: (code: string) => {
        return pipe(
            ParametersRepository.findDetailByCode(code),
            Effect.map(details => details.map(transformDetail))
        )
    },

    createAppSetting: (data: any, userId: string) => {
        const now = new Date().toISOString()
        const payload = {
            paramCode: data.paramCode,
            paramName: data.paramName,
            paramUsage: data.paramUsage,
            paramType: data.paramType,
            bankingType: data.bankingType,
            isActive: data.isActive,
            requiresApproval: data.requiresApproval,
            createdby: userId,
            createdhost: 'localhost',
            createddate: now,
            updatedby: userId,
            updatedhost: 'localhost',
            updateddate: now,
        }
        return pipe(
            ParametersRepository.createHeader(payload as any),
            Effect.map(transformHeader)
        )
    },

    updateAppSetting: (code: string, data: any, userId: string) => {
        const now = new Date().toISOString()
        const payload = {
            paramName: data.paramName,
            paramUsage: data.paramUsage,
            paramType: data.paramType,
            bankingType: data.bankingType,
            isActive: data.isActive,
            requiresApproval: data.requiresApproval,
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
                    // activeFlag removed as it doesn't exist in schema
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

    // Business Settings Queries
    listBusinessSettings: (code?: string) => {
        // If code provided, return details
        if (code) {
            return pipe(
                ParametersRepository.findDetailByCode(code),
                Effect.map(details => details.map(transformDetail))
            )
        }
        return Effect.succeed([])
    },

    getTables: () => {
        return pipe(
            ParametersRepository.findDistinct('B0012', 'value1'),
            Effect.map(results => results.map(r => r.value as string))
        )
    },

    getColumns: (table: string) => {
        return pipe(
            ParametersRepository.findDistinct('B0013', 'value1', { value3: table }),
            Effect.map(results => results.map(r => r.value as string))
        )
    },

    getDataType: (table: string, column: string) => {
        return pipe(
            ParametersRepository.findByFilters('B0013', { value1: column, value3: table }),
            Effect.map(results => results.length > 0 ? results[0].value2 : null)
        )
    },

    getOperators: (dataType: string) => {
        return pipe(
            ParametersRepository.findDistinct('B0014', 'value1', { value2: dataType }),
            Effect.map(results => results.map(r => r.value as string))
        )
    },

    getConditions: () => {
        return pipe(
            ParametersRepository.findDistinct('B0015', 'value1'),
            Effect.map(results => results.map(r => r.value as string))
        )
    },

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
    details: h.details ? h.details.map(transformDetail) : [],
})
