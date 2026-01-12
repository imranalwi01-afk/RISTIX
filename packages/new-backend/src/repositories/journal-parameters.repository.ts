import { eq, desc } from 'drizzle-orm'
import { legacyDb as db } from '../config'
import { frs9ParamJournal } from '../db/schema'
import { Effect } from 'effect'
import { DatabaseError } from '../lib/errors'

export const JournalParametersRepository = {
    findAll: () => {
        return Effect.tryPromise({
            try: async () => {
                return await db
                    .select()
                    .from(frs9ParamJournal)
                    .orderBy(desc(frs9ParamJournal.createddate))
            },
            catch: (error) => new DatabaseError({ message: 'Failed to find journal parameters', operation: 'query', cause: error })
        })
    },

    findById: (id: bigint) => {
        return Effect.tryPromise({
            try: async () => {
                const results = await db
                    .select()
                    .from(frs9ParamJournal)
                    .where(eq(frs9ParamJournal.pkid, Number(id)))
                return results[0] || null
            },
            catch: (error) => new DatabaseError({ message: 'Failed to find journal parameter', operation: 'query', cause: error })
        })
    },

    create: (data: typeof frs9ParamJournal.$inferInsert) => {
        return Effect.tryPromise({
            try: async () => {
                const results = await db
                    .insert(frs9ParamJournal)
                    .values(data)
                    .returning()
                return results[0]
            },
            catch: (error) => new DatabaseError({ message: 'Failed to create journal parameter', operation: 'insert', cause: error })
        })
    },

    update: (id: bigint, data: Partial<typeof frs9ParamJournal.$inferInsert>) => {
        return Effect.tryPromise({
            try: async () => {
                const results = await db
                    .update(frs9ParamJournal)
                    .set(data)
                    .where(eq(frs9ParamJournal.pkid, Number(id)))
                    .returning()
                return results[0] || null
            },
            catch: (error) => new DatabaseError({ message: 'Failed to update journal parameter', operation: 'update', cause: error })
        })
    },

    delete: (id: bigint) => {
        return Effect.tryPromise({
            try: async () => {
                const results = await db
                    .delete(frs9ParamJournal)
                    .where(eq(frs9ParamJournal.pkid, Number(id)))
                    .returning()
                return results.length > 0
            },
            catch: (error) => new DatabaseError({ message: 'Failed to delete journal parameter', operation: 'delete', cause: error })
        })
    }
}
