import { z } from 'zod'
import { logger } from '../lib/logger'

/**
 * Environment schema with Zod validation
 */
const envSchema = z.object({
    // Server
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.coerce.number().default(4232),
    HOST: z.string().default('0.0.0.0'),

    // CORS Configuration
    CORS_ORIGINS: z.string().default('http://localhost:4231,https://iaf-ifrs.ifrspro.id,https://iaf-ifrs-be.ifrspro.id'),

    // Database Configuration (Generic)
    DB_HOST: z.string().default('localhost'),
    DB_PORT: z.coerce.number().default(5432),
    DB_USER: z.string().default('postgres'),
    DB_PASSWORD: z.string().default('postgres'),

    // Platform Database
    PLATFORM_DB_HOST: z.string().optional(),
    PLATFORM_DB_PORT: z.coerce.number().optional(),
    PLATFORM_DB_USER: z.string().optional(),
    PLATFORM_DB_PASSWORD: z.string().optional(),
    PLATFORM_DB_NAME: z.string().default('ifrspro_platform_admin'),
    PLATFORM_DB_SSL: z.string().transform(val => val === 'true').default('false'),

    // // Shared Services Database
    // SHARED_DB_HOST: z.string().optional(),
    // SHARED_DB_PORT: z.coerce.number().optional(),
    // SHARED_DB_USER: z.string().optional(),
    // SHARED_DB_PASSWORD: z.string().optional(),
    // SHARED_DB_NAME: z.string().default('ifrspro_shared_services'),
    // SHARED_DB_SSL: z.string().transform(val => val === 'true').default('false'),

    // Tenant Database
    TENANT_DB_HOST: z.string().optional(),
    TENANT_DB_PORT: z.coerce.number().optional(),
    TENANT_DB_USER: z.string().optional(),
    TENANT_DB_PASSWORD: z.string().optional(),
    TENANT_DB_NAME: z.string().default('ifrspro_tenant_iaf'),
    TENANT_DB_SSL: z.string().transform(val => val === 'true').default('false'),

    // Legacy Database
    LEGACY_DB_HOST: z.string().optional(),
    LEGACY_DB_PORT: z.coerce.number().optional(),
    LEGACY_DB_USER: z.string().optional(),
    LEGACY_DB_PASSWORD: z.string().optional(),
    LEGACY_DB_NAME: z.string().default('FRS9PRO'),
    LEGACY_DB_SSL: z.string().transform(val => val === 'true').default('false'),

    // Backward compatibility - Database URLs
    DATABASE_URL: z.string().url().optional(),
    LEGACY_DATABASE_URL: z.string().url().optional(),

    // Tenant Configuration
    TENANT_ID: z.string().default('iaf'),
    TENANT_NAME: z.string().default('Indonesia Airawata Finance'),
    TENANT_SLUG: z.string().default('iaf'),
    COMPANY_NAME: z.string().default('Indonesia Airawata Finance'),
    BANKING_TYPE: z.string().default('conventional'),
    SINGLE_TENANT_MODE: z.string().transform(val => val === 'true').default('true'),

    // JWT
    JWT_SECRET: z.string().min(32),
    JWT_EXPIRES_IN: z.string().default('1h'),

    // Redis (optional)
    REDIS_URL: z.string().url().optional(),
    REDIS_HOST: z.string().optional(),
    REDIS_PORT: z.string().optional(), // Using string to match redis.ts parsing logic or coerce? redis.ts parses int.
    REDIS_PASSWORD: z.string().optional(),
    REDIS_SESSION_DB: z.string().optional(),
    REDIS_QUEUE_DB: z.string().default('0'),

    // R Analytics Service
    R_SERVICE_URL: z.string().url().default('http://localhost:4241'),

    // Logging
    LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
})

export type Env = z.infer<typeof envSchema>

/**
 * Parse and validate environment variables
 */
function parseEnv(): Env {
    // Manual fallback: Read .env if LEGACY_DATABASE_URL is missing
    // This handles cases where bun might not load .env from the expected location or cache issues
    if (!process.env.LEGACY_DATABASE_URL) {
        try {
            // Use dynamic import or require to avoid top-level node types issues if strict
            const fs = require('fs')
            const path = require('path')
            const envPath = path.resolve(process.cwd(), '.env')

            if (fs.existsSync(envPath)) {
                logger.info({ envPath }, 'Manually loading .env from file')
                const content = fs.readFileSync(envPath, 'utf-8')
                content.split('\n').forEach((line: string) => {
                    const match = line.match(/^\s*([\w_]+)\s*=\s*(.*)?\s*$/)
                    if (match) {
                        const key = match[1]
                        const value = match[2] ? match[2].trim() : ''
                        // Only set if not already defined
                        if (!process.env[key]) {
                            process.env[key] = value
                        }
                    }
                })
            }
        } catch (e) {
            logger.warn({ err: e }, 'Failed to manually load .env file')
        }
    }

    const result = envSchema.safeParse(process.env)

    if (!result.success) {
        logger.error({ errors: result.error.flatten().fieldErrors }, 'Invalid environment variables')
        process.exit(1)
    }

    return result.data
}


