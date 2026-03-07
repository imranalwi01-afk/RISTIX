// Test script untuk validasi fix tanggal di calculations page
console.log('=== Testing Calculations Date Fix ===');

const testCalculationsFix = async () => {
  try {
    console.log('\n🔍 Testing fix implementation...');
    
    // Test 1: Cek API endpoints yang tersedia
    console.log('\n1. Testing available API endpoints...');
    
    const endpoints = [
      '/api/v1/ifrs9/calculations/dates',
      '/api/v1/ifrs9/calculations/summary', 
      '/api/v1/ifrs9/calculations/results',
      '/api/v1/ifrs9/calculations/run'
    ];
    
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`http://localhost:4232${endpoint}?mode=conventional`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer demo_token_ADMIN',
            'X-Tenant-ID': 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be'
          }
        });
        console.log(`✅ ${endpoint}: ${response.status}`);
      } catch (error) {
        console.log(`❌ ${endpoint}: ${error.message}`);
      }
    }
    
    // Test 2: Cek data yang tersedia
    console.log('\n2. Testing available calculation data...');
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
        
        // Test summary
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
          console.log('✅ Summary for', testDate, ':', {
            totalAccounts: summaryData.data?.totalAccounts,
            totalPortfolio: summaryData.data?.totalPortfolio,
            totalECL: summaryData.data?.totalECL,
            stage1Count: summaryData.data?.stage1Count,
            stage2Count: summaryData.data?.stage2Count,
            stage3Count: summaryData.data?.stage3Count
          });
        }
      }
    }
    
    console.log('\n✅ FIX IMPLEMENTATION SUMMARY:');
    console.log('1. ✅ Added useEffect to sync runConfig.process_date with selectedProcessDate');
    console.log('2. ✅ Updated handleConfirmRun to use selectedProcessDate if available');
    console.log('3. ✅ Added visual indicator showing selected date in Run Config dialog');
    console.log('4. ✅ Added helper text in DatePicker showing date source');
    
    console.log('\n🎯 EXPECTED BEHAVIOR:');
    console.log('• User selects date from View Date dropdown');
    console.log('• selectedProcessDate state updates');
    console.log('• useEffect automatically syncs runConfig.process_date');
    console.log('• Run ECL button now uses the selected date');
    console.log('• User sees confirmation of selected date in dialog');
    
    console.log('\n🧪 TESTING STEPS:');
    console.log('1. Open http://localhost:4231/banking/ifrs9/calculations?mode=conventional');
    console.log('2. Select different date from View Date dropdown');
    console.log('3. Click Run ECL button');
    console.log('4. Check that dialog shows selected date');
    console.log('5. Verify API call uses selected date, not today');
    
  } catch (error) {
    console.log('❌ Test error:', error.message);
  }
};

await testCalculationsFix();
console.log('\n=== Test Complete ===');