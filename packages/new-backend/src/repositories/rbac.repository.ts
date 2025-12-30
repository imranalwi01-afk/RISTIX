import { Effect, pipe } from 'effect'
import { eq, and, or, asc, desc, count, isNull, lte, gte } from 'drizzle-orm'
import { db } from '@/config'
import {
    roles,
    userRoles,
    type Role,
    type NewRole,
    type UserRole,
    type NewUserRole,
} from '@/db/schema'
import { DatabaseError, NotFoundError, ValidationError, BusinessError } from '@/lib/errors'
import { dbOperation } from '@/lib/effect'
import type { PaginationParams } from '@/lib/react-admin'
import {
    type IRepository,
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
// ROLES REPOSITORY
// =============================================================================

export interface RolesQueryOptions extends QueryOptions {
    bankingType?: string
    systemRolesOnly?: boolean
}

export class RolesRepository implements ITenantRepository<Role, NewRole> {
    /**
     * Find role by ID
     */
    findById(id: string): Effect.Effect<Role, DatabaseError | NotFoundError> {
        return pipe(
            queryEffect(() =>
                db.query.roles.findFirst({
                    where: eq(roles.id, id),
                })
            ),
            withNotFound<Role>('Role', id)
        )
    }

    /**
     * Find all roles with pagination
     */
    findAll(options?: RolesQueryOptions): Effect.Effect<PaginatedResult<Role>, DatabaseError> {
        return queryEffect(async () => {
            const pagination = options?.pagination ?? { page: 1, limit: 50 }
            const offset = calculateOffset(pagination.page, pagination.limit)

            const conditions = []
            if (!options?.includeInactive) {
                conditions.push(eq(roles.isActive, true))
            }
            if (options?.bankingType) {
                conditions.push(
                    or(
                        eq(roles.bankingTypeSpecific, options.bankingType),
                        eq(roles.bankingTypeSpecific, 'BOTH'),
                        isNull(roles.bankingTypeSpecific)
                    )!
                )
            }
            if (options?.systemRolesOnly) {
                conditions.push(eq(roles.isSystemRole, true))
            }

            const whereClause = conditions.length > 0 ? and(...conditions) : undefined

            const [data, countResult] = await Promise.all([
                db.query.roles.findMany({
                    where: whereClause,
                    limit: pagination.limit,
                    offset,
                    orderBy: [asc(roles.hierarchyLevel), asc(roles.roleName)],
                }),
                db.select({ count: count() }).from(roles).where(whereClause),
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
     * Find roles by tenant
     */
    findByTenant(
        tenantId: string,
        options?: RolesQueryOptions
    ): Effect.Effect<PaginatedResult<Role>, DatabaseError> {
        return queryEffect(async () => {
            const pagination = options?.pagination ?? { page: 1, limit: 50 }
            const offset = calculateOffset(pagination.page, pagination.limit)

            const conditions = [eq(roles.tenantId, tenantId)]
            if (!options?.includeInactive) {
                conditions.push(eq(roles.isActive, true))
            }
            if (options?.bankingType) {
                conditions.push(
                    or(
                        eq(roles.bankingTypeSpecific, options.bankingType),
                        eq(roles.bankingTypeSpecific, 'BOTH'),
                        isNull(roles.bankingTypeSpecific)
                    )!
                )
            }

            const whereClause = and(...conditions)

            const [data, countResult] = await Promise.all([
                db.query.roles.findMany({
                    where: whereClause,
                    limit: pagination.limit,
                    offset,
                    orderBy: [asc(roles.hierarchyLevel), asc(roles.roleName)],
                }),
                db.select({ count: count() }).from(roles).where(whereClause),
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
     * Create a new role
     */
    create(data: NewRole): Effect.Effect<Role, DatabaseError> {
        return insertEffect(() =>
            db
                .insert(roles)
                .values({
                    ...data,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                })
                .returning()
        )
    }

    /**
     * Update an existing role
     */
    update(
        id: string,
        data: Partial<NewRole>
    ): Effect.Effect<Role, DatabaseError | NotFoundError> {
        return pipe(
            this.findById(id),
            Effect.flatMap(() =>
                updateEffect(() =>
                    db
                        .update(roles)
                        .set({
                            ...data,
                            updatedAt: new Date(),
                        })
                        .where(eq(roles.id, id))
                        .returning()
                )
            )
        )
    }

    /**
     * Soft delete a role
     */
    delete(id: string): Effect.Effect<Role, DatabaseError | NotFoundError> {
        return this.update(id, { isActive: false })
    }

    /**
     * Check if role name exists
     */
    existsByName(roleName: string): Effect.Effect<boolean, DatabaseError> {
        return queryEffect(async () => {
            const result = await db.query.roles.findFirst({
                where: eq(roles.roleName, roleName),
            })
            return result !== undefined
        })
    }
}

// =============================================================================
// USER ROLES REPOSITORY
// =============================================================================

export interface UserRolesQueryOptions extends QueryOptions {
    activeOnly?: boolean
}

export class UserRolesRepository {
    /**
     * Find all roles for a user
     */
    findByUser(
        userId: string,
        tenantId: string,
        options?: UserRolesQueryOptions
    ): Effect.Effect<Array<UserRole & { role: Role }>, DatabaseError> {
        return queryEffect(async () => {
            const now = new Date()
            const conditions = [
                eq(userRoles.userId, userId),
                eq(userRoles.tenantId, tenantId),
            ]

            if (options?.activeOnly !== false) {
                conditions.push(
                    eq(userRoles.isActive, true),
                    or(isNull(userRoles.validFrom), lte(userRoles.validFrom, now))!,
                    or(isNull(userRoles.validUntil), gte(userRoles.validUntil, now))!
                )
            }

            return db.query.userRoles.findMany({
                where: and(...conditions),
                with: {
                    role: true,
                },
            }) as Promise<Array<UserRole & { role: Role }>>
        })
    }

    /**
     * Find users with a specific role
     */
    findByRole(
        roleId: string,
        options?: UserRolesQueryOptions
    ): Effect.Effect<UserRole[], DatabaseError> {
        return queryEffect(() => {
            const conditions = [eq(userRoles.roleId, roleId)]
            if (options?.activeOnly !== false) {
                conditions.push(eq(userRoles.isActive, true))
            }

            return db.query.userRoles.findMany({
                where: and(...conditions),
            })
        })
    }

    /**
     * Assign role to user
     */
    assign(data: NewUserRole): Effect.Effect<UserRole, DatabaseError> {
        return insertEffect(() =>
            db
                .insert(userRoles)
                .values({
                    ...data,
                    assignedAt: new Date(),
                    createdAt: new Date(),
                    updatedAt: new Date(),
                })
                .returning()
        )
    }

    /**
     * Remove role assignment
     */
    remove(userId: string, roleId: string): Effect.Effect<UserRole, DatabaseError | NotFoundError> {
        return pipe(
            queryEffect(() =>
                db.query.userRoles.findFirst({
                    where: and(eq(userRoles.userId, userId), eq(userRoles.roleId, roleId)),
                })
            ),
            withNotFound<UserRole>('UserRole', `${userId}:${roleId}`),
            Effect.flatMap(() =>
                updateEffect(() =>
                    db
                        .update(userRoles)
                        .set({ isActive: false, updatedAt: new Date() })
                        .where(and(eq(userRoles.userId, userId), eq(userRoles.roleId, roleId)))
                        .returning()
                )
            )
        )
    }

    /**
     * Check if user has role
     */
    exists(userId: string, roleId: string): Effect.Effect<boolean, DatabaseError> {
        return queryEffect(async () => {
            const result = await db.query.userRoles.findFirst({
                where: and(
                    eq(userRoles.userId, userId),
                    eq(userRoles.roleId, roleId),
                    eq(userRoles.isActive, true)
                ),
            })
            return result !== undefined
        })
    }
}

// =============================================================================
// SINGLETON EXPORTS
// =============================================================================

export const rolesRepository = new RolesRepository()
export const userRolesRepository = new UserRolesRepository()
