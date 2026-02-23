import postgres from 'postgres';

async function testExecutionsQuery() {
    console.log('=== Test Executions Query ===');
    const sql = postgres('postgresql://postgres:postgres@10.8.0.2:5433/ifrspro_platform_admin', { max: 1 });
    
    try {
        const tenantId = 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be';
        
        // Test direct query
        const executions = await sql`
            SELECT 
                id,
                job_definition_id,
                tenant_id,
                job_name,
                job_type,
                status,
                start_time,
                end_time
            FROM core.job_executions 
            WHERE tenant_id = ${tenantId}
            ORDER BY start_time DESC NULLS LAST
            LIMIT 10
        `;
        
        console.log(`📋 Found ${executions.length} executions:`, executions);

        // Test with join to job_definitions
        const withDefinitions = await sql`
            SELECT 
                e.id,
                e.job_name,
                e.job_type,
                e.status,
                e.start_time,
                d.name as definition_name,
                d.job_type as definition_job_type
            FROM core.job_executions e
            LEFT JOIN core.job_definitions d ON e.job_definition_id = d.id
            WHERE e.tenant_id = ${tenantId}
            ORDER BY e.start_time DESC
            LIMIT 10
        `;
        
        console.log('🔗 With definitions:', withDefinitions);

    } catch (error) {
        console.error('❌ Error testing executions:', error);
    } finally {
        await sql.end();
    }
}

testExecutionsQuery();
