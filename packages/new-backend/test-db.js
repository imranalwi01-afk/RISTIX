import pg from 'pg';
const pool = new pg.Pool({ connectionString: 'postgresql://postgres:postgres@172.25.0.25:5432/ifrspro_platform_admin' });
pool.query(`
  SELECT table_schema, table_name 
  FROM information_schema.columns 
  WHERE column_name = 'prc_date'
`).then(async res => {
  const tables = res.rows;
  console.log(`Checking ${tables.length} tables in ifrspro_platform_admin for 2026-05...`);
  for (const {table_schema, table_name} of tables) {
    try {
      const { rows } = await pool.query(`SELECT COUNT(*) as count FROM ${table_schema}.${table_name} WHERE CAST(prc_date AS TEXT) LIKE '2026-05%'`);
      if (rows[0].count > 0) {
        console.log(`Table ${table_schema}.${table_name} has ${rows[0].count} records for May 2026`);
      }
    } catch (e) {
      // Ignore
    }
  }
  pool.end();
}).catch(err => { console.error(err); pool.end(); });
