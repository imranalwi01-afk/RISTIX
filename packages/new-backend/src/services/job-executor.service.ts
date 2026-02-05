
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../db/schema';
import { sql } from 'drizzle-orm';
import { logger } from '../lib/logger';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export type JobResult = {
    success: boolean;
    result?: any;
    error?: string;
    executionTimeMs: number;
};

export class JobExecutorService {
    constructor(private db: PostgresJsDatabase<typeof schema>) { }

    /**
     * Main entry point to execute a job based on its type
     */
    async execute(jobType: string, parameters: any): Promise<JobResult> {
        const startTime = Date.now();
        logger.info({ jobType, parameters }, 'Starting job execution');

        try {
            let result: any;

            switch (jobType) {
                case 'SQL_SP':
                    result = await this.executeSqlSp(parameters);
                    break;
                case 'INTERNAL_SCRIPT':
                    result = await this.executeInternalScript(parameters);
                    break;
                case 'SHELL_COMMAND':
                    result = await this.executeShellCommand(parameters);
                    break;
                default:
                    // Fallback to existing job types if any, or throw error
                    throw new Error(`Unsupported job type: ${jobType}`);
            }

            return {
                success: true,
                result,
                executionTimeMs: Date.now() - startTime,
            };
        } catch (error: any) {
            logger.error({ jobType, error: error.message }, 'Job execution failed');
            return {
                success: false,
                error: error.message,
                executionTimeMs: Date.now() - startTime,
            };
        }
    }

    /**
     * Execute a SQL Stored Procedure
     * Expected parameters: { procedureName: string, params: any[] }
     */
    private async executeSqlSp(parameters: any): Promise<any> {
        const { procedureName, schemaName, parameters: args = [], params = [] } = parameters;
        const finalArgs = args.length > 0 ? args : params;

        if (!procedureName) throw new Error('procedureName is required for SQL_SP');

        logger.info({ schemaName, procedureName, finalArgs }, 'Executing Stored Procedure');

        // Build query efficiently
        // If schemaName is provided, use identifier(schema).identifier(proc)
        // Otherwise just identifier(proc) (relying on search_path)
        const procIdentifier = schemaName
            ? sql`${sql.identifier(schemaName)}.${sql.identifier(procedureName)}`
            : sql`${sql.raw(procedureName)}`; // Keep raw behavior for backward compatibility if name includes dots

        const result = await this.db.execute(
            sql`SELECT * FROM ${procIdentifier}(${sql.join(finalArgs.map((a: any) => sql`${a}`), sql`, `)})`
        );

        return result;
    }

    /**
     * Execute an internal script/handler
     * Expected parameters: { handlerName: string, params: any }
     */
    private async executeInternalScript(parameters: any): Promise<any> {
        const { handlerName, params } = parameters;
        if (!handlerName) throw new Error('handlerName is required for INTERNAL_SCRIPT');

        logger.info({ handlerName, params }, 'Executing Internal Script');

        // Registry of internal handlers
        const handlers: Record<string, (p: any) => Promise<any>> = {
            'test_handler': async (p) => {
                return { message: 'Test handler executed successfully', received: p };
            },
            // Add more handlers here
        };

        const handler = handlers[handlerName];
        if (!handler) throw new Error(`Internal handler not found: ${handlerName}`);

        return await handler(params);
    }

    /**
     * Execute a shell command
     * Expected parameters: { command: string, args: string[] }
     */
    private async executeShellCommand(parameters: any): Promise<any> {
        const { command, args = [] } = parameters;
        if (!command) throw new Error('command is required for SHELL_COMMAND');

        // WARNING: Security risk! Command should be whitelisted or sanitized.
        const fullCommand = `${command} ${args.join(' ')}`;
        logger.info({ fullCommand }, 'Executing Shell Command');

        const { stdout, stderr } = await execAsync(fullCommand);

        if (stderr) {
            logger.warn({ stderr }, 'Shell command produced stderr');
        }

        return { stdout: stdout.trim(), stderr: stderr.trim() };
    }
}
