
import { tenantDb as db } from '../../config'
import { roles, rolePermissions, permissions } from '../schema'
import { eq, inArray } from 'drizzle-orm'
import {
    BANKING_PERMISSION_CATALOG,
    MAKER_CHECKER_FRONTEND_PERMISSION_CODES,
} from './banking-permissions.catalog'

const TENANT_ID = 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be'

async function fixPermissions() {
    console.log('🏗️  Fixing permissions for Frontend compatibility in TENANT database...')

    try {
        const frontendPermissions = BANKING_PERMISSION_CATALOG.filter((permission) =>
            MAKER_CHECKER_FRONTEND_PERMISSION_CODES.includes(permission.code)
        )

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
