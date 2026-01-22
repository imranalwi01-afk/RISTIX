import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { Effect, pipe } from 'effect'
import type { AppContext } from '../app'
import { authMiddleware, tenantMiddleware } from '../middleware'
import { runEffect } from '../lib/effect'
import * as rbacService from '../services/rbac.service'
import { PERMISSION_GROUPS, isValidPermission } from '../config/permissions'
import { db } from '../config/database'
import { roles } from '../db/schema'
import { eq } from 'drizzle-orm'
import * as auditService from '../services/audit.service'

export const rbacRoutes = new OpenAPIHono<AppContext>()

// Apply auth and tenant middleware to all routes
rbacRoutes.use('*', authMiddleware)
rbacRoutes.use('*', tenantMiddleware)

// =============================================================================
// SCHEMA DEFINITIONS
// =============================================================================

const RoleSchema = z.object({
    id: z.string().openapi({ example: '123e4567-e89b-12d3-a456-426614174000' }),
    roleName: z.string().openapi({ example: 'DATA_ENTRY' }),
    roleCode: z.string().openapi({ example: 'DATA_ENTRY' }),
    description: z.string().nullable().optional().openapi({ example: 'Data entry clerk' }),
    permissions: z.record(z.array(z.string())).nullable().optional(),
    bankingTypeSpecific: z.enum(['CONVENTIONAL', 'SYARIAH', 'BOTH']).nullable().optional(),
    complianceLevel: z.string().nullable().optional(),
    hierarchyLevel: z.number().int().default(1),
    isSystemRole: z.boolean().optional(),
    isActive: z.boolean().optional(),
    tenantId: z.string().nullable().optional(),
}).openapi('Role')

const CreateRoleSchema = z.object({
    roleName: z
        .string()
        .min(2)
        .max(100)
        .regex(/^[A-Z_][A-Z0-9_]*$/, 'Role name must be uppercase with underscores')
        .openapi({ example: 'NEW_ROLE' }),
    description: z.string().optional().openapi({ example: 'New role description' }),
    permissions: z.record(z.array(z.string())).default({}),
    bankingTypeSpecific: z.enum(['CONVENTIONAL', 'SYARIAH', 'BOTH']).optional(),
    complianceLevel: z.string().optional(),
    hierarchyLevel: z.number().int().min(1).max(10).default(1),
}).openapi('CreateRoleInput')

const UpdateRoleSchema = z.object({
    roleName: z.string().min(2).max(100).optional(),
    description: z.string().optional(),
    permissions: z.record(z.array(z.string())).optional(),
    bankingTypeSpecific: z.enum(['CONVENTIONAL', 'SYARIAH', 'BOTH']).nullish(),
    hierarchyLevel: z.number().int().min(1).max(10).optional(),
    isActive: z.boolean().optional(),
}).openapi('UpdateRoleInput')

const AssignRoleSchema = z.object({
    validFrom: z.string().datetime().optional().openapi({ example: '2023-01-01T00:00:00Z' }),
    validUntil: z.string().datetime().optional().openapi({ example: '2023-12-31T23:59:59Z' }),
    isTemporary: z.boolean().default(false),
    temporaryReason: z.string().optional(),
}).openapi('AssignRoleInput')

const UserRoleSchema = z.object({
    id: z.string(),
    roleId: z.string(),
    role: RoleSchema.optional(),
    assignedAt: z.string(), // ISO Date
    validFrom: z.string().nullable().optional(),
    validUntil: z.string().nullable().optional(),
    isTemporary: z.boolean().optional(),
}).openapi('UserRole')

const PermissionCheckSchema = z.object({
    resource: z.string().openapi({ example: 'users' }),
    action: z.string().openapi({ example: 'read' }),
}).openapi('PermissionCheckInput')

const UpdatePermissionsSchema = z.object({
    permissions: z.record(z.array(z.string()))
}).openapi('UpdatePermissionsInput')

// =============================================================================
// ROLE ROUTES
// =============================================================================

/**
 * GET /roles - List all roles for tenant
 */
rbacRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/',
        tags: ['RBAC'],
        summary: 'List Roles',
        security: [{ BearerAuth: [] }],
        request: {
            query: z.object({
                page: z.string().optional().openapi({ example: '1' }),
                limit: z.string().optional().openapi({ example: '10' }),
                search: z.string().optional(),
                includeInactive: z.string().optional().openapi({ example: 'true' }),
                bankingType: z.string().optional(),
                type: z.string().optional().openapi({ example: 'SYSTEM' }),
                level: z.string().optional().openapi({ example: 'TENANT' }),
            }),
        },
        responses: {
            200: {
                content: {
                    'application/json': {
                        schema: z.object({
                            success: z.boolean(),
                            data: z.array(RoleSchema),
                            pagination: z.object({
                                total: z.number(),
                                page: z.number(),
                                limit: z.number(),
                            }),
                        }),
                    },
                },
                description: 'List of roles',
            },
        },
    }),
    async (c) => {
        const tenantId = c.get('tenantId')!
        const query = c.req.valid('query')

        const page = parseInt(query.page || '1')
        const limit = parseInt(query.limit || '100')
        const includeInactive = query.includeInactive === 'true'
        const bankingType = query.bankingType

        const effect = pipe(
            rbacService.getRoles(tenantId, {
                includeInactive,
                bankingType,
                search: query.search,
                type: query.type,
                level: query.level
            }),
            Effect.map((result) => ({
                data: result.data.map(r => ({
                    ...r,
                    // Handle potential nulls
                    description: r.description ?? null,
                    permissions: r.permissions ?? null,
                    tenantId: r.tenantId ?? null,
                })),
                pagination: {
                    total: result.total,
                    page,
                    limit
                }
            }))
        )

        return runEffect(c, effect)
    }
)

/**
 * POST /roles - Create a new role
 */
rbacRoutes.openapi(
    createRoute({
        method: 'post',
        path: '/',
        tags: ['RBAC'],
        summary: 'Create Role',
        security: [{ BearerAuth: [] }],
        request: {
            body: {
                content: {
                    'application/json': {
                        schema: CreateRoleSchema,
                    },
                },
            },
        },
        responses: {
            200: {
                content: {
                    'application/json': {
                        schema: RoleSchema,
                    },
                },
                description: 'Role created',
            },
        },
    }),
    async (c) => {
        const tenantId = c.get('tenantId')!
        const userId = c.get('userId')
        const body = c.req.valid('json')

        const effect = pipe(
            rbacService.createRole({
                ...body,
                roleCode: body.roleName, // Use roleName as roleCode
                tenantId,
                // createdBy: userId,
            }),
            Effect.map(r => ({
                ...r,
                description: r.description ?? null,
                permissions: r.permissions ?? null,
                // bankingTypeSpecific: r.bankingTypeSpecific ?? null,
                // complianceLevel: r.complianceLevel ?? null,
                tenantId: r.tenantId ?? null,
            }))
        )

        return runEffect(c, effect)
    }
)

/**
 * GET /permissions - Get all available permissions grouped
 */
rbacRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/permissions',
        tags: ['RBAC'],
        summary: 'List Available Permissions',
        security: [{ BearerAuth: [] }],
        responses: {
            200: {
                description: 'Permission groups',
                content: {
                    'application/json': {
                        schema: z.object({
                            success: z.boolean(),
                            data: z.array(z.any()),
                        })
                    }
                }
            },
        },
    }),
    async (c) => {
        const tenantId = c.get('tenantId')!

        const effect = pipe(
            rbacService.getAvailablePermissions(tenantId),
            Effect.map((permissions) => permissions.map(p => ({
                ...p,
                category: p.category ?? 'CORE',
                riskLevel: (p as any).riskLevel ?? 'LOW',
                requiresApproval: (p as any).requiresApproval ?? false,
            }))),
        )

        return runEffect(c, effect)
    }
)

/**
 * GET /roles/:roleId - Get role by ID
 */
rbacRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/{roleId}',
        tags: ['RBAC'],
        summary: 'Get Role',
        security: [{ BearerAuth: [] }],
        request: {
            params: z.object({
                roleId: z.string().openapi({ param: { name: 'roleId', in: 'path' } }),
            }),
        },
        responses: {
            200: {
                content: {
                    'application/json': {
                        schema: z.object({
                            success: z.boolean(),
                            data: RoleSchema,
                        }),
                    },
                },
                description: 'Role details',
            },
        },
    }),
    async (c) => {
        const { roleId } = c.req.valid('param')

        const effect = pipe(
            rbacService.getRoleById(roleId),
            Effect.map(r => ({
                success: true,
                data: {
                    ...r,
                    description: r.description ?? null,
                    permissions: r.permissions ?? null,
                    tenantId: r.tenantId ?? null,
                },
            }))
        )

        return runEffect(c, effect)
    }
)

