const { Client } = require('pg');

async function run() {
  const client = new Client({
    connectionString: 'postgresql://postgres:postgres@10.8.0.2:5433/FRS9PRO'
  });
  await client.connect();
  const res = await client.query(`
    SELECT segment_id, segment, prc_date, SUM(outstanding) as total_os, SUM(ecl_final_amt) as total_ecl 
    FROM public.frs9_ecl_summary 
    GROUP BY segment_id, segment, prc_date
    ORDER BY prc_date DESC, segment_id
    LIMIT 10
  `);
  console.log('Available segments:');
  console.table(res.rows);

  await client.end();
}
run();
