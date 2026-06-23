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
    uniqueIndex('menu_categories_tenant_name_idx').on(table.tenantId, table.name),
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

// Menu permissions live in tenant DB as core.menu_permissions, not in platform DB
// Menu configurations and analytics are not yet implemented

export type MenuCategory = typeof menuCategories.$inferSelect
export type NewMenuCategory = typeof menuCategories.$inferInsert
export type MenuItem = typeof menuItems.$inferSelect
export type NewMenuItem = typeof menuItems.$inferInsert
