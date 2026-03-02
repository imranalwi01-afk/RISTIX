import postgres from 'postgres';

async function manualTestInsert() {
    console.log('=== Manual Test Insert ===');
    const sql = postgres('postgresql://postgres:postgres@10.8.0.2:5433/ifrspro_platform_admin', { max: 1 });
    
    try {
        // Test manual insert to see if table works
        const testExecution = await sql`
            INSERT INTO core.job_executions (
                id, 
                job_definition_id, 
                tenant_id, 
                job_name, 
                job_type, 
                status, 
                start_time, 
                parameters
            ) VALUES (
                'test-execution-123',
                'test-job-def-456', 
                'f7b3a087-8a42-40c4-baca-9dc92cc0a2be',
                'Test Execution',
                'TEST_TYPE',
                'RUNNING',
                NOW(),
                '{"test": true}'
            ) RETURNING *
        `;
        console.log('✅ Manual insert successful:', testExecution);

        // Verify it was inserted
        const verify = await sql`
            SELECT * FROM core.job_executions WHERE id = 'test-execution-123'
        `;
        console.log('🔍 Verification:', verify);

    } catch (error) {
        console.error('❌ Manual insert error:', error);
    } finally {
        await sql.end();
    }
}

manualTestInsert();
