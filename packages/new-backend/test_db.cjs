const postgres = require('postgres');
const sql = postgres('postgresql://postgres:postgres@localhost:5432/FRS9PRO');

async function run() {
  try {
    const rawData = await sql`SELECT count(*), max(prc_date) FROM public.frs9_imp_ca_result_d WHERE prc_date <= '2021-12-31'`;
    console.log('Total Rows with prc_date <= 2021-12-31:', rawData);

    const withConfig = await sql`SELECT count(*), max(prc_date) FROM public.frs9_imp_ca_result_d WHERE prc_date <= '2021-12-31' AND pd_config_id = 1`;
    console.log('Total Rows with pd_config_id = 1:', withConfig);

    const configValues = await sql`SELECT pd_config_id, count(*) FROM public.frs9_imp_ca_result_d GROUP BY pd_config_id`;
    console.log('Available pd_config_id:', configValues);
  } catch(e) {
    console.error(e);
  }
  process.exit(0);
}
run();
