// @ts-nocheck
import { eq, and, desc, sql } from 'drizzle-orm'
import { db, getDatabase } from '@/config/database'
import { debugLog } from '@/lib/debug-logger'
import {
    jobDefinitions,
    jobExecutions,
    type JobDefinition,
    type NewJobDefinition,
    type JobExecution,
    type NewJobExecution
} from '@/db/schema'

export const JobsRepository = {
    // =============================================================================
    // JOB DEFINITIONS
    // =============================================================================

    async findAllDefinitions(tenantId: string) {
        debugLog(`[JobsRepository] findAllDefinitions for tenant: ${tenantId}`);
        const dbx = getDatabase(tenantId)
        
        return dbx
            .select()
            .from(jobDefinitions)
            .where(sql`${jobDefinitions.tenantId} = ${tenantId} OR ${jobDefinitions.tenantId} IS NULL`)
            .orderBy(desc(jobDefinitions.createdAt));
    },

    async findDefinitionById(id: string, tenantId?: string) {
        console.log(`[JobsRepository] findDefinitionById: ${id}, tenant: ${tenantId}`);
        const dbx = getDatabase(tenantId)
        const [result] = await dbx
            .select()
            .from(jobDefinitions)
            .where(eq(jobDefinitions.id, id))
            .limit(1);
        return result;
    },

    async createDefinition(data: NewJobDefinition) {
        const tenantId = (data as any).tenantId
        console.log(`[JobsRepository] createDefinition for tenant: ${tenantId}`);
        const dbx = getDatabase(tenantId)
        const [definition] = await dbx
            .insert(jobDefinitions)
            .values(data)
            .returning()
        return definition
    },

    async updateDefinition(id: string, data: Partial<NewJobDefinition>, tenantId?: string) {
        console.log(`[JobsRepository] updateDefinition: ${id}, tenant: ${tenantId}`);
        const dbx = getDatabase(tenantId)
        const [updated] = await dbx
            .update(jobDefinitions)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(jobDefinitions.id, id))
            .returning()
        return updated
    },

    // =============================================================================
    // JOB EXECUTIONS
    // =============================================================================

    async findExecutions(tenantId: string, limit: number = 10) {
        console.log(`[JobsRepository] findExecutions for tenant: ${tenantId}, limit: ${limit}`);
        
        try {
            // Use direct postgres connection to bypass Drizzle ORM issues
            const { default: postgres } = await import('postgres');
            const sql = postgres('postgresql://postgres:postgres@10.8.0.2:5433/ifrspro_platform_admin', { max: 1 });
            
            const results = await sql`
                SELECT 
                    e.id,
                    e.job_definition_id as "jobDefinitionId",
                    e.tenant_id as "tenantId",
                    e.job_name as "jobName",
                    e.job_type as "jobType",
                    e.status,
                    e.progress,
                    e.start_time as "startTime",
                    e.end_time as "endTime",
                    e.duration,
                    e.parameters,
                    e.result,
                    e.error,
                    e.triggered_by as "triggeredBy",
                    e.worker_id as "workerId",
                    e.tags,
                    e.approval_request_id as "approvalRequestId",
                    e.approval_status as "approvalStatus",
                    e.approved_at as "approvedAt",
                    e.approved_by as "approvedBy",
                    d.name as "definitionName",
                    d.job_type as "definitionJobType",
                    d.description as "definitionDescription"
                FROM core.job_executions e
                LEFT JOIN core.job_definitions d ON e.job_definition_id = d.id
                WHERE e.tenant_id = ${tenantId}
                ORDER BY e.start_time DESC NULLS LAST
                LIMIT ${limit}
            `;
            
            await sql.end();
            
            console.log(`[JobsRepository] findExecutions SUCCESS: Found ${results.length} executions`);
            return results;
        } catch (err: any) {
            console.log(`[JobsRepository] findExecutions ERROR:`, err.message);
            throw err;
        }
    },

    async findExecutionById(id: string, tenantId?: string) {
        console.log(`[JobsRepository] findExecutionById: ${id}, tenant: ${tenantId}`);
        const dbx = getDatabase(tenantId)
        return dbx.query.jobExecutions.findFirst({
            where: eq(jobExecutions.id, id),
            with: {
                definition: true,
            }
        })
    },

    async createExecution(data: NewJobExecution) {
        const tenantId = (data as any).tenantId
        debugLog(`[JobsRepository] createExecution for tenant: ${tenantId}, data:`, data);
        const dbx = getDatabase(tenantId)
        try {
            const [execution] = await dbx
                .insert(jobExecutions)
                .values(data)
                .returning()
            debugLog(`[JobsRepository] createExecution SUCCESS:`, execution.id);
            return execution
        } catch (err: any) {
            debugLog(`[JobsRepository] createExecution ERROR:`, err.message);
            throw err;
        }
    },

    async updateExecution(id: string, data: Partial<NewJobExecution>, tenantId?: string) {
        console.log(`[JobsRepository] updateExecution: ${id}, tenant: ${tenantId}`);
        const dbx = getDatabase(tenantId)
        const [updated] = await dbx
            .update(jobExecutions)
            .set(data)
            .where(eq(jobExecutions.id, id))
            .returning()
        return updated
    },

    async getStats(tenantId: string) {
        console.log(`[JobsRepository] getStats for tenant: ${tenantId}`);
        const dbx = getDatabase(tenantId)
        const activeJobs = await dbx
            .select({ count: sql<number>`count(*)` })
            .from(jobExecutions)
            .where(and(
                eq(jobExecutions.tenantId, tenantId),
                eq(jobExecutions.status, 'RUNNING')
            ))

        const failedToday = await dbx
            .select({ count: sql<number>`count(*)` })
            .from(jobExecutions)
            .where(and(
                eq(jobExecutions.tenantId, tenantId),
                eq(jobExecutions.status, 'FAILED'),
                sql`date(${jobExecutions.startTime}) = current_date`
            ))

        return {
            activeJobs: Number(activeJobs[0]?.count || 0),
            failedToday: Number(failedToday[0]?.count || 0)
        }
    }
}
