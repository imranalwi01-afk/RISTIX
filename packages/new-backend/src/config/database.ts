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
