import postgres from 'postgres';

async function checkTables() {
    // Check Platform DB
    console.log('=== Checking Platform DB (ifrspro_platform_admin) ===');
    const platformSql = postgres('postgresql://postgres:postgres@10.8.0.2:5433/ifrspro_platform_admin', { max: 1 });
    try {
        const result = await platformSql`
            SELECT schemaname, tablename 
            FROM pg_tables 
            WHERE tablename IN ('job_executions', 'job_definitions')
            ORDER BY schemaname, tablename
        `;
        console.log('Platform DB tables:', result);
    } catch (e) {
        console.error('Platform DB error:', e);
    } finally {
        await platformSql.end();
    }

    // Check Tenant DB
    console.log('\n=== Checking Tenant DB (ifrspro_tenant_iaf) ===');
    const tenantSql = postgres('postgresql://postgres:postgres@10.8.0.2:5433/ifrspro_tenant_iaf', { max: 1 });
    try {
        const result = await tenantSql`
            SELECT schemaname, tablename 
            FROM pg_tables 
            WHERE tablename IN ('job_executions', 'job_definitions')
            ORDER BY schemaname, tablename
        `;
        console.log('Tenant DB tables:', result);
    } catch (e) {
        console.error('Tenant DB error:', e);
    } finally {
        await tenantSql.end();
    }
}

checkTables();
