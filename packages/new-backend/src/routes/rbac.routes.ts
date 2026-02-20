import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { Effect, pipe } from 'effect'
import type { AppContext } from '../app'
import { authMiddleware, tenantMiddleware } from '../middleware'
import { runEffect } from '../lib/effect'
import * as rbacService from '../services/rbac.service'
import * as auditService from '../services/audit.service'
import { createApprovalRequest } from '../services/approval.service'

export const rbacRoutes = new OpenAPIHono<AppContext>()

// Apply auth and tenant middleware to all routes
rbacRoutes.use('*', authMiddleware)
rbacRoutes.use('*', tenantMiddleware)

// =============================================================================
// SCHEMA DEFINITIONS
// =============================================================================

const PermissionSchema = z.object({
    id: z.string().openapi({ example: '123e4567-e89b-12d3-a456-426614174000' }),
    code: z.string().openapi({ example: 'USER_READ' }),
    name: z.string().openapi({ example: 'User Read' }),
    displayName: z.string().openapi({ example: 'User Read' }),
    description: z.string().openapi({ example: 'Read user information' }),
    resource: z.string().openapi({ example: 'users' }),
    action: z.string().openapi({ example: 'read' }),
    module: z.string().openapi({ example: 'user_management' }),
    category: z.enum(['CORE', 'BANKING', 'IFRS9', 'REPORTING', 'ADMIN']).openapi({ example: 'CORE' }),
    riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).openapi({ example: 'LOW' }),
    requiresApproval: z.boolean().openapi({ example: false }),
    requiredApprovalLevel: z.number().nullable().optional().openapi({ example: 2, description: 'Minimum hierarchy level required to approve (1-10)' }),
    requiredApprovers: z.number().optional().openapi({ example: 1, description: 'Number of approvers needed' }),
    bankingSpecific: z.boolean().openapi({ example: false }),
    syariahRequired: z.boolean().openapi({ example: false }),
}).openapi('Permission')

const RoleSchema = z.object({
    id: z.string().openapi({ example: '123e4567-e89b-12d3-a456-426614174000' }),
    roleName: z.string().openapi({ example: 'DATA_ENTRY' }),
    roleCode: z.string().openapi({ example: 'DATA_ENTRY' }),
    description: z.string().nullable().optional().openapi({ example: 'Data entry clerk' }),
    permissions: z.record(z.array(PermissionSchema)).openapi({ example: { 'CORE': [], 'BANKING': [], 'IFRS9': [], 'REPORTING': [], 'ADMIN': [] } }),
    bankingTypeSpecific: z.enum(['CONVENTIONAL', 'SYARIAH', 'BOTH']).nullable().optional(),
    complianceLevel: z.string().nullable().optional(),
    hierarchyLevel: z.number().int().default(1),
    isSystemRole: z.boolean().optional(),
    isActive: z.boolean().optional(),
    tenantId: z.string().nullable().optional(),
}).openapi('Role')

const normalizeRoleName = (value: string): string =>
    value
        .trim()
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '')
        .replace(/_+/g, '_')

const ROLE_NAME_REGEX = /^[A-Z_][A-Z0-9_]*$/

const CreateRoleSchema = z.object({
    roleName: z.string().min(2).max(100).optional().openapi({ example: 'NEW_ROLE' }),
    name: z.string().min(2).max(100).optional().openapi({ example: 'NEW_ROLE' }),
    description: z.string().optional().openapi({ example: 'New role description' }),
    permissions: z.array(z.string()).default([]), // Array of permission codes
    bankingTypeSpecific: z.enum(['CONVENTIONAL', 'SYARIAH', 'BOTH']).optional(),
    bankingAccess: z.enum(['CONVENTIONAL', 'SYARIAH', 'BOTH']).optional(),
    complianceLevel: z.string().optional(),
    hierarchyLevel: z.number().int().min(1).max(10).default(1),
})
    .superRefine((value, ctx) => {
        const source = value.roleName ?? value.name
        const normalized = source ? normalizeRoleName(source) : ''

        if (!source) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['roleName'],
                message: 'Required',
            })
            return
        }

        if (normalized.length < 2 || normalized.length > 100 || !ROLE_NAME_REGEX.test(normalized)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['roleName'],
                message: 'Role name must be uppercase with underscores',
            })
        }
    })
    .openapi('CreateRoleInput')

