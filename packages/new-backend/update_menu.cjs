require('dotenv').config({path: '../../ops/local/backend.env'});
const postgres = require('postgres');
const sql = postgres({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 1
});
async function run() {
  try {
    await sql`UPDATE menu.menu_items SET is_visible = false WHERE path = '/banking/collective/fl-scalar'`;
    console.log('Successfully hidden FL Scalar menu.');
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}
run();
