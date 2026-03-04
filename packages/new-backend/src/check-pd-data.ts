import { legacyDb } from './config/index.js';
import { frs9ImpCaPdStructure, frs9ImpCaResultD } from './db/schema/index.js';
import { sql, eq, and } from 'drizzle-orm';

async function checkData() {
    console.log('🔍 Checking Lifetime PD Tables...');
    
    try {
        // Find max prc_date in structure
        const maxDateRes = await legacyDb.select({ max_date: sql`max(prc_date)` }).from(frs9ImpCaPdStructure);
        console.log('📅 Max Date in PD Structure (Charts):', maxDateRes[0]?.max_date);

        // Find max prc_date in result_d
        const maxDateResD = await legacyDb.select({ max_date: sql`max(prc_date)` }).from(frs9ImpCaResultD);
        console.log('📅 Max Date in Result D (Account Details):', maxDateResD[0]?.max_date);

        const dates = ['2023-11-30', '2023-12-31'];

        for (const date of dates) {
            console.log(`--- Checking Date: ${date} ---`);
            
            const structCount = await legacyDb.select({ count: sql`count(*)`.mapWith(Number) })
                .from(frs9ImpCaPdStructure)
                .where(eq(frs9ImpCaPdStructure.prcDate, date));
            console.log(`📈 PD Structure Count: ${structCount[0]?.count}`);

            const resDCount = await legacyDb.select({ count: sql`count(*)`.mapWith(Number) })
                .from(frs9ImpCaResultD)
                .where(eq(frs9ImpCaResultD.prcDate, date));
            console.log(`📈 Result D Count: ${resDCount[0]?.count}`);

            if (structCount[0]?.count > 0) {
                const methods = await legacyDb.select({ method: frs9ImpCaPdStructure.pdMethod })
                    .from(frs9ImpCaPdStructure)
                    .where(eq(frs9ImpCaPdStructure.prcDate, date))
                    .groupBy(frs9ImpCaPdStructure.pdMethod);
                console.log(`📊 Distinct Methods in Structure: ${methods.map(m => m.method).join(', ')}`);
                
                const configs = await legacyDb.select({ config: frs9ImpCaPdStructure.pdConfigId })
                    .from(frs9ImpCaPdStructure)
                    .where(eq(frs9ImpCaPdStructure.prcDate, date))
                    .groupBy(frs9ImpCaPdStructure.pdConfigId);
                console.log(`⚙️ Distinct Configs in Structure: ${configs.map(c => c.config).join(', ')}`);
            }
        }

    } catch (error) {
        console.error('❌ Error checking database:', error);
    } finally {
        process.exit(0);
    }
}

checkData();
