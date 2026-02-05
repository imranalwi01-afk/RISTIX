import postgres from 'postgres';

export async function run(args: string[] = []) {
    const DB_HOST = process.env.DB_HOST || '10.8.0.2';
    const DB_PORT = process.env.DB_PORT || '5433';
    const DB_USER = process.env.DB_USER || 'postgres';
    const DB_PASSWORD = process.env.DB_PASSWORD || 'postgres';
    const DB_NAME = process.env.PLATFORM_DB_NAME || 'ifrspro_platform_admin';

    const url = `postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;
    const sql = postgres(url);

    try {
        console.log('--- Finding Admin User ---');
        const users = await sql`
            SELECT id, email, username, tenant_id, is_active, password_hash
            FROM core.users 
            WHERE email = 'admin@iaf.co.id' OR username = 'iaf_admin'
            LIMIT 5
        `;

        if (users.length === 0) {
            console.log('❌ No admin user found with that email/username.');
            console.log('Listing some users:');
            const someUsers = await sql`SELECT id, email, username FROM core.users LIMIT 10`;
            console.table(someUsers);
        } else {
            console.log('✅ Found admin user(s):');
            console.table(users);
        }

        console.log('\n--- Finding IAF Tenant ---');
        const tenants = await sql`
            SELECT id, code, name 
            FROM core.tenants 
            WHERE code = 'iaf' OR slug = 'iaf'
        `;
        console.table(tenants);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await sql.end();
    }
}
