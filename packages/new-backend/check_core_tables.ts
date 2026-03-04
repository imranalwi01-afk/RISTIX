
import { sql } from 'drizzle-orm';
import { db, legacyDb } from './src/config/database';
import { frs9MasterAccount } from './src/db/schema';

async function checkTables() {
    console.log('🔍 Checking database tables...');

    try {
        // 1. Check frs9_master_account (Legacy DB)
        console.log('\n--- Checking frs9_master_account (Legacy DB) ---');
        const legacyCount = await legacyDb
            .select({ count: sql<number>`count(*)` })
            .from(frs9MasterAccount);
        console.log(`✅ frs9_master_account count: ${legacyCount[0].count}`);

        // 2. Check core.portfolio_accounts (Main DB)
        console.log('\n--- Checking core.portfolio_accounts (Main DB) ---');
        // Raw SQL query because it might not be in Drizzle schema yet
        const coreResult = await db.execute(sql`
            SELECT count(*) as count 
            FROM information_schema.tables 
            WHERE table_schema = 'core' 
            AND table_name = 'portfolio_accounts'
        `);
        
        if (Number(coreResult[0].count) > 0) {
            console.log('✅ Table core.portfolio_accounts EXISTS.');
            
            const rowCount = await db.execute(sql`SELECT count(*) as count FROM core.portfolio_accounts`);
            console.log(`📊 Row count: ${rowCount[0].count}`);
        } else {
            console.error('❌ Table core.portfolio_accounts does NOT exist!');
            
            // Suggest creation or migration
            console.log('💡 Recommendation: Create core.portfolio_accounts table or migrate data from legacy.');
        }

    } catch (error) {
        console.error('❌ Error checking tables:', error);
    } finally {
        process.exit(0);
    }
}

checkTables();
