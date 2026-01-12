import { db, closeDatabase } from '../src/config/database'
import { sql } from 'drizzle-orm'

async function main() {
    console.log('🚀 Initializing Jobs Module Tables...')

    // Drop old tables if they exist (from previous implementation)
    console.log('Dropping old frs9_job_* tables if they exist...')
    await db.execute(sql`DROP TABLE IF EXISTS "frs9_job_executions" CASCADE;`)
    await db.execute(sql`DROP TABLE IF EXISTS "frs9_job_definitions" CASCADE;`)

    // 1. Job Definitions (NEW - no frs9_ prefix)
    console.log('Creating job_definitions...')
    await db.execute(sql`
        CREATE TABLE IF NOT EXISTS "job_definitions" (
            "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            "tenant_id" uuid NOT NULL,
            "name" varchar(255) NOT NULL,
            "description" text,
            "job_type" varchar(50) NOT NULL,
            "cron_expression" varchar(50),
            "default_parameters" jsonb DEFAULT '{}'::jsonb,
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
    `)

    // 2. Job Executions (NEW - no frs9_ prefix)
    console.log('Creating job_executions...')
    await db.execute(sql`
        CREATE TABLE IF NOT EXISTS "job_executions" (
            "id" varchar(255) PRIMARY KEY,
            "job_definition_id" uuid REFERENCES job_definitions(id),
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
            "tags" jsonb DEFAULT '[]'::jsonb,
            "approval_request_id" uuid,
            "approval_status" varchar(20) DEFAULT 'not_required',
            "approved_at" timestamp,
            "approved_by" uuid
        );
    `)

    console.log('✅ Jobs Tables Created Successfully!')
    console.log('📝 Note: These are NEW platform tables (not legacy frs9_* tables)')
    await closeDatabase()
}

main().catch((err) => {
    console.error('❌ Migration Failed:', err)
    process.exit(1)
})
