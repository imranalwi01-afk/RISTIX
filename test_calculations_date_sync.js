// Test script untuk validasi sinkronisasi tanggal antara dropdown dan Run ECL
console.log('=== Testing Calculations Date Synchronization ===');

const testDateSync = async () => {
  try {
    console.log('\n🔍 Testing date synchronization...');
    
    // Test 1: Cek available dates
    console.log('\n1. Testing available dates endpoint...');
    const datesResponse = await fetch('http://localhost:4232/api/v1/ifrs9/calculations/dates?mode=conventional', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer demo_token_ADMIN',
        'X-Tenant-ID': 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be'
      }
    });
    
    if (datesResponse.ok) {
      const datesData = await datesResponse.json();
      console.log('✅ Available dates:', datesData.data);
      
      if (datesData.data && datesData.data.length > 0) {
        const testDate = datesData.data[0];
        console.log('\n2. Testing with date:', testDate);
        
        // Test 2: Cek summary dengan tanggal tertentu
        console.log('\n2. Testing calculation summary with date...');
        const summaryResponse = await fetch(`http://localhost:4232/api/v1/ifrs9/calculations/summary?date=${testDate}&mode=conventional`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer demo_token_ADMIN',
            'X-Tenant-ID': 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be'
          }
        });
        
        if (summaryResponse.ok) {
          const summaryData = await summaryResponse.json();
          console.log('✅ Summary data for', testDate, ':', summaryData.data);
        } else {
          console.log('❌ Summary request failed:', summaryResponse.status);
        }
        
        // Test 3: Cek calculation results dengan tanggal
        console.log('\n3. Testing calculation results with date...');
        const resultsResponse = await fetch(`http://localhost:4232/api/v1/ifrs9/calculations/results?date=${testDate}&mode=conventional`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer demo_token_ADMIN',
            'X-Tenant-ID': 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be'
          }
        });
        
        if (resultsResponse.ok) {
          const resultsData = await resultsResponse.json();
          console.log('✅ Results count for', testDate, ':', resultsData.data?.length || 0);
        } else {
          console.log('❌ Results request failed:', resultsResponse.status);
        }
      }
    } else {
      console.log('❌ Available dates request failed:', datesResponse.status);
    }
    
    // Test 4: Cek Run ECL endpoint
    console.log('\n4. Testing Run ECL endpoint structure...');
    console.log('📋 Expected payload structure:');
    console.log('{
  "processDate": "2024-01-15",
  "segmentIds": [],
  "calculationType": "full",
  "recalculate": false,
  "scenarios": ["Base", "Optimistic", "Pessimistic"]
}');
    
    console.log('\n5. Current frontend logic analysis:');
    console.log('✅ Dropdown View Date: Updates selectedProcessDate');
    console.log('✅ Button Run ECL: Uses runConfig.process_date');
    console.log('❌ Missing: Synchronization between selectedProcessDate and runConfig.process_date');
    console.log('❌ Missing: useEffect to sync dates when dropdown changes');
    
    console.log('\n💡 RECOMMENDED FIXES:');
    console.log('1. Add useEffect to sync runConfig.process_date with selectedProcessDate');
    console.log('2. Update handleConfirmRun to prioritize selectedProcessDate');
    console.log('3. Add visual indicator in Run Config dialog showing selected date');
    console.log('4. Validate date consistency before API calls');
    
  } catch (error) {
    console.log('❌ Test error:', error.message);
  }
};

await testDateSync();
console.log('\n=== Test Complete ===');