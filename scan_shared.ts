
import postgres from 'postgres';

async function scanShared() {
    const url = 'postgresql://postgres:postgres@localhost:5432/ifrspro_shared_services';
    console.log(`\n🔍 Scanning Database: ifrspro_shared_services`);
    const sql = postgres(url);
    try {
        const tables = await sql`
            SELECT table_schema, table_name 
            FROM information_schema.tables 
            WHERE table_name = 'users' AND table_schema NOT IN ('pg_catalog', 'information_schema')
        `;

        for (const table of tables) {
            console.log(`   📍 Table: ${table.table_schema}.${table.table_name}`);
            const rows = await sql.unsafe(`SELECT email, username FROM ${table.table_schema}.${table.table_name}`);
            console.table(rows);
        }
    } catch (err) {
        console.error(`   ❌ Error scanning ifrspro_shared_services:`, err.message);
    } finally {
        await sql.end();
        process.exit(0);
    }
}

scanShared();
