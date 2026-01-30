import { eq, and, desc, like, or } from 'drizzle-orm'
import { legacyDb as db } from '../config'
import { frs9ImpCaPdConfig } from '../db/schema'
import { Effect } from 'effect'
import { DatabaseError } from '../lib/errors'

export const PdConfigurationsRepository = {
    /**
     * Find all PD configurations with filters.
     * 
     * @param search - Search term
     * @param selectedMethod - PD method ID
     * @param bucket - Bucket group
     * @param activeFlag - Active status flag
     * @returns An Effect resolving to an array of PD configurations
     */
    findAll: (search?: string, selectedMethod?: string, bucket?: string, activeFlag?: boolean) => {
        return Effect.tryPromise({
            try: async () => {
                const conditions = []
                if (search) {
                    conditions.push(
                        or(
                            like(frs9ImpCaPdConfig.pdModelName, `%${search}%`),
                        )!
                    )
                }
                if (selectedMethod) {
                    conditions.push(eq(frs9ImpCaPdConfig.pdMethod, selectedMethod))
                }
                if (bucket) {
                    conditions.push(eq(frs9ImpCaPdConfig.bucketGroup, bucket))
                }
                if (activeFlag !== undefined) {
                    conditions.push(eq(frs9ImpCaPdConfig.activeFlag, activeFlag))
                }

                return await db
                    .select()
                    .from(frs9ImpCaPdConfig)
                    .where(and(...conditions))
                    .orderBy(desc(frs9ImpCaPdConfig.createddate))
            },
            catch: (error) => new DatabaseError({ message: 'Failed to find PD configurations', operation: 'query', cause: error })
        })
    },

    /**
     * Find a PD configuration by ID.
     * 
     * @param id - The configuration ID
     * @returns An Effect resolving to the configuration or null
     */
    findById: (id: bigint) => {
        return Effect.tryPromise({
            try: async () => {
                const results = await db
                    .select()
                    .from(frs9ImpCaPdConfig)
                    .where(eq(frs9ImpCaPdConfig.pkid, Number(id)))
                return results[0] || null
            },
            catch: (error) => new DatabaseError({ message: 'Failed to find PD configuration', operation: 'query', cause: error })
        })
    },

    /**
     * Create a new PD configuration.
     * 
     * @param data - The configuration data
     * @returns An Effect resolving to the created configuration
     */
    create: (data: typeof frs9ImpCaPdConfig.$inferInsert) => {
        return Effect.tryPromise({
            try: async () => {
                const results = await db
                    .insert(frs9ImpCaPdConfig)
                    .values(data)
                    .returning()
                return results[0]
            },
            catch: (error) => new DatabaseError({ message: 'Failed to create PD configuration', operation: 'insert', cause: error })
        })
    },

    /**
     * Update an existing PD configuration.
     * 
     * @param id - The configuration ID
     * @param data - The data to update
     * @returns An Effect resolving to the updated configuration or null
     */
    update: (id: bigint, data: Partial<typeof frs9ImpCaPdConfig.$inferInsert>) => {
        return Effect.tryPromise({
            try: async () => {
                const results = await db
                    .update(frs9ImpCaPdConfig)
                    .set(data)
                    .where(eq(frs9ImpCaPdConfig.pkid, Number(id)))
                    .returning()
                return results[0] || null
            },
            catch: (error) => new DatabaseError({ message: 'Failed to update PD configuration', operation: 'update', cause: error })
        })
    },

    /**
     * Delete a PD configuration.
     * 
     * @param id - The configuration ID
     * @returns An Effect resolving to true on success
     */
    delete: (id: bigint) => {
        return Effect.tryPromise({
            try: async () => {
                const results = await db
                    .delete(frs9ImpCaPdConfig)
                    .where(eq(frs9ImpCaPdConfig.pkid, Number(id)))
                    .returning() // returning works in Postgres, but if legacy differs, we might need simple delete
                return true // Assuming delete success if no error throws. Drizzle delete returns Result usually.
            },
            catch: (error) => new DatabaseError({ message: 'Failed to delete PD configuration', operation: 'delete', cause: error })
        })
    }
}
