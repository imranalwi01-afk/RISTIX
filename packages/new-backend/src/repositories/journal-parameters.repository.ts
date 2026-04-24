import { and, asc, desc, eq, ilike, or, sql } from 'drizzle-orm'
import { legacyDb as db } from '../config'
import { frs9ParamJournal } from '../db/schema'
import { Effect } from 'effect'
import { DatabaseError } from '../lib/errors'

export const JournalParametersRepository = {
    /**
     * Find all journal parameters.
     * 
     * @returns An Effect resolving to an array of journal parameters
     */
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

    findMany: (options: {
        page?: number
        offset?: number
        limit: number
        search?: string
        glGroup?: string
        currency?: string
        activeFlag?: boolean | string
        filters?: Record<string, unknown>
        sort?: Array<{ field: string; direction: 'asc' | 'desc' }>
    }) => {
        const { page = 1, limit, search, glGroup, currency, activeFlag, filters = {}, sort = [] } = options
        const offset = options.offset ?? ((page - 1) * limit)

        return Effect.tryPromise({
            try: async () => {
                const conditions = []

                if (search) {
                    conditions.push(
                        or(
                            ilike(frs9ParamJournal.glCode, `%${search}%`),
                            ilike(frs9ParamJournal.glDesc, `%${search}%`),
                            ilike(frs9ParamJournal.glNumber, `%${search}%`),
                            ilike(frs9ParamJournal.glGroup, `%${search}%`),
                            ilike(frs9ParamJournal.glType, `%${search}%`),
                        )!,
                    )
                }

                const resolvedGlGroup = typeof filters.glGroup === 'string' ? filters.glGroup : glGroup
                if (resolvedGlGroup) {
                    conditions.push(eq(frs9ParamJournal.glGroup, resolvedGlGroup))
                }

                const resolvedCurrency = typeof filters.currency === 'string' ? filters.currency : currency
                if (resolvedCurrency) {
                    conditions.push(eq(frs9ParamJournal.currency, resolvedCurrency))
                }

                const resolvedGlType = typeof filters.glType === 'string' ? filters.glType : undefined
                if (resolvedGlType) {
                    conditions.push(eq(frs9ParamJournal.glType, resolvedGlType))
                }

                const resolvedGlCode = typeof filters.glCode === 'string' ? filters.glCode : undefined
                if (resolvedGlCode) {
                    conditions.push(ilike(frs9ParamJournal.glCode, `%${resolvedGlCode}%`))
                }

                const resolvedGlNumber = typeof filters.glNumber === 'string' ? filters.glNumber : undefined
                if (resolvedGlNumber) {
                    conditions.push(ilike(frs9ParamJournal.glNumber, `%${resolvedGlNumber}%`))
                }

                const resolvedDbcr = typeof filters.dbcr === 'string' ? filters.dbcr : undefined
                if (resolvedDbcr) {
                    conditions.push(eq(frs9ParamJournal.dbcr, resolvedDbcr))
                }

                const resolvedGlDesc = typeof filters.glDesc === 'string' ? filters.glDesc : undefined
                if (resolvedGlDesc) {
                    conditions.push(ilike(frs9ParamJournal.glDesc, `%${resolvedGlDesc}%`))
                }

                const activeFilter = filters.activeFlag ?? activeFlag
                if (activeFilter !== undefined && activeFilter !== '') {
                    let normalizedActiveFlag: boolean | undefined
                    if (typeof activeFilter === 'boolean') {
                        normalizedActiveFlag = activeFilter
                    } else if (activeFilter === 'active' || activeFilter === 'true') {
                        normalizedActiveFlag = true
                    } else if (activeFilter === 'inactive' || activeFilter === 'false') {
                        normalizedActiveFlag = false
                    }

                    if (normalizedActiveFlag !== undefined) {
                        conditions.push(eq(frs9ParamJournal.activeFlag, normalizedActiveFlag))
                    }
                }

                const whereClause = conditions.length > 0 ? and(...conditions) : undefined

                const sortMap = {
                    glCode: frs9ParamJournal.glCode,
                    glDesc: frs9ParamJournal.glDesc,
                    glGroup: frs9ParamJournal.glGroup,
                    glType: frs9ParamJournal.glType,
                    currency: frs9ParamJournal.currency,
                    glNumber: frs9ParamJournal.glNumber,
                    dbcr: frs9ParamJournal.dbcr,
                    activeFlag: frs9ParamJournal.activeFlag,
                    createddate: frs9ParamJournal.createddate,
                    updateddate: frs9ParamJournal.updateddate,
                } as const

                const orderBy = sort
                    .map((item) => {
                        const column = sortMap[item.field as keyof typeof sortMap]
                        if (!column) return undefined
                        return item.direction === 'asc' ? asc(column) : desc(column)
                    })
                    .filter(Boolean) as Array<ReturnType<typeof asc>>

                const journals = await db
                    .select()
                    .from(frs9ParamJournal)
                    .where(whereClause)
                    .orderBy(...(orderBy.length > 0 ? orderBy : [desc(frs9ParamJournal.createddate)]))
                    .limit(limit)
                    .offset(offset)

                const totalResult = await db
                    .select({ count: sql`count(*)` })
                    .from(frs9ParamJournal)
                    .where(whereClause)

                const total = Number(totalResult[0]?.count || 0)
                return { journals, total }
            },
            catch: (error) => new DatabaseError({ message: 'Failed to find journal parameters', operation: 'query', cause: error }),
        })
    },

    /**
     * Find a journal parameter by ID.
     * 
     * @param id - The journal parameter ID
     * @returns An Effect resolving to the journal parameter or null
     */
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

    /**
     * Create a new journal parameter.
     * 
     * @param data - The journal parameter data
     * @returns An Effect resolving to the created journal parameter
     */
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

    /**
     * Update an existing journal parameter.
     * 
     * @param id - The journal parameter ID
     * @param data - The data to update
     * @returns An Effect resolving to the updated journal parameter or null
     */
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

    /**
     * Delete a journal parameter.
     * 
     * @param id - The journal parameter ID
     * @returns An Effect resolving to true if deleted, false otherwise
     */
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
