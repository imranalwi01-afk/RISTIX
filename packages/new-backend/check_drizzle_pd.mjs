import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { vwPdStructureYearly } from './src/db/schema/legacy/index.ts';
import { eq, and, or, isNull } from 'drizzle-orm';

const sql = postgres('postgresql://postgres:postgres@172.25.0.25:5432/FRS9PRO');
const legacyDb = drizzle(sql);

async function check() {
  const data = await legacyDb
    .select()
    .from(vwPdStructureYearly)
    .where(and(
      eq(vwPdStructureYearly.prcDate, '2025-12-31'),
      eq(vwPdStructureYearly.pdConfigId, 1),
      or(eq(vwPdStructureYearly.modelId, 2), isNull(vwPdStructureYearly.modelId))
    ))
    .limit(10);
  console.log("vwPdStructureYearly rows:", data);
  process.exit(0);
}
check().catch(e => { console.error(e); process.exit(1); });
