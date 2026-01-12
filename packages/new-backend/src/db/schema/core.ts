import {
    pgSchema,
    uuid,
    varchar,
    timestamp,
    boolean,
    text,
    jsonb,
    index,
    uniqueIndex,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

/**
 * Core schema namespace
 */
export const coreSchema = pgSchema('core')

// =============================================================================
// TENANTS TABLE
// =============================================================================

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

// =============================================================================
// USERS TABLE
// =============================================================================

export const users = coreSchema.table(
    'users',
    {
        id: uuid('id').primaryKey().defaultRandom(),
        tenantId: uuid('tenant_id')
            .notNull()
            .references(() => tenants.id),
        email: varchar('email', { length: 255 }).notNull(),
        username: varchar('username', { length: 100 }).notNull(),
        passwordHash: text('password_hash').notNull(),
        fullName: text('full_name'),
        firstName: varchar('first_name', { length: 100 }),
        lastName: varchar('last_name', { length: 100 }),
        phone: varchar('phone', { length: 20 }),
        department: varchar('department', { length: 100 }),
        position: varchar('position', { length: 100 }),
        isActive: boolean('is_active').notNull().default(true),
        isPlatformAdmin: boolean('is_platform_admin').notNull().default(false),
        isEmailVerified: boolean('is_email_verified').notNull().default(false),
        lastLoginAt: timestamp('last_login_at'),
        passwordChangedAt: timestamp('password_changed_at'),
        createdAt: timestamp('created_at').notNull().defaultNow(),
        updatedAt: timestamp('updated_at').notNull().defaultNow(),
    },
    (table) => [
        uniqueIndex('users_email_tenant_idx').on(table.email, table.tenantId),
        index('users_username_idx').on(table.username),
        index('users_tenant_idx').on(table.tenantId),
        index('users_active_idx').on(table.isActive),
    ]
)

// =============================================================================
// RELATIONS
// =============================================================================

export const tenantsRelations = relations(tenants, ({ many }) => ({
    users: many(users),
}))

export const usersRelations = relations(users, ({ one }) => ({
    tenant: one(tenants, {
        fields: [users.tenantId],
        references: [tenants.id],
    }),
}))

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type Tenant = typeof tenants.$inferSelect
export type NewTenant = typeof tenants.$inferInsert

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
