import { Client } from 'pg';

const client = new Client({
  connectionString: 'postgresql://postgres:postgres@localhost:5432/ifrspro_platform_admin'
});

async function run() {
  try {
    await client.connect();
    console.log('Connected to ifrspro_platform_admin');
    await client.query('ALTER TABLE "platform_admin"."users" ADD COLUMN IF NOT EXISTS "avatar_url" text');
    console.log('Added avatar_url to platform_admin.users');
    
    // Also run for ifrspro_tenant_iaf
    const tenantClient = new Client({
        connectionString: 'postgresql://postgres:postgres@localhost:5432/ifrspro_tenant_iaf'
    });
    await tenantClient.connect();
    console.log('Connected to ifrspro_tenant_iaf');
    await tenantClient.query('ALTER TABLE "core"."users" ADD COLUMN IF NOT EXISTS "avatar_url" text');
    console.log('Added avatar_url to ifrspro_tenant_dana core.users');
    await tenantClient.end();

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

run();
