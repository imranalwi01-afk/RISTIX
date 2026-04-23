import { Effect } from 'effect'
import { legacyDb as db } from '../config'
import { frs9MasterAccount } from '../db/schema'
import { eq, and, asc, desc, sql, count, getTableColumns, or } from 'drizzle-orm'
import { queryEffect } from './base.repository'
import { decodeCursor, encodeCursor, type ListSort } from '@/lib/http/list-query'

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
    ratingCode?: string
}

export interface MasterAccountCursorQueryOptions extends Omit<WatchlistQueryOptions, 'page'> {
    cursor?: string
    sort?: ListSort[]
}

const MASTER_ACCOUNT_SORT_COLUMNS = {
    pkid: frs9MasterAccount.pkid,
    prcDate: frs9MasterAccount.prcDate,
    prc_date: frs9MasterAccount.prcDate,
    accountNumber: frs9MasterAccount.accountNumber,
    account_number: frs9MasterAccount.accountNumber,
    cifName: frs9MasterAccount.cifName,
    cif_name: frs9MasterAccount.cifName,
    outstanding: frs9MasterAccount.outstanding,
    stage: frs9MasterAccount.stage,
    dpd: frs9MasterAccount.dpd,
} as const

const MASTER_ACCOUNT_ROW_KEYS: Record<string, string> = {
    pkid: 'pkid',
    prcDate: 'prcDate',
    prc_date: 'prcDate',
    accountNumber: 'accountNumber',
    account_number: 'accountNumber',
    cifName: 'cifName',
    cif_name: 'cifName',
    outstanding: 'outstanding',
    stage: 'stage',
    dpd: 'dpd',
}

function buildMasterAccountConditions(options: Pick<WatchlistQueryOptions, 'search' | 'stage' | 'impairedFlag' | 'dateFrom' | 'dateTo' | 'ratingCode'>) {
    const conditions = []

    if (options.search) {
        conditions.push(
            sql`(${frs9MasterAccount.accountNumber} ILIKE ${`%${options.search}%`} OR ${frs9MasterAccount.cifName} ILIKE ${`%${options.search}%`} OR ${frs9MasterAccount.cifNumber} ILIKE ${`%${options.search}%`})`
        )
    }

    if (options.stage) {
        conditions.push(eq(frs9MasterAccount.stage, String(options.stage)))
    }

    if (options.impairedFlag) {
        conditions.push(eq(frs9MasterAccount.impairedFlag, options.impairedFlag === 'I'))
    }

    if (options.ratingCode) {
        conditions.push(eq(frs9MasterAccount.internalRatingCode, options.ratingCode))
    }

    if (options.dateFrom) {
        conditions.push(sql`${frs9MasterAccount.prcDate} >= ${options.dateFrom}`)
    }

    if (options.dateTo) {
        conditions.push(sql`${frs9MasterAccount.prcDate} <= ${options.dateTo}`)
    }

    if (!options.dateFrom && !options.dateTo) {
        conditions.push(sql`${frs9MasterAccount.prcDate} = COALESCE(
            (
                SELECT prc_date
                FROM frs9_master_account
                GROUP BY prc_date
                HAVING COUNT(*) >= 100
                ORDER BY prc_date DESC
                LIMIT 1
            ),
            (SELECT MAX(prc_date) FROM frs9_master_account)
        )`)
    }

    return conditions
}

function resolveCursorSort(options: MasterAccountCursorQueryOptions) {
    const requested = options.sort?.[0] ?? (
        options.sortField
            ? { field: options.sortField, direction: options.sortOrder ?? 'asc' } satisfies ListSort
            : { field: 'prcDate', direction: 'desc' } satisfies ListSort
    )
    const column = MASTER_ACCOUNT_SORT_COLUMNS[requested.field as keyof typeof MASTER_ACCOUNT_SORT_COLUMNS] ?? frs9MasterAccount.prcDate
    return { ...requested, column }
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
    findAllOffset: (options: WatchlistQueryOptions) => {
        return queryEffect(async () => {
            const conditions = buildMasterAccountConditions(options)

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
    },

    findAllCursor: (options: MasterAccountCursorQueryOptions) => {
        return queryEffect(async () => {
            const limit = options.limit
            const conditions = buildMasterAccountConditions(options)
            const sort = resolveCursorSort(options)
            const cursorPayload = decodeCursor<{ sortValue?: unknown; pkid?: string | number; direction?: string }>(options.cursor)

            if (cursorPayload?.pkid !== undefined && cursorPayload.sortValue !== undefined) {
                const cursorPkid = BigInt(String(cursorPayload.pkid))
                const comparison = sort.direction === 'asc'
                    ? or(
                        sql`${sort.column} > ${cursorPayload.sortValue}`,
                        and(sql`${sort.column} = ${cursorPayload.sortValue}`, sql`${frs9MasterAccount.pkid} > ${cursorPkid}`),
                    )
                    : or(
                        sql`${sort.column} < ${cursorPayload.sortValue}`,
                        and(sql`${sort.column} = ${cursorPayload.sortValue}`, sql`${frs9MasterAccount.pkid} < ${cursorPkid}`),
                    )
                if (comparison) {
                    conditions.push(comparison)
                }
            }

            const orderBy = sort.direction === 'asc'
                ? [asc(sort.column), asc(frs9MasterAccount.pkid)]
                : [desc(sort.column), desc(frs9MasterAccount.pkid)]

            const data = await db.select()
                .from(frs9MasterAccount)
                .where(conditions.length > 0 ? and(...conditions) : undefined)
                .orderBy(...orderBy)
                .limit(limit + 1)

            const pageRows = data.slice(0, limit)
            const hasNextPage = data.length > limit
            const lastRow = pageRows[pageRows.length - 1] as any
            const nextCursor = hasNextPage && lastRow
                ? encodeCursor({
                    field: sort.field,
                    direction: sort.direction,
                    sortValue: lastRow[MASTER_ACCOUNT_ROW_KEYS[sort.field] ?? 'prcDate'],
                    pkid: String(lastRow.pkid),
                })
                : null

            return {
                data: pageRows,
                nextCursor,
                hasNextPage,
                previousCursor: options.cursor ?? null,
                hasPreviousPage: Boolean(options.cursor),
            }
        })
    },

    findAll: (options: WatchlistQueryOptions) => {
        return MasterAccountRepository.findAllOffset(options)
    },
}
