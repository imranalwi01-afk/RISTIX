import { z } from 'zod'

/**
 * Environment schema with Zod validation
 */
const envSchema = z.object({
    // Server
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.coerce.number().default(3001),
    HOST: z.string().default('0.0.0.0'),

    // Database
    DATABASE_URL: z.string().url(),

    // JWT
    JWT_SECRET: z.string().min(32),
    JWT_EXPIRES_IN: z.string().default('24h'),

    // Redis (optional)
    REDIS_URL: z.string().url().optional(),

    // Logging
    LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
})

export type Env = z.infer<typeof envSchema>

/**
 * Parse and validate environment variables
 */
function parseEnv(): Env {
    const result = envSchema.safeParse(process.env)

    if (!result.success) {
        console.error('❌ Invalid environment variables:')
        console.error(result.error.flatten().fieldErrors)
        process.exit(1)
    }

    return result.data
}

export const env = parseEnv()

/**
 * Check if running in production
 */
export const isProduction = env.NODE_ENV === 'production'

/**
 * Check if running in development
 */
export const isDevelopment = env.NODE_ENV === 'development'