/**
 * PUT /roles/:roleId - Update a role
 */
rbacRoutes.openapi(
    createRoute({
        method: 'put',
        path: '/{roleId}',
        tags: ['RBAC'],
        summary: 'Update Role',
        security: [{ BearerAuth: [] }],
        request: {
            params: z.object({
                roleId: z.string().openapi({ param: { name: 'roleId', in: 'path' } }),
            }),
            body: {
                content: {
                    'application/json': {
                        schema: UpdateRoleSchema,
                    },
                },
            },
        },
        responses: {
            200: {
                content: {
                    'application/json': {
                        schema: RoleSchema,
                    },
                },
                description: 'Role updated',
            },
        },
    }),
    async (c) => {
        const { roleId } = c.req.valid('param')
        const userId = c.get('userId')
        const body = c.req.valid('json')

        const effect = pipe(
            rbacService.updateRole(roleId, {
                ...body,
                // updatedBy: userId,
            }),
            Effect.map(r => ({
                ...r,
                description: r.description ?? null,
                permissions: r.permissions ?? null,
                // bankingTypeSpecific: r.bankingTypeSpecific ?? null,
                // complianceLevel: r.complianceLevel ?? null,
                tenantId: (r as any).tenantId ?? null,
            }))
        )

        return runEffect(c, effect)
    }
)

/**
 * DELETE /roles/:roleId - Soft delete a role
 */
rbacRoutes.openapi(
    createRoute({
        method: 'delete',
        path: '/{roleId}',
        tags: ['RBAC'],
        summary: 'Delete Role',
        security: [{ BearerAuth: [] }],
        request: {
            params: z.object({
                roleId: z.string().openapi({ param: { name: 'roleId', in: 'path' } }),
            }),
        },
        responses: {
            200: {
                content: {
                    'application/json': {
                        schema: z.object({
                            success: z.boolean(),
                            data: z.object({ id: z.string() })
                        }),
                    },
                },
                description: 'Role deleted',
            },
        },
    }),
    async (c) => {
        const { roleId } = c.req.valid('param')
        const effect = pipe(
            rbacService.deleteRole(roleId),
            Effect.map(result => ({ id: result.id }))
        )
        return runEffect(c, effect) as any
    }
)

/**
 * GET /roles/:roleId/permissions - Get role permissions
 */
rbacRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/{roleId}/permissions',
        tags: ['RBAC'],
        summary: 'Get Role Permissions',
        security: [{ BearerAuth: [] }],
        request: {
            params: z.object({
                roleId: z.string().openapi({ param: { name: 'roleId', in: 'path' } }),
            }),
        },
        responses: {
            200: {
                content: {
                    'application/json': {
                        schema: z.object({
                            roleId: z.string(),
                            roleName: z.string(),
                            permissions: z.record(z.array(z.string())).nullable(),
                        }),
                    },
                },
                description: 'Role permissions',
            },
        },
    }),
    async (c) => {
        const { roleId } = c.req.valid('param')

        const effect = pipe(
            rbacService.getRoleById(roleId),
            Effect.map((role) => ({
                roleId: role.id,
                roleName: role.roleName,
                permissions: role.permissions,
            }))
        )

        return runEffect(c, effect)
    }
)

/**
 * PUT /roles/:roleId/permissions - Update role permissions
 * Note: Two routes seemed to exist for permission update in original file, one at /roles/:roleId/permissions and one at /roles/:id/permissions later.
 * The first one used simple updateRole service. The second one used DB direct update + audit log manually. 
 * I will consolidate to the first one but with audit log if possible, OR keep both if they serve different purposes?
 * Actually looking at the file, lines 155 and 324. They seem to be duplicate functionality but one is more complex.
 * The second one (324) handles 'permissions: Record<string, boolean>' which seems wrong compared to 'Record<string, array<string>>' used elsewhere?
 * Line 327: permissions: z.record(z.boolean()).
 * Line 157: permissions: z.record(z.array(z.string())).
 * The DB schema `permissions` column is usually JSONB.
 * rbacService.updateRole uses Partial<NewRole>.
 * I will implement the first one (lines 155-170) as it matches the `updateRole` service and probable schema (record<string, string[]>).
 * The second one seemed like a specific UI endpoint maybe for toggles? But validPermission check implies keys are permissions?
 * But typical RBAC here seems to be Resource -> Actions[] map.
 * I will stick to the first implementation style which is cleaner service usage.
 */

