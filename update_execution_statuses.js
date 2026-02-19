import postgres from 'postgres';

async function updateExecutionStatuses() {
    console.log('=== Update Execution Statuses ===');
    const sql = postgres('postgresql://postgres:postgres@10.8.0.2:5433/ifrspro_platform_admin', { max: 1 });
    
    try {
        // Update our main execution to COMPLETED with correct date
        const executionId = 'e02818f3-b4ce-42fb-b3f5-cdeef68461cc';
        
        const updated = await sql`
            UPDATE core.job_executions 
            SET status = 'COMPLETED',
                end_time = NOW(),
                progress = 100
            WHERE id = ${executionId}
            RETURNING id, status, start_time, end_time
        `;
        
        console.log('✅ Updated main execution:', updated);

        // Clean up other test executions (delete them)
        const deleted = await sql`
            DELETE FROM core.job_executions 
            WHERE tenant_id = 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be'
            AND id != ${executionId}
            RETURNING id
        `;
        
        console.log(`🗑️ Cleaned up ${deleted.length} test executions:`, deleted);

        // Verify final state
        const final = await sql`
            SELECT 
                id,
                job_name,
                status,
                start_time,
                end_time
            FROM core.job_executions 
            WHERE tenant_id = 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be'
            ORDER BY start_time DESC
        `;
        
        console.log('🎯 Final executions state:', final);

    } catch (error) {
        console.error('❌ Error updating executions:', error);
    } finally {
        await sql.end();
    }
}

updateExecutionStatuses();