const UpdateRoleSchema = z.object({
    roleName: z.string().min(2).max(100).optional(),
    name: z.string().min(2).max(100).optional(),
    description: z.string().optional(),
    permissions: z.array(z.string()).optional(), // Array of permission codes
    bankingTypeSpecific: z.enum(['CONVENTIONAL', 'SYARIAH', 'BOTH']).nullish(),
    bankingAccess: z.enum(['CONVENTIONAL', 'SYARIAH', 'BOTH']).nullish(),
    hierarchyLevel: z.number().int().min(1).max(10).optional(),
    isActive: z.boolean().optional(),
})
    .superRefine((value, ctx) => {
        const source = value.roleName ?? value.name
        if (!source) return

        const normalized = normalizeRoleName(source)
        if (normalized.length < 2 || normalized.length > 100 || !ROLE_NAME_REGEX.test(normalized)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['roleName'],
                message: 'Role name must be uppercase with underscores',
            })
        }
    })
    .openapi('UpdateRoleInput')

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
    permissions: z.array(z.string()),
    submitForApproval: z.boolean().optional().default(false),
    approvalReason: z.string().max(500).optional(),
}).openapi('UpdatePermissionsInput')

const roleToApiResponse = (r: any) => ({
    id: r.id,
    roleName: r.roleName,
    roleCode: r.roleCode,
    description: r.description ?? null,
    permissions: ((r as any).rolePermissions || []).reduce((acc: Record<string, any[]>, rp: any) => {
        const category = (rp.permission.category as 'CORE' | 'BANKING' | 'IFRS9' | 'REPORTING' | 'ADMIN') || 'CORE'
        if (!acc[category]) acc[category] = []
        acc[category].push({
            id: rp.permission.id,
            code: rp.permission.code,
            name: rp.permission.name,
            displayName: rp.permission.name,
            description: rp.permission.description || '',
            resource: rp.permission.resource,
            action: rp.permission.action,
            module: rp.permission.module,
            category: category,
            riskLevel: 'LOW' as const,
            requiresApproval: false,
            bankingSpecific: rp.permission.module === 'banking',
            syariahRequired: false,
        })
        return acc
    }, {} as Record<string, any[]>),
    bankingTypeSpecific: r.bankingTypeSpecific,
    complianceLevel: r.complianceLevel,
    hierarchyLevel: r.hierarchyLevel,
    isSystemRole: r.isSystemRole,
    isActive: r.isActive,
    tenantId: (r as any).tenantId ?? null,
})

