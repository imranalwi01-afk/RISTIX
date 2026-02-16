import postgres from 'postgres';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export async function run() {
    const DB_HOST = process.env.DB_HOST || '10.8.0.2';
    const DB_PORT = process.env.DB_PORT || '5433';
    const DB_USER = process.env.DB_USER || 'postgres';
    const DB_PASSWORD = process.env.DB_PASSWORD || 'postgres';
    const DB_NAME = process.env.PLATFORM_DB_NAME || 'ifrspro_platform_admin';

    console.log(`🔌 Connecting to ${DB_NAME} at ${DB_HOST}:${DB_PORT}...`);
    const sql = postgres(`postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`);

    try {
        const migrationPath = resolve(process.cwd(), 'src/db/migrations/0028_consolidate_platform_users_into_users.sql');
        const migrationSql = readFileSync(migrationPath, 'utf-8');

        console.log('🚀 Running platform user consolidation migration (0028)...');
        await sql.unsafe(migrationSql);

        const [counts] = await sql`
            SELECT
                (SELECT COUNT(*) FROM platform_admin.users) AS users_count,
                (SELECT COUNT(*) FROM platform_admin.platform_users) AS legacy_view_count
        `;

        console.log('✅ Consolidation complete');
        console.log(`   platform_admin.users rows: ${counts.users_count}`);
        console.log(`   platform_admin.platform_users rows (compat view): ${counts.legacy_view_count}`);
    } catch (err) {
        console.error('❌ Error applying consolidation:', err);
        throw err;
    } finally {
        await sql.end();
    }
}
