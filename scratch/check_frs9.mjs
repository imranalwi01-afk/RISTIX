import postgres from 'postgres';
const sql = postgres('postgresql://postgres:postgres@host.docker.internal:5432/FRS9PRO');
sql`SELECT * FROM frs9_imp_ca_pd_config LIMIT 5`.then(res => { console.log('FRS9PRO:', res); process.exit(0); }).catch(err => { console.error('Error FRS9PRO:', err.message); process.exit(1); });
