const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:postgres@172.25.0.25:5432/FRS9PRO'
});

async function run() {
  try {
    await client.connect();
    
    console.log("Querying Business Settings for PD and LGD Methods...");
    const res = await client.query(`
        SELECT param_code, param_seq, value1, value2, paramdesc 
        FROM frs9_param_commond 
        WHERE param_code IN ('B0018', 'B0019', 'B0022', 'B0023')
    `);
    console.table(res.rows);
  } catch (err) {
    console.error("Error executing queries:", err.message);
  } finally {
    await client.end();
  }
}

run();
