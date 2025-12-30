import {
    pgSchema,
    uuid,
    varchar,
    text,
    integer,
    boolean,
    timestamp,
    index,
    uniqueIndex,
} from 'drizzle-orm/pg-core'
import { relations, sql } from 'drizzle-orm'
import { roles, coreSchema } from './rbac.schema'
import { users } from './core'

// =============================================================================
// MENU CATEGORIES TABLE
// =============================================================================

export const menuCategories = coreSchema.table(
    'menu_categories',
    {
        id: uuid('id').primaryKey().defaultRandom(),
        categoryKey: varchar('category_key', { length: 100 }).notNull(),
        categoryName: varchar('category_name', { length: 255 }).notNull(),
        categoryNameId: varchar('category_name_id', { length: 255 }).notNull(),
        description: text('description'),
        iconName: varchar('icon_name', { length: 100 }),
        displayOrder: integer('display_order').default(0),
        isActive: boolean('is_active').default(true),
        createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
        updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
    },
    (table) => [
        uniqueIndex('menu_categories_key_idx').on(table.categoryKey),
    ]
)

// =============================================================================
// MENU ITEMS TABLE
// =============================================================================

export const menuItems = coreSchema.table(
    'menu_items',
    {
        id: uuid('id').primaryKey().defaultRandom(),
        parentId: uuid('parent_id'),
        categoryId: uuid('category_id').references(() => menuCategories.id, { onDelete: 'set null' }),

        // Menu identification
        menuKey: varchar('menu_key', { length: 100 }).notNull(),
        title: varchar('title', { length: 255 }).notNull(),
        menuNameId: varchar('menu_name_id', { length: 255 }),

        // Navigation
        url: varchar('url', { length: 500 }),
        pagePath: varchar('page_path', { length: 500 }),
        externalUrl: varchar('external_url', { length: 500 }),

        // Hierarchy and display
        menuType: varchar('menu_type', { length: 20 }).default('item').notNull(),
        level: integer('level').notNull().default(1),
        sortOrder: integer('sort_order').default(0),
        icon: varchar('icon', { length: 100 }),
        badgeText: varchar('badge_text', { length: 50 }),
        badgeColor: varchar('badge_color', { length: 20 }).default('primary'),

        // Access control
        moduleName: varchar('module_name', { length: 100 }),
        requiredPermissions: text('required_permissions').array(),
        bankingTypes: text('banking_types').array().default(sql`ARRAY['conventional', 'syariah', 'dual']`),
        bankingType: varchar('banking_type', { length: 20 }).default('all'), // Legacy/Fallback? 002-final uses banking_types array. I'll keep both if unsure, but 002 doesn't insert banking_type. Drizzle handles missing cols if nullable/default.


        // Status and flags
        isActive: boolean('is_active').default(true),
        isVisible: boolean('is_visible').default(true),
        isProtected: boolean('is_protected').default(false),
        opensInNewTab: boolean('opens_in_new_tab').default(false),

        // Metadata
        description: text('description'),
        tags: text('tags').array(),
        createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
        updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
        createdBy: uuid('created_by'),

        // Tenant isolation
        tenantId: uuid('tenant_id').default('a24af6d2-3032-4d53-ae82-9cfa84f97a20'),

        // Audit fields
        version: integer('version').default(1),
        lastModifiedBy: uuid('last_modified_by'),
    },
    (table) => [
        uniqueIndex('menu_items_key_idx').on(table.menuKey),
        index('idx_menu_items_parent_id').on(table.parentId),
        index('idx_menu_items_category_id').on(table.categoryId),
        index('idx_menu_items_level').on(table.level),
        index('idx_menu_items_active').on(table.isActive),
        index('idx_menu_items_visible').on(table.isVisible),
        index('idx_menu_items_banking_type').on(table.bankingType),
        index('idx_menu_items_module').on(table.moduleName),
        index('idx_menu_items_display_order').on(table.categoryId, table.sortOrder),
    ]
)

// Self-reference for parent_id must be handled carefully or via relations
// Drizzle supports self-referencing in table definition by omitting the reference and defining logic in relations, 
// or by using .references(() => menuItems.id) if circular dependecy allows (it usually works inside table function).
// Let's add the reference explicitly:
// parentId: uuid('parent_id').references((): AnyPgColumn => menuItems.id, { onDelete: 'cascade' }),
// But typescript might complain about 'menuItems' used before initialization.
// Safer to add Foreign Key in extra config or rely on validation. 
// For now leaving as uuid to avoid TS circular ref issues in definition properties, will add relation below.

// =============================================================================
// ROLE MENU ACCESS TABLE
// =============================================================================

