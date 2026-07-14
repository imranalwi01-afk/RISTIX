const { Client } = require('pg');
async function test() {
  const client = new Client({
    connectionString: 'postgresql://postgres:postgres@host.docker.internal:5432/FRS9PRO'
  });
  await client.connect();
  const res = await client.query('SELECT * FROM public.frs9_imp_ca_pd_config LIMIT 5');
  console.log(res.rows);
  await client.end();
  process.exit(0);
}
test().catch(console.error);
