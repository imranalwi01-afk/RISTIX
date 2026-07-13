const postgres = require('postgres');
const sql = postgres('postgresql://postgres:postgres@localhost:5432/FRS9PRO');

async function run() {
  try {
    const configData = await sql`SELECT pkid, pd_model_name, active_flag FROM public.frs9_imp_ca_pd_config`;
    console.log('PD Configurations:', configData);
  } catch(e) {
    console.error(e);
  }
  process.exit(0);
}
run();
