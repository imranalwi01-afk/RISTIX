import postgres from 'postgres';

async function checkTableStructure() {
    console.log('=== Check Table Structure ===');
    const sql = postgres('postgresql://postgres:postgres@10.8.0.2:5433/ifrspro_platform_admin', { max: 1 });
    
    try {
        // Check job_executions table structure
        const structure = await sql`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns 
            WHERE table_schema = 'core' AND table_name = 'job_executions'
            ORDER BY ordinal_position
        `;
        console.log('📋 Job Executions table structure:', structure);

        // Check job_definitions table structure
        const defStructure = await sql`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns 
            WHERE table_schema = 'core' AND table_name = 'job_definitions'
            ORDER BY ordinal_position
        `;
        console.log('🔧 Job Definitions table structure:', defStructure);

        // Check foreign key constraints
        const constraints = await sql`
            SELECT
                tc.constraint_name,
                tc.constraint_type,
                kcu.column_name,
                ccu.table_name AS foreign_table_name,
                ccu.column_name AS foreign_column_name
            FROM information_schema.table_constraints AS tc
            JOIN information_schema.key_column_usage AS kcu
                ON tc.constraint_name = kcu.constraint_name
                AND tc.table_schema = kcu.table_schema
            JOIN information_schema.constraint_column_usage AS ccu
                ON ccu.constraint_name = tc.constraint_name
                AND ccu.table_schema = tc.table_schema
            WHERE tc.table_schema = 'core' 
            AND tc.table_name = 'job_executions'
            AND tc.constraint_type = 'FOREIGN KEY'
        `;
        console.log('🔗 Foreign key constraints:', constraints);

    } catch (error) {
        console.error('❌ Error checking structure:', error);
    } finally {
        await sql.end();
    }
}

checkTableStructure();
