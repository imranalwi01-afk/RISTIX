import postgres from 'postgres';

async function updateExecutionStatus() {
    console.log('=== Update Execution Status ===');
    const sql = postgres('postgresql://postgres:postgres@10.8.0.2:5433/ifrspro_platform_admin', { max: 1 });
    
    try {
        // Update the execution to COMPLETED
        const executionId = 'e02818f3-b4ce-42fb-b3f5-cdeef68461cc';
        
        const result = await sql`
            UPDATE core.job_executions 
            SET status = 'COMPLETED', 
                end_time = NOW(),
                progress = 100
            WHERE id = ${executionId}
            RETURNING *
        `;
        
        console.log('✅ Updated execution to COMPLETED:', result);

        // Verify the update
        const verify = await sql`
            SELECT * FROM core.job_executions WHERE id = ${executionId}
        `;
        console.log('🔍 Verification:', verify);

    } catch (error) {
        console.error('❌ Error updating execution:', error);
    } finally {
        await sql.end();
    }
}

updateExecutionStatus();
