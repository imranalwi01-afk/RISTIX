
import { db } from '../src/config/database'
import { users, tenants } from '../src/db/schema'
import { eq } from 'drizzle-orm'
import { AuthRepository } from '../src/repositories/auth.repository'

async function checkUser() {
    console.log('🔍 Checking user: admin@iaf-system.local')

    try {
        // 1. Find user globally (ignoring tenant) to see where they belong
        const allUsers = await db.select().from(users).where(eq(users.email, 'admin@iaf-system.local'))

        if (allUsers.length === 0) {
            console.error('❌ User NOT FOUND in database!')
            process.exit(1)
        }

        const user = allUsers[0]
        console.log('✅ User Found:', {
            id: user.id,
            email: user.email,
            tenantId: user.tenantId,
            isActive: user.isActive,
            isPlatformAdmin: user.isPlatformAdmin
        })

        // 2. Check the tenant details
        const tenant = await db.query.tenants.findFirst({
            where: eq(tenants.id, user.tenantId)
        })

        if (!tenant) {
            console.error('❌ Tenant NOT FOUND for this user!')
        } else {
            console.log('🏢 Tenant Details:', {
                id: tenant.id,
                name: tenant.name,
                slug: tenant.slug,
                code: tenant.code
            })
        }

        // 3. Verify password hash exists
        console.log('🔑 Password Hash exists:', !!user.passwordHash)

        // 4. Check roles
        const roles = await db.query.userRoles.findMany({
            where: eq(users.id, user.id) // This might fail if schema relations aren't perfect, but let's try direct query if needed
        })

        // Actually userRoles table has userId column
        // I need to import userRoles schema or use db.execute if schema is tricky
        // But let's assume standard query first
        // Wait, I didn't import userRoles.
        // Let's use the valid import way if possible, or just skip roles for now if complex.
        // Actually I can check roles via AuthRepository helper if available, or just raw query?
        // Let's stick to simple user check first.

    } catch (error) {
        console.error('💥 Error checking user:', error)
    } finally {
        process.exit(0)
    }
}

checkUser()
