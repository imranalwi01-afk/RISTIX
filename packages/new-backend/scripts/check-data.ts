
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { sql } from 'drizzle-orm';

const connectionString = 'postgresql://postgres:postgres@10.8.0.2:5433/FRS9PRO';
const client = postgres(connectionString);
const db = drizzle(client);

async function main() {
    try {
        console.log('--- Analyzing frs9_master_account ---');
        
        // 1. Total Count
        const countResult = await db.execute(sql`SELECT COUNT(*) as total FROM frs9_master_account`);
        console.log('Total Rows:', countResult[0]?.total);

        // 2. Date Distribution
        const dateResult = await db.execute(sql`
            SELECT prc_date, COUNT(*) as count 
            FROM frs9_master_account 
            GROUP BY prc_date 
            ORDER BY prc_date DESC
            LIMIT 10
        `);
        console.log('\nDate Distribution (Top 10):');
        dateResult.forEach(row => {
            console.log(`${row.prc_date}: ${row.count} accounts`);
        });

        console.log('\n--- Analyzing frs9_master_account_repo ---');
        
        // 3. Total Count Repo
        const countRepoResult = await db.execute(sql`SELECT COUNT(*) as total FROM frs9_master_account_repo`);
        console.log('Total Rows Repo:', countRepoResult[0]?.total);

        // 4. Date Distribution Repo
        const dateRepoResult = await db.execute(sql`
            SELECT prc_date, COUNT(*) as count 
            FROM frs9_master_account_repo 
            GROUP BY prc_date 
            ORDER BY prc_date DESC
            LIMIT 10
        `);
        console.log('\nDate Distribution Repo (Top 10):');
        dateRepoResult.forEach(row => {
            console.log(`${row.prc_date}: ${row.count} accounts`);
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await client.end();
    }
}

main();
