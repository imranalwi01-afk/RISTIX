
import postgres from 'postgres';

async function main() {
    const DB_HOST = process.env.DB_HOST || '10.8.0.2';
    const DB_PORT = process.env.DB_PORT || '5433';
    const DB_USER = process.env.DB_USER || 'postgres';
    const DB_PASSWORD = process.env.DB_PASSWORD || 'postgres';
    const DB_NAME = process.env.DB_NAME || 'ifrspro_tenant_iaf';

    const url = `postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;
    const sql = postgres(url);

    try {
        console.log(`🔌 Connecting to ${DB_NAME}...`);
        const tables = await sql`
            SELECT table_schema, table_name 
            FROM information_schema.tables 
            WHERE table_schema NOT IN ('information_schema', 'pg_catalog')
            ORDER BY table_schema, table_name
        `;
        console.table(tables);
    } catch (err) {
        console.error('❌ Error:', err);
    } finally {
        await sql.end();
    }
}

main();
