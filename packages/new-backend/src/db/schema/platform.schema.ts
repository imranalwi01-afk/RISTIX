// Platform DB only needs platform-level tables
// DO NOT export tenant schemas here (core, audit, auth, approval, jobs, workflows)
export { tenants, tenantsRelations, type Tenant, type NewTenant } from './core'
export { consultants, type Consultant, type NewConsultant } from './consultants.schema'

import {
    pgSchema,
    uuid,
    varchar,
    timestamp,
    boolean,
    integer,
    index,
    text,
    jsonb,
    uniqueIndex,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

/**
 * Platform schema namespace
 * Maps to the 'platform_admin' schema in the database (not 'core').
 */
export const platformSchema = pgSchema('platform_admin')

// =============================================================================
// PLATFORM TENANTS TABLE
// =============================================================================

/**
 * Platform Tenants table definition.
 * Maps tenant registry records in platform_admin.tenants.
 */
export const platformTenants = platformSchema.table(
    'tenants',
    {
        id: uuid('id').primaryKey().defaultRandom(),
        code: varchar('code', { length: 50 }).notNull(),
        name: varchar('name', { length: 255 }).notNull(),
        slug: varchar('slug', { length: 100 }),
        description: text('description'),
        type: varchar('type', { length: 50 }).default('banking'),
        bankingMode: varchar('banking_mode', { length: 20 }).default('conventional'),
        settings: text('settings').default('{}'),
        isActive: boolean('is_active').notNull().default(true),
        createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
        updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    },
    (table) => [
        uniqueIndex('platform_tenants_code_idx').on(table.code),
        index('platform_tenants_slug_idx').on(table.slug),
        index('platform_tenants_active_idx').on(table.isActive),
    ]
)

export const platformTenantsRelations = relations(platformTenants, ({ many }) => ({
    // Relational query support
}))

export type PlatformTenant = typeof platformTenants.$inferSelect
export type NewPlatformTenant = typeof platformTenants.$inferInsert

// =============================================================================
// PLATFORM EMAIL TEMPLATES TABLE
// =============================================================================

/**
 * Platform Email Templates table definition.
 * Stores dynamic email templates (HTML and Text) for various system notifications.
 */
export const platformEmailTemplates = platformSchema.table(
    'email_templates',
    {
        id: uuid('id').primaryKey().defaultRandom(),
        code: varchar('code', { length: 100 }).notNull().unique(), // e.g. welcome_email, forgot_password
        subject: varchar('subject', { length: 255 }).notNull(),
        bodyHtml: text('body_html').notNull(),
        bodyText: text('body_text').notNull(),
        availableVariables: jsonb('available_variables').default([]).notNull(),
        createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
        updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    },
    (table) => [
        uniqueIndex('platform_email_templates_code_idx').on(table.code),
    ]
)

export type PlatformEmailTemplate = typeof platformEmailTemplates.$inferSelect
export type NewPlatformEmailTemplate = typeof platformEmailTemplates.$inferInsert

// =============================================================================
// PLATFORM SETTINGS TABLE
// =============================================================================

/**
 * Platform Settings table definition.
 * Global Key-Value store for platform-wide configurations (e.g., branding, maintenance mode).
 */
export const platformSettings = platformSchema.table(
    'settings',
    {
        id: uuid('id').primaryKey().defaultRandom(),
        key: varchar('key', { length: 100 }).notNull().unique(),
        value: jsonb('value').notNull().default({}),
        description: text('description'),
        updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    },
    (table) => [
        uniqueIndex('platform_settings_key_idx').on(table.key),
    ]
)

export type PlatformSetting = typeof platformSettings.$inferSelect
export type NewPlatformSetting = typeof platformSettings.$inferInsert

// =============================================================================
// PLATFORM USERS TABLE
// =============================================================================

/**
 * Platform Users table definition.
 * Stores platform administrators and system operators.
 * Distinct from tenant users; no tenant_id column required.
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

export type PlatformUser = typeof platformUsers.$inferSelect
export type NewPlatformUser = typeof platformUsers.$inferInsert

// =============================================================================
// TYPE EXPORTS
// =============================================================================

// Tenant-only schemas — removed from platform DB
// RBAC (roles, permissions), audit, auth, approval, jobs, workflows all belong in tenant DB only
