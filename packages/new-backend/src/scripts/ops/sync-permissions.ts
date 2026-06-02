import { db, getDatabase } from '../../config/database'
import { permissions, roles, rolePermissions } from '../../db/schema/rbac.schema'
import { BANKING_PERMISSION_CATALOG } from '../../db/seeds/banking-permissions.catalog'
import { eq, inArray, sql } from 'drizzle-orm'
import { Effect, pipe } from 'effect'
import { randomUUID } from 'node:crypto'

export async function run(args: string[] = []) {
    const roleCode = args[0] || 'IAF_TENANT_SUPERADMIN'
    const tenantId = args[1] || 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be'
    console.log('Syncing permissions for role:', roleCode)

    const targetDb = getDatabase(tenantId)
    if (!targetDb) {
        console.error('Failed to resolve tenant database')
        process.exit(1)
    }

    // Get all catalog definitions
    const catalogPerms = BANKING_PERMISSION_CATALOG
    console.log(`Catalog has ${catalogPerms.length} permissions`)

    // Get existing codes in DB
    const existingRows = await targetDb
        .select({ code: permissions.code })
        .from(permissions)
    const existingCodes = new Set(existingRows.map(r => r.code))
    console.log(`DB has ${existingCodes.size} permissions`)

    // Create missing permissions
    const toCreate = catalogPerms.filter(p => !existingCodes.has(p.code))
    if (toCreate.length > 0) {
        console.log(`Creating ${toCreate.length} missing permissions...`)
        await targetDb.insert(permissions).values(
            toCreate.map(p => ({
                ...p,
                id: randomUUID(),
                isActive: true,
            }))
        ).onConflictDoNothing({ target: permissions.code })
        console.log('Created')
    } else {
        console.log('No missing permissions to create')
    }

    // Find the role
    const [role] = await targetDb
        .select({ id: roles.id })
        .from(roles)
        .where(eq(roles.roleCode, roleCode))
        .limit(1)

    if (!role) {
        console.error(`Role '${roleCode}' not found`)
        process.exit(1)
    }
    console.log(`Assigning all permissions to role '${roleCode}' (${role.id})...`)

    // Get all permission IDs
    const allPerms = await targetDb
        .select({ id: permissions.id })
        .from(permissions)

    const assigned = await targetDb
        .select({ id: rolePermissions.permissionId })
        .from(rolePermissions)
        .where(eq(rolePermissions.roleId, role.id))
    const assignedSet = new Set(assigned.map(r => r.id))

    const toAssign = allPerms.filter(p => !assignedSet.has(p.id))
    if (toAssign.length > 0) {
        console.log(`Assigning ${toAssign.length} new permissions...`)
        await targetDb.insert(rolePermissions).values(
            toAssign.map(p => ({
                roleId: role.id,
                permissionId: p.id,
            }))
        ).onConflictDoNothing()
        console.log('Assigned')
    } else {
        console.log('All permissions already assigned')
    }

    const total = await targetDb
        .select({ count: sql<number>`count(*)` })
        .from(rolePermissions)
        .where(eq(rolePermissions.roleId, role.id))
    console.log(`Total permissions on role: ${total[0].count}`)
    console.log('Done!')
}
