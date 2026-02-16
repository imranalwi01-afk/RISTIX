import { Effect, pipe } from 'effect'
import { eq, and, or, asc, desc, count, ilike, sql } from 'drizzle-orm'
import { db } from '@/config'
import { getDatabase } from '@/config/database'
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
     * Find user by ID.
     * 
     * @param id - The user ID
     * @returns An Effect resolving to the user or NotFoundError
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
     * Find user by email.
     * 
     * @param email - The email address
     * @param tenantId - Optional tenant ID filter
     * @returns An Effect resolving to the user or undefined
     */
    findByEmail(email: string, tenantId?: string): Effect.Effect<User | undefined, DatabaseError> {
        return queryEffect(() => {
            const conditions = [eq(users.email, email)]
            if (tenantId) {
                // Route to tenant DB when tenantId is provided
                const dbx = getDatabase(tenantId)
                conditions.push(eq(users.tenantId, tenantId))
                return dbx.query.users.findFirst({ where: and(...conditions) })
            }
            return db.query.users.findFirst({ where: and(...conditions) })
        })
    }

    /**
     * Find all users with pagination.
     * 
     * @param options - Query options including pagination and filters
     * @returns An Effect resolving to paginated user results
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
                        ilike(users.fullName, `%${options.search}%`)
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
     * Find users by tenant.
     * 
     * @param tenantId - The tenant ID
     * @param options - Query options including pagination and filters
     * @returns An Effect resolving to paginated user results for the tenant
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
                        ilike(users.fullName, `%${options.search}%`)
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
     * Create a new user.
     * 
     * @param data - The user data
     * @returns An Effect resolving to the created user
     */
    create(data: NewUser): Effect.Effect<User, DatabaseError> {
        return insertEffect(() => {
            const dbx = (data as any).tenantId ? getDatabase((data as any).tenantId) : db
            return dbx
                .insert(users)
                .values({
                    ...data,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                })
                .returning()
        })
    }

    /**
     * Update an existing user.
     * 
     * @param id - The user ID
     * @param data - The data to update
     * @returns An Effect resolving to the updated user or NotFoundError
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
     * Soft delete a user.
     * 
     * @param id - The user ID
     * @returns An Effect resolving to the updated (deleted) user
     */
    delete(id: string): Effect.Effect<User, DatabaseError | NotFoundError> {
        return this.update(id, { isActive: false })
    }

    /**
     * Get user statistics for a tenant.
     * 
     * @param tenantId - The tenant ID
     * @returns An Effect resolving to user statistics (total, active, inactive, verified)
     */
    getStats(tenantId: string): Effect.Effect<{
        total: number
        active: number
        inactive: number
        verifiedEmail: number
    }, DatabaseError> {
        return queryEffect(async () => {
            const dbx = getDatabase(tenantId)
            const result = await dbx
                .select({
                    total: count(),
                    active: sql<number>`SUM(CASE WHEN is_active = true THEN 1 ELSE 0 END)`,
                    inactive: sql<number>`SUM(CASE WHEN is_active = false THEN 1 ELSE 0 END)`,
                    verifiedEmail: sql<number>`SUM(CASE WHEN email_verified_at IS NOT NULL THEN 1 ELSE 0 END)`,
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
