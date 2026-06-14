const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.LEGACY_DATABASE_URL // FIXED TO USE LEGACY DB
});

async function run() {
  try {
    await client.connect();
    
    // Check data
    const res = await client.query(`
      SELECT * FROM public.frs9_r_pd_afl ORDER BY id DESC LIMIT 5;
    `);

    console.log("Data in LEGACY DB frs9_r_pd_afl:");
    console.table(res.rows);
  } catch (err) {
    console.error("Error querying table in LEGACY DB:", err);
  } finally {
    await client.end();
  }
}

run();
