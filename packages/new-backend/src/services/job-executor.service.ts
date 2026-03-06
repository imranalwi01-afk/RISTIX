
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../db/schema';
import { sql } from 'drizzle-orm';
import { logger } from '../lib/logger';
import { exec } from 'child_process';
import { promisify } from 'util';
import { legacyConnection } from '../config/database';

const execAsync = promisify(exec);

export type JobResult = {
    success: boolean;
    result?: any;
    error?: string;
    executionTimeMs: number;
};

type SqlRuntimeMetadata = {
    dbBackendPid: number;
    dbName: string;
    dbSessionStart?: string;
};

type ExecutorOptions = {
    onSqlRuntime?: (metadata: SqlRuntimeMetadata) => Promise<void> | void;
};

export class JobExecutorService<TSchema extends Record<string, unknown> = typeof schema> {
    constructor(private db: PostgresJsDatabase<TSchema>, private options: ExecutorOptions = {}) { }

    private normalizeSqlArgument(value: unknown): any {
        if (value === undefined || value === null) return null
        if (value instanceof Date) return value.toISOString()
        if (Buffer.isBuffer(value)) return value
        if (value instanceof ArrayBuffer) return Buffer.from(value)
        if (ArrayBuffer.isView(value)) return Buffer.from(value.buffer as ArrayBuffer)

        if (typeof value === 'object') {
            try {
                return JSON.stringify(value)
            } catch (error: any) {
                throw new Error(`Failed to serialize SQL argument object: ${error?.message || String(error)}`)
            }
        }

        return value
    }

