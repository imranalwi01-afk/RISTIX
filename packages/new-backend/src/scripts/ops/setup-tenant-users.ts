// @ts-nocheck
import { db, getDatabase } from '../../config/database'
import { users, tenants } from '../../db/schema'
import { roles, userRoles, rolePermissions, permissions } from '../../db/schema/rbac.schema'
import { BANKING_PERMISSION_CATALOG } from '../../db/seeds/banking-permissions.catalog'
import { eq, and, inArray } from 'drizzle-orm'
import { randomUUID } from 'node:crypto'

// =============================================================================
// SETUP TENANT USERS — Creates roles + users for any tenant
// =============================================================================
//
// Usage:
//   ./ops setup-tenant-users <tenantCode> [password]
//
// Example:
//   ./ops setup-tenant-users RISTIX MySecurePass123
//
// Creates:
//   - Roles: SUPERADMIN, MAKER, CHECKER, APPROVER (if missing)
//   - Users: superadmin@<domain>, maker@<domain>, checker@<domain>
//   - Assigns all permissions to SUPERADMIN role
//   - Assigns approval permissions to CHECKER and APPROVER
//   - Assigns each user to their respective role
//
// Idempotent — safe to run multiple times.
// =============================================================================

const DEFAULT_PASSWORD = 'ChangeMe123!'

const ROLES_TO_CREATE = [
    {
        roleCode: 'SUPERADMIN',
        roleName: 'Super Administrator',
        description: 'Full access to all features',
        hierarchyLevel: 1,
    },
    {
        roleCode: 'ACCOUNTING_MAKER',
        roleName: 'Maker',
        description: 'Can initiate changes but requires approval',
        hierarchyLevel: 10,
    },
    {
        roleCode: 'USERCHECKER',
        roleName: 'Checker',
        description: 'Can review and verify maker changes',
        hierarchyLevel: 50,
    },
    {
        roleCode: 'ACCOUNTING_APPROVER',
        roleName: 'Approver',
        description: 'Can perform final approval after checker stage',
        hierarchyLevel: 70,
    },
]

interface UserSpec {
    roleCode: string
    emailPrefix: string
    username: string
    fullName: string
}

const USERS_TO_CREATE: UserSpec[] = [
    { roleCode: 'SUPERADMIN', emailPrefix: 'superadmin', username: 'superadmin', fullName: 'Super Admin' },
    { roleCode: 'ACCOUNTING_MAKER', emailPrefix: 'maker', username: 'maker', fullName: 'Maker User' },
    { roleCode: 'USERCHECKER', emailPrefix: 'checker', username: 'checker', fullName: 'Checker User' },
    { roleCode: 'ACCOUNTING_APPROVER', emailPrefix: 'approver', username: 'approver', fullName: 'Approver User' },
]

export async function run(args: string[] = []) {
    const tenantCode = args[0]
    const password = args[1] || DEFAULT_PASSWORD

    if (!tenantCode) {
        console.error('❌ Usage: setup-tenant-users <tenantCode> [password]')
        console.error('   Example: setup-tenant-users RISTIX MySecurePass123')
        process.exit(1)
    }

    console.log(`🚀 Setting up users for tenant: ${tenantCode}`)
    console.log(`   Password: ${password ? '********' : '(default)'}`)
    console.log('')

    try {
        // 1. Find tenant
        console.log('🔍 Looking up tenant...')
        const [tenant] = await db
            .select()
            .from(tenants)
            .where(eq(tenants.code, tenantCode.toUpperCase()))
            .limit(1)

        if (!tenant) {
            // Try by slug
            const [tenantBySlug] = await db
                .select()
                .from(tenants)
                .where(eq(tenants.slug, tenantCode.toLowerCase()))
                .limit(1)

            if (!tenantBySlug) {
                console.error(`❌ Tenant '${tenantCode}' not found!`)
                console.error('   Available tenants:')
                const allTenants = await db.select({ code: tenants.code, name: tenants.name, id: tenants.id }).from(tenants)
                for (const t of allTenants) {
                    console.error(`     - ${t.code}: ${t.name} (${t.id})`)
                }
                process.exit(1)
            }
            return setupTenantUsers(tenantBySlug, password)
        }

        return setupTenantUsers(tenant, password)
    } catch (err: any) {
        console.error('💥 Fatal error:', err.message || err)
        process.exit(1)
    }
}

