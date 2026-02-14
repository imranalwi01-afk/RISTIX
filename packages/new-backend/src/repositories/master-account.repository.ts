import { Effect } from 'effect'
import { legacyDb as db } from '../config'
import { frs9MasterAccount } from '../db/schema'
import { eq, and, like, asc, desc, sql, count, getTableColumns } from 'drizzle-orm'
import { queryEffect } from './base.repository'

export interface WatchlistQueryOptions {
    page: number
    limit: number
    search?: string
    stage?: number
    impairedFlag?: 'I' | 'N'
    assessmentStatus?: string
    sortField?: string
    sortOrder?: 'asc' | 'desc'
    dateFrom?: string // New: Filter by date from (YYYY-MM-DD)
    dateTo?: string   // New: Filter by date to (YYYY-MM-DD)
}

export const MasterAccountRepository = {
    /**
     * Find accounts for the impairment watchlist with pagination, filtering, and sorting.
     * 
     * @param options - Query options
     * @param options.page - Page number (1-based)
     * @param options.limit - Number of records per page
     * @param options.search - Search term (account number, CIF name, CIF number)
     * @param options.stage - Filter by stage (1, 2, 3)
     * @param options.impairedFlag - Filter by impaired flag ('I' or 'N')
     * @param options.assessmentStatus - Filter by assessment status (currently ignored as not in DB)
     * @param options.dateFrom - Filter by date from (YYYY-MM-DD)
     * @param options.dateTo - Filter by date to (YYYY-MM-DD)
     * @param options.sortField - Field to sort by
     * @param options.sortOrder - Sort order ('asc' or 'desc')
     * @returns An Effect resolving to an object with data array and total count
     */
    findAll: (options: WatchlistQueryOptions) => {
        return queryEffect(async () => {
            const conditions = []

            if (options.search) {
                // Using sql template literal for complex OR condition
                conditions.push(
                    sql`(${frs9MasterAccount.accountNumber} ILIKE ${`%${options.search}%`} OR ${frs9MasterAccount.cifName} ILIKE ${`%${options.search}%`} OR ${frs9MasterAccount.cifNumber} ILIKE ${`%${options.search}%`})`
                )
            }

            if (options.stage) {
                // Stage in DB is varchar(5), frontend passes number.
                conditions.push(eq(frs9MasterAccount.stage, String(options.stage)))
            }

            if (options.impairedFlag) {
                // ImpairedFlag is boolean in DB
                conditions.push(eq(frs9MasterAccount.impairedFlag, options.impairedFlag === 'I'))
            }

            // Date range filtering
            if (options.dateFrom) {
                conditions.push(
                    sql`${frs9MasterAccount.prcDate} >= ${options.dateFrom}`
                )
            }

            if (options.dateTo) {
                conditions.push(
                    sql`${frs9MasterAccount.prcDate} <= ${options.dateTo}`
                )
            }

            // AssessmentStatus doesn't exist in MasterAccount directly (default PENDING or join)
            // For now, we ignore filtering by status if it's not in the table

            const offset = (options.page - 1) * options.limit

            // Sorting
            let orderBy = desc(frs9MasterAccount.outstanding) // Default sort
            if (options.sortField) {
                const columns = getTableColumns(frs9MasterAccount)
                const column = columns[options.sortField as keyof typeof columns]
                if (column) {
                    orderBy = options.sortOrder === 'asc' ? asc(column) : desc(column)
                }
            }

            const [data, totalCount] = await Promise.all([
                db.select()
                    .from(frs9MasterAccount)
                    .where(conditions.length > 0 ? and(...conditions) : undefined)
                    .limit(options.limit)
                    .offset(offset)
                    .orderBy(orderBy),
                db.select({ count: count() })
                    .from(frs9MasterAccount)
                    .where(conditions.length > 0 ? and(...conditions) : undefined)
            ])

            return {
                data,
                total: totalCount[0].count
            }
        })
    }
}
