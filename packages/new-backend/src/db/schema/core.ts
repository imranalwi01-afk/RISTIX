import {
    pgSchema,
    uuid,
    varchar,
    timestamp,
    boolean,
    text,
    integer,
    index,
    jsonb,
    uniqueIndex,
    foreignKey,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

/**
 * Core schema namespace
 */
export const coreSchema = pgSchema('core')

// =============================================================================
// USERS TABLE
// =============================================================================

/**
 * Users table definition.
 * Stores user identity, profile information, and security settings.
 * Synchronized with IAF Tenant Database schema (ifrspro_tenant_iaf)
 */
export const users = coreSchema.table(
    'users',
    {
        id: uuid('id').primaryKey().defaultRandom(),
        tenantId: varchar('tenant_id', { length: 100 }).default('dana'),

        // Basic info
        username: varchar('username', { length: 100 }).notNull(),
        email: varchar('email', { length: 255 }).notNull(),
        passwordHash: varchar('password_hash', { length: 255 }).notNull(),
        fullName: varchar('full_name', { length: 200 }).notNull(),

        // Profile info
        phone: varchar('phone', { length: 50 }),
        department: varchar('department', { length: 100 }),
        position: varchar('position', { length: 100 }),
        employeeId: varchar('employee_id', { length: 50 }),
        bankId: varchar('bank_id', { length: 50 }),
        avatarUrl: text('avatar_url'),

        // Status & Perms
        isActive: boolean('is_active').default(true),
        isVerified: boolean('is_verified').default(false),

        // Security & MFA
        mfaEnabled: boolean('mfa_enabled').default(false),
        mfaSecret: varchar('mfa_secret', { length: 255 }),
        backupCodes: text('backup_codes').array(),
        forcePasswordChange: boolean('force_password_change').default(false),

        // Activity
        loginCount: integer('login_count').default(0),
        failedLoginAttempts: integer('failed_login_attempts').default(0),
        lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
        passwordChangedAt: timestamp('password_changed_at'),
        emailVerifiedAt: timestamp('email_verified_at'),

        // Timestamps
        createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
        updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
    },
    (table) => [
        index('idx_dana_users_active').on(table.isActive),
        index('idx_dana_users_tenant_id').on(table.tenantId),
        index('idx_dana_users_username').on(table.username),
        index('idx_dana_users_email').on(table.email),
        index('idx_dana_users_employee_id').on(table.employeeId),
        index('idx_dana_users_login_count').on(table.loginCount),
        index('idx_dana_users_failed_attempts').on(table.failedLoginAttempts),
    ]
)

// =============================================================================
// TENANTS TABLE
// =============================================================================

/**
 * Tenants table definition.
 * Stores multi-tenancy configuration and details.
 */
export const tenants = coreSchema.table(
    'tenants',
    {
        id: uuid('id').primaryKey().defaultRandom(),
        code: varchar('code', { length: 50 }).notNull(),
        name: varchar('name', { length: 255 }).notNull(),
        slug: varchar('slug', { length: 100 }),
        description: text('description'),
        type: varchar('type', { length: 50 }).default('banking'),
        bankingMode: varchar('banking_mode', { length: 20 }).default('conventional'),
        settings: jsonb('settings').default({}),
        isActive: boolean('is_active').notNull().default(true),
        createdAt: timestamp('created_at').notNull().defaultNow(),
        updatedAt: timestamp('updated_at').notNull().defaultNow(),
    },
    (table) => [
        uniqueIndex('tenants_code_idx').on(table.code),
        index('tenants_slug_idx').on(table.slug),
        index('tenants_active_idx').on(table.isActive),
    ]
)

export const tenantsRelations = relations(tenants, ({ many }) => ({
    // Relational query support
}))

// =============================================================================
// USER TABLE VIEWS
// =============================================================================

/**
 * Persisted enterprise table views per user and page scope.
 * Stores column visibility, filters, sort, density, page size, and default view state.
 */
export const userTableViews = coreSchema.table(
    'user_table_views',
    {
        id: uuid('id').primaryKey().defaultRandom(),
        tenantId: varchar('tenant_id', { length: 100 }).notNull(),
        userId: uuid('user_id').notNull(),
        scope: varchar('scope', { length: 160 }).notNull(),
        viewKey: varchar('view_key', { length: 160 }).notNull(),
        name: varchar('name', { length: 160 }),
        isDefault: boolean('is_default').notNull().default(false),
        state: jsonb('state').notNull().default({}),
        createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
        updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
    },
    (table) => [
        uniqueIndex('user_table_views_tenant_user_scope_key_idx').on(table.tenantId, table.userId, table.scope, table.viewKey),
        index('user_table_views_tenant_user_scope_idx').on(table.tenantId, table.userId, table.scope),
        index('user_table_views_default_idx').on(table.tenantId, table.userId, table.scope, table.isDefault),
    ]
)

// =============================================================================
// TENANT MENU ITEMS — synced from Platform DB's menu.menu_items at startup
// Each tenant gets its own copy so it works even if Platform DB is down
// =============================================================================

export const tenantMenuCategories = coreSchema.table(
    'menu_categories',
    {
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
        createdBy: uuid('created_by'),
        updatedBy: uuid('updated_by'),
    },
    (table) => [
        index('tenant_menu_categories_tenant_idx').on(table.tenantId),
        uniqueIndex('tenant_menu_categories_tenant_name_idx').on(table.tenantId, table.name),
    ]
)

export const tenantMenuItems = coreSchema.table(
    'menu_items',
    {
        id: uuid('id').primaryKey().defaultRandom(),
        tenantId: uuid('tenant_id').notNull(),
        categoryId: uuid('category_id'),
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
        createdBy: uuid('created_by'),
        updatedBy: uuid('updated_by'),
    },
    (table) => [
        index('tenant_menu_items_tenant_idx').on(table.tenantId),
        index('tenant_menu_items_category_idx').on(table.categoryId),
        index('tenant_menu_items_parent_idx').on(table.parentId),
        foreignKey({ columns: [table.parentId], foreignColumns: [table.id] }),
    ]
)

export const tenantMenuCategoriesRelations = relations(tenantMenuCategories, ({ many }) => ({
    items: many(tenantMenuItems),
}))

export const tenantMenuItemsRelations = relations(tenantMenuItems, ({ one }) => ({
    parent: one(tenantMenuItems, { fields: [tenantMenuItems.parentId], references: [tenantMenuItems.id] }),
    category: one(tenantMenuCategories, { fields: [tenantMenuItems.categoryId], references: [tenantMenuCategories.id] }),
}))

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert

export type Tenant = typeof tenants.$inferSelect
export type NewTenant = typeof tenants.$inferInsert

export type UserTableView = typeof userTableViews.$inferSelect
export type NewUserTableView = typeof userTableViews.$inferInsert

export type TenantMenuItem = typeof tenantMenuItems.$inferSelect
export type NewTenantMenuItem = typeof tenantMenuItems.$inferInsert
export type TenantMenuCategory = typeof tenantMenuCategories.$inferSelect
export type NewTenantMenuCategory = typeof tenantMenuCategories.$inferInsert
