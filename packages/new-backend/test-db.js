import { getDatabase } from './src/config/database.js';
import { tenantsRepository } from './src/repositories/tenants.repository.js';

console.log('Testing database connection...');

try {
  const db = getDatabase(null); // Platform DB
  console.log('Database connection created');
  
  const result = await tenantsRepository.findAll();
  console.log('Tenants query result:', result);
} catch (error) {
  console.error('Database error:', error);
}
