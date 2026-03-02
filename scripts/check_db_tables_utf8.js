
const postgres = require('postgres');
const fs = require('fs');
const sql = postgres('postgres://postgres:postgres@10.8.0.2:5433/ifrspro_tenant_iaf');

async function check() {
  try {
    const tables = await sql`
        SELECT table_schema, table_name 
        FROM information_schema.tables 
        WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
        ORDER BY table_schema, table_name
    `;
    let output = 'All tables found:\n';
    tables.forEach(t => {
        output += `- ${t.table_schema}.${t.table_name}\n`;
    });

    fs.writeFileSync('db_trace_tables_utf8.txt', output, 'utf8');
    console.log('Results written to db_trace_tables_utf8.txt');

  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

check();
