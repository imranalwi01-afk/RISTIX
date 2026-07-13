import postgres from 'postgres';

export async function run(args: string[] = []) {
    const DB_HOST = process.env.DB_HOST || '172.25.0.25';
    const DB_PORT = process.env.DB_PORT || '5432';
    const DB_USER = process.env.DB_USER || 'postgres';
    const DB_PASSWORD = process.env.DB_PASSWORD || 'postgres';
    const DB_NAME = process.env.DB_NAME || 'ifrspro_tenant_iaf';

    console.log(`🔌 Connecting to ${DB_NAME} at ${DB_HOST}:${DB_PORT}...`);
    const sql = postgres(`postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`);

    try {
        const roles = await sql`SELECT id, role_name, role_code FROM core.roles`;
        console.log('Roles in Tenant DB:', roles);
    } catch (err) {
        console.error('❌ Error:', err);
    } finally {
        await sql.end();
    }
}
