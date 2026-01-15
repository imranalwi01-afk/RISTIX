import { Effect, pipe } from 'effect'
import {
    rolesRepository,
    userRolesRepository,
    permissionsRepository,
    rolePermissionsRepository
} from '@/repositories/rbac.repository'
import { getDatabase } from '@/config/database'
import {
    type NewRole,
    type Role,
} from '@/db/schema'
import { DatabaseError, NotFoundError, ValidationError, BusinessError } from '@/lib/errors'

// =============================================================================
// ROLE OPERATIONS
// =============================================================================

/**
 * Get all roles for a tenant
 */
export const getRoles = (
    tenantId: string,
    options?: { includeInactive?: boolean; bankingType?: string }
) =>
    pipe(
        Effect.try(() => getDatabase(tenantId)),
        Effect.mapError(error => new DatabaseError({ operation: 'query', message: String(error) })),
        Effect.flatMap(db =>
            rolesRepository.findByTenant(db, tenantId, {
                includeInactive: options?.includeInactive,
                bankingType: options?.bankingType
            })
        ),
        Effect.map(({ data }) => data)
    )

/**
 * Get a role by ID
 */
export const getRoleById = (roleId: string, tenantId?: string) =>
    pipe(
        Effect.try(() => getDatabase(tenantId)),
        Effect.mapError(error => new DatabaseError({ operation: 'query', message: String(error) })),
        Effect.flatMap(db => rolesRepository.findById(db, roleId)),
        // Map NotFound to success undefined? No, findById returns Effect<Role, NotFoundError>
        // But if it fails with NotFoundError, do we want that?
        // The original code mapped: role ? succeed : fail(NotFound).
        // My repo findById returns Effect.fail(NotFound) if not found (via withNotFound).
        // So I don't need manual check unless I want to customize.
        // It returns Effect<Role, DatabaseError | NotFoundError>.
        // So this is fine.
    )

// Helper that requires tenantId
const findRole = (roleId: string, tenantId?: string) =>
    pipe(
        Effect.try(() => getDatabase(tenantId)),
        Effect.mapError(e => new DatabaseError({ operation: 'query', message: String(e) })),
        Effect.flatMap(db => rolesRepository.findById(db, roleId))
    )

/**
 * Create a new role
 */
export const createRole = (input: NewRole) =>
    pipe(
        Effect.try(() => getDatabase(input.tenantId)),
        Effect.mapError(error => new DatabaseError({ operation: 'query', message: String(error) })),
        Effect.flatMap(db =>
            pipe(
                // Validate role name doesn't exist
                rolesRepository.findByName(db, input.roleName, input.tenantId ?? undefined),
                Effect.flatMap((existing) =>
                    existing
                        ? Effect.fail(
                            new ValidationError({
                                message: `Role with name "${input.roleName}" already exists`,
                                field: 'roleName',
                                errors: ['Role name must be unique'],
                            })
                        )
                        : Effect.succeed(db) // Pass db through
                )
            )
        ),
        Effect.flatMap(db => rolesRepository.create(db, input))
    )

/**
 * Update an existing role
 */
export const updateRole = (roleId: string, input: Partial<NewRole> & { tenantId?: string }) =>
    pipe(
        findRole(roleId, input.tenantId),
        Effect.flatMap((existing: Role) => {
            if (existing.isSystemRole && input.roleName && input.roleName !== existing.roleName) {
                return Effect.fail(
                    new BusinessError({
                        message: 'Cannot modify system role name',
                        code: 'SYSTEM_ROLE_PROTECTED',
                    })
                )
            }
            return Effect.succeed(existing)
        }),
        Effect.flatMap(() =>
            pipe(
                Effect.try(() => getDatabase(input.tenantId)),
                Effect.mapError(e => new DatabaseError({ operation: 'query', message: String(e) })),
                Effect.flatMap(db => rolesRepository.update(db, roleId, input))
            )
        )
    )

/**
 * Delete a role (soft delete by setting isActive = false)
 */
export const deleteRole = (roleId: string, tenantId?: string) =>
    pipe(
        findRole(roleId, tenantId),
        Effect.flatMap((existing: Role) => {
            if (existing.isSystemRole) {
                return Effect.fail(
                    new BusinessError({
                        message: 'Cannot delete system role',
                        code: 'SYSTEM_ROLE_PROTECTED',
                    })
                )
            }
            return Effect.succeed(existing)
        }),
        Effect.flatMap(() =>
            pipe(
                Effect.try(() => getDatabase(tenantId)),
                Effect.mapError(e => new DatabaseError({ operation: 'query', message: String(e) })),
                Effect.flatMap(db => rolesRepository.delete(db, roleId))
            )
        )
    )

