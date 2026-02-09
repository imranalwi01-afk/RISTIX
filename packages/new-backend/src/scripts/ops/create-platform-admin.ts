import { db } from '../../config/database'
import { sql } from 'drizzle-orm'
import { platformUsers } from '../../db/schema' // Use explicit platformUsers table

async function createPlatformAdmin() {
    console.log('🔒 Starting Platform Superadmin Creation/Reset...')

    const USERNAME = 'superadmin'
    const EMAIL = 'superadmin@iaf.co.id'
    const PASSWORD = '1019181716'

    try {
        // 1. Hash Password
        console.log('🔑 Hashing password...')
        const passwordHash = await Bun.password.hash(PASSWORD, {
            algorithm: 'bcrypt',
            cost: 10,
        })

        // 2. Check if user exists
        console.log(`🔍 Checking for existing user: ${EMAIL}`)
        // We use 'db' which is platformDb by default
        const [existing] = await db
            .select() // Select all fields (no tenant_id in platformUsers)
            .from(platformUsers)
            .where(sql`${platformUsers.email} = ${EMAIL}`)
            .limit(1)

        if (existing) {
            console.log('📝 User exists, updating password...')
            await db.update(platformUsers)
                .set({
                    passwordHash,
                    isActive: true,
                    role: 'SUPER_ADMIN', // Ensure role is set
                    updatedAt: new Date(),
                })
                .where(sql`${platformUsers.id} = ${existing.id}`)

            console.log('✅ User updated successfully')
        } else {
            console.log('✨ Creating new platform user...')
            await db.insert(platformUsers).values({
                username: USERNAME,
                email: EMAIL,
                passwordHash,
                fullName: 'Platform Superadmin',
                role: 'SUPER_ADMIN', // Required field
                isActive: true,
                isVerified: true,
            })
            console.log('✅ User created successfully')
        }

        console.log('\n✅ DONE! Platform Login details:')
        console.log(`   Email: ${EMAIL}`)
        console.log(`   Password: ${PASSWORD}`)
        console.log(`   Login URL: (Use the Platform Login page, usually /platform/login or /admin)`)

    } catch (err: any) {
        console.error('❌ Error creating platform admin:', err)
        throw err
    }
}

export async function run() {
    await createPlatformAdmin()
}

// Only execute if running directly
if (import.meta.main) {
    createPlatformAdmin().catch(err => {
        console.error('💥 Fatal error:', err)
        process.exit(1)
    })
}
