
import postgres from 'postgres';

async function main() {
    // 1. Target Tenant Database
    const DB_HOST = process.env.DB_HOST || '10.8.0.2';
    const DB_PORT = process.env.DB_PORT || '5433';
    const DB_USER = process.env.DB_USER || 'postgres';
    const DB_PASSWORD = process.env.DB_PASSWORD || 'postgres';
    const TENANT_DB_NAME = process.env.TENANT_DB_NAME || 'ifrspro_tenant_iaf';
    const PLATFORM_DB_NAME = process.env.PLATFORM_DB_NAME || 'ifrspro_platform_admin';

    const tenantUrl = `postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${TENANT_DB_NAME}`;
    const platformUrl = `postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${PLATFORM_DB_NAME}`;

    const tenantSql = postgres(tenantUrl, { max: 1 });
    const platformSql = postgres(platformUrl, { max: 1 });

    try {
        console.log(`🔌 Connecting to Tenant DB: ${TENANT_DB_NAME}...`);
        console.log('--- Ensuring Job Tables Exist in core Schema of Tenant DB ---');

        await tenantSql.unsafe(`CREATE SCHEMA IF NOT EXISTS "core";`);
        await tenantSql.unsafe(`
            CREATE TABLE IF NOT EXISTS "core"."job_definitions" (
                "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
                "tenant_id" uuid NOT NULL,
                "name" varchar(255) NOT NULL,
                "description" text,
                "job_type" varchar(50) NOT NULL,
                "cron_expression" varchar(50),
                "default_parameters" jsonb DEFAULT '{}',
                "is_enabled" boolean DEFAULT true,
                "priority" varchar(20) DEFAULT 'NORMAL',
                "timeout" integer DEFAULT 3600,
                "max_retries" integer DEFAULT 0,
                "created_by" uuid,
                "updated_by" uuid,
                "created_at" timestamp DEFAULT now(),
                "updated_at" timestamp DEFAULT now(),
                "last_run_status" varchar(20),
                "last_run_time" timestamp,
                "next_run_time" timestamp,
                "requires_approval" boolean DEFAULT false,
                "approval_matrix_id" uuid,
                "auto_approve_conditions" jsonb
            );
        `);
        console.log('✅ job_definitions checked/created in core schema.');

        await tenantSql.unsafe(`
            CREATE TABLE IF NOT EXISTS "core"."job_executions" (
                "id" varchar(255) PRIMARY KEY NOT NULL,
                "job_definition_id" uuid,
                "tenant_id" uuid NOT NULL,
                "job_name" varchar(255) NOT NULL,
                "job_type" varchar(50) NOT NULL,
                "status" varchar(50) NOT NULL,
                "progress" integer DEFAULT 0,
                "start_time" timestamp,
                "end_time" timestamp,
                "duration" integer,
                "parameters" jsonb,
                "result" jsonb,
                "error" text,
                "triggered_by" uuid,
                "worker_id" varchar(255),
                "tags" jsonb DEFAULT '[]',
                "approval_request_id" uuid,
                "approval_status" varchar(20) DEFAULT 'not_required',
                "approved_at" timestamp,
                "approved_by" uuid
            );
        `);
        console.log('✅ job_executions checked/created in core schema.');

        // Cleanup public schema and Platform Admin DB
        console.log(`\n🧹 Cleaning up tables from public schema and Platform Admin DB...`);
        try {
            await tenantSql.unsafe(`DROP TABLE IF EXISTS "public"."job_executions" CASCADE`);
            await tenantSql.unsafe(`DROP TABLE IF EXISTS "public"."job_definitions" CASCADE`);
            console.log('✅ Old jobs tables removed from public schema.');

            await platformSql.unsafe(`DROP TABLE IF EXISTS "job_executions" CASCADE`);
            await platformSql.unsafe(`DROP TABLE IF EXISTS "job_definitions" CASCADE`);
            console.log('✅ Old jobs tables removed from Platform Admin DB.');
        } catch (e) {
            console.warn('⚠️ Warning during cleanup:', e);
        }

        console.log('\n✨ Database schema alignment complete (Tenant DB correctly configured)!');

    } catch (err) {
        console.error('❌ Error during schema alignment:', err);
    } finally {
        await tenantSql.end();
        await platformSql.end();
    }
}

main();
