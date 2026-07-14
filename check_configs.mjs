import postgres from 'postgres';
const sql = postgres('postgresql://postgres:postgres@172.25.0.25:5432/FRS9PRO');

async function check() {
  const data = await sql`
    SELECT pkid, pd_model_name FROM frs9_imp_ca_pd_config
  `;
  console.log("frs9_imp_ca_pd_config:", data);
  process.exit(0);
}
check().catch(e => { console.error(e); process.exit(1); });
