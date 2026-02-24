// Check actual schema for frs9_imp_ca_result_h
console.log('=== Checking Schema ===');

const { legacyDb } = await import('./src/config/database.js');

try {
  // Get column names for the table
  const result = await legacyDb.execute(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'frs9_imp_ca_result_h' 
    ORDER BY ordinal_position
  `);
  
  console.log('Columns in frs9_imp_ca_result_h:');
  result.forEach(col => {
    console.log(`  - ${col.column_name} (${col.data_type})`);
  });
  
  // Get sample data
  console.log('\nSample data:');
  const sample = await legacyDb.execute(`
    SELECT * FROM frs9_imp_ca_result_h LIMIT 3
  `);
  console.log(sample);
  
} catch (error) {
  console.error('Error:', error.message);
}
