import { readFileSync } from "fs";
import postgres from "postgres";

const sql = postgres("postgresql://postgres:postgres@host.docker.internal:5432/ifrspro_tenant_iaf");

try {
  const migrationSQL = readFileSync("/tmp/migration.sql", "utf-8");
  console.log("🚀 Running approval schema migration...");
  await sql.unsafe(migrationSQL);
  console.log("✅ Migration completed successfully!");
  await sql.end();
  process.exit(0);
} catch (error) {
  console.error("❌ Migration failed:", error.message);
  await sql.end();
  process.exit(1);
}
