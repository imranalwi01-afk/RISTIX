import postgres from 'postgres';
import crypto from 'crypto';

export async function run(args: string[] = []) {
    const DB_HOST = process.env.DB_HOST || '10.8.0.2';
    const DB_PORT = process.env.DB_PORT || '5433';
    const DB_USER = process.env.DB_USER || 'postgres';
    const DB_PASSWORD = process.env.DB_PASSWORD || 'postgres';
    const DB_NAME = process.env.DB_NAME || 'ifrspro_tenant_iaf';

    console.log(`🔌 Connecting to ${DB_NAME} at ${DB_HOST}:${DB_PORT}...`);
    const sql = postgres(`postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`);

    const ADMIN_EMAIL = 'admin@iaf.co.id';
    const ADMIN_HASH = '$2b$10$8XFusTMt9OF/p4GXA3H9gOyL5DsCgUOcd8fr3yH9mC0WK2IkYVjEa'; // hash for 'admin'

    try {
        console.log('👷 Fixing core.users schema in Tenant DB...');
        await sql`
            ALTER TABLE core.users 
            ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
            ADD COLUMN IF NOT EXISTS mfa_enabled BOOLEAN DEFAULT false,
            ADD COLUMN IF NOT EXISTS login_count INTEGER DEFAULT 0,
            ADD COLUMN IF NOT EXISTS backup_codes TEXT[],
            ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMP WITH TIME ZONE,
            ADD COLUMN IF NOT EXISTS employee_id VARCHAR(50);
        `;
        console.log('✅ core.users schema fixed!');

        console.log(`👷 Checking if user ${ADMIN_EMAIL} exists...`);
        const existing = await sql`SELECT id FROM core.users WHERE email = ${ADMIN_EMAIL}`;

        let userId;
        if (existing.length === 0) {
            console.log('👷 Inserting admin user into Tenant DB...');
            userId = crypto.randomUUID();
            await sql`
                INSERT INTO core.users (
                    id, tenant_id, username, email, password_hash, full_name, is_active, is_verified, created_at, updated_at
                ) VALUES (
                    ${userId}, 'iaf', 'admin', ${ADMIN_EMAIL}, ${ADMIN_HASH}, 'Administrator', true, true, NOW(), NOW()
                )
            `;
            console.log('✅ Admin user inserted!');
        } else {
            userId = existing[0].id;
            console.log('ℹ️ Admin user already exists.');
        }

        console.log('👷 Ensuring admin role is assigned...');
        const role = await sql`SELECT id FROM core.roles WHERE role_code = 'IAF_TENANT_ADMIN'`;

        if (role.length > 0) {
            const roleId = role[0].id;
            const userRole = await sql`SELECT id FROM core.user_roles WHERE user_id = ${userId} AND role_id = ${roleId}`;

            if (userRole.length === 0) {
                await sql`
                    INSERT INTO core.user_roles (id, user_id, role_id, tenant_id, is_active, created_at, updated_at)
                    VALUES (${crypto.randomUUID()}, ${userId}, ${roleId}, 'iaf', true, NOW(), NOW())
                `;
                console.log('✅ IAF_TENANT_ADMIN role assigned!');
            } else {
                console.log('ℹ️ Role already assigned.');
            }
        } else {
            console.error('❌ Role IAF_TENANT_ADMIN not found!');
        }

    } catch (err) {
        console.error('❌ Error applying fixes:', err);
    } finally {
        await sql.end();
    }
}
