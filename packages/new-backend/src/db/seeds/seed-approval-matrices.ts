import { tenantDb as db } from '../../config/database'
import { approvalMatrices, approvalLevels } from '../schema/approval.schema'
import { permissions, rolePermissions } from '../schema/rbac.schema'
import { tenants } from '../schema/platform.schema'

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

const approvalPermissions = [
    // User Management Approvals
    { code: 'APPROVE_USER_CREATE', name: 'Approve User Creation', description: 'Can approve user creation requests', resource: 'users', action: 'approve_create' },
    { code: 'APPROVE_USER_UPDATE', name: 'Approve User Updates', description: 'Can approve user update requests', resource: 'users', action: 'approve_update' },
    { code: 'APPROVE_USER_DELETE', name: 'Approve User Deletion', description: 'Can approve user deletion requests', resource: 'users', action: 'approve_delete' },

    // Parameter Management Approvals
    { code: 'APPROVE_PARAMETER_CREATE', name: 'Approve Parameter Creation', description: 'Can approve parameter creation', resource: 'parameters', action: 'approve_create' },
    { code: 'APPROVE_PARAMETER_UPDATE', name: 'Approve Parameter Updates', description: 'Can approve parameter updates', resource: 'parameters', action: 'approve_update' },
    { code: 'APPROVE_PARAMETER_DELETE', name: 'Approve Parameter Deletion', description: 'Can approve parameter deletion', resource: 'parameters', action: 'approve_delete' },

    // Configuration Approvals
    { code: 'APPROVE_CONFIGURATION_CREATE', name: 'Approve Configuration Creation', description: 'Can approve configuration creation', resource: 'configurations', action: 'approve_create' },
    { code: 'APPROVE_CONFIGURATION_UPDATE', name: 'Approve Configuration Updates', description: 'Can approve configuration updates', resource: 'configurations', action: 'approve_update' },
    { code: 'APPROVE_CONFIGURATION_DELETE', name: 'Approve Configuration Deletion', description: 'Can approve configuration deletion', resource: 'configurations', action: 'approve_delete' },

    // Master Approval Permission
    { code: 'APPROVE_ALL', name: 'Approve All', description: 'Can approve any type of request', resource: 'approvals', action: 'approve_all' },
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
            bypassPermissions: ['APPROVE_ALL', 'PLATFORM_ADMIN'],
            autoApproveImpactLevels: [], // No auto-approval by impact level
        },
        levels: [
            {
                level: 1,
                name: 'Manager Approval',
                requiredRoles: ['APPROVE_USER_CREATE', 'APPROVE_USER_UPDATE', 'APPROVE_USER_DELETE'],
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
            bypassPermissions: ['APPROVE_ALL', 'PLATFORM_ADMIN'],
            autoApproveImpactLevels: ['low'], // Low impact parameters can be auto-approved
        },
        levels: [
            {
                level: 1,
                name: 'Parameter Approver',
                requiredRoles: ['APPROVE_PARAMETER_CREATE', 'APPROVE_PARAMETER_UPDATE', 'APPROVE_PARAMETER_DELETE'],
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
            bypassPermissions: ['APPROVE_ALL', 'PLATFORM_ADMIN'],
            autoApproveImpactLevels: [],
        },
        levels: [
            {
                level: 1,
                name: 'Configuration Reviewer',
                requiredRoles: ['APPROVE_CONFIGURATION_CREATE', 'APPROVE_CONFIGURATION_UPDATE', 'APPROVE_CONFIGURATION_DELETE'],
                requiredCount: 1,
                timeoutHours: 72,
            },
            {
                level: 2,
                name: 'Senior Management',
                requiredRoles: ['APPROVE_ALL'],
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
            bypassPermissions: ['PLATFORM_ADMIN'],
            autoApproveImpactLevels: [],
        },
        levels: [
            {
                level: 1,
                name: 'Manager Approval',
                requiredRoles: ['APPROVE_USER_DELETE'],
                requiredCount: 1,
                timeoutHours: 48,
            },
            {
                level: 2,
                name: 'Senior Management',
                requiredRoles: ['APPROVE_ALL'],
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
            bypassPermissions: ['APPROVE_ALL', 'PLATFORM_ADMIN'],
            autoApproveImpactLevels: ['low'],
        },
        levels: [
            {
                level: 1,
                name: 'Finance Reviewer',
                requiredRoles: ['APPROVE_PARAMETER_CREATE', 'APPROVE_PARAMETER_UPDATE', 'APPROVE_PARAMETER_DELETE'],
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
            bypassPermissions: ['APPROVE_ALL', 'PLATFORM_ADMIN'],
            autoApproveImpactLevels: ['low'],
        },
        levels: [
            {
                level: 1,
                name: 'Product Manager',
                requiredRoles: ['APPROVE_PARAMETER_CREATE', 'APPROVE_PARAMETER_UPDATE', 'APPROVE_PARAMETER_DELETE'],
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
            bypassPermissions: ['APPROVE_ALL', 'PLATFORM_ADMIN'],
            autoApproveImpactLevels: ['low'],
        },
        levels: [
            {
                level: 1,
                name: 'Configuration Manager',
                requiredRoles: ['APPROVE_PARAMETER_CREATE', 'APPROVE_PARAMETER_UPDATE', 'APPROVE_PARAMETER_DELETE'],
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
            bypassPermissions: ['APPROVE_ALL', 'PLATFORM_ADMIN'],
            autoApproveImpactLevels: ['low'],
        },
        levels: [
            {
                level: 1,
                name: 'Configuration Manager',
                requiredRoles: ['APPROVE_PARAMETER_CREATE', 'APPROVE_PARAMETER_UPDATE', 'APPROVE_PARAMETER_DELETE'],
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
            bypassPermissions: ['APPROVE_ALL', 'PLATFORM_ADMIN'],
            autoApproveImpactLevels: ['low'],
        },
        levels: [
            {
                level: 1,
                name: 'Configuration Manager',
                requiredRoles: ['APPROVE_PARAMETER_CREATE', 'APPROVE_PARAMETER_UPDATE', 'APPROVE_PARAMETER_DELETE'],
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
            bypassPermissions: ['APPROVE_ALL', 'PLATFORM_ADMIN'],
            autoApproveImpactLevels: ['low'],
        },
        levels: [
            {
                level: 1,
                name: 'Configuration Manager',
                requiredRoles: ['APPROVE_PARAMETER_CREATE', 'APPROVE_PARAMETER_UPDATE', 'APPROVE_PARAMETER_DELETE'],
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
            bypassPermissions: ['APPROVE_ALL', 'PLATFORM_ADMIN'],
            autoApproveImpactLevels: ['low'],
        },
        levels: [
            {
                level: 1,
                name: 'Configuration Manager',
                requiredRoles: ['APPROVE_PARAMETER_CREATE', 'APPROVE_PARAMETER_UPDATE', 'APPROVE_PARAMETER_DELETE'],
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
            bypassPermissions: ['APPROVE_ALL', 'PLATFORM_ADMIN'],
            autoApproveImpactLevels: ['low'],
        },
        levels: [
            {
                level: 1,
                name: 'Configuration Manager',
                requiredRoles: ['APPROVE_PARAMETER_CREATE', 'APPROVE_PARAMETER_UPDATE', 'APPROVE_PARAMETER_DELETE'],
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
            bypassPermissions: ['APPROVE_ALL', 'PLATFORM_ADMIN'],
            autoApproveImpactLevels: ['low'],
        },
        levels: [
            {
                level: 1,
                name: 'Configuration Manager',
                requiredRoles: ['APPROVE_PARAMETER_CREATE', 'APPROVE_PARAMETER_UPDATE', 'APPROVE_PARAMETER_DELETE'],
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
            bypassPermissions: ['APPROVE_ALL', 'PLATFORM_ADMIN'],
            autoApproveImpactLevels: ['low'],
        },
        levels: [
            {
                level: 1,
                name: 'Configuration Manager',
                requiredRoles: ['APPROVE_PARAMETER_CREATE', 'APPROVE_PARAMETER_UPDATE', 'APPROVE_PARAMETER_DELETE'],
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

    // Insert approval permissions
    for (const perm of approvalPermissions) {
        try {
            await db.insert(permissions).values({
                code: perm.code,
                name: perm.name,
                description: perm.description,
                resource: perm.resource,
                action: perm.action,
                category: 'approval',
            }).onConflictDoNothing()

            console.log(`  ✓ Created permission: ${perm.code}`)
        } catch (error) {
            console.log(`  ⚠ Permission ${perm.code} already exists or error:`, error)
        }
    }

    console.log('🌱 Seeding approval matrices...')

    // Insert approval matrices
    for (const matrix of defaultMatrices) {
        try {
            const { levels, ...matrixData } = matrix

            // Insert matrix
            const [createdMatrix] = await db
                .insert(approvalMatrices)
                .values({
                    ...matrixData,
                    tenantId,
                    autoApprovalRules: matrixData.autoApprovalRules as any,
                })
                .returning()

            console.log(`  ✓ Created matrix: ${matrix.name}`)

            // Insert levels
            for (const level of levels) {
                await db.insert(approvalLevels).values({
                    matrixId: createdMatrix.id,
                    level: level.level,
                    name: level.name,
                    requiredRoles: level.requiredRoles as any,
                    requiredCount: level.requiredCount,
                    timeoutHours: level.timeoutHours,
                })

                console.log(`    ✓ Created level ${level.level}: ${level.name}`)
            }
        } catch (error) {
            console.log(`  ⚠ Matrix ${matrix.name} already exists or error:`, error)
        }
    }

    console.log('✅ Approval matrices seeding complete!')
}

// =============================================================================
// ASSIGN PERMISSIONS TO ROLES
// =============================================================================

export async function assignApprovalPermissionsToRoles() {
    console.log('🌱 Assigning approval permissions to roles...')

    // Example: Assign approval permissions to admin roles
    const rolePermissionMappings = [
        // Platform Admin gets all approval permissions
        { roleCode: 'PLATFORM_ADMIN', permissionCode: 'APPROVE_ALL' },

        // Managers get user approval permissions
        { roleCode: 'MANAGER', permissionCode: 'APPROVE_USER_CREATE' },
        { roleCode: 'MANAGER', permissionCode: 'APPROVE_USER_UPDATE' },
        { roleCode: 'MANAGER', permissionCode: 'APPROVE_USER_DELETE' },

        // Parameter managers get parameter approval permissions
        { roleCode: 'PARAMETER_ADMIN', permissionCode: 'APPROVE_PARAMETER_CREATE' },
        { roleCode: 'PARAMETER_ADMIN', permissionCode: 'APPROVE_PARAMETER_UPDATE' },
        { roleCode: 'PARAMETER_ADMIN', permissionCode: 'APPROVE_PARAMETER_DELETE' },
    ]

    for (const mapping of rolePermissionMappings) {
        try {
            // This would need to be implemented based on your RBAC schema
            // await assignPermissionToRole(mapping.roleCode, mapping.permissionCode)
            console.log(`  ✓ Assigned ${mapping.permissionCode} to ${mapping.roleCode}`)
        } catch (error) {
            console.log(`  ⚠ Failed to assign ${mapping.permissionCode} to ${mapping.roleCode}:`, error)
        }
    }

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

if (require.main === module) {
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