rbacRoutes.openapi(
    createRoute({
        method: 'put',
        path: '/{roleId}/permissions',
        tags: ['RBAC'],
        summary: 'Update Role Permissions',
        security: [{ BearerAuth: [] }],
        request: {
            params: z.object({
                roleId: z.string().openapi({ param: { name: 'roleId', in: 'path' } }),
            }),
            body: {
                content: {
                    'application/json': {
                        schema: UpdatePermissionsSchema,
                    },
                },
            },
        },
        responses: {
            200: {
                content: {
                    'application/json': {
                        schema: RoleSchema,
                    },
                },
                description: 'Permissions updated',
            },
        },
    }),
    async (c) => {
        const { roleId } = c.req.valid('param')
        const userId = c.get('userId')
        const { permissions } = c.req.valid('json')

        const effect = pipe(
            rbacService.updateRole(roleId, {
                permissions,
                // updatedBy: userId,
            }),
            Effect.map(r => ({
                ...r,
                description: r.description ?? null,
                permissions: r.permissions ?? null,
                // bankingTypeSpecific: r.bankingTypeSpecific ?? null,
                // complianceLevel: r.complianceLevel ?? null,
                tenantId: r.tenantId ?? null,
            }))
        )

        return runEffect(c, effect)
    }
)

// =============================================================================
// USER-ROLE ASSIGNMENT ROUTES
// =============================================================================

/**
 * GET /users/:userId/roles - Get user's roles
 */
rbacRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/users/{userId}/roles',
        tags: ['RBAC'],
        summary: 'Get User Roles',
        security: [{ BearerAuth: [] }],
        request: {
            params: z.object({
                userId: z.string().openapi({ param: { name: 'userId', in: 'path' } }),
            }),
        },
        responses: {
            200: {
                content: {
                    'application/json': {
                        schema: z.object({
                            success: z.boolean(),
                            data: z.object({
                                userId: z.string(),
                                roles: z.array(UserRoleSchema),
                            }),
                        }),
                    },
                },
                description: 'User roles',
            },
        },
    }),
    async (c) => {
        const { userId } = c.req.valid('param')
        const tenantId = c.get('tenantId')!

        const effect = pipe(
            rbacService.getUserRoles(userId, tenantId),
            Effect.map((userRoles) => ({
                success: true,
                data: {
                    userId,
                    roles: userRoles.map((ur) => ({
                        id: ur.id,
                        roleId: ur.roleId,
                        role: (ur as any).role ? {
                            ...(ur as any).role,
                            description: (ur as any).role.description ?? null,
                            permissions: (ur as any).role.permissions ?? null,
                            tenantId: (ur as any).role.tenantId ?? null,
                        } : undefined,
                        assignedAt: ur.assignedAt?.toISOString() ?? null,
                        validFrom: ur.validFrom ? ur.validFrom.toISOString() : null,
                        validUntil: ur.validUntil ? ur.validUntil.toISOString() : null,
                        isTemporary: ur.isTemporary,
                    })),
                },
            }))
        )

        return runEffect(c, effect)
    }
)

/**
 * POST /users/:userId/roles/:roleId - Assign role to user
 */
