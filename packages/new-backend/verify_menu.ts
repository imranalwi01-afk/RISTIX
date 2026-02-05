
import postgres from 'postgres';

const sql = postgres({
    host: 'localhost',
    port: 5432,
    database: 'ifrspro_tenant_iaf',
    username: 'postgres',
    password: 'postgres',
});

async function main() {
    try {
        console.log('Checking menu items...');
        const menuItems = await sql`SELECT id, menu_key, title, url FROM core.menu_items WHERE menu_key = 'dashboard'`;
        console.log('Dashboard menu item:', menuItems);

        console.log('Checking all menu items count...');
        const count = await sql`SELECT count(*) FROM core.menu_items`;
        console.log('Total menu items:', count);

        console.log('Checking role menu access count for all roles...');
        const accessCount = await sql`
            SELECT r.role_code, count(rma.id) as access_count
            FROM core.roles r
            LEFT JOIN core.role_menu_access rma ON r.id = rma.role_id
            GROUP BY r.role_code
        `;
        console.log('Access count by role:', accessCount);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sql.end();
    }
}

main();
