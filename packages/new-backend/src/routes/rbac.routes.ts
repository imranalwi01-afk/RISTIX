import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { Effect, pipe } from 'effect'
import type { AppContext } from '../app'
import { authMiddleware, requirePermission, tenantMiddleware } from '../middleware'
import { runEffect } from '../lib/effect'
import * as rbacService from '../services/rbac.service'
import type { Role, UserRole } from '../db/schema'
import { PERMISSION_GROUPS, isValidPermission } from '../config/permissions'
import { db } from '../config/database'
import { roles } from '../db/schema'
import { eq } from 'drizzle-orm'
import * as auditService from '../services/audit.service'

export const rbacRoutes = new Hono<AppContext>()

// Apply auth and tenant middleware to all routes
rbacRoutes.use('*', authMiddleware)
rbacRoutes.use('*', tenantMiddleware)

// =============================================================================
// SCHEMA DEFINITIONS
// =============================================================================

const createRoleSchema = z.object({
    roleName: z
        .string()
        .min(2)
        .max(100)
        .regex(/^[A-Z_][A-Z0-9_]*$/, 'Role name must be uppercase with underscores'),
    description: z.string().optional(),
    permissions: z.record(z.array(z.string())).default({}),
    bankingTypeSpecific: z.enum(['CONVENTIONAL', 'SYARIAH', 'BOTH']).optional(),
    complianceLevel: z.string().optional(),
    hierarchyLevel: z.number().int().min(1).max(10).default(1),
})

const updateRoleSchema = z.object({
    roleName: z.string().min(2).max(100).optional(),
    description: z.string().optional(),
    permissions: z.record(z.array(z.string())).optional(),
    bankingTypeSpecific: z.enum(['CONVENTIONAL', 'SYARIAH', 'BOTH']).nullish(),
    hierarchyLevel: z.number().int().min(1).max(10).optional(),
    isActive: z.boolean().optional(),
})

const assignRoleSchema = z.object({
    validFrom: z.string().datetime().optional(),
    validUntil: z.string().datetime().optional(),
    isTemporary: z.boolean().default(false),
    temporaryReason: z.string().optional(),
})

// =============================================================================
// ROLE ROUTES
// =============================================================================

/**
 * GET /roles - List all roles for tenant
 */
rbacRoutes.get('/roles', async (c) => {
    const tenantId = c.get('tenantId')!
    const includeInactive = c.req.query('includeInactive') === 'true'
    const bankingType = c.req.query('bankingType')

    const effect = pipe(
        rbacService.getRoles(tenantId, { includeInactive, bankingType }),
        Effect.map((roles) => ({
            roles,
            total: roles.length,
        }))
    )

    return runEffect(c, effect)
})

/**
 * POST /roles - Create a new role
 */
rbacRoutes.post('/roles', zValidator('json', createRoleSchema), async (c) => {
    const tenantId = c.get('tenantId')!
    const userId = c.get('userId')
    const body = c.req.valid('json')

    const effect = rbacService.createRole({
        ...body,
        tenantId,
        createdBy: userId,
    })

    return runEffect(c, effect)
})

/**
 * GET /roles/:roleId - Get role by ID
 */
rbacRoutes.get('/roles/:roleId', async (c) => {
    const { roleId } = c.req.param()

    const effect = rbacService.getRoleById(roleId)

    return runEffect(c, effect)
})

/**
 * PUT /roles/:roleId - Update a role
 */
rbacRoutes.put('/roles/:roleId', zValidator('json', updateRoleSchema), async (c) => {
    const { roleId } = c.req.param()
    const userId = c.get('userId')
    const body = c.req.valid('json')

    const effect = rbacService.updateRole(roleId, {
        ...body,
        updatedBy: userId,
    })

    return runEffect(c, effect)
})

/**
 * DELETE /roles/:roleId - Soft delete a role
 */
rbacRoutes.delete('/roles/:roleId', async (c) => {
    const { roleId } = c.req.param()

    const effect = rbacService.deleteRole(roleId)

    return runEffect(c, effect)
})

/**
 * GET /roles/:roleId/permissions - Get role permissions
 */
rbacRoutes.get('/roles/:roleId/permissions', async (c) => {
    const { roleId } = c.req.param()

    const effect = pipe(
        rbacService.getRoleById(roleId),
        Effect.map((role) => ({
            roleId: role.id,
            roleName: role.roleName,
            permissions: role.permissions,
        }))
    )

    return runEffect(c, effect)
})

/**
 * PUT /roles/:roleId/permissions - Update role permissions
 */
rbacRoutes.put(
    '/roles/:roleId/permissions',
    zValidator('json', z.object({ permissions: z.record(z.array(z.string())) })),
    async (c) => {
        const { roleId } = c.req.param()
        const userId = c.get('userId')
        const { permissions } = c.req.valid('json')

        const effect = rbacService.updateRole(roleId, {
            permissions,
            updatedBy: userId,
        })

        return runEffect(c, effect)
    }
)

// =============================================================================
// USER-ROLE ASSIGNMENT ROUTES
// =============================================================================

/**
 * GET /users/:userId/roles - Get user's roles
 */
