import { eq, and, desc, asc, like, or } from 'drizzle-orm'
import { legacyDb as db } from '../config'
import { frs9ParamBucketh, frs9ParamBucketd } from '../db/schema'
import { Effect } from 'effect'
import { DatabaseError, NotFoundError } from '../lib/errors'

export const BucketParametersRepository = {
    // Header Operations
    findHeaders: (search?: string, basis?: string) => {
        return Effect.tryPromise({
            try: async () => {
                const conditions = []
                if (search) {
                    conditions.push(or(
                        like(frs9ParamBucketh.bucketGroup, `%${search}%`),
                        like(frs9ParamBucketh.bucketDesc, `%${search}%`)
                    )!)
                }
                if (basis) {
                    conditions.push(eq(frs9ParamBucketh.basis, basis))
                }

                return await db
                    .select()
                    .from(frs9ParamBucketh)
                    .where(and(...conditions))
                    .orderBy(desc(frs9ParamBucketh.createddate))
            },
            catch: (error) => new DatabaseError({ message: 'Failed to find bucket headers', operation: 'query', cause: error })
        })
    },

    findHeaderById: (id: bigint) => {
        return Effect.tryPromise({
            try: async () => {
                const results = await db
                    .select()
                    .from(frs9ParamBucketh)
                    .where(eq(frs9ParamBucketh.pkid, Number(id)))
                return results[0] || null
            },
            catch: (error) => new DatabaseError({ message: 'Failed to find bucket header', operation: 'query', cause: error })
        })
    },

    createHeader: (data: typeof frs9ParamBucketh.$inferInsert) => {
        return Effect.tryPromise({
            try: async () => {
                const results = await db
                    .insert(frs9ParamBucketh)
                    .values(data)
                    .returning()
                return results[0]
            },
            catch: (error) => new DatabaseError({ message: 'Failed to create bucket header', operation: 'insert', cause: error })
        })
    },

    updateHeader: (id: bigint, data: Partial<typeof frs9ParamBucketh.$inferInsert>) => {
        return Effect.tryPromise({
            try: async () => {
                const results = await db
                    .update(frs9ParamBucketh)
                    .set(data)
                    .where(eq(frs9ParamBucketh.pkid, Number(id)))
                    .returning()
                return results[0] || null
            },
            catch: (error) => new DatabaseError({ message: 'Failed to update bucket header', operation: 'update', cause: error })
        })
    },

    deleteHeader: (id: bigint) => {
        return Effect.tryPromise({
            try: async () => {
                // Transaction mainly to ensure detail deletion
                await db.transaction(async (tx) => {
                    await tx.delete(frs9ParamBucketd).where(eq(frs9ParamBucketd.pkidHeader, Number(id)))
                    await tx.delete(frs9ParamBucketh).where(eq(frs9ParamBucketh.pkid, Number(id)))
                })
                return true
            },
            catch: (error) => new DatabaseError({ message: 'Failed to delete bucket header', operation: 'delete', cause: error })
        })
    },

    // Detail Operations
    findDetailsByHeaderId: (headerId: bigint) => {
        return Effect.tryPromise({
            try: async () => {
                return await db
                    .select()
                    .from(frs9ParamBucketd)
                    .where(eq(frs9ParamBucketd.pkidHeader, Number(headerId)))
                    .orderBy(asc(frs9ParamBucketd.rangeStart))
            },
            catch: (error) => new DatabaseError({ message: 'Failed to find bucket details', operation: 'query', cause: error })
        })
    },

    findDetailById: (id: bigint) => {
        return Effect.tryPromise({
            try: async () => {
                const results = await db
                    .select()
                    .from(frs9ParamBucketd)
                    .where(eq(frs9ParamBucketd.pkid, Number(id)))
                return results[0] || null
            },
            catch: (error) => new DatabaseError({ message: 'Failed to find bucket detail', operation: 'query', cause: error })
        })
    },

    createDetail: (data: typeof frs9ParamBucketd.$inferInsert) => {
        return Effect.tryPromise({
            try: async () => {
                const results = await db
                    .insert(frs9ParamBucketd)
                    .values(data)
                    .returning()
                return results[0]
            },
            catch: (error) => new DatabaseError({ message: 'Failed to create bucket detail', operation: 'insert', cause: error })
        })
    },

    updateDetail: (id: bigint, data: Partial<typeof frs9ParamBucketd.$inferInsert>) => {
        return Effect.tryPromise({
            try: async () => {
                const results = await db
                    .update(frs9ParamBucketd)
                    .set(data)
                    .where(eq(frs9ParamBucketd.pkid, Number(id)))
                    .returning()
                return results[0] || null
            },
            catch: (error) => new DatabaseError({ message: 'Failed to update bucket detail', operation: 'update', cause: error })
        })
    },

    deleteDetail: (id: bigint) => {
        return Effect.tryPromise({
            try: async () => {
                const results = await db
                    .delete(frs9ParamBucketd)
                    .where(eq(frs9ParamBucketd.pkid, Number(id)))
                    .returning()
                return results.length > 0
            },
            catch: (error) => new DatabaseError({ message: 'Failed to delete bucket detail', operation: 'delete', cause: error })
        })
    }
}
