import { legacyDb as db } from '../config'
import { frs9ParamCommonh, frs9ParamCommond } from '../db/schema'
import { eq, and, asc } from 'drizzle-orm'
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
    findHeaders: (paramType: string, code?: string) => {
        return queryEffect(async () => {
            return await db.query.frs9ParamCommonh.findMany({
                where: and(
                    eq(frs9ParamCommonh.paramType, paramType),
                    code ? eq(frs9ParamCommonh.paramCode, code) : undefined
                ),
                with: {
                    details: true
                },
                orderBy: frs9ParamCommonh.paramCode
            })
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
            return await db.query.frs9ParamCommonh.findFirst({
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
            const result = await db
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
            const result = await db
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
            await db
                .delete(frs9ParamCommond)
                .where(eq(frs9ParamCommond.paramCode, code))

            // Then delete the header
            const result = await db
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
            return await db
                .select()
                .from(frs9ParamCommond)
                .where(eq(frs9ParamCommond.paramCode, code))
                .orderBy(frs9ParamCommond.paramSeq)
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
            const result = await db
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
            const result = await db
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
            const result = await db
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
                if (filters.value1) conditions.push(eq(frs9ParamCommond.value1, filters.value1))
                if (filters.value2) conditions.push(eq(frs9ParamCommond.value2, filters.value2))
                if (filters.value3) conditions.push(eq(frs9ParamCommond.value3, filters.value3))
            }

            const column = frs9ParamCommond[field]

            return await db
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

            if (filters.value1) conditions.push(eq(frs9ParamCommond.value1, filters.value1))
            if (filters.value2) conditions.push(eq(frs9ParamCommond.value2, filters.value2))
            if (filters.value3) conditions.push(eq(frs9ParamCommond.value3, filters.value3))

            return await db
                .select()
                .from(frs9ParamCommond)
                .where(and(...conditions))
        })
    }
}
