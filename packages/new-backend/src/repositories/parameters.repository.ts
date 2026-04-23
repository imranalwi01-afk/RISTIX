import { legacyDb } from '../config'
import { frs9ParamCommonh, frs9ParamCommond } from '../db/schema'
import { eq, and, asc, desc, inArray, ilike, or, sql } from 'drizzle-orm'
import { queryEffect } from './base.repository'
import type { InferInsertModel } from 'drizzle-orm'

/**
 * Repository for accessing Parameters data (App Settings and Business Settings).
 */
export const ParametersRepository = {
    // Header Operations

    /**
     * Find parameter headers.
     * 
     * @param paramType - The type of parameter ('S' for System, 'B' for Business)
     * @param code - Optional parameter code to filter by
     * @returns An Effect resolving to an array of headers
     */
    findHeaders: (paramType: string | string[], code?: string) => {
        return queryEffect(async () => {
            const typeCondition = Array.isArray(paramType)
                ? inArray(frs9ParamCommonh.paramType, paramType)
                : eq(frs9ParamCommonh.paramType, paramType)

            return await legacyDb.query.frs9ParamCommonh.findMany({
                where: and(
                    typeCondition,
                    code ? eq(frs9ParamCommonh.paramCode, code) : undefined
                ),
                with: {
                    details: true
                },
                orderBy: frs9ParamCommonh.paramCode
            })
        })
    },

    findHeadersPage: (
        paramType: string | string[],
        options: {
            code?: string
            search?: string
            filters?: Record<string, string | number | boolean | string[]>
            sort?: Array<{ field: string; direction: 'asc' | 'desc' }>
            limit: number
            offset: number
        },
    ) => {
        return queryEffect(async () => {
            const typeCondition = Array.isArray(paramType)
                ? inArray(frs9ParamCommonh.paramType, paramType)
                : eq(frs9ParamCommonh.paramType, paramType)

            const searchValue = options.search?.trim()
            const commonCode = typeof options.filters?.commonCode === 'string' ? options.filters.commonCode : undefined
            const description = typeof options.filters?.description === 'string' ? options.filters.description : undefined
            const value = typeof options.filters?.value === 'string' ? options.filters.value : undefined
            const createdBy = typeof options.filters?.createdBy === 'string' ? options.filters.createdBy : undefined
            const category = typeof options.filters?.category === 'string' ? options.filters.category : undefined

            const whereClause = and(
                typeCondition,
                options.code ? eq(frs9ParamCommonh.paramCode, options.code) : undefined,
                category ? eq(frs9ParamCommonh.paramType, category) : undefined,
                searchValue ? or(
                    ilike(frs9ParamCommonh.paramCode, `%${searchValue}%`),
                    ilike(frs9ParamCommonh.paramName, `%${searchValue}%`),
                    ilike(frs9ParamCommonh.paramUsage, `%${searchValue}%`),
                    ilike(frs9ParamCommonh.createdby, `%${searchValue}%`),
                ) : undefined,
                commonCode ? ilike(frs9ParamCommonh.paramCode, `%${commonCode}%`) : undefined,
                description ? ilike(frs9ParamCommonh.paramName, `%${description}%`) : undefined,
                value ? ilike(frs9ParamCommonh.paramUsage, `%${value}%`) : undefined,
                createdBy ? ilike(frs9ParamCommonh.createdby, `%${createdBy}%`) : undefined,
            )

            const sortField = options.sort?.[0]?.field
            const sortDirection = options.sort?.[0]?.direction ?? 'asc'
            const sortColumn =
                sortField === 'createdDate' || sortField === 'CreatedDate' || sortField === 'created_date'
                    ? frs9ParamCommonh.createddate
                    : sortField === 'updatedDate' || sortField === 'UpdatedDate'
                        ? frs9ParamCommonh.updateddate
                        : sortField === 'description' || sortField === 'Description' || sortField === 'param_desc'
                            ? frs9ParamCommonh.paramName
                            : sortField === 'value' || sortField === 'Value' || sortField === 'param_value'
                                ? frs9ParamCommonh.paramUsage
                                : sortField === 'createdBy' || sortField === 'CreatedBy' || sortField === 'created_by'
                                    ? frs9ParamCommonh.createdby
                                    : sortField === 'category' || sortField === 'param_category'
                                        ? frs9ParamCommonh.paramType
                                        : frs9ParamCommonh.paramCode

            const orderByClause = sortDirection === 'desc'
                ? [desc(sortColumn), asc(frs9ParamCommonh.paramCode)]
                : [asc(sortColumn), asc(frs9ParamCommonh.paramCode)]

            const [rows, totalResult] = await Promise.all([
                legacyDb
                    .select()
                    .from(frs9ParamCommonh)
                    .where(whereClause)
                    .orderBy(...orderByClause)
                    .limit(options.limit)
                    .offset(options.offset),
                legacyDb
                    .select({ count: sql<number>`count(*)::int` })
                    .from(frs9ParamCommonh)
                    .where(whereClause),
            ])

            return {
                rows,
                total: Number(totalResult[0]?.count ?? 0),
            }
        })
    },

    /**
     * Find a single header by its unique code.
     * 
     * @param code - The parameter code
     * @returns An Effect resolving to the header or null
     */
    findHeaderByCode: (code: string) => {
        return queryEffect(async () => {
            return await legacyDb.query.frs9ParamCommonh.findFirst({
                where: eq(frs9ParamCommonh.paramCode, code),
                with: {
                    details: true
                }
            })
        })
    },

    /**
     * Create a new parameter header.
     * 
     * @param data - The data for the new header
     * @returns An Effect resolving to the created header
     */
    createHeader: (data: InferInsertModel<typeof frs9ParamCommonh>) => {
        return queryEffect(async () => {
            const result = await legacyDb
                .insert(frs9ParamCommonh)
                .values(data)
                .returning()
            return result[0]
        })
    },

    /**
     * Update an existing parameter header.
     * 
     * @param code - The parameter code
     * @param data - The data to update
     * @returns An Effect resolving to the updated header
     */
    updateHeader: (code: string, data: Partial<InferInsertModel<typeof frs9ParamCommonh>>) => {
        return queryEffect(async () => {
            const result = await legacyDb
                .update(frs9ParamCommonh)
                .set(data)
                .where(eq(frs9ParamCommonh.paramCode, code))
                .returning()
            return result[0]
        })
    },

    /**
     * Delete a parameter header and its details.
     * 
     * @param code - The parameter code
     * @returns An Effect resolving to the deleted header
     */
    deleteHeader: (code: string) => {
        return queryEffect(async () => {
            // First delete any associated details
            await legacyDb
                .delete(frs9ParamCommond)
                .where(eq(frs9ParamCommond.paramCode, code))

            // Then delete the header
            const result = await legacyDb
                .delete(frs9ParamCommonh)
                .where(eq(frs9ParamCommonh.paramCode, code))
                .returning()
            return result[0]
        })
    },

    // Detail Operations

    /**
     * Find details for a specific parameter code.
     * 
     * @param code - The parameter code
     * @returns An Effect resolving to an array of details
     */
    findDetailByCode: (code: string) => {
        return queryEffect(async () => {
            return await legacyDb
                .select()
                .from(frs9ParamCommond)
                .where(eq(frs9ParamCommond.paramCode, code))
                .orderBy(frs9ParamCommond.paramSeq)
        })
    },

    /**
     * Find a specific detail by paramCode and paramSeq.
     * Used for duplicate sequence validation.
     * 
     * @param code - The parameter code
     * @param seq - The sequence number
     * @returns An Effect resolving to the detail or null
     */
    findDetailBySeq: (code: string, seq: number) => {
        return queryEffect(async () => {
            const results = await legacyDb
                .select()
                .from(frs9ParamCommond)
                .where(
                    and(
                        eq(frs9ParamCommond.paramCode, code),
                        eq(frs9ParamCommond.paramSeq, seq)
                    )
                )
            return results[0] || null
        })
    },

    /**
     * Find a specific detail by paramCode and values.
     * Used for duplicate record validation in Business Setup.
     * 
     * @param code - The parameter code
     * @param value1 - Value 1
     * @param value2 - Value 2
     * @param value3 - Value 3
     * @returns An Effect resolving to the detail or null
     */
    findDetailByValues: (code: string, value1: string, value2: string, value3: string) => {
        return queryEffect(async () => {
            const results = await legacyDb
                .select()
                .from(frs9ParamCommond)
                .where(
                    and(
                        eq(frs9ParamCommond.paramCode, code),
                        eq(frs9ParamCommond.value1, value1),
                        eq(frs9ParamCommond.value2, value2),
                        eq(frs9ParamCommond.value3, value3)
                    )
                )
            return results[0] || null
        })
    },

    /**
     * Create a new parameter detail.
     * 
     * @param data - The data for the new detail
     * @returns An Effect resolving to the created detail
     */
    createDetail: (data: InferInsertModel<typeof frs9ParamCommond>) => {
        return queryEffect(async () => {
            const result = await legacyDb
                .insert(frs9ParamCommond)
                .values(data)
                .returning()
            return result[0]
        })
    },

    /**
     * Update an existing parameter detail.
     * 
     * @param id - The ID of the detail
     * @param data - The data to update
     * @returns An Effect resolving to the updated detail
     */
    updateDetail: (id: number | bigint, data: Partial<InferInsertModel<typeof frs9ParamCommond>>) => {
        return queryEffect(async () => {
            const result = await legacyDb
                .update(frs9ParamCommond)
                .set(data)
                .where(eq(frs9ParamCommond.pkid, BigInt(id)))
                .returning()
            return result[0]
        })
    },

    /**
     * Delete a parameter detail.
     * 
     * @param id - The ID of the detail
     * @returns An Effect resolving to the deleted detail
     */
    deleteDetail: (id: bigint) => {
        return queryEffect(async () => {
            const result = await legacyDb
                .delete(frs9ParamCommond)
                .where(eq(frs9ParamCommond.pkid, id))
                .returning()
            return result[0]
        })
    },

    // Specialized Queries (for Business Settings)

    /**
     * Find distinct values for a field.
     * 
     * @param code - The parameter code
     * @param field - The field to select distinct values from
     * @param filters - Optional additional filters
     * @returns An Effect resolving to an array of distinct values
     */
    findDistinct: (
        code: string,
        field: keyof typeof frs9ParamCommond.$inferSelect,
        filters?: Record<string, any>
    ) => {
        return queryEffect(async () => {
            const conditions = [eq(frs9ParamCommond.paramCode, code)]

            if (filters) {
                if (filters.value1) conditions.push(ilike(frs9ParamCommond.value1, filters.value1))
                if (filters.value2) conditions.push(ilike(frs9ParamCommond.value2, filters.value2))
                if (filters.value3) conditions.push(ilike(frs9ParamCommond.value3, filters.value3))
            }

            const column = frs9ParamCommond[field]

            return await legacyDb
                .selectDistinct({ value: column })
                .from(frs9ParamCommond)
                .where(and(...conditions))
                .orderBy(column)
        })
    },

    /**
     * Find parameter details by filters.
     * 
     * @param code - The parameter code
     * @param filters - The filters to apply (value1, value2, value3)
     * @returns An Effect resolving to an array of details
     */
    findByFilters: (
        code: string,
        filters: Record<string, any>
    ) => {
        return queryEffect(async () => {
            const conditions = [eq(frs9ParamCommond.paramCode, code)]

            if (filters.value1) conditions.push(ilike(frs9ParamCommond.value1, filters.value1))
            if (filters.value2) conditions.push(ilike(frs9ParamCommond.value2, filters.value2))
            if (filters.value3) conditions.push(ilike(frs9ParamCommond.value3, filters.value3))

            return await legacyDb
                .select()
                .from(frs9ParamCommond)
                .where(and(...conditions))
        })
    }
}
