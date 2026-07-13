const { Client } = require('pg');

async function run() {
  const client = new Client({
    connectionString: 'postgresql://postgres:postgres@172.25.0.25:5432/FRS9PRO'
  });
  await client.connect();
  const res = await client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'frs9_ecl_summary';");
  console.log(res.rows);
  await client.end();
}
run();
