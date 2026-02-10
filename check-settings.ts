import { legacyDb as db } from './packages/new-backend/src/config';
import { sql } from 'drizzle-orm';

async function checkBusinessSettings() {
    console.log('--- B0003 (Instrument Class) ---');
    const b0003 = await db.execute(sql`SELECT param_code, param_value, value1, paramdesc FROM frs9_param_commond WHERE param_code = 'B0003'`);
    console.log(JSON.stringify(b0003, null, 2));

    console.log('\n--- B0002 (Amortization) ---');
    const b0002 = await db.execute(sql`SELECT param_code, param_value, value1, paramdesc FROM frs9_param_commond WHERE param_code = 'B0002'`);
    console.log(JSON.stringify(b0002, null, 2));
    
    process.exit(0);
}

checkBusinessSettings().catch(err => {
    console.error(err);
    process.exit(1);
});
