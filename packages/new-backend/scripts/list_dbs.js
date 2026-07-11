import { Client } from 'pg';

const client = new Client({
  connectionString: 'postgresql://postgres:postgres@localhost:5432/postgres'
});

async function run() {
  await client.connect();
  const res = await client.query('SELECT datname FROM pg_database WHERE datname LIKE \'ifrspro_tenant_%\'');
  console.log(res.rows);
  await client.end();
}

run();
