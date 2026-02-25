import { legacyDb } from './config';
import { sql } from 'drizzle-orm';
import * as fs from 'fs';

async function main() {
    let output = "";
    output += "Fetching dates from frs9_imp_ca_result_d...\n";
    try {
        const result = await legacyDb.execute(sql`SELECT DISTINCT to_char(prc_date, 'YYYY-MM-DD') as prc_date FROM frs9_imp_ca_result_d ORDER BY prc_date DESC LIMIT 10`);
        output += "Valid Dates in frs9_imp_ca_result_d: " + JSON.stringify(result.map((r: any) => r.prc_date)) + "\n";
    } catch(e) { output += String(e) + "\n"; }

    output += "\nFetching dates from frs9_imp_ca_pd_structure...\n";
    try {
        const result = await legacyDb.execute(sql`SELECT DISTINCT to_char(prc_date, 'YYYY-MM-DD') as prc_date FROM frs9_imp_ca_pd_structure ORDER BY prc_date DESC LIMIT 10`);
        output += "Valid Dates in frs9_imp_ca_pd_structure: " + JSON.stringify(result.map((r: any) => r.prc_date)) + "\n";
    } catch(e) { output += String(e) + "\n"; }

    fs.writeFileSync('/tmp/db-dates.txt', output);
    process.exit(0);
}

main();
