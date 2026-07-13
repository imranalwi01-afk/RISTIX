const postgres = require('postgres');
const sql = postgres('postgresql://postgres:postgres@localhost:5432/FRS9PRO');

async function run() {
  try {
    const data = await sql`
      SELECT COUNT(*) as count 
      FROM public.vw_frs9_pd_migration_detail
      WHERE prc_date = '2025-12-31' AND pd_config_id = 1;
    `;
    console.log("Count for 2025-12-31 and pd_config_id=1:", data[0].count);
    
    const sample = await sql`
      SELECT *
      FROM public.vw_frs9_pd_migration_detail
      WHERE prc_date = '2025-12-31'
      LIMIT 1;
    `;
    console.log("Sample:", sample);
  } catch(e) {
    console.error(e);
  }
  process.exit(0);
}
run();
