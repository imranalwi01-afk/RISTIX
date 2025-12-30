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
 * Drizzle ORM instance with schema
 * The schema is needed for the relational query API (db.query.*)
 */
export const db = drizzle(connection, { schema })

/**
 * Close the database connection gracefully
 */
export async function closeDatabase(): Promise<void> {
    await connection.end()
}

export { connection }
