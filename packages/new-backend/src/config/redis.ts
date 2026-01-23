import IORedis from 'ioredis'
import { env } from './env'

/**
 * Redis client for session management and caching
 * Supports both REDIS_URL (for Docker) and individual env vars (for local dev)
 */
export const redis = env.REDIS_URL
    ? new IORedis(env.REDIS_URL, {
        maxRetriesPerRequest: null,
        retryStrategy(times) {
            const delay = Math.min(times * 50, 2000)
            return delay
        },
    })
    : new IORedis({
        host: env.REDIS_HOST || 'localhost',
        port: parseInt(env.REDIS_PORT || '6379'),
        password: env.REDIS_PASSWORD || undefined,
        db: parseInt(env.REDIS_SESSION_DB || '11'),
        retryStrategy(times) {
            const delay = Math.min(times * 50, 2000)
            return delay
        },
        maxRetriesPerRequest: null,
    })

redis.on('connect', () => {
    console.log('✅ Redis connected for session management')
})

redis.on('error', (err) => {
    console.error('❌ Redis connection error:', err)
})

export default redis
