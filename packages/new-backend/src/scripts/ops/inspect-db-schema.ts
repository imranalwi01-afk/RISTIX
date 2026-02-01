import postgres from 'postgres';

export async function run(args: string[] = []) {
    const sql = postgres(process.env.DB_URL || 'postgresql://postgres:postgres@10.8.0.2:5433/ifrspro_platform_admin');

    try {
        console.log('--- Inspecting core.users columns ---');
        const columns = await sql`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_schema = 'core' AND table_name = 'users'
        `;
        console.table(columns);

        console.log('\n--- Inspecting core.tenants columns ---');
        const tenantColumns = await sql`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_schema = 'core' AND table_name = 'tenants'
        `;
        console.table(tenantColumns);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await sql.end();
    }
}
