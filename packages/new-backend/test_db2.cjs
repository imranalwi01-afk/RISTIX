const postgres = require('postgres');
const sql = postgres('postgresql://postgres:postgres@localhost:5432/FRS9PRO');

async function run() {
  try {
    const configValuesYearly = await sql`SELECT pd_config_id, count(*) FROM public.vw_frs9_pd_structure_yearly GROUP BY pd_config_id`;
    console.log('Available pd_config_id in yearly:', configValuesYearly);
  } catch(e) {
    console.error(e);
  }
  process.exit(0);
}
run();
