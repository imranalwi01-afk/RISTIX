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
import { debugLog } from '../lib/debug-logger'

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

/**
 * Platform Admin Database Connection
 * For platform-wide administration, users, roles, etc.
 */
const platformConnection = postgres(getPlatformDatabaseUrl(), connectionConfig)
const tenantConnection = postgres(getTenantDatabaseUrl(), connectionConfig)
const legacyConnection = postgres(getLegacyDatabaseUrl(), connectionConfig)

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
    debugLog(`[Database] getDatabase called with tenantId: ${tenantId}`);
    if (tenantId) {
        debugLog(`[Database] Routing to Tenant DB`);
        return tenantDb
    }
    debugLog('[Database] Routing to Platform DB');
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
        // Insufficient privilege is non-fatal: pgcrypto may already exist or be managed externally
        if (!String(err?.message || err).toLowerCase().includes('permission') && !String(err?.message || err).toLowerCase().includes('privilege')) {
            throw err;
        }
        console.warn('[ensureJobsTablesCompatibility] Could not create pgcrypto extension (insufficient privilege). Continuing...');
    }
    await platformConnection.unsafe(`CREATE SCHEMA IF NOT EXISTS core;`)

    await platformConnection.unsafe(`
        CREATE TABLE IF NOT EXISTS core.tenants (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
            code varchar(50) NOT NULL,
            name varchar(255) NOT NULL,
            slug varchar(100),
            description text,
            type varchar(50) DEFAULT 'banking',
            banking_mode varchar(20) DEFAULT 'conventional',
            settings jsonb DEFAULT '{}'::jsonb,
            is_active boolean NOT NULL DEFAULT true,
            created_at timestamp NOT NULL DEFAULT now(),
            updated_at timestamp NOT NULL DEFAULT now()
        );
    `)
    await platformConnection.unsafe(`CREATE UNIQUE INDEX IF NOT EXISTS tenants_code_idx ON core.tenants(code);`)

    await platformConnection.unsafe(`
        INSERT INTO core.tenants (id, code, name, slug, description, type, banking_mode, settings, is_active, created_at, updated_at)
        SELECT
            t.id,
            t.code,
            t.name,
            t.slug,
            t.description,
            t.type,
            t.banking_mode,
            COALESCE(NULLIF(t.settings, ''), '{}')::jsonb,
            t.is_active,
            COALESCE(t.created_at, now()),
            COALESCE(t.updated_at, now())
        FROM platform_admin.tenants t
        ON CONFLICT (id) DO NOTHING;
    `)

    await platformConnection.unsafe(`
        CREATE TABLE IF NOT EXISTS core.job_definitions (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
            tenant_id uuid NOT NULL REFERENCES core.tenants(id) ON DELETE CASCADE,
            name varchar(255) NOT NULL,
            description text,
            job_type varchar(50) NOT NULL,
            cron_expression varchar(50),
            default_parameters jsonb DEFAULT '{}'::jsonb,
            is_enabled boolean DEFAULT true,
            priority varchar(20) DEFAULT 'NORMAL',
            timeout integer DEFAULT 3600,
            max_retries integer DEFAULT 0,
            created_by uuid,
            updated_by uuid,
            created_at timestamp DEFAULT now(),
            updated_at timestamp DEFAULT now(),
            last_run_status varchar(20),
            last_run_time timestamp,
            next_run_time timestamp,
            requires_approval boolean DEFAULT false,
            approval_matrix_id uuid,
            auto_approve_conditions jsonb
        );
    `)

    await platformConnection.unsafe(`
        CREATE TABLE IF NOT EXISTS core.job_executions (
            id varchar(255) PRIMARY KEY NOT NULL,
            job_definition_id uuid REFERENCES core.job_definitions(id) ON DELETE SET NULL,
            tenant_id uuid NOT NULL REFERENCES core.tenants(id) ON DELETE CASCADE,
            job_name varchar(255) NOT NULL,
            job_type varchar(50) NOT NULL,
            status varchar(50) NOT NULL,
            progress integer DEFAULT 0,
            start_time timestamp,
            end_time timestamp,
            duration integer,
            parameters jsonb,
            result jsonb,
            error text,
            triggered_by uuid,
            worker_id varchar(255),
            tags jsonb DEFAULT '[]'::jsonb,
            approval_request_id uuid,
            approval_status varchar(20) DEFAULT 'not_required',
            approved_at timestamp,
            approved_by uuid
        );
    `)

    await platformConnection.unsafe(`CREATE INDEX IF NOT EXISTS idx_job_definitions_tenant ON core.job_definitions(tenant_id);`)
    await platformConnection.unsafe(`CREATE INDEX IF NOT EXISTS idx_job_definitions_type ON core.job_definitions(job_type);`)
    await platformConnection.unsafe(`CREATE INDEX IF NOT EXISTS idx_job_executions_tenant ON core.job_executions(tenant_id);`)
    await platformConnection.unsafe(`CREATE INDEX IF NOT EXISTS idx_job_executions_job_def ON core.job_executions(job_definition_id);`)
    await platformConnection.unsafe(`CREATE INDEX IF NOT EXISTS idx_job_executions_status ON core.job_executions(status);`)
    await platformConnection.unsafe(`CREATE INDEX IF NOT EXISTS idx_job_executions_type ON core.job_executions(job_type);`)
    await platformConnection.unsafe(`CREATE INDEX IF NOT EXISTS idx_job_executions_start_time ON core.job_executions(start_time);`)

    const [postDefinitions] = await platformConnection<{ exists: boolean }[]>`
        select to_regclass('core.job_definitions') is not null as exists
    `
    const [postExecutions] = await platformConnection<{ exists: boolean }[]>`
        select to_regclass('core.job_executions') is not null as exists
    `

    if (!postDefinitions?.exists || !postExecutions?.exists) {
        throw new Error('core.job_definitions/job_executions missing after jobs compatibility check')
    }
}
