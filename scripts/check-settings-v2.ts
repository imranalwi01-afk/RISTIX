import { legacyDb as db } from './packages/new-backend/src/config';
import { sql } from 'drizzle-orm';

async function checkBusinessSettings() {
    try {
        const query = sql`SELECT param_code, param_value, value1, paramdesc FROM frs9_param_commond WHERE param_code IN ('B0002', 'B0003')`;
        const result = await db.execute(query);
        
        // result should be an array of rows
        console.log('--- Database Results ---');
        console.log(JSON.stringify(result, null, 2));
    } catch (err) {
        console.error('Error executing query:', err);
    }
    process.exit(0);
}

checkBusinessSettings();
