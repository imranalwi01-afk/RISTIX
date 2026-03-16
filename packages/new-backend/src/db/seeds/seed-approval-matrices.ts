import { tenantDb as db } from '../../config/database'
import { approvalMatrices, approvalLevels } from '../schema/approval.schema'
import { permissions, rolePermissions, roles } from '../schema/rbac.schema'
import { and, eq, inArray, like } from 'drizzle-orm'

/**
 * Seed Default Approval Matrices and Permissions
 * 
 * This script creates:
 * 1. Default approval permissions for common entity types
 * 2. Default approval matrices for user management, parameters, and configurations
 */

// =============================================================================
// APPROVAL PERMISSIONS
// =============================================================================

const approvalEntities = [
    'user',
    'user_status',
    'role',
    'role_permission',
    'role_assignment',
    'parameter',
    'configuration',
    'product_parameter',
    'journal_parameter',
    'segmentation',
    'rule_base_setting',
    'bucket_parameter',
    'pd_configuration',
    'lgd_configuration',
    'ead_configuration',
    'ecl_configuration',
    'fl_scalar',
] as const

const RESOURCE_BY_ENTITY: Record<string, string> = {
    user: 'users',
    user_status: 'users',
    role: 'roles',
    role_permission: 'roles',
    role_assignment: 'user_roles',
    parameter: 'parameters',
    configuration: 'configurations',
}

const humanizeEntity = (entity: string): string =>
    entity
        .split('_')
        .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
        .join(' ')

const approvalPermissions = [
    ...approvalEntities.flatMap((entity) => {
        const resource = RESOURCE_BY_ENTITY[entity] || entity
        const label = humanizeEntity(entity)
        return [
            {
                code: `approval.${entity}.create`,
                name: `Approve ${label} Creation`,
                description: `Can approve ${label.toLowerCase()} creation`,
                resource,
                action: 'approve_create',
            },
            {
                code: `approval.${entity}.update`,
                name: `Approve ${label} Updates`,
                description: `Can approve ${label.toLowerCase()} updates`,
                resource,
                action: 'approve_update',
            },
            {
                code: `approval.${entity}.delete`,
                name: `Approve ${label} Deletion`,
                description: `Can approve ${label.toLowerCase()} deletion`,
                resource,
                action: 'approve_delete',
            },
        ]
    }),
    // Master approval permission
    {
        code: 'approval.all',
        name: 'Approve All',
        description: 'Can approve any type of request',
        resource: 'approvals',
        action: 'approve_all',
    },
]

// =============================================================================
// APPROVAL MATRICES
// =============================================================================

