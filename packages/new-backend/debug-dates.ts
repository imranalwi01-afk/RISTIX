
import { db, legacyDb } from './src/config/database';
import { sql } from 'drizzle-orm';
import { frs9MasterAccount } from './src/db/schema';

async function debugDates() {
    console.log('🔍 Debugging Dates...');
    
    // 1. Get Max Date via Drizzle
    const maxDate = await legacyDb
        .select({ maxDate: sql<string>`max(${frs9MasterAccount.prcDate})` })
        .from(frs9MasterAccount);
    
    console.log(`📅 Max PRC_DATE (Drizzle): ${maxDate[0].maxDate}`);

    // 2. Get Count for Max Date
    if (maxDate[0].maxDate) {
        const count = await legacyDb
            .select({ count: sql<number>`count(*)` })
            .from(frs9MasterAccount)
            .where(sql`${frs9MasterAccount.prcDate} = ${maxDate[0].maxDate}`);
        console.log(`📊 Rows for Max Date: ${count[0].count}`);
    }

    // 3. Raw Query Check
    const rawResult = await db.execute(sql`SELECT max(prc_date) as max_date FROM public.frs9_master_account`);
    console.log(`📅 Max PRC_DATE (Raw): ${rawResult[0].max_date}`);

    process.exit(0);
}

debugDates();
