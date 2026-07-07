import postgres from 'postgres';

const sql = postgres('postgresql://postgres:postgres@host.docker.internal:15432/ifrspro_platform_admin');

async function tune() {
  console.log('Applying PostgreSQL performance tuning for 64GB RAM & 8 Cores...');

  try {
    // These commands modify postgresql.auto.conf and require a DB restart to take full effect
    await sql`ALTER SYSTEM SET shared_buffers = '16GB'`;
    await sql`ALTER SYSTEM SET effective_cache_size = '48GB'`;
    await sql`ALTER SYSTEM SET work_mem = '128MB'`;
    await sql`ALTER SYSTEM SET maintenance_work_mem = '2GB'`;
    
    // Checkpoint & WAL tuning for heavy workloads
    await sql`ALTER SYSTEM SET checkpoint_completion_target = '0.9'`;
    await sql`ALTER SYSTEM SET wal_buffers = '16MB'`;
    await sql`ALTER SYSTEM SET default_statistics_target = '100'`;
    await sql`ALTER SYSTEM SET random_page_cost = '1.1'`; // Assuming SSD
    
    // Parallelism
    await sql`ALTER SYSTEM SET max_worker_processes = '8'`;
    await sql`ALTER SYSTEM SET max_parallel_workers_per_gather = '4'`;
    await sql`ALTER SYSTEM SET max_parallel_workers = '8'`;

    console.log('Successfully wrote new settings to postgresql.auto.conf.');
    
    // Reload conf for settings that don't require full restart
    const reload = await sql`SELECT pg_reload_conf()`;
    console.log('Reloaded conf:', reload[0].pg_reload_conf ? 'Success' : 'Failed');
    
    console.log('\nIMPORTANT: shared_buffers requires a FULL RESTART of the PostgreSQL service to take effect.');
  } catch (error) {
    console.error('Error applying tuning:', error);
  }

  process.exit(0);
}

tune();
