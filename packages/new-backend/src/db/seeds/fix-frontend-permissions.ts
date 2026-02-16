
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
            { code: 'banking.dashboard.view', name: 'View Dashboard', description: 'Access to system dashboard', category: 'BANKING_DASHBOARD', resource: 'dashboard', action: 'view' },
            { code: 'banking.setup.application', name: 'System Setup Access', description: 'Access to system setup menu', category: 'BANKING_SETUP', resource: 'setup.application', action: 'access' },
            { code: 'banking.setup.application.manage', name: 'Manage Application Setup', description: 'Manage application configuration', category: 'BANKING_SETUP', resource: 'setup.application', action: 'manage' },
            { code: 'banking.setup.business.manage', name: 'Manage Business Setup', description: 'Manage business configuration', category: 'BANKING_SETUP', resource: 'setup.business', action: 'manage' },
            { code: 'banking.parameter', name: 'Parameter Access', description: 'Access to parameter management menu', category: 'BANKING_PARAMETER', resource: 'parameter', action: 'access' },
            { code: 'banking.parameter.product.manage', name: 'Manage Product Parameters', description: 'Manage product parameters', category: 'BANKING_PARAMETER', resource: 'parameter.product', action: 'manage' },
            { code: 'banking.parameter.journal.manage', name: 'Manage Journal Parameters', description: 'Manage journal/accounting parameters', category: 'BANKING_PARAMETER', resource: 'parameter.journal', action: 'manage' },
            { code: 'admin.maintenance.access', name: 'Admin Maintenance', description: 'Access to maintenance menu', category: 'ADMINISTRATION', resource: 'maintenance', action: 'access' },
            { code: 'admin.users.manage', name: 'Admin Users', description: 'Manage users', category: 'ADMINISTRATION', resource: 'users', action: 'manage' },
            { code: 'admin.roles.manage', name: 'Admin Roles', description: 'Manage roles', category: 'ADMINISTRATION', resource: 'roles', action: 'manage' },
            { code: 'approval.requests.approve', name: 'View Approvals', description: 'Access approval system in workflow', category: 'approval', resource: 'approvals', action: 'approve' },
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
