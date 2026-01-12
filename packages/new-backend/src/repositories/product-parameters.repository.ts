import { eq, desc } from 'drizzle-orm'
import { legacyDb as db } from '../config'
import { frs9ParamProduct } from '../db/schema'
import { Effect } from 'effect'
import { DatabaseError } from '../lib/errors'

export const ProductParametersRepository = {
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
