import { Effect } from 'effect'
import { legacyDb as db } from '../config'
import { frs9ImpCaLgdConfig } from '../db/schema'
import { eq, and, like, asc, desc } from 'drizzle-orm'
import { queryEffect } from './base.repository'
import { DatabaseError, NotFoundError } from '../lib/errors'

export interface LgdQueryOptions {
    search?: string
    lgdMethod?: number
    isActive?: boolean
}

export const LgdConfigurationsRepository = {
    findAll: (options?: LgdQueryOptions) => {
        return queryEffect(async () => {
            const conditions = []

            if (options?.search) {
                conditions.push(like(frs9ImpCaLgdConfig.lgdModelName, `%${options.search}%`))
            }

            if (options?.lgdMethod !== undefined) {
                conditions.push(eq(frs9ImpCaLgdConfig.lgdMethod, options.lgdMethod))
            }

            if (options?.isActive !== undefined) {
                conditions.push(eq(frs9ImpCaLgdConfig.activeFlag, options.isActive))
            }

            return await db
                .select()
                .from(frs9ImpCaLgdConfig)
                .where(conditions.length > 0 ? and(...conditions) : undefined)
                .orderBy(asc(frs9ImpCaLgdConfig.lgdModelName))
        })
    },

    findById: (id: number) => {
        return queryEffect(async () => {
            const result = await db
                .select()
                .from(frs9ImpCaLgdConfig)
                .where(eq(frs9ImpCaLgdConfig.pkid, id))
                .limit(1)

            return result[0]
        })
    },

    create: (data: typeof frs9ImpCaLgdConfig.$inferInsert) => {
        return queryEffect(async () => {
            const result = await db
                .insert(frs9ImpCaLgdConfig)
                .values(data)
                .returning()

            return result[0]
        })
    },

    update: (id: number, data: Partial<typeof frs9ImpCaLgdConfig.$inferInsert>) => {
        return queryEffect(async () => {
            const result = await db
                .update(frs9ImpCaLgdConfig)
                .set(data)
                .where(eq(frs9ImpCaLgdConfig.pkid, id))
                .returning()

            return result[0]
        })
    },

    delete: (id: number) => {
        return queryEffect(async () => {
            const result = await db
                .delete(frs9ImpCaLgdConfig)
                .where(eq(frs9ImpCaLgdConfig.pkid, id))
                .returning()

            return result[0]
        })
    }
}
