import { legacyDb } from './src/config';
import { sql } from 'drizzle-orm';

async function main() {
    console.log("Checking data for 2020-12-31...");
    try {
        const res1 = await legacyDb.execute(sql.raw(`SELECT count(*) as count FROM public.frs9_master_account WHERE prc_date = '2020-12-31'`));
        console.log('frs9_master_account:', (res1 as any[])[0]);

        const res2 = await legacyDb.execute(sql.raw(`SELECT count(*) as count FROM public.frs9_imp_ca_ead_paym_avg WHERE prc_date = '2020-12-31'`));
        console.log('frs9_imp_ca_ead_paym_avg:', (res2 as any[])[0]);
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
}

main();
