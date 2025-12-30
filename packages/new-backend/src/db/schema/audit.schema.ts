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
import { tenants, users } from './core'

/**
 * Audit schema for audit-related tables
 */
export const auditSchema = pgSchema('audit')

// =============================================================================
// AUDIT LOGS TABLE
// =============================================================================

export const auditLogs = auditSchema.table(
    'audit_logs',
    {
        id: uuid('id').primaryKey().defaultRandom(),
        legacyId: integer('legacy_id'),

        // User and session context
        userId: uuid('user_id'),
        sessionId: varchar('session_id', { length: 255 }),
        correlationId: uuid('correlation_id').notNull().defaultRandom(),

        // Event details
        eventType: varchar('event_type', { length: 100 }).notNull(),
        action: varchar('action', { length: 100 }).notNull(),
        description: text('description'),

        // Entity information
        entityType: varchar('entity_type', { length: 100 }),
        entityId: varchar('entity_id', { length: 255 }),
        entityName: varchar('entity_name', { length: 200 }),

        // Change tracking
        oldValues: jsonb('old_values'),
        newValues: jsonb('new_values'),
        changedFields: jsonb('changed_fields').$type<string[]>(),

        // Request context
        ipAddress: varchar('ip_address', { length: 45 }),
        userAgent: text('user_agent'),
        requestPath: varchar('request_path', { length: 500 }),
        requestMethod: varchar('request_method', { length: 10 }),

        // Application context
        applicationName: varchar('application_name', { length: 100 }),
        moduleName: varchar('module_name', { length: 100 }),
        functionName: varchar('function_name', { length: 100 }),

        // Business context
        businessDate: timestamp('business_date'),
        calculationDate: timestamp('calculation_date'),

        // Risk and compliance
        riskLevel: varchar('risk_level', { length: 20 }).notNull().default('low'),
        complianceCategory: varchar('compliance_category', { length: 50 }),

        // Performance metrics
        executionTimeMs: integer('execution_time_ms'),

        // Tenant isolation
        tenantId: uuid('tenant_id'),

        // Timestamps
        timestamp: timestamp('timestamp').notNull().defaultNow(),
        createdAt: timestamp('created_at').notNull().defaultNow(),
    },
    (table) => [
        index('audit_user_idx').on(table.userId),
        index('audit_tenant_idx').on(table.tenantId),
        index('audit_event_type_idx').on(table.eventType),
        index('audit_action_idx').on(table.action),
        index('audit_entity_type_idx').on(table.entityType),
        index('audit_entity_id_idx').on(table.entityId),
        index('audit_timestamp_idx').on(table.timestamp),
        index('audit_business_date_idx').on(table.businessDate),
        index('audit_risk_level_idx').on(table.riskLevel),
        index('audit_compliance_category_idx').on(table.complianceCategory),
        index('audit_session_idx').on(table.sessionId),
        index('audit_correlation_idx').on(table.correlationId),
        index('audit_ip_address_idx').on(table.ipAddress),
        // Composite indexes for common queries
        index('audit_tenant_event_time_idx').on(table.tenantId, table.eventType, table.timestamp),
        index('audit_user_time_idx').on(table.userId, table.timestamp),
        index('audit_entity_time_idx').on(table.entityType, table.entityId, table.timestamp),
    ]
)

// =============================================================================
// USER ACTIVITY LOGS TABLE
// =============================================================================

export const userActivityLogs = auditSchema.table(
    'user_activity_logs',
    {
        id: uuid('id').primaryKey().defaultRandom(),
        userId: uuid('user_id').notNull(),
        tenantId: uuid('tenant_id'),
        activityType: varchar('activity_type', { length: 100 }).notNull(),
        description: text('description'),
        metadata: jsonb('metadata'),
        ipAddress: varchar('ip_address', { length: 45 }),
        userAgent: text('user_agent'),
        sessionId: varchar('session_id', { length: 255 }),
        timestamp: timestamp('timestamp').notNull().defaultNow(),
    },
    (table) => [
        index('user_activity_user_idx').on(table.userId),
        index('user_activity_tenant_idx').on(table.tenantId),
        index('user_activity_type_idx').on(table.activityType),
        index('user_activity_timestamp_idx').on(table.timestamp),
    ]
)

// =============================================================================
// DATA ACCESS LOGS TABLE
// =============================================================================

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
    tenant: one(tenants, {
        fields: [userActivityLogs.tenantId],
        references: [tenants.id],
    }),
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
