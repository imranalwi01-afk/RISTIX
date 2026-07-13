
import postgres from 'postgres';

async function main() {
    const DB_HOST = '172.25.0.25';
    const DB_PORT = '5432';
    const DB_USER = 'postgres';
    const DB_PASSWORD = 'postgres';
    const DB_NAME = 'ifrspro_tenant_iaf';

    const NEW_PASSWORD = '1019181716';
    const TARGET_EMAIL = 'admin@iaf.co.id';

    console.log(`🔌 Connecting to ${DB_NAME} at ${DB_HOST}:${DB_PORT}...`);
    const sql = postgres(`postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`);

    try {
        console.log(`🔐 Hashing password "${NEW_PASSWORD}"...`);
        const hash = await Bun.password.hash(NEW_PASSWORD, {
            algorithm: "bcrypt",
            cost: 10,
        });
        console.log(`Key Generated: ${hash}`);

        console.log(`👷 Updating password for ${TARGET_EMAIL}...`);
        await sql`
            UPDATE core.users 
            SET password_hash = ${hash}, updated_at = NOW()
            WHERE email = ${TARGET_EMAIL}
        `;

        console.log('✅ Password updated successfully!');

    } catch (err) {
        console.error('❌ Error updating password:', err);
    } finally {
        await sql.end();
    }
}

main();
