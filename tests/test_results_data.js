import postgres from 'postgres';

async function testResultsData() {
    console.log('=== Test Results Data ===');
    const sql = postgres('postgresql://postgres:postgres@172.25.0.25:5432/FRS9PRO', { max: 1 });
    
    try {
        // Test the exact same query as service
        const processDate = '2026-01-26';
        console.log(`🔍 Testing results for date: ${processDate}`);
        
        const results = await sql`
            SELECT 
                account_id,
                account_number,
                facility_number,
                cif_number,
                outstanding,
                ecl_amount,
                ecl_final,
                stage,
                currency,
                bucket_group,
                internal_rating_code,
                lgd,
                prc_date
            FROM frs9_imp_ca_result_h 
            WHERE date(prc_date) = ${processDate}
            LIMIT 100
        `;
        
        console.log(`📊 Found ${results.length} results`);
        console.log('📋 Sample data:', results.slice(0, 3));

        // Format as expected by frontend
        const formatted = results.map((r) => ({
            accountId: r.account_id,
            accountNumber: r.account_number || r.facility_number || r.account_id?.toString(),
            facilityNumber: r.facility_number,
            cifNumber: r.cif_number,
            outstanding: Number(r.outstanding || 0),
            eclAmount: Number(r.ecl_amount || 0),
            eclFinal: Number(r.ecl_final || 0),
            stage: r.stage,
            currency: r.currency || "IDR",
            bucketGroup: r.bucket_group,
            internalRatingCode: r.internal_rating_code,
            pd: 0,
            lgd: r.lgd || 0,
            year: r.prc_date ? new Date(r.prc_date).getFullYear() : 0,
        }));
        
        console.log('🎯 Formatted for frontend:', formatted.slice(0, 2));

    } catch (error) {
        console.error('❌ Error testing results:', error);
    } finally {
        await sql.end();
    }
}

testResultsData();
