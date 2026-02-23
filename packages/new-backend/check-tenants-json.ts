
import postgres from 'postgres';
import { getPlatformDatabaseUrl } from './src/config/env';

async function checkTenants() {
    const url = getPlatformDatabaseUrl();
    const sql = postgres(url);
    try {
        const rows = await sql`SELECT id, code, name, slug FROM platform_admin.tenants`;
        console.log(JSON.stringify(rows, null, 2));
    } catch (err) {
        process.exit(1);
    } finally {
        await sql.end();
    }
}

checkTenants();
