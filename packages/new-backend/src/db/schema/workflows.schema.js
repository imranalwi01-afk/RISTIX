"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.workflowJobsRelations = exports.workflowTransitionsRelations = exports.workflowsRelations = exports.workflowJobs = exports.workflowTransitions = exports.workflows = exports.workflowSchema = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const core_1 = require("./core");
const platform_schema_1 = require("./platform.schema");
/**
 * Workflow schema for approval state machines, ECL tracking, and audit logs
 */
exports.workflowSchema = (0, pg_core_1.pgSchema)('core');
// =============================================================================
// WORKFLOWS STATE MACHINE TABLE
// =============================================================================
exports.workflows = exports.workflowSchema.table('workflows', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    tenantId: (0, pg_core_1.uuid)('tenant_id').notNull(),
    // Workflow metadata
    workflowType: (0, pg_core_1.varchar)('workflow_type', { length: 50 }).notNull(), // 'APPROVAL', 'ECL_CALCULATION', etc.
    workflowName: (0, pg_core_1.varchar)('workflow_name', { length: 255 }).notNull(),
    description: (0, pg_core_1.text)('description'),
    // Entity reference
    entityType: (0, pg_core_1.varchar)('entity_type', { length: 50 }).notNull(),
    entityId: (0, pg_core_1.uuid)('entity_id').notNull(),
    // State tracking
    currentState: (0, pg_core_1.varchar)('current_state', { length: 50 }).notNull().default('PENDING'),
    previousState: (0, pg_core_1.varchar)('previous_state', { length: 50 }),
    // Approval fields
    requestedBy: (0, pg_core_1.uuid)('requested_by'),
    requestReason: (0, pg_core_1.text)('request_reason'),
    // Timestamps
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at', { withTimezone: true }).notNull().defaultNow(),
    expectedCompletionAt: (0, pg_core_1.timestamp)('expected_completion_at', { withTimezone: true }),
    completedAt: (0, pg_core_1.timestamp)('completed_at', { withTimezone: true }),
    // Metadata and status
    metadata: (0, pg_core_1.jsonb)('metadata').default('{}'),
    isActive: (0, pg_core_1.boolean)('is_active').notNull().default(true),
}, (table) => [
    (0, pg_core_1.index)('workflows_tenant_idx').on(table.tenantId),
    (0, pg_core_1.index)('workflows_type_idx').on(table.workflowType),
    (0, pg_core_1.index)('workflows_state_idx').on(table.currentState),
    (0, pg_core_1.index)('workflows_entity_idx').on(table.entityType, table.entityId),
    (0, pg_core_1.index)('workflows_created_idx').on(table.createdAt),
]);
// =============================================================================
// WORKFLOW TRANSITIONS AUDIT TABLE
// =============================================================================
exports.workflowTransitions = exports.workflowSchema.table('workflow_transitions', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    workflowId: (0, pg_core_1.uuid)('workflow_id')
        .notNull()
        .references(() => exports.workflows.id, { onDelete: 'cascade' }),
    tenantId: (0, pg_core_1.uuid)('tenant_id').notNull(),
    // Transition details
    fromState: (0, pg_core_1.varchar)('from_state', { length: 50 }).notNull(),
    toState: (0, pg_core_1.varchar)('to_state', { length: 50 }).notNull(),
    transitionReason: (0, pg_core_1.varchar)('transition_reason', { length: 255 }),
    transitionNotes: (0, pg_core_1.text)('transition_notes'),
    // Who triggered
    triggeredBy: (0, pg_core_1.uuid)('triggered_by'),
    triggeredAt: (0, pg_core_1.timestamp)('triggered_at', { withTimezone: true }).notNull().defaultNow(),
    // Approval action
    approvalAction: (0, pg_core_1.varchar)('approval_action', { length: 50 }), // APPROVED, REJECTED, REQUESTED_CHANGES
    approvalComment: (0, pg_core_1.text)('approval_comment'),
    // Metadata
    metadata: (0, pg_core_1.jsonb)('metadata').default('{}'),
}, (table) => [
    (0, pg_core_1.index)('workflow_transitions_workflow_idx').on(table.workflowId),
    (0, pg_core_1.index)('workflow_transitions_tenant_idx').on(table.tenantId),
    (0, pg_core_1.index)('workflow_transitions_triggered_at_idx').on(table.triggeredAt),
]);
// =============================================================================
// WORKFLOW JOBS TABLE (Redis Bull tracking)
// =============================================================================
exports.workflowJobs = exports.workflowSchema.table('workflow_jobs', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    workflowId: (0, pg_core_1.uuid)('workflow_id')
        .notNull()
        .references(() => exports.workflows.id, { onDelete: 'cascade' }),
    tenantId: (0, pg_core_1.uuid)('tenant_id').notNull(),
    // Job metadata
    jobType: (0, pg_core_1.varchar)('job_type', { length: 50 }).notNull(), // ECL_CALCULATION, NOTIFICATION, etc.
    jobId: (0, pg_core_1.varchar)('job_id', { length: 255 }), // Bull queue job ID
    jobName: (0, pg_core_1.varchar)('job_name', { length: 255 }),
    // Job status
    status: (0, pg_core_1.varchar)('status', { length: 50 }).notNull().default('QUEUED'), // QUEUED, PROCESSING, COMPLETED, FAILED, RETRY
    attempts: (0, pg_core_1.integer)('attempts').default(0),
    maxAttempts: (0, pg_core_1.integer)('max_attempts').default(3),
    // Execution tracking
    startedAt: (0, pg_core_1.timestamp)('started_at', { withTimezone: true }),
    completedAt: (0, pg_core_1.timestamp)('completed_at', { withTimezone: true }),
    errorMessage: (0, pg_core_1.text)('error_message'),
    result: (0, pg_core_1.jsonb)('result'),
    // Timestamps
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
    (0, pg_core_1.index)('workflow_jobs_workflow_idx').on(table.workflowId),
    (0, pg_core_1.index)('workflow_jobs_type_idx').on(table.jobType),
    (0, pg_core_1.index)('workflow_jobs_status_idx').on(table.status),
]);
// =============================================================================
// RELATIONS
// =============================================================================
exports.workflowsRelations = (0, drizzle_orm_1.relations)(exports.workflows, ({ one, many }) => ({
    tenant: one(platform_schema_1.tenants, {
        fields: [exports.workflows.tenantId],
        references: [platform_schema_1.tenants.id],
    }),
    requestedByUser: one(core_1.users, {
        fields: [exports.workflows.requestedBy],
        references: [core_1.users.id],
    }),
    transitions: many(exports.workflowTransitions),
    jobs: many(exports.workflowJobs),
}));
exports.workflowTransitionsRelations = (0, drizzle_orm_1.relations)(exports.workflowTransitions, ({ one }) => ({
    workflow: one(exports.workflows, {
        fields: [exports.workflowTransitions.workflowId],
        references: [exports.workflows.id],
    }),
    tenant: one(platform_schema_1.tenants, {
        fields: [exports.workflowTransitions.tenantId],
        references: [platform_schema_1.tenants.id],
    }),
    triggeredByUser: one(core_1.users, {
        fields: [exports.workflowTransitions.triggeredBy],
        references: [core_1.users.id],
    }),
}));
exports.workflowJobsRelations = (0, drizzle_orm_1.relations)(exports.workflowJobs, ({ one }) => ({
    workflow: one(exports.workflows, {
        fields: [exports.workflowJobs.workflowId],
        references: [exports.workflows.id],
    }),
    tenant: one(platform_schema_1.tenants, {
        fields: [exports.workflowJobs.tenantId],
        references: [platform_schema_1.tenants.id],
    }),
}));
