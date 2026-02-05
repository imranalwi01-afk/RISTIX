
import { jobDefinitions, jobExecutions } from '../../db/schema';
import { getTableConfig } from 'drizzle-orm/pg-core';

export async function run(args: string[] = []) {
    console.log('--- Job Definitions Config ---');
    const defConfig = getTableConfig(jobDefinitions);
    console.log('Name:', defConfig.name);
    console.log('Schema:', (defConfig as any).schema);

    console.log('\n--- Job Executions Config ---');
    const execConfig = getTableConfig(jobExecutions);
    console.log('Name:', execConfig.name);
    console.log('Schema:', (execConfig as any).schema);
}
