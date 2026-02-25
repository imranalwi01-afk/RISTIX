
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

async function checkDates() {
  const sql = postgres('postgresql://postgres:postgres@10.8.0.2:5433/FRS9PRO');
  const db = drizzle(sql);

  try {
    const result = await sql`
      SELECT DISTINCT prc_date 
      FROM public.frs9_master_account 
      ORDER BY prc_date DESC 
      LIMIT 10
    `;
    console.log(JSON.stringify(result, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

checkDates();
