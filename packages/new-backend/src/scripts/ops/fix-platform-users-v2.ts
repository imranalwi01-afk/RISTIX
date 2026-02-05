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
        console.log('👷 Adding missing columns to platform_admin.platform_users...');

        await sql`
            ALTER TABLE platform_admin.platform_users 
            ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
            ADD COLUMN IF NOT EXISTS mfa_enabled BOOLEAN DEFAULT false,
            ADD COLUMN IF NOT EXISTS mfa_secret VARCHAR(255),
            ADD COLUMN IF NOT EXISTS login_count INTEGER DEFAULT 0,
            ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0,
            ADD COLUMN IF NOT EXISTS backup_codes TEXT[],
            ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMP WITH TIME ZONE,
            ADD COLUMN IF NOT EXISTS phone VARCHAR(50),
            ADD COLUMN IF NOT EXISTS employee_id VARCHAR(50),
            ADD COLUMN IF NOT EXISTS current_session_id VARCHAR(255),
            ADD COLUMN IF NOT EXISTS created_by UUID,
            ADD COLUMN IF NOT EXISTS updated_by UUID,
            ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMP WITH TIME ZONE;
        `;

        console.log('✅ platform_admin.platform_users updated!');

        console.log('👷 Dropping and re-creating core.users view...');

        await sql`DROP VIEW IF EXISTS core.users CASCADE;`;

        await sql`
            CREATE VIEW core.users AS
            SELECT 
                id,
                tenant_id,
                username,
                email,
                password_hash,
                full_name,
                company AS department,
                role AS position,
                phone,
                employee_id,
                is_active,
                is_verified,
                mfa_enabled,
                mfa_secret,
                backup_codes,
                force_password_change,
                login_count,
                failed_login_attempts,
                last_login_at,
                email_verified_at,
                password_changed_at,
                created_at,
                updated_at
            FROM platform_admin.platform_users;
        `;

        console.log('✅ core.users view redefined!');

    } catch (err) {
        console.error('❌ Error applying fixes:', err);
    } finally {
        await sql.end();
    }
}