export const roleMenuAccess = coreSchema.table(
    'role_menu_access',
    {
        id: uuid('id').primaryKey().defaultRandom(),
        roleId: uuid('role_id').notNull().references(() => roles.id, { onDelete: 'cascade' }),
        menuItemId: uuid('menu_item_id').notNull().references(() => menuItems.id, { onDelete: 'cascade' }),

        // Access permissions
        canView: boolean('can_view').default(true),
        canCreate: boolean('can_create').default(false),
        canEdit: boolean('can_edit').default(false),
        canDelete: boolean('can_delete').default(false),
        canApprove: boolean('can_approve').default(false),

        // Customization
        isFavorite: boolean('is_favorite').default(false),
        customDisplayName: varchar('custom_display_name', { length: 255 }),
        customIcon: varchar('custom_icon', { length: 100 }),
        customOrder: integer('custom_order'),

        // Metadata
        grantedAt: timestamp('granted_at', { withTimezone: true }).defaultNow(),
        grantedBy: uuid('granted_by').references(() => users.id),
        expiresAt: timestamp('expires_at', { withTimezone: true }),
        createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
        updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
        tenantId: uuid('tenant_id').default('a24af6d2-3032-4d53-ae82-9cfa84f97a20'),
    },
    (table) => [
        uniqueIndex('role_menu_unique_idx').on(table.roleId, table.menuItemId),
        index('idx_role_menu_access_role_id').on(table.roleId),
        index('idx_role_menu_access_menu_id').on(table.menuItemId),
        index('idx_role_menu_access_can_view').on(table.canView),
    ]
)

// =============================================================================
// MENU USER CUSTOMIZATION TABLE
// =============================================================================

export const menuUserCustomization = coreSchema.table(
    'menu_user_customization',
    {
        id: uuid('id').primaryKey().defaultRandom(),
        userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
        menuItemId: uuid('menu_item_id').notNull().references(() => menuItems.id, { onDelete: 'cascade' }),

        // User preferences
        isFavorite: boolean('is_favorite').default(false),
        isPinned: boolean('is_pinned').default(false),
        isHidden: boolean('is_hidden').default(false),
        customDisplayName: varchar('custom_display_name', { length: 255 }),
        customIcon: varchar('custom_icon', { length: 100 }),
        customColor: varchar('custom_color', { length: 20 }),
        customOrder: integer('custom_order'),

        // Usage tracking
        accessCount: integer('access_count').default(0),
        lastAccessedAt: timestamp('last_accessed_at', { withTimezone: true }),

        // Metadata
        createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
        updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
    },
    (table) => [
        uniqueIndex('menu_user_custom_unique_idx').on(table.userId, table.menuItemId),
        index('idx_menu_user_custom_user_id').on(table.userId),
        index('idx_menu_user_custom_menu_id').on(table.menuItemId),
        index('idx_menu_user_custom_favorite').on(table.isFavorite),
    ]
)

// =============================================================================
// MENU ACCESS LOG TABLE
// =============================================================================

export const menuAccessLog = coreSchema.table(
    'menu_access_log',
    {
        id: uuid('id').primaryKey().defaultRandom(),
        userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
        menuItemId: uuid('menu_item_id').references(() => menuItems.id, { onDelete: 'set null' }),

        // Access details
        accessAction: varchar('access_action', { length: 50 }).notNull(),
        ipAddress: varchar('ip_address', { length: 50 }), // Using varchar for flexibility, Postgres INET can be mapped if needed
        userAgent: text('user_agent'),
        sessionId: varchar('session_id', { length: 255 }),

        // Response performance
        responseTimeMs: integer('response_time_ms'),

        // Timestamp
        accessedAt: timestamp('accessed_at', { withTimezone: true }).defaultNow(),
    },
    (table) => [
        index('idx_menu_access_log_user_id').on(table.userId),
        index('idx_menu_access_log_menu_id').on(table.menuItemId),
        index('idx_menu_access_log_accessed_at').on(table.accessedAt),
    ]
)

// =============================================================================
// RELATIONSHIPS
// =============================================================================

export const menuCategoriesRelations = relations(menuCategories, ({ many }) => ({
    menuItems: many(menuItems),
}))

export const menuItemsRelations = relations(menuItems, ({ one, many }) => ({
    parent: one(menuItems, {
        fields: [menuItems.parentId],
        references: [menuItems.id],
        relationName: 'menu_hierarchy',
    }),
    children: many(menuItems, {
        relationName: 'menu_hierarchy',
    }),
    category: one(menuCategories, {
        fields: [menuItems.categoryId],
        references: [menuCategories.id],
    }),
    roleAccess: many(roleMenuAccess),
    userCustomization: many(menuUserCustomization),
}))

export const roleMenuAccessRelations = relations(roleMenuAccess, ({ one }) => ({
    role: one(roles, {
        fields: [roleMenuAccess.roleId],
        references: [roles.id],
    }),
    menuItem: one(menuItems, {
        fields: [roleMenuAccess.menuItemId],
        references: [menuItems.id],
    }),
    granter: one(users, {
        fields: [roleMenuAccess.grantedBy],
        references: [users.id],
    }),
}))

export const menuUserCustomizationRelations = relations(menuUserCustomization, ({ one }) => ({
    user: one(users, {
        fields: [menuUserCustomization.userId],
        references: [users.id],
    }),
    menuItem: one(menuItems, {
        fields: [menuUserCustomization.menuItemId],
        references: [menuItems.id],
    }),
}))

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type MenuCategory = typeof menuCategories.$inferSelect
export type NewMenuCategory = typeof menuCategories.$inferInsert

export type MenuItem = typeof menuItems.$inferSelect
export type NewMenuItem = typeof menuItems.$inferInsert

export type RoleMenuAccess = typeof roleMenuAccess.$inferSelect
export type NewRoleMenuAccess = typeof roleMenuAccess.$inferInsert

export type MenuUserCustomization = typeof menuUserCustomization.$inferSelect
export type NewMenuUserCustomization = typeof menuUserCustomization.$inferInsert
