
import { tenantDb as db } from '../../config'
import { roles, rolePermissions, permissions } from '../schema'
import { eq, inArray } from 'drizzle-orm'

const TENANT_ID = 'a24af6d2-3032-4d53-ae82-9cfa84f97a20'

async function fixPermissions() {
    console.log('🏗️  Fixing permissions for Frontend compatibility in TENANT database...')

    try {
        // 1. Define missing/correct permissions for Frontend
        // Based on BankingSidebarUtils.tsx and derivePermissionCodes
        const frontendPermissions = [
            { code: 'VIEW_DASHBOARD', name: 'View Dashboard', description: 'Access to system dashboard', category: 'Dashboard', resource: 'dashboard', action: 'view' },
            { code: 'MANAGE_SYSTEM_SETUP', name: 'Manage System Setup', description: 'Access to system setup menu', category: 'Configuration', resource: 'system_setup', action: 'manage' },
            { code: 'MANAGE_APP_CONFIG', name: 'Manage App Config', description: 'Access to application configuration', category: 'Configuration', resource: 'app_config', action: 'manage' },
            { code: 'MANAGE_BUSINESS_CONFIG', name: 'Manage Business Config', description: 'Access to business configuration', category: 'Configuration', resource: 'business_config', action: 'manage' },
            { code: 'MANAGE_PARAMETERS', name: 'Manage Parameters', description: 'Access to parameter management menu', category: 'Banking', resource: 'parameters', action: 'manage' },
            { code: 'MANAGE_PRODUCT_PARAMS', name: 'Manage Product Params', description: 'Access to product parameters', category: 'Banking', resource: 'product_parameters', action: 'manage' },
            { code: 'MANAGE_ACCOUNTING_PARAMS', name: 'Manage Accounting Params', description: 'Access to accounting parameters', category: 'Banking', resource: 'accounting_parameters', action: 'manage' },
            { code: 'ADMIN_MAINTENANCE', name: 'Admin Maintenance', description: 'Access to maintenance menu', category: 'Administration', resource: 'maintenance', action: 'admin' },
            { code: 'ADMIN_USERS', name: 'Admin Users', description: 'Manage users', category: 'Administration', resource: 'users', action: 'admin' },
            { code: 'ADMIN_ROLES', name: 'Admin Roles', description: 'Manage roles', category: 'Administration', resource: 'roles', action: 'admin' },
            { code: 'VIEW_APPROVAL', name: 'View Approval (Maintenance)', description: 'View approval menu in maintenance', category: 'Workflow', resource: 'approval', action: 'view' },
            { code: 'VIEW_APPROVALS', name: 'View Approvals (Workflow)', description: 'View approval system in workflow', category: 'Workflow', resource: 'approvals', action: 'view' },
        ]

        console.log('🔑 Syncing permissions to core.permissions...')
        for (const perm of frontendPermissions) {
            await db.insert(permissions)
                .values({
                    ...perm,
                    module: 'core',
                    isActive: true
                })
                .onConflictDoUpdate({
                    target: permissions.code,
                    set: {
                        name: perm.name,
                        description: perm.description,
                        category: perm.category,
                        resource: perm.resource,
                        action: perm.action,
                    }
                })
            console.log(`  ✓ Synced permission: ${perm.code}`)
        }

        // Get Role IDs
        const dbRoles = await db.select().from(roles).where(inArray(roles.roleCode, ['MAKER', 'CHECKER']))
        const makerRoleId = dbRoles.find(r => r.roleCode === 'MAKER')?.id
        const checkerRoleId = dbRoles.find(r => r.roleCode === 'CHECKER')?.id

        if (!makerRoleId || !checkerRoleId) {
            throw new Error('MAKER or CHECKER role not found. Run setup-maker-checker.ts first.')
        }

        // 2. Assign all these permissions to BOTH roles
        // They both need to be able to navigate and see data
        console.log('🔗 Assigning navigation permissions to MAKER and CHECKER...')
        const syncPerms = await db.select().from(permissions).where(inArray(permissions.code, frontendPermissions.map(p => p.code)))

        for (const roleId of [makerRoleId, checkerRoleId]) {
            for (const perm of syncPerms) {
                await db.insert(rolePermissions)
                    .values({
                        roleId: roleId,
                        permissionId: perm.id,
                        grantedAt: new Date(),
                    })
                    .onConflictDoNothing()
            }
            const roleCode = roleId === makerRoleId ? 'MAKER' : 'CHECKER'
            console.log(`  ✓ Assigned ${syncPerms.length} frontend permissions to ${roleCode}`)
        }

        console.log('\n🎉 Permissions fixed for frontend!')
        process.exit(0)
    } catch (error) {
        console.error('\n❌ Permission fix failed:', error)
        process.exit(1)
    }
}

fixPermissions()
