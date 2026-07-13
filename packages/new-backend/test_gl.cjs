const postgres = require('postgres');
const sql = postgres('postgresql://postgres:postgres@localhost:5432/FRS9PRO');

async function run() {
  try {
    const data = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'vw_frs9_gl_outbound';
    `;
    console.log("Columns:", data);
  } catch(e) {
    console.error(e);
  }
  process.exit(0);
}
run();
