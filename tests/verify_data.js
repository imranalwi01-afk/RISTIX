const { Client } = require('pg');
const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'FRS9PRO',
  password: 'postgres',
  port: 5432,
});

async function verify() {
  try {
    await client.connect();
    console.log('Connected to FRS9PRO');
    const res = await client.query(`
      SELECT 
        prc_date, 
        COUNT(*) as count,
        SUM(CAST(outstanding AS DECIMAL)) as total_os, 
        SUM(CAST(ecl_final_amt AS DECIMAL)) as total_ecl_final,
        SUM(CAST(ecl_overlay_amt AS DECIMAL)) as total_overlay,
        SUM(CAST(ecl_ia_onbs_amt AS DECIMAL)) as total_ia
      FROM public.frs9_master_account 
      GROUP BY prc_date 
      ORDER BY prc_date DESC 
      LIMIT 10
    `);
    console.log(JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error('Error connecting or querying:', err);
  } finally {
    await client.end();
  }
}

verify();
