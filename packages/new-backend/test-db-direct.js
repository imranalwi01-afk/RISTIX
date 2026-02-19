import { getDatabase } from './src/config/database.js';
import { db } from './src/config/database.js';
import { tenants } from './src/db/schema/index.js';
import { eq } from 'drizzle-orm';

console.log('Testing direct database query...');

try {
  console.log('Querying tenants table directly...');
  const result = await db.select().from(tenants);
  console.log('Tenants found:', result.length);
  console.log('First tenant:', result[0]);
} catch (error) {
  console.error('Database error:', error);
}
