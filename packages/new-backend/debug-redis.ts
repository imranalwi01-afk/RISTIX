
import { getRedisConnectionOptions } from './src/config/redis';
import { env } from './src/config/env';
import Redis from 'ioredis';

console.log('--- Redis Debug Script ---');
console.log('REDIS_HOST:', env.REDIS_HOST);
console.log('REDIS_PORT:', env.REDIS_PORT);
console.log('REDIS_PASSWORD (length):', env.REDIS_PASSWORD ? env.REDIS_PASSWORD.length : 'undefined');
console.log('REDIS_QUEUE_DB:', env.REDIS_QUEUE_DB);

const options = getRedisConnectionOptions(parseInt(env.REDIS_QUEUE_DB || '0'));
console.log('Computed Options:', JSON.stringify({ ...options, password: options.password ? '***' : undefined }, null, 2));

const redis = new Redis(options as any);

redis.ping().then(res => {
    console.log('PING success:', res);
    process.exit(0);
}).catch(err => {
    console.error('PING failed:', err);
    process.exit(1);
});
