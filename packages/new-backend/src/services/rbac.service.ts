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

/**
 * @module RBACService
 * @description Provides services for Role-Based Access Control.
 * Handles role management, user-role assignments, and permission checking.
 */

// =============================================================================
// ROLE OPERATIONS
// =============================================================================

/**
 * Retrieve all roles for a given tenant.
 * 
 * @param tenantId - The unique identifier of the tenant
 * @param options - Optional filters (includeInactive, bankingType)
 * @returns An Effect that succeeds with an array of Roles
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
 * Retrieve a single role by its unique ID.
 * 
 * @param roleId - The unique identifier of the role
 * @param tenantId - Optional tenant ID to resolve the database
 * @returns An Effect that succeeds with the Role if found
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
 * Create a new role for a tenant.
 * 
 * @param input - The role definition as NewRole object
 * @returns An Effect that succeeds with the created Role
 * @throws {ValidationError} If a role with the same name already exists
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
 * Update an existing role's properties.
 * 
 * @param roleId - The unique identifier of the role to update
 * @param input - Partial role object containing updates and optional tenantId
 * @returns An Effect that succeeds with the updated Role
 * @throws {BusinessError} If attempting to rename a protected system role
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
 * Deactivates a role (Soft delete).
 * 
 * @param roleId - The unique identifier of the role to delete
 * @param tenantId - Optional tenant ID to resolve the database
 * @returns An Effect that succeeds with the deleted/deactivated Role
 * @throws {BusinessError} If attempting to delete a protected system role
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
 * Retrieve all active roles currently assigned to a user.
 * 
 * @param userId - The unique identifier of the user
 * @param tenantId - The unique identifier of the tenant
 * @returns An Effect that succeeds with an array of active UserRole assignments
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
 * Assign a role to a user with optional temporal constraints.
 * 
 * @param input - Assignment details including userId, roleId, and tenure info
 * @returns An Effect that succeeds with the newly created assignment
 * @throws {ValidationError} If the role is already assigned to the user
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
                } as any))
            )
        )
    )

/**
 * Remove a role assignment from a user.
 * 
 * @param userId - The unique identifier of the user
 * @param roleId - The unique identifier of the role to remove
 * @param tenantId - The unique identifier of the tenant
 * @returns An Effect that succeeds when the assignment is removed
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
 * Check if a user possesses a specific permission for a resource and action.
 * 
 * @param userId - The unique identifier of the user
 * @param tenantId - The unique identifier of the tenant
 * @param resource - The resource identifier (e.g., 'users', 'roles')
 * @param action - The action identifier (e.g., 'read', 'write', '*')
 * @returns An Effect that succeeds with a boolean flag
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
 * Aggregates and groups all permissions granted to a user across all their roles.
 * 
 * @param userId - The unique identifier of the user
 * @param tenantId - The unique identifier of the tenant
 * @returns An Effect that succeeds with a Record of resource-to-actions mappings
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
