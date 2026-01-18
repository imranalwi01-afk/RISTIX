import { legacyDb as db } from '../config'
import { frs9ParamCommonh, frs9ParamCommond } from '../db/schema'
import { eq, and, asc } from 'drizzle-orm'
import { queryEffect } from './base.repository'
import type { InferInsertModel } from 'drizzle-orm'

export const ParametersRepository = {
    // Header Operations
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

    createHeader: (data: InferInsertModel<typeof frs9ParamCommonh>) => {
        return queryEffect(async () => {
            const result = await db
                .insert(frs9ParamCommonh)
                .values(data)
                .returning()
            return result[0]
        })
    },

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
    findDetailByCode: (code: string) => {
        return queryEffect(async () => {
            return await db
                .select()
                .from(frs9ParamCommond)
                .where(eq(frs9ParamCommond.paramCode, code))
                .orderBy(frs9ParamCommond.paramSeq)
        })
    },

    createDetail: (data: InferInsertModel<typeof frs9ParamCommond>) => {
        return queryEffect(async () => {
            const result = await db
                .insert(frs9ParamCommond)
                .values(data)
                .returning()
            return result[0]
        })
    },

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
