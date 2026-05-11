
const { drizzle } = require('drizzle-orm/node-postgres');
const { Pool } = require('pg');
require('dotenv').config({ path: '../../.env' }); // Adjusted path for package structure

async function checkAccount() {
    const pool = new Pool({
        connectionString: process.env.LEGACY_DATABASE_URL
    });
    const db = drizzle(pool);
    
    const res = await pool.query("SELECT account_number, outstanding, carrying_amt, accrued_interest, prc_date FROM frs9_master_account WHERE account_number = '4301110004318' ORDER BY prc_date DESC LIMIT 1");
    console.log(JSON.stringify(res.rows, null, 2));
    await pool.end();
}

checkAccount();
