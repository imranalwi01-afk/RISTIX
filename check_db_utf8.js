
const postgres = require('postgres');
const fs = require('fs');
const sql = postgres('postgres://postgres:postgres@10.8.0.2:5433/ifrspro_tenant_iaf');

async function check() {
  try {
    const executions = await sql`
        SELECT id, tenant_id, job_definition_id, job_name, job_type, status 
        FROM core.job_executions
    `;
    let output = `Total executions found: ${executions.length}\n`;
    executions.forEach(e => {
        output += `- ID: ${e.id}, DefID: ${e.job_definition_id}, Name: ${e.job_name}, Type: ${e.job_type}, Status: ${e.status}\n`;
    });

    const definitions = await sql`
        SELECT id, tenant_id, name, job_type 
        FROM core.job_definitions
    `;
    output += '\nJob Definitions:\n';
    definitions.forEach(d => {
        output += `- ID: ${d.id}, Tenant: ${d.tenant_id}, Name: ${d.name}, Type: ${d.job_type}\n`;
    });

    fs.writeFileSync('db_trace_utf8.txt', output, 'utf8');
    console.log('Results written to db_trace_utf8.txt');

  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

check();
