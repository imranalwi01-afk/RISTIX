import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import {
    getPlatformDatabaseUrl,
    getSharedDatabaseUrl,
    getTenantDatabaseUrl,
    getLegacyDatabaseUrl
} from './env'
import * as schema from '../db/schema'

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
const sharedConnection = postgres(getSharedDatabaseUrl(), connectionConfig)
const tenantConnection = postgres(getTenantDatabaseUrl(), connectionConfig)
const legacyConnection = postgres(getLegacyDatabaseUrl(), connectionConfig)

/**
 * Drizzle ORM instance for Platform Admin DB
 * The schema is needed for the relational query API (db.query.*)
 */
export const platformDb = drizzle(platformConnection, { schema })

/**
 * Drizzle ORM instance for Shared Services DB
 */
export const sharedDb = drizzle(sharedConnection, { schema })

/**
 * Drizzle ORM instance for Tenant DB
 */
export const tenantDb = drizzle(tenantConnection, { schema, logger: true })

/**
 * Legacy Drizzle ORM instance
 * Initialize without schema for now, or add specific legacy schema later
 */
export const legacyDb = drizzle(legacyConnection, { schema })

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
        sharedConnection.end(),
        tenantConnection.end(),
        legacyConnection.end()
    ])
}

export {
    platformConnection,
    sharedConnection,
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
        // In the future, this could look up a specific connection from a pool map based on tenantId
        // For now, in single-tenant mode (IAF), we return the default tenantDb
        return tenantDb
    }
    return platformDb
}