rbacRoutes.openapi(
    createRoute({
        method: 'post',
        path: '/users/{userId}/roles/{roleId}',
        tags: ['RBAC'],
        summary: 'Assign Role to User',
        security: [{ BearerAuth: [] }],
        request: {
            params: z.object({
                userId: z.string().openapi({ param: { name: 'userId', in: 'path' } }),
                roleId: z.string().openapi({ param: { name: 'roleId', in: 'path' } }),
            }),
            body: {
                content: {
                    'application/json': {
                        schema: AssignRoleSchema,
                    },
                },
            },
        },
        responses: {
            200: {
                content: {
                    'application/json': {
                        schema: z.object({
                            success: z.boolean(),
                            data: z.any(),
                        }),
                    },
                },
                description: 'Role assigned',
            },
        },
    }),
    async (c) => {
        const { userId, roleId } = c.req.valid('param')
        const tenantId = c.get('tenantId')!
        const assignedBy = c.get('userId')
        const body = c.req.valid('json')

        const effect = pipe(
            rbacService.assignRole({
                userId,
                roleId,
                tenantId,
                assignedBy,
                validFrom: body.validFrom ? new Date(body.validFrom) : undefined,
                validUntil: body.validUntil ? new Date(body.validUntil) : undefined,
                isTemporary: body.isTemporary,
            }),
            Effect.map(result => ({
                success: true,
                data: result,
            }))
        )

        return runEffect(c, effect)
    }
)

/**
 * DELETE /users/:userId/roles/:roleId - Remove role from user
 */
rbacRoutes.openapi(
    createRoute({
        method: 'delete',
        path: '/users/{userId}/roles/{roleId}',
        tags: ['RBAC'],
        summary: 'Remove Role from User',
        security: [{ BearerAuth: [] }],
        request: {
            params: z.object({
                userId: z.string().openapi({ param: { name: 'userId', in: 'path' } }),
                roleId: z.string().openapi({ param: { name: 'roleId', in: 'path' } }),
            }),
        },
        responses: {
            200: {
                description: 'Role removed',
                content: {
                    'application/json': {
                        schema: z.object({
                            success: z.boolean(),
                            data: z.any()
                        })
                    }
                }
            },
        },
    }),
    async (c) => {
        const { userId, roleId } = c.req.valid('param')
        const tenantId = c.get('tenantId')!
        const effect = rbacService.removeRole(userId, roleId, tenantId)
        const result = await runEffect(c, effect)
        return c.json({ success: true, data: result } as any)
    }
)

// =============================================================================
// PERMISSION CHECK ROUTES
// =============================================================================

/**
 * GET /users/:userId/permissions - Get all permissions for user
 */
rbacRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/users/{userId}/permissions',
        tags: ['RBAC'],
        summary: 'Get User Permissions',
        security: [{ BearerAuth: [] }],
        request: {
            params: z.object({
                userId: z.string().openapi({ param: { name: 'userId', in: 'path' } }),
            }),
        },
        responses: {
            200: {
                content: {
                    'application/json': {
                        schema: z.object({
                            userId: z.string(),
                            permissions: z.record(z.array(z.string())),
                        }),
                    },
                },
                description: 'User permissions',
            },
        },
    }),
    async (c) => {
        const { userId } = c.req.valid('param')
        const tenantId = c.get('tenantId')!

        const effect = pipe(
            rbacService.getUserPermissions(userId, tenantId),
            Effect.map((permissions) => ({
                userId,
                permissions,
            }))
        )

        return runEffect(c, effect)
    }
)

/**
 * POST /users/:userId/permissions/check - Check if user has permission
 */
rbacRoutes.openapi(
    createRoute({
        method: 'post',
        path: '/users/{userId}/permissions/check',
        tags: ['RBAC'],
        summary: 'Check Permission',
        security: [{ BearerAuth: [] }],
        request: {
            params: z.object({
                userId: z.string().openapi({ param: { name: 'userId', in: 'path' } }),
            }),
            body: {
                content: {
                    'application/json': {
                        schema: PermissionCheckSchema,
                    },
                },
            },
        },
        responses: {
            200: {
                content: {
                    'application/json': {
                        schema: z.object({
                            success: z.boolean(),
                            data: z.object({
                                userId: z.string(),
                                resource: z.string(),
                                action: z.string(),
                                hasPermission: z.boolean(),
                            }),
                        }),
                    },
                },
                description: 'Permission check result',
            },
        },
    }),
    async (c) => {
        const { userId } = c.req.valid('param')
        const tenantId = c.get('tenantId')!
        const { resource, action } = c.req.valid('json')

        const effect = pipe(
            rbacService.hasPermission(userId, tenantId, resource, action),
            Effect.map((hasPermission) => ({
                success: true,
                data: {
                    userId,
                    resource,
                    action,
                    hasPermission,
                },
            }))
        )

        return runEffect(c, effect)
    }
)

// =============================================================================
// PERMISSION MANAGEMENT ENDPOINTS
// =============================================================================

