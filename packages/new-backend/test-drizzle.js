const { drizzle } = require('drizzle-orm/node-postgres');
const { Pool } = require('pg');
const schema = require('./src/db/schema/legacy');

const pool = new Pool({
  connectionString: 'postgresql://postgres:postgres@localhost:5432/ifrspro_tenant_ristix'
});

const db = drizzle(pool, { schema });

async function run() {
  try {
    const result = await db.select().from(schema.frs9MasterAccount).limit(1);
    console.log(result);
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}
run();
