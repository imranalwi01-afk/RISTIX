import postgres from 'postgres';

async function checkAvailableDates() {
    console.log('=== Checking Available Dates ===');
    const sql = postgres('postgresql://postgres:postgres@10.8.0.2:5433/FRS9PRO', { max: 1 });
    
    try {
        // Check available dates in master account
        const masterDates = await sql`
            SELECT DISTINCT prc_date, COUNT(*) as count
            FROM frs9_master_account 
            GROUP BY prc_date 
            ORDER BY prc_date DESC 
            LIMIT 10
        `;
        console.log('📅 Available dates in frs9_master_account:', masterDates);

        // Check available dates in result table
        const resultDates = await sql`
            SELECT DISTINCT prc_date, COUNT(*) as count
            FROM frs9_imp_ca_result_h 
            GROUP BY prc_date 
            ORDER BY prc_date DESC 
            LIMIT 10
        `;
        console.log('📊 Available dates in frs9_imp_ca_result_h:', resultDates);

    } catch (error) {
        console.error('❌ Error checking dates:', error);
    } finally {
        await sql.end();
    }
}

checkAvailableDates();