async function setupTenantUsers(tenant: any, password: string) {
    const tenantId = tenant.id
    const tenantCode = tenant.code
    const domain = tenant.slug || tenantCode.toLowerCase()

    console.log(`✅ Found tenant: ${tenant.name} (${tenantId})`)
    console.log('')

    // Resolve tenant database
    const tenantDb = getDatabase(tenantId)
    if (!tenantDb) {
        console.error('❌ Failed to resolve tenant database')
        process.exit(1)
    }

    // 2. Create roles
    console.log('🛡️  Creating roles...')
    for (const roleData of ROLES_TO_CREATE) {
        await tenantDb.insert(roles)
            .values({
                ...roleData,
                id: randomUUID(),
                tenantId,
                isActive: true,
                isSystemRole: roleData.roleCode === 'SUPERADMIN',
            })
            .onConflictDoUpdate({
                target: [roles.roleCode, roles.tenantId],
                set: {
                    roleName: roleData.roleName,
                    description: roleData.description,
                    hierarchyLevel: roleData.hierarchyLevel,
                    isActive: true,
                },
            })
        console.log(`   ✓ ${roleData.roleCode} (level ${roleData.hierarchyLevel})`)
    }
    console.log('')

    // 3. Get role IDs
    const dbRoles = await tenantDb.select().from(roles).where(
        and(
            inArray(roles.roleCode, ROLES_TO_CREATE.map(r => r.roleCode)),
            eq(roles.tenantId, tenantId)
        )
    )
    const roleMap = new Map(dbRoles.map(r => [r.roleCode, r.id]))

    // 4. Sync permissions to SUPERADMIN
    console.log('🔐 Syncing permissions to SUPERADMIN...')
    const allCatalogPerms = BANKING_PERMISSION_CATALOG
    console.log(`   Catalog has ${allCatalogPerms.length} permissions`)

    // Ensure all catalog permissions exist in DB
    const existingPerms = await tenantDb.select({ code: permissions.code }).from(permissions)
    const existingCodes = new Set(existingPerms.map(p => p.code))
    const toCreate = allCatalogPerms.filter(p => !existingCodes.has(p.code))

    if (toCreate.length > 0) {
        console.log(`   Creating ${toCreate.length} missing permissions...`)
        await tenantDb.insert(permissions).values(
            toCreate.map(p => ({
                ...p,
                id: randomUUID(),
                isActive: true,
            }))
        ).onConflictDoNothing({ target: permissions.code })
    }

    // Get all permission IDs
    const allPerms = await tenantDb.select({ id: permissions.id, code: permissions.code }).from(permissions)

    // Assign ALL permissions to SUPERADMIN
    const superadminRoleId = roleMap.get('SUPERADMIN')
    if (superadminRoleId) {
        const assigned = await tenantDb.select({ id: rolePermissions.permissionId })
            .from(rolePermissions)
            .where(eq(rolePermissions.roleId, superadminRoleId))
        const assignedSet = new Set(assigned.map(r => r.id))
        const toAssign = allPerms.filter(p => !assignedSet.has(p.id))

        if (toAssign.length > 0) {
            await tenantDb.insert(rolePermissions).values(
                toAssign.map(p => ({ roleId: superadminRoleId, permissionId: p.id }))
            ).onConflictDoNothing()
            console.log(`   ✓ Assigned ${toAssign.length} permissions to SUPERADMIN`)
        } else {
            console.log('   ✓ SUPERADMIN already has all permissions')
        }
    }

    // Assign approval-related permissions to CHECKER and APPROVER
    for (const targetRole of ['USERCHECKER', 'ACCOUNTING_APPROVER']) {
        const roleId = roleMap.get(targetRole)
        if (!roleId) continue

        const approvalPerms = await tenantDb.select({ id: permissions.id })
            .from(permissions)
            .where(eq(permissions.category, 'approval'))

        if (approvalPerms.length > 0) {
            for (const perm of approvalPerms) {
                await tenantDb.insert(rolePermissions)
                    .values({ roleId, permissionId: perm.id })
                    .onConflictDoNothing()
            }
            console.log(`   ✓ Assigned ${approvalPerms.length} approval permissions to ${targetRole}`)
        }
    }
    console.log('')

    // 5. Create users
    console.log('👤 Creating users...')
    const passwordHash = await Bun.password.hash(password, {
        algorithm: 'bcrypt',
        cost: 10,
    })

    for (const userSpec of USERS_TO_CREATE) {
        const email = `${userSpec.emailPrefix}@${domain}.co.id`
        const roleId = roleMap.get(userSpec.roleCode)

        if (!roleId) {
            console.warn(`   ⚠ Role ${userSpec.roleCode} not found, skipping user ${email}`)
            continue
        }

        // Upsert user
        let targetUser
        const [existing] = await tenantDb.select().from(users)
            .where(and(eq(users.email, email), eq(users.tenantId, tenantId)))
            .limit(1)

        if (existing) {
            const [updated] = await tenantDb.update(users)
                .set({ passwordHash, isActive: true, updatedAt: new Date() })
                .where(eq(users.id, existing.id))
                .returning()
            targetUser = updated
            console.log(`   ✓ ${email} — updated (already exists)`)
        } else {
            const [created] = await tenantDb.insert(users)
                .values({
                    id: randomUUID(),
                    email,
                    username: userSpec.username,
                    fullName: `${tenant.name} ${userSpec.fullName}`,
                    passwordHash,
                    tenantId,
                    isActive: true,
                    isVerified: true,
                    emailVerifiedAt: new Date(),
                })
                .returning()
            targetUser = created
            console.log(`   ✓ ${email} — created`)
        }

        // Assign role
        const [existingRole] = await tenantDb.select().from(userRoles)
            .where(and(eq(userRoles.userId, targetUser.id), eq(userRoles.roleId, roleId)))
            .limit(1)

        if (!existingRole) {
            await tenantDb.insert(userRoles).values({
                id: randomUUID(),
                userId: targetUser.id,
                roleId,
                tenantId,
                isActive: true,
                assignedAt: new Date(),
            })
            console.log(`     └─ Role ${userSpec.roleCode} assigned`)
        } else {
            console.log(`     └─ Role ${userSpec.roleCode} already assigned`)
        }
    }

    console.log('')
    console.log('🎉 Setup complete!')
    console.log('')
    console.log('📋 Summary:')
    console.log(`   Tenant: ${tenant.name} (${tenantCode})`)
    console.log(`   Roles: ${ROLES_TO_CREATE.map(r => r.roleCode).join(', ')}`)
    console.log(`   Users created for @${domain}.co.id:`)
    for (const u of USERS_TO_CREATE) {
        console.log(`     - ${u.emailPrefix}@${domain}.co.id (${u.roleCode})`)
    }
    console.log(`   Password: ${password}`)
    console.log('')
    console.log('⚠️  Change the default password after first login!')
}
