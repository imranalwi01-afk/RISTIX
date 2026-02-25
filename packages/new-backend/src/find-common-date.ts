import { legacyDb } from './config/index.js';
import { frs9ImpCaPdStructure, frs9ImpCaResultD } from './db/schema/index.js';
import { sql, eq, and } from 'drizzle-orm';

async function findCommonDate() {
    console.log('🔍 Searching for common dates between PD Structure and Result D...');
    
    try {
        const pdDates = await legacyDb.execute(sql`SELECT DISTINCT to_char(prc_date, 'YYYY-MM-DD') as prc_date FROM frs9_imp_ca_pd_structure`);
        const resultDDates = await legacyDb.execute(sql`SELECT DISTINCT to_char(prc_date, 'YYYY-MM-DD') as prc_date FROM frs9_imp_ca_result_d`);
        
        const pdDateSet = new Set(pdDates.map((r: any) => r.prc_date));
        const resultDDateSet = new Set(resultDDates.map((r: any) => r.prc_date));
        
        const commonDates = [...pdDateSet].filter(date => resultDDateSet.has(date)).sort().reverse();
        
        console.log('📅 Common Dates found:', commonDates);
        
        if (commonDates.length > 0) {
            const bestDate = commonDates[0];
            console.log(`✅ Best common date (latest): ${bestDate}`);
            
            // Check config/method for this date
            const configs = await legacyDb.select({ config: frs9ImpCaPdStructure.pdConfigId, method: frs9ImpCaPdStructure.pdMethod })
                .from(frs9ImpCaPdStructure)
                .where(eq(frs9ImpCaPdStructure.prcDate, bestDate))
                .limit(1);
            console.log(`⚙️ Recommended Config: ${configs[0]?.config}, Method: ${configs[0]?.method}`);
        } else {
            console.log('❌ No common dates found.');
            console.log('PD Structure Dates:', [...pdDateSet].sort().reverse().slice(0, 5));
            console.log('Result D Dates:', [...resultDDateSet].sort().reverse().slice(0, 5));
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        process.exit(0);
    }
}

findCommonDate();
