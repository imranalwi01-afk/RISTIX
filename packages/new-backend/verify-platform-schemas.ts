
import postgres from 'postgres';
import { getPlatformDatabaseUrl } from './src/config/env';

async function verifyPlatformSchemas() {
    const url = getPlatformDatabaseUrl();
    const sql = postgres(url);
    try {
        const schemas = await sql`
            SELECT schema_name 
            FROM information_schema.schemata 
            ORDER BY schema_name
        `;
        console.log('--- SCHEMAS IN PLATFORM DATABASE ---');
        console.log(schemas.map(s => s.schema_name).join(', '));
        
        for (const s of schemas) {
            const schemaName = s.schema_name;
            if (['information_schema', 'pg_catalog', 'pg_toast'].includes(schemaName)) continue;
            
            const tables = await sql`
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = ${schemaName}
                AND table_name LIKE '%job%'
            `;
            if (tables.length > 0) {
                console.log(`\nFound job tables in schema [${schemaName}]:`);
                tables.forEach(t => console.log(`  - ${t.table_name}`));
            }
        }
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await sql.end();
    }
}

verifyPlatformSchemas();
