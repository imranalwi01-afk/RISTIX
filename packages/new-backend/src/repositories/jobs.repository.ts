import { eq, and, desc, sql } from 'drizzle-orm'
import { db } from '@/config/database'
import { getDatabase } from '@/config/database'
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
        const dbx = getDatabase(tenantId)
        return dbx.query.jobDefinitions.findMany({
            where: sql`${jobDefinitions.tenantId} = ${tenantId} OR ${jobDefinitions.tenantId} IS NULL`,
            orderBy: [desc(jobDefinitions.createdAt)],
        })
    },

    async findDefinitionById(id: string) {
        return db.query.jobDefinitions.findFirst({
            where: eq(jobDefinitions.id, id),
        })
    },

    async createDefinition(data: NewJobDefinition) {
        const [definition] = await db
            .insert(jobDefinitions)
            .values(data)
            .returning()
        return definition
    },

    async updateDefinition(id: string, data: Partial<NewJobDefinition>) {
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

    async findExecutions(tenantId: string, limit: number = 50) {
        const dbx = getDatabase(tenantId)
        return dbx.query.jobExecutions.findMany({
            where: eq(jobExecutions.tenantId, tenantId),
            orderBy: [desc(jobExecutions.startTime)],
            limit: limit,
            with: {
                definition: true, // Join definition for job name
                triggerUser: true, // Join user for triggeredBy name
            }
        })
    },

    async findExecutionById(id: string) {
        return db.query.jobExecutions.findFirst({
            where: eq(jobExecutions.id, id),
            with: {
                definition: true,
            }
        })
    },

    async createExecution(data: NewJobExecution) {
        const dbx = (data as any).tenantId ? getDatabase((data as any).tenantId) : db
        const [execution] = await dbx
            .insert(jobExecutions)
            .values(data)
            .returning()
        return execution
    },

    async updateExecution(id: string, data: Partial<NewJobExecution>) {
        const [updated] = await db
            .update(jobExecutions)
            .set(data)
            .where(eq(jobExecutions.id, id))
            .returning()
        return updated
    },

    async getStats(tenantId: string) {
        // Simple stats aggregation
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
