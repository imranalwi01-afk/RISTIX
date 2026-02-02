import postgres from 'postgres';

export async function run(args: string[] = []) {
    const sql = postgres(process.env.DB_URL || 'postgresql://postgres:postgres@10.8.0.2:5433/ifrspro_platform_admin');

    try {
        console.log('Adding bank_id column...');
        await sql`ALTER TABLE core.users ADD COLUMN IF NOT EXISTS bank_id character varying(50)`;

        console.log('Adding banking_access column...');
        await sql`ALTER TABLE core.users ADD COLUMN IF NOT EXISTS banking_access character varying(20) DEFAULT 'CONVENTIONAL'`;

        console.log('Adding syariah_certified column...');
        await sql`ALTER TABLE core.users ADD COLUMN IF NOT EXISTS syariah_certified boolean DEFAULT false`;

        console.log('--- Verifying admin@iaf.co.id user ---');
        const adminUser = await sql`SELECT id, email, tenant_id FROM core.users WHERE email = 'admin@iaf.co.id'`;
        console.log('Admin User:', adminUser);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await sql.end();
    }
}
