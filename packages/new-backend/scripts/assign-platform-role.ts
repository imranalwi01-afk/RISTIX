
import { db } from '../src/config/database'
import { users, roles, userRoles, tenants } from '../src/db/schema'
import { eq, and } from 'drizzle-orm'
import { v4 as uuidv4 } from 'uuid'

async function main() {
    console.log('🚀 Assigning PLATFORM_SUPER_ADMIN role...')

    // 1. Find System Tenant
    const systemTenant = await db.query.tenants.findFirst({
        where: eq(tenants.slug, 'system')
    })

    if (!systemTenant) {
        console.error('❌ System tenant not found!')
        process.exit(1)
    }

    // 2. Find Admin User
    const adminUser = await db.query.users.findFirst({
        where: and(
            eq(users.email, 'admin@iaf-system.local'),
            eq(users.tenantId, systemTenant.id)
        )
    })

    if (!adminUser) {
        console.error('❌ Admin user not found!')
        process.exit(1)
    }

    console.log(`✅ Found user: ${adminUser.email} (${adminUser.id})`)

    // 3. Find or Create Role
    let role = await db.query.roles.findFirst({
        where: and(
            eq(roles.roleName, 'PLATFORM_SUPER_ADMIN'),
            eq(roles.tenantId, systemTenant.id)
        )
    })

    if (!role) {
        console.log('⚠️ Role PLATFORM_SUPER_ADMIN not found, creating it...')
        const [newRole] = await db.insert(roles).values({
            id: uuidv4(),
            roleName: 'PLATFORM_SUPER_ADMIN',
            roleCode: 'PLATFORM_SUPER_ADMIN', // ✅ Added required field
            description: 'Super Administrator for Platform Management',
            tenantId: systemTenant.id,
            isSystemRole: true,
            permissions: [], // Full access implied or handled by isPlatformAdmin
            createdAt: new Date(),
            updatedAt: new Date()
        }).returning()
        role = newRole
    }

    console.log(`✅ Role ready: ${role.roleName} (${role.id})`)

    // 4. Assign Role to User
    const existingAssignment = await db.query.userRoles.findFirst({
        where: and(
            eq(userRoles.userId, adminUser.id),
            eq(userRoles.roleId, role.id)
        )
    })

    if (existingAssignment) {
        console.log('ℹ️ User already has this role.')
    } else {
        await db.insert(userRoles).values({
            id: uuidv4(),
            userId: adminUser.id,
            roleId: role.id,
            tenantId: systemTenant.id,
            assignedAt: new Date(),
            assignedBy: adminUser.id // ✅ Use valid UUID
        })
        console.log('✅ Role assigned successfully!')
    }

    process.exit(0)
}

main().catch(err => {
    console.error('❌ Script failed:', err)
    process.exit(1)
})
