import { legacyDb as db } from './packages/new-backend/src/config';
import { sql } from 'drizzle-orm';

async function checkColumnLengths() {
    try {
        const query = sql`
            SELECT column_name, character_maximum_length 
            FROM information_schema.columns 
            WHERE table_name = 'frs9_param_product' 
            AND column_name IN ('amortization_type', 'al_flag', 'prd_group', 'prd_type', 'data_source')
        `;
        const result = await db.execute(query);
        console.log('--- Column Lengths ---');
        console.log(JSON.stringify(result, null, 2));
    } catch (err) {
        console.error('Error:', err);
    }
    process.exit(0);
}

checkColumnLengths();
