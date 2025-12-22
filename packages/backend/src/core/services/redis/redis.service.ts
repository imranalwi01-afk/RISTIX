// packages/backend/src/core/services/redis/redis.service.ts
import Redis from 'ioredis';
import { ConfigurationService } from '../configuration/configuration.service';

export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db: number;
  retryDelayOnFailover: number;
  maxRetriesPerRequest: number;
  lazyConnect: boolean;
  keepAlive: number;
  family: number;
}

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  prefix?: string;
  compress?: boolean;
}

export class RedisService {
  private client: Redis;
  private subscriber: Redis;
  private publisher: Redis;
  private isConnected: boolean = false;

  constructor(private readonly configService: ConfigurationService) {
    this.initialize();
  }

  /**
   * Initialize Redis connections
   */
  private async initialize(): Promise<void> {
    try {
      const config = await this.getRedisConfig();
      
      // Main client for general operations
      this.client = new Redis({
        host: config.host,
        port: config.port,
        password: config.password,
        db: config.db,
        retryDelayOnFailover: config.retryDelayOnFailover,
        maxRetriesPerRequest: config.maxRetriesPerRequest,
        lazyConnect: config.lazyConnect,
        keepAlive: config.keepAlive,
        family: config.family
      });

      // Separate connections for pub/sub
      this.subscriber = this.client.duplicate();
      this.publisher = this.client.duplicate();

      // Set up event handlers
      this.setupEventHandlers();

      // Connect
      await this.connect();
      
    } catch (error) {
      console.error('Redis initialization error:', error);
      throw error;
    }
  }

  /**
   * Connect to Redis
   */
  private async connect(): Promise<void> {
    try {
      await this.client.connect();
      await this.subscriber.connect();
      await this.publisher.connect();
      
      this.isConnected = true;
      console.log('✅ Redis connected successfully');
      
    } catch (error) {
      console.error('Redis connection error:', error);
      this.isConnected = false;
      throw error;
    }
  }

  /**
   * Basic Redis operations
   */
  async get(key: string): Promise<string | null> {
    try {
      return await this.client.get(key);
    } catch (error) {
      console.error(`Redis GET error for key ${key}:`, error);
      return null;
    }
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    try {
      if (ttl) {
        await this.client.setex(key, ttl, value);
      } else {
        await this.client.set(key, value);
      }
    } catch (error) {
      console.error(`Redis SET error for key ${key}:`, error);
      throw error;
    }
  }

  async setex(key: string, seconds: number, value: string): Promise<void> {
    try {
      await this.client.setex(key, seconds, value);
    } catch (error) {
      console.error(`Redis SETEX error for key ${key}:`, error);
      throw error;
    }
  }

  async del(key: string): Promise<number> {
    try {
      return await this.client.del(key);
    } catch (error) {
      console.error(`Redis DEL error for key ${key}:`, error);
      return 0;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      console.error(`Redis EXISTS error for key ${key}:`, error);
      return false;
    }
  }

  async expire(key: string, seconds: number): Promise<boolean> {
    try {
      const result = await this.client.expire(key, seconds);
      return result === 1;
    } catch (error) {
      console.error(`Redis EXPIRE error for key ${key}:`, error);
      return false;
    }
  }

  async ttl(key: string): Promise<number> {
    try {
      return await this.client.ttl(key);
    } catch (error) {
      console.error(`Redis TTL error for key ${key}:`, error);
      return -1;
    }
  }

  async keys(pattern: string): Promise<string[]> {
    try {
      return await this.client.keys(pattern);
    } catch (error) {
      console.error(`Redis KEYS error for pattern ${pattern}:`, error);
      return [];
    }
  }

  /**
   * Increment operations
   */
  async incr(key: string): Promise<number> {
    try {
      return await this.client.incr(key);
    } catch (error) {
      console.error(`Redis INCR error for key ${key}:`, error);
      throw error;
    }
  }

  async decr(key: string): Promise<number> {
    try {
      return await this.client.decr(key);
    } catch (error) {
      console.error(`Redis DECR error for key ${key}:`, error);
      throw error;
    }
  }

