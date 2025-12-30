import { Effect, pipe } from 'effect'
import { eq, and, or, asc, desc, count, SQL, sql } from 'drizzle-orm'
import type { PgTable, PgColumn } from 'drizzle-orm/pg-core'
import { db } from '@/config'
import { DatabaseError, NotFoundError } from '@/lib/errors'
import { dbOperation } from '@/lib/effect'
import type { PaginationParams, FilterParams } from '@/lib/react-admin'

// =============================================================================
// TYPES
// =============================================================================

export interface QueryOptions {
    pagination?: PaginationParams
    filters?: FilterParams
    includeInactive?: boolean
}

export interface PaginatedResult<T> {
    data: T[]
    total: number
    page: number
    limit: number
}

// =============================================================================
// BASE REPOSITORY INTERFACE
// =============================================================================

export interface IRepository<T, TInsert, TId = string> {
    findById(id: TId): Effect.Effect<T, DatabaseError | NotFoundError>
    findAll(options?: QueryOptions): Effect.Effect<PaginatedResult<T>, DatabaseError>
    create(data: TInsert): Effect.Effect<T, DatabaseError>
    update(id: TId, data: Partial<TInsert>): Effect.Effect<T, DatabaseError | NotFoundError>
    delete(id: TId): Effect.Effect<T, DatabaseError | NotFoundError>
}

// =============================================================================
// BASE REPOSITORY HELPERS
// =============================================================================

/**
 * Build order by clause from sort params
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
 * Calculate offset from pagination params
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

export interface ITenantRepository<T, TInsert, TId = string> extends IRepository<T, TInsert, TId> {
    findByTenant(tenantId: string, options?: QueryOptions): Effect.Effect<PaginatedResult<T>, DatabaseError>
}

// =============================================================================
// BASE EFFECT WRAPPERS
// =============================================================================

/**
 * Wrap a query operation in Effect with proper error handling
 */
export const queryEffect = <T>(
    operation: () => Promise<T>
): Effect.Effect<T, DatabaseError> =>
    dbOperation('query', operation)

/**
 * Wrap an insert operation in Effect
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
 * Handle not found case for single item queries
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
                    : Effect.fail(new NotFoundError({ resource, id }))
            )
        )
