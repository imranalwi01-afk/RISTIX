const postgres = require('postgres');

async function run() {
  const sql = postgres('postgresql://postgres:postgres@10.8.0.2:5433/ifrspro_platform_admin');
  try {
    const result = await sql`SELECT value FROM platform_admin.settings WHERE key = 'smtp'`;
    console.log(JSON.stringify(result, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await sql.end();
  }
}

run();
