"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationPreferencesRelations = exports.notificationDeliveriesRelations = exports.notificationsRelations = exports.approvalActionsRelations = exports.approvalRequestsRelations = exports.approvalLevelsRelations = exports.approvalMatricesRelations = exports.notificationPreferences = exports.notificationDeliveries = exports.notifications = exports.approvalActions = exports.approvalRequests = exports.approvalLevels = exports.approvalMatrices = exports.approvalSchema = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const core_1 = require("./core");
const platform_schema_1 = require("./platform.schema");
/**
 * Approval schema for multi-level approval workflow
 * Uses dedicated 'approval' schema for approval-related tables
 */
exports.approvalSchema = (0, pg_core_1.pgSchema)('approval');
// =============================================================================
// APPROVAL MATRICES - Define approval rules per entity type
// =============================================================================
exports.approvalMatrices = exports.approvalSchema.table('approval_matrices', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    tenantId: (0, pg_core_1.uuid)('tenant_id').references(() => platform_schema_1.tenants.id),
    name: (0, pg_core_1.varchar)('name', { length: 255 }).notNull(),
    description: (0, pg_core_1.text)('description'),
    entityType: (0, pg_core_1.varchar)('entity_type', { length: 100 }).notNull(), // 'user', 'transaction', 'config'
    operationType: (0, pg_core_1.varchar)('operation_type', { length: 100 }), // 'create', 'update', 'delete'
    bankingMode: (0, pg_core_1.varchar)('banking_mode', { length: 20 }), // 'conventional', 'syariah', 'dual'
    amountThresholds: (0, pg_core_1.jsonb)('amount_thresholds').$type(),
    riskThresholds: (0, pg_core_1.jsonb)('risk_thresholds').$type(),
    autoApprovalRules: (0, pg_core_1.jsonb)('auto_approval_rules'),
    escalationRules: (0, pg_core_1.jsonb)('escalation_rules'),
    syariahBoardRequired: (0, pg_core_1.boolean)('syariah_board_required').default(false),
    isActive: (0, pg_core_1.boolean)('is_active').notNull().default(true),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').notNull().defaultNow(),
}, (table) => [
    (0, pg_core_1.index)('approval_matrices_tenant_idx').on(table.tenantId),
    (0, pg_core_1.index)('approval_matrices_entity_idx').on(table.entityType),
    (0, pg_core_1.index)('approval_matrices_active_idx').on(table.isActive),
]);
// =============================================================================
// APPROVAL LEVELS - Define who can approve at each level
// =============================================================================
exports.approvalLevels = exports.approvalSchema.table('approval_levels', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    matrixId: (0, pg_core_1.uuid)('matrix_id')
        .notNull()
        .references(() => exports.approvalMatrices.id, { onDelete: 'cascade' }),
    level: (0, pg_core_1.integer)('level').notNull(), // 1, 2, 3...
    name: (0, pg_core_1.varchar)('name', { length: 100 }).notNull(),
    description: (0, pg_core_1.text)('description'),
    requiredRoleCodes: (0, pg_core_1.jsonb)('required_role_codes').$type().notNull().default([]),
    requiredPermissionCodes: (0, pg_core_1.jsonb)('required_permission_codes')
        .$type()
        .notNull()
        .default(['approval.requests.approve']),
    roleMatchMode: (0, pg_core_1.varchar)('role_match_mode', { length: 10 }).notNull().default('ANY'),
    permissionMatchMode: (0, pg_core_1.varchar)('permission_match_mode', { length: 10 }).notNull().default('ANY'),
    requiredCount: (0, pg_core_1.integer)('required_count').notNull().default(1),
    maxAmount: (0, pg_core_1.integer)('max_amount'), // Amount limit for this level
    conditions: (0, pg_core_1.jsonb)('conditions').$type(),
    timeoutHours: (0, pg_core_1.integer)('timeout_hours').default(24),
    canDelegate: (0, pg_core_1.boolean)('can_delegate').default(true),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
}, (table) => [
    (0, pg_core_1.index)('approval_levels_matrix_idx').on(table.matrixId),
    (0, pg_core_1.index)('approval_levels_level_idx').on(table.level),
]);
// =============================================================================
// APPROVAL REQUESTS - Pending and completed approval items
// =============================================================================
exports.approvalRequests = exports.approvalSchema.table('approval_requests', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    matrixId: (0, pg_core_1.uuid)('matrix_id').references(() => exports.approvalMatrices.id),
    tenantId: (0, pg_core_1.uuid)('tenant_id')
        .notNull()
        .references(() => platform_schema_1.tenants.id),
    entityType: (0, pg_core_1.varchar)('entity_type', { length: 100 }).notNull(),
    entityId: (0, pg_core_1.varchar)('entity_id', { length: 100 }),
    title: (0, pg_core_1.varchar)('title', { length: 500 }).notNull(),
    description: (0, pg_core_1.text)('description'),
    requestData: (0, pg_core_1.jsonb)('request_data').$type(),
    requestedBy: (0, pg_core_1.uuid)('requested_by')
        .notNull()
        .references(() => core_1.users.id),
    impactLevel: (0, pg_core_1.varchar)('impact_level', { length: 20 }).default('medium'), // low, medium, high, critical
    currentLevel: (0, pg_core_1.integer)('current_level').notNull().default(1),
    approvalsRequired: (0, pg_core_1.integer)('approvals_required').notNull().default(1),
    approvalsReceived: (0, pg_core_1.integer)('approvals_received').notNull().default(0),
    status: (0, pg_core_1.varchar)('status', { length: 20 }).notNull().default('pending'), // pending, approved, rejected, cancelled, expired
    expiresAt: (0, pg_core_1.timestamp)('expires_at'),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
    completedAt: (0, pg_core_1.timestamp)('completed_at'),
    completedBy: (0, pg_core_1.uuid)('completed_by').references(() => core_1.users.id),
}, (table) => [
    (0, pg_core_1.index)('approval_requests_tenant_idx').on(table.tenantId),
    (0, pg_core_1.index)('approval_requests_status_idx').on(table.status),
    (0, pg_core_1.index)('approval_requests_requester_idx').on(table.requestedBy),
    (0, pg_core_1.index)('approval_requests_entity_idx').on(table.entityType, table.entityId),
    (0, pg_core_1.index)('approval_requests_expires_idx').on(table.expiresAt),
]);
// =============================================================================
// APPROVAL ACTIONS - Individual approve/reject/delegate actions
// =============================================================================
exports.approvalActions = exports.approvalSchema.table('approval_actions', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    requestId: (0, pg_core_1.uuid)('request_id')
        .notNull()
        .references(() => exports.approvalRequests.id, { onDelete: 'cascade' }),
    approverId: (0, pg_core_1.uuid)('approver_id')
        .notNull()
        .references(() => core_1.users.id),
    approverRole: (0, pg_core_1.varchar)('approver_role', { length: 100 }),
    level: (0, pg_core_1.integer)('level').notNull(),
    action: (0, pg_core_1.varchar)('action', { length: 20 }).notNull(), // approve, reject, request_info, delegate
    comment: (0, pg_core_1.text)('comment'),
    conditions: (0, pg_core_1.text)('conditions'), // Approval with conditions
    delegatedTo: (0, pg_core_1.uuid)('delegated_to').references(() => core_1.users.id),
    delegationReason: (0, pg_core_1.text)('delegation_reason'),
    riskAssessment: (0, pg_core_1.jsonb)('risk_assessment'),
    riskScore: (0, pg_core_1.integer)('risk_score'),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
}, (table) => [
    (0, pg_core_1.index)('approval_actions_request_idx').on(table.requestId),
    (0, pg_core_1.index)('approval_actions_approver_idx').on(table.approverId),
    (0, pg_core_1.index)('approval_actions_action_idx').on(table.action),
]);
// =============================================================================
// NOTIFICATIONS - Persisted in-app notifications
// =============================================================================
exports.notifications = exports.approvalSchema.table('notifications', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    tenantId: (0, pg_core_1.uuid)('tenant_id')
        .notNull()
        .references(() => platform_schema_1.tenants.id),
    approvalRequestId: (0, pg_core_1.uuid)('approval_request_id').references(() => exports.approvalRequests.id, { onDelete: 'set null' }),
    workflowId: (0, pg_core_1.varchar)('workflow_id', { length: 100 }),
    type: (0, pg_core_1.varchar)('type', { length: 50 }).notNull(), // APPROVAL_PENDING, APPROVAL_APPROVED, etc.
    severity: (0, pg_core_1.varchar)('severity', { length: 20 }).notNull().default('info'), // info, warning, success, error
    title: (0, pg_core_1.varchar)('title', { length: 255 }).notNull(),
    message: (0, pg_core_1.text)('message').notNull(),
    actionUrl: (0, pg_core_1.varchar)('action_url', { length: 500 }),
    entityType: (0, pg_core_1.varchar)('entity_type', { length: 100 }),
    entityId: (0, pg_core_1.varchar)('entity_id', { length: 100 }),
    source: (0, pg_core_1.varchar)('source', { length: 100 }).notNull().default('approval_service'),
    triggeredBy: (0, pg_core_1.uuid)('triggered_by').references(() => core_1.users.id, { onDelete: 'set null' }),
    metadata: (0, pg_core_1.jsonb)('metadata'),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
}, (table) => [
    (0, pg_core_1.index)('notifications_tenant_idx').on(table.tenantId),
    (0, pg_core_1.index)('notifications_type_idx').on(table.type),
    (0, pg_core_1.index)('notifications_request_idx').on(table.approvalRequestId),
    (0, pg_core_1.index)('notifications_created_idx').on(table.createdAt),
]);
exports.notificationDeliveries = exports.approvalSchema.table('notification_deliveries', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    notificationId: (0, pg_core_1.uuid)('notification_id')
        .notNull()
        .references(() => exports.notifications.id, { onDelete: 'cascade' }),
    tenantId: (0, pg_core_1.uuid)('tenant_id')
        .notNull()
        .references(() => platform_schema_1.tenants.id),
    recipientUserId: (0, pg_core_1.uuid)('recipient_user_id').references(() => core_1.users.id, { onDelete: 'cascade' }),
    recipientRole: (0, pg_core_1.varchar)('recipient_role', { length: 100 }),
    channel: (0, pg_core_1.varchar)('channel', { length: 20 }).notNull().default('in_app'), // in_app, socket, email, webhook
    deliveryStatus: (0, pg_core_1.varchar)('delivery_status', { length: 20 }).notNull().default('sent'), // pending, sent, failed, read
    deliveredAt: (0, pg_core_1.timestamp)('delivered_at').defaultNow(),
    readAt: (0, pg_core_1.timestamp)('read_at'),
    errorMessage: (0, pg_core_1.text)('error_message'),
    metadata: (0, pg_core_1.jsonb)('metadata'),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').notNull().defaultNow(),
}, (table) => [
    (0, pg_core_1.index)('notification_deliveries_notification_idx').on(table.notificationId),
    (0, pg_core_1.index)('notification_deliveries_tenant_idx').on(table.tenantId),
    (0, pg_core_1.index)('notification_deliveries_user_status_idx').on(table.recipientUserId, table.deliveryStatus),
    (0, pg_core_1.index)('notification_deliveries_role_idx').on(table.recipientRole),
    (0, pg_core_1.index)('notification_deliveries_created_idx').on(table.createdAt),
]);
exports.notificationPreferences = exports.approvalSchema.table('notification_preferences', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    tenantId: (0, pg_core_1.uuid)('tenant_id')
        .notNull()
        .references(() => platform_schema_1.tenants.id),
    userId: (0, pg_core_1.uuid)('user_id')
        .notNull()
        .references(() => core_1.users.id, { onDelete: 'cascade' }),
    muteAll: (0, pg_core_1.boolean)('mute_all').notNull().default(false),
    mutedCategories: (0, pg_core_1.jsonb)('muted_categories').$type().notNull().default([]),
    quietHoursEnabled: (0, pg_core_1.boolean)('quiet_hours_enabled').notNull().default(false),
    quietHoursStart: (0, pg_core_1.varchar)('quiet_hours_start', { length: 5 }).notNull().default('22:00'),
    quietHoursEnd: (0, pg_core_1.varchar)('quiet_hours_end', { length: 5 }).notNull().default('07:00'),
    timezone: (0, pg_core_1.varchar)('timezone', { length: 64 }).notNull().default('Asia/Jakarta'),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').notNull().defaultNow(),
}, (table) => [
    (0, pg_core_1.index)('notification_preferences_tenant_idx').on(table.tenantId),
    (0, pg_core_1.index)('notification_preferences_user_idx').on(table.userId),
    (0, pg_core_1.index)('notification_preferences_tenant_user_idx').on(table.tenantId, table.userId),
]);
// =============================================================================
// RELATIONS
// =============================================================================
exports.approvalMatricesRelations = (0, drizzle_orm_1.relations)(exports.approvalMatrices, ({ one, many }) => ({
    tenant: one(platform_schema_1.tenants, {
        fields: [exports.approvalMatrices.tenantId],
        references: [platform_schema_1.tenants.id],
    }),
    levels: many(exports.approvalLevels),
    requests: many(exports.approvalRequests),
}));
exports.approvalLevelsRelations = (0, drizzle_orm_1.relations)(exports.approvalLevels, ({ one }) => ({
    matrix: one(exports.approvalMatrices, {
        fields: [exports.approvalLevels.matrixId],
        references: [exports.approvalMatrices.id],
    }),
}));
exports.approvalRequestsRelations = (0, drizzle_orm_1.relations)(exports.approvalRequests, ({ one, many }) => ({
    tenant: one(platform_schema_1.tenants, {
        fields: [exports.approvalRequests.tenantId],
        references: [platform_schema_1.tenants.id],
    }),
    matrix: one(exports.approvalMatrices, {
        fields: [exports.approvalRequests.matrixId],
        references: [exports.approvalMatrices.id],
    }),
    requester: one(core_1.users, {
        fields: [exports.approvalRequests.requestedBy],
        references: [core_1.users.id],
    }),
    actions: many(exports.approvalActions),
    notifications: many(exports.notifications),
}));
exports.approvalActionsRelations = (0, drizzle_orm_1.relations)(exports.approvalActions, ({ one }) => ({
    request: one(exports.approvalRequests, {
        fields: [exports.approvalActions.requestId],
        references: [exports.approvalRequests.id],
    }),
    approver: one(core_1.users, {
        fields: [exports.approvalActions.approverId],
        references: [core_1.users.id],
    }),
    delegatedUser: one(core_1.users, {
        fields: [exports.approvalActions.delegatedTo],
        references: [core_1.users.id],
    }),
}));
exports.notificationsRelations = (0, drizzle_orm_1.relations)(exports.notifications, ({ one, many }) => ({
    tenant: one(platform_schema_1.tenants, {
        fields: [exports.notifications.tenantId],
        references: [platform_schema_1.tenants.id],
    }),
    approvalRequest: one(exports.approvalRequests, {
        fields: [exports.notifications.approvalRequestId],
        references: [exports.approvalRequests.id],
    }),
    triggerUser: one(core_1.users, {
        fields: [exports.notifications.triggeredBy],
        references: [core_1.users.id],
    }),
    deliveries: many(exports.notificationDeliveries),
}));
exports.notificationDeliveriesRelations = (0, drizzle_orm_1.relations)(exports.notificationDeliveries, ({ one }) => ({
    notification: one(exports.notifications, {
        fields: [exports.notificationDeliveries.notificationId],
        references: [exports.notifications.id],
    }),
    tenant: one(platform_schema_1.tenants, {
        fields: [exports.notificationDeliveries.tenantId],
        references: [platform_schema_1.tenants.id],
    }),
    recipientUser: one(core_1.users, {
        fields: [exports.notificationDeliveries.recipientUserId],
        references: [core_1.users.id],
    }),
}));
exports.notificationPreferencesRelations = (0, drizzle_orm_1.relations)(exports.notificationPreferences, ({ one }) => ({
    tenant: one(platform_schema_1.tenants, {
        fields: [exports.notificationPreferences.tenantId],
        references: [platform_schema_1.tenants.id],
    }),
    user: one(core_1.users, {
        fields: [exports.notificationPreferences.userId],
        references: [core_1.users.id],
    }),
}));