export const env = parseEnv()

/**
 * Helper function to construct PostgreSQL connection URL
 */
function constructDatabaseUrl(
    host: string,
    port: number,
    user: string,
    password: string,
    database: string,
    ssl: boolean = false
): string {
    const sslParam = ssl ? '?sslmode=require' : ''
    return `postgresql://${user}:${password}@${host}:${port}/${database}${sslParam}`
}

/**
 * Get Platform Database URL
 */
export function getPlatformDatabaseUrl(): string {
    // Use DATABASE_URL if provided (backward compatibility)
    if (env.DATABASE_URL) {
        return env.DATABASE_URL
    }

    // Otherwise construct from individual parameters
    const host = env.PLATFORM_DB_HOST || env.DB_HOST
    const port = env.PLATFORM_DB_PORT || env.DB_PORT
    const user = env.PLATFORM_DB_USER || env.DB_USER
    const password = env.PLATFORM_DB_PASSWORD || env.DB_PASSWORD
    const database = env.PLATFORM_DB_NAME
    const ssl = env.PLATFORM_DB_SSL

    return constructDatabaseUrl(host, port, user, password, database, ssl)
}

// /**a
//  * Get Shared Services Database URL
//  */
// export function getSharedDatabaseUrl(): string {
//     const host = env.SHARED_DB_HOST || env.DB_HOST
//     const port = env.SHARED_DB_PORT || env.DB_PORT
//     const user = env.SHARED_DB_USER || env.DB_USER
//     const password = env.SHARED_DB_PASSWORD || env.DB_PASSWORD
//     const database = env.SHARED_DB_NAME
//     const ssl = env.SHARED_DB_SSL

//     return constructDatabaseUrl(host, port, user, password, database, ssl)
// }

/**
 * Get Tenant Database URL
 */
export function getTenantDatabaseUrl(): string {
    const host = env.TENANT_DB_HOST || env.DB_HOST
    const port = env.TENANT_DB_PORT || env.DB_PORT
    const user = env.TENANT_DB_USER || env.DB_USER
    const password = env.TENANT_DB_PASSWORD || env.DB_PASSWORD
    const database = env.TENANT_DB_NAME
    const ssl = env.TENANT_DB_SSL

    return constructDatabaseUrl(host, port, user, password, database, ssl)
}

/**
 * Get Legacy Database URL
 */
export function getLegacyDatabaseUrl(): string {
    // Use LEGACY_DATABASE_URL if provided (backward compatibility)
    if (env.LEGACY_DATABASE_URL) {
        return env.LEGACY_DATABASE_URL
    }

    // Otherwise construct from individual parameters
    const host = env.LEGACY_DB_HOST || env.DB_HOST
    const port = env.LEGACY_DB_PORT || env.DB_PORT
    const user = env.LEGACY_DB_USER || env.DB_USER
    const password = env.LEGACY_DB_PASSWORD || env.DB_PASSWORD
    const database = env.LEGACY_DB_NAME
    const ssl = env.LEGACY_DB_SSL

    return constructDatabaseUrl(host, port, user, password, database, ssl)
}

/**
 * Mask sensitive information in a database URL
 */
export function maskDatabaseUrl(url: string): string {
    try {
        // Matches postgresql://user:password@host:port/database
        return url.replace(/(postgresql:\/\/)([^:]+):([^@]+)(@.+)/, '$1$2:****$4')
    } catch {
        return 'invalid-url'
    }
}

/**
 * Get Database URL based on tenant context
 */
export function getDatabaseUrl(tenantId?: string | null): string {
    if (tenantId) {
        return getTenantDatabaseUrl()
    }
    return getPlatformDatabaseUrl()
}

/**
 * Check if running in production
 */
export const isProduction = env.NODE_ENV === 'production'

/**
 * Check if running in development
 */
export const isDevelopment = env.NODE_ENV === 'development'