const defaultMatrices = [
    {
        name: 'Role Management Approval',
        description: 'Approval workflow for role CRUD operations',
        entityType: 'role',
        operationType: 'create,update,delete',
        isActive: true,
        autoApprovalRules: {
            bypassPermissions: [],
            autoApproveImpactLevels: [],
        },
        levels: [
            {
                level: 1,
                name: 'Checker Review',
                requiredRoles: ['CHECKER'],
                requiredCount: 1,
                timeoutHours: 24,
            },
            {
                level: 2,
                name: 'Final Approval',
                requiredRoles: ['APPROVER'],
                requiredCount: 1,
                timeoutHours: 24,
            },
        ],
    },
    {
        name: 'Role Permission Approval',
        description: 'Approval workflow for role permission updates',
        entityType: 'role_permission',
        operationType: 'update',
        isActive: true,
        autoApprovalRules: {
            bypassPermissions: [],
            autoApproveImpactLevels: [],
        },
        levels: [
            {
                level: 1,
                name: 'Checker Review',
                requiredRoles: ['CHECKER'],
                requiredCount: 1,
                timeoutHours: 24,
            },
            {
                level: 2,
                name: 'Final Approval',
                requiredRoles: ['APPROVER'],
                requiredCount: 1,
                timeoutHours: 24,
            },
        ],
    },
    {
        name: 'Role Assignment Approval',
        description: 'Approval workflow for assigning/removing roles from users',
        entityType: 'role_assignment',
        operationType: 'create,delete',
        isActive: true,
        autoApprovalRules: {
            bypassPermissions: [],
            autoApproveImpactLevels: [],
        },
        levels: [
            {
                level: 1,
                name: 'Checker Review',
                requiredRoles: ['CHECKER'],
                requiredCount: 1,
                timeoutHours: 24,
            },
            {
                level: 2,
                name: 'Final Approval',
                requiredRoles: ['APPROVER'],
                requiredCount: 1,
                timeoutHours: 24,
            },
        ],
    },
    {
        name: 'User Status Approval',
        description: 'Approval workflow for enabling/disabling users',
        entityType: 'user_status',
        operationType: 'update',
        isActive: true,
        autoApprovalRules: {
            bypassPermissions: [],
            autoApproveImpactLevels: [],
        },
        levels: [
            {
                level: 1,
                name: 'Checker Review',
                requiredRoles: ['CHECKER'],
                requiredCount: 1,
                timeoutHours: 24,
            },
            {
                level: 2,
                name: 'Final Approval',
                requiredRoles: ['APPROVER'],
                requiredCount: 1,
                timeoutHours: 24,
            },
        ],
    },
    {
        name: 'User Management Approval',
        description: 'Approval workflow for user CRUD operations',
        entityType: 'user',
        operationType: 'create,update,delete',
        isActive: true,
        autoApprovalRules: {
            bypassPermissions: ['approval.all', 'admin.super_admin', 'SUPER_ADMIN', 'PLATFORM_ADMIN'],
            autoApproveImpactLevels: [], // No auto-approval by impact level
        },
        levels: [
            {
                level: 1,
                name: 'Manager Approval',
                requiredRoles: ['approval.user.create', 'approval.user.update', 'approval.user.delete'],
                requiredCount: 1,
                timeoutHours: 48,
            },
        ],
    },
    {
        name: 'Parameter Management Approval',
        description: 'Approval workflow for parameter changes',
        entityType: 'parameter',
        operationType: 'create,update,delete',
        isActive: true,
        autoApprovalRules: {
            bypassPermissions: ['approval.all', 'admin.super_admin', 'SUPER_ADMIN', 'PLATFORM_ADMIN'],
            autoApproveImpactLevels: ['low'], // Low impact parameters can be auto-approved
        },
        levels: [
            {
                level: 1,
                name: 'Parameter Approver',
                requiredRoles: ['approval.parameter.create', 'approval.parameter.update', 'approval.parameter.delete'],
                requiredCount: 1,
                timeoutHours: 24,
            },
        ],
    },
    {
        name: 'Configuration Management Approval',
        description: 'Approval workflow for system configuration changes',
        entityType: 'configuration',
        operationType: 'create,update,delete',
        isActive: true,
        autoApprovalRules: {
            bypassPermissions: ['approval.all', 'admin.super_admin', 'SUPER_ADMIN', 'PLATFORM_ADMIN'],
            autoApproveImpactLevels: [],
        },
        levels: [
            {
                level: 1,
                name: 'Configuration Reviewer',
                requiredRoles: ['approval.configuration.create', 'approval.configuration.update', 'approval.configuration.delete'],
                requiredCount: 1,
                timeoutHours: 72,
            },
            {
                level: 2,
                name: 'Senior Management',
                requiredRoles: ['approval.all'],
                requiredCount: 1,
                timeoutHours: 48,
            },
        ],
    },
    {
        name: 'High Impact User Changes',
        description: 'Multi-level approval for high-impact user changes',
        entityType: 'user',
        operationType: 'delete',
        isActive: true,
        autoApprovalRules: {
            bypassPermissions: ['admin.super_admin', 'SUPER_ADMIN', 'PLATFORM_ADMIN'],
            autoApproveImpactLevels: [],
        },
        levels: [
            {
                level: 1,
                name: 'Manager Approval',
                requiredRoles: ['approval.user.delete'],
                requiredCount: 1,
                timeoutHours: 48,
            },
            {
                level: 2,
                name: 'Senior Management',
                requiredRoles: ['approval.all'],
                requiredCount: 1,
                timeoutHours: 24,
            },
        ],
    },
    {
        name: 'Journal Parameter Approval',
        description: 'Approval workflow for journal parameter changes',
        entityType: 'journal_parameter',
        operationType: 'create,update,delete',
        isActive: true,
        autoApprovalRules: {
            bypassPermissions: ['approval.all', 'admin.super_admin', 'SUPER_ADMIN', 'PLATFORM_ADMIN'],
            autoApproveImpactLevels: ['low'],
        },
        levels: [
            {
                level: 1,
                name: 'Finance Reviewer',
                requiredRoles: ['approval.parameter.create', 'approval.parameter.update', 'approval.parameter.delete'],
                requiredCount: 1,
                timeoutHours: 24,
            },
        ],
    },
    {
        name: 'Product Parameter Approval',
        description: 'Approval workflow for product parameter changes',
        entityType: 'product_parameter',
        operationType: 'create,update,delete',
        isActive: true,
        autoApprovalRules: {
            bypassPermissions: ['approval.all', 'admin.super_admin', 'SUPER_ADMIN', 'PLATFORM_ADMIN'],
            autoApproveImpactLevels: ['low'],
        },
        levels: [
            {
                level: 1,
                name: 'Product Manager',
                requiredRoles: ['approval.parameter.create', 'approval.parameter.update', 'approval.parameter.delete'],
                requiredCount: 1,
                timeoutHours: 24,
            },
        ],
    },
    {
        name: 'Segmentation Configuration Approval',
        description: 'Approval workflow for segmentation changes',
        entityType: 'segmentation',
        operationType: 'create,update,delete',
        isActive: true,
        autoApprovalRules: {
            bypassPermissions: ['approval.all', 'admin.super_admin', 'SUPER_ADMIN', 'PLATFORM_ADMIN'],
            autoApproveImpactLevels: ['low'],
        },
        levels: [
            {
                level: 1,
                name: 'Configuration Manager',
                requiredRoles: ['approval.parameter.create', 'approval.parameter.update', 'approval.parameter.delete'],
                requiredCount: 1,
                timeoutHours: 24,
            },
        ],
    },
    {
        name: 'Rule Base Setting Approval',
        description: 'Approval workflow for rule base setting changes',
        entityType: 'rule_base_setting',
        operationType: 'create,update,delete',
        isActive: true,
        autoApprovalRules: {
            bypassPermissions: ['approval.all', 'admin.super_admin', 'SUPER_ADMIN', 'PLATFORM_ADMIN'],
            autoApproveImpactLevels: ['low'],
        },
        levels: [
            {
                level: 1,
                name: 'Configuration Manager',
                requiredRoles: ['approval.parameter.create', 'approval.parameter.update', 'approval.parameter.delete'],
                requiredCount: 1,
                timeoutHours: 24,
            },
        ],
    },
    {
        name: 'Bucket Parameter Approval',
        description: 'Approval workflow for bucket parameter changes',
        entityType: 'bucket_parameter',
        operationType: 'create,update,delete',
        isActive: true,
        autoApprovalRules: {
            bypassPermissions: ['approval.all', 'admin.super_admin', 'SUPER_ADMIN', 'PLATFORM_ADMIN'],
            autoApproveImpactLevels: ['low'],
        },
        levels: [
            {
                level: 1,
                name: 'Configuration Manager',
                requiredRoles: ['approval.parameter.create', 'approval.parameter.update', 'approval.parameter.delete'],
                requiredCount: 1,
                timeoutHours: 24,
            },
        ],
    },
    {
        name: 'PD Setup Management Approval',
        description: 'Approval workflow for PD setup changes',
        entityType: 'pd_configuration',
        operationType: 'create,update,delete',
        isActive: true,
        autoApprovalRules: {
            bypassPermissions: ['approval.all', 'admin.super_admin', 'SUPER_ADMIN', 'PLATFORM_ADMIN'],
            autoApproveImpactLevels: ['low'],
        },
        levels: [
            {
                level: 1,
                name: 'Configuration Manager',
                requiredRoles: ['approval.parameter.create', 'approval.parameter.update', 'approval.parameter.delete'],
                requiredCount: 1,
                timeoutHours: 24,
            },
        ],
    },
    {
        name: 'FL Scalar Approval',
        description: 'Approval workflow for FL Scalar changes',
        entityType: 'fl_scalar',
        operationType: 'create,update,delete',
        isActive: true,
        autoApprovalRules: {
            bypassPermissions: ['approval.all', 'admin.super_admin', 'SUPER_ADMIN', 'PLATFORM_ADMIN'],
            autoApproveImpactLevels: ['low'],
        },
        levels: [
            {
                level: 1,
                name: 'Configuration Manager',
                requiredRoles: ['approval.parameter.create', 'approval.parameter.update', 'approval.parameter.delete'],
                requiredCount: 1,
                timeoutHours: 24,
            },
        ],
    },
    {
        name: 'LGD Setup Management Approval',
        description: 'Approval workflow for LGD setup changes',
        entityType: 'lgd_configuration',
        operationType: 'create,update,delete',
        isActive: true,
        autoApprovalRules: {
            bypassPermissions: ['approval.all', 'admin.super_admin', 'SUPER_ADMIN', 'PLATFORM_ADMIN'],
            autoApproveImpactLevels: ['low'],
        },
        levels: [
            {
                level: 1,
                name: 'Configuration Manager',
                requiredRoles: ['approval.parameter.create', 'approval.parameter.update', 'approval.parameter.delete'],
                requiredCount: 1,
                timeoutHours: 24,
            },
        ],
    },
    {
        name: 'EAD Setup Management Approval',
        description: 'Approval workflow for EAD setup changes',
        entityType: 'ead_configuration',
        operationType: 'create,update,delete',
        isActive: true,
        autoApprovalRules: {
            bypassPermissions: ['approval.all', 'admin.super_admin', 'SUPER_ADMIN', 'PLATFORM_ADMIN'],
            autoApproveImpactLevels: ['low'],
        },
        levels: [
            {
                level: 1,
                name: 'Configuration Manager',
                requiredRoles: ['approval.parameter.create', 'approval.parameter.update', 'approval.parameter.delete'],
                requiredCount: 1,
                timeoutHours: 24,
            },
        ],
    },
    {
        name: 'ECL Configuration Approval',
        description: 'Approval workflow for ECL configuration changes',
        entityType: 'ecl_configuration',
        operationType: 'create,update,delete',
        isActive: true,
        autoApprovalRules: {
            bypassPermissions: ['approval.all', 'admin.super_admin', 'SUPER_ADMIN', 'PLATFORM_ADMIN'],
            autoApproveImpactLevels: ['low'],
        },
        levels: [
            {
                level: 1,
                name: 'Configuration Manager',
                requiredRoles: ['approval.parameter.create', 'approval.parameter.update', 'approval.parameter.delete'],
                requiredCount: 1,
                timeoutHours: 24,
            },
        ],
    },
]

