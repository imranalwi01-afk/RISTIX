const { Client } = require('pg');

async function run() {
  const client = new Client({
    connectionString: 'postgresql://postgres:postgres@10.8.0.2:5433/FRS9PRO'
  });
  await client.connect();
  const res = await client.query(`
    SELECT prc_date, segment_id, stage, SUM(outstanding) as total_os, SUM(ecl_final_amt) as total_ecl 
    FROM public.frs9_ecl_summary 
    WHERE segment_id = 2
    GROUP BY prc_date, segment_id, stage
    ORDER BY prc_date DESC
  `);
  console.log('Segment 2 Data:');
  console.table(res.rows);

  await client.end();
}
run();
