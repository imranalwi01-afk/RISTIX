const { Client } = require('pg');

async function run() {
  const client = new Client({
    connectionString: 'postgresql://postgres:postgres@172.25.0.25:5432/FRS9PRO'
  });
  await client.connect();
  const res = await client.query(`
    SELECT prc_date, segment_id, stage, SUM(outstanding) as os, SUM(ecl_final_amt) as ecl 
    FROM public.frs9_ecl_summary 
    WHERE prc_date = '2026-05-31' 
    GROUP BY prc_date, segment_id, stage
  `);
  console.log('ECL Summary 2026-05-31:');
  console.table(res.rows);

  const res2 = await client.query(`
    SELECT COUNT(*) FROM public.frs9_ecl_summary
  `);
  console.log('Total rows in ecl_summary:', res2.rows);

  const res3 = await client.query(`
    SELECT prc_date, COUNT(*) FROM public.frs9_ecl_summary GROUP BY prc_date ORDER BY prc_date DESC LIMIT 5
  `);
  console.log('Available dates in ecl_summary:', res3.rows);

  await client.end();
}
run();
