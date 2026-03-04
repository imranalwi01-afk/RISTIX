
const postgres = require('postgres');
const sql = postgres('postgres://postgres:postgres@10.8.0.2:5433/ifrs9');

async function check() {
  try {
    const total = await sql`SELECT count(*) FROM public.frs9_imp_ca_result_h`;
    console.log('Total results in ifrs9 database:', total[0].count);
    
    const sample = await sql`SELECT prc_date, count(*) FROM public.frs9_imp_ca_result_h GROUP BY prc_date`;
    console.log('Sample data:', JSON.stringify(sample, null, 2));

  } catch (err) {
    if (err.message.includes('does not exist')) {
        console.log('Table frs9_imp_ca_result_h does not exist in ifrs9 database');
    } else {
        console.error(err);
    }
  } finally {
    process.exit();
  }
}

check();
