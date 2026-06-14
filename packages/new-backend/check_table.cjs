const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function check() {
  try {
    await client.connect();
    const res = await client.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'frs9_r_pd_afl';`);
    if (res.rows.length > 0) {
      console.log('Tabel frs9_r_pd_afl ditemukan! Berikut struktur kolomnya:');
      console.table(res.rows);
    } else {
      console.log('Tabel TIDAK ditemukan.');
    }
  } catch (error) {
    console.error(error);
  } finally {
    await client.end();
  }
}

check();
