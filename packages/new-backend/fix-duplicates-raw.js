import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: 'postgresql://postgres:postgres@172.25.0.25:5432/ifrspro_tenant_iaf',
});

async function main() {
  try {
    const res = await pool.query(`
      SELECT table_schema, table_name
      FROM information_schema.tables 
      WHERE table_name ILIKE '%perm%'
    `);
    console.log(JSON.stringify(res.rows, null, 2));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

main();
