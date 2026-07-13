const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:postgres@172.25.0.25:5432/FRS9PRO'
});

async function run() {
  try {
    await client.connect();
    const res = await client.query(`SELECT id, model_name, data_file IS NOT NULL as has_file FROM frs9_r_pd_afl WHERE id IN (5, 6)`);
    console.log(JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}
run();
