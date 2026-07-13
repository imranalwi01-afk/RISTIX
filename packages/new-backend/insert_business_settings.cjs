const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:postgres@172.25.0.25:5432/FRS9PRO'
});

async function run() {
  try {
    await client.connect();
    
    // Check if the tables use public or ifrs9 schema
    const schemaRes = await client.query(`
      SELECT table_schema FROM information_schema.tables WHERE table_name = 'frs9_param_commond' LIMIT 1;
    `);
    
    const schema = schemaRes.rows[0]?.table_schema || 'public';
    console.log(`Using schema: ${schema}`);

    // Clean existing details for these to be safe
    await client.query(`
      DELETE FROM ${schema}.frs9_param_commond WHERE param_code IN ('B0028', 'B0029', 'B0030');
    `);

    // Insert details
    await client.query(`
      INSERT INTO ${schema}.frs9_param_commond (param_code, param_seq, value1, value2, value3, paramdesc, createdby, createddate, createdhost) VALUES
      ('B0028', 1, 'CORE', 'Core Banking', '', 'Core Banking System', 'SYSTEM', NOW(), 'localhost'),
      ('B0028', 2, 'MANUAL', 'Manual Input', '', 'Manual Input', 'SYSTEM', NOW(), 'localhost'),
      ('B0028', 3, 'TREASURY', 'Treasury System', '', 'Treasury System', 'SYSTEM', NOW(), 'localhost'),
      ('B0029', 1, 'RETAIL', 'Retail Banking', '', 'Retail Products', 'SYSTEM', NOW(), 'localhost'),
      ('B0029', 2, 'CORPORATE', 'Corporate Banking', '', 'Corporate Products', 'SYSTEM', NOW(), 'localhost'),
      ('B0029', 3, 'SME', 'SME Banking', '', 'Small & Medium Enterprise', 'SYSTEM', NOW(), 'localhost'),
      ('B0030', 1, 'LOAN', 'Loan Product', '', 'Loan Product', 'SYSTEM', NOW(), 'localhost'),
      ('B0030', 2, 'MORTGAGE', 'Mortgage Product', '', 'Mortgage Product', 'SYSTEM', NOW(), 'localhost'),
      ('B0030', 3, 'CREDIT_CARD', 'Credit Card', '', 'Credit Card', 'SYSTEM', NOW(), 'localhost');
    `);

    console.log("Successfully inserted B0028, B0029, and B0030 values into the legacy DB!");
  } catch (err) {
    console.error("Error inserting data:", err);
  } finally {
    await client.end();
  }
}

run();
