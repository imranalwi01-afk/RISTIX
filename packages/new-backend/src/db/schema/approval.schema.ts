import {
    pgSchema,
    uuid,
    varchar,
    text,
    timestamp,
    boolean,
    integer,
    jsonb,
    index,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { users } from './core'
import { tenants } from './platform.schema'

/**
 * Approval schema for multi-level approval workflow
 * Uses dedicated 'approval' schema for approval-related tables
 */
export const approvalSchema = pgSchema('approval')

// =============================================================================
// APPROVAL MATRICES - Define approval rules per entity type
// =============================================================================

export const approvalMatrices = approvalSchema.table(
    'approval_matrices',
    {
        id: uuid('id').primaryKey().defaultRandom(),
        tenantId: uuid('tenant_id').references(() => tenants.id),
        name: varchar('name', { length: 255 }).notNull(),
        description: text('description'),
        entityType: varchar('entity_type', { length: 100 }).notNull(), // 'user', 'transaction', 'config'
        operationType: varchar('operation_type', { length: 100 }), // 'create', 'update', 'delete'
        bankingMode: varchar('banking_mode', { length: 20 }), // 'conventional', 'syariah', 'dual'
        amountThresholds: jsonb('amount_thresholds').$type<{
            low?: number
            medium?: number
            high?: number
            critical?: number
        }>(),
        riskThresholds: jsonb('risk_thresholds').$type<{
            low?: number
            medium?: number
            high?: number
        }>(),
        autoApprovalRules: jsonb('auto_approval_rules'),
        escalationRules: jsonb('escalation_rules'),
        syariahBoardRequired: boolean('syariah_board_required').default(false),
        isActive: boolean('is_active').notNull().default(true),
        createdAt: timestamp('created_at').notNull().defaultNow(),
        updatedAt: timestamp('updated_at').notNull().defaultNow(),
    },
    (table) => [
        index('approval_matrices_tenant_idx').on(table.tenantId),
        index('approval_matrices_entity_idx').on(table.entityType),
        index('approval_matrices_active_idx').on(table.isActive),
    ]
)

// =============================================================================
// APPROVAL LEVELS - Define who can approve at each level
// =============================================================================

export const approvalLevels = approvalSchema.table(
    'approval_levels',
    {
        id: uuid('id').primaryKey().defaultRandom(),
        matrixId: uuid('matrix_id')
            .notNull()
            .references(() => approvalMatrices.id, { onDelete: 'cascade' }),
        level: integer('level').notNull(), // 1, 2, 3...
        name: varchar('name', { length: 100 }).notNull(),
        description: text('description'),
        requiredRoleCodes: jsonb('required_role_codes').$type<string[]>().notNull().default(['approval.requests.approve']),
        requiredPermissionCodes: jsonb('required_permission_codes')
            .$type<string[]>()
            .notNull()
            .default(['approval.requests.approve']),
        roleMatchMode: varchar('role_match_mode', { length: 10 }).notNull().default('ANY'),
        permissionMatchMode: varchar('permission_match_mode', { length: 10 }).notNull().default('ANY'),
        requiredCount: integer('required_count').notNull().default(1),
        maxAmount: integer('max_amount'), // Amount limit for this level
        conditions: jsonb('conditions').$type<Record<string, unknown>>(),
        timeoutHours: integer('timeout_hours').default(24),
        canDelegate: boolean('can_delegate').default(true),
        createdAt: timestamp('created_at').notNull().defaultNow(),
    },
    (table) => [
        index('approval_levels_matrix_idx').on(table.matrixId),
        index('approval_levels_level_idx').on(table.level),
    ]
)

// =============================================================================
// APPROVAL REQUESTS - Pending and completed approval items
// =============================================================================

export const approvalRequests = approvalSchema.table(
    'approval_requests',
    {
        id: uuid('id').primaryKey().defaultRandom(),
        matrixId: uuid('matrix_id').references(() => approvalMatrices.id),
        tenantId: uuid('tenant_id')
            .notNull()
            .references(() => tenants.id),
        entityType: varchar('entity_type', { length: 100 }).notNull(),
        entityId: varchar('entity_id', { length: 100 }),
        title: varchar('title', { length: 500 }).notNull(),
        description: text('description'),
        requestData: jsonb('request_data').$type<Record<string, unknown>>(),
        requestedBy: uuid('requested_by')
            .notNull()
            .references(() => users.id),
        impactLevel: varchar('impact_level', { length: 20 }).default('medium'), // low, medium, high, critical
        currentLevel: integer('current_level').notNull().default(1),
        approvalsRequired: integer('approvals_required').notNull().default(1),
        approvalsReceived: integer('approvals_received').notNull().default(0),
        status: varchar('status', { length: 20 }).notNull().default('pending'), // pending, approved, rejected, cancelled, expired
        expiresAt: timestamp('expires_at'),
        createdAt: timestamp('created_at').notNull().defaultNow(),
        completedAt: timestamp('completed_at'),
        completedBy: uuid('completed_by').references(() => users.id),
    },
    (table) => [
        index('approval_requests_tenant_idx').on(table.tenantId),
        index('approval_requests_status_idx').on(table.status),
        index('approval_requests_requester_idx').on(table.requestedBy),
        index('approval_requests_entity_idx').on(table.entityType, table.entityId),
        index('approval_requests_expires_idx').on(table.expiresAt),
    ]
)

// =============================================================================
// APPROVAL ACTIONS - Individual approve/reject/delegate actions
// =============================================================================

export const approvalActions = approvalSchema.table(
    'approval_actions',
    {
        id: uuid('id').primaryKey().defaultRandom(),
        requestId: uuid('request_id')
            .notNull()
            .references(() => approvalRequests.id, { onDelete: 'cascade' }),
        approverId: uuid('approver_id')
            .notNull()
            .references(() => users.id),
        approverRole: varchar('approver_role', { length: 100 }),
        level: integer('level').notNull(),
        action: varchar('action', { length: 20 }).notNull(), // approve, reject, request_info, delegate
        comment: text('comment'),
        conditions: text('conditions'), // Approval with conditions
        delegatedTo: uuid('delegated_to').references(() => users.id),
        delegationReason: text('delegation_reason'),
        riskAssessment: jsonb('risk_assessment'),
        riskScore: integer('risk_score'),
        createdAt: timestamp('created_at').notNull().defaultNow(),
    },
    (table) => [
        index('approval_actions_request_idx').on(table.requestId),
        index('approval_actions_approver_idx').on(table.approverId),
        index('approval_actions_action_idx').on(table.action),
    ]
)

// =============================================================================
// NOTIFICATIONS - Persisted in-app notifications
// =============================================================================

export const notifications = approvalSchema.table(
    'notifications',
    {
        id: uuid('id').primaryKey().defaultRandom(),
        tenantId: uuid('tenant_id')
            .notNull()
            .references(() => tenants.id),
        approvalRequestId: uuid('approval_request_id').references(() => approvalRequests.id, { onDelete: 'set null' }),
        workflowId: varchar('workflow_id', { length: 100 }),
        type: varchar('type', { length: 50 }).notNull(), // APPROVAL_PENDING, APPROVAL_APPROVED, etc.
        severity: varchar('severity', { length: 20 }).notNull().default('info'), // info, warning, success, error
        title: varchar('title', { length: 255 }).notNull(),
        message: text('message').notNull(),
        actionUrl: varchar('action_url', { length: 500 }),
        entityType: varchar('entity_type', { length: 100 }),
        entityId: varchar('entity_id', { length: 100 }),
        source: varchar('source', { length: 100 }).notNull().default('approval_service'),
        triggeredBy: uuid('triggered_by').references(() => users.id, { onDelete: 'set null' }),
        metadata: jsonb('metadata'),
        createdAt: timestamp('created_at').notNull().defaultNow(),
    },
    (table) => [
        index('notifications_tenant_idx').on(table.tenantId),
        index('notifications_type_idx').on(table.type),
        index('notifications_request_idx').on(table.approvalRequestId),
        index('notifications_created_idx').on(table.createdAt),
    ]
)

export const notificationDeliveries = approvalSchema.table(
    'notification_deliveries',
    {
        id: uuid('id').primaryKey().defaultRandom(),
        notificationId: uuid('notification_id')
            .notNull()
            .references(() => notifications.id, { onDelete: 'cascade' }),
        tenantId: uuid('tenant_id')
            .notNull()
            .references(() => tenants.id),
        recipientUserId: uuid('recipient_user_id').references(() => users.id, { onDelete: 'cascade' }),
        recipientRole: varchar('recipient_role', { length: 100 }),
        channel: varchar('channel', { length: 20 }).notNull().default('in_app'), // in_app, socket, email, webhook
        deliveryStatus: varchar('delivery_status', { length: 20 }).notNull().default('sent'), // pending, sent, failed, read
        deliveredAt: timestamp('delivered_at').defaultNow(),
        readAt: timestamp('read_at'),
        errorMessage: text('error_message'),
        metadata: jsonb('metadata'),
        createdAt: timestamp('created_at').notNull().defaultNow(),
        updatedAt: timestamp('updated_at').notNull().defaultNow(),
    },
    (table) => [
        index('notification_deliveries_notification_idx').on(table.notificationId),
        index('notification_deliveries_tenant_idx').on(table.tenantId),
        index('notification_deliveries_user_status_idx').on(table.recipientUserId, table.deliveryStatus),
        index('notification_deliveries_role_idx').on(table.recipientRole),
        index('notification_deliveries_created_idx').on(table.createdAt),
    ]
)

export const notificationPreferences = approvalSchema.table(
    'notification_preferences',
    {
        id: uuid('id').primaryKey().defaultRandom(),
        tenantId: uuid('tenant_id')
            .notNull()
            .references(() => tenants.id),
        userId: uuid('user_id')
            .notNull()
            .references(() => users.id, { onDelete: 'cascade' }),
        muteAll: boolean('mute_all').notNull().default(false),
        mutedCategories: jsonb('muted_categories').$type<string[]>().notNull().default(['approval.requests.approve']),
        quietHoursEnabled: boolean('quiet_hours_enabled').notNull().default(false),
        quietHoursStart: varchar('quiet_hours_start', { length: 5 }).notNull().default('22:00'),
        quietHoursEnd: varchar('quiet_hours_end', { length: 5 }).notNull().default('07:00'),
        timezone: varchar('timezone', { length: 64 }).notNull().default('Asia/Jakarta'),
        createdAt: timestamp('created_at').notNull().defaultNow(),
        updatedAt: timestamp('updated_at').notNull().defaultNow(),
    },
    (table) => [
        index('notification_preferences_tenant_idx').on(table.tenantId),
        index('notification_preferences_user_idx').on(table.userId),
        index('notification_preferences_tenant_user_idx').on(table.tenantId, table.userId),
    ]
)

// =============================================================================
// RELATIONS
// =============================================================================

export const approvalMatricesRelations = relations(approvalMatrices, ({ one, many }) => ({
    tenant: one(tenants, {
        fields: [approvalMatrices.tenantId],
        references: [tenants.id],
    }),
    levels: many(approvalLevels),
    requests: many(approvalRequests),
}))

export const approvalLevelsRelations = relations(approvalLevels, ({ one }) => ({
    matrix: one(approvalMatrices, {
        fields: [approvalLevels.matrixId],
        references: [approvalMatrices.id],
    }),
}))

export const approvalRequestsRelations = relations(approvalRequests, ({ one, many }) => ({
    tenant: one(tenants, {
        fields: [approvalRequests.tenantId],
        references: [tenants.id],
    }),
    matrix: one(approvalMatrices, {
        fields: [approvalRequests.matrixId],
        references: [approvalMatrices.id],
    }),
    requester: one(users, {
        fields: [approvalRequests.requestedBy],
        references: [users.id],
    }),
    actions: many(approvalActions),
    notifications: many(notifications),
}))

export const approvalActionsRelations = relations(approvalActions, ({ one }) => ({
    request: one(approvalRequests, {
        fields: [approvalActions.requestId],
        references: [approvalRequests.id],
    }),
    approver: one(users, {
        fields: [approvalActions.approverId],
        references: [users.id],
    }),
    delegatedUser: one(users, {
        fields: [approvalActions.delegatedTo],
        references: [users.id],
    }),
}))

export const notificationsRelations = relations(notifications, ({ one, many }) => ({
    tenant: one(tenants, {
        fields: [notifications.tenantId],
        references: [tenants.id],
    }),
    approvalRequest: one(approvalRequests, {
        fields: [notifications.approvalRequestId],
        references: [approvalRequests.id],
    }),
    triggerUser: one(users, {
        fields: [notifications.triggeredBy],
        references: [users.id],
    }),
    deliveries: many(notificationDeliveries),
}))

export const notificationDeliveriesRelations = relations(notificationDeliveries, ({ one }) => ({
    notification: one(notifications, {
        fields: [notificationDeliveries.notificationId],
        references: [notifications.id],
    }),
    tenant: one(tenants, {
        fields: [notificationDeliveries.tenantId],
        references: [tenants.id],
    }),
    recipientUser: one(users, {
        fields: [notificationDeliveries.recipientUserId],
        references: [users.id],
    }),
}))

export const notificationPreferencesRelations = relations(notificationPreferences, ({ one }) => ({
    tenant: one(tenants, {
        fields: [notificationPreferences.tenantId],
        references: [tenants.id],
    }),
    user: one(users, {
        fields: [notificationPreferences.userId],
        references: [users.id],
    }),
}))

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type ApprovalMatrix = typeof approvalMatrices.$inferSelect
export type NewApprovalMatrix = typeof approvalMatrices.$inferInsert

export type ApprovalLevel = typeof approvalLevels.$inferSelect
export type NewApprovalLevel = typeof approvalLevels.$inferInsert

export type ApprovalRequest = typeof approvalRequests.$inferSelect
export type NewApprovalRequest = typeof approvalRequests.$inferInsert

export type ApprovalAction = typeof approvalActions.$inferSelect
export type NewApprovalAction = typeof approvalActions.$inferInsert

export type Notification = typeof notifications.$inferSelect
export type NewNotification = typeof notifications.$inferInsert

export type NotificationDelivery = typeof notificationDeliveries.$inferSelect
export type NewNotificationDelivery = typeof notificationDeliveries.$inferInsert

export type NotificationPreference = typeof notificationPreferences.$inferSelect
export type NewNotificationPreference = typeof notificationPreferences.$inferInsert
