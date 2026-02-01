import postgres from 'postgres';

export async function run(args: string[] = []) {
    const sql = postgres(process.env.DB_URL || 'postgresql://postgres:postgres@10.8.0.2:5433/ifrspro_platform_admin');

    try {
        console.log('--- Checking schemas ---');
        const schemas = await sql`SELECT schema_name FROM information_schema.schemata`;
        console.log('Schemas:', schemas.map(s => s.schema_name).join(', '));

        console.log('\n--- Checking tables in core schema ---');
        const tables = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'core'`;
        console.log('Tables in core:', tables.map(t => t.table_name).join(', '));

        if (tables.some(t => t.table_name === 'users')) {
            console.log('\n--- Columns in core.users ---');
            const columns = await sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_schema = 'core' AND table_name = 'users'`;
            console.table(columns);
        } else {
            console.error('\n❌ Table core.users NOT FOUND!');
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await sql.end();
    }
}
