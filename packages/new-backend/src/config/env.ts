import { z } from 'zod'

/**
 * Environment schema with Zod validation
 */
const envSchema = z.object({
    // Server
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.coerce.number().default(4232),
    HOST: z.string().default('0.0.0.0'),

    // Database
    DATABASE_URL: z.string().url(),
    LEGACY_DATABASE_URL: z.string().url(),

    // JWT
    JWT_SECRET: z.string().min(32),
    JWT_EXPIRES_IN: z.string().default('1h'),

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
    // Manual fallback: Read .env if LEGACY_DATABASE_URL is missing
    // This handles cases where bun might not load .env from the expected location or cache issues
    if (!process.env.LEGACY_DATABASE_URL) {
        try {
            // Use dynamic import or require to avoid top-level node types issues if strict
            const fs = require('fs')
            const path = require('path')
            const envPath = path.resolve(process.cwd(), '.env')

            if (fs.existsSync(envPath)) {
                console.log('📝 Manually loading .env from:', envPath)
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
            console.warn('⚠️ Failed to manually load .env file:', e)
        }
    }

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
