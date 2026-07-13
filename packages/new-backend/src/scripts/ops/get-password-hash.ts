import postgres from 'postgres';

export async function run(args: string[] = []) {
    const DB_HOST = process.env.DB_HOST || '172.25.0.25';
    const DB_PORT = process.env.DB_PORT || '5432';
    const DB_USER = process.env.DB_USER || 'postgres';
    const DB_PASSWORD = process.env.DB_PASSWORD || 'postgres';
    const DB_NAME = process.env.PLATFORM_DB_NAME || 'ifrspro_platform_admin';

    console.log(`🔌 Connecting to ${DB_NAME} at ${DB_HOST}:${DB_PORT}...`);
    const sql = postgres(`postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`);

    try {
        const users = await sql`
            SELECT password_hash FROM platform_admin.users WHERE email = 'admin@ifrspro.id'
        `;
        if (users.length > 0) {
            console.log('--- FOUND HASH ---');
            console.log(users[0].password_hash);
            console.log('------------------');
        } else {
            console.log('User not found in platform DB');
        }
    } catch (err) {
        console.error('❌ Error:', err);
    } finally {
        await sql.end();
    }
}
