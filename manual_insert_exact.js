import postgres from 'postgres';

async function manualInsertExact() {
    console.log('=== Manual Insert Exact Data ===');
    const sql = postgres('postgresql://postgres:postgres@10.8.0.2:5433/ifrspro_platform_admin', { max: 1 });
    
    try {
        // Use the exact same data from the logs
        const executionData = {
            id: 'e02818f3-b4ce-42fb-b3f5-cdeef68461cc',
            job_definition_id: '45e6c227-f076-4e82-b41d-a2f7a0d7a4d5', 
            tenant_id: 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be',
            job_name: 'IFRS9 Impairment Sequence',
            job_type: 'IFRS9_CALCULATION',
            status: 'RUNNING',
            start_time: '2026-02-17T06:53:29.224Z',
            parameters: '{"processDate":"2026-01-26","segmentIds":[1],"calculationType":"full","recalculate":false,"scenarios":["Base"]}'
        };

        console.log('🔍 Trying to insert exact data from logs...');
        
        const result = await sql`
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
                ${executionData.id},
                ${executionData.job_definition_id}, 
                ${executionData.tenant_id},
                ${executionData.job_name},
                ${executionData.job_type},
                ${executionData.status},
                ${executionData.start_time},
                ${executionData.parameters}::jsonb
            ) RETURNING *
        `;
        
        console.log('✅ Manual insert successful:', result);

        // Verify it was inserted
        const verify = await sql`
            SELECT * FROM core.job_executions WHERE id = ${executionData.id}
        `;
        console.log('🔍 Verification:', verify);

    } catch (error) {
        console.error('❌ Manual insert error:', error);
        console.error('Error details:', error.message);
    } finally {
        await sql.end();
    }
}

manualInsertExact();
