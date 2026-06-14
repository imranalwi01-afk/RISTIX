const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function checkData() {
  try {
    await client.connect();
    const res = await client.query(`SELECT id, model_name, r_squared, mape, model_status, created_date FROM frs9_r_pd_afl ORDER BY id DESC LIMIT 5;`);
    if (res.rows.length > 0) {
      console.log('Berikut data terbaru di dalam tabel frs9_r_pd_afl:');
      console.table(res.rows);
    } else {
      console.log('Tabel frs9_r_pd_afl masih KOSONG. Belum ada data yang tersubmit.');
    }
  } catch (error) {
    console.error(error);
  } finally {
    await client.end();
  }
}

checkData();
