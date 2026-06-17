import { Effect, pipe } from 'effect'
import {
    rolesRepository,
    userRolesRepository,
    permissionsRepository,
    rolePermissionsRepository,
    type RoleWithPermissions
} from '@/repositories/rbac.repository'
import { getDatabase } from '@/config/database'
import {
    type NewRole,
    type Role,
    permissions as permissionsTable,
    roles as rolesTable,
    rolePermissions as rolePermissionsTable
} from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import { DatabaseError, NotFoundError, ValidationError, BusinessError } from '@/lib/errors'
import { PermissionApprovalService } from './permission-approval.service'

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
 * @param options - Optional filters (includeInactive, search, type, level)
 * @returns An Effect that succeeds with an array of Roles
 */
export const getRoles = (
    tenantId: string,
    options?: {
        includeInactive?: boolean;
        search?: string;
        type?: string;
        level?: string;
    }
) =>
    pipe(
        Effect.try(() => getDatabase(tenantId)),
        Effect.mapError(error => new DatabaseError({ operation: 'query', message: String(error) })),
        Effect.flatMap(db =>
            rolesRepository.findByTenant(db, tenantId, {
                includeInactive: options?.includeInactive,
                search: options?.search,
                systemRolesOnly: options?.type === 'SYSTEM'
            })
        ),
        Effect.map((result) => result)
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
        // Map NotFound to success undefined? No, findById returns Effect<RoleWithPermissions, NotFoundError>
        // But if it fails with NotFoundError, do we want that?
        // The original code mapped: role ? succeed : fail(NotFound).
        // My repo findById returns Effect.fail(NotFound) if not found (via withNotFound).
        // So I don't need manual check unless I want to customize.
        // It returns Effect<RoleWithPermissions, DatabaseError | NotFoundError>.
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
export const createRole = (input: NewRole & { permissions?: string[] }) =>
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
        Effect.flatMap(db => 
            pipe(
                rolesRepository.create(db, input),
                Effect.flatMap(role => 
                    input.permissions && input.permissions.length > 0
                        ? pipe(
                            updateRolePermissions(role.id, input.permissions, input.tenantId ?? undefined),
                            Effect.map(() => role)
                        )
                        : Effect.succeed(role)
                )
            )
        )
    )

/**
 * Update an existing role's properties.
 * 
 * @param roleId - The unique identifier of the role to update
 * @param input - Partial role object containing updates and optional tenantId
 * @returns An Effect that succeeds with the updated Role
 * @throws {BusinessError} If attempting to rename a protected system role
 */
export const updateRole = (roleId: string, input: Partial<NewRole> & { tenantId?: string; permissions?: string[] }) =>
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
                Effect.flatMap(db =>
                    pipe(
                        rolesRepository.update(db, roleId, input),
                        Effect.flatMap(role => 
                            input.permissions !== undefined
                                ? pipe(
                                    updateRolePermissions(role.id, input.permissions, input.tenantId),
                                    Effect.map(() => role)
                                )
                                : Effect.succeed(role)
                        )
                    )
                )
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
 * Retrieve active user assignments for a role.
 *
 * @param roleId - The unique identifier of the role
 * @param tenantId - The unique identifier of the tenant
 * @returns An Effect that succeeds with an array of active user-role assignments
 */
