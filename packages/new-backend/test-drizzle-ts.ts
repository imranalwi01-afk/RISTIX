import { legacyDb, closeDatabase } from './src/config/database.js';
import { frs9MasterAccount } from './src/db/schema/legacy/index.js';

async function run() {
  try {
    const result = await legacyDb.select().from(frs9MasterAccount).limit(1);
    console.log(result);
  } catch (err) {
    console.error(err);
  } finally {
    closeDatabase();
  }
}
run();
