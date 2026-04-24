import { and, asc, desc, eq, ilike, or, sql } from 'drizzle-orm'
import { legacyDb as db } from '../config'
import { frs9ParamProduct } from '../db/schema'
import { Effect } from 'effect'
import { DatabaseError } from '../lib/errors'

export const ProductParametersRepository = {
    /**
     * Find product parameters with pagination and search.
     * 
     * @param options - Pagination and search options
     * @returns An Effect resolving to an array of product parameters and the total count
     */
    findMany: (options: {
        page?: number
        offset?: number
        limit: number
        search?: string
        currency?: string
        dataSource?: string
        activeFlag?: boolean | string
        sort?: Array<{ field: string; direction: 'asc' | 'desc' }>
    }) => {
        const { page = 1, limit, search, currency, dataSource, activeFlag, sort = [] } = options
        const offset = options.offset ?? ((page - 1) * limit)

        return Effect.tryPromise({
            try: async () => {
                const conditions = []

                if (search) {
                    conditions.push(
                        or(
                            ilike(frs9ParamProduct.prdCode, `%${search}%`),
                            ilike(frs9ParamProduct.prdDesc, `%${search}%`),
                            ilike(frs9ParamProduct.prdGroup, `%${search}%`),
                            ilike(frs9ParamProduct.prdType, `%${search}%`),
                        )!,
                    )
                }

                if (currency) {
                    conditions.push(eq(frs9ParamProduct.currency, currency))
                }

                if (dataSource) {
                    conditions.push(eq(frs9ParamProduct.dataSource, dataSource))
                }

                if (activeFlag !== undefined && activeFlag !== '') {
                    let normalizedActiveFlag: boolean | undefined
                    if (typeof activeFlag === 'boolean') {
                        normalizedActiveFlag = activeFlag
                    } else if (activeFlag === 'active' || activeFlag === 'true') {
                        normalizedActiveFlag = true
                    } else if (activeFlag === 'inactive' || activeFlag === 'false') {
                        normalizedActiveFlag = false
                    }

                    if (normalizedActiveFlag !== undefined) {
                        conditions.push(eq(frs9ParamProduct.activeFlag, normalizedActiveFlag))
                    }
                }

                const whereClause = conditions.length > 0 ? and(...conditions) : undefined

                const sortMap = {
                    prdCode: frs9ParamProduct.prdCode,
                    prdDesc: frs9ParamProduct.prdDesc,
                    prdGroup: frs9ParamProduct.prdGroup,
                    prdType: frs9ParamProduct.prdType,
                    currency: frs9ParamProduct.currency,
                    dataSource: frs9ParamProduct.dataSource,
                    alFlag: frs9ParamProduct.alFlag,
                    activeFlag: frs9ParamProduct.activeFlag,
                    createddate: frs9ParamProduct.createddate,
                    updateddate: frs9ParamProduct.updateddate,
                } as const

                const orderBy = sort
                    .map((item) => {
                        const column = sortMap[item.field as keyof typeof sortMap]
                        if (!column) return undefined
                        return item.direction === 'asc' ? asc(column) : desc(column)
                    })
                    .filter(Boolean) as Array<ReturnType<typeof asc>>

                const products = await db
                    .select()
                    .from(frs9ParamProduct)
                    .where(whereClause)
                    .orderBy(...(orderBy.length > 0 ? orderBy : [desc(frs9ParamProduct.createddate)]))
                    .limit(limit)
                    .offset(offset)
                
                const totalResult = await db
                    .select({ count: sql`count(*)` })
                    .from(frs9ParamProduct)
                    .where(whereClause)

                const total = Number(totalResult[0]?.count || 0)

                return { products, total }
            },
            catch: (error) => new DatabaseError({ message: 'Failed to find product parameters', operation: 'query', cause: error })
        })
    },

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
     * Find a product parameter by its code.
     * 
     * @param prdCode - The product code
     * @returns An Effect resolving to the product parameter or null
     */
    findByCode: (prdCode: string) => {
        return Effect.tryPromise({
            try: async () => {
                const results = await db
                    .select()
                    .from(frs9ParamProduct)
                    .where(eq(frs9ParamProduct.prdCode, prdCode))
                return results[0] || null
            },
            catch: (error) => new DatabaseError({ message: 'Failed to find product parameter by code', operation: 'query', cause: error })
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
