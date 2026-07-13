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
        const usersColumns = await sql`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns 
            WHERE table_schema = 'platform_admin' AND table_name = 'users'
            ORDER BY column_name;
        `;
        console.log('--- CANONICAL TABLE: platform_admin.users ---');
        usersColumns.forEach(c => {
            console.log(`${c.column_name.padEnd(30)} | ${c.data_type.padEnd(25)} | Null: ${c.is_nullable.padEnd(5)} | Default: ${c.column_default || 'NONE'}`);
        });
        console.log('------------------------------------------------');

        const legacyObject = await sql`
            SELECT c.relkind
            FROM pg_class c
            JOIN pg_namespace n ON n.oid = c.relnamespace
            WHERE n.nspname = 'platform_admin' AND c.relname = 'platform_users'
            LIMIT 1
        `;
        if (legacyObject.length > 0) {
            const kind = legacyObject[0].relkind === 'v' ? 'view' : legacyObject[0].relkind === 'r' ? 'table' : legacyObject[0].relkind;
            console.log(`Legacy object platform_admin.platform_users exists as: ${kind}`);
        } else {
            console.log('Legacy object platform_admin.platform_users does not exist');
        }
    } catch (err) {
        console.error('❌ Error inspecting:', err);
    } finally {
        await sql.end();
    }
}
