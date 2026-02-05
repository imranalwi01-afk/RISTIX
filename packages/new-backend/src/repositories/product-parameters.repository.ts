import { eq, desc } from 'drizzle-orm'
import { legacyDb as db } from '../config'
import { frs9ParamProduct } from '../db/schema'
import { Effect } from 'effect'
import { DatabaseError } from '../lib/errors'

export const ProductParametersRepository = {
    /**
     * Find all product parameters.
     * 
     * @returns An Effect resolving to an array of product parameters
     */
    findAll: () => {
        return Effect.tryPromise({
            try: async () => {
                return await db
                    .select()
                    .from(frs9ParamProduct)
                    .orderBy(desc(frs9ParamProduct.createddate))
            },
            catch: (error) => new DatabaseError({ message: 'Failed to find product parameters', operation: 'query', cause: error })
        })
    },

    /**
     * Find a product parameter by ID.
     * 
     * @param id - The product parameter ID
     * @returns An Effect resolving to the product parameter or null
     */
    findById: (id: bigint) => {
        return Effect.tryPromise({
            try: async () => {
                const results = await db
                    .select()
                    .from(frs9ParamProduct)
                    .where(eq(frs9ParamProduct.pkid, Number(id)))
                return results[0] || null
            },
            catch: (error) => new DatabaseError({ message: 'Failed to find product parameter', operation: 'query', cause: error })
        })
    },

    /**
     * Create a new product parameter.
     * 
     * @param data - The product parameter data
     * @returns An Effect resolving to the created product parameter
     */
    create: (data: typeof frs9ParamProduct.$inferInsert) => {
        return Effect.tryPromise({
            try: async () => {
                const results = await db
                    .insert(frs9ParamProduct)
                    .values(data)
                    .returning()
                return results[0]
            },
            catch: (error) => new DatabaseError({ message: 'Failed to create product parameter', operation: 'insert', cause: error })
        })
    },

    /**
     * Update an existing product parameter.
     * 
     * @param id - The product parameter ID
     * @param data - The data to update
     * @returns An Effect resolving to the updated product parameter or null
     */
    update: (id: bigint, data: Partial<typeof frs9ParamProduct.$inferInsert>) => {
        return Effect.tryPromise({
            try: async () => {
                const results = await db
                    .update(frs9ParamProduct)
                    .set(data)
                    .where(eq(frs9ParamProduct.pkid, Number(id)))
                    .returning()
                return results[0] || null
            },
            catch: (error) => new DatabaseError({ message: 'Failed to update product parameter', operation: 'update', cause: error })
        })
    },

    /**
     * Delete a product parameter.
     * 
     * @param id - The product parameter ID
     * @returns An Effect resolving to true on success
     */
    delete: (id: bigint) => {
        return Effect.tryPromise({
            try: async () => {
                const results = await db
                    .delete(frs9ParamProduct)
                    .where(eq(frs9ParamProduct.pkid, Number(id)))
                    .returning()
                return results.length > 0
            },
            catch: (error) => new DatabaseError({ message: 'Failed to delete product parameter', operation: 'delete', cause: error })
        })
    }
}
