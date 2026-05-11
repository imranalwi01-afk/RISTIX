
import { legacyDb } from '../config/database';
import { sql } from 'drizzle-orm';

async function checkSequences() {
    try {
        const result = await legacyDb.execute(sql`
            SELECT 
                s.relname as sequence_name,
                nextval(s.relname::regclass) as current_next_val,
                (SELECT MAX(pkid) FROM frs9_imp_ia_header) as max_header_pkid,
                (SELECT MAX(pkid) FROM frs9_imp_ia_result_d) as max_dcf_pkid
            FROM 
                pg_class s
            JOIN 
                pg_namespace n ON n.oid = s.relnamespace
            WHERE 
                s.relkind = 'S' 
                AND s.relname LIKE 'frs9_imp_ia%'
        `);
        console.log(JSON.stringify(result, null, 2));
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

checkSequences();
