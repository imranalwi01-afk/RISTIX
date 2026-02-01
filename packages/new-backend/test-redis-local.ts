
import IORedis from 'ioredis';

async function testRedis(host: string) {
    console.log(`📡 Testing Redis at ${host}...`);
    const redis = new IORedis({
        host,
        port: 6379,
        connectTimeout: 2000,
        lazyConnect: true
    });

    try {
        await redis.connect();
        console.log(`✅ SUCCESS: Connected to Redis at ${host}`);
        await redis.quit();
    } catch (err: any) {
        console.error(`❌ FAILURE: Could not connect to Redis at ${host}: ${err.message}`);
    }
}

async function main() {
    await testRedis('127.0.0.1');
    await testRedis('localhost');
    await testRedis('0.0.0.0');
    // Try to get host IP
    try {
        const { execSync } = require('child_process');
        const ip = execSync("ifconfig | grep 'inet ' | grep -v '127.0.0.1' | head -n 1 | awk '{print $2}'").toString().trim();
        if (ip) await testRedis(ip);
    } catch { }
}

main();
