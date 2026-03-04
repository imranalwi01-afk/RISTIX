import postgres from 'postgres';

async function checkTenant() {
    console.log('=== Checking Tenant Data ===');
    const sql = postgres('postgresql://postgres:postgres@10.8.0.2:5433/ifrspro_platform_admin', { max: 1 });
    
    try {
        // Check all tenants
        const allTenants = await sql`SELECT id, slug, name, is_active FROM platform_admin.tenants ORDER BY created_at`;
        console.log('📋 All tenants:', allTenants);

        // Check specifically for 'iaf' slug
        const iafTenant = await sql`SELECT id, slug, name, is_active FROM platform_admin.tenants WHERE slug = 'iaf'`;
        console.log('🔍 IAF tenant:', iafTenant);

    } catch (error) {
        console.error('❌ Error checking tenant:', error);
    } finally {
        await sql.end();
    }
}

checkTenant();
