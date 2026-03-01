import { db } from './src/config/database';
import { tenants } from './src/db/schema';
import { eq } from 'drizzle-orm';

async function main() {
  const result = await db.select().from(tenants).where(eq(tenants.slug, 'iaf'));
  console.log("Tenant search result:", result[0]?.id || "Not found");
  process.exit(0);
}
main().catch(e => { console.error(e); process.exit(1); });
