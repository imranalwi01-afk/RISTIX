import {
    pgSchema,
    uuid,
    varchar,
    text,
    boolean,
    integer,
    timestamp,
    jsonb,
    uniqueIndex,
    index,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { tenants, users } from './core'

/**
 * Workflow schema for approval state machines, ECL tracking, and audit logs
 */
export const workflowSchema = pgSchema('core')

// =============================================================================
// WORKFLOWS STATE MACHINE TABLE
// =============================================================================

export const workflows = workflowSchema.table(
    'workflows',
    {
        id: uuid('id').primaryKey().defaultRandom(),
        tenantId: uuid('tenant_id').notNull(),
        
        // Workflow metadata
        workflowType: varchar('workflow_type', { length: 50 }).notNull(), // 'APPROVAL', 'ECL_CALCULATION', etc.
        workflowName: varchar('workflow_name', { length: 255 }).notNull(),
        description: text('description'),
        
        // Entity reference
        entityType: varchar('entity_type', { length: 50 }).notNull(),
        entityId: uuid('entity_id').notNull(),
        
        // State tracking
        currentState: varchar('current_state', { length: 50 }).notNull().default('PENDING'),
        previousState: varchar('previous_state', { length: 50 }),
        
        // Approval fields
        requestedBy: uuid('requested_by'),
        requestReason: text('request_reason'),
        
        // Timestamps
        createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
        updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
        expectedCompletionAt: timestamp('expected_completion_at', { withTimezone: true }),
        completedAt: timestamp('completed_at', { withTimezone: true }),
        
        // Metadata and status
        metadata: jsonb('metadata').default('{}'),
        isActive: boolean('is_active').notNull().default(true),
    },
    (table) => [
        index('workflows_tenant_idx').on(table.tenantId),
        index('workflows_type_idx').on(table.workflowType),
        index('workflows_state_idx').on(table.currentState),
        index('workflows_entity_idx').on(table.entityType, table.entityId),
        index('workflows_created_idx').on(table.createdAt),
    ]
)

// =============================================================================
// WORKFLOW TRANSITIONS AUDIT TABLE
// =============================================================================

export const workflowTransitions = workflowSchema.table(
    'workflow_transitions',
    {
        id: uuid('id').primaryKey().defaultRandom(),
        workflowId: uuid('workflow_id')
            .notNull()
            .references(() => workflows.id, { onDelete: 'cascade' }),
        tenantId: uuid('tenant_id').notNull(),
        
        // Transition details
        fromState: varchar('from_state', { length: 50 }).notNull(),
        toState: varchar('to_state', { length: 50 }).notNull(),
        transitionReason: varchar('transition_reason', { length: 255 }),
        transitionNotes: text('transition_notes'),
        
        // Who triggered
        triggeredBy: uuid('triggered_by'),
        triggeredAt: timestamp('triggered_at', { withTimezone: true }).notNull().defaultNow(),
        
        // Approval action
        approvalAction: varchar('approval_action', { length: 50 }), // APPROVED, REJECTED, REQUESTED_CHANGES
        approvalComment: text('approval_comment'),
        
        // Metadata
        metadata: jsonb('metadata').default('{}'),
    },
    (table) => [
        index('workflow_transitions_workflow_idx').on(table.workflowId),
        index('workflow_transitions_tenant_idx').on(table.tenantId),
        index('workflow_transitions_triggered_at_idx').on(table.triggeredAt),
    ]
)

// =============================================================================
// WORKFLOW JOBS TABLE (Redis Bull tracking)
// =============================================================================

export const workflowJobs = workflowSchema.table(
    'workflow_jobs',
    {
        id: uuid('id').primaryKey().defaultRandom(),
        workflowId: uuid('workflow_id')
            .notNull()
            .references(() => workflows.id, { onDelete: 'cascade' }),
        tenantId: uuid('tenant_id').notNull(),
        
        // Job metadata
        jobType: varchar('job_type', { length: 50 }).notNull(), // ECL_CALCULATION, NOTIFICATION, etc.
        jobId: varchar('job_id', { length: 255 }), // Bull queue job ID
        jobName: varchar('job_name', { length: 255 }),
        
        // Job status
        status: varchar('status', { length: 50 }).notNull().default('QUEUED'), // QUEUED, PROCESSING, COMPLETED, FAILED, RETRY
        attempts: integer('attempts').default(0),
        maxAttempts: integer('max_attempts').default(3),
        
        // Execution tracking
        startedAt: timestamp('started_at', { withTimezone: true }),
        completedAt: timestamp('completed_at', { withTimezone: true }),
        errorMessage: text('error_message'),
        result: jsonb('result'),
        
        // Timestamps
        createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
        updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    },
    (table) => [
        index('workflow_jobs_workflow_idx').on(table.workflowId),
        index('workflow_jobs_type_idx').on(table.jobType),
        index('workflow_jobs_status_idx').on(table.status),
    ]
)

// =============================================================================
// RELATIONS
// =============================================================================

export const workflowsRelations = relations(workflows, ({ one, many }) => ({
    tenant: one(tenants, {
        fields: [workflows.tenantId],
        references: [tenants.id],
    }),
    requestedByUser: one(users, {
        fields: [workflows.requestedBy],
        references: [users.id],
    }),
    transitions: many(workflowTransitions),
    jobs: many(workflowJobs),
}))

export const workflowTransitionsRelations = relations(workflowTransitions, ({ one }) => ({
    workflow: one(workflows, {
        fields: [workflowTransitions.workflowId],
        references: [workflows.id],
    }),
    tenant: one(tenants, {
        fields: [workflowTransitions.tenantId],
        references: [tenants.id],
    }),
    triggeredByUser: one(users, {
        fields: [workflowTransitions.triggeredBy],
        references: [users.id],
    }),
}))

export const workflowJobsRelations = relations(workflowJobs, ({ one }) => ({
    workflow: one(workflows, {
        fields: [workflowJobs.workflowId],
        references: [workflows.id],
    }),
    tenant: one(tenants, {
        fields: [workflowJobs.tenantId],
        references: [tenants.id],
    }),
}))

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type Workflow = typeof workflows.$inferSelect
export type NewWorkflow = typeof workflows.$inferInsert

export type WorkflowTransition = typeof workflowTransitions.$inferSelect
export type NewWorkflowTransition = typeof workflowTransitions.$inferInsert

export type WorkflowJob = typeof workflowJobs.$inferSelect
export type NewWorkflowJob = typeof workflowJobs.$inferInsert
