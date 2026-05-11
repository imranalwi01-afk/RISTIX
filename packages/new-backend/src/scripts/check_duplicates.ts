
import { legacyDb } from '../config/database';
import { sql } from 'drizzle-orm';

async function checkDuplicates() {
    try {
        const result = await legacyDb.execute(sql`
            SELECT account_id, COUNT(*) 
            FROM frs9_imp_ia_header 
            GROUP BY account_id 
            HAVING COUNT(*) > 1;
        `);
        console.log("Duplicate Account IDs in Header:");
        console.log(JSON.stringify(result, null, 2));

        const result2 = await legacyDb.execute(sql`
            SELECT ia_id, COUNT(*) 
            FROM frs9_imp_ia_header 
            GROUP BY ia_id 
            HAVING COUNT(*) > 1;
        `);
        console.log("\nDuplicate IA IDs in Header:");
        console.log(JSON.stringify(result2, null, 2));

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

checkDuplicates();