const ADMIN_APPROVAL_ENTITIES = new Set([
    'user',
    'user_status',
    'role',
    'role_permission',
    'role_assignment',
])

const ADMIN_APPROVAL_PERMISSION_CODES = [
    'approval.requests.approve',
    'approval.user.create',
    'approval.user.update',
    'approval.user.delete',
    'approval.user_status.create',
    'approval.user_status.update',
    'approval.user_status.delete',
    'approval.role.create',
    'approval.role.update',
    'approval.role.delete',
    'approval.role_permission.create',
    'approval.role_permission.update',
    'approval.role_permission.delete',
    'approval.role_assignment.create',
    'approval.role_assignment.update',
    'approval.role_assignment.delete',
]

const BUSINESS_APPROVAL_PERMISSION_CODES = [
    'approval.requests.approve',
    'approval.parameter.create',
    'approval.parameter.update',
    'approval.parameter.delete',
    'approval.configuration.create',
    'approval.configuration.update',
    'approval.configuration.delete',
    'approval.product_parameter.create',
    'approval.product_parameter.update',
    'approval.product_parameter.delete',
    'approval.journal_parameter.create',
    'approval.journal_parameter.update',
    'approval.journal_parameter.delete',
    'approval.segmentation.create',
    'approval.segmentation.update',
    'approval.segmentation.delete',
    'approval.rule_base_setting.create',
    'approval.rule_base_setting.update',
    'approval.rule_base_setting.delete',
    'approval.bucket_parameter.create',
    'approval.bucket_parameter.update',
    'approval.bucket_parameter.delete',
    'approval.pd_configuration.create',
    'approval.pd_configuration.update',
    'approval.pd_configuration.delete',
    'approval.lgd_configuration.create',
    'approval.lgd_configuration.update',
    'approval.lgd_configuration.delete',
    'approval.ead_configuration.create',
    'approval.ead_configuration.update',
    'approval.ead_configuration.delete',
    'approval.ecl_configuration.create',
    'approval.ecl_configuration.update',
    'approval.ecl_configuration.delete',
    'approval.fl_scalar.create',
    'approval.fl_scalar.update',
    'approval.fl_scalar.delete',
]

