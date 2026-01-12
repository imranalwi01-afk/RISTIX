import { eq, desc } from 'drizzle-orm'
import { legacyDb as db } from '../config'
import { frs9ImpCaEclConfigh, frs9ImpCaEclConfigd } from '../db/schema'
import { Effect } from 'effect'
import { DatabaseError } from '../lib/errors'

export const EclConfigurationsRepository = {
    // Header Operations
    findAllHeaders: () => {
        return Effect.tryPromise({
            try: async () => {
                return await db
                    .select()
                    .from(frs9ImpCaEclConfigh)
                    .orderBy(desc(frs9ImpCaEclConfigh.createddate))
            },
            catch: (error) => new DatabaseError({ message: 'Failed to find ECL headers', operation: 'query', cause: error })
        })
    },

    findHeaderById: (id: bigint) => {
        return Effect.tryPromise({
            try: async () => {
                const results = await db
                    .select()
                    .from(frs9ImpCaEclConfigh)
                    .where(eq(frs9ImpCaEclConfigh.pkid, Number(id)))
                return results[0] || null
            },
            catch: (error) => new DatabaseError({ message: 'Failed to find ECL header', operation: 'query', cause: error })
        })
    },

    findDetailsByHeaderId: (headerId: bigint) => {
        return Effect.tryPromise({
            try: async () => {
                return await db
                    .select()
                    .from(frs9ImpCaEclConfigd)
                    .where(eq(frs9ImpCaEclConfigd.eclModelId, Number(headerId)))
            },
            catch: (error) => new DatabaseError({ message: 'Failed to find ECL details', operation: 'query', cause: error })
        })
    },

    create: (headerData: typeof frs9ImpCaEclConfigh.$inferInsert, detailsData: Array<typeof frs9ImpCaEclConfigd.$inferInsert>) => {
        return Effect.tryPromise({
            try: async () => {
                return await db.transaction(async (tx) => {
                    const [header] = await tx
                        .insert(frs9ImpCaEclConfigh)
                        .values(headerData)
                        .returning()

                    if (detailsData.length > 0) {
                        await tx.insert(frs9ImpCaEclConfigd).values(
                            detailsData.map(d => ({
                                ...d,
                                eclModelId: header.pkid
                            }))
                        )
                    }
                    return header
                })
            },
            catch: (error) => new DatabaseError({ message: 'Failed to create ECL configuration', operation: 'insert', cause: error })
        })
    },

    update: (id: bigint, headerData: Partial<typeof frs9ImpCaEclConfigh.$inferInsert>, detailsData?: Array<typeof frs9ImpCaEclConfigd.$inferInsert>) => {
        return Effect.tryPromise({
            try: async () => {
                return await db.transaction(async (tx) => {
                    const [header] = await tx
                        .update(frs9ImpCaEclConfigh)
                        .set(headerData)
                        .where(eq(frs9ImpCaEclConfigh.pkid, Number(id)))
                        .returning()

                    if (!header) return null

                    if (detailsData) {
                        // Delete existing details
                        await tx.delete(frs9ImpCaEclConfigd).where(eq(frs9ImpCaEclConfigd.eclModelId, Number(id)))

                        if (detailsData.length > 0) {
                            await tx.insert(frs9ImpCaEclConfigd).values(
                                detailsData.map(d => ({
                                    ...d,
                                    eclModelId: Number(id)
                                }))
                            )
                        }
                    }
                    return header
                })
            },
            catch: (error) => new DatabaseError({ message: 'Failed to update ECL configuration', operation: 'update', cause: error })
        })
    },

    delete: (id: bigint) => {
        return Effect.tryPromise({
            try: async () => {
                await db.transaction(async (tx) => {
                    await tx.delete(frs9ImpCaEclConfigd).where(eq(frs9ImpCaEclConfigd.eclModelId, Number(id)))
                    await tx.delete(frs9ImpCaEclConfigh).where(eq(frs9ImpCaEclConfigh.pkid, Number(id)))
                })
                return true
            },
            catch: (error) => new DatabaseError({ message: 'Failed to delete ECL configuration', operation: 'delete', cause: error })
        })
    }
}
