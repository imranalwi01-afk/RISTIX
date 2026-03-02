import { Client } from 'pg';

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
        
        console.log("Checking ead_config_id for 2020-12-31...");
        const res1 = await client.query(`SELECT ead_config_id, COUNT(*) as count FROM public.frs9_master_account WHERE prc_date = '2020-12-31' GROUP BY ead_config_id`);
        console.log('Account distribution by ead_config_id:', res1.rows);

        const res2 = await client.query(`SELECT segment_id, COUNT(*) as count FROM public.frs9_imp_ca_ead_paym_avg WHERE prc_date = '2020-12-31' GROUP BY segment_id`);
        console.log('Payment Average distribution by segment_id:', res2.rows);
        
    } catch (e) {
        console.error("Error connecting or querying:", e);
    } finally {
        await client.end();
    }
}

main();
