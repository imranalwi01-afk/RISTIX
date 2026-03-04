
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { sql } from 'drizzle-orm';
import * as dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.LEGACY_DATABASE_URL || 'postgres://postgres:postgres@10.8.0.2:5433/FRS9PRO';
const client = postgres(connectionString);
const db = drizzle(client);

async function checkDates() {
    console.log('Checking dates in frs9_imp_ia_result_h...');
    try {
        const result = await db.execute(sql`
            SELECT prc_date, COUNT(*) as count 
            FROM frs9_imp_ia_result_h 
            GROUP BY prc_date 
            ORDER BY prc_date DESC
        `);
        
        console.log('Available dates in frs9_imp_ia_result_h:');
        result.forEach(row => {
            console.log(`${row.prc_date}: ${row.count} records`);
        });

        if (result.length === 0) {
            console.log('No records found in frs9_imp_ia_result_h.');
        }

    } catch (error) {
        console.error('Error checking dates:', error);
    } finally {
        await client.end();
    }
}

checkDates();
