import IORedis, { type RedisOptions } from 'ioredis'
import { env } from './env'
import { logger } from '../lib/logger'

/**
 * Redis client for session management and caching
 * Supports both REDIS_URL (for Docker) and individual env vars (for local dev)
 */
/**
 * Get Redis connection options
 */
export const getRedisConnectionOptions = (dbIndex?: number): RedisOptions => {
    const options: RedisOptions = {
        maxRetriesPerRequest: null, // Required by BullMQ
        enableReadyCheck: false,
        host: env.REDIS_HOST || 'localhost',
        port: parseInt(env.REDIS_PORT || '6379'),
        password: env.REDIS_PASSWORD || undefined,
        db: parseInt(env.REDIS_SESSION_DB || '11'),
    }

    if (env.REDIS_URL) {
        try {
            const url = new URL(env.REDIS_URL)
            options.host = url.hostname
            options.port = Number(url.port) || 6379
            options.password = url.password || undefined
            options.username = url.username || undefined
            if (url.pathname.length > 1) {
                options.db = Number(url.pathname.slice(1))
            }
        } catch (e) {
            logger.warn({ err: e }, 'Invalid REDIS_URL')
        }
    }

    if (dbIndex !== undefined) {
        options.db = dbIndex
    }

    return options
}

export const redis = new IORedis({
    ...getRedisConnectionOptions(),
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