const BUSINESS_CHECKER_ROLES = ['CHECKER', 'IAF_IFRS_MANAGER']
const BUSINESS_APPROVER_ROLES = ['APPROVER', 'IAF_BANK_CRO']
const ADMIN_CHECKER_ROLES = ['IAF_TENANT_ADMIN']
const ADMIN_APPROVER_ROLES = ['IAF_TENANT_SUPERADMIN']

const getStrictFourEyesRoleSet = (entityType?: string | null) =>
    ADMIN_APPROVAL_ENTITIES.has(String(entityType || '').toLowerCase())
        ? {
              checkerRoles: ADMIN_CHECKER_ROLES,
              approverRoles: ADMIN_APPROVER_ROLES,
          }
        : {
              checkerRoles: BUSINESS_CHECKER_ROLES,
              approverRoles: BUSINESS_APPROVER_ROLES,
          }

const toStrictFourEyesLevels = (
    entityType: string,
    levels: Array<{
    level: number
    name: string
    requiredRoles: string[]
    requiredCount: number
    timeoutHours?: number
}>): Array<{
    level: number
    name: string
    requiredRoles: string[]
    requiredCount: number
    timeoutHours?: number
}> => {
    const checkerLevel = levels.find((level) => level.level === 1)
    const approverLevel = levels.find((level) => level.level === 2)
    const roleSet = getStrictFourEyesRoleSet(entityType)

    return [
        {
            level: 1,
            name: checkerLevel?.name || 'Checker Review',
            requiredRoles: roleSet.checkerRoles,
            requiredCount: Math.max(1, checkerLevel?.requiredCount || 1),
            timeoutHours: checkerLevel?.timeoutHours || 24,
        },
        {
            level: 2,
            name: approverLevel?.name || 'Final Approval',
            requiredRoles: roleSet.approverRoles,
            requiredCount: Math.max(1, approverLevel?.requiredCount || 1),
            timeoutHours: approverLevel?.timeoutHours || 24,
        },
    ]
}

