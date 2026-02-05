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
        console.log('👷 Applying schema fixes to core.users...');

        await sql`
            ALTER TABLE core.users 
            ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
            ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
            ADD COLUMN IF NOT EXISTS mfa_enabled BOOLEAN DEFAULT false,
            ADD COLUMN IF NOT EXISTS force_password_change BOOLEAN DEFAULT false,
            ADD COLUMN IF NOT EXISTS login_count INTEGER DEFAULT 0,
            ADD COLUMN IF NOT EXISTS backup_codes TEXT[],
            ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMP WITH TIME ZONE;
        `;

        console.log('✅ core.users updated successfully!');

        // Also check tenants table
        console.log('👷 Checking core.tenants...');
        await sql`
            ALTER TABLE core.tenants
            ADD COLUMN IF NOT EXISTS slug VARCHAR(100),
            ADD COLUMN IF NOT EXISTS banking_mode VARCHAR(20) DEFAULT 'conventional';
        `;
        console.log('✅ core.tenants updated successfully!');

    } catch (err) {
        console.error('❌ Error applying fixes:', err);
    } finally {
        await sql.end();
    }
}
