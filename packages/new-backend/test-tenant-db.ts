
import { tenantDb, getDatabase } from './src/config/database';
import { jobDefinitions } from './src/db/schema';
import { sql } from 'drizzle-orm';

async function test() {
    console.log('🧪 Testing Tenant DB connection via Drizzle...');
    
    const tenantId = 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be'; // IAF UUID
    const dbx = getDatabase(tenantId);
    
    try {
        console.log('📡 Attempting to query core.job_definitions...');
        const result = await dbx.select().from(jobDefinitions).limit(1);
        console.log('✅ Success! Found:', result.length, 'definitions');
    } catch (err) {
        console.error('❌ Error during select:', err.message);
        
        console.log('📡 Trying raw SQL query...');
        try {
            const raw = await dbx.execute(sql`SELECT count(*) FROM core.job_definitions`);
            console.log('✅ Raw SQL Success:', raw);
        } catch (rawErr) {
            console.error('❌ Raw SQL also failed:', rawErr.message);
        }
    } finally {
        process.exit(0);
    }
}

test();
