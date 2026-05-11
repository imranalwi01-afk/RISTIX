
import { legacyDb } from '../packages/new-backend/src/config/database';
import { sql } from 'drizzle-orm';

async function checkIndices() {
    try {
        const result = await legacyDb.execute(sql`
            SELECT indexname, indexdef 
            FROM pg_indexes 
            WHERE tablename IN ('frs9_imp_ia_header', 'frs9_imp_ia_result_d', 'frs9_imp_ia_detail', 'frs9_imp_ia_rr')
        `);
        console.log(JSON.stringify(result, null, 2));
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

checkIndices();
