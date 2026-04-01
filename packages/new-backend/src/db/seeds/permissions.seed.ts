import { db } from '@/config'
import { permissions } from '@/db/schema/rbac.schema'
import { BANKING_PERMISSION_CATALOG } from './banking-permissions.catalog'

export async function seedPermissions() {
    console.log('🌱 Seeding canonical banking permissions...')

    for (const permission of BANKING_PERMISSION_CATALOG) {
        await db
            .insert(permissions)
            .values({
                ...permission,
                isActive: true,
            })
            .onConflictDoUpdate({
                target: permissions.code,
                set: {
                    name: permission.name,
                    description: permission.description,
                    resource: permission.resource,
                    action: permission.action,
                    module: permission.module,
                    category: permission.category,
                    isActive: true,
                },
            })
    }

    console.log(`✅ Seeded ${BANKING_PERMISSION_CATALOG.length} banking permissions.`)
}
