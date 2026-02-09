import { pgTable, text, varchar, timestamp, boolean, jsonb, integer, uuid } from 'drizzle-orm/pg-core'
import { coreSchema } from './core'
import { tenants } from './platform.schema'

// =============================================================================
// JOB DEFINITIONS (Configuration)
// =============================================================================
export const jobDefinitions = coreSchema.table('job_definitions', {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),
    jobType: varchar('job_type', { length: 50 }).notNull(), // e.g., 'IFRS9_CALCULATION', 'DATA_VALIDATION'
    cronExpression: varchar('cron_expression', { length: 50 }), // For recurring jobs
    defaultParameters: jsonb('default_parameters').default({}),
    isEnabled: boolean('is_enabled').default(true),
    priority: varchar('priority', { length: 20 }).default('NORMAL'), // LOW, NORMAL, HIGH, CRITICAL
    timeout: integer('timeout').default(3600), // in seconds
    maxRetries: integer('max_retries').default(0),
    createdBy: uuid('created_by'),
    updatedBy: uuid('updated_by'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
    lastRunStatus: varchar('last_run_status', { length: 20 }), // Success, Failed
    lastRunTime: timestamp('last_run_time'),
    nextRunTime: timestamp('next_run_time'),

    // Approval Integration
    requiresApproval: boolean('requires_approval').default(false),
    approvalMatrixId: uuid('approval_matrix_id'), // References approval.approval_matrices(id) - cross-schema reference
    autoApproveConditions: jsonb('auto_approve_conditions'), // Optional auto-approval rules
})

// =============================================================================
// JOB EXECUTIONS (History/Log)
// =============================================================================
export const jobExecutions = coreSchema.table('job_executions', {
    id: varchar('id', { length: 255 }).primaryKey(), // Using BullMQ Job ID or UUID
    jobDefinitionId: uuid('job_definition_id').references(() => jobDefinitions.id),
    tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
    jobName: varchar('job_name', { length: 255 }).notNull(), // Copy name for history
    jobType: varchar('job_type', { length: 50 }).notNull(),
    status: varchar('status', { length: 50 }).notNull(), // 'active', 'completed', 'failed', 'delayed', 'paused'
    progress: integer('progress').default(0),
    startTime: timestamp('start_time'),
    endTime: timestamp('end_time'),
    duration: integer('duration'), // in ms
    parameters: jsonb('parameters'),
    result: jsonb('result'),
    error: text('error'),
    triggeredBy: uuid('triggered_by'), // user id
    workerId: varchar('worker_id', { length: 255 }),
    tags: jsonb('tags').default([]), // tags array

    // Approval Tracking
    approvalRequestId: uuid('approval_request_id'), // References approval.approval_requests(id)
    approvalStatus: varchar('approval_status', { length: 20 }).default('not_required'), // 'not_required', 'pending', 'approved', 'rejected'
    approvedAt: timestamp('approved_at'),
    approvedBy: uuid('approved_by'), // References core.users(id)
})
