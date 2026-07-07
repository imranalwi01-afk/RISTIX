import postgres from 'postgres';
const sql = postgres('postgresql://postgres:postgres@host.docker.internal:15432/ifrspro_platform_admin');

async function check() {
  const version = await sql`SELECT version()`;
  const settings = await sql`SELECT name, setting, unit FROM pg_settings WHERE name IN ('shared_buffers', 'work_mem', 'max_connections', 'effective_cache_size', 'maintenance_work_mem', 'max_worker_processes', 'max_parallel_workers')`;
  
  console.log('PostgreSQL Version:', version[0].version);
  console.log('\nHardware/Config Estimates based on PG Settings:');
  settings.forEach(s => console.log(`- ${s.name}: ${s.setting} ${s.unit || ''}`));
  process.exit(0);
}
check().catch(console.error);
