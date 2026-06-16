import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { Effect, pipe } from 'effect'
import type { AppContext } from '../app'
import { authMiddleware, tenantMiddleware } from '../middleware'
import { runEffect } from '../lib/effect'
import * as rbacService from '../services/rbac.service'
import * as auditService from '../services/audit.service'
import { createApprovalRequest } from '../services/approval.service'
import * as userService from '../services/users.service'
import { buildDefaultFourEyesRouting } from '../lib/approval-helpers'
import { openApiValidationHook } from '../lib/http/openapi-validation-hook'

export const rbacRoutes: any = new OpenAPIHono<AppContext>({ defaultHook: openApiValidationHook })

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
    description: z.string().min(30, 'Description must be at least 30 characters').openapi({ example: 'New role description that is very detailed' }),
    permissions: z.array(z.string()).default([]), // Array of permission codes
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
    description: z.string().min(30, 'Description must be at least 30 characters').optional(),
    permissions: z.array(z.string()).optional(), // Array of permission codes
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

const groupRolePermissionCodes = (role: any): Record<string, string[]> =>
    ((role as any)?.rolePermissions || []).reduce((acc: Record<string, string[]>, rp: any) => {
        const category = String(rp?.permission?.category || 'CORE')
        const code = rp?.permission?.code
        if (typeof code !== 'string' || code.length === 0) {
            return acc
        }
        if (!acc[category]) {
            acc[category] = []
        }
        if (!acc[category].includes(code)) {
            acc[category].push(code)
        }
        return acc
    }, {})

const isPendingApprovalRequest = (request: { status?: string } | null | undefined): boolean => {
    const normalizedStatus = String(request?.status || '').trim().toLowerCase()
    return normalizedStatus === '' || normalizedStatus === 'pending'
}

const buildApprovalAcceptedResponse = (
    request: { id: string; status?: string },
    message: string,
    extras?: Record<string, unknown>
) => {
    const isPending = isPendingApprovalRequest(request)
    const isApproved = String(request.status || '').trim().toLowerCase() === 'approved'

    return {
        success: true,
        approvalRequired: isPending,
        autoApproved: !isPending && isApproved,
        requestId: request.id,
        message: isPending
            ? message
            : 'Request auto-approved and executed successfully.',
        ...(extras || {}),
    }
}

const getApprovalResponseStatus = (request: { status?: string }, nonPendingStatus = 200): number =>
    isPendingApprovalRequest(request) ? 202 : nonPendingStatus

const resolveUserName = async (userId: string, tenantId: string): Promise<string> => {
    try {
        const user = await Effect.runPromise(userService.getUserById(userId, tenantId))
        return (user as any)?.fullName || (user as any)?.email || userId
    } catch {
        return userId
    }
}

