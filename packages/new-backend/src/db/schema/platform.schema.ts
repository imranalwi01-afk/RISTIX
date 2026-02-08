import {
    pgSchema,
    uuid,
    varchar,
    text,
    boolean,
    timestamp,
    jsonb,
    integer,
    index,
    uniqueIndex
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

/**
 * Platform schema namespace
 * Maps to the 'platform_admin' schema in the database (not 'core').
 */
export const platformSchema = pgSchema('platform_admin')

// =============================================================================
// PLATFORM USERS TABLE
// =============================================================================

/**
 * Platform Users table definition.
 * Stores platform administrators and system operators.
 * Distinct from tenant users; no tenant_id column required.
 * Maps to 'core.users' in the Platform DB.
 */
export const platformUsers = platformSchema.table(
    'users',
    {
        id: uuid('id').primaryKey().defaultRandom(),

        // Basic info
        username: varchar('username', { length: 100 }).notNull(),
        email: varchar('email', { length: 255 }).notNull(),
        passwordHash: varchar('password_hash', { length: 255 }).notNull(),
        fullName: varchar('full_name', { length: 200 }).notNull(),

        employeeId: varchar('employee_id', { length: 50 }),
        role: varchar('role', { length: 100 }).notNull(),

        // Security
        isActive: boolean('is_active').default(true),

        // Activity tracking
        lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
        failedLoginAttempts: integer('failed_login_attempts').default(0),

        // Timestamps
        createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
        updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),

        // New fields from DDL
        userRole: varchar('user_role', { length: 100 }),
        tenantId: uuid('tenant_id'), // Nullable
        tenantName: varchar('tenant_name', { length: 255 }),
    },
    (table) => [
        index('idx_users_role').on(table.role),
        index('idx_users_last_login').on(table.lastLoginAt),
        index('idx_users_is_active').on(table.isActive),
    ]
)



// =============================================================================
// TENANTS TABLE
// =============================================================================

/**
 * Tenants table definition.
 * Stores multi-tenancy configuration and details.
 */
export const tenants = platformSchema.table(
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
    // users: many(users), // Users might be in core.ts, creating dependency cycle if not careful. 
    // For now, let's keep it clean. Platform tenants manage platform users? 
    // Or is it related to Tenant DB users?
    // In original code: users: many(users). 
    // But 'users' is in core.ts.
    // If I import users from ./core, it might be circular if core imports platform.
    // Let's omit the relation for now unless strictly needed, or use a lambda if supported to break cycle.
    // Actually, platform.schema.ts imports nothing from core.ts (except maybe implicit types).
    // Let's add explicit relation if we can.
}))

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type Tenant = typeof tenants.$inferSelect
export type NewTenant = typeof tenants.$inferInsert
export type PlatformUser = typeof platformUsers.$inferSelect
export type NewPlatformUser = typeof platformUsers.$inferInsert
