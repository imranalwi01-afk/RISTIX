
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
const envFile = process.argv[2] || '.env.vps';
const envPath = path.resolve(process.cwd(), envFile);
console.log(`Loading environment from: ${envPath}`);
dotenv.config({ path: envPath });

const MIGRATION_FILE = path.join(process.cwd(), 'database/migrations/002-create-iaf-menu-structure.sql');

async function runMigration() {
    console.log('🚀 Starting Node.js based migration (Plain JS)...');
    console.log(`📂 Migration file: ${MIGRATION_FILE}`);

    const dbConfig = {
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '5432'),
        database: process.env.TENANT_DB_NAME || 'ifrspro_tenant_iaf',
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
    };

    console.log('🔌 Connecting to database:', {
        host: dbConfig.host,
        port: dbConfig.port,
        database: dbConfig.database,
        user: dbConfig.user
    });

    const pool = new Pool(dbConfig);

    try {
        const client = await pool.connect();
        console.log('✅ Database connection successful');

        const sqlContent = fs.readFileSync(MIGRATION_FILE, 'utf8');

        console.log('📝 Executing SQL...');
        await client.query(sqlContent);

        console.log('✅ Migration executed successfully!');

        // Verify
        const res = await client.query("SELECT COUNT(*) FROM core.menu_items");
        console.log(`📊 Verification: ${res.rows[0].count} menu items found.`);

        client.release();
    } catch (err) {
        console.error('❌ Migration failed:', err);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

runMigration();
