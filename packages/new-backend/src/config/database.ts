import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import {
    getPlatformDatabaseUrl,
    getTenantDatabaseUrl,
    getLegacyDatabaseUrl
} from './env'
import * as schema from '../db/schema'
import * as platformSchema from '../db/schema/platform.schema'
import * as tenantSchema from '../db/schema/tenant.schema'
import * as legacySchema from '../db/schema/legacy.schema'
import { wrapSql } from '../lib/db-tracing'

/**
 * PostgreSQL connection configuration
 */
const connectionConfig = {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
    // Keep TCP traffic flowing for long-running SP calls behind VPN/NAT.
    keep_alive: 10,
}

const enableDbTracing = process.env.OTEL_DB_TRACING === 'true'

/**
 * Platform Admin Database Connection
 * For platform-wide administration, users, roles, etc.
 */
const platformConnection = enableDbTracing
    ? wrapSql(postgres(getPlatformDatabaseUrl(), connectionConfig), 'platform')
    : postgres(getPlatformDatabaseUrl(), connectionConfig)

const tenantConnection = enableDbTracing
    ? wrapSql(postgres(getTenantDatabaseUrl(), connectionConfig), 'tenant')
    : postgres(getTenantDatabaseUrl(), connectionConfig)

const legacyConnection = enableDbTracing
    ? wrapSql(postgres(getLegacyDatabaseUrl(), connectionConfig), 'legacy')
    : postgres(getLegacyDatabaseUrl(), connectionConfig)

/**
 * Drizzle ORM instance for Platform Admin DB
 * The schema is needed for the relational query API (db.query.*)
 */
export const platformDb = drizzle(platformConnection, {
    schema: platformSchema as unknown as typeof schema,
})


/**
 * Drizzle ORM instance for Tenant DB
 */
export const tenantDb = drizzle(tenantConnection, {
    schema: tenantSchema as unknown as typeof schema,
    logger: true,
})

/**
 * Legacy Drizzle ORM instance
 */
export const legacyDb = drizzle(legacyConnection, { schema: legacySchema })

/**
 * Default DB export (points to Platform DB for backward compatibility)
 */
export const db = platformDb

/**
 * Close all database connections gracefully
 */
export async function closeDatabase(): Promise<void> {
    await Promise.all([
        platformConnection.end(),
        tenantConnection.end(),
        legacyConnection.end()
    ])
}

export {
    platformConnection,
    tenantConnection,
    legacyConnection
}

/**
 * Get the appropriate Drizzle DB instance based on tenant context.
 * 
 * @param tenantId - Optional Tenant ID. 
 *                   If provided, returns the Tenant DB connection.
 *                   If undefined/null, returns the Platform DB connection.
 */
export function getDatabase(tenantId?: string | null) {
    if (tenantId) {
        return tenantDb
    }
    return platformDb
}

/**
 * Ensure approval level requirement columns exist in tenant DB.
 *
 * Some environments were initialized before migration 0030 and still only have
 * `required_roles`. This guard is idempotent and safe to run at startup.
 */
export async function ensureApprovalLevelRequirementsCompatibility(): Promise<void> {
    const [tableCheck] = await tenantConnection<{ exists: boolean }[]>`
        select to_regclass('approval.approval_levels') is not null as exists
    `

    if (!tableCheck?.exists) {
        return
    }

    await tenantConnection.unsafe(`
        ALTER TABLE approval.approval_levels
            ADD COLUMN IF NOT EXISTS required_role_codes JSONB NOT NULL DEFAULT '[]'::jsonb,
            ADD COLUMN IF NOT EXISTS required_permission_codes JSONB NOT NULL DEFAULT '["approval.requests.approve"]'::jsonb,
            ADD COLUMN IF NOT EXISTS role_match_mode VARCHAR(10) NOT NULL DEFAULT 'ANY',
            ADD COLUMN IF NOT EXISTS permission_match_mode VARCHAR(10) NOT NULL DEFAULT 'ANY';
    `)

    await tenantConnection.unsafe(`
        DO $$
        BEGIN
            IF EXISTS (
                SELECT 1
                FROM information_schema.columns
                WHERE table_schema = 'approval'
                  AND table_name = 'approval_levels'
                  AND column_name = 'required_roles'
            ) THEN
                UPDATE approval.approval_levels AS al
                SET
                    required_role_codes = CASE
                        WHEN jsonb_typeof(al.required_role_codes) = 'array'
                             AND jsonb_array_length(al.required_role_codes) > 0
                            THEN al.required_role_codes
                        ELSE COALESCE(
                            (
                                SELECT jsonb_agg(DISTINCT trim(value))
                                FROM jsonb_array_elements_text(al.required_roles) AS value
                                WHERE trim(value) <> ''
                                  AND position('.' IN trim(value)) = 0
                            ),
                            '[]'::jsonb
                        )
                    END,
                    required_permission_codes = CASE
                        WHEN jsonb_typeof(al.required_permission_codes) = 'array'
                             AND jsonb_array_length(al.required_permission_codes) > 0
                            THEN al.required_permission_codes
                        ELSE COALESCE(
                            (
                                SELECT jsonb_agg(DISTINCT trim(value))
                                FROM jsonb_array_elements_text(al.required_roles) AS value
                                WHERE trim(value) <> ''
                                  AND position('.' IN trim(value)) > 0
                            ),
                            '["approval.requests.approve"]'::jsonb
                        )
                    END
                WHERE jsonb_typeof(al.required_roles) = 'array';
            END IF;
        END
        $$;
    `)

    const missingColumns = await tenantConnection<{ column_name: string }[]>`
        select required.column_name
        from unnest(
            ARRAY[
                'required_role_codes',
                'required_permission_codes',
                'role_match_mode',
                'permission_match_mode'
            ]::text[]
        ) as required(column_name)
        where not exists (
            select 1
            from information_schema.columns existing
            where existing.table_schema = 'approval'
              and existing.table_name = 'approval_levels'
              and existing.column_name = required.column_name
        )
    `

    if (missingColumns.length > 0) {
        const names = missingColumns.map((item) => item.column_name).join(', ')
        throw new Error(`approval.approval_levels missing required columns after compatibility check: ${names}`)
    }
}

export async function ensureJobsTablesCompatibility(): Promise<void> {
    try {
        await platformConnection.unsafe(`CREATE EXTENSION IF NOT EXISTS pgcrypto;`)
    } catch (err: any) {
        // PostgreSQL error code 42501 = insufficient_privilege; non-fatal when pgcrypto is managed externally
        const errMsg = String(err?.message || err).toLowerCase();
        const isPrivilegeError = err?.code === '42501' || errMsg.includes('permission') || errMsg.includes('privilege');
        if (!isPrivilegeError) {
            throw err;
        }
        console.warn('[ensureJobsTablesCompatibility] Could not create pgcrypto extension (insufficient privilege). Continuing...');
    }
}
