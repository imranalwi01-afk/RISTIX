// packages/backend/src/config/redis.ts
import { createClient, RedisClientType } from 'redis';
import logger from './logger';

interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db: number;
  retryDelayOnFailover: number;
  enableOfflineQueue: boolean;
  maxRetriesPerRequest: number;
  lazyConnect: boolean;
}

// Redis configuration for different environments
export const redisConfigs = {
  session: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_SESSION_DB || '0'),
    retryDelayOnFailover: 100,
    enableOfflineQueue: false,
    maxRetriesPerRequest: 3,
    lazyConnect: true,
  } as RedisConfig,
  
  cache: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_CACHE_DB || '1'),
    retryDelayOnFailover: 100,
    enableOfflineQueue: false,
    maxRetriesPerRequest: 3,
    lazyConnect: true,
  } as RedisConfig,
  
  tokenBlacklist: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_TOKEN_BLACKLIST_DB || '4'),
    retryDelayOnFailover: 100,
    enableOfflineQueue: false,
    maxRetriesPerRequest: 3,
    lazyConnect: true,
  } as RedisConfig,
  
  rateLimit: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_RATE_LIMIT_DB || '2'),
    retryDelayOnFailover: 100,
    enableOfflineQueue: false,
    maxRetriesPerRequest: 3,
    lazyConnect: true,
  } as RedisConfig,
  
  pubsub: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_PUBSUB_DB || '3'),
    retryDelayOnFailover: 100,
    enableOfflineQueue: false,
    maxRetriesPerRequest: 3,
    lazyConnect: true,
  } as RedisConfig,
};

// Redis client factory
export class RedisManager {
  private static instance: RedisManager;
  private clients: Map<string, RedisClientType> = new Map();

  private constructor() {}

  public static getInstance(): RedisManager {
    if (!RedisManager.instance) {
      RedisManager.instance = new RedisManager();
    }
    return RedisManager.instance;
  }

  public async getClient(type: keyof typeof redisConfigs): Promise<RedisClientType> {
    if (this.clients.has(type)) {
      const client = this.clients.get(type)!;
      if (client.isOpen) {
        return client;
      }
    }

    const config = redisConfigs[type];
    const client = createClient({
      socket: {
        host: config.host,
        port: config.port,
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            return new Error('Too many retries');
          }
          return Math.min(retries * 100, 3000);
        },
      },
      password: config.password,
      database: config.db,
    });

    client.on('error', (error) => {
      logger.error(`Redis [${type}] Error:`, error);
    });

    client.on('connect', () => {
      logger.info(`Redis [${type}] connected successfully`);
    });

    client.on('ready', () => {
      logger.info(`Redis [${type}] ready to receive commands`);
    });

    client.on('end', () => {
      logger.warn(`Redis [${type}] connection ended`);
    });

    await client.connect();
    this.clients.set(type, client);
    
    return client;
  }

  public async closeAll(): Promise<void> {
    const promises = Array.from(this.clients.values()).map(client => {
      if (client.isOpen) {
        return client.quit();
      }
      return Promise.resolve();
    });
    
    await Promise.all(promises);
    this.clients.clear();
    logger.info('All Redis connections closed');
  }
}

export default RedisManager;
