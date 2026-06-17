"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userActivityLogsRelations = exports.auditLogsRelations = exports.calculationAuditLogs = exports.dataAccessLogs = exports.userActivityLogs = exports.auditLogs = exports.auditSchema = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const core_1 = require("./core");
const platform_schema_1 = require("./platform.schema");
/**
 * Audit schema for audit-related tables
 */
exports.auditSchema = (0, pg_core_1.pgSchema)('audit');
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
exports.auditLogs = exports.auditSchema.table('audit_logs', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    // User context
    userId: (0, pg_core_1.uuid)('user_id'),
    // Tenant isolation - varchar to match actual database
    tenantId: (0, pg_core_1.varchar)('tenant_id', { length: 100 }).default('dana'),
    // Event details
    eventType: (0, pg_core_1.varchar)('event_type', { length: 50 }).notNull(),
    action: (0, pg_core_1.varchar)('action', { length: 100 }).notNull(),
    description: (0, pg_core_1.text)('description'),
    // Entity information
    entityType: (0, pg_core_1.varchar)('entity_type', { length: 50 }),
    entityId: (0, pg_core_1.uuid)('entity_id'),
    entityName: (0, pg_core_1.varchar)('entity_name', { length: 200 }),
    // Change tracking
    oldValues: (0, pg_core_1.jsonb)('old_values'),
    newValues: (0, pg_core_1.jsonb)('new_values'),
    changedFields: (0, pg_core_1.text)('changed_fields').array(),
    // Additional metadata
    metadata: (0, pg_core_1.jsonb)('metadata'),
    // Request context
    ipAddress: (0, pg_core_1.varchar)('ip_address', { length: 45 }),
    userAgent: (0, pg_core_1.text)('user_agent'),
    // Timestamps
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
    (0, pg_core_1.index)('audit_user_idx').on(table.userId),
    (0, pg_core_1.index)('audit_tenant_idx').on(table.tenantId),
    (0, pg_core_1.index)('audit_event_type_idx').on(table.eventType),
    (0, pg_core_1.index)('audit_action_idx').on(table.action),
    (0, pg_core_1.index)('audit_entity_type_idx').on(table.entityType),
    (0, pg_core_1.index)('audit_entity_id_idx').on(table.entityId),
    (0, pg_core_1.index)('audit_created_at_idx').on(table.createdAt),
    // Composite indexes for common queries
    (0, pg_core_1.index)('audit_tenant_event_time_idx').on(table.tenantId, table.eventType, table.createdAt),
    (0, pg_core_1.index)('audit_user_time_idx').on(table.userId, table.createdAt),
    (0, pg_core_1.index)('audit_entity_time_idx').on(table.entityType, table.entityId, table.createdAt),
]);
// =============================================================================
// USER ACTIVITY LOGS TABLE
// =============================================================================
/**
 * User activity logs table definition.
 * Tracks granular user interactions, page views, and API calls for analytics.
 */
exports.userActivityLogs = exports.auditSchema.table('user_activity_logs', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    userId: (0, pg_core_1.uuid)('user_id').notNull(),
    // tenantId: varchar('tenant_id', { length: 100 }), // Removed to prevent error
    activityType: (0, pg_core_1.varchar)('activity_type', { length: 100 }).notNull(),
    activityDescription: (0, pg_core_1.text)('activity_description'),
    // Page navigation
    pageUrl: (0, pg_core_1.varchar)('page_url', { length: 1000 }),
    pageTitle: (0, pg_core_1.varchar)('page_title', { length: 500 }),
    previousPage: (0, pg_core_1.varchar)('previous_page', { length: 1000 }),
    // API details
    endpoint: (0, pg_core_1.varchar)('endpoint', { length: 500 }),
    method: (0, pg_core_1.varchar)('method', { length: 10 }),
    statusCode: (0, pg_core_1.integer)('status_code'),
    responseTimeMs: (0, pg_core_1.integer)('response_time_ms'),
    // Session and device
    sessionId: (0, pg_core_1.varchar)('session_id', { length: 255 }),
    deviceInfo: (0, pg_core_1.jsonb)('device_info'),
    ipAddress: (0, pg_core_1.varchar)('ip_address', { length: 45 }),
    userAgent: (0, pg_core_1.text)('user_agent'),
    // Timestamps
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
}, (table) => [
    (0, pg_core_1.index)('user_activity_user_idx').on(table.userId),
    // index('user_activity_tenant_idx').on(table.tenantId),
    (0, pg_core_1.index)('user_activity_type_idx').on(table.activityType),
    (0, pg_core_1.index)('user_activity_created_at_idx').on(table.createdAt),
]);
// =============================================================================
// DATA ACCESS LOGS TABLE
// =============================================================================
/**
 * Data access logs table definition.
 * Records specific data access patterns (read, export, print) for compliance.
 */
