import { platformDb } from './src/config/database.js';
import { tenants } from './src/db/schema/platform.schema.js';

console.log('Testing raw database query...');

try {
  console.log('Schema:', tenants);
  console.log('DB instance:', platformDb);
  
  const result = await platformDb.select().from(tenants);
  console.log('Raw query result:', result);
  console.log('Result length:', result.length);
} catch (error) {
  console.error('Raw database error:', error);
  console.error('Error details:', error.stack);
}
