const postgres = require('postgres');
async function run() {
    const sql = postgres('postgresql://postgres:postgres@172.25.0.25:5432/ifrspro_platform_admin');
    const result = await sql`SELECT * FROM platform_admin.settings WHERE key = 'smtp'`;
    console.log(JSON.stringify(result, null, 2));
    process.exit(0);
}
run();
