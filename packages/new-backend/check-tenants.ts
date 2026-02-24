
import { sql } from 'drizzle-orm';
import postgres from 'postgres';
import { getPlatformDatabaseUrl } from './src/config/env';

async function checkTenants() {
    const url = getPlatformDatabaseUrl();
    const sql = postgres(url);
    try {
        const rows = await sql`SELECT id, code, name, slug FROM platform_admin.tenants`;
        console.log('--- TENANTS IN PLATFORM DB ---');
        console.table(rows);
    } catch (err) {
        console.error('Error:', err.message);
        try {
            const rowsCore = await sql`SELECT id, code, name, slug FROM core.tenants`;
            console.log('--- TENANTS IN CORE SCHEMA ---');
            console.table(rowsCore);
        } catch (err2) {
            console.error('Error in core:', err2.message);
        }
    } finally {
        await sql.end();
    }
}

checkTenants();
