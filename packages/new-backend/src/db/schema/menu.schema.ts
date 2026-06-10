import {
    pgSchema,
    uuid,
    varchar,
    text,
    integer,
    boolean,
    timestamp,
    jsonb,
    uniqueIndex,
    index,
    foreignKey,
} from 'drizzle-orm/pg-core'

export const menuSchema = pgSchema('menu')

// =============================================================================
// MENU CATEGORIES
// =============================================================================
export const menuCategories = menuSchema.table('menu_categories', {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').notNull(),
    name: varchar('name', { length: 100 }).notNull(),
    description: text('description'),
    icon: varchar('icon', { length: 50 }),
    color: varchar('color', { length: 20 }),
    sortOrder: integer('sort_order').default(0),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
    createdBy: uuid('created_by').notNull(),
    updatedBy: uuid('updated_by'),
}, (table) => [
    index('menu_categories_tenant_idx').on(table.tenantId),
])

// =============================================================================
// MENU ITEMS
// =============================================================================
export const menuItems = menuSchema.table('menu_items', {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').notNull(),
    categoryId: uuid('category_id').references(() => menuCategories.id),
    parentId: uuid('parent_id'),
    name: varchar('name', { length: 100 }).notNull(),
    description: text('description'),
    path: varchar('path', { length: 255 }),
    icon: varchar('icon', { length: 50 }),
    component: varchar('component', { length: 100 }),
    externalUrl: varchar('external_url', { length: 500 }),
    sortOrder: integer('sort_order').default(0),
    level: integer('level').default(0),
    isActive: boolean('is_active').default(true),
    isVisible: boolean('is_visible').default(true),
    isExternal: boolean('is_external').default(false),
    requiresAuth: boolean('requires_auth').default(true),
    bankingType: varchar('banking_type', { length: 20 }).default('both'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
    createdBy: uuid('created_by').notNull(),
    updatedBy: uuid('updated_by'),
}, (table) => [
    index('menu_items_tenant_idx').on(table.tenantId),
    index('menu_items_category_idx').on(table.categoryId),
    index('menu_items_parent_idx').on(table.parentId),
    foreignKey({ columns: [table.parentId], foreignColumns: [table.id] }),
])

// =============================================================================
// MENU PERMISSIONS
// =============================================================================
export const menuPermissions = menuSchema.table('menu_permissions', {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').notNull(),
    menuItemId: uuid('menu_item_id').notNull().references(() => menuItems.id, { onDelete: 'cascade' }),
    roleId: uuid('role_id').notNull(),
    permissionType: varchar('permission_type', { length: 20 }).default('view'),
    isAllowed: boolean('is_allowed').default(true),
    conditions: jsonb('conditions'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    createdBy: uuid('created_by').notNull(),
}, (table) => [
    uniqueIndex('menu_perm_tenant_item_role').on(table.tenantId, table.menuItemId, table.roleId, table.permissionType),
])

// =============================================================================
// MENU CONFIGURATIONS
// =============================================================================
export const menuConfigurations = menuSchema.table('menu_configurations', {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').notNull(),
    name: varchar('name', { length: 100 }).notNull(),
    type: varchar('type', { length: 50 }).notNull(),
    configuration: jsonb('configuration').notNull(),
    isActive: boolean('is_active').default(true),
    environment: varchar('environment', { length: 20 }).default('production'),
    version: varchar('version', { length: 20 }).default('1.0.0'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
    createdBy: uuid('created_by').notNull(),
    updatedBy: uuid('updated_by'),
}, (table) => [
    uniqueIndex('menu_config_tenant_name_env').on(table.tenantId, table.name, table.environment),
])

// =============================================================================
// MENU ANALYTICS
// =============================================================================
export const menuAnalytics = menuSchema.table('menu_analytics', {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').notNull(),
    userId: uuid('user_id').notNull(),
    menuItemId: uuid('menu_item_id').notNull().references(() => menuItems.id),
    sessionId: uuid('session_id'),
    actionType: varchar('action_type', { length: 50 }).notNull(),
    timestamp: timestamp('timestamp', { withTimezone: true }).defaultNow(),
    durationMs: integer('duration_ms'),
    metadata: jsonb('metadata'),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
}, (table) => [
    index('menu_analytics_tenant_idx').on(table.tenantId),
    index('menu_analytics_item_idx').on(table.menuItemId),
])

export type MenuCategory = typeof menuCategories.$inferSelect
export type NewMenuCategory = typeof menuCategories.$inferInsert
export type MenuItem = typeof menuItems.$inferSelect
export type NewMenuItem = typeof menuItems.$inferInsert
export type MenuPermission = typeof menuPermissions.$inferSelect
export type NewMenuPermission = typeof menuPermissions.$inferInsert
