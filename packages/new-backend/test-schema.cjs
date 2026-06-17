const { Client } = require('pg');

async function check() {
  const client = new Client({
    connectionString: 'postgresql://postgres:postgres@10.8.0.2:5433/FRS9PRO'
  });
  await client.connect();
  const res = await client.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'frs9_ecl_summary'
  `);
  console.log(JSON.stringify(res.rows, null, 2));
  await client.end();
}
check();
