
import postgres from 'postgres';

async function verifyUsers() {
    const url = 'postgresql://postgres:postgres@localhost:5432/ifrspro_tenant_iaf';
    console.log(`🔌 Connecting to: ${url}`);
    const sql = postgres(url);
    try {
        const dbName = await sql`SELECT current_database()`;
        console.log(`📡 Current Database: ${dbName[0].current_database}`);

        console.log('\n--- All Users in core.users ---');
        const users = await sql`SELECT id, email, username, tenant_id FROM core.users`;
        console.table(users);

        console.log('\n--- Counts by Tenant ID ---');
        const counts = await sql`SELECT tenant_id, count(*) FROM core.users GROUP BY tenant_id`;
        console.table(counts);

        console.log('\n--- Searching for "users" table in other schemas ---');
        const otherUsers = await sql`
            SELECT table_schema, table_name 
            FROM information_schema.tables 
            WHERE table_name = 'users' AND table_schema NOT IN ('pg_catalog', 'information_schema')
        `;
        console.table(otherUsers);

    } catch (err) {
        console.error('❌ Error details:', err);
    } finally {
        await sql.end();
        console.log('✅ Connections closed.');
        process.exit(0);
    }
}

verifyUsers();
