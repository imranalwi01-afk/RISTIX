const postgres = require('postgres');
async function run() {
    const sql = postgres('postgresql://postgres:postgres@10.8.0.2:5433/ifrspro_platform_admin');
    const result = await sql`SELECT id, name, tenant_id FROM menu.menu_items LIMIT 5`;
    console.log(JSON.stringify(result, null, 2));
    process.exit(0);
}
run();
