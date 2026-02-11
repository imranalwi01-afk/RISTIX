-- Migration: Create job definitions and executions tables
-- Purpose: Fix missing tables causing "relation does not exist" errors
-- Schema: core

BEGIN;

-- Job Definitions Table
CREATE TABLE IF NOT EXISTS "core"."job_definitions" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "tenant_id" uuid NOT NULL REFERENCES "core"."tenants"("id") ON DELETE CASCADE,
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

-- Job Executions Table
CREATE TABLE IF NOT EXISTS "core"."job_executions" (
    "id" varchar(255) PRIMARY KEY NOT NULL, -- BullMQ Job ID or custom UUID
    "job_definition_id" uuid REFERENCES "core"."job_definitions"("id") ON DELETE SET NULL,
    "tenant_id" uuid NOT NULL REFERENCES "core"."tenants"("id") ON DELETE CASCADE,
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

-- Indexes for performance
CREATE INDEX IF NOT EXISTS "idx_job_definitions_tenant" ON "core"."job_definitions"("tenant_id");
CREATE INDEX IF NOT EXISTS "idx_job_definitions_type" ON "core"."job_definitions"("job_type");

CREATE INDEX IF NOT EXISTS "idx_job_executions_tenant" ON "core"."job_executions"("tenant_id");
CREATE INDEX IF NOT EXISTS "idx_job_executions_job_def" ON "core"."job_executions"("job_definition_id");
CREATE INDEX IF NOT EXISTS "idx_job_executions_status" ON "core"."job_executions"("status");
CREATE INDEX IF NOT EXISTS "idx_job_executions_type" ON "core"."job_executions"("job_type");
CREATE INDEX IF NOT EXISTS "idx_job_executions_start_time" ON "core"."job_executions"("start_time");

COMMIT;
