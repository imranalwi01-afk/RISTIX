import postgres from 'postgres';

export async function run(args: string[] = []) {
    const DB_HOST = process.env.DB_HOST || '10.8.0.2';
    const DB_PORT = process.env.DB_PORT || '5433';
    const DB_USER = process.env.DB_USER || 'postgres';
    const DB_PASSWORD = process.env.DB_PASSWORD || 'postgres';
    const DB_NAME = process.env.PLATFORM_DB_NAME || 'ifrspro_platform_admin';

    console.log(`🔌 Connecting to ${DB_NAME} at ${DB_HOST}:${DB_PORT}...`);
    const sql = postgres(`postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`);

    try {
        const info = await sql`
            SELECT table_type, table_schema, table_name
            FROM information_schema.tables 
            WHERE table_schema = 'core' AND table_name = 'users'
        `;
        console.log('Relation Info:', info);

        if (info[0]?.table_type === 'VIEW') {
            const viewDef = await sql`
                SELECT view_definition 
                FROM information_schema.views 
                WHERE table_schema = 'core' AND table_name = 'users'
            `;
            console.log('View Definition:', viewDef[0]?.view_definition);
        } else {
            // Check if it's a materialized view
            const matView = await sql`
                SELECT definition 
                FROM pg_matviews 
                WHERE schemaname = 'core' AND matviewname = 'users'
            `;
            if (matView.length > 0) {
                console.log('Materialized View Definition:', matView[0].definition);
            }
        }
    } catch (err) {
        console.error('❌ Error inspecting:', err);
    } finally {
        await sql.end();
    }
}
