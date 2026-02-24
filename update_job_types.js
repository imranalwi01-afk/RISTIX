
const postgres = require('postgres');
const sql = postgres('postgres://postgres:postgres@10.8.0.2:5433/ifrspro_tenant_iaf');

async function update() {
  try {
    console.log('🔄 Updating job definition type...');
    const defUpdate = await sql`
        UPDATE core.job_definitions 
        SET job_type = 'IFRS9_CALCULATION' 
        WHERE name = 'IFRS9 Impairment Sequence' 
        RETURNING id
    `;
    console.log(`✅ Updated ${defUpdate.length} job definition(s)`);

    if (defUpdate.length > 0) {
        const defId = defUpdate[0].id;
        console.log('🔄 Updating job execution types...');
        const execUpdate = await sql`
            UPDATE core.job_executions 
            SET job_type = 'IFRS9_CALCULATION' 
            WHERE job_definition_id = ${defId}
            RETURNING id
        `;
        console.log(`✅ Updated ${execUpdate.length} job execution(s)`);
    } else {
        console.warn('⚠️ No job definition found with name "IFRS9 Impairment Sequence"');
    }

  } catch (err) {
    console.error('❌ Update failed:', err);
  } finally {
    process.exit();
  }
}

update();
