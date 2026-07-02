import { db } from '@/config'
import { permissions } from '@/db/schema/rbac.schema'
import { BANKING_PERMISSION_CATALOG } from './banking-permissions.catalog'

const ACTION_SORT_ORDER: Record<string, number> = {
    access: 0, view: 10, create: 20, insert: 25,
    update: 30, delete: 40, export: 50, upload: 60,
    approve: 70, manage: 80, run: 5, control: 15,
    approve_all: 75, super_admin: 85, self_approve_override: 76,
    approve_create: 71, approve_update: 72, approve_delete: 73,
}

export async function seedPermissions() {
    console.log('🌱 Seeding canonical banking permissions...')

    for (const permission of BANKING_PERMISSION_CATALOG) {
        await db
            .insert(permissions)
            .values({
                ...permission,
                isActive: true,
                sortOrder: ACTION_SORT_ORDER[permission.action] ?? 999,
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
                    sortOrder: ACTION_SORT_ORDER[permission.action] ?? 999,
                },
            })
    }

    console.log(`✅ Seeded ${BANKING_PERMISSION_CATALOG.length} banking permissions.`)
}
