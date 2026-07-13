const postgres = require('postgres');
const sql = postgres('postgresql://postgres:postgres@localhost:5432/FRS9PRO');

async function run() {
  try {
    const columns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'vw_frs9_pd_migration_detail';
    `;
    console.log(columns);
  } catch(e) {
    console.error(e);
  }
  process.exit(0);
}
run();
