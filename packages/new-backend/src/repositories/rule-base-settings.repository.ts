import { eq, and, desc, like, or, asc } from 'drizzle-orm'
import { legacyDb as db } from '../config'
import { frs9ParamScenarioRulesh, frs9ParamScenarioRulesd } from '../db/schema'
import { Effect } from 'effect'
import { DatabaseError } from '../lib/errors'

export const RuleBaseSettingsRepository = {
    // Header Operations

    /**
     * Find rule headers with filtering.
     * 
     * @param search - Search term for rule name or type
     * @param ruleType - Filter by rule type
     * @param activeFlag - Filter by active status
     * @returns An Effect resolving to an array of headers
     */
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

    /**
     * Find rule headers by rule type.
     * Used by Journal Parameters to fetch dropdown options from Rule Base Setting.
     *
     * @param ruleType - The rule type to filter by
     * @param activeOnly - If true, only return active headers
     * @returns An Effect resolving to an array of headers, sorted by seq
     */
    findHeadersByType: (ruleType: string, activeOnly: boolean = true) => {
        return Effect.tryPromise({
            try: async () => {
                const conditions = [
                    eq(frs9ParamScenarioRulesh.ruleType, ruleType),
                ]
                if (activeOnly) {
                    conditions.push(eq(frs9ParamScenarioRulesh.activeFlag, true))
                }

                return await db
                    .select()
                    .from(frs9ParamScenarioRulesh)
                    .where(and(...conditions))
                    .orderBy(asc(frs9ParamScenarioRulesh.seq))
            },
            catch: (error) => new DatabaseError({ message: 'Failed to find rule headers by type', operation: 'query', cause: error })
        })
    },

    /**
     * Find a rule header by ID.
     * 
     * @param id - The header ID
     * @returns An Effect resolving to the header or null
     */
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

    /**
     * Create a new rule header.
     * 
     * @param data - The header data
     * @returns An Effect resolving to the created header
     */
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

    /**
     * Update an existing rule header.
     * 
     * @param id - The header ID
     * @param data - The data to update
     * @returns An Effect resolving to the updated header or null
     */
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

    /**
     * Delete a rule header and its associated details.
     * 
     * @param id - The header ID
     * @returns An Effect resolving to true on success
     */
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

    /**
     * Find details for a specific rule sorted by group and sequence.
     * 
     * @param ruleId - The rule header ID
     * @returns An Effect resolving to an array of details
     */
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

    /**
     * Find a rule detail by ID.
     *
     * @param id - The detail ID
     * @returns An Effect resolving to the detail or null
     */
    findDetailById: (id: bigint) => {
        return Effect.tryPromise({
            try: async () => {
                const results = await db
                    .select()
                    .from(frs9ParamScenarioRulesd)
                    .where(eq(frs9ParamScenarioRulesd.pkid, Number(id)))
                return results[0] || null
            },
            catch: (error) => new DatabaseError({ message: 'Failed to find rule detail', operation: 'query', cause: error })
        })
    },

    /**
     * Create a new rule detail.
     * 
     * @param data - The detail data
     * @returns An Effect resolving to the created detail
     */
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

    /**
     * Update an existing rule detail.
     * 
     * @param id - The detail ID
     * @param data - The data to update
     * @returns An Effect resolving to the updated detail or null
     */
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

    /**
     * Delete a rule detail.
     * 
     * @param id - The detail ID
     * @returns An Effect resolving to true if deleted, false otherwise
     */
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