    private formatExecutionError(error: any, context: { jobType: string; parameters: any }): string {
        const parts: string[] = []
        const message = error?.message || 'Unknown execution error'
        parts.push(message)

        if (context.jobType === 'SQL_SP') {
            const schemaName = context.parameters?.schemaName || '(default schema)'
            const procedureName = context.parameters?.procedureName || '(unknown procedure)'
            const targetDatabase = context.parameters?.targetDatabase || 'TENANT'
            const args = context.parameters?.parameters ?? context.parameters?.params ?? []
            parts.push(`Context: SQL_SP ${schemaName}.${procedureName} on ${targetDatabase} DB`)
            parts.push(`Args: ${JSON.stringify(args)}`)
        }

        const errorCode = error?.code || error?.errno
        if (errorCode) parts.push(`Code: ${errorCode}`)
        if (error?.severity) parts.push(`Severity: ${error.severity}`)
        if (error?.detail) parts.push(`Detail: ${error.detail}`)
        if (error?.hint) parts.push(`Hint: ${error.hint}`)
        if (error?.where) parts.push(`Where: ${error.where}`)
        if (error?.routine) parts.push(`Routine: ${error.routine}`)
        if (error?.schema_name) parts.push(`Schema: ${error.schema_name}`)
        if (error?.table_name) parts.push(`Table: ${error.table_name}`)
        if (error?.column_name) parts.push(`Column: ${error.column_name}`)

        const lowerMessage = String(message).toLowerCase()
        if (
            lowerMessage.includes('invalid input syntax for type boolean')
            && (lowerMessage.includes('s1003') || lowerMessage.includes('payment upload'))
        ) {
            parts.push('Suggestion: check S1003 param_usage in frs9_param_commonh; expected 1/0 (or true/false).')
        }
        if (
            lowerMessage.includes('invalid input syntax for type smallint')
            && (lowerMessage.includes('interval') || lowerMessage.includes('model run') || lowerMessage.includes('s1004'))
        ) {
            parts.push('Suggestion: check S1004 param_usage in frs9_param_commonh; expected numeric interval (1/7/30).')
        }

        return parts.join('\n')
    }

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
            const formattedError = this.formatExecutionError(error, { jobType, parameters })
            logger.error({ jobType, error: formattedError, rawError: error }, 'Job execution failed')
            return {
                success: false,
                error: formattedError,
                executionTimeMs: Date.now() - startTime,
            };
        }
    }

    /**
     * Execute a SQL Stored Procedure
     * Expected parameters: { procedureName: string, params: any[] }
     */
    private async executeSqlSp(parameters: any): Promise<any> {
        const { procedureName, schemaName, targetDatabase = 'TENANT', parameters: args = [], params = [] } = parameters;
        const rawArgs = args.length > 0 ? args : params;
        const finalArgs: any[] = Array.isArray(rawArgs)
            ? rawArgs.map((arg) => this.normalizeSqlArgument(arg))
            : [];

        if (!procedureName) throw new Error('procedureName is required for SQL_SP');

        logger.info({ schemaName, procedureName, finalArgs, targetDatabase }, 'Executing Stored Procedure');

        const quoteIdentifier = (value: string) => `"${value.replace(/"/g, '""')}"`;
        const qualifiedProcName = (() => {
            const explicitSchema = typeof schemaName === 'string' && schemaName.trim().length > 0
                ? schemaName.trim()
                : undefined;
            const procedureSegments = String(procedureName)
                .split('.')
                .map((segment) => segment.trim())
                .filter(Boolean);

            if (explicitSchema) {
                const procedureOnly = procedureSegments.length > 0
                    ? procedureSegments[procedureSegments.length - 1]
                    : procedureName;
                return `${quoteIdentifier(explicitSchema)}.${quoteIdentifier(procedureOnly)}`;
            }

            if (procedureSegments.length > 1) {
                return procedureSegments.map(quoteIdentifier).join('.');
            }

            return quoteIdentifier(procedureName);
        })();

        const placeholders = finalArgs.map((_: unknown, index: number) => `$${index + 1}`).join(', ');

        if (String(targetDatabase).toUpperCase() === 'LEGACY') {
            const reserved = await legacyConnection.reserve();

            try {
                const sessionRows = await reserved.unsafe<Array<{
                    pid: number;
                    dbName: string;
                    backendStart: Date | string | null;
                }>>(
                    `
                    select
                        pg_backend_pid() as pid,
                        current_database() as "dbName",
                        backend_start as "backendStart"
                    from pg_stat_activity
                    where pid = pg_backend_pid()
                    limit 1
                    `
                );
                const session = sessionRows[0];
                if (session && this.options.onSqlRuntime) {
                    await this.options.onSqlRuntime({
                        dbBackendPid: Number(session.pid),
                        dbName: session.dbName,
                        dbSessionStart: session.backendStart ? new Date(session.backendStart).toISOString() : undefined,
                    });
                }

                try {
                    const selectSql = `SELECT * FROM ${qualifiedProcName}(${placeholders})`;
                    const result = await reserved.unsafe(selectSql, finalArgs);
                    return result;
                } catch (error: any) {
                    const message = String(error?.message || '').toLowerCase();
                    const isProcedureOnly =
                        message.includes('is a procedure')
                        || message.includes('cannot be used in from clause');

                    if (!isProcedureOnly) {
                        throw error;
                    }

                    logger.info(
                        { schemaName, procedureName },
                        'Stored procedure detected, retrying with CALL syntax'
                    );

                    const callSql = `CALL ${qualifiedProcName}(${placeholders})`;
                    await reserved.unsafe(callSql, finalArgs);
                    return { called: true };
                }
            } finally {
                reserved.release();
            }
        }

        // Build query efficiently
        // If schemaName is provided, use identifier(schema).identifier(proc)
        // Otherwise just identifier(proc) (relying on search_path)
        const procIdentifier = schemaName
            ? sql`${sql.identifier(schemaName)}.${sql.identifier(procedureName)}`
            : sql`${sql.raw(procedureName)}`; // Keep raw behavior for backward compatibility if name includes dots

        const sqlArgs = sql.join(finalArgs.map((a: any) => sql`${a}`), sql`, `);

        try {
            // Function-style execution (SELECT)
            const result = await this.db.execute(
                sql`SELECT * FROM ${procIdentifier}(${sqlArgs})`
            );
            return result;
        } catch (error: any) {
            const message = String(error?.message || '').toLowerCase();
            const isProcedureOnly =
                message.includes('is a procedure')
                || message.includes('cannot be used in from clause');

            if (!isProcedureOnly) {
                throw error;
            }

            logger.info(
                { schemaName, procedureName },
                'Stored procedure detected, retrying with CALL syntax'
            );

            // Procedure-style execution (CALL)
            await this.db.execute(
                sql`CALL ${procIdentifier}(${sqlArgs})`
            );

            return { called: true };
        }
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
