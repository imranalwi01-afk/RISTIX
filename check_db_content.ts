
import { Client } from 'pg';

const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'FRS9PRO',
  password: 'postgres',
  port: 5432,
});

async function check() {
  await client.connect();
  try {
    const resPD = await client.query('SELECT * FROM "FRS9_IMP_CA_PD_CONFIG"');
    console.log('PD Config Rows:', resPD.rows);
    
    const resLGD = await client.query('SELECT * FROM "FRS9_IMP_CA_LGD_CONFIG"');
    console.log('LGD Config Rows:', resLGD.rows);
  } catch (err) {
    console.error('Error querying tables:', err);
  } finally {
    await client.end();
  }
}

check();
