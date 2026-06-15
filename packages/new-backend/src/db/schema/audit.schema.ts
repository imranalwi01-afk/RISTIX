import {
    pgSchema,
    uuid,
    varchar,
    text,
    boolean,
    integer,
    timestamp,
    jsonb,
    index,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { users } from './core'
import { tenants } from './platform.schema'

/**
 * Audit schema for audit-related tables
 */
export const auditSchema = pgSchema('audit')

// =============================================================================
// AUDIT LOGS TABLE
// =============================================================================

// =============================================================================
// AUDIT LOGS TABLE
// =============================================================================

/**
 * Audit logs table definition.
 * Stores system-wide audit trail for critical actions and data changes.
 */
export const auditLogs = auditSchema.table(
    'audit_logs',
    {
        id: uuid('id').primaryKey().defaultRandom(),

        // User context
        userId: uuid('user_id'),

        // Tenant isolation - varchar to match actual database
        tenantId: varchar('tenant_id', { length: 100 }).default('dana'),

        // Event details
        eventType: varchar('event_type', { length: 50 }).notNull(),
        action: varchar('action', { length: 100 }).notNull(),
        description: text('description'),

        // Entity information
        entityType: varchar('entity_type', { length: 50 }),
        entityId: uuid('entity_id'),
        entityName: varchar('entity_name', { length: 200 }),

        // Change tracking
        oldValues: jsonb('old_values'),
        newValues: jsonb('new_values'),
        changedFields: text('changed_fields').array(),

        // Additional metadata
        metadata: jsonb('metadata'),

        // Request context
        ipAddress: varchar('ip_address', { length: 45 }),
        userAgent: text('user_agent'),

        // Timestamps
        createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    },
    (table) => [
        index('audit_user_idx').on(table.userId),
        index('audit_tenant_idx').on(table.tenantId),
        index('audit_event_type_idx').on(table.eventType),
        index('audit_action_idx').on(table.action),
        index('audit_entity_type_idx').on(table.entityType),
        index('audit_entity_id_idx').on(table.entityId),
        index('audit_created_at_idx').on(table.createdAt),
        // Composite indexes for common queries
        index('audit_tenant_event_time_idx').on(table.tenantId, table.eventType, table.createdAt),
        index('audit_user_time_idx').on(table.userId, table.createdAt),
        index('audit_entity_time_idx').on(table.entityType, table.entityId, table.createdAt),
    ]
)

// =============================================================================
// USER ACTIVITY LOGS TABLE
// =============================================================================

/**
 * User activity logs table definition.
 * Tracks granular user interactions, page views, and API calls for analytics.
 */
export const userActivityLogs = auditSchema.table(
    'user_activity_logs',
    {
        id: uuid('id').primaryKey().defaultRandom(),
        userId: uuid('user_id').notNull(),
        // tenantId: varchar('tenant_id', { length: 100 }), // Removed to prevent error
        activityType: varchar('activity_type', { length: 100 }).notNull(),
        activityDescription: text('activity_description'),

        // Page navigation
        pageUrl: varchar('page_url', { length: 1000 }),
        pageTitle: varchar('page_title', { length: 500 }),
        previousPage: varchar('previous_page', { length: 1000 }),

        // API details
        endpoint: varchar('endpoint', { length: 500 }),
        method: varchar('method', { length: 10 }),
        statusCode: integer('status_code'),
        responseTimeMs: integer('response_time_ms'),

        // Session and device
        sessionId: varchar('session_id', { length: 255 }),
        deviceInfo: jsonb('device_info'),
        ipAddress: varchar('ip_address', { length: 45 }),
        userAgent: text('user_agent'),

        // Timestamps
        createdAt: timestamp('created_at').notNull().defaultNow(),
    },
    (table) => [
        index('user_activity_user_idx').on(table.userId),
        // index('user_activity_tenant_idx').on(table.tenantId),
        index('user_activity_type_idx').on(table.activityType),
        index('user_activity_created_at_idx').on(table.createdAt),
    ]
)

// =============================================================================
// DATA ACCESS LOGS TABLE
// =============================================================================

/**
 * Data access logs table definition.
 * Records specific data access patterns (read, export, print) for compliance.
 */
export const dataAccessLogs = auditSchema.table(
    'data_access_logs',
    {
        id: uuid('id').primaryKey().defaultRandom(),
        userId: uuid('user_id').notNull(),
        tenantId: uuid('tenant_id'),
        accessType: varchar('access_type', { length: 50 }).notNull(), // 'read', 'export', 'print'
        resourceType: varchar('resource_type', { length: 100 }).notNull(),
        resourceId: varchar('resource_id', { length: 255 }),
        recordCount: integer('record_count'),
        purpose: text('purpose'),
        ipAddress: varchar('ip_address', { length: 45 }),
        timestamp: timestamp('timestamp').notNull().defaultNow(),
    },
    (table) => [
        index('data_access_user_idx').on(table.userId),
        index('data_access_tenant_idx').on(table.tenantId),
        index('data_access_resource_idx').on(table.resourceType, table.resourceId),
        index('data_access_timestamp_idx').on(table.timestamp),
    ]
)

// =============================================================================
// CALCULATION AUDIT LOGS TABLE
// =============================================================================

/**
 * Calculation audit logs table definition.
 * specialized audit log for tracking complex calculation jobs and their parameters.
 */
export const calculationAuditLogs = auditSchema.table(
    'calculation_audit_logs',
    {
        id: uuid('id').primaryKey().defaultRandom(),
        userId: uuid('user_id').notNull(),
        tenantId: uuid('tenant_id'),
        calculationType: varchar('calculation_type', { length: 100 }).notNull(),
        calculationDate: timestamp('calculation_date').notNull(),
        parameters: jsonb('parameters'),
        inputSummary: jsonb('input_summary'),
        outputSummary: jsonb('output_summary'),
        status: varchar('status', { length: 50 }).notNull(),
        errorMessage: text('error_message'),
        executionTimeMs: integer('execution_time_ms'),
        recordsProcessed: integer('records_processed'),
        timestamp: timestamp('timestamp').notNull().defaultNow(),
    },
    (table) => [
        index('calc_audit_user_idx').on(table.userId),
        index('calc_audit_tenant_idx').on(table.tenantId),
        index('calc_audit_type_idx').on(table.calculationType),
        index('calc_audit_date_idx').on(table.calculationDate),
        index('calc_audit_status_idx').on(table.status),
        index('calc_audit_timestamp_idx').on(table.timestamp),
    ]
)

// =============================================================================
// RELATIONS
// =============================================================================

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
    user: one(users, {
        fields: [auditLogs.userId],
        references: [users.id],
    }),
    tenant: one(tenants, {
        fields: [auditLogs.tenantId],
        references: [tenants.id],
    }),
}))

export const userActivityLogsRelations = relations(userActivityLogs, ({ one }) => ({
    user: one(users, {
        fields: [userActivityLogs.userId],
        references: [users.id],
    }),
    /*
    tenant: one(tenants, {
        fields: [userActivityLogs.tenantId],
        references: [tenants.id],
    }),
    */
}))

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type AuditLog = typeof auditLogs.$inferSelect
export type NewAuditLog = typeof auditLogs.$inferInsert

export type UserActivityLog = typeof userActivityLogs.$inferSelect
export type NewUserActivityLog = typeof userActivityLogs.$inferInsert

export type DataAccessLog = typeof dataAccessLogs.$inferSelect
export type NewDataAccessLog = typeof dataAccessLogs.$inferInsert

export type CalculationAuditLog = typeof calculationAuditLogs.$inferSelect
export type NewCalculationAuditLog = typeof calculationAuditLogs.$inferInsert
