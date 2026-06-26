// @ts-nocheck
import { eq, and, desc, sql } from 'drizzle-orm'
import { tenantDb as db, platformConnection } from '@/config/database'
import {
    jobDefinitions,
    jobExecutions,
    type JobDefinition,
    type NewJobDefinition,
    type JobExecution,
    type NewJobExecution
} from '@/db/schema'

export const JobsRepository = {
    async resolveTenantId(tenantId: string): Promise<string> {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
        if (!tenantId) throw new Error('Missing tenantId')
        if (uuidRegex.test(tenantId)) return tenantId

        const rows = await platformConnection<{ id: string }[]>`
            select id
            from platform_admin.tenants
            where code = ${tenantId} or slug = ${tenantId}
            limit 1
        `

        const resolved = rows?.[0]?.id
        if (!resolved) throw new Error(`Unknown tenant: ${tenantId}`)
        return resolved
    },

    // =============================================================================
    // JOB DEFINITIONS
    // =============================================================================

    async findAllDefinitions(tenantId: string) {
        const resolvedTenantId = await this.resolveTenantId(tenantId)
        return db
            .select()
            .from(jobDefinitions)
            .where(sql`${jobDefinitions.tenantId} = ${resolvedTenantId} OR ${jobDefinitions.tenantId} IS NULL`)
            .orderBy(desc(jobDefinitions.createdAt));
    },

    async findDefinitionById(id: string, tenantId?: string) {
        console.log(`[JobsRepository] findDefinitionById: ${id}, tenant: ${tenantId}`);
        const [result] = await db
            .select()
            .from(jobDefinitions)
            .where(eq(jobDefinitions.id, id))
            .limit(1);
        return result;
    },

    async createDefinition(data: NewJobDefinition) {
        const tenantId = (data as any).tenantId
        const resolvedTenantId = await this.resolveTenantId(String(tenantId))
        console.log(`[JobsRepository] createDefinition for tenant: ${resolvedTenantId}`);
        const [definition] = await db
            .insert(jobDefinitions)
            .values({ ...(data as any), tenantId: resolvedTenantId })
            .returning()
        return definition
    },

    async updateDefinition(id: string, data: Partial<NewJobDefinition>, tenantId?: string) {
        console.log(`[JobsRepository] updateDefinition: ${id}, tenant: ${tenantId}`);
        const [updated] = await db
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
            // Using platformConnection from config to avoid hardcoded IP
            
            const results = await platformConnection`
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
            
            console.log(`[JobsRepository] findExecutions SUCCESS: Found ${results.length} executions`);
            return results;
        } catch (err: any) {
            console.log(`[JobsRepository] findExecutions ERROR:`, err.message);
            throw err;
        }
    },

    async findExecutionById(id: string, tenantId?: string) {
        console.log(`[JobsRepository] findExecutionById: ${id}, tenant: ${tenantId}`);
        return db.query.jobExecutions.findFirst({
            where: eq(jobExecutions.id, id),
            with: {
                definition: true,
            }
        })
    },

    async createExecution(data: NewJobExecution) {
        const tenantId = (data as any).tenantId
        const resolvedTenantId = await this.resolveTenantId(String(tenantId))
        try {
            const [execution] = await db
                .insert(jobExecutions)
                .values({ ...(data as any), tenantId: resolvedTenantId })
                .returning()
            return execution
        } catch (err: any) {
            throw err;
        }
    },

    async updateExecution(id: string, data: Partial<NewJobExecution>, tenantId?: string) {
        console.log(`[JobsRepository] updateExecution: ${id}, tenant: ${tenantId}`);
        const [updated] = await db
            .update(jobExecutions)
            .set(data)
            .where(eq(jobExecutions.id, id))
            .returning()
        return updated
    },

    async getStats(tenantId: string) {
        console.log(`[JobsRepository] getStats for tenant: ${tenantId}`);
        const resolvedTenantId = await this.resolveTenantId(tenantId)
        const activeJobs = await db
            .select({ count: sql<number>`count(*)` })
            .from(jobExecutions)
            .where(and(
                eq(jobExecutions.tenantId, resolvedTenantId),
                eq(jobExecutions.status, 'RUNNING')
            ))

        const failedToday = await db
            .select({ count: sql<number>`count(*)` })
            .from(jobExecutions)
            .where(and(
                eq(jobExecutions.tenantId, resolvedTenantId),
                eq(jobExecutions.status, 'FAILED'),
                sql`date(${jobExecutions.startTime}) = current_date`
            ))

        return {
            activeJobs: Number(activeJobs[0]?.count || 0),
            failedToday: Number(failedToday[0]?.count || 0)
        }
    }
}
