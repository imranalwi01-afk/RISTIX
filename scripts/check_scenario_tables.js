import { db } from './src/lib/db.js';

async function checkTables() {
  try {
    const [results] = await db.execute(`
      SELECT table_name, column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name LIKE '%scenario%' 
      ORDER BY table_name, ordinal_position
    `);
    
    console.log('Scenario-related tables:');
    console.log(JSON.stringify(results, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }
  
  process.exit(0);
}

checkTables();
