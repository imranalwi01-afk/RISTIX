import postgres from 'postgres';

async function fixExecutionJobDef() {
    console.log('=== Fix Execution Job Definition ===');
    const sql = postgres('postgresql://postgres:postgres@10.8.0.2:5433/ifrspro_platform_admin', { max: 1 });
    
    try {
        // Get the correct job definition ID
        const jobDef = await sql`
            SELECT id FROM core.job_definitions WHERE job_type = 'IFRS9_CALCULATION'
        `;
        
        if (jobDef.length === 0) {
            console.log('❌ No IFRS9_CALCULATION job definition found');
            return;
        }
        
        const correctJobDefId = jobDef[0].id;
        console.log('📋 Correct job definition ID:', correctJobDefId);
        
        // Update the execution to use the correct job definition ID
        const executionId = 'e02818f3-b4ce-42fb-b3f5-cdeef68461cc';
        
        const updated = await sql`
            UPDATE core.job_executions 
            SET job_definition_id = ${correctJobDefId}
            WHERE id = ${executionId}
            RETURNING *
        `;
        
        console.log('✅ Updated execution:', updated);

        // Verify the join works now
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
            WHERE e.tenant_id = 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be'
            ORDER BY e.start_time DESC
            LIMIT 10
        `;
        
        console.log('🔗 With definitions (fixed):', withDefinitions);

    } catch (error) {
        console.error('❌ Error fixing execution:', error);
    } finally {
        await sql.end();
    }
}

fixExecutionJobDef();
