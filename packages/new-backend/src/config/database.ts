import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { env } from './env'
import * as schema from '../db/schema'

/**
 * PostgreSQL connection using postgres.js
 */
const connection = postgres(env.DATABASE_URL, {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
})

/**
 * Legacy PostgreSQL connection (FRS9PRO)
 */
const legacyConnection = postgres(env.LEGACY_DATABASE_URL, {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
})

/**
 * Drizzle ORM instance with schema
 * The schema is needed for the relational query API (db.query.*)
 */
export const db = drizzle(connection, { schema })

/**
 * Legacy Drizzle ORM instance
 * Initialize without schema for now, or add specific legacy schema later
 */
export const legacyDb = drizzle(legacyConnection, { schema })

/**
 * Close the database connection gracefully
 */
export async function closeDatabase(): Promise<void> {
    await Promise.all([
        connection.end(),
        legacyConnection.end()
    ])
}

export { connection, legacyConnection }
