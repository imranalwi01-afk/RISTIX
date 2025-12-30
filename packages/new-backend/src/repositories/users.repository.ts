import { Effect, pipe } from 'effect'
import { eq, and, or, asc, desc, count, ilike, sql } from 'drizzle-orm'
import { db } from '@/config'
import { users, type User, type NewUser } from '@/db/schema'
import { DatabaseError, NotFoundError } from '@/lib/errors'
import { dbOperation } from '@/lib/effect'
import type { PaginationParams } from '@/lib/react-admin'
import {
    type ITenantRepository,
    type QueryOptions,
    type PaginatedResult,
    queryEffect,
    insertEffect,
    updateEffect,
    withNotFound,
    calculateOffset,
} from './base.repository'

// =============================================================================
// USERS REPOSITORY
// =============================================================================

export interface UsersQueryOptions extends QueryOptions {
    search?: string
    isActive?: boolean
}

export class UsersRepository implements ITenantRepository<User, NewUser> {
    /**
     * Find user by ID
     */
    findById(id: string): Effect.Effect<User, DatabaseError | NotFoundError> {
        return pipe(
            queryEffect(() =>
                db.query.users.findFirst({
                    where: eq(users.id, id),
                })
            ),
            withNotFound<User>('User', id)
        )
    }

    /**
     * Find user by email
     */
    findByEmail(email: string, tenantId?: string): Effect.Effect<User | undefined, DatabaseError> {
        return queryEffect(() => {
            const conditions = [eq(users.email, email)]
            if (tenantId) {
                conditions.push(eq(users.tenantId, tenantId))
            }
            return db.query.users.findFirst({
                where: and(...conditions),
            })
        })
    }

    /**
     * Find all users with pagination
     */
    findAll(options?: UsersQueryOptions): Effect.Effect<PaginatedResult<User>, DatabaseError> {
        return queryEffect(async () => {
            const pagination = options?.pagination ?? { page: 1, limit: 50 }
            const offset = calculateOffset(pagination.page, pagination.limit)

            const conditions = []
            if (!options?.includeInactive) {
                conditions.push(eq(users.isActive, true))
            }
            if (options?.search) {
                conditions.push(
                    or(
                        ilike(users.email, `%${options.search}%`),
                        ilike(users.firstName, `%${options.search}%`),
                        ilike(users.lastName, `%${options.search}%`)
                    )!
                )
            }

            const whereClause = conditions.length > 0 ? and(...conditions) : undefined

            // Build order by
            let orderBy: any = [asc(users.email)]
            if (pagination.sort) {
                const column = (users as any)[pagination.sort]
                if (column) {
                    orderBy = pagination.order === 'desc' ? [desc(column)] : [asc(column)]
                }
            }

            const [data, countResult] = await Promise.all([
                db.query.users.findMany({
                    where: whereClause,
                    limit: pagination.limit,
                    offset,
                    orderBy,
                }),
                db.select({ count: count() }).from(users).where(whereClause),
            ])

            return {
                data,
                total: countResult[0]?.count ?? 0,
                page: pagination.page,
                limit: pagination.limit,
            }
        })
    }

    /**
     * Find users by tenant
     */
    findByTenant(
        tenantId: string,
        options?: UsersQueryOptions
    ): Effect.Effect<PaginatedResult<User>, DatabaseError> {
        return queryEffect(async () => {
            const pagination = options?.pagination ?? { page: 1, limit: 50 }
            const offset = calculateOffset(pagination.page, pagination.limit)

            const conditions = [eq(users.tenantId, tenantId)]
            if (!options?.includeInactive) {
                conditions.push(eq(users.isActive, true))
            }
            if (options?.search) {
                conditions.push(
                    or(
                        ilike(users.email, `%${options.search}%`),
                        ilike(users.firstName, `%${options.search}%`),
                        ilike(users.lastName, `%${options.search}%`)
                    )!
                )
            }

            const whereClause = and(...conditions)

            // Build order by
            let orderBy: any = [asc(users.email)]
            if (pagination.sort) {
                const column = (users as any)[pagination.sort]
                if (column) {
                    orderBy = pagination.order === 'desc' ? [desc(column)] : [asc(column)]
                }
            }

            const [data, countResult] = await Promise.all([
                db.query.users.findMany({
                    where: whereClause,
                    limit: pagination.limit,
                    offset,
                    orderBy,
                }),
                db.select({ count: count() }).from(users).where(whereClause),
            ])

            return {
                data,
                total: countResult[0]?.count ?? 0,
                page: pagination.page,
                limit: pagination.limit,
            }
        })
    }

    /**
     * Create a new user
     */
    create(data: NewUser): Effect.Effect<User, DatabaseError> {
        return insertEffect(() =>
            db
                .insert(users)
                .values({
                    ...data,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                })
                .returning()
        )
    }

    /**
     * Update an existing user
     */
    update(
        id: string,
        data: Partial<NewUser>
    ): Effect.Effect<User, DatabaseError | NotFoundError> {
        return pipe(
            this.findById(id),
            Effect.flatMap(() =>
                updateEffect(() =>
                    db
                        .update(users)
                        .set({
                            ...data,
                            updatedAt: new Date(),
                        })
                        .where(eq(users.id, id))
                        .returning()
                )
            )
        )
    }

    /**
     * Soft delete a user
     */
    delete(id: string): Effect.Effect<User, DatabaseError | NotFoundError> {
        return this.update(id, { isActive: false })
    }

    /**
     * Get user statistics for a tenant
     */
    getStats(tenantId: string): Effect.Effect<{
        total: number
        active: number
        inactive: number
        verifiedEmail: number
    }, DatabaseError> {
        return queryEffect(async () => {
            const result = await db
                .select({
                    total: count(),
                    active: sql<number>`SUM(CASE WHEN is_active = true THEN 1 ELSE 0 END)`,
                    inactive: sql<number>`SUM(CASE WHEN is_active = false THEN 1 ELSE 0 END)`,
                    verifiedEmail: sql<number>`SUM(CASE WHEN is_email_verified = true THEN 1 ELSE 0 END)`,
                })
                .from(users)
                .where(eq(users.tenantId, tenantId))

            return {
                total: result[0]?.total ?? 0,
                active: Number(result[0]?.active ?? 0),
                inactive: Number(result[0]?.inactive ?? 0),
                verifiedEmail: Number(result[0]?.verifiedEmail ?? 0),
            }
        })
    }
}

// =============================================================================
// SINGLETON EXPORT
// =============================================================================

export const usersRepository = new UsersRepository()
