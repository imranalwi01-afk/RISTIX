const postgres = require('postgres');
const sql = postgres('postgresql://postgres:postgres@localhost:5432/FRS9PRO');

async function run() {
  try {
    const data = await sql`
      SELECT COUNT(*) as count 
      FROM public.vw_frs9_pd_migration_detail
      WHERE prc_date = '2025-12-31';
    `;
    console.log("Count for 2025-12-31:", data[0].count);
    
    const dates = await sql`
      SELECT prc_date, COUNT(*) as count 
      FROM public.vw_frs9_pd_migration_detail
      GROUP BY prc_date
      ORDER BY prc_date DESC;
    `;
    console.log("Available dates:", dates);
  } catch(e) {
    console.error(e);
  }
  process.exit(0);
}
run();