export const getRoleUsers = (roleId: string, tenantId: string) =>
    pipe(
        Effect.try(() => getDatabase(tenantId)),
        Effect.mapError(e => new DatabaseError({ operation: 'query', message: String(e) })),
        Effect.flatMap(db => userRolesRepository.findByRole(db, roleId)),
        Effect.map(assignments => assignments.filter(assignment => assignment.isActive))
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
// PERMISSION CHECKING & IMPACT LEVEL GUARD
// =============================================================================

const IMPACT_WEIGHTS: Record<string, number> = {
    'low': 1,
    'medium': 2,
    'high': 3,
    'critical': 4
}

const isImpactExceeded = (maxLevel?: string | null, permLevel?: string | null): boolean => {
    const maxWeight = IMPACT_WEIGHTS[(maxLevel || 'low').toLowerCase()] || 1
    const permWeight = IMPACT_WEIGHTS[(permLevel || 'low').toLowerCase()] || 1
    return permWeight > maxWeight
}

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
                const role = (ur as any).role
                const maxImpactLevel = role?.maxImpactLevel || 'low'
                const rolePermissions = role?.rolePermissions ?? []
                for (const rp of rolePermissions) {
                    if (rp.permission) {
                        const { resource, action, impactLevel } = rp.permission
                        
                        // ACTIVE GUARD: Block permissions that exceed the role's max impact level
                        if (isImpactExceeded(maxImpactLevel, impactLevel)) {
                            continue
                        }
                        
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

/**
 * Returns canonical permission codes (e.g. banking.setup.business.view) for the user.
 * This is used by frontend auth snapshot refresh to avoid lossy resource/action mapping.
 */
export const getUserPermissionCodes = (
    userId: string,
    tenantId: string
): Effect.Effect<string[], DatabaseError> =>
    pipe(
        getUserRoles(userId, tenantId),
        Effect.map((userRolesData) => {
            const codeSet = new Set<string>()

            for (const ur of userRolesData) {
                const role = (ur as any).role
                const maxImpactLevel = role?.maxImpactLevel || 'low'
                const rolePermissions = role?.rolePermissions ?? []
                for (const rp of rolePermissions) {
                    const permission = rp?.permission
                    if (permission) {
                        // ACTIVE GUARD: Block permissions that exceed the role's max impact level
                        if (isImpactExceeded(maxImpactLevel, permission.impactLevel)) {
                            continue
                        }
                        const code = permission.code
                        if (typeof code === 'string' && code.trim().length > 0) {
                            codeSet.add(code.trim())
                        }
                    }
                }
            }

            return Array.from(codeSet)
        })
    )

/**
 * Update permissions for a specific role by replacing all existing role-permission associations.
 * 
 * @param roleId - The unique identifier of the role
 * @param permissionIds - Array of permission IDs to assign to the role
 * @param tenantId - Optional tenant ID for database resolution
 * @returns An Effect that succeeds with the updated Role
 */
export const updateRolePermissions = (roleId: string, permissionIds: string[], tenantId?: string) =>
    pipe(
        Effect.try(() => getDatabase(tenantId)),
        Effect.mapError(error => new DatabaseError({ operation: 'query', message: String(error) })),
        Effect.flatMap(db => rolePermissionsRepository.set(db, roleId, permissionIds)),
        Effect.flatMap(() =>
            pipe(
                Effect.try(() => getDatabase(tenantId)),
                Effect.mapError(error => new DatabaseError({ operation: 'query', message: String(error) })),
                Effect.flatMap(db => rolesRepository.findById(db, roleId))
            )
        )
    )

/**
 * Get all available permissions with approval metadata
 * 
 * @param tenantId - The unique identifier of the tenant
 * @returns An Effect that succeeds with an array of Permissions with approval info
 */
export const getAvailablePermissions = (tenantId: string) =>
    pipe(
        Effect.try(() => getDatabase(tenantId)),
        Effect.mapError(error => new DatabaseError({ operation: 'query', message: String(error) })),
        Effect.flatMap((db) =>
            pipe(
                permissionsRepository.findAll(db),
                Effect.flatMap((permissions) => {
                    const approvalService = new PermissionApprovalService(db)
                    const permissionIds = permissions.map((p) => p.id)

                    return pipe(
                        approvalService.getBulkApprovalRequirements(tenantId, permissionIds),
                        Effect.map((approvalMap) =>
                            permissions.map((p) => {
                                const approval = approvalMap.get(p.id)
                                // AUTO APPROVAL SYNC: Default requiresApproval to true for high impact permissions
                                const isHighImpact = (p as any).impactLevel === 'high' || (p as any).impactLevel === 'critical'
                                const requiresApproval = approval?.requiresApproval ?? isHighImpact
                                return {
                                    ...p,
                                    requiresApproval,
                                    requiredApprovalLevel: approval?.minHierarchyLevel ?? (isHighImpact ? 2 : null),
                                    requiredApprovers: approval?.requiredApprovers ?? (isHighImpact ? 1 : 1),
                                }
                            })
                        )
                    )
                })
            )
        )
    )

/**
 * Import Role Matrix from JSON Data
 * 
 * @param tenantId - The unique identifier of the tenant
 * @param matrixData - Array of objects containing matrix configuration
 * @returns An Effect that succeeds with import statistics
 */
export const importRoleMatrix = (
    tenantId: string,
    matrixData: any[]
): Effect.Effect<{ permissionsAdded: number, rolesAdded: number, mappingsUpdated: number }, DatabaseError> =>
    pipe(
        Effect.try(() => getDatabase(tenantId)),
        Effect.mapError(error => new DatabaseError({ operation: 'transaction', message: String(error) })),
        Effect.flatMap((db) => 
            Effect.tryPromise({
                try: async () => {
                    let pAdded = 0;
                    let rAdded = 0;
                    let mUpdated = 0;

                await db.transaction(async (tx) => {
                    for (const row of matrixData) {
                        const code = row['Permission Code'] || row['Permission'];
                        if (!code) continue;

                        const name = row['Sub Menu'] || code;
                        const description = row['Description'] || '';
                        const action = (row['Action'] || 'view').toLowerCase();
                        const module = row['Menu'] || 'General';
                        const impactLevel = (row['Risk Level'] || row['Priority'] || 'low').toLowerCase();
                        const allowedRolesStr = row['Allowed Role'] || row['Allowed Roles'] || '';

                        // 1. Find or create permission
                        let permission = await tx.query.permissions.findFirst({
                            where: (p, { eq: pEq }) => pEq(p.code, code)
                        });

                        if (!permission) {
                            const [newPerm] = await tx.insert(permissionsTable).values({
                                code,
                                name,
                                description,
                                resource: module.toLowerCase().replace(/\s+/g, '_'),
                                action,
                                module,
                                impactLevel,
                                isActive: true
                            }).returning();
                            permission = newPerm;
                            pAdded++;
                        } else {
                            // Update existing permission impact level if needed
                            const [updatedPerm] = await tx.update(permissionsTable)
                                .set({ impactLevel, description, name, module })
                                .where(eq(permissionsTable.id, permission.id))
                                .returning();
                            permission = updatedPerm;
                        }

                        // 2. Process roles
                        const rolesList = allowedRolesStr.split(',').map((r: string) => r.trim()).filter(Boolean);
                        for (const roleName of rolesList) {
                            let role = await tx.query.roles.findFirst({
                                where: (r, { eq: rEq, and: rAnd }) => rAnd(rEq(r.roleName, roleName), rEq(r.tenantId, tenantId))
                            });

                            if (!role) {
                                // Create new role
                                const roleCode = roleName.toUpperCase().replace(/\s+/g, '_');
                                const [newRole] = await tx.insert(rolesTable).values({
                                    roleName,
                                    roleCode,
                                    description: `Imported from matrix`,
                                    isSystemRole: false,
                                    tenantId,
                                    isActive: true,
                                    maxImpactLevel: impactLevel
                                }).returning();
                                role = newRole;
                                rAdded++;
                            } else {
                                // Update maxImpactLevel if this permission has a higher one
                                const currentMax = role.maxImpactLevel || 'low';
                                if (isImpactExceeded(currentMax, impactLevel)) {
                                    await tx.update(rolesTable)
                                        .set({ maxImpactLevel: impactLevel })
                                        .where(eq(rolesTable.id, role.id));
                                }
                            }

                            if (role && permission) {
                                // 3. Assign permission to role
                                const existingMap = await tx.query.rolePermissions.findFirst({
                                    where: (rp, { eq: rpEq, and: rpAnd }) => rpAnd(rpEq(rp.roleId, role!.id), rpEq(rp.permissionId, permission!.id))
                                });

                                if (!existingMap) {
                                    await tx.insert(rolePermissionsTable).values({
                                        roleId: role.id,
                                        permissionId: permission.id
                                    });
                                    mUpdated++;
                                }
                            }
                        }
                    }
                });

                return {
                    permissionsAdded: pAdded,
                    rolesAdded: rAdded,
                    mappingsUpdated: mUpdated
                };
                },
                catch: (error: unknown) => new DatabaseError({ operation: 'transaction', message: String(error) })
            })
        )
    )
