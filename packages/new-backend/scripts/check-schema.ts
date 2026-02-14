
import postgres from 'postgres';
import { env } from '../src/config/env';
import * as fs from 'fs';

async function checkSchema() {
    console.log('📡 Connecting to DB...');
    const sql = postgres({
        host: env.DB_HOST,
        port: parseInt(env.DB_PORT || '5432'),
        database: env.DB_NAME || 'ifrspro_platform_admin',
        username: env.DB_USER,
        password: env.DB_PASSWORD,
    });

    try {
        console.log('🔍 Checking core.roles schema...');
        const columns = await sql`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_schema = 'core' AND table_name = 'roles'
        `;

        if (columns.length > 0) {
            console.log(`✅ core.roles found with ${columns.length} columns`);
            const colList = columns.map(c => `${c.column_name} (${c.data_type})`).join('\n');
            fs.writeFileSync('schema_dump.txt', colList);
            console.log('📄 Columns dumped to schema_dump.txt');
        } else {
             console.log('❌ core.roles table NOT found');
        }

    } catch (error) {
        console.error('❌ Connection failed:', error);
    } finally {
        await sql.end();
    }
}

checkSchema();
