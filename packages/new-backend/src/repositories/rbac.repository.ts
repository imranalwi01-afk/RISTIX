import { Effect, pipe } from 'effect'
import { eq, and, or, asc, desc, count, isNull, lte, gte, inArray } from 'drizzle-orm'
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import * as schema from '@/db/schema'
import {
    roles,
    userRoles,
    permissions,
    rolePermissions,
    type Role,
    type NewRole,
    type UserRole,
    type NewUserRole,
    type RolePermission,
    type NewRolePermission,
    type Permission,
    type NewPermission,
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
// TYPES
// =============================================================================

type DrizzleDB = PostgresJsDatabase<typeof schema>

// =============================================================================
// ROLES REPOSITORY
// =============================================================================

export interface RolesQueryOptions extends QueryOptions {
    bankingType?: string
    systemRolesOnly?: boolean
}

export class RolesRepository {
    /**
     * Find role by ID
     */
    findById(db: DrizzleDB, id: string): Effect.Effect<Role, DatabaseError | NotFoundError> {
        return pipe(
            queryEffect(() =>
                db.query.roles.findFirst({
                    where: eq(roles.id, id),
                    with: { rolePermissions: { with: { permission: true } } },
                })
            ),
            withNotFound<Role>('Role', id)
        )
    }

    /**
     * Find role by Name
     */
    findByName(db: DrizzleDB, roleName: string, tenantId?: string): Effect.Effect<Role | undefined, DatabaseError> {
        return queryEffect(() =>
            db.query.roles.findFirst({
                where: tenantId
                    ? and(eq(roles.roleName, roleName), eq(roles.tenantId, tenantId))
                    : eq(roles.roleName, roleName),
            })
        )
    }

    /**
     * Find all roles with pagination
     */
    findAll(db: DrizzleDB, options?: RolesQueryOptions): Effect.Effect<PaginatedResult<Role>, DatabaseError> {
        return queryEffect(async () => {
            const pagination = options?.pagination ?? { page: 1, limit: 100 } // Increased default limit
            const offset = calculateOffset(pagination.page, pagination.limit)

            const conditions = []
            if (!options?.includeInactive) {
                conditions.push(eq(roles.isActive, true))
            }
            // Temporarily removed bankingType and systemRolesOnly filters logic if schemas mismatch or simple query preferred
            // But keeping logical filters if columns exist (migrated correctly).

            // Assuming schema is synced.
            if (options?.bankingType) {
                // Check if bankingTypeSpecific is in schema (we migrated using psql so it should be)
                // However, we rely on Drizzle Schema 'roles'.
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
                    with: { rolePermissions: { with: { permission: true } } },
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
        db: DrizzleDB,
        tenantId: string,
        options?: RolesQueryOptions & { search?: string }
    ): Effect.Effect<PaginatedResult<Role>, DatabaseError> {
        return queryEffect(async () => {
            const pagination = options?.pagination ?? { page: 1, limit: 100 }
            const offset = calculateOffset(pagination.page, pagination.limit)

            const conditions = [eq(roles.tenantId, tenantId)]
            if (!options?.includeInactive) {
                conditions.push(eq(roles.isActive, true))
            }
            // Removed filter checks for schema fields that might be missing in simpler queries, 
            // but keeping bankingType as it's standard now.
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
                    with: { rolePermissions: { with: { permission: true } } },
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
    create(db: DrizzleDB, data: NewRole): Effect.Effect<Role, DatabaseError> {
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
        db: DrizzleDB,
        id: string,
        data: Partial<NewRole>
    ): Effect.Effect<Role, DatabaseError | NotFoundError> {
        return pipe(
            this.findById(db, id),
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
    delete(db: DrizzleDB, id: string): Effect.Effect<Role, DatabaseError | NotFoundError> {
        return this.update(db, id, { isActive: false })
    }

    /**
     * Check if role name exists
     */
    existsByName(db: DrizzleDB, roleName: string): Effect.Effect<boolean, DatabaseError> {
        return queryEffect(async () => {
            const result = await db.query.roles.findFirst({
                where: eq(roles.roleName, roleName),
            })
            return result !== undefined
        })
    }
}

// =============================================================================
// PERMISSIONS REPOSITORY
// =============================================================================

export interface PermissionsQueryOptions extends QueryOptions {
    module?: string
    isActive?: boolean
}

export class PermissionsRepository {
    findById(db: DrizzleDB, id: string): Effect.Effect<Permission, DatabaseError | NotFoundError> {
        return pipe(
            queryEffect(() => db.query.permissions.findFirst({
                where: eq(permissions.id, id)
            })),
            withNotFound<Permission>('Permission', id)
        )
    }

    findByCode(db: DrizzleDB, code: string): Effect.Effect<Permission | undefined, DatabaseError> {
        return queryEffect(() => db.query.permissions.findFirst({
            where: eq(permissions.code, code)
        }))
    }

    findAll(db: DrizzleDB, options?: PermissionsQueryOptions): Effect.Effect<Permission[], DatabaseError> {
        return queryEffect(() => {
            const conditions = []
            if (options?.module) {
                conditions.push(eq(permissions.module, options.module))
            }
            if (options?.isActive !== undefined) {
                conditions.push(eq(permissions.isActive, options.isActive))
            }

            return db.query.permissions.findMany({
                where: conditions.length > 0 ? and(...conditions) : undefined,
                orderBy: [asc(permissions.module), asc(permissions.code)],
            })
        })
    }

    create(db: DrizzleDB, data: NewPermission): Effect.Effect<Permission, DatabaseError> {
        return insertEffect(() =>
            db.insert(permissions).values({
                ...data,
                createdAt: new Date(),
            }).returning()
        )
    }
}

// =============================================================================
// ROLE PERMISSIONS REPOSITORY
// =============================================================================

export class RolePermissionsRepository {
    assign(db: DrizzleDB, roleId: string, permissionId: string): Effect.Effect<RolePermission, DatabaseError> {
        return insertEffect(() =>
            db.insert(rolePermissions).values({
                roleId,
                permissionId,
            }).returning()
        )
    }

    remove(db: DrizzleDB, roleId: string, permissionId: string): Effect.Effect<void, DatabaseError> {
        return dbOperation('delete', async () => {
            await db.delete(rolePermissions).where(
                and(eq(rolePermissions.roleId, roleId), eq(rolePermissions.permissionId, permissionId))
            )
        })
    }

    set(db: DrizzleDB, roleId: string, permissionIds: string[]): Effect.Effect<void, DatabaseError> {
        return dbOperation('transaction', async () => {
            // Remove all existing
            await db.delete(rolePermissions).where(eq(rolePermissions.roleId, roleId))

            // Add new ones if any
            if (permissionIds.length > 0) {
                await db.insert(rolePermissions).values(
                    permissionIds.map(permissionId => ({ roleId, permissionId }))
                )
            }
        })
    }

    findByRole(db: DrizzleDB, roleId: string): Effect.Effect<Permission[], DatabaseError> {
        return queryEffect(async () => {
            const rps = await db.query.rolePermissions.findMany({
                where: eq(rolePermissions.roleId, roleId),
                with: { permission: true },
            })
            // Filter out any potential nulls if foreign key constraint was somehow violated or soft delete logic interferes (though standard here)
            return rps.map(rp => rp.permission).filter(Boolean) as Permission[]
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
        db: DrizzleDB,
        userId: string,
        tenantId?: string,
        options?: UserRolesQueryOptions
    ): Effect.Effect<Array<UserRole & { role: Role & { rolePermissions: Array<RolePermission & { permission: Permission }> } }>, DatabaseError> {
        return queryEffect(async () => {
            const now = new Date()
            const conditions = [eq(userRoles.userId, userId)]

            if (tenantId) {
                conditions.push(eq(userRoles.tenantId, tenantId))
            }

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
                    role: {
                        with: {
                            rolePermissions: {
                                with: {
                                    permission: true
                                }
                            }
                        }
                    },
                },
            }) as Promise<Array<UserRole & { role: Role & { rolePermissions: Array<RolePermission & { permission: Permission }> } }>>
        })
    }

    /**
     * Find users with a specific role
     */
    findByRole(
        db: DrizzleDB,
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
    assign(db: DrizzleDB, data: NewUserRole): Effect.Effect<UserRole, DatabaseError> {
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
    remove(db: DrizzleDB, userId: string, roleId: string): Effect.Effect<UserRole, DatabaseError | NotFoundError> {
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
    exists(db: DrizzleDB, userId: string, roleId: string): Effect.Effect<boolean, DatabaseError> {
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
export const permissionsRepository = new PermissionsRepository()
export const rolePermissionsRepository = new RolePermissionsRepository()
export const userRolesRepository = new UserRolesRepository()