const createStrictApprovalRequest = async (input: {
    tenantId: string
    userId: string
    entityType: string
    entityId?: string
    operation: 'create' | 'update' | 'delete'
    title: string
    description: string
    oldValues?: Record<string, unknown>
    payload: Record<string, unknown>
    impactLevel?: 'low' | 'medium' | 'high' | 'critical'
}) => {
    const request = await Effect.runPromise(
        createApprovalRequest({
            tenantId: input.tenantId,
            entityType: input.entityType,
            entityId: input.entityId,
            title: input.title,
            description: input.description,
            requestData: {
                operation: input.operation,
                entityType: input.entityType,
                oldValues: input.oldValues,
                data: input.payload,
                approvalRouting: { levels: buildDefaultFourEyesRouting(input.entityType) },
            },
            requestedBy: input.userId,
            impactLevel: input.impactLevel ?? 'high',
        })
    )

    auditService.runAuditSafely(
        auditService.logApproval.requested(
            request.id,
            request.title,
            input.userId,
            input.tenantId,
            {
                entityType: input.entityType,
                description: input.description,
                oldValues: input.oldValues,
                newValues: {
                    operation: input.operation,
                    entityType: input.entityType,
                    entityId: input.entityId,
                    payload: input.payload,
                },
            }
        ),
        `approval request logging for ${input.entityType} ${input.entityId ?? 'create'}`
    )

    return request
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
    async (c: any) => {
        const tenantId = c.get('tenantId')!
        const query = c.req.valid('query')

        const page = parseInt(query.page || '1')
        const limit = parseInt(query.limit || '100')
        const includeInactive = query.includeInactive === 'true'

        const effect = pipe(
            rbacService.getRoles(tenantId, {
                includeInactive,
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
    async (c: any) => {
        try {
            const tenantId = c.get('tenantId')!
            const userId = c.get('userId')
            const body = c.req.valid('json')
            const roleNameSource = body.roleName ?? body.name
            const normalizedRoleName = roleNameSource ? normalizeRoleName(roleNameSource) : ''
            const request = await createStrictApprovalRequest({
                tenantId,
                userId: userId || 'system',
                entityType: 'role',
                operation: 'create',
                title: `Create role: ${normalizedRoleName}`,
                description: `Role creation requested for ${normalizedRoleName}.`,
                payload: {
                    roleName: normalizedRoleName,
                    roleCode: normalizedRoleName,
                    description: body.description,
                    complianceLevel: body.complianceLevel,
                    hierarchyLevel: body.hierarchyLevel,
                    permissions: body.permissions,
                    tenantId,
                },
                impactLevel: 'high',
            })

            return c.json(
                buildApprovalAcceptedResponse(
                    request,
                    'Role creation submitted for approval.'
                ),
                getApprovalResponseStatus(request)
            )
        } catch (error) {
            return runEffect(c, Effect.fail(error as any))
        }
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
    async (c: any) => {
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
    async (c: any) => {
        const { roleId } = c.req.valid('param')
        const tenantId = c.get('tenantId')!
        const effect = pipe(
            rbacService.getRoleById(roleId, tenantId),
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
    async (c: any) => {
        try {
            const { roleId } = c.req.valid('param')
            const userId = c.get('userId')
            const tenantId = c.get('tenantId')!
            const body = c.req.valid('json')
            const roleNameSource = body.roleName ?? body.name
            const normalizedRoleName = roleNameSource ? normalizeRoleName(roleNameSource) : undefined
            const currentRole = await Effect.runPromise(rbacService.getRoleById(roleId, tenantId))

            const request = await createStrictApprovalRequest({
                tenantId,
                userId: userId || 'system',
                entityType: 'role',
                entityId: roleId,
                operation: 'update',
                title: `Update role: ${currentRole.roleName}`,
                description: `Role update requested for ${currentRole.roleName}.`,
                oldValues: {
                    id: currentRole.id,
                    roleName: currentRole.roleName,
                    description: currentRole.description,
                    hierarchyLevel: currentRole.hierarchyLevel,
                    isActive: currentRole.isActive,
                    permissionCodes: extractRolePermissionCodes(currentRole),
                },
                payload: {
                    id: roleId,
                    roleName: normalizedRoleName ?? currentRole.roleName,
                    description: body.description ?? currentRole.description,
                    hierarchyLevel: body.hierarchyLevel ?? currentRole.hierarchyLevel,
                    isActive: typeof body.isActive === 'boolean' ? body.isActive : currentRole.isActive,
                    permissions: body.permissions,
                    tenantId,
                },
                impactLevel: 'high',
            })

            return c.json(
                buildApprovalAcceptedResponse(
                    request,
                    'Role update submitted for approval.'
                ),
                getApprovalResponseStatus(request)
            )
        } catch (error) {
            return runEffect(c, Effect.fail(error as any))
        }
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
    async (c: any) => {
        try {
            const { roleId } = c.req.valid('param')
            const tenantId = c.get('tenantId')!
            const userId = c.get('userId') || 'system'
            const role = await Effect.runPromise(rbacService.getRoleById(roleId, tenantId))

            const request = await createStrictApprovalRequest({
                tenantId,
                userId,
                entityType: 'role',
                entityId: roleId,
                operation: 'delete',
                title: `Delete role: ${role.roleName}`,
                description: `Role deletion requested for ${role.roleName}.`,
                oldValues: {
                    id: role.id,
                    roleName: role.roleName,
                    description: role.description,
                    hierarchyLevel: role.hierarchyLevel,
                    isActive: role.isActive,
                    permissionCodes: extractRolePermissionCodes(role),
                },
                payload: {
                    id: roleId,
                    roleName: role.roleName,
                    tenantId,
                },
                impactLevel: 'high',
            })

            return c.json(
                buildApprovalAcceptedResponse(
                    request,
                    'Role deletion submitted for approval.'
                ),
                getApprovalResponseStatus(request)
            )
        } catch (error) {
            return runEffect(c, Effect.fail(error as any))
        }
    }
)

/**
 * POST /roles/:roleId/toggle - Toggle role active status (approval flow)
 */
rbacRoutes.openapi(
    createRoute({
        method: 'post',
        path: '/{roleId}/toggle',
        tags: ['RBAC'],
        summary: 'Toggle Role Active Status',
        security: [{ BearerAuth: [] }],
        request: {
            params: z.object({
                roleId: z.string().openapi({ param: { name: 'roleId', in: 'path' } }),
            }),
        },
        responses: {
            202: {
                content: {
                    'application/json': {
                        schema: z.object({
                            success: z.boolean(),
                            approvalRequired: z.boolean(),
                            requestId: z.string(),
                            message: z.string(),
                        }),
                    },
                },
                description: 'Role status toggle submitted for approval',
            },
        },
    }),
    async (c: any) => {
        try {
            const { roleId } = c.req.valid('param')
            const tenantId = c.get('tenantId')!
            const userId = c.get('userId') || 'system'
            const role = await Effect.runPromise(rbacService.getRoleById(roleId, tenantId))
            const nextIsActive = !Boolean(role.isActive)

            const request = await createStrictApprovalRequest({
                tenantId,
                userId,
                entityType: 'role',
                entityId: roleId,
                operation: 'update',
                title: `${nextIsActive ? 'Enable' : 'Disable'} role: ${role.roleName}`,
                description: `Role status update requested for ${role.roleName}.`,
                oldValues: {
                    id: role.id,
                    roleName: role.roleName,
                    isActive: role.isActive,
                },
                payload: {
                    id: roleId,
                    roleName: role.roleName,
                    isActive: nextIsActive,
                    tenantId,
                },
                impactLevel: 'high',
            })

            return c.json(
                buildApprovalAcceptedResponse(
                    request,
                    'Role status update submitted for approval.'
                ),
                getApprovalResponseStatus(request)
            )
        } catch (error) {
            return runEffect(c, Effect.fail(error as any))
        }
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
    async (c: any) => {
        const { roleId } = c.req.valid('param')
        const tenantId = c.get('tenantId')!

        const effect = pipe(
            rbacService.getRoleById(roleId, tenantId),
            Effect.map((role) => ({
                roleId: role.id,
                roleName: role.roleName,
                permissions: groupRolePermissionCodes(role),
            }))
        )

        return runEffect(c, effect)
    }
)

/**
 * GET /roles/:roleId/users - Get users assigned to role
 */
rbacRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/{roleId}/users',
        tags: ['RBAC'],
        summary: 'Get Users for Role',
        security: [{ BearerAuth: [] }],
        request: {
            params: z.object({
                roleId: z.string().openapi({ param: { name: 'roleId', in: 'path' } }),
            }),
        },
        responses: {
            200: {
                description: 'Users assigned to role',
                content: {
                    'application/json': {
                        schema: z.object({
                            success: z.boolean(),
                            data: z.object({
                                roleId: z.string(),
                                users: z.array(z.object({
                                    id: z.string(),
                                    userId: z.string(),
                                    fullName: z.string().nullable(),
                                    username: z.string().nullable(),
                                    email: z.string().nullable(),
                                    assignedAt: z.string().nullable(),
                                    validFrom: z.string().nullable(),
                                    validUntil: z.string().nullable(),
                                    isTemporary: z.boolean(),
                                    isActive: z.boolean(),
                                })),
                            }),
                        }),
                    },
                },
            },
        },
    }),
    async (c: any) => {
        const { roleId } = c.req.valid('param')
        const tenantId = c.get('tenantId')!

        const effect = pipe(
            rbacService.getRoleUsers(roleId, tenantId),
            Effect.map((rows: any[]) => ({
                success: true,
                data: {
                    roleId,
                    users: rows.map((row) => ({
                        id: row.userId,
                        userId: row.userId,
                        fullName: row.user?.fullName ?? null,
                        username: row.user?.username ?? null,
                        email: row.user?.email ?? null,
                        assignedAt: row.assignedAt ? row.assignedAt.toISOString() : null,
                        validFrom: row.validFrom ? row.validFrom.toISOString() : null,
                        validUntil: row.validUntil ? row.validUntil.toISOString() : null,
                        isTemporary: Boolean(row.isTemporary),
                        isActive: Boolean(row.isActive),
                    })),
                },
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
    async (c: any) => {
        try {
            const { roleId } = c.req.valid('param')
            const tenantId = c.get('tenantId')!
            const userId = c.get('userId') || 'system'
            const body = c.req.valid('json')
            const requestedPermissions: string[] = Array.isArray(body.permissions) ? body.permissions : []
            const approvalReason = body.approvalReason

            const [availablePermissions, currentRole] = await Promise.all([
                Effect.runPromise(rbacService.getAvailablePermissions(tenantId)),
                Effect.runPromise(rbacService.getRoleById(roleId, tenantId)),
            ])

            const currentPermissionCodes = extractRolePermissionCodes(currentRole)

            const permissionLookup = new Map<string, string>()
            const permissionCodeById = new Map<string, string>()
            for (const permission of (availablePermissions as any[])) {
                permissionLookup.set(permission.id, permission.id)
                permissionLookup.set(permission.code, permission.id)
                permissionCodeById.set(permission.id, permission.code)
            }

            const unknownPermissions = requestedPermissions.filter((permission: string) => !permissionLookup.has(permission))
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
                .map((permission: string) => permissionLookup.get(permission))
                .filter((permissionId: unknown): permissionId is string => typeof permissionId === 'string')

            const resolvedPermissionCodes = resolvedPermissionIds
                .map((id: string) => permissionCodeById.get(id))
                .filter((code: unknown): code is string => typeof code === 'string')

            const currentSet = new Set(currentPermissionCodes)
            const nextSet = new Set(resolvedPermissionCodes)
            const added = resolvedPermissionCodes.filter((code: string) => !currentSet.has(code))
            const removed = currentPermissionCodes.filter((code: string) => !nextSet.has(code))

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
                        approvalRouting: { levels: buildDefaultFourEyesRouting('role_permission') },
                    },
                    requestedBy: userId,
                    impactLevel: added.length + removed.length > 10 ? 'high' : 'medium',
                })
            )

            auditService.runAuditSafely(
                auditService.logApproval.requested(
                    request.id,
                    request.title,
                    userId,
                    tenantId,
                    {
                        entityType: 'role_permission',
                        oldValues: {
                            roleId,
                            roleName: currentRole.roleName,
                            permissionCodes: currentPermissionCodes,
                        },
                        newValues: {
                            roleId,
                            roleName: currentRole.roleName,
                            permissionIds: resolvedPermissionIds,
                            permissionCodes: resolvedPermissionCodes,
                            diff: { added, removed },
                        },
                    }
                ),
                `approval request logging for role permissions ${roleId}`
            )

            return c.json(
                buildApprovalAcceptedResponse(
                    request,
                    'Role permission update submitted for approval.',
                    { diff: { added, removed } }
                ),
                getApprovalResponseStatus(request)
            )
        } catch (error) {
            return runEffect(c, Effect.fail(error as any))
        }
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
    async (c: any) => {
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
                            permissions: groupRolePermissionCodes((ur as any).role),
                            tenantId: (ur as any).role.tenantId ?? null,
                        } : undefined,
                        assignedAt: ur.assignedAt?.toISOString() ?? null,
                        validFrom: ur.validFrom ? ur.validFrom.toISOString() : null,
                        validUntil: ur.validUntil ? ur.validUntil.toISOString() : null,
                        isTemporary: ur.isTemporary,
                        isActive: ur.isActive,
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
    async (c: any) => {
        try {
            const { userId, roleId } = c.req.valid('param')
            const tenantId = c.get('tenantId')!
            const assignedBy = c.get('userId')
            const body = c.req.valid('json')
            const [role, user] = await Promise.all([
                Effect.runPromise(rbacService.getRoleById(roleId, tenantId)),
                resolveUserName(userId, tenantId),
            ])

            const request = await createStrictApprovalRequest({
                tenantId,
                userId: assignedBy || 'system',
                entityType: 'role_assignment',
                entityId: `${userId}:${roleId}`,
                operation: 'create',
                title: `Assign role ${role.roleName} to user ${user}`,
                description: `Role assignment requested for ${role.roleName}.`,
                oldValues: {},
                payload: {
                    userId,
                    roleId,
                    roleName: role.roleName,
                    assignedBy: assignedBy || 'system',
                    validFrom: body.validFrom,
                    validUntil: body.validUntil,
                    isTemporary: body.isTemporary,
                    temporaryReason: body.temporaryReason,
                    tenantId,
                },
                impactLevel: 'high',
            })

            return c.json(
                buildApprovalAcceptedResponse(
                    request,
                    'Role assignment submitted for approval.'
                ),
                getApprovalResponseStatus(request)
            )
        } catch (error) {
            return runEffect(c, Effect.fail(error as any))
        }
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
    async (c: any) => {
        try {
            const { userId, roleId } = c.req.valid('param')
            const tenantId = c.get('tenantId')!
            const removedBy = c.get('userId') || 'system'
            const [role, user] = await Promise.all([
                Effect.runPromise(rbacService.getRoleById(roleId, tenantId)),
                resolveUserName(userId, tenantId),
            ])

            const request = await createStrictApprovalRequest({
                tenantId,
                userId: removedBy,
                entityType: 'role_assignment',
                entityId: `${userId}:${roleId}`,
                operation: 'delete',
                title: `Remove role ${role.roleName} from user ${user}`,
                description: `Role removal requested for ${role.roleName}.`,
                oldValues: {
                    userId,
                    roleId,
                    roleName: role.roleName,
                },
                payload: {
                    userId,
                    roleId,
                    roleName: role.roleName,
                    removedBy,
                    tenantId,
                },
                impactLevel: 'high',
            })

            return c.json(
                buildApprovalAcceptedResponse(
                    request,
                    'Role removal submitted for approval.'
                ),
                getApprovalResponseStatus(request)
            )
        } catch (error) {
            return runEffect(c, Effect.fail(error as any))
        }
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
    async (c: any) => {
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
    async (c: any) => {
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

/**
 * POST /matrix/import - Import User Role Matrix from Excel/CSV JSON data
 */
rbacRoutes.openapi(
    createRoute({
        method: 'post',
        path: '/matrix/import',
        tags: ['RBAC'],
        summary: 'Import Role Matrix',
        security: [{ BearerAuth: [] }],
        request: {
            body: {
                content: {
                    'application/json': {
                        schema: z.array(z.any()).openapi('MatrixImportData'),
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
                                permissionsAdded: z.number(),
                                rolesAdded: z.number(),
                                mappingsUpdated: z.number(),
                            }),
                            message: z.string(),
                        }),
                    },
                },
                description: 'Matrix imported successfully',
            },
        },
    }),
    async (c: any) => {
        const tenantId = c.get('tenantId')!
        const body = c.req.valid('json')

        const effect = pipe(
            rbacService.importRoleMatrix(tenantId, body),
            Effect.map((stats) => ({
                success: true,
                data: stats,
                message: 'Matrix imported successfully',
            }))
        )

        return runEffect(c, effect)
    }
)
