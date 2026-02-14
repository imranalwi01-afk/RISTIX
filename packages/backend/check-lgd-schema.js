
const { Pool } = require('pg');
require('dotenv').config();

async function checkSchema() {
  const pool = new Pool({
    host: process.env.LEGACY_DB_HOST || '10.8.0.2',
    port: parseInt(process.env.LEGACY_DB_PORT || '5433'),
    user: process.env.LEGACY_DB_USER || 'postgres',
    password: process.env.LEGACY_DB_PASSWORD || 'postgres',
    database: process.env.LEGACY_DB_NAME || 'FRS9PRO',
  });

  try {
    const tables = [
      'frs9_master_account',
      'frs9_account_id',
      'frs9_imp_ca_lgd_data',
      'frs9_imp_ca_lgd_rec_d',
      'frs9_imp_ca_lgd_h',
      'frs9_imp_ca_lgd_config'
    ];

    const fs = require('fs');
    let output = '';
    for (const table of tables) {
      output += `\n--- Schema for table: ${table} ---\n`;
      const res = await pool.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = '${table}' 
        AND table_schema = 'public'
        ORDER BY ordinal_position;
      `);
      output += res.rows.map(r => `${r.column_name}: ${r.data_type}`).join('\n') + '\n';
    }
    fs.writeFileSync('schema_output.txt', output);
    console.log('Schema written to schema_output.txt');

  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

checkSchema();
