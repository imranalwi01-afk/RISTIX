import postgres from "postgres";

const sql = postgres("postgresql://postgres:postgres@host.docker.internal:5433/postgres");

try {
  const dbs = await sql`SELECT datname FROM pg_database WHERE datistemplate = false ORDER BY datname`;
  console.log("📊 Available databases:");
  dbs.forEach(db => console.log(`  - ${db.datname}`));
  await sql.end();
} catch (error) {
  console.error("Error:", error.message);
  await sql.end();
}