rbacRoutes.get('/users/:userId/roles', async (c) => {
    const { userId } = c.req.param()
    const tenantId = c.get('tenantId')!

    const effect = pipe(
        rbacService.getUserRoles(userId, tenantId),
        Effect.map((userRoles) => ({
            userId,
            roles: userRoles.map((ur) => ({
                id: ur.id,
                roleId: ur.roleId,
                role: (ur as any).role,
                assignedAt: ur.assignedAt,
                validFrom: ur.validFrom,
                validUntil: ur.validUntil,
                isTemporary: ur.isTemporary,
            })),
        }))
    )

    return runEffect(c, effect)
})

/**
 * POST /users/:userId/roles/:roleId - Assign role to user
 */
rbacRoutes.post(
    '/users/:userId/roles/:roleId',
    zValidator('json', assignRoleSchema),
    async (c) => {
        const { userId, roleId } = c.req.param()
        const tenantId = c.get('tenantId')!
        const assignedBy = c.get('userId')
        const body = c.req.valid('json')

        const effect = rbacService.assignRole({
            userId,
            roleId,
            tenantId,
            assignedBy,
            validFrom: body.validFrom ? new Date(body.validFrom) : undefined,
            validUntil: body.validUntil ? new Date(body.validUntil) : undefined,
            isTemporary: body.isTemporary,
            temporaryReason: body.temporaryReason,
        })

        return runEffect(c, effect)
    }
)

/**
 * DELETE /users/:userId/roles/:roleId - Remove role from user
 */
rbacRoutes.delete('/users/:userId/roles/:roleId', async (c) => {
    const { userId, roleId } = c.req.param()

    const effect = rbacService.removeRole(userId, roleId)

    return runEffect(c, effect)
})

// =============================================================================
// PERMISSION CHECK ROUTES
// =============================================================================

/**
 * GET /users/:userId/permissions - Get all permissions for user
 */
rbacRoutes.get('/users/:userId/permissions', async (c) => {
    const { userId } = c.req.param()
    const tenantId = c.get('tenantId')!

    const effect = pipe(
        rbacService.getUserPermissions(userId, tenantId),
        Effect.map((permissions) => ({
            userId,
            permissions,
        }))
    )

    return runEffect(c, effect)
})

/**
 * POST /users/:userId/permissions/check - Check if user has permission
 */
rbacRoutes.post(
    '/users/:userId/permissions/check',
    zValidator('json', z.object({ resource: z.string(), action: z.string() })),
    async (c) => {
        const { userId } = c.req.param()
        const tenantId = c.get('tenantId')!
        const { resource, action } = c.req.valid('json')

        const effect = pipe(
            rbacService.hasPermission(userId, tenantId, resource, action),
            Effect.map((hasPermission) => ({
                userId,
                resource,
                action,
                hasPermission,
            }))
        )

        return runEffect(c, effect)
    }
)

// =============================================================================
// PERMISSION MANAGEMENT ENDPOINTS
// =============================================================================

/**
 * GET /permissions - Get all available permissions grouped
 */
rbacRoutes.get('/permissions', async (c) => {
    return c.json(PERMISSION_GROUPS)
})

/**
 * GET /roles/:id/permissions - Get role permissions
 */
rbacRoutes.get('/roles/:id/permissions', async (c) => {
    const { id } = c.req.param()

    const [role] = await db
        .select()
        .from(roles)
        .where(eq(roles.id, id))
        .limit(1)

    if (!role) {
        return c.json({ error: 'Role not found' }, 404)
    }

    return c.json({
        roleId: role.id,
        roleName: role.roleName,
        permissions: role.permissions || {}
    })
})

/**
 * PUT /roles/:id/permissions - Update role permissions
 */
rbacRoutes.put(
    '/roles/:id/permissions',
    zValidator('json', z.object({
        permissions: z.record(z.boolean())
    })),
    async (c) => {
        const { id } = c.req.param()
        const { permissions } = c.req.valid('json')
        const userId = c.get('userId')
        const tenantId = c.get('tenantId')

        // Validate all permissions exist
        const invalidPerms = Object.keys(permissions).filter(p => !isValidPermission(p))
        if (invalidPerms.length > 0) {
            return c.json({
                error: 'Invalid permissions',
                invalidPermissions: invalidPerms
            }, 400)
        }

        // Check if role exists
        const [existingRole] = await db
            .select()
            .from(roles)
            .where(eq(roles.id, id))
            .limit(1)

        if (!existingRole) {
            return c.json({ error: 'Role not found' }, 404)
        }

        // Prevent modification of system roles
        if (existingRole.isSystemRole) {
            return c.json({ error: 'Cannot modify system role permissions' }, 403)
        }

        // Update role
        const [updated] = await db
            .update(roles)
            .set({
                permissions,
                updatedBy: userId,
                updatedAt: new Date()
            })
            .where(eq(roles.id, id))
            .returning()

        // Log permission update
        if (userId && tenantId) {
            await auditService.logPermission.permissionsUpdated(
                id,
                existingRole.roleName,
                existingRole.permissions,
                permissions,
                userId,
                tenantId
            )
        }

        return c.json(updated)
    }
)
