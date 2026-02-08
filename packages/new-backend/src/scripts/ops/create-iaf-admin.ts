
import { db } from '../../config/database'
import { users, tenants } from '../../db/schema/core'
import { roles, userRoles } from '../../db/schema/rbac.schema'
import { eq, and } from 'drizzle-orm'
import { sql } from 'drizzle-orm'

async function createIafAdmin() {
    console.log('🔒 Starting IAF Admin User Creation/Reset...')

    const TARGET_TENANT_CODE = 'iaf'
    const USERNAME = 'admin'
    const EMAIL = 'admin@iaf.co.id'
    const PASSWORD = 'password123' // Default password, change immediately
    const ROLE_CODE = 'IAF_TENANT_SUPERADMIN'

    try {
        // 1. Get Tenant ID
        console.log(`🔍 Looking for tenant: ${TARGET_TENANT_CODE}`)
        const [tenant] = await db
            .select()
            .from(tenants)
            .where(eq(tenants.code, TARGET_TENANT_CODE))
            .limit(1)

        if (!tenant) {
            console.error(`❌ Tenant '${TARGET_TENANT_CODE}' not found! Please seed tenants first.`)
            process.exit(1)
        }
        console.log(`✅ Found tenant: ${tenant.name} (${tenant.id})`)

        // 2. Hash Password
        console.log('🔑 Hashing password...')
        const passwordHash = await Bun.password.hash(PASSWORD, {
            algorithm: 'bcrypt',
            cost: 10,
        })

        // 3. Upsert User
        console.log(`👤 Creating/Updating user: ${USERNAME} (${EMAIL})`)
        const [user] = await db
            .insert(users)
            .values({
                username: USERNAME,
                email: EMAIL,
                passwordHash: passwordHash,
                fullName: 'IAF Super Admin',
                tenantId: tenant.id, // Use the actual UUID from tenants table
                isActive: true,
                isVerified: true,
                emailVerifiedAt: new Date(),
            })
            .onConflictDoUpdate({
                target: users.username, // Assuming username is unique, or email? Schema has index on both but no unique constraint explicitly defined in core.ts for Drizzle (check core.ts again if uniqueIndex used).
                // Actually core.ts doesn't show uniqueIndex on username/email in the table definition I saw, but usually they are.
                // Let's assume we want to update by email if possible, or use explicit update if insert fails (but upsert is safer).
                // Wait, core.ts: index('idx_dana_users_username').on(table.username) -> NOT uniqueIndex.
                // So we might have duplicates?
                // Standard practice is unique. I will check Drizzle core.ts again.
                // If not unique, I'll search first.
                set: {
                    passwordHash: passwordHash,
                    isActive: true,
                    updatedAt: new Date(),
                }
            })
            .returning()

        // Drizzle's onConflictDoUpdate requires a unique constraint target.
        // If there isn't one defined in Drizzle schema, this might fail or generate invalid SQL if the DB has it but Drizzle doesn't know.
        // Let's verify schema uniqueness. If unclear, I'll do SELECT -> UPDATE/INSERT.
        // Given I verified core.ts and didn't see uniqueIndex on username/email (only index), I will allow for manual check.

    } catch (err: any) {
        // Fallback for unique constraint violation if using insert without onConflict (or if I change strategy)
        console.warn('⚠️  Upsert might have failed, trying manual update strategy...', err.message)
    }

    // ALTERNATIVE SAFE STRATEGY (Select first)
    // ---------------------------------------------------------
    let targetUser
    const [existingUser] = await db.select().from(users).where(eq(users.email, EMAIL)).limit(1)

    if (existingUser) {
        console.log('📝 User exists, updating password...')
        const [updated] = await db.update(users)
            .set({
                passwordHash,
                isActive: true,
                updatedAt: new Date()
            })
            .where(eq(users.id, existingUser.id))
            .returning()
        targetUser = updated
    } else {
        console.log('✨ Creating new user...')
        const [created] = await db.insert(users)
            .values({
                username: USERNAME,
                email: EMAIL,
                passwordHash: passwordHash,
                fullName: 'IAF Super Admin',
                tenantId: tenant.id,
                isActive: true,
                isVerified: true,
                emailVerifiedAt: new Date(),
            })
            .returning()
        targetUser = created
    }

    if (!targetUser) {
        console.error('❌ Failed to create/update user')
        process.exit(1)
    }

    // 4. Assign Role
    console.log(`🛡️  Assigning role: ${ROLE_CODE}`)
    const [role] = await db
        .select()
        .from(roles)
        .where(eq(roles.roleCode, ROLE_CODE))
        .limit(1)

    if (!role) {
        console.error(`❌ Role '${ROLE_CODE}' not found!`)
        process.exit(1)
    }

    // Check existing role assignment
    const [existingRole] = await db
        .select()
        .from(userRoles)
        .where(
            and(
                eq(userRoles.userId, targetUser.id),
                eq(userRoles.roleId, role.id)
            )
        )
        .limit(1)

    if (!existingRole) {
        await db.insert(userRoles).values({
            userId: targetUser.id,
            roleId: role.id,
            tenantId: tenant.id,
            isActive: true,
        })
        console.log('✅ Role assigned successfully')
    } else {
        console.log('ℹ️  User already has this role')
    }

    console.log('\n✅ DONE! Login details:')
    console.log(`   Email: ${EMAIL}`)
    console.log(`   Password: ${PASSWORD}`)
    console.log(`   Tenant: ${tenant.name}`)

    process.exit(0)
}


export async function run() {
    await createIafAdmin()
}

// Only execute if running directly (not imported)
if (import.meta.main) {
    createIafAdmin().catch(err => {
        console.error('💥 Fatal error:', err)
        process.exit(1)
    })
}

