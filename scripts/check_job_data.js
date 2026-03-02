import postgres from 'postgres';

async function checkJobData() {
    console.log('=== Checking Job Executions and Definitions ===');
    const sql = postgres('postgresql://postgres:postgres@10.8.0.2:5433/ifrspro_platform_admin', { max: 1 });
    
    try {
        // Check recent job executions
        const executions = await sql`
            SELECT id, job_name, job_type, status, start_time, end_time
            FROM core.job_executions 
            ORDER BY start_time DESC NULLS LAST
            LIMIT 5
        `;
        console.log('📋 Recent job executions:', executions);

        // Check IFRS9 job definitions
        const definitions = await sql`
            SELECT id, name, job_type, is_enabled
            FROM core.job_definitions 
            WHERE job_type = 'IFRS9_CALCULATION'
        `;
        console.log('🔧 IFRS9 job definitions:', definitions);

        // Check all job executions count
        const count = await sql`SELECT COUNT(*) as count FROM core.job_executions`;
        console.log('📊 Total job executions count:', count[0].count);

    } catch (error) {
        console.error('❌ Error checking job data:', error);
    } finally {
        await sql.end();
    }
}

checkJobData();
