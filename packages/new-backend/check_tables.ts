
import { db } from "./src/config";
import { sql } from "drizzle-orm";

async function main() {
    try {
        const res = await db.execute(sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'ifrs9'`);
        console.log(JSON.stringify(res, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

main();
