import { db } from '../src/config/database'
import { tenants, users } from '../src/db/schema'
import { eq } from 'drizzle-orm'
import * as bcrypt from 'bun'

const SYSTEM_TENANT_CODE = 'system'
const ADMIN_EMAIL = 'admin@iaf-system.local'

async function seedSystemTenant() {
    console.log('🌱 Seeding System Tenant...')

    // 1. Check/Create System Tenant
    let systemTenant = await db.query.tenants.findFirst({
        where: eq(tenants.code, SYSTEM_TENANT_CODE)
    })

    if (!systemTenant) {
        console.log('Creating system tenant...')
        const [newTenant] = await db.insert(tenants).values({
            code: SYSTEM_TENANT_CODE,
            name: 'IAF System',
            slug: 'system',
            description: 'Platform Administration Tenant',
            type: 'system',
            isActive: true
        }).returning()
        systemTenant = newTenant
        console.log('✅ System tenant created')
    } else {
        console.log('ℹ️ System tenant already exists')
    }

    // 2. Check/Create Platform Admin User
    let adminUser = await db.query.users.findFirst({
        where: eq(users.email, ADMIN_EMAIL)
    })

    if (!adminUser) {
        console.log('Creating platform admin user...')
        const hashedPassword = await Bun.password.hash('admin123', {
            algorithm: "bcrypt",
            cost: 10,
        })

        await db.insert(users).values({
            tenantId: systemTenant.id,
            email: ADMIN_EMAIL,
            username: 'platform_admin',
            passwordHash: hashedPassword,
            fullName: 'Platform Administrator',
            isActive: true,
            isPlatformAdmin: true, // This is the key flag!
            isEmailVerified: true
        })
        console.log('✅ Platform admin user created')
        console.log(`credentials: ${ADMIN_EMAIL} / admin123`)
    } else {
        console.log('ℹ️ Platform admin user already exists. Updating flags...')

        await db.update(users)
            .set({ isPlatformAdmin: true })
            .where(eq(users.id, adminUser.id))

        console.log('✅ Updated existing admin with isPlatformAdmin=true')
    }

    console.log('✨ Seed complete!')
    process.exit(0)
}

seedSystemTenant().catch((err) => {
    console.error('❌ Seed failed:', err)
    process.exit(1)
})
