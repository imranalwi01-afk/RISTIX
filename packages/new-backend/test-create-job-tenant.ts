
import postgres from 'postgres';

const API_BASE = 'http://localhost:4232/api/v1/jobs';
const LOGIN_URL = 'http://localhost:4232/api/v1/auth/login';

async function main() {
    try {
        console.log('🔑 Logging in...');
        const loginRes = await fetch(LOGIN_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@iaf.co.id',
                password: '1019181716',
                tenantId: 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be'
            })
        });

        const loginData: any = await loginRes.json();
        console.log('🔍 Login Response:', JSON.stringify(loginData, null, 2));

        if (!loginRes.ok) {
            console.error('❌ Login failed:', loginData);
            return;
        }

        const data = loginData.data || loginData; // Handle envelope
        const token = data.tokens?.accessToken || data.token;
        const tenantId = data.user?.tenantId;
        console.log(`✅ Logged in. Tenant ID: ${tenantId}`);

        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        console.log('\n📝 Creating a new job definition...');
        const createRes = await fetch(`${API_BASE}/definitions`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                name: 'API Migration Test Job',
                description: 'Verifying storage in tenant core schema',
                jobType: 'INTERNAL_SCRIPT',
                priority: 'HIGH',
                defaultParameters: { test: true }
            })
        });

        const createData: any = await createRes.json();

        if (!createRes.ok) {
            console.error('❌ Job creation failed:', createData);
            return;
        }

        const newJobId = createData.id;
        console.log(`✅ Job created successfully! ID: ${newJobId}`);

        // Verify in Database
        console.log('\n🔍 Verifying in Database (ifrspro_tenant_iaf.core.job_definitions)...');
        const DB_HOST = process.env.DB_HOST || '10.8.0.2';
        const DB_PORT = process.env.DB_PORT || '5433';
        const DB_USER = process.env.DB_USER || 'postgres';
        const DB_PASSWORD = process.env.DB_PASSWORD || 'postgres';
        const DB_NAME = 'ifrspro_tenant_iaf';

        const sql = postgres(`postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`);

        const rows = await sql`
            SELECT id, name, tenant_id 
            FROM core.job_definitions 
            WHERE id = ${newJobId}
        `;

        if (rows.length > 0) {
            console.log('✨ SUCCESS: Found the job in the correct tenant database and schema!');
            console.table(rows);
        } else {
            console.error('❌ FAILURE: Job not found in the tenant database.');
        }

        await sql.end();

    } catch (err: any) {
        console.error('❌ Error:', err.message);
    }
}

main();
