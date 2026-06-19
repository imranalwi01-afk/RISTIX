const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:postgres@10.8.0.2:5433/FRS9PRO'
});

async function run() {
  try {
    await client.connect();
    
    console.log("Querying B0018, B0019 (PD Methods and Population Types)...");
    const res = await client.query(`
        SELECT paramcode, value1, value2, paramdesc 
        FROM frs9_param_commond 
        WHERE paramcode IN ('B0018', 'B0019', 'B0022', 'B0023')
    `);
    console.table(res.rows);

  } catch (err) {
    console.error("Error executing queries:", err.message);
  } finally {
    await client.end();
  }
}

run();
