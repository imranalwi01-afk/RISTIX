import { platformDb } from './packages/new-backend/src/config/database';
import { platformSettings } from './packages/new-backend/src/db/schema/platform.schema';
import { eq } from 'drizzle-orm';
async function run() {
  try {
    const [setting] = await platformDb.select().from(platformSettings).where(eq(platformSettings.key, 'smtp')).limit(1);
    console.log('DB CONFIG:', JSON.stringify(setting, null, 2));
  } catch (e) {
    console.error(e);
  }
  process.exit(0);
}
run();
