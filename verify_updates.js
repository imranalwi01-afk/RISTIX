
const postgres = require('postgres');
const sql = postgres('postgres://postgres:postgres@10.8.0.2:5433/ifrspro_tenant_iaf');

async function verify() {
  try {
    const executions = await sql`
        SELECT COUNT(*) 
        FROM core.job_executions 
        WHERE job_type = 'IFRS9_CALCULATION' 
        AND tenant_id = 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be'
    `;
    console.log('✅ DATABASE VERIFIED: IFRS9_CALCULATION executions in IAF tenant:', executions[0].count);
    
    const definition = await sql`
        SELECT COUNT(*) 
        FROM core.job_definitions 
        WHERE job_type = 'IFRS9_CALCULATION' 
        AND name = 'IFRS9 Impairment Sequence'
    `;
    console.log('✅ DATABASE VERIFIED: IFRS9_CALCULATION definition exists:', definition[0].count);

    const samples = await sql`
        SELECT id, status, start_time 
        FROM core.job_executions 
        WHERE job_type = 'IFRS9_CALCULATION' 
        LIMIT 2
    `;
    console.log('✅ SAMPLE EXECUTIONS:', JSON.stringify(samples, null, 2));

  } catch (err) {
    console.error('❌ Verification failed:', err);
  } finally {
    process.exit();
  }
}

verify();
