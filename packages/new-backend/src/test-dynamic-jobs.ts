
import { addJob } from './services/queue.service';
import { getDatabase } from './config/database';
import { jobDefinitions, jobExecutions } from './db/schema';
import { eq } from 'drizzle-orm';

async function test() {
    console.log('🚀 Starting end-to-end Job Execution test...');

    const tenantId = 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be';
    const targetDb = getDatabase(tenantId);

    // Dynamic import to avoid issues if not needed
    const { Redis } = await import('ioredis');
    const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
    try {
        const pong = await redis.ping();
        console.log('📬 Redis Ping:', pong);
        await redis.quit();
    } catch (e) {
        console.error('❌ Redis Connection Failed:', e);
        process.exit(1);
    }

    try {
        const runTest = async (name: string, type: string, params: any) => {
            console.log(`\n--- Testing ${name} (${type}) ---`);
            const [jobDef] = await targetDb.insert(jobDefinitions).values({
                tenantId,
                name: `${name} ${Date.now()}`,
                jobType: type,
                defaultParameters: params,
                isEnabled: true
            }).returning();

            console.log('✅ Job Definition created:', jobDef.id);

            const executionId = `exec-${type.toLowerCase()}-${Date.now()}`;
            await targetDb.insert(jobExecutions).values({
                id: executionId,
                jobDefinitionId: jobDef.id,
                tenantId,
                jobName: jobDef.name,
                jobType: jobDef.jobType,
                status: 'waiting',
                startTime: new Date()
            });

            console.log('Queuing job...');
            await addJob(jobDef.jobType, {
                definitionId: jobDef.id,
                tenantId,
                parameters: params
            }, { jobId: executionId });

            console.log('Polling...');
            for (let i = 0; i < 20; i++) {
                await new Promise(r => setTimeout(r, 1000));
                const [exec] = await targetDb.select().from(jobExecutions).where(eq(jobExecutions.id, executionId));
                if (exec && (exec.status === 'completed' || exec.status === 'failed')) {
                    console.log(`🏁 Finished: ${exec.status}`);
                    console.log('Result:', JSON.stringify(exec.result, null, 2));
                    if (exec.error) console.log('Error:', exec.error);
                    return;
                }
                console.log(`Status: ${exec?.status}`);
            }
            console.warn('⚠️ Timed out');
        };

        // 1. Internal Script
        await runTest('Internal Script', 'INTERNAL_SCRIPT', { handlerName: 'test_handler', params: { hello: 'world' } });

        // 2. SQL Stored Procedure
        await runTest('SQL SP', 'SQL_SP', { procedureName: 'public.test_sp', parameters: ['Test Value'] });

        // 3. Shell Command
        await runTest('Shell Command', 'SHELL_COMMAND', { command: 'echo', args: ['Hello from Shell'] });

    } catch (err) {
        console.error('\n❌ Test failed with error:', err);
    }
}

test().catch(console.error).finally(() => {
    console.log('\n👋 Test script exiting.');
    process.exit();
});
