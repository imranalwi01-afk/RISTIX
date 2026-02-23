import { getTenants } from './src/services/tenants.service.js';
import { Effect } from 'effect';

console.log('Testing tenants service with Effect run...');

try {
  const result = await Effect.runPromise(getTenants());
  console.log('Service result with Effect.runPromise:', result);
} catch (error) {
  console.error('Service error with Effect.runPromise:', error);
  console.error('Error details:', error.stack);
}
