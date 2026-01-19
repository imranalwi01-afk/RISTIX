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
    /**
     * Find all LGD configurations with optional filtering.
     * 
     * @param options - Filter options
     * @returns An Effect resolving to an array of configurations
     */
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

    /**
     * Find an LGD configuration by ID.
     * 
     * @param id - The configuration ID
     * @returns An Effect resolving to the configuration or undefined
     */
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

    /**
     * Create a new LGD configuration.
     * 
     * @param data - The configuration data
     * @returns An Effect resolving to the created configuration
     */
    create: (data: typeof frs9ImpCaLgdConfig.$inferInsert) => {
        return queryEffect(async () => {
            const result = await db
                .insert(frs9ImpCaLgdConfig)
                .values(data)
                .returning()

            return result[0]
        })
    },

    /**
     * Update an existing LGD configuration.
     * 
     * @param id - The configuration ID
     * @param data - The data to update
     * @returns An Effect resolving to the updated configuration
     */
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

    /**
     * Delete an LGD configuration.
     * 
     * @param id - The configuration ID
     * @returns An Effect resolving to the deleted configuration
     */
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
