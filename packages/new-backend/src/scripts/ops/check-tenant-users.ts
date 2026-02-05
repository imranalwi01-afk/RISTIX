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
        const info = await sql`
            SELECT table_type, table_schema, table_name
            FROM information_schema.tables 
            WHERE table_schema = 'core' AND table_name = 'users'
        `;
        console.log('Relation Info:', info);

        const columns = await sql`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns 
            WHERE table_schema = 'core' AND table_name = 'users'
            ORDER BY column_name;
        `;
        console.log('--- USERS TABLE COLUMNS ---');
        columns.forEach(c => {
            console.log(`${c.column_name.padEnd(30)} | ${c.data_type.padEnd(25)} | Null: ${c.is_nullable.padEnd(5)} | Default: ${c.column_default || 'NONE'}`);
        });
        console.log('---------------------------');

    } catch (err) {
        console.error('❌ Error inspecting:', err);
    } finally {
        await sql.end();
    }
}
