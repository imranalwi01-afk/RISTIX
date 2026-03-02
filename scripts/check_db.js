
const postgres = require('postgres');
const sql = postgres('postgres://postgres:postgres@10.8.0.2:5433/ifrspro_tenant_iaf');

async function check() {
  try {
    const tables = await sql`
        SELECT table_schema, table_name 
        FROM information_schema.tables 
        WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
        ORDER BY table_schema, table_name
    `;
    console.log('All tables found:');
    tables.forEach(t => {
        console.log(`- ${t.table_schema}.${t.table_name}`);
    });

  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

check();
