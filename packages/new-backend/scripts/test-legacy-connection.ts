
import { legacyDb, closeDatabase } from '../src/config/database';

async function verifyLegacyConnection() {
    try {
        console.log('🔄 Verifying legacy database connection...');

        // Execute a simple query to check connection
        // We use sql`` helper from drizzle-orm if available, but for raw postgres.js connection check 
        // we can use the underlying connection or just try a simple select if schema was defined.
        // Since we don't have a schema yet, we can't easily use db.select().
        // However, drizzle-orm/postgres-js allows raw SQL execution via db.execute

        const result = await legacyDb.execute('SELECT 1 as connected');

        console.log('✅ Legacy database connection successful!');
        console.log('📊 Result:', result);

    } catch (error) {
        console.error('❌ Failed to connect to legacy database:', error);
        process.exit(1);
    } finally {
        await closeDatabase();
        console.log('🔌 Database connections closed.');
    }
}

verifyLegacyConnection();
