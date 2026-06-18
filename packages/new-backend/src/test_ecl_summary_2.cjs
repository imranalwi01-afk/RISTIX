const { Client } = require('pg');

async function run() {
  const client = new Client({
    connectionString: 'postgresql://postgres:postgres@10.8.0.2:5433/FRS9PRO'
  });
  await client.connect();
  const res = await client.query(`
    SELECT SUM(outstanding) as total_os, SUM(ecl_final_amt) as total_ecl 
    FROM public.frs9_ecl_summary 
    WHERE prc_date = '2023-12-31'
  `);
  console.log('2023-12-31 Totals:', res.rows[0]);

  const res2 = await client.query(`
    SELECT segment, SUM(outstanding) as total_os
    FROM public.frs9_ecl_summary 
    WHERE prc_date = '2023-12-31'
    GROUP BY segment
  `);
  console.log('2023-12-31 Segments:', res2.rows);

  await client.end();
}
run();
