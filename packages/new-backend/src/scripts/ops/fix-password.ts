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
        const hash = '$2b$10$8XFusTMt9OF/p4GXA3H9gOyL5DsCgUOcd8fr3yH9mC0WK2IkYVjEa';
        await sql`UPDATE core.users SET password_hash = ${hash} WHERE email = 'admin@iaf.co.id'`;
        console.log('✅ Admin password updated to 1019181716');
    } catch (e) {
        console.error('❌ Failed to update password:', e);
    } finally {
        await sql.end();
    }
}
