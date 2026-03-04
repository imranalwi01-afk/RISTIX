import { legacyDb } from './config/index.js';
import { frs9ImpCaEadPaymAvg } from './db/schema/index.js';
import { sql, eq } from 'drizzle-orm';

async function checkEadData() {
    console.log('🔍 Checking frs9_imp_ca_ead_paym_avg table...');

    try {
        // Check distinct prc_date
        const dates = await legacyDb.execute(sql`SELECT DISTINCT to_char(prc_date, 'YYYY-MM-DD') as prc_date FROM frs9_imp_ca_ead_paym_avg ORDER BY prc_date DESC LIMIT 20`);
        console.log('📅 Top 20 Processing Dates:', JSON.stringify(dates.map((r: any) => r.prc_date)));

        // Check distinct segment_id
        const segments = await legacyDb.select({
            id: frs9ImpCaEadPaymAvg.segmentId
        }).from(frs9ImpCaEadPaymAvg).groupBy(frs9ImpCaEadPaymAvg.segmentId);
        console.log('📦 Distinct Segment IDs:', segments.map(s => s.id));

        // Find max prc_date
        const maxDateRes = await legacyDb.select({ max_date: sql<string>`max(prc_date)` }).from(frs9ImpCaEadPaymAvg);
        const maxDate = maxDateRes[0]?.max_date;
        console.log('📅 Max Processing Date:', maxDate);

        if (maxDate) {
            // Check count for max date and segment 1
            const countRes = await legacyDb.select({ count: sql`count(*)`.mapWith(Number) })
                .from(frs9ImpCaEadPaymAvg)
                .where(eq(frs9ImpCaEadPaymAvg.prcDate, maxDate));
            console.log(`📈 Total record count for ${maxDate}:`, countRes[0]?.count);

            // Check segments for max date
            const segmentsForMaxDate = await legacyDb.select({
                id: frs9ImpCaEadPaymAvg.segmentId
            }).from(frs9ImpCaEadPaymAvg).where(eq(frs9ImpCaEadPaymAvg.prcDate, maxDate)).groupBy(frs9ImpCaEadPaymAvg.segmentId);
            console.log(`📦 Segment IDs for ${maxDate}:`, segmentsForMaxDate.map(s => s.id));
        }

    } catch (error) {
        console.error('❌ Error checking EAD data:', error);
    } finally {
        process.exit(0);
    }
}

checkEadData();
