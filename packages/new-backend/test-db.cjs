require('dotenv').config({ path: '../../.env' });
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.LEGACY_DATABASE_URL });
pool.query('SELECT DISTINCT prc_date FROM public.frs9_ecl_summary ORDER BY prc_date DESC LIMIT 5')
  .then(res => { console.log(res.rows); pool.end(); })
  .catch(err => { console.error(err); pool.end(); });