const splitLevelRequirements = (requiredRoles: string[]) => {
    const roleCodes = requiredRoles.filter((entry) => !entry.includes('.'))
    const permissionCodes = requiredRoles.filter((entry) => entry.includes('.'))
    return {
        requiredRoleCodes: roleCodes,
        requiredPermissionCodes: permissionCodes.length > 0 ? permissionCodes : ['approval.requests.approve'],
    }
}

// =============================================================================
// SEED FUNCTION
// =============================================================================

export async function seedApprovalMatrices(tenantId: string) {
    console.log('🌱 Seeding approval permissions...')
    console.log('   📊 Database: Using TENANT database (ifrspro_tenant_iaf)\n')

    // Upsert approval permissions
    for (const perm of approvalPermissions) {
        await db
            .insert(permissions)
            .values({
                code: perm.code,
                name: perm.name,
                description: perm.description,
                resource: perm.resource,
                action: perm.action,
                module: 'core',
                category: 'approval',
                isActive: true,
            })
            .onConflictDoUpdate({
                target: permissions.code,
                set: {
                    name: perm.name,
                    description: perm.description,
                    resource: perm.resource,
                    action: perm.action,
                    module: 'core',
                    category: 'approval',
                    isActive: true,
                },
            })

        console.log(`  ✓ Upserted permission: ${perm.code}`)
    }

    console.log('🌱 Seeding approval matrices...')

    // Upsert approval matrices + levels
    for (const matrix of defaultMatrices) {
        const { levels: originalLevels, ...matrixData } = matrix
        const levels = toStrictFourEyesLevels(matrixData.entityType, originalLevels)

        const existingMatrix = await db.query.approvalMatrices.findFirst({
            where: and(
                eq(approvalMatrices.tenantId, tenantId),
                eq(approvalMatrices.name, matrixData.name)
            ),
        })

        const matrixId = existingMatrix
            ? (
                await db
                    .update(approvalMatrices)
                    .set({
                        description: matrixData.description,
                        entityType: matrixData.entityType,
                        operationType: matrixData.operationType,
                        isActive: matrixData.isActive,
                        autoApprovalRules: matrixData.autoApprovalRules as any,
                        updatedAt: new Date(),
                    })
                    .where(eq(approvalMatrices.id, existingMatrix.id))
                    .returning({ id: approvalMatrices.id })
            )[0].id
            : (
                await db
                    .insert(approvalMatrices)
                    .values({
                        ...matrixData,
                        tenantId,
                        autoApprovalRules: matrixData.autoApprovalRules as any,
                    })
                    .returning({ id: approvalMatrices.id })
            )[0].id

        console.log(`  ✓ Upserted matrix: ${matrix.name}`)

        const existingLevels = await db.query.approvalLevels.findMany({
            where: eq(approvalLevels.matrixId, matrixId),
        })

        for (const level of levels) {
            const existingLevel = existingLevels.find((current) => current.level === level.level)
            const requirements = splitLevelRequirements(level.requiredRoles)

            if (existingLevel) {
                await db
                    .update(approvalLevels)
                    .set({
                        name: level.name,
                        requiredRoleCodes: requirements.requiredRoleCodes as any,
                        requiredPermissionCodes: requirements.requiredPermissionCodes as any,
                        roleMatchMode: 'ANY',
                        permissionMatchMode: 'ANY',
                        requiredCount: level.requiredCount,
                        timeoutHours: level.timeoutHours,
                    })
                    .where(eq(approvalLevels.id, existingLevel.id))
                console.log(`    ✓ Updated level ${level.level}: ${level.name}`)
            } else {
                await db.insert(approvalLevels).values({
                    matrixId,
                    level: level.level,
                    name: level.name,
                    requiredRoleCodes: requirements.requiredRoleCodes as any,
                    requiredPermissionCodes: requirements.requiredPermissionCodes as any,
                    roleMatchMode: 'ANY',
                    permissionMatchMode: 'ANY',
                    requiredCount: level.requiredCount,
                    timeoutHours: level.timeoutHours,
                })
                console.log(`    ✓ Created level ${level.level}: ${level.name}`)
            }
        }

        const staleLevelIds = existingLevels
            .filter((existingLevel) => !levels.some((newLevel) => newLevel.level === existingLevel.level))
            .map((staleLevel) => staleLevel.id)

        if (staleLevelIds.length > 0) {
            await db.delete(approvalLevels).where(inArray(approvalLevels.id, staleLevelIds))
            console.log(`    ✓ Removed ${staleLevelIds.length} stale level(s)`)
        }
    }

    console.log('✅ Approval matrices seeding complete!')
}

