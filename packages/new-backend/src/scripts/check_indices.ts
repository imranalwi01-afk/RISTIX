
import { legacyDb } from '../config/database';
import { sql } from 'drizzle-orm';

async function checkIndices() {
    try {
        const result = await legacyDb.execute(sql`
            SELECT 
                t.relname as table_name,
                i.relname as index_name,
                a.attname as column_name,
                ix.indisunique as is_unique
            FROM 
                pg_class t,
                pg_class i,
                pg_index ix,
                pg_attribute a
            WHERE 
                t.oid = ix.indrelid
                AND i.oid = ix.indexrelid
                AND a.attrelid = t.oid
                AND a.attnum = ANY(ix.indkey)
                AND t.relname IN ('frs9_imp_ia_header', 'frs9_imp_ia_result_d', 'frs9_imp_ia_detail', 'frs9_imp_ia_rr')
            ORDER BY 
                t.relname, i.relname;
        `);
        console.log(JSON.stringify(result, null, 2));
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

checkIndices();
