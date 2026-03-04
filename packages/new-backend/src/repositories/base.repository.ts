import { Effect, pipe } from 'effect'
import { eq, and, or, asc, desc, count, SQL, sql } from 'drizzle-orm'
import type { PgTable, PgColumn } from 'drizzle-orm/pg-core'
import { db } from '@/config'
import { DatabaseError, NotFoundError } from '@/lib/errors'
import { dbOperation } from '@/lib/effect'
import type { PaginationParams, FilterParams } from '@/lib/react-admin'

/**
 * @module BaseRepository
 * @description Provides core types and utilities for the repository layer.
 * Includes base interfaces, Drizzle-ORM wrappers, and pagination helpers.
 */

// =============================================================================
// TYPES
// =============================================================================

/**
 * Common query options for repository methods.
 */
export interface QueryOptions {
    /** Pagination parameters (page and limit) */
    pagination?: PaginationParams
    /** Filter parameters for searching and narrowing results */
    filters?: FilterParams
    /** Whether to include inactive/deleted records in the results */
    includeInactive?: boolean
}

/**
 * Structure of a paginated list of results.
 */
export interface PaginatedResult<T> {
    /** The array of data for the current page */
    data: T[]
    /** Total number of records matching the query */
    total: number
    /** Current page index */
    page: number
    /** Number of items per page */
    limit: number
}

// =============================================================================
// BASE REPOSITORY INTERFACE
// =============================================================================

/**
 * Core interface for standard CRUD repository operations.
 */
export interface IRepository<T, TInsert, TId = string> {
    /** Find an item by its primary key */
    findById(id: TId): Effect.Effect<T, DatabaseError | NotFoundError>
    /** Find all items matching optional criteria with pagination */
    findAll(options?: QueryOptions): Effect.Effect<PaginatedResult<T>, DatabaseError>
    /** Create a new record */
    create(data: TInsert): Effect.Effect<T, DatabaseError>
    /** Update an existing record partially */
    update(id: TId, data: Partial<TInsert>): Effect.Effect<T, DatabaseError | NotFoundError>
    /** Categorically delete/soft-delete a record */
    delete(id: TId): Effect.Effect<T, DatabaseError | NotFoundError>
}

// =============================================================================
// BASE REPOSITORY HELPERS
// =============================================================================

/**
 * Build a Drizzle-ORM orderBy clause from sorting parameters.
 * 
 * @param table - The Drizzle table object
 * @param sort - Column name to sort by
 * @param order - Sort direction ('asc' or 'desc')
 * @returns A Drizzle SQL ordering expression or undefined if sort is missing/invalid
 */
export function buildOrderBy<TTable extends PgTable>(
    table: TTable,
    sort?: string,
    order: 'asc' | 'desc' = 'asc'
): SQL | undefined {
    if (!sort) return undefined

    const column = (table as any)[sort]
    if (!column) return undefined

    return order === 'desc' ? desc(column) : asc(column)
}

/**
 * Calculate the database query 'offset' from page and limit.
 * 
 * @param page - 1-based page index
 * @param limit - Number of items per page
 * @returns The calculate offset index
 */
export function calculateOffset(page: number, limit: number): number {
    return (page - 1) * limit
}

/**
 * Create a paginated query wrapper
 */
export async function paginatedQuery<T>(
    queryFn: () => Promise<T[]>,
    countFn: () => Promise<{ count: number }[]>,
    pagination: PaginationParams
): Promise<PaginatedResult<T>> {
    const [data, countResult] = await Promise.all([queryFn(), countFn()])

    return {
        data,
        total: countResult[0]?.count ?? 0,
        page: pagination.page,
        limit: pagination.limit,
    }
}

// =============================================================================
// TENANT-AWARE REPOSITORY INTERFACE
// =============================================================================

/**
 * Extension of IRepository that specifically handles tenant isolation.
 */
export interface ITenantRepository<T, TInsert, TId = string> extends IRepository<T, TInsert, TId> {
    /** Find all items belonging to a specific tenant */
    findByTenant(tenantId: string, options?: QueryOptions): Effect.Effect<PaginatedResult<T>, DatabaseError>
}

// =============================================================================
// BASE EFFECT WRAPPERS
// =============================================================================

/**
 * Wrap a promise-based database query operation in an Effect.
 * 
 * @param operation - Async function returning the query result
 * @returns An Effect that handles database error mapping
 */
export const queryEffect = <T>(
    operation: () => Promise<T>
): Effect.Effect<T, DatabaseError> =>
    dbOperation('query', operation)

/**
 * Wrap a promise-based database insert operation in an Effect.
 * Maps the result array to the first (newly created) element.
 * 
 * @param operation - Async function returning the inserted record(s)
 * @returns An Effect that succeeds with the first inserted record
 */
export const insertEffect = <T>(
    operation: () => Promise<T[]>
): Effect.Effect<T, DatabaseError> =>
    pipe(
        dbOperation('insert', operation),
        Effect.map((result) => result[0])
    )

/**
 * Wrap an update operation in Effect
 */
export const updateEffect = <T>(
    operation: () => Promise<T[]>
): Effect.Effect<T, DatabaseError> =>
    pipe(
        dbOperation('update', operation),
        Effect.map((result) => result[0])
    )

/**
 * Utility to map an Effect's `undefined` result to a NotFoundError.
 * 
 * @param resource - Name of the resource being queried (for error reporting)
 * @param id - ID of the resource being queried
 * @returns A transform function for Effects
 */
export const withNotFound = <T>(
    resource: string,
    id: string
) => (
    effect: Effect.Effect<T | undefined, DatabaseError>
): Effect.Effect<T, DatabaseError | NotFoundError> =>
        pipe(
            effect,
            Effect.flatMap((item) =>
                item
                    ? Effect.succeed(item)
                    : Effect.fail(new NotFoundError({ message: `${resource} not found`, resource, id }))
            )
        )
