import { db } from '@/config'
import { permissions } from '@/db/schema/rbac.schema'
import { sql } from 'drizzle-orm'

export const SIDEBAR_PERMISSIONS: ReadonlyArray<{ code: string; name: string; resource: string; action: string; description: string }> = [];

export async function seedPermissions() {
    console.log('🌱 Seeding Permissions...')

    // 1. Sidebar Permissions
    console.log('   ... Seeding Sidebar Permissions')
    let sidebarCount = 0
    for (const p of SIDEBAR_PERMISSIONS) {
        await db
            .insert(permissions)
            .values({
                code: p.code,
                name: p.name,
                resource: p.resource,
                action: p.action,
                description: p.description,
                module: 'banking',
                category: 'SIDEBAR',
                isActive: true,
            })
            .onConflictDoUpdate({
                target: permissions.code,
                set: {
                    name: p.name,
                    description: p.description,
                    resource: p.resource,
                    action: p.action,
                    module: 'banking',
                    category: 'SIDEBAR',
                },
            })
        sidebarCount++
    }

    // 2. Granular Permissions from Config
    console.log('   ... Seeding Granular Permissions')
    let granularCount = 0
    // Import here to avoid circular deps if any (though config shouldn't depend on db)
    const { PERMISSION_GROUPS } = await import('@/config/permissions')

    for (const [groupKey, group] of Object.entries(PERMISSION_GROUPS)) {
        for (const [permKey, permDef] of Object.entries(group.permissions)) {
            // Split permKey for resource/action
            // e.g. 'users.view' -> resource: 'users', action: 'view'
            const parts = permKey.split('.')
            const resource = parts[0] || groupKey
            const action = parts[1] || 'access'

            await db
                .insert(permissions)
                .values({
                    code: permKey,
                    name: permDef.label,
                    resource: resource,
                    action: action,
                    description: permDef.description,
                    module: 'banking',
                    category: group.label,
                    isActive: true,
                })
                .onConflictDoUpdate({
                    target: permissions.code,
                    set: {
                        name: permDef.label,
                        description: permDef.description,
                        resource: resource,
                        action: action,
                        module: 'banking',
                        category: group.label,
                        isActive: true,
                    },
                })
            granularCount++
        }
    }

    console.log(`✅ Seeded ${sidebarCount} sidebar permissions and ${granularCount} granular permissions.`)
}
