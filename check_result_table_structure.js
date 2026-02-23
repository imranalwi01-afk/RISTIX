import postgres from 'postgres';

async function checkResultTableStructure() {
    console.log('=== Check Result Table Structure ===');
    const sql = postgres('postgresql://postgres:postgres@10.8.0.2:5433/FRS9PRO', { max: 1 });
    
    try {
        // Check table structure
        const structure = await sql`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns 
            WHERE table_name = 'frs9_imp_ca_result_h'
            ORDER BY ordinal_position
        `;
        console.log('📋 frs9_imp_ca_result_h structure:', structure);

        // Check sample data
        const sample = await sql`
            SELECT * FROM frs9_imp_ca_result_h LIMIT 3
        `;
        console.log('📊 Sample data:', sample);

    } catch (error) {
        console.error('❌ Error checking structure:', error);
    } finally {
        await sql.end();
    }
}

checkResultTableStructure();
