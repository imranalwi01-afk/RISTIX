import postgres from 'postgres';

export async function run(args: string[] = []) {
    const DB_HOST = process.env.DB_HOST || '10.8.0.2';
    const DB_PORT = process.env.DB_PORT || '5433';
    const DB_USER = process.env.DB_USER || 'postgres';
    const DB_PASSWORD = process.env.DB_PASSWORD || 'postgres';
    const DB_NAME = process.env.DB_NAME || 'ifrspro_tenant_iaf';

    console.log(`🔌 Connecting to ${DB_NAME} at ${DB_HOST}:${DB_PORT}...`);
    const sql = postgres(`postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`);

    try {
        const users = await sql`
            SELECT id, email, username FROM core.users WHERE email = 'admin@iaf.co.id'
        `;
        console.log('User in Tenant DB:', users);
    } catch (err) {
        console.error('❌ Error checking user:', err);
    } finally {
        await sql.end();
    }
}
