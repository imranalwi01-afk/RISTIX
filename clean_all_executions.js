import postgres from 'postgres';

async function cleanAllExecutions() {
    console.log('=== Clean All Test Executions ===');
    const sql = postgres('postgresql://postgres:postgres@10.8.0.2:5433/ifrspro_platform_admin', { max: 1 });
    
    try {
        // Delete ALL executions for this tenant except our main one
        const mainExecutionId = 'e02818f3-b4ce-42fb-b3f5-cdeef68461cc';
        
        const deleted = await sql`
            DELETE FROM core.job_executions 
            WHERE tenant_id = 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be'
            AND id != ${mainExecutionId}
            RETURNING id
        `;
        
        console.log(`🗑️ Deleted ${deleted.length} test executions:`, deleted);

        // Update main execution to correct status and date
        const updated = await sql`
            UPDATE core.job_executions 
            SET status = 'COMPLETED',
                start_time = '2026-01-26 08:00:00',
                end_time = '2026-01-26 08:30:00',
                progress = 100
            WHERE id = ${mainExecutionId}
            RETURNING id, status, start_time, end_time
        `;
        
        console.log('✅ Updated main execution:', updated);

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
        console.error('❌ Error cleaning executions:', error);
    } finally {
        await sql.end();
    }
}

cleanAllExecutions();
