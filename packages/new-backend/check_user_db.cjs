const { Client } = require('pg');

const tenantClient = new Client({
  connectionString: 'postgresql://postgres:postgres@10.8.0.2:5433/ifrspro_tenant_iaf'
});

async function run() {
  try {
    await tenantClient.connect();
    const res = await tenantClient.query("SELECT * FROM core.users WHERE email = 'superadmin@iaf.co.id'");
    console.log('Core User:', res.rows);
    await tenantClient.end();
  } catch(e) {
    console.error(e);
  }
}
run();
