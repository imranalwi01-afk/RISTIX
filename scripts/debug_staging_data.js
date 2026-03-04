// Debug staging data directly
console.log('=== Debugging Staging Data ===');

const { legacyDb } = await import('./src/config/database.js');

try {
  // Check total records
  const totalRecords = await legacyDb.execute(`
    SELECT COUNT(*) as count FROM frs9_imp_ca_result_h
  `);
  console.log('Total records in frs9_imp_ca_result_h:', totalRecords[0].count);

  // Check distinct dates
  const dates = await legacyDb.execute(`
    SELECT DISTINCT prc_date FROM frs9_imp_ca_result_h ORDER BY prc_date DESC
  `);
  console.log('Available process dates:', dates.map(d => d.prc_date));

  // Check sample data
  const sample = await legacyDb.execute(`
    SELECT prc_date, stage, segment_id, outstanding, ecl_amount 
    FROM frs9_imp_ca_result_h 
    ORDER BY prc_date DESC, stage 
    LIMIT 5
  `);
  console.log('Sample records:');
  sample.forEach((record, index) => {
    console.log(`  ${index + 1}. ${record.prc_date} - Stage ${record.stage} - Segment ${record.segment_id} - Outstanding: ${record.outstanding} - ECL: ${record.ecl_amount}`);
  });

  // Test the actual query from service
  console.log('\nTesting service query...');
  const stagingData = await legacyDb.execute(`
    SELECT 
        prc_date as "prcDate",
        stage,
        segment_id as "segmentId",
        SUM(CAST(outstanding AS DECIMAL)) as "totalOutstanding",
        SUM(CAST(ecl_amount AS DECIMAL)) as "totalECL",
        AVG(CAST(outstanding AS DECIMAL)) as "avgOutstanding"
    FROM frs9_imp_ca_result_h 
    GROUP BY prc_date, stage, segment_id
    ORDER BY prc_date DESC, stage
  `);
  console.log('Service query result length:', stagingData.length);
  if (stagingData.length > 0) {
    console.log('First record:', stagingData[0]);
  }

} catch (error) {
  console.error('Error:', error.message);
}