// =============================================================================
// ASSIGN PERMISSIONS TO ROLES
// =============================================================================

export async function assignApprovalPermissionsToRoles() {
    console.log('🌱 Assigning approval permissions to roles...')

    const [roleRows, approvalPermissionRows] = await Promise.all([
        db.select({ id: roles.id, roleCode: roles.roleCode }).from(roles),
        db
            .select({ id: permissions.id, code: permissions.code })
            .from(permissions)
            .where(like(permissions.code, 'approval.%')),
    ])

    const roleByCode = new Map(roleRows.map((role) => [role.roleCode, role.id]))
    const permissionByCode = new Map(approvalPermissionRows.map((permission) => [permission.code, permission.id]))
    const assignByRoleCode = async (roleCode: string, permissionCodes: string[]) => {
        const roleId = roleByCode.get(roleCode)
        if (!roleId) {
            console.log(`  ⚠ Role ${roleCode} not found, skipping`)
            return
        }

        const permissionIds = permissionCodes
            .map((permissionCode) => permissionByCode.get(permissionCode))
            .filter((permissionId): permissionId is string => Boolean(permissionId))

        if (permissionIds.length === 0) return

        await db
            .insert(rolePermissions)
            .values(permissionIds.map((permissionId) => ({ roleId, permissionId })))
            .onConflictDoNothing()

        console.log(`  ✓ Upserted ${permissionIds.length} approval permission(s) for ${roleCode}`)
    }

    const businessApprovalCodes = BUSINESS_APPROVAL_PERMISSION_CODES
    const adminApprovalCodes = ADMIN_APPROVAL_PERMISSION_CODES

    // Existing generic role codes
    await assignByRoleCode('PLATFORM_ADMIN', ['approval.all'])
    await assignByRoleCode('MANAGER', [
        'approval.user.create',
        'approval.user.update',
        'approval.user.delete',
        'approval.parameter.create',
        'approval.parameter.update',
        'approval.parameter.delete',
        'approval.configuration.create',
        'approval.configuration.update',
        'approval.configuration.delete',
    ])
    await assignByRoleCode('PARAMETER_ADMIN', [
        'approval.parameter.create',
        'approval.parameter.update',
        'approval.parameter.delete',
    ])

    // IAF role codes
    await assignByRoleCode('IAF_TENANT_SUPERADMIN', ['approval.all'])
    await assignByRoleCode('IAF_TENANT_ADMIN', [
        ...adminApprovalCodes,
        'approval.parameter.create',
        'approval.parameter.update',
        'approval.parameter.delete',
        'approval.configuration.create',
        'approval.configuration.update',
        'approval.configuration.delete',
    ])
    await assignByRoleCode('IAF_IFRS_MANAGER', businessApprovalCodes)
    await assignByRoleCode('IAF_BANK_CRO', businessApprovalCodes)
    await assignByRoleCode('CHECKER', businessApprovalCodes)
    await assignByRoleCode('APPROVER', businessApprovalCodes)

    console.log('✅ Permission assignment complete!')
}

// =============================================================================
// MAIN EXECUTION
// =============================================================================

/**
 * Usage:
 * 
 * ```typescript
 * import { seedApprovalMatrices, assignApprovalPermissionsToRoles } from './seeds/seed-approval-matrices'
 * 
 * // In your seed script or migration
 * await seedApprovalMatrices('default-tenant-id')
 * await assignApprovalPermissionsToRoles()
 * ```
 */

const IAF_TENANT_ID = 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be'

if (import.meta.main) {
    console.log(`Using IAF tenant ID: ${IAF_TENANT_ID}\n`)
    seedApprovalMatrices(IAF_TENANT_ID)
        .then(() => assignApprovalPermissionsToRoles())
        .then(() => {
            console.log('✅ All seeding complete!')
            process.exit(0)
        })
        .catch((error) => {
            console.error('❌ Seeding failed:', error)
            process.exit(1)
        })
}
