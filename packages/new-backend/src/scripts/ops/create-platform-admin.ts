
import { db } from '../../config/database'
import { sql } from 'drizzle-orm'
import { pgTable, text, boolean, uuid, timestamp, varchar } from 'drizzle-orm/pg-core'
import { pgSchema } from 'drizzle-orm/pg-core'

// Define schema locally since it might not be fully exported or I want to be explicit
const platformAdminSchema = pgSchema('platform_admin')

const platformUsers = platformAdminSchema.table('platform_users', {
    id: uuid('id').primaryKey().defaultRandom(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    username: varchar('username', { length: 100 }).notNull(),
    passwordHash: varchar('password_hash', { length: 255 }).notNull(),
    fullName: varchar('full_name', { length: 200 }).notNull(),
    isActive: boolean('is_active').default(true),
    isVerified: boolean('is_verified').default(false),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
    // Add other columns as needed based on inspection, but these are core for login
})


async function createPlatformAdmin() {
    console.log('🔒 Starting Platform Superadmin Creation/Reset...')

    const USERNAME = 'superadmin'
    const EMAIL = 'superadmin@iaf.co.id' // or platform@ifrspro.id? letting user change if needed
    const PASSWORD = 'password123'

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
            .select()
            .from(platformUsers)
            .where(sql`${platformUsers.email} = ${EMAIL}`)
            .limit(1)

        if (existing) {
            console.log('📝 User exists, updating password...')
            await db.update(platformUsers)
                .set({
                    passwordHash,
                    isActive: true,
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
