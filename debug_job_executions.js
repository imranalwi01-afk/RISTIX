import postgres from 'postgres';

async function debugJobExecutions() {
    console.log('=== Debug Job Executions ===');
    const sql = postgres('postgresql://postgres:postgres@10.8.0.2:5433/ifrspro_platform_admin', { max: 1 });
    
    try {
        // Check all records in job_executions
        const allExecutions = await sql`SELECT * FROM core.job_executions`;
        console.log('📋 All job executions:', allExecutions);

        // Check specifically for the ID we just created
        const specificExecution = await sql`
            SELECT * FROM core.job_executions 
            WHERE id = '26bd4685-bb82-4ab5-9eb4-95bdc4b4fd7e'
        `;
        console.log('🔍 Specific execution:', specificExecution);

        // Check job_definitions
        const allDefinitions = await sql`SELECT * FROM core.job_definitions`;
        console.log('🔧 All job definitions:', allDefinitions);

    } catch (error) {
        console.error('❌ Error debugging:', error);
    } finally {
        await sql.end();
    }
}

debugJobExecutions();
