const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:postgres@10.8.0.2:5433/FRS9PRO'
});

async function run() {
  try {
    await client.connect();
    
    const tables = [
      'frs9_imp_ca_lgd_config',
      'frs9_imp_ca_lgd_d',
      'frs9_imp_ca_lgd_data',
      'frs9_imp_ca_lgd_h',
      'frs9_imp_ca_lgd_rec_d',
      'frs9_imp_ca_result_d',
      'frs9_imp_ca_result_h',
      'frs9_imp_ca_ead_config'
    ];

    for (const table of tables) {
      console.log(`\nQuerying columns for ${table}...`);
      const res = await client.query(`
          SELECT column_name, data_type 
          FROM information_schema.columns 
          WHERE table_name = '${table}'
      `);
      console.log(res.rows.map(r => r.column_name).join(', '));
    }

  } catch (err) {
    console.error("Error executing queries:", err.message);
  } finally {
    await client.end();
  }
}

run();
