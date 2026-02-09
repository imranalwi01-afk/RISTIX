
import { db, getDatabase } from '../../config/database'
import { platformUsers, users } from '../../db/schema'
import { sql } from 'drizzle-orm'
import { tenants } from '../../db/schema/platform.schema'

export async function run(options: { email: string; password?: string, tenantId?: string }) {
    const { email, password, tenantId } = options

    if (!email || !password) {
        console.error('❌ Email and password are required')
        process.exit(1)
    }

    console.log(`🔒 Resetting password for ${email}...`)

    try {
        // 1. Hash Password
        const passwordHash = await Bun.password.hash(password, {
            algorithm: 'bcrypt',
            cost: 10,
        })

        if (tenantId) {
            // === TENANT USER RESET ===
            console.log(`🌍 Targeting Tenant: ${tenantId}`)

            // Validate tenant exists
            const [tenant] = await db
                .select()
                .from(tenants)
                .where(sql`${tenants.id} = ${tenantId}`)
                .limit(1)

            if (!tenant) {
                console.error(`❌ Tenant '${tenantId}' not found in Platform DB`)
                process.exit(1)
            }

            // Get tenant DB connection
            console.log(`🔌 Connecting to tenant database...`)
            const tenantDb = await getDatabase(tenantId)

            // Update user in tenant DB
            const [updatedUser] = await tenantDb
                .update(users)
                .set({
                    passwordHash,
                    forcePasswordChange: true, // Force change on next login for security
                    updatedAt: new Date(),
                })
                .where(sql`${users.email} = ${email}`)
                .returning({ id: users.id, email: users.email })

            if (updatedUser) {
                console.log(`✅ Successfully reset password for Tenant User: ${updatedUser.email} (ID: ${updatedUser.id})`)
                console.log(`ℹ️  User will be forced to change password on next login.`)
            } else {
                console.error(`❌ User '${email}' not found in Tenant '${tenantId}' database.`)
            }

        } else {
            // === PLATFORM SUPERADMIN RESET ===
            console.log(`🏢 Targeting Platform Superadmin (Cross-tenant)`)

            // Explicitly get platform DB connection
            const platformDb = await getDatabase()

            // DEBUG: List all platform users to see what's visible
            const allPlatformUsers = await platformDb.select().from(platformUsers)
            console.log(`DEBUG: Found ${allPlatformUsers.length} platform users in table/view public/core.users via platformSchema`)
            allPlatformUsers.forEach(u => console.log(` - ${u.email} (ID: ${u.id})`))

            let [updatedAdmin] = await platformDb
                .update(platformUsers)
                .set({
                    passwordHash,
                    updatedAt: new Date(),
                })
                .where(sql`${platformUsers.email} = ${email}`)
                .returning({ id: platformUsers.id, email: platformUsers.email })

            if (!updatedAdmin) {
                console.log('⚠️  User not found via platformUsers schema. Trying core.users schema...')
                // Fallback to core.users in case of schema mismatch
                const [coreUser] = await platformDb
                    .update(users)
                    .set({
                        passwordHash,
                        updatedAt: new Date(),
                    })
                    .where(sql`${users.email} = ${email}`)
                    .returning({ id: users.id, email: users.email })

                if (coreUser) {
                    updatedAdmin = coreUser
                    console.log('✅ Found and updated user via core.users schema!')
                }
            }

            if (updatedAdmin) {
                console.log(`✅ Successfully reset password for Platform Admin: ${updatedAdmin.email} (ID: ${updatedAdmin.id})`)
            } else {
                console.error(`❌ Platform Admin '${email}' not found.`)
                console.log(`ℹ️  To create a new superadmin, use: pnpm ops create-platform-admin`)
            }
        }

    } catch (err: any) {
        console.error('💥 Error resetting password:', err)
        process.exit(1)
    }
}
