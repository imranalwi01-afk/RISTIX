import postgres from 'postgres';
const sql = postgres('postgresql://postgres:postgres@172.25.0.25:5432/FRS9PRO');

async function check() {
  const data = await sql`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_name = 'vw_frs9_pd_structure_yearly'
  `;
  console.log("vw_frs9_pd_structure_yearly columns:", data.map(r => r.column_name).join(", "));
  process.exit(0);
}
check().catch(e => { console.error(e); process.exit(1); });
