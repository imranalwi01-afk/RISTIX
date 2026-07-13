
import postgres from 'postgres';

async function main() {
    const DB_HOST = process.env.DB_HOST || '172.25.0.25';
    const DB_PORT = process.env.DB_PORT || '5432';
    const DB_USER = process.env.DB_USER || 'postgres';
    const DB_PASSWORD = process.env.DB_PASSWORD || 'postgres';
    const DB_NAME = process.env.DB_NAME || 'ifrspro_tenant_iaf';

    const url = `postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;
    const sql = postgres(url);

    try {
        console.log(`🔌 Connecting to ${DB_NAME}...`);
        const tables = await sql`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'core'
            ORDER BY table_name
        `;
        console.table(tables);
    } catch (err) {
        console.error('❌ Error:', err);
    } finally {
        await sql.end();
    }
}

main();
