
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
        console.log('Checking roles...');
        const roles = await sql`SELECT * FROM core.roles WHERE role_code LIKE '%BANK_CRO%' OR role_name LIKE '%CRO%'`;
        console.log('Roles found:', roles);

        if (roles.length > 0) {
            const roleId = roles[0].id;
            console.log(`Checking menu access for role ID: ${roleId}`);

            const access = await sql`
                SELECT rma.*, mi.menu_key, mi.url 
                FROM core.role_menu_access rma
                JOIN core.menu_items mi ON rma.menu_item_id = mi.id
                WHERE rma.role_id = ${roleId}
            `;
            console.log('Menu Access:', access);
        } else {
            console.log('No CRO role found!');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sql.end();
    }
}

main();
