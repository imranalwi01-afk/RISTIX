import IORedis from 'ioredis'
import { env } from './env'
import { logger } from '../lib/logger'

/**
 * Redis client for session management and caching
 * Supports both REDIS_URL (for Docker) and individual env vars (for local dev)
 */
/**
 * Get Redis connection options
 */
export const getRedisConnectionOptions = (dbIndex?: number) => {
    // If REDIS_URL is provided, specific options might be limited if parsed manually, 
    // but IORedis handles URL in constructor. 
    // However, to support standard options object for BullMQ:

    if (env.REDIS_URL) {
        return env.REDIS_URL
    }

    return {
        host: env.REDIS_HOST || 'localhost',
        port: parseInt(env.REDIS_PORT || '6379'),
        password: env.REDIS_PASSWORD || undefined,
        db: dbIndex !== undefined ? dbIndex : parseInt(env.REDIS_SESSION_DB || '11'),
        maxRetriesPerRequest: null, // Required by BullMQ
    }
}

export const redis = new IORedis(getRedisConnectionOptions() as any, {
    maxRetriesPerRequest: null,
    lazyConnect: true,
    retryStrategy(times) {
        return Math.min(times * 100, 2000)
    },
})

// Track connection state to suppress initial errors
let isConnected = false

redis.on('connect', () => {
    if (!isConnected) {
        logger.info('Redis connected for session management')
        isConnected = true
    }
})

redis.on('error', (err) => {
    // Only log errors after initial connection established
    if (isConnected) {
        logger.error({ err }, 'Redis session error')
    }
})

export default redis
