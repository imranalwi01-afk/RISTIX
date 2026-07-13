const { Client } = require('pg');

const tenantClient = new Client({
  connectionString: 'postgresql://postgres:postgres@172.25.0.25:5432/ifrspro_tenant_iaf'
});

async function run() {
  try {
    await tenantClient.connect();
    const res = await tenantClient.query(`
      SELECT table_schema, table_name 
      FROM information_schema.tables 
      WHERE table_schema NOT IN ('information_schema', 'pg_catalog')
    `);
    console.log('Tables in tenant DB:', res.rows);
    await tenantClient.end();
  } catch(e) {
    console.error(e);
  }
}
run();
