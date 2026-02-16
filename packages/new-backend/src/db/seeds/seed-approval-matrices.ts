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
        const { levels, ...matrixData } = matrix

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

            if (existingLevel) {
                await db
                    .update(approvalLevels)
                    .set({
                        name: level.name,
                        requiredRoles: level.requiredRoles as any,
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
                    requiredRoles: level.requiredRoles as any,
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
    const allApprovalPermissionIds = approvalPermissionRows.map((permission) => permission.id)

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

    const assignAllApprovalsByRoleCode = async (roleCode: string) => {
        const roleId = roleByCode.get(roleCode)
        if (!roleId) {
            console.log(`  ⚠ Role ${roleCode} not found, skipping`)
            return
        }

        if (allApprovalPermissionIds.length === 0) return

        await db
            .insert(rolePermissions)
            .values(allApprovalPermissionIds.map((permissionId) => ({ roleId, permissionId })))
            .onConflictDoNothing()

        console.log(`  ✓ Upserted ${allApprovalPermissionIds.length} approval permission(s) for ${roleCode}`)
    }

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
        'approval.parameter.create',
        'approval.parameter.update',
        'approval.parameter.delete',
        'approval.configuration.create',
        'approval.configuration.update',
        'approval.configuration.delete',
    ])
    await assignAllApprovalsByRoleCode('CHECKER')

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

const IAF_TENANT_ID = 'a24af6d2-3032-4d53-ae82-9cfa84f97a20'

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
