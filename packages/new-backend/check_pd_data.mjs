import postgres from 'postgres';
const sql = postgres('postgresql://postgres:postgres@172.25.0.25:5432/FRS9PRO');

async function check() {
  const data = await sql`
    SELECT prc_date, pd_config_id, pd_model_id, scenario_id, COUNT(*) as c
    FROM vw_frs9_pd_structure_yearly
    WHERE prc_date = '2025-12-31' AND pd_config_id = 1
    GROUP BY prc_date, pd_config_id, pd_model_id, scenario_id
    LIMIT 20
  `;
  console.log("vw_frs9_pd_structure_yearly models:", data);
  process.exit(0);
}
check().catch(e => { console.error(e); process.exit(1); });
