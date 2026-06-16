"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobExecutions = exports.jobDefinitions = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const core_1 = require("./core");
const platform_schema_1 = require("./platform.schema");
// =============================================================================
// JOB DEFINITIONS (Configuration)
// =============================================================================
exports.jobDefinitions = core_1.coreSchema.table('job_definitions', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    tenantId: (0, pg_core_1.uuid)('tenant_id').references(() => platform_schema_1.tenants.id).notNull(),
    name: (0, pg_core_1.varchar)('name', { length: 255 }).notNull(),
    description: (0, pg_core_1.text)('description'),
    jobType: (0, pg_core_1.varchar)('job_type', { length: 50 }).notNull(), // e.g., 'IFRS9_CALCULATION', 'DATA_VALIDATION'
    cronExpression: (0, pg_core_1.varchar)('cron_expression', { length: 50 }), // For recurring jobs
    defaultParameters: (0, pg_core_1.jsonb)('default_parameters').default({}),
    isEnabled: (0, pg_core_1.boolean)('is_enabled').default(true),
    priority: (0, pg_core_1.varchar)('priority', { length: 20 }).default('NORMAL'), // LOW, NORMAL, HIGH, CRITICAL
    impactLevel: (0, pg_core_1.varchar)('impact_level', { length: 20 }).default('medium'), // low, medium, high
    timeout: (0, pg_core_1.integer)('timeout').default(3600), // in seconds
    maxRetries: (0, pg_core_1.integer)('max_retries').default(0),
    createdBy: (0, pg_core_1.uuid)('created_by'),
    updatedBy: (0, pg_core_1.uuid)('updated_by'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow(),
    lastRunStatus: (0, pg_core_1.varchar)('last_run_status', { length: 20 }), // Success, Failed
    lastRunTime: (0, pg_core_1.timestamp)('last_run_time'),
    nextRunTime: (0, pg_core_1.timestamp)('next_run_time'),
    // Approval Integration
    requiresApproval: (0, pg_core_1.boolean)('requires_approval').default(false),
    approvalMatrixId: (0, pg_core_1.uuid)('approval_matrix_id'), // References approval.approval_matrices(id) - cross-schema reference
    autoApproveConditions: (0, pg_core_1.jsonb)('auto_approve_conditions'), // Optional auto-approval rules
});
// =============================================================================
// JOB EXECUTIONS (History/Log)
// =============================================================================
exports.jobExecutions = core_1.coreSchema.table('job_executions', {
    id: (0, pg_core_1.varchar)('id', { length: 255 }).primaryKey(), // Using BullMQ Job ID or UUID
    jobDefinitionId: (0, pg_core_1.uuid)('job_definition_id').references(() => exports.jobDefinitions.id),
    tenantId: (0, pg_core_1.uuid)('tenant_id').references(() => platform_schema_1.tenants.id).notNull(),
    jobName: (0, pg_core_1.varchar)('job_name', { length: 255 }).notNull(), // Copy name for history
    jobType: (0, pg_core_1.varchar)('job_type', { length: 50 }).notNull(),
    status: (0, pg_core_1.varchar)('status', { length: 50 }).notNull(), // 'active', 'completed', 'failed', 'delayed', 'paused'
    progress: (0, pg_core_1.integer)('progress').default(0),
    startTime: (0, pg_core_1.timestamp)('start_time'),
    endTime: (0, pg_core_1.timestamp)('end_time'),
    duration: (0, pg_core_1.integer)('duration'), // in ms
    parameters: (0, pg_core_1.jsonb)('parameters'),
    result: (0, pg_core_1.jsonb)('result'),
    error: (0, pg_core_1.text)('error'),
    triggeredBy: (0, pg_core_1.uuid)('triggered_by'), // user id
    workerId: (0, pg_core_1.varchar)('worker_id', { length: 255 }),
    tags: (0, pg_core_1.jsonb)('tags').default([]), // tags array
    // Approval Tracking
    approvalRequestId: (0, pg_core_1.uuid)('approval_request_id'), // References approval.approval_requests(id)
    approvalStatus: (0, pg_core_1.varchar)('approval_status', { length: 20 }).default('not_required'), // 'not_required', 'pending', 'approved', 'rejected'
    approvedAt: (0, pg_core_1.timestamp)('approved_at'),
    approvedBy: (0, pg_core_1.uuid)('approved_by'), // References core.users(id)
});