exports.dataAccessLogs = exports.auditSchema.table('data_access_logs', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    userId: (0, pg_core_1.uuid)('user_id').notNull(),
    tenantId: (0, pg_core_1.uuid)('tenant_id'),
    accessType: (0, pg_core_1.varchar)('access_type', { length: 50 }).notNull(), // 'read', 'export', 'print'
    resourceType: (0, pg_core_1.varchar)('resource_type', { length: 100 }).notNull(),
    resourceId: (0, pg_core_1.varchar)('resource_id', { length: 255 }),
    recordCount: (0, pg_core_1.integer)('record_count'),
    purpose: (0, pg_core_1.text)('purpose'),
    ipAddress: (0, pg_core_1.varchar)('ip_address', { length: 45 }),
    timestamp: (0, pg_core_1.timestamp)('timestamp').notNull().defaultNow(),
}, (table) => [
    (0, pg_core_1.index)('data_access_user_idx').on(table.userId),
    (0, pg_core_1.index)('data_access_tenant_idx').on(table.tenantId),
    (0, pg_core_1.index)('data_access_resource_idx').on(table.resourceType, table.resourceId),
    (0, pg_core_1.index)('data_access_timestamp_idx').on(table.timestamp),
]);
// =============================================================================
// CALCULATION AUDIT LOGS TABLE
// =============================================================================
/**
 * Calculation audit logs table definition.
 * specialized audit log for tracking complex calculation jobs and their parameters.
 */
exports.calculationAuditLogs = exports.auditSchema.table('calculation_audit_logs', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    userId: (0, pg_core_1.uuid)('user_id').notNull(),
    tenantId: (0, pg_core_1.uuid)('tenant_id'),
    calculationType: (0, pg_core_1.varchar)('calculation_type', { length: 100 }).notNull(),
    calculationDate: (0, pg_core_1.timestamp)('calculation_date').notNull(),
    parameters: (0, pg_core_1.jsonb)('parameters'),
    inputSummary: (0, pg_core_1.jsonb)('input_summary'),
    outputSummary: (0, pg_core_1.jsonb)('output_summary'),
    status: (0, pg_core_1.varchar)('status', { length: 50 }).notNull(),
    errorMessage: (0, pg_core_1.text)('error_message'),
    executionTimeMs: (0, pg_core_1.integer)('execution_time_ms'),
    recordsProcessed: (0, pg_core_1.integer)('records_processed'),
    timestamp: (0, pg_core_1.timestamp)('timestamp').notNull().defaultNow(),
}, (table) => [
    (0, pg_core_1.index)('calc_audit_user_idx').on(table.userId),
    (0, pg_core_1.index)('calc_audit_tenant_idx').on(table.tenantId),
    (0, pg_core_1.index)('calc_audit_type_idx').on(table.calculationType),
    (0, pg_core_1.index)('calc_audit_date_idx').on(table.calculationDate),
    (0, pg_core_1.index)('calc_audit_status_idx').on(table.status),
    (0, pg_core_1.index)('calc_audit_timestamp_idx').on(table.timestamp),
]);
// =============================================================================
// RELATIONS
// =============================================================================
exports.auditLogsRelations = (0, drizzle_orm_1.relations)(exports.auditLogs, ({ one }) => ({
    user: one(core_1.users, {
        fields: [exports.auditLogs.userId],
        references: [core_1.users.id],
    }),
    tenant: one(platform_schema_1.tenants, {
        fields: [exports.auditLogs.tenantId],
        references: [platform_schema_1.tenants.id],
    }),
}));
exports.userActivityLogsRelations = (0, drizzle_orm_1.relations)(exports.userActivityLogs, ({ one }) => ({
    user: one(core_1.users, {
        fields: [exports.userActivityLogs.userId],
        references: [core_1.users.id],
    }),
    /*
    tenant: one(tenants, {
        fields: [userActivityLogs.tenantId],
        references: [tenants.id],
    }),
    */
}));
