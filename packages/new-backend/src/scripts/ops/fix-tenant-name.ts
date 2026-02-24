/**
 * One-time fix script: revert tenant name to remove "(Local Development)" suffix
 * Usage: bun run src/scripts/ops/fix-tenant-name.ts
 */
import { platformDb } from '../../config/database'
import { platformTenants } from '../../db/schema/platform.schema'
import { eq, like } from 'drizzle-orm'

async function fixTenantName() {
    console.log('🔧 Checking tenant names in platform_admin.tenants...')

    // Find tenants with "(Local Development)" in name
    const tenants = await platformDb
        .select({ id: platformTenants.id, code: platformTenants.code, name: platformTenants.name })
        .from(platformTenants)

    console.log(`📋 Found ${tenants.length} tenant(s):`)
    tenants.forEach(t => console.log(`  - [${t.code}] ${t.name}`))

    const toFix = tenants.filter(t => t.name.includes('(Local Development)') || t.name.includes('Local Development'))

    if (toFix.length === 0) {
        console.log('✅ No tenants need fixing.')
        process.exit(0)
    }

    for (const tenant of toFix) {
        const newName = tenant.name
            .replace(' (Local Development)', '')
            .replace('(Local Development)', '')
            .trim()

        console.log(`🔄 Updating [${tenant.code}]: "${tenant.name}" → "${newName}"`)

        await platformDb
            .update(platformTenants)
            .set({ name: newName })
            .where(eq(platformTenants.id, tenant.id))

        console.log(`✅ Done for [${tenant.code}]`)
    }

    console.log('\n✅ All tenant names fixed successfully!')
    process.exit(0)
}

fixTenantName().catch((err) => {
    console.error('❌ Error fixing tenant name:', err)
    process.exit(1)
})
