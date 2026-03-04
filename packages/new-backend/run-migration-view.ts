
import { db, legacyDb } from './src/config/database';
import { sql } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';

async function runMigration() {
    console.log('🚀 Running Migration: Create Portfolio View on LEGACY DB...');
    
    try {
        const sqlPath = path.join(__dirname, 'src/db/migrations/create_portfolio_view.sql');
        const sqlContent = fs.readFileSync(sqlPath, 'utf-8');
        
        // Execute raw SQL on LEGACY DB
        await legacyDb.execute(sql.raw(sqlContent));
        
        console.log('✅ Migration executed successfully on Legacy DB!');
        
        // Verify view creation
        const checkView = await legacyDb.execute(sql`
            SELECT count(*) as count 
            FROM core.portfolio_accounts
        `);
        
        console.log(`📊 View created. Rows available: ${checkView[0].count}`);
        
    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        process.exit(0);
    }
}

runMigration();
