
import { legacyDb, closeDatabase } from '../src/config/database';
import { frs9AccountId } from '../src/db/schema/legacy';
import { sql } from 'drizzle-orm';

async function verifyLegacyQuery() {
    try {
        console.log('🔄 Verifying legacy database query...');

        // Test querying the account table
        // We access it via legacyDb which is connected to the legacy DB
        const accounts = await legacyDb.select().from(frs9AccountId).limit(5);

        console.log(`✅ Successfully queried ${accounts.length} accounts from legacy database!`);
        if (accounts.length > 0) {
            console.log('📄 Sample account:', accounts[0]);
        } else {
            console.log('⚠️ No accounts found, but query executed successfully.');
        }

    } catch (error) {
        console.error('❌ Failed to query legacy database:', error);
        process.exit(1);
    } finally {
        await closeDatabase();
        console.log('🔌 Database connections closed.');
    }
}

verifyLegacyQuery();
