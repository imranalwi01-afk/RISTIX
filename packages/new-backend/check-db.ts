
import { legacyDb } from './src/config';
import { frs9ParamProduct } from './src/db/schema';
import { sql } from 'drizzle-orm';

async function checkRows() {
    try {
        console.log('📡 Checking frs9_param_product rows...');
        const result = await legacyDb.select({ count: sql`count(*)` }).from(frs9ParamProduct);
        console.log('📊 Count:', result[0].count);
        
        const rows = await legacyDb.select().from(frs9ParamProduct).limit(5);
        console.log('📝 First 5 rows:', JSON.stringify(rows, null, 2));

        const kpr = await legacyDb.select().from(frs9ParamProduct).where(sql`prd_code = 'KPR001'`);
        console.log('🔍 Search for KPR001:', JSON.stringify(kpr, null, 2));
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        process.exit(0);
    }
}

checkRows();
