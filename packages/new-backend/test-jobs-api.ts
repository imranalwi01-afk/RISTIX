
const BASE_URL = 'http://localhost:4232/api/v1';

async function test() {
    console.log('🚀 Verifying Jobs API after Database Alignment...');

    // 1. Login
    console.log('🔑 Logging in as admin@iaf.co.id...');
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: 'admin@iaf.co.id',
            password: '1019181716',
            tenantId: 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be'
        }),
    });

    const result = await loginRes.json();
    console.log('✅ Login successful. Response received.');

    const loginData = result.data;
    const token = loginData?.tokens?.accessToken || loginData?.token || loginData?.accessToken;
    if (!token) {
        console.error('❌ Could not find token in response:', JSON.stringify(result, null, 2));
        process.exit(1);
    }
    console.log('✅ Login successful.');

    // 2. Test Metrics
    console.log('\n📊 Testing GET /jobs/metrics...');
    const metricsRes = await fetch(`${BASE_URL}/jobs/metrics`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });

    if (metricsRes.ok) {
        const metrics = await metricsRes.json();
        console.log('✅ Metrics endpoint working:');
        console.log(JSON.stringify(metrics, null, 2));
    } else {
        console.error('❌ Metrics endpoint failed:', await metricsRes.text());
    }

    // 3. Test Definitions
    console.log('\n📋 Testing GET /jobs/definitions...');
    const defsRes = await fetch(`${BASE_URL}/jobs/definitions`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });

    if (defsRes.ok) {
        const defs = await defsRes.json();
        console.log(`✅ Definitions endpoint working. Found ${defs.length} definitions.`);
        if (defs.length > 0) {
            console.log('Example Definition:', defs[0].name);
        }
    } else {
        console.error('❌ Definitions endpoint failed:', await defsRes.text());
    }

    // 4. Test Executions
    console.log('\n📜 Testing GET /jobs/executions?limit=10...');
    const execsRes = await fetch(`${BASE_URL}/jobs/executions?limit=10`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });

    if (execsRes.ok) {
        const execs = await execsRes.json();
        console.log(`✅ Executions endpoint working. Found ${execs.length} executions.`);
    } else {
        console.error('❌ Executions endpoint failed:', await execsRes.text());
    }
}

test().catch(console.error);
