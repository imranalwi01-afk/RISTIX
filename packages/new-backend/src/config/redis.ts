import IORedis from 'ioredis'
import { env } from './env'

/**
 * Redis client for session management and caching
 * Supports both REDIS_URL (for Docker) and individual env vars (for local dev)
 */
export const redis = env.REDIS_URL
    ? new IORedis(env.REDIS_URL, {
        maxRetriesPerRequest: null,
        lazyConnect: true,
        retryStrategy(times) {
            const delay = Math.min(times * 100, 2000)
            return delay
        },
    })
    : new IORedis({
        host: env.REDIS_HOST || 'localhost',
        port: parseInt(env.REDIS_PORT || '6379'),
        password: env.REDIS_PASSWORD || undefined,
        db: parseInt(env.REDIS_SESSION_DB || '11'),
        lazyConnect: true,
        retryStrategy(times) {
            const delay = Math.min(times * 100, 2000)
            return delay
        },
        maxRetriesPerRequest: null,
    })

// Track connection state to suppress initial errors
let isConnected = false

redis.on('connect', () => {
    if (!isConnected) {
        console.log('✅ Redis connected for session management')
        isConnected = true
    }
})

redis.on('error', (err) => {
    // Only log errors after initial connection established
    if (isConnected) {
        console.error('❌ Redis session error:', err.message)
    }
})

export default redis
