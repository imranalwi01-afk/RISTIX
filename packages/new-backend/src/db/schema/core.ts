import {
    pgSchema,
    uuid,
    varchar,
    timestamp,
    boolean,
    text,
    jsonb,
    integer,
    date,
    index,
    uniqueIndex,
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
 * Note: tenantId is a logical reference, not a database foreign key, to allow for cross-tenant users or data sharding.
 */
export const users = coreSchema.table(
    'users',
    {
        id: uuid('id').primaryKey().defaultRandom(),
        // Tenant ID as varchar (not FK) to match actual database
        tenantId: varchar('tenant_id', { length: 100 }).default('dana'),

        // Basic info
        username: varchar('username', { length: 100 }).notNull(),
        email: varchar('email', { length: 255 }).notNull(),
        passwordHash: varchar('password_hash', { length: 255 }).notNull(),
        firstName: varchar('first_name', { length: 100 }),
        lastName: varchar('last_name', { length: 100 }),
        fullName: varchar('full_name', { length: 200 }).notNull(),

        // Contact & Organization
        department: varchar('department', { length: 100 }),
        position: varchar('position', { length: 100 }),
        phone: varchar('phone', { length: 50 }),
        employeeId: varchar('employee_id', { length: 50 }),
        // bankId: varchar('bank_id', { length: 50 }),

        // Banking specific
        // bankingAccess: varchar('banking_access', { length: 20 }).default('CONVENTIONAL'),
        // syariahCertified: boolean('syariah_certified').default(false),
        // syariahCertification: boolean('syariah_certification').default(false),
        // syariahCertificationDate: date('syariah_certification_date'),

        // Security & MFA
        isActive: boolean('is_active').default(true),
        isVerified: boolean('is_verified').default(false),
        mfaEnabled: boolean('mfa_enabled').default(false),
        mfaSecret: varchar('mfa_secret', { length: 255 }),
        backupCodes: text('backup_codes').array(),
        forcePasswordChange: boolean('force_password_change').default(false),

        // Activity tracking
        loginCount: integer('login_count').default(0),
        failedLoginAttempts: integer('failed_login_attempts').default(0),
        lastLoginAt: timestamp('last_login_at', { withTimezone: true }),

        // Timestamps
        emailVerifiedAt: timestamp('email_verified_at'),
        passwordChangedAt: timestamp('password_changed_at'),
        createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
        updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
    },
    (table) => [
        index('idx_dana_users_email').on(table.email),
        index('idx_dana_users_username').on(table.username),
        index('idx_dana_users_tenant_id').on(table.tenantId),
        index('idx_dana_users_active').on(table.isActive),
        index('idx_dana_users_employee_id').on(table.employeeId),
        index('idx_dana_users_login_count').on(table.loginCount),
        index('idx_dana_users_failed_attempts').on(table.failedLoginAttempts),
    ]
)

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
