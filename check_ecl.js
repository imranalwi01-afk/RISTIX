import postgres from 'postgres';
const sql = postgres(process.env.LEGACY_DATABASE_URL || 'postgresql://postgres:postgres@host.docker.internal:15432/FRS9PRO');

async function check() {
  const result = await sql`SELECT SUM(CAST(outstanding AS DECIMAL)) as total_os, SUM(CAST(ecl_final_amt AS DECIMAL)) as total_ecl FROM public.frs9_ecl_summary WHERE prc_date = '2023-12-31'`;
  console.log('Total sums for 2023-12-31:', result[0]);
  process.exit(0);
}
check().catch(console.error);
