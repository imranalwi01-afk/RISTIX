
import { legacyDb } from './src/config/database';
import { sql } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';

async function runMigration() {
    console.log('🚀 Running Migration: Create Config Tables on LEGACY DB...');
    
    try {
        const sqlPath = path.join(__dirname, 'src/db/migrations/create_config_tables.sql');
        const sqlContent = fs.readFileSync(sqlPath, 'utf-8');
        
        // Execute raw SQL on LEGACY DB
        await legacyDb.execute(sql.raw(sqlContent));
        
        console.log('✅ Migration executed successfully on Legacy DB!');
        
        // Verify creation
        const checkPD = await legacyDb.execute(sql`SELECT count(*) as count FROM "FRS9_IMP_CA_PD_CONFIG"`);
        console.log(`📊 PD Config Count: ${checkPD[0].count}`);
        
        const checkLGD = await legacyDb.execute(sql`SELECT count(*) as count FROM "FRS9_IMP_CA_LGD_CONFIG"`);
        console.log(`📊 LGD Config Count: ${checkLGD[0].count}`);
        
    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        process.exit(0);
    }
}

runMigration();