const extractRolePermissionCodes = (role: any): string[] => {
    const codes = ((role as any)?.rolePermissions || [])
        .map((rp: any) => rp?.permission?.code)
        .filter((code: unknown): code is string => typeof code === 'string' && code.length > 0)
    return Array.from(new Set(codes))
}

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
                    id: r.id,
                    roleName: r.roleName,
                    roleCode: r.roleCode,
                    description: r.description ?? null,
                    permissions: (r.rolePermissions || []).reduce((acc, rp) => {
                        const category = (rp.permission.category as 'CORE' | 'BANKING' | 'IFRS9' | 'REPORTING' | 'ADMIN') || 'CORE';
                        if (!acc[category]) acc[category] = [];
                        acc[category].push({
                            id: rp.permission.id,
                            code: rp.permission.code,
                            name: rp.permission.name,
                            displayName: rp.permission.name,
                            description: rp.permission.description || '',
                            resource: rp.permission.resource,
                            action: rp.permission.action,
                            module: rp.permission.module,
                            category: category,
                            riskLevel: 'LOW' as const, // Default value since not in DB
                            requiresApproval: false, // Default value since not in DB
                            bankingSpecific: rp.permission.module === 'banking',
                            syariahRequired: false, // Default value since not in DB
                        });
                        return acc;
                    }, {} as Record<string, any[]>),
                    bankingTypeSpecific: r.bankingTypeSpecific,
                    complianceLevel: r.complianceLevel,
                    hierarchyLevel: r.hierarchyLevel,
                    isSystemRole: r.isSystemRole,
                    isActive: r.isActive,
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
        const roleNameSource = body.roleName ?? body.name
        const normalizedRoleName = roleNameSource ? normalizeRoleName(roleNameSource) : ''

        const effect = pipe(
            rbacService.createRole({
                roleName: normalizedRoleName,
                roleCode: normalizedRoleName,
                description: body.description,
                bankingTypeSpecific: body.bankingTypeSpecific ?? body.bankingAccess,
                complianceLevel: body.complianceLevel,
                hierarchyLevel: body.hierarchyLevel,
                tenantId,
                // createdBy: userId,
            }),
            Effect.map((r: any) => ({
                id: r.id,
                roleName: r.roleName,
                roleCode: r.roleCode,
                description: r.description ?? null,
                permissions: ((r as any).rolePermissions || []).reduce((acc: Record<string, any[]>, rp: any) => {
                    const category = (rp.permission.category as 'CORE' | 'BANKING' | 'IFRS9' | 'REPORTING' | 'ADMIN') || 'CORE';
                    if (!acc[category]) acc[category] = [];
                    acc[category].push({
                        id: rp.permission.id,
                        code: rp.permission.code,
                        name: rp.permission.name,
                        displayName: rp.permission.name,
                        description: rp.permission.description || '',
                        resource: rp.permission.resource,
                        action: rp.permission.action,
                        module: rp.permission.module,
                        category: category,
                        riskLevel: 'LOW' as const, // Default value since not in DB
                        requiresApproval: false, // Default value since not in DB
                        bankingSpecific: rp.permission.module === 'banking',
                        syariahRequired: false, // Default value since not in DB
                    });
                    return acc;
                }, {} as Record<string, any[]>),
                bankingTypeSpecific: r.bankingTypeSpecific,
                complianceLevel: r.complianceLevel,
                hierarchyLevel: r.hierarchyLevel,
                isSystemRole: r.isSystemRole,
                isActive: r.isActive,
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
                requiredApprovalLevel: (p as any).requiredApprovalLevel ?? null,
                requiredApprovers: (p as any).requiredApprovers ?? 1,
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
            Effect.map((r: any) => ({
                success: true,
                data: {
                    id: r.id,
                    roleName: r.roleName,
                    roleCode: r.roleCode,
                    description: r.description ?? null,
                    permissions: ((r as any).rolePermissions || []).reduce((acc: Record<string, any[]>, rp: any) => {
                        const category = (rp.permission.category as 'CORE' | 'BANKING' | 'IFRS9' | 'REPORTING' | 'ADMIN') || 'CORE';
                        if (!acc[category]) acc[category] = [];
                        acc[category].push({
                            id: rp.permission.id,
                            code: rp.permission.code,
                            name: rp.permission.name,
                            displayName: rp.permission.name,
                            description: rp.permission.description || '',
                            resource: rp.permission.resource,
                            action: rp.permission.action,
                            module: rp.permission.module,
                            category: category,
                            riskLevel: 'LOW' as const, // Default value since not in DB
                            requiresApproval: false, // Default value since not in DB
                            bankingSpecific: rp.permission.module === 'banking',
                            syariahRequired: false, // Default value since not in DB
                        });
                        return acc;
                    }, {} as Record<string, any[]>),
                    bankingTypeSpecific: r.bankingTypeSpecific,
                    complianceLevel: r.complianceLevel,
                    hierarchyLevel: r.hierarchyLevel,
                    isSystemRole: r.isSystemRole,
                    isActive: r.isActive,
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
        const roleNameSource = body.roleName ?? body.name
        const normalizedRoleName = roleNameSource ? normalizeRoleName(roleNameSource) : undefined

        const effect = pipe(
            rbacService.updateRole(roleId, {
                roleName: normalizedRoleName,
                description: body.description,
                bankingTypeSpecific: body.bankingTypeSpecific ?? body.bankingAccess,
                hierarchyLevel: body.hierarchyLevel,
                isActive: body.isActive,
                // updatedBy: userId,
            }),
            Effect.map((r: any) => ({
                id: r.id,
                roleName: r.roleName,
                roleCode: r.roleCode,
                description: r.description ?? null,
                permissions: ((r as any).rolePermissions || []).reduce((acc: Record<string, any[]>, rp: any) => {
                    const category = (rp.permission.category as 'CORE' | 'BANKING' | 'IFRS9' | 'REPORTING' | 'ADMIN') || 'CORE';
                    if (!acc[category]) acc[category] = [];
                    acc[category].push({
                        id: rp.permission.id,
                        code: rp.permission.code,
                        name: rp.permission.name,
                        displayName: rp.permission.name,
                        description: rp.permission.description || '',
                        resource: rp.permission.resource,
                        action: rp.permission.action,
                        module: rp.permission.module,
                        category: category,
                        riskLevel: 'LOW' as const, // Default value since not in DB
                        requiresApproval: false, // Default value since not in DB
                        bankingSpecific: rp.permission.module === 'banking',
                        syariahRequired: false, // Default value since not in DB
                    });
                    return acc;
                }, {} as Record<string, any[]>),
                bankingTypeSpecific: r.bankingTypeSpecific,
                complianceLevel: r.complianceLevel,
                hierarchyLevel: r.hierarchyLevel,
                isSystemRole: r.isSystemRole,
                isActive: r.isActive,
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
            202: {
                content: {
                    'application/json': {
                        schema: z.object({
                            success: z.boolean(),
                            approvalRequired: z.boolean(),
                            requestId: z.string(),
                            message: z.string(),
                            diff: z.object({
                                added: z.array(z.string()),
                                removed: z.array(z.string()),
                            }),
                        }),
                    },
                },
                description: 'Permission update submitted for approval',
            },
        },
    }),
    async (c) => {
        const { roleId } = c.req.valid('param')
        const tenantId = c.get('tenantId')!
        const userId = c.get('userId') || 'system'
        const body = c.req.valid('json')
        const requestedPermissions = body.permissions
        const submitForApproval = Boolean(body.submitForApproval)
        const approvalReason = body.approvalReason

        const [availablePermissions, currentRole] = await Promise.all([
            Effect.runPromise(rbacService.getAvailablePermissions(tenantId)),
            Effect.runPromise(rbacService.getRoleById(roleId, tenantId)),
        ])

        const currentPermissionCodes = extractRolePermissionCodes(currentRole)

        const permissionLookup = new Map<string, string>()
        const permissionCodeById = new Map<string, string>()
        for (const permission of availablePermissions) {
            permissionLookup.set(permission.id, permission.id)
            permissionLookup.set(permission.code, permission.id)
            permissionCodeById.set(permission.id, permission.code)
        }

        const unknownPermissions = requestedPermissions.filter((permission) => !permissionLookup.has(permission))
        if (unknownPermissions.length > 0) {
            return c.json(
                {
                    success: false,
                    error: `Unknown permission(s): ${unknownPermissions.join(', ')}`,
                    code: 'INVALID_PERMISSION',
                },
                400
            )
        }

        const resolvedPermissionIds = requestedPermissions
            .map((permission) => permissionLookup.get(permission))
            .filter((permissionId): permissionId is string => typeof permissionId === 'string')

        const resolvedPermissionCodes = resolvedPermissionIds
            .map((id) => permissionCodeById.get(id))
            .filter((code): code is string => typeof code === 'string')

        const currentSet = new Set(currentPermissionCodes)
        const nextSet = new Set(resolvedPermissionCodes)
        const added = resolvedPermissionCodes.filter((code) => !currentSet.has(code))
        const removed = currentPermissionCodes.filter((code) => !nextSet.has(code))

        if (submitForApproval) {
            const request = await Effect.runPromise(
                createApprovalRequest({
                    tenantId,
                    entityType: 'role_permission',
                    entityId: roleId,
                    title: `Update role permissions: ${currentRole.roleName}`,
                    description:
                        approvalReason ||
                        `Role permission update requested for ${currentRole.roleName}. Added ${added.length}, removed ${removed.length}.`,
                    requestData: {
                        operation: 'update',
                        entityType: 'role_permission',
                        data: {
                            roleId,
                            roleName: currentRole.roleName,
                            permissions: requestedPermissions,
                            permissionIds: resolvedPermissionIds,
                            permissionCodes: resolvedPermissionCodes,
                            diff: { added, removed },
                        },
                    },
                    requestedBy: userId,
                    impactLevel: added.length + removed.length > 10 ? 'high' : 'medium',
                })
            )

            await auditService.logApproval.requested(
                request.id,
                request.title,
                userId,
                tenantId
            )

            return c.json(
                {
                    success: true,
                    approvalRequired: true,
                    requestId: request.id,
                    message: 'Role permission update submitted for approval.',
                    diff: { added, removed },
                },
                202
            )
        }

        const effect = pipe(
            rbacService.updateRolePermissions(roleId, resolvedPermissionIds, tenantId),
            Effect.tap((updatedRole: any) =>
                Effect.tryPromise({
                    try: () =>
                        auditService.logPermission.permissionsUpdated(
                            roleId,
                            currentRole.roleName,
                            {
                                codes: currentPermissionCodes,
                            },
                            {
                                codes: extractRolePermissionCodes(updatedRole),
                                added,
                                removed,
                            },
                            userId,
                            tenantId
                        ),
                    catch: () => null,
                })
                    .pipe(Effect.catchAll(() => Effect.succeed(null)))
            ),
            Effect.map((r: any) => ({
                ...roleToApiResponse(r),
                diff: {
                    added,
                    removed,
                },
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
        return runEffect(c, effect)
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
