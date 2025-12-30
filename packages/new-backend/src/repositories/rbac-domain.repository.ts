import { eq, and, or, asc, desc, count, ilike, inArray } from 'drizzle-orm'
import { db } from '@/config'
import {
    roles,
    permissions,
    rolePermissions,
    userRoles,
    type Role,
    type NewRole,
    type Permission,
    type NewPermission,
    type UserRole,
    type NewUserRole,
} from '@/db/schema'

// =============================================================================
// RBAC REPOSITORY - Domain: Role-Based Access Control
// =============================================================================
// Handles: roles, permissions, role_permissions, user_roles
// =============================================================================

export const RbacRepository = {
    // ---------------------------------------------------------------------------
    // ROLE OPERATIONS
    // ---------------------------------------------------------------------------

    findRoleById: (id: string) =>
        db.query.roles.findFirst({
            where: eq(roles.id, id),
            with: { rolePermissions: { with: { permission: true } } },
        }),

    findRoleByName: (name: string, tenantId?: string) =>
        db.query.roles.findFirst({
            where: tenantId
                ? and(eq(roles.roleName, name), eq(roles.tenantId, tenantId))
                : eq(roles.roleName, name),
        }),

    findRolesByTenant: async (tenantId: string, options?: {
        search?: string
        isActive?: boolean
        limit?: number
        offset?: number
    }) => {
        const conditions = [eq(roles.tenantId, tenantId)]

        if (options?.isActive !== undefined) {
            conditions.push(eq(roles.isActive, options.isActive))
        }
        if (options?.search) {
            conditions.push(
                or(
                    ilike(roles.roleName, `%${options.search}%`),
                    ilike(roles.description, `%${options.search}%`)
                )!
            )
        }

        const whereClause = and(...conditions)

        const [data, countResult] = await Promise.all([
            db.query.roles.findMany({
                where: whereClause,
                limit: options?.limit ?? 50,
                offset: options?.offset ?? 0,
                orderBy: [asc(roles.roleName)],
                with: { rolePermissions: { with: { permission: true } } },
            }),
            db.select({ count: count() }).from(roles).where(whereClause),
        ])

        return { data, total: countResult[0]?.count ?? 0 }
    },

    createRole: async (data: NewRole) => {
        const [role] = await db.insert(roles).values({
            ...data,
            createdAt: new Date(),
            updatedAt: new Date(),
        }).returning()
        return role
    },

    updateRole: async (id: string, data: Partial<NewRole>) => {
        const [role] = await db.update(roles).set({
            ...data,
            updatedAt: new Date(),
        }).where(eq(roles.id, id)).returning()
        return role
    },

    deleteRole: (id: string) =>
        db.delete(roles).where(eq(roles.id, id)),

    // ---------------------------------------------------------------------------
    // PERMISSION OPERATIONS
    // ---------------------------------------------------------------------------

    findPermissionById: (id: string) =>
        db.query.permissions.findFirst({
            where: eq(permissions.id, id),
        }),

    findPermissionByCode: (code: string) =>
        db.query.permissions.findFirst({
            where: eq(permissions.code, code),
        }),

    findAllPermissions: async (options?: { module?: string; isActive?: boolean }) => {
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
    },

    createPermission: async (data: NewPermission) => {
        const [permission] = await db.insert(permissions).values({
            ...data,
            createdAt: new Date(),
        }).returning()
        return permission
    },

    // ---------------------------------------------------------------------------
    // ROLE-PERMISSION OPERATIONS
    // ---------------------------------------------------------------------------

    assignPermissionToRole: async (roleId: string, permissionId: string) => {
        const [rp] = await db.insert(rolePermissions).values({
            roleId,
            permissionId,
        }).returning()
        return rp
    },

    removePermissionFromRole: (roleId: string, permissionId: string) =>
        db.delete(rolePermissions).where(
            and(eq(rolePermissions.roleId, roleId), eq(rolePermissions.permissionId, permissionId))
        ),

    setRolePermissions: async (roleId: string, permissionIds: string[]) => {
        // Remove all existing
        await db.delete(rolePermissions).where(eq(rolePermissions.roleId, roleId))
        // Add new ones
        if (permissionIds.length > 0) {
            await db.insert(rolePermissions).values(
                permissionIds.map(permissionId => ({ roleId, permissionId }))
            )
        }
    },

    getPermissionsByRoleId: async (roleId: string) => {
        const rps = await db.query.rolePermissions.findMany({
            where: eq(rolePermissions.roleId, roleId),
            with: { permission: true },
        })
        return rps.map(rp => (rp as any).permission).filter(Boolean)
    },

    // ---------------------------------------------------------------------------
    // USER-ROLE OPERATIONS
    // ---------------------------------------------------------------------------

    findUserRoles: (userId: string) =>
        db.query.userRoles.findMany({
            where: eq(userRoles.userId, userId),
            with: { role: { with: { rolePermissions: { with: { permission: true } } } } },
        }),

    assignRoleToUser: async (userId: string, roleId: string, tenantId: string, assignedBy?: string) => {
        const [ur] = await db.insert(userRoles).values({
            userId,
            roleId,
            tenantId,
            assignedBy,
            assignedAt: new Date(),
        }).returning()
        return ur
    },

    removeRoleFromUser: (userId: string, roleId: string) =>
        db.delete(userRoles).where(
            and(eq(userRoles.userId, userId), eq(userRoles.roleId, roleId))
        ),

    getUserPermissions: async (userId: string): Promise<string[]> => {
        const urs = await db.query.userRoles.findMany({
            where: eq(userRoles.userId, userId),
            with: { role: { with: { rolePermissions: { with: { permission: true } } } } },
        })

        const permissionCodes = new Set<string>()
        for (const ur of urs) {
            const role = (ur as any).role
            if (role?.permissions) {
                for (const rp of role.permissions) {
                    if (rp.permission?.code) {
                        permissionCodes.add(rp.permission.code)
                    }
                }
            }
        }
        return Array.from(permissionCodes)
    },

    getUsersByRoleId: async (roleId: string) => {
        const urs = await db.query.userRoles.findMany({
            where: eq(userRoles.roleId, roleId),
            with: { user: true },
        })
        return urs.map(ur => (ur as any).user).filter(Boolean)
    },
}

export type RbacRepositoryType = typeof RbacRepository
