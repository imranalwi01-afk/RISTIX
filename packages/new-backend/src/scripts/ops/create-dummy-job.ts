
const BASE_URL = 'http://localhost:4232/api/v1';

export async function run(args: string[] = []) {
    console.log('🚀 Starting Dynamic Job Verification Script...');

    // 1. Login
    console.log('🔑 Logging in as admin@iaf.co.id...');
    let token = '';

    try {
        const loginRes = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@iaf.co.id',
                password: 'password', // Trying 'password'
            }),
        });

        if (loginRes.ok) {
            const data = await loginRes.json();
            token = data.tokens.accessToken;
            console.log('✅ Login successful with "password"');
        } else {
            console.log('⚠️  Login failed with "password", trying "1019181716"...');
            const loginRes2 = await fetch(`${BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: 'admin@iaf.co.id',
                    password: '1019181716',
                }),
            });

            if (loginRes2.ok) {
                const data = await loginRes2.json();
                token = data.tokens.accessToken;
                console.log('✅ Login successful with "1019181716"');
            } else {
                console.error('❌ Login failed with both passwords.');
                console.error('Response:', await loginRes2.text());
                process.exit(1);
            }
        }
    } catch (e) {
        console.error('❌ Connection error:', e);
        process.exit(1);
    }

    // 2. Create Job Definition (SQL_SP)
    console.log('\n✨ Creating SQL_SP Job Definition...');
    const createRes = await fetch(`${BASE_URL}/jobs/definitions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            name: 'Refresh Analytics View',
            description: 'Runs a stored procedure to refresh analytics data',
            jobType: 'SQL_SP',
            defaultParameters: {
                procedureName: 'core.refresh_analytics_view',
                params: []
            },
            priority: 'NORMAL'
        })
    });

    if (!createRes.ok) {
        console.error('❌ Failed to create job definition:', await createRes.text());
        process.exit(1);
    }

    const newJob = await createRes.json();
    console.log('✅ Job definition created:', newJob.id);

    // 3. Run the job
    console.log(`\n🏃 Triggering job: ${newJob.id}...`);
    const runRes = await fetch(`${BASE_URL}/jobs/${newJob.id}/run`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!runRes.ok) {
        console.error('❌ Failed to run job:', await runRes.text());
        process.exit(1);
    }

    const runData = await runRes.json();
    console.log('✅ Job triggered:', runData);
    const executionId = runData.executionId;

    // 4. Poll for status
    console.log(`\n⏳ Polling for execution status (${executionId})...`);
    for (let i = 0; i < 10; i++) {
        await new Promise(r => setTimeout(r, 2000));
        const statusRes = await fetch(`${BASE_URL}/jobs/executions/${executionId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (statusRes.ok) {
            const execution = await statusRes.json();
            console.log(`Status: ${execution.status} | Progress: ${execution.progress}%`);
            if (['completed', 'failed'].includes(execution.status)) {
                console.log('\n🏁 Execution Finished!');
                console.log('Result:', JSON.stringify(execution.result, null, 2));
                console.log('Error:', execution.error);
                break;
            }
        } else {
            console.error('❌ Failed to get status:', await statusRes.text());
        }
    }
}