  async incrby(key: string, increment: number): Promise<number> {
    try {
      return await this.client.incrby(key, increment);
    } catch (error) {
      console.error(`Redis INCRBY error for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Hash operations
   */
  async hget(key: string, field: string): Promise<string | null> {
    try {
      return await this.client.hget(key, field);
    } catch (error) {
      console.error(`Redis HGET error for key ${key}, field ${field}:`, error);
      return null;
    }
  }

  async hset(key: string, field: string, value: string): Promise<number> {
    try {
      return await this.client.hset(key, field, value);
    } catch (error) {
      console.error(`Redis HSET error for key ${key}, field ${field}:`, error);
      throw error;
    }
  }

  async hmset(key: string, hash: Record<string, string>): Promise<void> {
    try {
      await this.client.hmset(key, hash);
    } catch (error) {
      console.error(`Redis HMSET error for key ${key}:`, error);
      throw error;
    }
  }

  async hgetall(key: string): Promise<Record<string, string>> {
    try {
      return await this.client.hgetall(key);
    } catch (error) {
      console.error(`Redis HGETALL error for key ${key}:`, error);
      return {};
    }
  }

  async hdel(key: string, field: string): Promise<number> {
    try {
      return await this.client.hdel(key, field);
    } catch (error) {
      console.error(`Redis HDEL error for key ${key}, field ${field}:`, error);
      return 0;
    }
  }

  /**
   * List operations
   */
  async lpush(key: string, value: string): Promise<number> {
    try {
      return await this.client.lpush(key, value);
    } catch (error) {
      console.error(`Redis LPUSH error for key ${key}:`, error);
      throw error;
    }
  }

  async rpush(key: string, value: string): Promise<number> {
    try {
      return await this.client.rpush(key, value);
    } catch (error) {
      console.error(`Redis RPUSH error for key ${key}:`, error);
      throw error;
    }
  }

  async lpop(key: string): Promise<string | null> {
    try {
      return await this.client.lpop(key);
    } catch (error) {
      console.error(`Redis LPOP error for key ${key}:`, error);
      return null;
    }
  }

  async rpop(key: string): Promise<string | null> {
    try {
      return await this.client.rpop(key);
    } catch (error) {
      console.error(`Redis RPOP error for key ${key}:`, error);
      return null;
    }
  }

  async lrange(key: string, start: number, stop: number): Promise<string[]> {
    try {
      return await this.client.lrange(key, start, stop);
    } catch (error) {
      console.error(`Redis LRANGE error for key ${key}:`, error);
      return [];
    }
  }

  async ltrim(key: string, start: number, stop: number): Promise<void> {
    try {
      await this.client.ltrim(key, start, stop);
    } catch (error) {
      console.error(`Redis LTRIM error for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Set operations
   */
  async sadd(key: string, member: string): Promise<number> {
    try {
      return await this.client.sadd(key, member);
    } catch (error) {
      console.error(`Redis SADD error for key ${key}:`, error);
      throw error;
    }
  }

  async srem(key: string, member: string): Promise<number> {
    try {
      return await this.client.srem(key, member);
    } catch (error) {
      console.error(`Redis SREM error for key ${key}:`, error);
      throw error;
    }
  }

  async smembers(key: string): Promise<string[]> {
    try {
      return await this.client.smembers(key);
    } catch (error) {
      console.error(`Redis SMEMBERS error for key ${key}:`, error);
      return [];
    }
  }

  async sismember(key: string, member: string): Promise<boolean> {
    try {
      const result = await this.client.sismember(key, member);
      return result === 1;
    } catch (error) {
      console.error(`Redis SISMEMBER error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Pub/Sub operations
   */
  async publish(channel: string, message: string): Promise<number> {
    try {
      return await this.publisher.publish(channel, message);
    } catch (error) {
      console.error(`Redis PUBLISH error for channel ${channel}:`, error);
      throw error;
    }
  }

  async subscribe(channel: string, callback: (message: string) => void): Promise<void> {
    try {
      await this.subscriber.subscribe(channel);
      this.subscriber.on('message', (receivedChannel, message) => {
        if (receivedChannel === channel) {
          callback(message);
        }
      });
    } catch (error) {
      console.error(`Redis SUBSCRIBE error for channel ${channel}:`, error);
      throw error;
    }
  }

  async unsubscribe(channel: string): Promise<void> {
    try {
      await this.subscriber.unsubscribe(channel);
    } catch (error) {
      console.error(`Redis UNSUBSCRIBE error for channel ${channel}:`, error);
      throw error;
    }
  }

  /**
   * Cache operations with JSON support
   */
  async getJson<T>(key: string): Promise<T | null> {
    try {
      const value = await this.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`Redis getJson error for key ${key}:`, error);
      return null;
    }
  }

  async setJson<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      await this.set(key, jsonValue, ttl);
    } catch (error) {
      console.error(`Redis setJson error for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Session management
   */
  async getSession(sessionId: string): Promise<any> {
    return this.getJson(`session:${sessionId}`);
  }

  async setSession(sessionId: string, data: any, ttl: number = 3600): Promise<void> {
    await this.setJson(`session:${sessionId}`, data, ttl);
  }

  async deleteSession(sessionId: string): Promise<void> {
    await this.del(`session:${sessionId}`);
  }

  /**
   * Lock operations (for distributed locking)
   */
  async acquireLock(lockKey: string, ttl: number = 30): Promise<boolean> {
    try {
      const result = await this.client.set(lockKey, '1', 'PX', ttl * 1000, 'NX');
      return result === 'OK';
    } catch (error) {
      console.error(`Redis acquireLock error for key ${lockKey}:`, error);
      return false;
    }
  }

  async releaseLock(lockKey: string): Promise<void> {
    await this.del(lockKey);
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ status: string; latency?: number }> {
    try {
      const start = Date.now();
      await this.client.ping();
      const latency = Date.now() - start;
      
      return {
        status: 'healthy',
        latency
      };
    } catch (error) {
      return {
        status: 'unhealthy'
      };
    }
  }

  /**
   * Get connection info
   */
  getConnectionInfo(): { isConnected: boolean } {
    return {
      isConnected: this.isConnected
    };
  }

  /**
   * Cleanup and disconnect
   */
  async disconnect(): Promise<void> {
    try {
      await this.client.disconnect();
      await this.subscriber.disconnect();
      await this.publisher.disconnect();
      this.isConnected = false;
      console.log('Redis disconnected');
    } catch (error) {
      console.error('Redis disconnect error:', error);
    }
  }

  // Private helper methods
  private async getRedisConfig(): Promise<RedisConfig> {
    return {
      host: await this.configService.get<string>('redis.host', undefined, 'localhost'),
      port: await this.configService.get<number>('redis.port', undefined, 6379),
      password: await this.configService.get<string>('redis.password', undefined, undefined),
      db: await this.configService.get<number>('redis.db', undefined, 0),
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      keepAlive: 30000,
      family: 4
    };
  }

  private setupEventHandlers(): void {
    this.client.on('connect', () => {
      console.log('Redis client connected');
      this.isConnected = true;
    });

    this.client.on('error', (error) => {
      console.error('Redis client error:', error);
      this.isConnected = false;
    });

    this.client.on('close', () => {
      console.log('Redis client connection closed');
      this.isConnected = false;
    });

    this.client.on('reconnecting', () => {
      console.log('Redis client reconnecting...');
    });
  }
}
