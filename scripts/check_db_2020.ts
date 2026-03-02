import { Client } from 'pg';
import * as fs from 'fs';

async function main() {
    const client = new Client({
        host: '10.8.0.2',
        port: 5433,
        user: 'postgres',
        password: 'postgres',
        database: 'FRS9PRO'
    });

    try {
        await client.connect();
        
        const res1 = await client.query(`SELECT count(*) as count FROM public.frs9_master_account WHERE prc_date = '2020-12-31'`);
        const res2 = await client.query(`SELECT count(*) as count FROM public.frs9_imp_ca_ead_paym_avg WHERE prc_date = '2020-12-31'`);
        const dates1 = await client.query(`SELECT DISTINCT TO_CHAR(prc_date, 'YYYY-MM-DD') as dt FROM public.frs9_master_account ORDER BY dt DESC LIMIT 5`);
        const dates2 = await client.query(`SELECT DISTINCT TO_CHAR(prc_date, 'YYYY-MM-DD') as dt FROM public.frs9_imp_ca_ead_paym_avg ORDER BY dt DESC LIMIT 5`);
        
        fs.writeFileSync('db_output.json', JSON.stringify({
            master_account_2020_count: res1.rows[0].count,
            ead_paym_avg_2020_count: res2.rows[0].count,
            master_account_dates: dates1.rows.map(r => r.dt),
            ead_paym_avg_dates: dates2.rows.map(r => r.dt)
        }, null, 2));

    } catch (e) {
        console.error(e);
    } finally {
        await client.end();
    }
}

main();
