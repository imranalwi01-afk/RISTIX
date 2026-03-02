import postgres from 'postgres';

async function checkSpecificExecution() {
    console.log('=== Check Specific Execution ===');
    const sql = postgres('postgresql://postgres:postgres@10.8.0.2:5433/ifrspro_platform_admin', { max: 1 });
    
    try {
        // Check the specific execution ID from the logs
        const specificId = 'e02818f3-b4ce-42fb-b3f5-cdeef68461cc';
        console.log(`🔍 Checking execution ID: ${specificId}`);
        
        const execution = await sql`
            SELECT * FROM core.job_executions WHERE id = ${specificId}
        `;
        console.log('📋 Execution result:', execution);

        // Check all executions with this job definition ID
        const jobDefId = '45e6c227-f076-4e82-b41d-a2f7a0d7a4d5';
        console.log(`🔍 Checking executions for job definition: ${jobDefId}`);
        
        const byJobDef = await sql`
            SELECT * FROM core.job_executions WHERE job_definition_id = ${jobDefId}
        `;
        console.log('📋 By job definition:', byJobDef);

        // Check all executions for this tenant
        const tenantId = 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be';
        console.log(`🔍 Checking executions for tenant: ${tenantId}`);
        
        const byTenant = await sql`
            SELECT * FROM core.job_executions WHERE tenant_id = ${tenantId}
        `;
        console.log('📋 By tenant:', byTenant);

        // Check all executions period
        const allExecutions = await sql`
            SELECT id, job_name, status, start_time FROM core.job_executions ORDER BY start_time DESC LIMIT 10
        `;
        console.log('📋 All executions (last 10):', allExecutions);

    } catch (error) {
        console.error('❌ Error checking specific execution:', error);
    } finally {
        await sql.end();
    }
}

checkSpecificExecution();