// =============================================================================
// USER-ROLE ASSIGNMENT OPERATIONS
// =============================================================================

/**
 * Get all roles for a user
 */
export const getUserRoles = (userId: string, tenantId: string) =>
    pipe(
        Effect.try(() => getDatabase(tenantId)),
        Effect.mapError(e => new DatabaseError({ operation: 'query', message: String(e) })),
        Effect.flatMap(db => userRolesRepository.findByUser(db, userId, tenantId)),
        Effect.map(allUserRoles => {
            const now = new Date()
            return allUserRoles.filter(ur =>
                ur.isActive &&
                (!ur.validFrom || ur.validFrom <= now) &&
                (!ur.validUntil || ur.validUntil >= now)
            )
        })
    )

/**
 * Assign a role to a user
 */
export const assignRole = (input: {
    userId: string
    roleId: string
    tenantId: string
    assignedBy?: string
    validFrom?: Date
    validUntil?: Date
    isTemporary?: boolean
    temporaryReason?: string
}) =>
    pipe(
        // Check if role exists
        findRole(input.roleId, input.tenantId),
        // Check if assignment already exists
        Effect.flatMap(() =>
            pipe(
                Effect.try(() => getDatabase(input.tenantId)),
                Effect.mapError(e => new DatabaseError({ operation: 'query', message: String(e) })),
                Effect.flatMap(db => userRolesRepository.findByUser(db, input.userId, input.tenantId))
            )
        ),
        Effect.flatMap((existingRoles) => {
            const exists = existingRoles.some(ur => ur.roleId === input.roleId)
            return exists
                ? Effect.fail(
                    new ValidationError({
                        message: 'User already has this role assigned',
                        field: 'roleId',
                        errors: ['Duplicate role assignment'],
                    })
                )
                : Effect.succeed(undefined)
        }),
        // Create assignment
        Effect.flatMap(() =>
            pipe(
                Effect.try(() => getDatabase(input.tenantId)),
                Effect.mapError(e => new DatabaseError({ operation: 'query', message: String(e) })),
                Effect.flatMap(db => userRolesRepository.assign(db, {
                    userId: input.userId,
                    roleId: input.roleId,
                    tenantId: input.tenantId,
                    assignedBy: input.assignedBy,
                    validFrom: input.validFrom,
                    validUntil: input.validUntil,
                    isTemporary: input.isTemporary,
                    temporaryReason: input.temporaryReason
                }))
            )
        )
    )

/**
 * Remove a role from a user
 */
export const removeRole = (userId: string, roleId: string, tenantId: string) =>
    pipe(
        Effect.try(() => getDatabase(tenantId)),
        Effect.mapError(e => new DatabaseError({ operation: 'query', message: String(e) })),
        Effect.flatMap(db => userRolesRepository.remove(db, userId, roleId))
    )

// =============================================================================
// PERMISSION CHECKING
// =============================================================================


/**
 * Check if a user has a specific permission
 */
export const hasPermission = (
    userId: string,
    tenantId: string,
    resource: string,
    action: string
): Effect.Effect<boolean, DatabaseError> =>
    pipe(
        getUserPermissions(userId, tenantId),
        Effect.map((permissions) => {
            const resourceActions = permissions[resource] ?? []
            return resourceActions.includes(action) || resourceActions.includes('*') ||
                permissions['*']?.includes(action) || permissions['*']?.includes('*') || false
        })
    )

/**
 * Get all permissions for a user (Grouped by resource)
 */
export const getUserPermissions = (
    userId: string,
    tenantId: string
): Effect.Effect<Record<string, string[]>, DatabaseError> =>
    pipe(
        getUserRoles(userId, tenantId),
        Effect.map((userRolesData) => {
            const allPermissions: Record<string, string[]> = {}

            for (const ur of userRolesData) {
                const rolePermissions = (ur as any).role?.rolePermissions ?? []
                for (const rp of rolePermissions) {
                    if (rp.permission) {
                        const { resource, action } = rp.permission
                        if (!allPermissions[resource]) {
                            allPermissions[resource] = []
                        }
                        if (!allPermissions[resource].includes(action)) {
                            allPermissions[resource].push(action)
                        }
                    }
                }
            }

            return allPermissions
        })
    )
