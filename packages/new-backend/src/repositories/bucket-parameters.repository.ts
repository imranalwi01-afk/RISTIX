import { eq, and, desc, asc, like, ilike, or } from 'drizzle-orm'
import { legacyDb as db } from '../config'
import { frs9ParamBucketh, frs9ParamBucketd } from '../db/schema'
import { Effect } from 'effect'
import { DatabaseError, NotFoundError } from '../lib/errors'

/**
 * Repository for accessing Bucket Parameters data.
 */
export const BucketParametersRepository = {
    // Header Operations

    /**
     * Find bucket headers with optional filtering.
     * 
     * @param search - Search term for bucket group or description
     * @param basis - Filter by basis
     * @returns An Effect resolving to an array of bucket headers
     */
    findHeaders: (search?: string, basis?: string, columnFilters?: Record<string, any>) => {
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

                // Apply dynamic column filters
                if (columnFilters) {
                    const colMap: Record<string, any> = {
                        bucketGroup: frs9ParamBucketh.bucketGroup,
                        bucketDesc: frs9ParamBucketh.bucketDesc,
                        basis: frs9ParamBucketh.basis,
                    }
                    for (const [field, value] of Object.entries(columnFilters)) {
                        if (!value || (typeof value === 'string' && !value.trim())) continue
                        const column = colMap[field]
                        if (column) conditions.push(ilike(column, `%${String(value)}%`))
                    }
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

    /**
     * Find a bucket header by ID.
     * 
     * @param id - The ID of the bucket header
     * @returns An Effect resolving to the bucket header or null
     */
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

    /**
     * Create a new bucket header.
     * 
     * @param data - The data for the new bucket header
     * @returns An Effect resolving to the created bucket header
     */
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

    /**
     * Update an existing bucket header.
     * 
     * @param id - The ID of the bucket header
     * @param data - The updated data
     * @returns An Effect resolving to the updated bucket header or null
     */
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

    /**
     * Delete a bucket header and its details.
     * 
     * @param id - The ID of the bucket header
     * @returns An Effect resolving to true on success
     */
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
    // Detail Operations

    /**
     * Find bucket details for a specific header.
     * 
     * @param headerId - The ID of the bucket header
     * @returns An Effect resolving to an array of bucket details
     */
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

    /**
     * Find a bucket detail by ID.
     * 
     * @param id - The ID of the bucket detail
     * @returns An Effect resolving to the bucket detail or null
     */
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

    /**
     * Create a new bucket detail.
     * 
     * @param data - The data for the new bucket detail
     * @returns An Effect resolving to the created bucket detail
     */
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

    /**
     * Update an existing bucket detail.
     * 
     * @param id - The ID of the bucket detail
     * @param data - The updated data
     * @returns An Effect resolving to the updated bucket detail or null
     */
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

    /**
     * Delete a bucket detail.
     * 
     * @param id - The ID of the bucket detail
     * @returns An Effect resolving to true on success
     */
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
