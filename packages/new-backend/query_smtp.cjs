const postgres = require('postgres');
async function run() {
    const sql = postgres('postgresql://postgres:postgres@172.25.0.25:5432/ifrspro_platform_admin');
    const result = await sql`SELECT code, subject FROM platform_admin.email_templates`;
    console.log(JSON.stringify(result, null, 2));
    process.exit(0);
}
run();
