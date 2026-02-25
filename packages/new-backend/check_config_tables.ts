
import { legacyDb } from './src/config/database';
import { sql } from 'drizzle-orm';

async function checkConfigTables() {
    console.log('🔍 Checking Config Tables in Legacy DB (FRS9PRO)...');
    
    try {
        // Check PD Config
        const pdResult = await legacyDb.execute(sql`
            SELECT count(*) as count FROM "FRS9_IMP_CA_PD_CONFIG"
        `);
        console.log(`✅ PD Config Count: ${pdResult[0].count}`);

        // Check LGD Config
        const lgdResult = await legacyDb.execute(sql`
            SELECT count(*) as count FROM "FRS9_IMP_CA_LGD_CONFIG"
        `);
        console.log(`✅ LGD Config Count: ${lgdResult[0].count}`);

    } catch (error) {
        console.error('❌ Error checking tables:', error);
    } finally {
        process.exit(0);
    }
}

checkConfigTables();
