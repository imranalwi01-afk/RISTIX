import postgres from 'postgres';

async function createTablesInPlatformDB() {
    console.log('=== Creating job tables in Platform DB ===');
    const sql = postgres('postgresql://postgres:postgres@10.8.0.2:5433/ifrspro_platform_admin', { max: 1 });
    
    try {
        // Create core schema if not exists
        await sql`CREATE SCHEMA IF NOT EXISTS "core";`;
        console.log('✅ Core schema created/verified');

        // Create job_definitions table
        await sql`
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
        `;
        console.log('✅ job_definitions table created/verified');

        // Create job_executions table
        await sql`
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
        `;
        console.log('✅ job_executions table created/verified');

        // Create indexes
        await sql`CREATE INDEX IF NOT EXISTS "idx_job_definitions_tenant" ON "core"."job_definitions"("tenant_id");`;
        await sql`CREATE INDEX IF NOT EXISTS "idx_job_executions_tenant" ON "core"."job_executions"("tenant_id");`;
        await sql`CREATE INDEX IF NOT EXISTS "idx_job_executions_status" ON "core"."job_executions"("status");`;
        console.log('✅ Indexes created/verified');

        console.log('\n✨ All job tables created successfully in Platform DB!');
        
        // Verify tables exist
        const result = await sql`
            SELECT schemaname, tablename 
            FROM pg_tables 
            WHERE tablename IN ('job_executions', 'job_definitions')
            ORDER BY schemaname, tablename
        `;
        console.log('📋 Tables in Platform DB:', result);

    } catch (error) {
        console.error('❌ Error creating tables:', error);
    } finally {
        await sql.end();
    }
}

createTablesInPlatformDB();
