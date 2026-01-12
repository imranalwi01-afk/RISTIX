import { eq, and, desc, like, or, asc } from 'drizzle-orm'
import { legacyDb as db } from '../config'
import { frs9ParamScenarioRulesh, frs9ParamScenarioRulesd } from '../db/schema'
import { Effect } from 'effect'
import { DatabaseError } from '../lib/errors'

export const RuleBaseSettingsRepository = {
    // Header Operations
    findHeaders: (search?: string, ruleType?: string, activeFlag?: boolean) => {
        return Effect.tryPromise({
            try: async () => {
                const conditions = []
                if (search) {
                    conditions.push(or(
                        like(frs9ParamScenarioRulesh.ruleName, `%${search}%`),
                        like(frs9ParamScenarioRulesh.ruleType, `%${search}%`)
                    )!)
                }
                if (ruleType) {
                    conditions.push(eq(frs9ParamScenarioRulesh.ruleType, ruleType))
                }
                if (activeFlag !== undefined) {
                    conditions.push(eq(frs9ParamScenarioRulesh.activeFlag, activeFlag))
                }

                return await db
                    .select()
                    .from(frs9ParamScenarioRulesh)
                    .where(and(...conditions))
                    .orderBy(desc(frs9ParamScenarioRulesh.createddate))
            },
            catch: (error) => new DatabaseError({ message: 'Failed to find rule headers', operation: 'query', cause: error })
        })
    },

    findHeaderById: (id: bigint) => {
        return Effect.tryPromise({
            try: async () => {
                const results = await db
                    .select()
                    .from(frs9ParamScenarioRulesh)
                    .where(eq(frs9ParamScenarioRulesh.pkid, Number(id)))
                return results[0] || null
            },
            catch: (error) => new DatabaseError({ message: 'Failed to find rule header', operation: 'query', cause: error })
        })
    },

    createHeader: (data: typeof frs9ParamScenarioRulesh.$inferInsert) => {
        return Effect.tryPromise({
            try: async () => {
                const results = await db
                    .insert(frs9ParamScenarioRulesh)
                    .values(data)
                    .returning()
                return results[0]
            },
            catch: (error) => new DatabaseError({ message: 'Failed to create rule header', operation: 'insert', cause: error })
        })
    },

    updateHeader: (id: bigint, data: Partial<typeof frs9ParamScenarioRulesh.$inferInsert>) => {
        return Effect.tryPromise({
            try: async () => {
                const results = await db
                    .update(frs9ParamScenarioRulesh)
                    .set(data)
                    .where(eq(frs9ParamScenarioRulesh.pkid, Number(id)))
                    .returning()
                return results[0] || null
            },
            catch: (error) => new DatabaseError({ message: 'Failed to update rule header', operation: 'update', cause: error })
        })
    },

    deleteHeader: (id: bigint) => {
        return Effect.tryPromise({
            try: async () => {
                await db.transaction(async (tx) => {
                    await tx.delete(frs9ParamScenarioRulesd).where(eq(frs9ParamScenarioRulesd.ruleId, Number(id)))
                    await tx.delete(frs9ParamScenarioRulesh).where(eq(frs9ParamScenarioRulesh.pkid, Number(id)))
                })
                return true
            },
            catch: (error) => new DatabaseError({ message: 'Failed to delete rule header', operation: 'delete', cause: error })
        })
    },

    // Detail Operations
    findDetailsByRuleId: (ruleId: bigint) => {
        return Effect.tryPromise({
            try: async () => {
                return await db
                    .select()
                    .from(frs9ParamScenarioRulesd)
                    .where(eq(frs9ParamScenarioRulesd.ruleId, Number(ruleId)))
                    .orderBy(frs9ParamScenarioRulesd.queryGroup, frs9ParamScenarioRulesd.seq)
            },
            catch: (error) => new DatabaseError({ message: 'Failed to find rule details', operation: 'query', cause: error })
        })
    },

    createDetail: (data: typeof frs9ParamScenarioRulesd.$inferInsert) => {
        return Effect.tryPromise({
            try: async () => {
                const results = await db
                    .insert(frs9ParamScenarioRulesd)
                    .values(data)
                    .returning()
                return results[0]
            },
            catch: (error) => new DatabaseError({ message: 'Failed to create rule detail', operation: 'insert', cause: error })
        })
    },

    updateDetail: (id: bigint, data: Partial<typeof frs9ParamScenarioRulesd.$inferInsert>) => {
        return Effect.tryPromise({
            try: async () => {
                const results = await db
                    .update(frs9ParamScenarioRulesd)
                    .set(data)
                    .where(eq(frs9ParamScenarioRulesd.pkid, Number(id)))
                    .returning()
                return results[0] || null
            },
            catch: (error) => new DatabaseError({ message: 'Failed to update rule detail', operation: 'update', cause: error })
        })
    },

    deleteDetail: (id: bigint) => {
        return Effect.tryPromise({
            try: async () => {
                const results = await db
                    .delete(frs9ParamScenarioRulesd)
                    .where(eq(frs9ParamScenarioRulesd.pkid, Number(id)))
                    .returning()
                return results.length > 0
            },
            catch: (error) => new DatabaseError({ message: 'Failed to delete rule detail', operation: 'delete', cause: error })
        })
    }
}
