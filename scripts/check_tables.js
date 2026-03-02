import postgres from 'postgres';

async function checkTables() {
    console.log('=== Checking All Tables ===');
    const sql = postgres('postgresql://postgres:postgres@10.8.0.2:5433/ifrspro_platform_admin', { max: 1 });
    
    try {
        // Check all tables
        const allTables = await sql`
            SELECT schemaname, tablename 
            FROM pg_tables 
            WHERE schemaname NOT IN ('information_schema', 'pg_catalog')
            ORDER BY schemaname, tablename
        `;
        console.log('📋 All tables:', allTables);

        // Check specifically for tenant-related tables
        const tenantTables = await sql`
            SELECT schemaname, tablename 
            FROM pg_tables 
            WHERE tablename ILIKE '%tenant%' 
            ORDER BY schemaname, tablename
        `;
        console.log('🏢 Tenant-related tables:', tenantTables);

    } catch (error) {
        console.error('❌ Error checking tables:', error);
    } finally {
        await sql.end();
    }
}

checkTables();
