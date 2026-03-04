import { legacyDb } from './src/config';
import { sql } from 'drizzle-orm';

async function main() {
    try {
        const res = await legacyDb.execute(sql.raw(`
            SELECT ead_config_id, COUNT(*) as c
            FROM public.frs9_master_account 
            WHERE prc_date = '2020-12-31'
            GROUP BY ead_config_id
        `));
        console.log("Account distribution by ead_config_id:", res);

        const res2 = await legacyDb.execute(sql.raw(`
            SELECT segment_id, COUNT(*) as c
            FROM public.frs9_imp_ca_ead_paym_avg 
            WHERE prc_date = '2020-12-31'
            GROUP BY segment_id
        `));
        console.log("Payment Average distribution by segment_id:", res2);
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
}

main();
