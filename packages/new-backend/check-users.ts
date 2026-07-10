import { platformDb } from './src/db/index';
import { sql } from 'drizzle-orm';

async function run() {
    try {
        const users = await platformDb.execute(sql`SELECT email, is_platform_admin FROM users WHERE is_platform_admin = true OR email LIKE '%demo%'`);
        console.log(users);
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
}

run();
