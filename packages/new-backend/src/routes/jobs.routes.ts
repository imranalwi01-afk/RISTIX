import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import type { AppContext } from '../app'
import { authMiddleware, tenantMiddleware } from '../middleware'
import { getDatabase, legacyConnection } from '../config/database'
import { approvalRequests, jobDefinitions, jobExecutions } from '../db/schema'
import { eq, desc, and, sql, inArray } from 'drizzle-orm'
import { addJob, getJob } from '../services/queue.service'
import { buildErrorResponse } from '../lib/http/error-response'
import { badRequest, notFound } from '../lib/http/route-errors'
import { openApiValidationHook } from '../lib/http/openapi-validation-hook'

export const jobsRoutes = new OpenAPIHono<AppContext>({ defaultHook: openApiValidationHook })

// Apply auth middleware
jobsRoutes.use('*', authMiddleware)
jobsRoutes.use('*', tenantMiddleware)

// =============================================================================
// SCHEMA DEFINITIONS
// =============================================================================

const JobDefinitionSchema = z.object({
    id: z.string().openapi({ example: '123e4567-e89b-12d3-a456-426614174000' }),
    name: z.string().openapi({ example: 'End of Day Processing' }),
    description: z.string().nullable().optional(),
    jobType: z.string().openapi({ example: 'EOD' }),
    cronExpression: z.string().nullable().optional(),
    defaultParameters: z.any().optional(),
    priority: z.string().nullable().optional(),
    timeout: z.number().nullable().optional(),
    maxRetries: z.number().nullable().optional(),
    requiresApproval: z.boolean().optional(),
    isEnabled: z.boolean().optional(),
    tenantId: z.string().nullable().optional(),
    createdBy: z.string().nullable().optional(),
    createdAt: z.string().optional(), // Date -> string
    updatedAt: z.string().optional(),
}).openapi('JobDefinition')

const CreateJobDefinitionSchema = z.object({
    name: z.string(),
    description: z.string().optional(),
    jobType: z.string(),
    cronExpression: z.string().optional(),
    defaultParameters: z.any().optional(),
    priority: z.string().optional(),
    timeout: z.number().optional(),
    maxRetries: z.number().optional(),
    isEnabled: z.boolean().optional(),
}).openapi('CreateJobDefinitionInput')

const UpdateJobDefinitionSchema = CreateJobDefinitionSchema.partial().openapi('UpdateJobDefinitionInput')

const JobRuntimeSchema = z.object({
    available: z.boolean(),
    pid: z.number().optional(),
    state: z.string().optional(),
    runtimeSeconds: z.number().optional(),
    waitEventType: z.string().nullable().optional(),
    waitEvent: z.string().nullable().optional(),
    blockedByPids: z.array(z.number()).optional(),
    dbSessionStart: z.string().nullable().optional(),
    queryStart: z.string().nullable().optional(),
    reason: z.string().optional(),
}).openapi('JobRuntime')

const JobExecutionSchema = z.object({
    id: z.string().openapi({ example: '123e4567-e89b-12d3-a456-426614174000' }),
    jobDefinitionId: z.string(),
    jobName: z.string(),
    jobType: z.string(),
    status: z.string(),
    progress: z.number().nullable().optional(),
    parameters: z.any().optional(),
    triggeredBy: z.string().nullable().optional(),
    approvalRequestId: z.string().nullable().optional(),
    approvalStatus: z.string().nullable().optional(),
    startTime: z.string().nullable().optional(),
    endTime: z.string().nullable().optional(),
    result: z.any().optional(),
    error: z.string().nullable().optional(),
    tenantId: z.string().nullable().optional(),
    runtime: JobRuntimeSchema.optional(),
}).openapi('JobExecution')

const JobControlSchema = z.object({
    action: z.enum(['pause', 'resume', 'stop'])
}).openapi('JobControlInput')

const MetricsSchema = z.object({
    activeJobs: z.number(),
    queuedJobs: z.number(),
    completedJobsToday: z.number(),
    failedJobsToday: z.number(),
    cpuUsage: z.number(),
    memoryUsage: z.number(),
    diskUsage: z.number(),
    averageExecutionTime: z.number(),
    throughputPerHour: z.number(),
}).openapi('JobMetrics')

const SUPPORTED_JOB_TYPES = ['SQL_SP', 'INTERNAL_SCRIPT', 'SHELL_COMMAND'] as const
const TERMINAL_STATUSES = new Set(['completed', 'failed', 'cancelled', 'rejected'])
const ACTIVE_STATUSES = new Set(['active', 'running'])
const ACTIVE_LIKE_STATUSES = ['pending', 'waiting', 'queued', 'active', 'running', 'pending_approval'] as const
const ORPHAN_EXECUTION_GRACE_MS = 15 * 60 * 1000
const ACTION_SUFFIXES = new Set([
    'view',
    'create',
    'update',
    'delete',
    'manage',
    'access',
    'approve',
    'reject',
    'export',
    'import',
    'run',
    'execute',
    'control',
])

const JOB_PERMISSION_REQUIREMENTS = {
    view: ['jobs.view', 'jobs.manage', 'jobs.access', 'admin.system.view', 'admin.system.manage'],
    create: ['jobs.create', 'jobs.manage', 'jobs.access', 'admin.system.manage'],
    update: ['jobs.update', 'jobs.manage', 'jobs.access', 'admin.system.manage'],
    delete: ['jobs.delete', 'jobs.manage', 'jobs.access', 'admin.system.manage'],
    run: ['jobs.run', 'jobs.manage', 'jobs.access', 'admin.system.manage'],
    control: ['jobs.control', 'jobs.manage', 'jobs.access', 'admin.system.manage'],
    approve: ['jobs.approve', 'approval.requests.approve', 'approval.all', 'jobs.manage', 'admin.system.manage'],
    runtime: ['jobs.runtime.view', 'jobs.manage', 'admin.system.view', 'admin.system.manage'],
} as const

const normalizeDbStatus = (status?: string | null): string => (status || '').toLowerCase()
const toIsoOrNull = (value?: Date | string | null): string | null => value ? new Date(value).toISOString() : null

type JobApprovalPolicy = {
    impactLevel: 'low' | 'medium' | 'high' | 'critical'
    approvalsRequired: number
    slaHours: number
    escalationAfterHours: number
    requireDecisionComment: boolean
    queuePriority: number
    rationale: string[]
}

const deriveApprovalPolicy = async (definition: any): Promise<JobApprovalPolicy> => {
    const { deriveImpactLevel, getImpactConfig } = await import('../services/impact-config.service')
    const config = await getImpactConfig()

    const parameters = definition.defaultParameters && typeof definition.defaultParameters === 'object'
        ? definition.defaultParameters
        : {}
    const targetDatabase = String((parameters as any).targetDatabase || '').toUpperCase()

    const result = deriveImpactLevel(
        definition.priority,
        definition.jobType,
        targetDatabase,
        config,
    )

    const rationale: string[] = [
        `Priority ${String(definition.priority || config.defaultPriority).toUpperCase()} mapped to ${result.impactLevel}`,
    ]

    const normalizedJobType = String(definition.jobType || '').toUpperCase()
    const typeGuard = config.jobTypeMinimums[normalizedJobType]
    if (typeGuard?.minApprovals && typeGuard.minApprovals > result.approvalsRequired) {
        rationale.push(`Job type ${normalizedJobType} requires at least ${typeGuard.minApprovals} approvers`)
    }

    return {
        impactLevel: result.impactLevel,
        approvalsRequired: result.approvalsRequired,
        slaHours: result.slaHours,
        escalationAfterHours: result.escalationAfterHours,
        requireDecisionComment: result.requireDecisionComment,
        queuePriority: result.queuePriority,
        rationale,
    }
}

const toDateOrNull = (value?: Date | string | null): Date | null => {
    if (!value) return null
    const parsed = new Date(value)
    return Number.isNaN(parsed.getTime()) ? null : parsed
}

const reconcilePendingApprovals = async (targetDb: any, tenantId?: string | null) => {
    if (!tenantId) return

    const now = new Date()
    const pendingExecutions: Array<any> = await targetDb
        .select({
            id: jobExecutions.id,
            approvalRequestId: jobExecutions.approvalRequestId,
            approvalStatus: jobExecutions.approvalStatus,
            status: jobExecutions.status,
            startTime: jobExecutions.startTime,
            jobName: jobExecutions.jobName,
            tenantId: jobExecutions.tenantId,
        })
        .from(jobExecutions)
        .where(and(
            eq(jobExecutions.tenantId, tenantId),
            eq(jobExecutions.approvalStatus, 'pending'),
            sql`${jobExecutions.endTime} is null`
        ))
        .orderBy(desc(jobExecutions.startTime))
        .limit(200)

    const requestIds = pendingExecutions
        .map((execution: any) => execution.approvalRequestId)
        .filter((id: any): id is string => Boolean(id))

    if (requestIds.length === 0) return

    const requests: Array<any> = await targetDb
        .select({
            id: approvalRequests.id,
            status: approvalRequests.status,
            expiresAt: approvalRequests.expiresAt,
            createdAt: approvalRequests.createdAt,
            currentLevel: approvalRequests.currentLevel,
            approvalsRequired: approvalRequests.approvalsRequired,
            approvalsReceived: approvalRequests.approvalsReceived,
            requestData: approvalRequests.requestData,
        })
        .from(approvalRequests)
        .where(inArray(approvalRequests.id, requestIds))

    const requestMap = new Map<string, any>(requests.map((request: any) => [String(request.id), request]))

    for (const execution of pendingExecutions) {
        const requestId = execution.approvalRequestId
        if (!requestId) continue

        const request = requestMap.get(requestId)
        if (!request) {
            await targetDb
                .update(jobExecutions)
                .set({
                    status: 'failed',
                    approvalStatus: 'rejected',
                    endTime: now,
                    error: 'Approval request record is missing',
                })
                .where(eq(jobExecutions.id, execution.id))
                .execute()
            continue
        }

        const requestStatus = String(request.status || '').toLowerCase()
        if (requestStatus === 'approved') {
            continue
        }

        if (requestStatus === 'rejected' || requestStatus === 'cancelled' || requestStatus === 'expired') {
            await targetDb
                .update(jobExecutions)
                .set({
                    status: requestStatus === 'expired' ? 'failed' : 'rejected',
                    approvalStatus: 'rejected',
                    endTime: now,
                    error: requestStatus === 'expired'
                        ? 'Approval SLA expired'
                        : 'Approval request was not approved',
                })
                .where(eq(jobExecutions.id, execution.id))
                .execute()
            continue
        }

        if (requestStatus !== 'pending') {
            continue
        }

        const expiresAt = toDateOrNull(request.expiresAt)
        if (expiresAt && expiresAt.getTime() <= now.getTime()) {
            await targetDb
                .update(approvalRequests)
                .set({
                    status: 'expired',
                    completedAt: now,
                })
                .where(eq(approvalRequests.id, request.id))
                .execute()

            await targetDb
                .update(jobExecutions)
                .set({
                    status: 'failed',
                    approvalStatus: 'rejected',
                    endTime: now,
                    error: 'Approval SLA expired before required approvals were collected',
                })
                .where(eq(jobExecutions.id, execution.id))
                .execute()
            continue
        }

        const requestData = request.requestData && typeof request.requestData === 'object'
            ? request.requestData as Record<string, any>
            : {}
        const policy = requestData.jobApprovalPolicy && typeof requestData.jobApprovalPolicy === 'object'
            ? requestData.jobApprovalPolicy as Record<string, any>
            : null

        if (!policy) continue

        const createdAt = toDateOrNull(request.createdAt) || now
        const escalationAfterHours = Number(policy.escalationAfterHours || 0)
        const escalationTriggeredAt = toDateOrNull(policy.escalationTriggeredAt || null)
        const escalationCount = Number(policy.escalationCount || 0)
        const shouldEscalate =
            escalationAfterHours > 0
            && createdAt.getTime() + escalationAfterHours * 60 * 60 * 1000 <= now.getTime()
            && !escalationTriggeredAt

        if (!shouldEscalate) continue

        const nextLevel = Math.min(
            Number(request.currentLevel || 1) + 1,
            Math.max(1, Number(request.approvalsRequired || 1))
        )
        const mergedRequestData = {
            ...requestData,
            jobApprovalPolicy: {
                ...policy,
                escalationTriggeredAt: now.toISOString(),
                escalationCount: escalationCount + 1,
                escalatedToLevel: nextLevel,
            },
        }

        await targetDb
            .update(approvalRequests)
            .set({
                currentLevel: nextLevel,
                requestData: mergedRequestData,
            })
            .where(eq(approvalRequests.id, request.id))
            .execute()
    }
}

const normalizePermissionCode = (value: string): string =>
    value.trim().replace(/:/g, '.').replace(/\s+/g, '_').toLowerCase()

const toCanonicalPermissionCode = (value: string): string =>
    normalizePermissionCode(value)

const getNormalizedPermissionSet = (c: any): Set<string> => {
    const rawPermissions = ((c.get('permissions') || c.get('userPermissions') || []) as string[])
        .filter((permission): permission is string => typeof permission === 'string')

    const normalized = new Set<string>()
    for (const permission of rawPermissions) {
        normalized.add(normalizePermissionCode(permission))
        normalized.add(toCanonicalPermissionCode(permission))
    }
    return normalized
}

const hasPermissionCode = (permissionSet: Set<string>, requiredPermission: string): boolean => {
    const requested = toCanonicalPermissionCode(requiredPermission)
    if (permissionSet.has(requested)) return true

    const parts = requested.split('.')
    const suffix = parts[parts.length - 1] || ''
    const hasAction = ACTION_SUFFIXES.has(suffix)
    const base = hasAction ? parts.slice(0, -1).join('.') : requested

    if (permissionSet.has(`${base}.manage`) || permissionSet.has(`${base}.access`)) {
        return true
    }

    if (!hasAction) {
        if (
            permissionSet.has(`${requested}.view`)
            || permissionSet.has(`${requested}.manage`)
            || permissionSet.has(`${requested}.access`)
        ) {
            return true
        }
    }

    for (const permission of permissionSet) {
        if (permission.endsWith('.*')) {
            const prefix = permission.slice(0, -2)
            if (requested === prefix || requested.startsWith(`${prefix}.`)) return true
        }

        if (permission.startsWith(`${requested}.`)) return true
        const permissionSuffix = permission.split('.').at(-1) || ''
        if (requested.startsWith(`${permission}.`) && !ACTION_SUFFIXES.has(permissionSuffix)) return true
    }

    return false
}

const hasAnyRequiredPermission = (c: any, requiredPermissions: readonly string[]): boolean => {
    if (Boolean(c.get('isSystemUser'))) return true
    const permissionSet = getNormalizedPermissionSet(c)
    if (
        permissionSet.has('*')
        || permissionSet.has('admin.super_admin')
        || permissionSet.has('super_admin')
        || permissionSet.has('platform_admin')
    ) {
        return true
    }
    return requiredPermissions.some((permission) => hasPermissionCode(permissionSet, permission))
}

const forbiddenForPermissions = (c: any, requiredPermissions: readonly string[]) =>
    c.json({
        success: false,
        error: 'Missing required permission',
        code: 'UNAUTHORIZED',
        requiredPermissions,
    } as any, 403)

const hasAdminRuntimeAccess = (c: any): boolean => {
    return hasAnyRequiredPermission(c, JOB_PERMISSION_REQUIREMENTS.runtime)
}

const mapQueueStateToDbStatus = (queueState: string): string | null => {
    switch (queueState) {
        case 'active':
            return 'active'
        case 'waiting':
        case 'queued':
        case 'delayed':
        case 'prioritized':
            return 'pending'
        case 'paused':
            return 'pending'
        case 'completed':
            return 'completed'
        case 'failed':
            return 'failed'
        default:
            return null
    }
}

const reconcileExecutionStatus = async (targetDb: any, execution: any) => {
    const currentStatus = normalizeDbStatus(execution.status)

    // Nothing to reconcile for terminal rows.
    if (TERMINAL_STATUSES.has(currentStatus)) {
        return execution
    }

    const queueJob = await getJob(execution.id)
    if (!queueJob) {
        // Queue entry is gone while DB row still says active/running:
        // mark stale rows as failed so monitoring does not show ghost executions forever.
        if (ACTIVE_STATUSES.has(currentStatus) && !execution.endTime && execution.startTime) {
            const startedAt = new Date(execution.startTime).getTime()
            if (Number.isFinite(startedAt) && Date.now() - startedAt > ORPHAN_EXECUTION_GRACE_MS) {
                const patch: Record<string, unknown> = {
                    status: 'failed',
                    endTime: new Date(),
                    error: execution.error || 'Execution orphaned: queue job not found. Worker/Redis likely restarted.',
                }

                await targetDb
                    .update(jobExecutions)
                    .set(patch)
                    .where(eq(jobExecutions.id, execution.id))
                    .execute()

                return {
                    ...execution,
                    ...patch,
                }
            }
        }

        return execution
    }

    const queueState = await queueJob.getState()
    const mappedStatus = mapQueueStateToDbStatus(queueState)
    if (!mappedStatus || mappedStatus === currentStatus) return execution

    const patch: Record<string, unknown> = { status: mappedStatus }
    if (['completed', 'failed'].includes(mappedStatus)) {
        patch.endTime = queueJob.finishedOn ? new Date(queueJob.finishedOn) : new Date()
    }
    if (mappedStatus === 'completed') {
        patch.error = null
    }
    if (mappedStatus === 'failed' && queueJob.failedReason) {
        patch.error = queueJob.failedReason
    }

    await targetDb
        .update(jobExecutions)
        .set(patch)
        .where(eq(jobExecutions.id, execution.id))
        .execute()

    return {
        ...execution,
        ...patch,
        endTime: patch.endTime ?? execution.endTime,
        error: patch.error ?? execution.error,
    }
}

const reconcileDefinitionExecutions = async (
    targetDb: any,
    definitionId: string,
) => {
    const candidates = await targetDb
        .select()
        .from(jobExecutions)
        .where(and(
            eq(jobExecutions.jobDefinitionId, definitionId),
            sql`${jobExecutions.endTime} is null and lower(${jobExecutions.status}) in (${sql.join(
                ACTIVE_LIKE_STATUSES.map((status) => sql`${status}`),
                sql`, `
            )})`
        ))
        .orderBy(desc(jobExecutions.startTime))
        .limit(50)

    if (!candidates.length) return

    await Promise.all(candidates.map((execution: any) => reconcileExecutionStatus(targetDb, execution)))
}

const parseBlockedPids = (value: unknown): number[] => {
    if (Array.isArray(value)) {
        return value.map((pid) => Number(pid)).filter((pid) => Number.isFinite(pid))
    }

    if (typeof value === 'string') {
        return value
            .replace(/[{}]/g, '')
            .split(',')
            .map((pid) => Number(pid.trim()))
            .filter((pid) => Number.isFinite(pid))
    }

    return []
}

const getRuntimeSummary = async (execution: any): Promise<{
    available: boolean;
    pid?: number;
    state?: string;
    runtimeSeconds?: number;
    waitEventType?: string | null;
    waitEvent?: string | null;
    blockedByPids?: number[];
    dbSessionStart?: string | null;
    queryStart?: string | null;
    reason?: string;
}> => {
    const status = normalizeDbStatus(execution.status)
    if (!ACTIVE_STATUSES.has(status) || execution.endTime) {
        return { available: false, reason: 'not_active' }
    }

    const parameters = execution.parameters && typeof execution.parameters === 'object'
        ? execution.parameters
        : {}
    const targetDatabase = String((parameters as any).targetDatabase || '').toUpperCase()
    if (String(execution.jobType).toUpperCase() !== 'SQL_SP' || targetDatabase !== 'LEGACY') {
        return { available: false, reason: 'not_sql_sp_legacy' }
    }

    const tags = execution.tags && typeof execution.tags === 'object' && !Array.isArray(execution.tags)
        ? execution.tags
        : {}
    const pidFromTags = Number((tags as any).dbBackendPid)

    if (Number.isFinite(pidFromTags)) {
        const pidRows = await legacyConnection.unsafe<Array<{
            pid: number;
            state: string;
            waitEventType: string | null;
            waitEvent: string | null;
            runtimeSeconds: number;
            blockedByPids: number[] | string | null;
            dbSessionStart: Date | string | null;
            queryStart: Date | string | null;
        }>>(
            `
            select
                pid,
                state,
                wait_event_type as "waitEventType",
                wait_event as "waitEvent",
                extract(epoch from (now() - query_start))::integer as "runtimeSeconds",
                pg_blocking_pids(pid) as "blockedByPids",
                backend_start as "dbSessionStart",
                query_start as "queryStart"
            from pg_stat_activity
            where datname = current_database()
              and pid = $1
            limit 1
            `,
            [pidFromTags]
        )

        if (pidRows.length > 0) {
            const row = pidRows[0]
            return {
                available: true,
                pid: Number(row.pid),
                state: row.state,
                runtimeSeconds: Number(row.runtimeSeconds || 0),
                waitEventType: row.waitEventType,
                waitEvent: row.waitEvent,
                blockedByPids: parseBlockedPids(row.blockedByPids),
                dbSessionStart: toIsoOrNull(row.dbSessionStart),
                queryStart: toIsoOrNull(row.queryStart),
            }
        }
    }

    const procedureName = String((parameters as any).procedureName || '').trim()
    const schemaName = String((parameters as any).schemaName || '').trim()
    if (!procedureName) {
        return { available: false, reason: 'missing_procedure_name' }
    }

    const pattern = `%${procedureName}%`
    const fallbackRows = await legacyConnection.unsafe<Array<{
        pid: number;
        state: string;
        waitEventType: string | null;
        waitEvent: string | null;
        runtimeSeconds: number;
        blockedByPids: number[] | string | null;
        dbSessionStart: Date | string | null;
        queryStart: Date | string | null;
    }>>(
        `
        select
            pid,
            state,
            wait_event_type as "waitEventType",
            wait_event as "waitEvent",
            extract(epoch from (now() - query_start))::integer as "runtimeSeconds",
            pg_blocking_pids(pid) as "blockedByPids",
            backend_start as "dbSessionStart",
            query_start as "queryStart"
        from pg_stat_activity
        where datname = current_database()
          and state <> 'idle'
          and query ilike $1
          and ($2 = '' or query ilike $3)
        order by query_start desc
        limit 1
        `,
        [pattern, schemaName, `%${schemaName}%`]
    )

    if (fallbackRows.length === 0) {
        return { available: false, reason: 'session_not_found' }
    }

    const row = fallbackRows[0]
    return {
        available: true,
        pid: Number(row.pid),
        state: row.state,
        runtimeSeconds: Number(row.runtimeSeconds || 0),
        waitEventType: row.waitEventType,
        waitEvent: row.waitEvent,
        blockedByPids: parseBlockedPids(row.blockedByPids),
        dbSessionStart: toIsoOrNull(row.dbSessionStart),
        queryStart: toIsoOrNull(row.queryStart),
    }
}

// =============================================================================
// ROUTES
// =============================================================================

// =============================================================================
// JOB EXECUTIONS
// =============================================================================

/**
 * GET /executions - Get job execution history
 */
jobsRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/executions',
        tags: ['Jobs'],
        summary: 'List Job Executions',
        security: [{ BearerAuth: [] }],
        request: {
            query: z.object({
                page: z.string().optional().default('1').openapi({ example: '1' }),
                limit: z.string().optional().default('50').openapi({ example: '50' }),
                status: z.string().optional(),
                jobType: z.string().optional(),
            }) as any,
        },
        responses: {
            200: {
                content: {
                    'application/json': {
                        schema: z.array(JobExecutionSchema),
                    },
                },
                description: 'List of executions',
            },
        },
    }),
    async (c) => {
        if (!hasAnyRequiredPermission(c, JOB_PERMISSION_REQUIREMENTS.view)) {
            return forbiddenForPermissions(c, JOB_PERMISSION_REQUIREMENTS.view)
        }

        const tenantId = c.get('tenantId')
        const targetDb = getDatabase(tenantId)
        await reconcilePendingApprovals(targetDb, tenantId)

        const page = parseInt(c.req.query('page') || '1')
        const limit = parseInt(c.req.query('limit') || '50')
        const status = c.req.query('status')
        const jobType = c.req.query('jobType')
        const offset = (page - 1) * limit
        const includeRuntime = hasAdminRuntimeAccess(c)

        // Build where conditions
        const conditions = []
        if (tenantId) conditions.push(eq(jobExecutions.tenantId, tenantId))
        if (status) { conditions.push(eq(jobExecutions.status, status)) }
        if (jobType) { conditions.push(eq(jobExecutions.jobType, jobType)) }

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined

        const executions = await targetDb
            .select()
            .from(jobExecutions)
            .where(whereClause)
            .orderBy(desc(jobExecutions.startTime))
            .limit(limit)
            .offset(offset)

        const reconciledExecutions = await Promise.all(
            executions.map((execution) => reconcileExecutionStatus(targetDb, execution))
        )

        const payload = await Promise.all(reconciledExecutions.map(async (e) => {
            const normalizedStatus = normalizeDbStatus(e.status)
            const runtime = includeRuntime && ACTIVE_STATUSES.has(normalizedStatus) && !e.endTime
                ? await getRuntimeSummary(e)
                : undefined

            return {
                ...e,
                startTime: e.startTime ? e.startTime.toISOString() : null,
                endTime: e.endTime ? e.endTime.toISOString() : null,
                progress: e.progress ?? null,
                error: e.error ?? null,
                result: e.result ?? null,
                parameters: e.parameters ?? null,
                approvalRequestId: e.approvalRequestId ?? null,
                approvalStatus: e.approvalStatus ?? null,
                triggeredBy: e.triggeredBy ?? null,
                tenantId: e.tenantId ?? null,
                runtime: runtime?.available ? runtime : undefined,
            } as any
        }))

        return c.json(payload)
    }
)

/**
 * GET /executions/:id - Get specific execution
 */
jobsRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/executions/{id}',
        tags: ['Jobs'],
        summary: 'Get Job Execution',
        security: [{ BearerAuth: [] }],
        request: {
            params: z.object({
                id: z.string().openapi({ param: { name: 'id', in: 'path' } }),
            }) as any,
        },
        responses: {
            200: {
                content: {
                    'application/json': {
                        schema: JobExecutionSchema,
                    },
                },
                description: 'Execution details',
            },
            404: { description: 'Execution not found' }
        },
    }),
    async (c) => {
        if (!hasAnyRequiredPermission(c, JOB_PERMISSION_REQUIREMENTS.view)) {
            return forbiddenForPermissions(c, JOB_PERMISSION_REQUIREMENTS.view)
        }

        const tenantId = c.get('tenantId')
        const targetDb = getDatabase(tenantId)
        await reconcilePendingApprovals(targetDb, tenantId)

        const id = c.req.param('id')!
        const includeRuntime = hasAdminRuntimeAccess(c)

        // Hono route matching can resolve /executions/pending-approval into /executions/{id}.
        // Keep behavior stable by handling the static pending-approval path explicitly here.
        if (id === 'pending-approval') {
            if (!hasAnyRequiredPermission(c, JOB_PERMISSION_REQUIREMENTS.approve)) {
                return forbiddenForPermissions(c, JOB_PERMISSION_REQUIREMENTS.approve)
            }

            const pendingWhereClause = tenantId
                ? and(
                    eq(jobExecutions.tenantId, tenantId),
                    eq(jobExecutions.approvalStatus, 'pending')
                )
                : eq(jobExecutions.approvalStatus, 'pending')

            const pending = await targetDb
                .select()
                .from(jobExecutions)
                .where(pendingWhereClause)
                .orderBy(desc(jobExecutions.startTime))

            return c.json(pending.map(e => ({
                ...e,
                startTime: e.startTime ? e.startTime.toISOString() : null,
                endTime: e.endTime ? e.endTime.toISOString() : null,
                progress: e.progress ?? null,
                error: e.error ?? null,
                result: e.result ?? null,
                parameters: e.parameters ?? null,
                approvalRequestId: e.approvalRequestId ?? null,
                approvalStatus: e.approvalStatus ?? null,
                triggeredBy: e.triggeredBy ?? null,
                tenantId: e.tenantId ?? null,
            }) as any))
        }

        const executionWhereClause = tenantId
            ? and(eq(jobExecutions.id, id), eq(jobExecutions.tenantId, tenantId))
            : eq(jobExecutions.id, id)

        const execution = await targetDb
            .select()
            .from(jobExecutions)
            .where(executionWhereClause)
            .limit(1)

        if (!execution.length) {
            return notFound(c, 'Execution not found')
        }

        const e = await reconcileExecutionStatus(targetDb, execution[0])
        const normalizedStatus = normalizeDbStatus(e.status)
        const runtime = includeRuntime && ACTIVE_STATUSES.has(normalizedStatus) && !e.endTime
            ? await getRuntimeSummary(e)
            : undefined
        return c.json({
            ...e,
            startTime: e.startTime ? e.startTime.toISOString() : null,
            endTime: e.endTime ? e.endTime.toISOString() : null,
            progress: e.progress ?? null,
            error: e.error ?? null,
            result: e.result ?? null,
            parameters: e.parameters ?? null,
            approvalRequestId: e.approvalRequestId ?? null,
            approvalStatus: e.approvalStatus ?? null,
            triggeredBy: e.triggeredBy ?? null,
            tenantId: e.tenantId ?? null,
            runtime: runtime?.available ? runtime : undefined,
        }) as any
    }
)

/**
 * GET /executions/:id/runtime - Get live runtime diagnostics for SQL_SP jobs
 */
jobsRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/executions/{id}/runtime',
        tags: ['Jobs'],
        summary: 'Get Job Runtime Diagnostics',
        security: [{ BearerAuth: [] }],
        request: {
            params: z.object({
                id: z.string().openapi({ param: { name: 'id', in: 'path' } }),
            }) as any,
        },
        responses: {
            200: {
                content: {
                    'application/json': {
                        schema: JobRuntimeSchema,
                    },
                },
                description: 'Live runtime diagnostics',
            },
            403: { description: 'Forbidden' },
            404: { description: 'Execution not found' },
        },
    }),
    async (c) => {
        if (!hasAdminRuntimeAccess(c)) {
            return forbiddenForPermissions(c, JOB_PERMISSION_REQUIREMENTS.runtime)
        }

        const id = c.req.param('id')!
        const tenantId = c.get('tenantId')
        const targetDb = getDatabase(tenantId)
        const executionWhereClause = tenantId
            ? and(eq(jobExecutions.id, id), eq(jobExecutions.tenantId, tenantId))
            : eq(jobExecutions.id, id)
        const [execution] = await targetDb
            .select()
            .from(jobExecutions)
            .where(executionWhereClause)
            .limit(1)

        if (!execution) {
            return notFound(c, 'Execution not found')
        }

        const runtime = await getRuntimeSummary(execution)
        return c.json(runtime as any)
    }
)

// =============================================================================
// JOB DEFINITIONS
// =============================================================================

/**
 * GET /definitions - Get job definitions
 */
jobsRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/definitions',
        tags: ['Jobs'],
        summary: 'List Job Definitions',
        security: [{ BearerAuth: [] }],
        responses: {
            200: {
                content: {
                    'application/json': {
                        schema: z.array(JobDefinitionSchema),
                    },
                },
                description: 'List of definitions',
            },
        },
    }),
    async (c) => {
        if (!hasAnyRequiredPermission(c, JOB_PERMISSION_REQUIREMENTS.view)) {
            return forbiddenForPermissions(c, JOB_PERMISSION_REQUIREMENTS.view)
        }

        const tenantId = c.get('tenantId')
        const definitions = await getDatabase(tenantId)
            .select()
            .from(jobDefinitions)
            .where(eq(jobDefinitions.isEnabled, true))
            .orderBy(jobDefinitions.name)

        return c.json(definitions.map(d => ({
            ...d,
            description: d.description ?? null,
            cronExpression: d.cronExpression ?? null,
            defaultParameters: d.defaultParameters ?? null,
            priority: d.priority ?? null,
            timeout: d.timeout ?? null,
            maxRetries: d.maxRetries ?? null,
            createdAt: d.createdAt?.toISOString() ?? new Date().toISOString(),
            updatedAt: d.updatedAt?.toISOString() ?? new Date().toISOString(),
            tenantId: d.tenantId ?? null,
            createdBy: d.createdBy ?? null,
        }) as any))
    }
)

/**
 * GET /definitions/:id - Get specific definition
 */
jobsRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/definitions/{id}',
        tags: ['Jobs'],
        summary: 'Get Job Definition',
        security: [{ BearerAuth: [] }],
        request: {
            params: z.object({
                id: z.string().openapi({ param: { name: 'id', in: 'path' } }),
            }) as any,
        },
        responses: {
            200: {
                content: {
                    'application/json': {
                        schema: JobDefinitionSchema,
                    },
                },
                description: 'Definition details',
            },
            404: { description: 'Definition not found' }
        },
    }),
    async (c) => {
        if (!hasAnyRequiredPermission(c, JOB_PERMISSION_REQUIREMENTS.view)) {
            return forbiddenForPermissions(c, JOB_PERMISSION_REQUIREMENTS.view)
        }

        const id = c.req.param('id')!

        const tenantId = c.get('tenantId')
        const definition = await getDatabase(tenantId)
            .select()
            .from(jobDefinitions)
            .where(eq(jobDefinitions.id, id))
            .limit(1)

        if (!definition.length) {
            return notFound(c, 'Definition not found')
        }

        const d = definition[0]
        return c.json({
            ...d,
            description: d.description ?? null,
            cronExpression: d.cronExpression ?? null,
            defaultParameters: d.defaultParameters ?? null,
            priority: d.priority ?? null,
            timeout: d.timeout ?? null,
            maxRetries: d.maxRetries ?? null,
            createdAt: d.createdAt?.toISOString() ?? new Date().toISOString(),
            updatedAt: d.updatedAt?.toISOString() ?? new Date().toISOString(),
            tenantId: d.tenantId ?? null,
            createdBy: d.createdBy ?? null,
        }) as any
    }
)

/**
 * POST /definitions - Create job definition
 */
jobsRoutes.openapi(
    createRoute({
        method: 'post',
        path: '/definitions',
        tags: ['Jobs'],
        summary: 'Create Job Definition',
        security: [{ BearerAuth: [] }],
        request: {
            body: {
                content: {
                    'application/json': {
                        schema: CreateJobDefinitionSchema,
                    },
                },
            },
        },
        responses: {
            201: {
                content: {
                    'application/json': {
                        schema: JobDefinitionSchema,
                    },
                },
                description: 'Job definition created',
            },
        },
    }),
    async (c) => {
        if (!hasAnyRequiredPermission(c, JOB_PERMISSION_REQUIREMENTS.create)) {
            return forbiddenForPermissions(c, JOB_PERMISSION_REQUIREMENTS.create)
        }

        const tenantId = c.get('tenantId') || '00000000-0000-0000-0000-000000000000'
        const userId = c.get('userId')
        const body = c.req.valid('json')
        const normalizedJobType = String(body.jobType || '').toUpperCase()

        if (!SUPPORTED_JOB_TYPES.includes(normalizedJobType as any)) {
            return c.json({
                error: `Unsupported job type: ${body.jobType}. Supported types: ${SUPPORTED_JOB_TYPES.join(', ')}`
            } as any, 400)
        }

        const [newDef] = await getDatabase(tenantId)
            .insert(jobDefinitions)
            .values({
                ...body,
                jobType: normalizedJobType,
                tenantId,
                createdBy: userId,
            })
            .returning() as any

        return c.json({
            ...newDef,
            description: newDef.description ?? null,
            cronExpression: newDef.cronExpression ?? null,
            defaultParameters: newDef.defaultParameters ?? null,
            priority: newDef.priority ?? null,
            timeout: newDef.timeout ?? null,
            maxRetries: newDef.maxRetries ?? null,
            createdAt: newDef.createdAt?.toISOString(),
            updatedAt: newDef.updatedAt?.toISOString(),
            tenantId: newDef.tenantId ?? null,
            createdBy: newDef.createdBy ?? null,
        }, 201) as any
    }
)

/**
 * PATCH /definitions/:id - Update job definition
 */
jobsRoutes.openapi(
    createRoute({
        method: 'patch',
        path: '/definitions/{id}',
        tags: ['Jobs'],
        summary: 'Update Job Definition',
        security: [{ BearerAuth: [] }],
        request: {
            params: z.object({
                id: z.string().openapi({ param: { name: 'id', in: 'path' } }),
            }) as any,
            body: {
                content: {
                    'application/json': {
                        schema: UpdateJobDefinitionSchema,
                    },
                },
            },
        },
        responses: {
            200: {
                content: {
                    'application/json': {
                        schema: JobDefinitionSchema,
                    },
                },
                description: 'Job definition updated',
            },
            404: { description: 'Job definition not found' },
        },
    }),
    async (c) => {
        if (!hasAnyRequiredPermission(c, JOB_PERMISSION_REQUIREMENTS.update)) {
            return forbiddenForPermissions(c, JOB_PERMISSION_REQUIREMENTS.update)
        }

        const id = c.req.param('id')!
        const tenantId = c.get('tenantId')
        const userId = c.get('userId')
        const body = c.req.valid('json')
        const patch: Record<string, unknown> = { ...body, updatedBy: userId, updatedAt: new Date() }

        if (typeof body.jobType === 'string') {
            const normalizedJobType = body.jobType.toUpperCase()
            if (!SUPPORTED_JOB_TYPES.includes(normalizedJobType as any)) {
                return c.json({
                    error: `Unsupported job type: ${body.jobType}. Supported types: ${SUPPORTED_JOB_TYPES.join(', ')}`
                } as any, 400)
            }
            patch.jobType = normalizedJobType
        }

        const [updated] = await getDatabase(tenantId)
            .update(jobDefinitions)
            .set(patch as any)
            .where(eq(jobDefinitions.id, id))
            .returning() as any

        if (!updated) {
            return notFound(c, 'Job definition not found')
        }

        return c.json({
            ...updated,
            description: updated.description ?? null,
            cronExpression: updated.cronExpression ?? null,
            defaultParameters: updated.defaultParameters ?? null,
            priority: updated.priority ?? null,
            timeout: updated.timeout ?? null,
            maxRetries: updated.maxRetries ?? null,
            createdAt: updated.createdAt?.toISOString() ?? new Date().toISOString(),
            updatedAt: updated.updatedAt?.toISOString() ?? new Date().toISOString(),
            tenantId: updated.tenantId ?? null,
            createdBy: updated.createdBy ?? null,
        }) as any
    }
)

/**
 * DELETE /definitions/:id - Delete job definition
 */
jobsRoutes.openapi(
    createRoute({
        method: 'delete',
        path: '/definitions/{id}',
        tags: ['Jobs'],
        summary: 'Delete Job Definition',
        security: [{ BearerAuth: [] }],
        request: {
            params: z.object({
                id: z.string().openapi({ param: { name: 'id', in: 'path' } }),
            }) as any,
        },
        responses: {
            200: {
                content: {
                    'application/json': {
                        schema: z.object({
                            success: z.boolean(),
                        }) as any,
                    },
                },
                description: 'Job definition deleted',
            },
            404: { description: 'Job definition not found' },
        },
    }),
    async (c) => {
        if (!hasAnyRequiredPermission(c, JOB_PERMISSION_REQUIREMENTS.delete)) {
            return forbiddenForPermissions(c, JOB_PERMISSION_REQUIREMENTS.delete)
        }

        const id = c.req.param('id')!
        const tenantId = c.get('tenantId')

        const [deleted] = await getDatabase(tenantId)
            .delete(jobDefinitions)
            .where(eq(jobDefinitions.id, id))
            .returning({ id: jobDefinitions.id }) as any

        if (!deleted) {
            return notFound(c, 'Job definition not found')
        }

        return c.json({ success: true }) as any
    }
)

// =============================================================================
// JOB CONTROL
// =============================================================================

/**
 * POST /:id/run - Trigger a job (with approval support)
 */
jobsRoutes.openapi(
    createRoute({
        method: 'post',
        path: '/{id}/run',
        tags: ['Jobs'],
        summary: 'Run Job',
        security: [{ BearerAuth: [] }],
        request: {
            params: z.object({
                id: z.string().openapi({ param: { name: 'id', in: 'path' } }),
            }) as any,
        },
        responses: {
            200: {
                description: 'Job trigger result',
                content: {
                    'application/json': {
                        schema: z.object({
                            success: z.boolean(),
                            jobId: z.string().optional(),
                            executionId: z.string().optional(),
                            approvalRequestId: z.string().optional(),
                            status: z.string().optional(),
                            message: z.string().optional(),
                        }) as any
                    }
                }
            },
            409: {
                description: 'Job already active',
                content: {
                    'application/json': {
                        schema: z.object({
                            success: z.boolean(),
                            status: z.string(),
                            message: z.string(),
                            activeExecutionId: z.string(),
                            startTime: z.string().nullable().optional(),
                        }) as any
                    }
                }
            },
        },
    }),
    async (c) => {
        if (!hasAnyRequiredPermission(c, JOB_PERMISSION_REQUIREMENTS.run)) {
            return forbiddenForPermissions(c, JOB_PERMISSION_REQUIREMENTS.run)
        }

        const id = c.req.param('id')!
        const userId = c.get('userId') || 'system'
        const tenantId = c.get('tenantId') || '00000000-0000-0000-0000-000000000000'
        const targetDb = getDatabase(tenantId)

        // Get job definition
        const [definition] = await targetDb
            .select()
            .from(jobDefinitions)
            .where(eq(jobDefinitions.id, id))
            .limit(1)

        if (!definition) {
            return notFound(c, 'Job definition not found')
        }

        if (!definition.isEnabled) {
            return badRequest(c, 'Job is disabled')
        }

        if (!SUPPORTED_JOB_TYPES.includes(String(definition.jobType).toUpperCase() as any)) {
            return c.json({
                error: `Unsupported job type: ${definition.jobType}. Supported types: ${SUPPORTED_JOB_TYPES.join(', ')}`
            } as any, 400)
        }

        // Heal stale active-like rows for this definition before conflict check.
        await reconcileDefinitionExecutions(targetDb, definition.id)

        const [activeExecution] = await targetDb
            .select({
                id: jobExecutions.id,
                startTime: jobExecutions.startTime,
            })
            .from(jobExecutions)
            .where(and(
                eq(jobExecutions.jobDefinitionId, definition.id),
                sql`${jobExecutions.endTime} is null and lower(${jobExecutions.status}) in (${sql.join(
                    ACTIVE_LIKE_STATUSES.map((status) => sql`${status}`),
                    sql`, `
                )})`
            ))
            .orderBy(desc(jobExecutions.startTime))
            .limit(1)

        if (activeExecution) {
            return c.json({
                success: false,
                status: 'CONFLICT',
                message: 'Job is already running or pending for this definition.',
                activeExecutionId: activeExecution.id,
                startTime: activeExecution.startTime ? activeExecution.startTime.toISOString() : null,
            } as any, 409)
        }

        // Generate execution ID
        const executionId = crypto.randomUUID()
        const approvalPolicy = await deriveApprovalPolicy(definition)

        // Check if approval is required
        if (definition.requiresApproval) {
            // Import approval service
            const jobApprovalService = await import('../services/job-approval.service')

            // Check auto-approval conditions
            const canAutoApprove = await jobApprovalService.checkAutoApprovalConditions(
                definition.id,
                tenantId,
                userId,
                definition.defaultParameters
            )

            if (!canAutoApprove) {
                // Create approval request
                const approvalRequest = await jobApprovalService.createJobApprovalRequest({
                    jobDefinitionId: definition.id,
                    executionId,
                    triggeredBy: userId,
                    tenantId,
                    parameters: definition.defaultParameters,
                    approvalPolicy,
                }) as any

                // Create execution record in pending_approval state
                await targetDb.insert(jobExecutions).values({
                    id: executionId,
                    jobDefinitionId: definition.id,
                    tenantId,
                    jobName: definition.name,
                    jobType: definition.jobType,
                    status: 'pending_approval',
                    progress: 0,
                    parameters: definition.defaultParameters,
                    triggeredBy: userId,
                    approvalRequestId: approvalRequest!.id,
                    approvalStatus: 'pending',
                    error: `Approval pending (${approvalPolicy.approvalsRequired} approver${approvalPolicy.approvalsRequired > 1 ? 's' : ''}, SLA ${approvalPolicy.slaHours}h)`,
                    startTime: new Date()
                }) as any

                // Update definition run state immediately for UI visibility
                await targetDb
                    .update(jobDefinitions)
                    .set({
                        lastRunStatus: 'PENDING',
                        lastRunTime: new Date(),
                        updatedAt: new Date(),
                    })
                    .where(eq(jobDefinitions.id, definition.id))
                    .execute()

                return c.json({
                    success: true,
                    status: 'pending_approval',
                    executionId,
                    approvalRequestId: approvalRequest!.id,
                    approvalPolicy,
                    approvalExpiresAt: approvalRequest?.expiresAt ? new Date(approvalRequest.expiresAt).toISOString() : null,
                    message: `Approval request created. Requires ${approvalPolicy.approvalsRequired} approver${approvalPolicy.approvalsRequired > 1 ? 's' : ''} within ${approvalPolicy.slaHours}h.`
                }) as any
            }
        }

        // No approval required or auto-approved.
        // Insert execution row first to avoid race where worker becomes active before row exists.
        await targetDb.insert(jobExecutions).values({
            id: executionId,
            jobDefinitionId: definition.id,
            tenantId,
            jobName: definition.name,
            jobType: definition.jobType,
            status: 'pending',
            progress: 0,
            parameters: definition.defaultParameters,
            triggeredBy: userId,
            approvalStatus: 'not_required',
            startTime: new Date()
        }) as any

        let job: any
        try {
            job = await addJob(definition.jobType, {
                definitionId: definition.id,
                tenantId,
                parameters: definition.defaultParameters,
            }, {
                jobId: executionId,
                priority: approvalPolicy.queuePriority,
                attempts: (definition.maxRetries || 0) + 1,
                timeout: (definition.timeout || 3600) * 1000,
            }) as any
        } catch (queueError: any) {
            const queueErrorMessage = queueError?.message || 'Failed to enqueue job'
            await targetDb
                .update(jobExecutions)
                .set({
                    status: 'failed',
                    error: `Queue enqueue failed: ${queueErrorMessage}`,
                    endTime: new Date(),
                })
                .where(eq(jobExecutions.id, executionId))
                .execute()
            return c.json({
                success: false,
                executionId,
                status: 'FAILED',
                message: `Queue enqueue failed: ${queueErrorMessage}`,
            } as any, 500)
        }

        try {
            await targetDb
                .update(jobExecutions)
                .set({
                    status: 'active',
                    error: null,
                })
                .where(eq(jobExecutions.id, executionId))
                .execute()
        } catch (statusError: any) {
            const isUniqueViolation = statusError?.code === '23505'
            if (isUniqueViolation) {
                const queuedJob = await getJob(executionId)
                try {
                    await queuedJob?.remove()
                } catch (_) {
                    // Best-effort cleanup only.
                }

                await targetDb
                    .update(jobExecutions)
                    .set({
                        status: 'cancelled',
                        error: 'Duplicate active execution prevented by guard',
                        endTime: new Date(),
                    })
                    .where(eq(jobExecutions.id, executionId))
                    .execute()

                const [existingActive] = await targetDb
                    .select({ id: jobExecutions.id, startTime: jobExecutions.startTime })
                    .from(jobExecutions)
                    .where(and(
                        eq(jobExecutions.jobDefinitionId, definition.id),
                        sql`${jobExecutions.endTime} is null and lower(${jobExecutions.status}) = 'active'`
                    ))
                    .orderBy(desc(jobExecutions.startTime))
                    .limit(1)

                return c.json({
                    success: false,
                    status: 'CONFLICT',
                    message: 'Job is already running for this definition.',
                    activeExecutionId: existingActive?.id || executionId,
                    startTime: existingActive?.startTime ? existingActive.startTime.toISOString() : null,
                } as any, 409)
            }

            throw statusError
        }

        // Update definition run state immediately after queueing
        await targetDb
            .update(jobDefinitions)
            .set({
                lastRunStatus: 'RUNNING',
                lastRunTime: new Date(),
                updatedAt: new Date(),
            })
            .where(eq(jobDefinitions.id, definition.id))
            .execute()

        return c.json({
            success: true,
            jobId: job.id,
            executionId,
            status: 'RUNNING',
            message: 'Job started successfully'
        }) as any
    }
)

// Backward-compatible alias so clients can use /definitions/{id}/run as well.
jobsRoutes.post('/definitions/:id/run', async (c) => {
    const aliasUrl = new URL(c.req.url)
    aliasUrl.pathname = aliasUrl.pathname.replace('/definitions/', '/')

    const proxiedRequest = new Request(aliasUrl.toString(), {
        method: 'POST',
        headers: c.req.raw.headers,
    })

    return jobsRoutes.fetch(proxiedRequest, c.env, c.executionCtx)
})

/**
 * POST /:id/control - Control job (pause/resume/stop)
 */
jobsRoutes.openapi(
    createRoute({
        method: 'post',
        path: '/{id}/control',
        tags: ['Jobs'],
        summary: 'Control Job',
        security: [{ BearerAuth: [] }],
        request: {
            params: z.object({
                id: z.string().openapi({ param: { name: 'id', in: 'path' } }),
            }) as any,
            body: {
                content: {
                    'application/json': {
                        schema: JobControlSchema,
                    },
                },
            },
        },
        responses: {
            200: {
                description: 'Control signal sent',
                content: {
                    'application/json': {
                        schema: z.object({
                            success: z.boolean(),
                            message: z.string(),
                        }) as any
                    }
                }
            },
            404: { description: 'Job not found' }
        },
    }),
    async (c) => {
        if (!hasAnyRequiredPermission(c, JOB_PERMISSION_REQUIREMENTS.control)) {
            return forbiddenForPermissions(c, JOB_PERMISSION_REQUIREMENTS.control)
        }

        const id = c.req.param('id')!
        const { action } = c.req.valid('json')

        const job = await getJob(id)

        if (!job) {
            return notFound(c, 'Job not found')
        }

        // Control actions would be implemented here
        return c.json({
            success: true,
            message: `Job ${action} signal sent`
        }) as any
    }
)

/**
 * POST /:id/toggle - Toggle job definition enabled status
 */
jobsRoutes.openapi(
    createRoute({
        method: 'post',
        path: '/{id}/toggle',
        tags: ['Jobs'],
        summary: 'Toggle Job',
        security: [{ BearerAuth: [] }],
        request: {
            params: z.object({
                id: z.string().openapi({ param: { name: 'id', in: 'path' } }),
            }) as any,
        },
        responses: {
            200: {
                content: {
                    'application/json': {
                        schema: z.object({
                            success: z.boolean(),
                            isEnabled: z.boolean(),
                        }) as any
                    }
                },
                description: 'Job toggled',
            },
            404: { description: 'Job definition not found' }
        },
    }),
    async (c) => {
        if (!hasAnyRequiredPermission(c, JOB_PERMISSION_REQUIREMENTS.control)) {
            return forbiddenForPermissions(c, JOB_PERMISSION_REQUIREMENTS.control)
        }

        const id = c.req.param('id')!
        const tenantId = c.get('tenantId')

        const [definition] = await getDatabase(tenantId)
            .select()
            .from(jobDefinitions)
            .where(eq(jobDefinitions.id, id))
            .limit(1)

        if (!definition) {
            return notFound(c, 'Job definition not found')
        }

        const [updated] = await getDatabase(tenantId)
            .update(jobDefinitions)
            .set({ isEnabled: !definition.isEnabled })
            .where(eq(jobDefinitions.id, id))
            .returning()

        return c.json({
            success: true,
            isEnabled: updated.isEnabled
        }) as any
    }
)

// =============================================================================
// APPROVAL INTEGRATION
// =============================================================================

/**
 * GET /executions/pending-approval - Get job executions awaiting approval
 */
jobsRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/executions/pending-approval',
        tags: ['Jobs'],
        summary: 'Pending Approvals',
        security: [{ BearerAuth: [] }],
        responses: {
            200: {
                content: {
                    'application/json': {
                        schema: z.array(JobExecutionSchema),
                    },
                },
                description: 'List of pending executions',
            },
        },
    }),
    async (c) => {
        if (!hasAnyRequiredPermission(c, JOB_PERMISSION_REQUIREMENTS.approve)) {
            return forbiddenForPermissions(c, JOB_PERMISSION_REQUIREMENTS.approve)
        }

        const tenantId = c.get('tenantId')
        const targetDb = getDatabase(tenantId)
        await reconcilePendingApprovals(targetDb, tenantId)
        const pendingWhereClause = tenantId
            ? and(
                eq(jobExecutions.tenantId, tenantId),
                eq(jobExecutions.approvalStatus, 'pending')
            )
            : eq(jobExecutions.approvalStatus, 'pending')

        const pending = await targetDb
            .select()
            .from(jobExecutions)
            .where(pendingWhereClause)
            .orderBy(desc(jobExecutions.startTime))

        return c.json(pending.map(e => ({
            ...e,
            startTime: e.startTime ? e.startTime.toISOString() : null,
            endTime: e.endTime ? e.endTime.toISOString() : null,
            progress: e.progress ?? null,
            error: e.error ?? null,
            result: e.result ?? null,
            parameters: e.parameters ?? null,
            approvalRequestId: e.approvalRequestId ?? null,
            approvalStatus: e.approvalStatus ?? null,
            triggeredBy: e.triggeredBy ?? null,
            tenantId: e.tenantId ?? null,
        }) as any))
    }
)

/**
 * POST /executions/:id/approve - Approve a pending job execution
 */
jobsRoutes.openapi(
    createRoute({
        method: 'post',
        path: '/executions/{id}/approve',
        tags: ['Jobs'],
        summary: 'Approve Job',
        security: [{ BearerAuth: [] }],
        request: {
            params: z.object({
                id: z.string().openapi({ param: { name: 'id', in: 'path' } }),
            }) as any,
            body: {
                content: {
                    'application/json': {
                        schema: z.object({
                            comment: z.string().trim().max(2000).optional(),
                        }) as any,
                    },
                },
            },
        },
        responses: {
            200: {
                content: {
                    'application/json': {
                        schema: z.object({
                            success: z.boolean(),
                            message: z.string(),
                            status: z.string().optional(),
                            queued: z.boolean().optional(),
                            approvalsRequired: z.number().optional(),
                            approvalsReceived: z.number().optional(),
                            remainingApprovals: z.number().optional(),
                        }) as any
                    }
                },
                description: 'Job approved',
            },
            404: { description: 'Execution not found' }
        },
    }),
    async (c) => {
        if (!hasAnyRequiredPermission(c, JOB_PERMISSION_REQUIREMENTS.approve)) {
            return forbiddenForPermissions(c, JOB_PERMISSION_REQUIREMENTS.approve)
        }

        const id = c.req.param('id')!
        const userId = c.get('userId') || 'system'
        let body: { comment?: string } = {}
        try {
            const parsed = await c.req.json()
            if (parsed && typeof parsed === 'object' && typeof (parsed as any).comment === 'string') {
                body = { comment: String((parsed as any).comment).trim() }
            }
        } catch (_) {
            body = {}
        }

        const tenantId = c.get('tenantId')
        const [execution] = await getDatabase(tenantId)
            .select()
            .from(jobExecutions)
            .where(eq(jobExecutions.id, id))
            .limit(1)

        if (!execution) {
            return notFound(c, 'Execution not found')
        }

        if (execution.approvalStatus !== 'pending') {
            return badRequest(c, 'Execution is not pending approval')
        }

        if (execution.triggeredBy && execution.triggeredBy === userId) {
            return badRequest(c, 'You cannot approve your own job execution')
        }

        if (!execution.approvalRequestId) {
            return badRequest(c, 'Approval request is missing for this execution')
        }

        const jobApprovalService = await import('../services/job-approval.service')
        try {
            const result = await jobApprovalService.handleJobApprovalComplete(
                execution.approvalRequestId!,
                'approved',
                userId,
                {
                    comment: body?.comment,
                }
            )

            const message = result.queued
                ? 'Job approved and queued for execution'
                : result.completed
                    ? 'Job approval completed'
                    : `Approval recorded. Waiting for ${result.remainingApprovals} more approver${result.remainingApprovals === 1 ? '' : 's'}.`

            return c.json({
                success: true,
                message,
                status: result.status,
                queued: result.queued,
                approvalsRequired: result.approvalsRequired,
                approvalsReceived: result.approvalsReceived,
                remainingApprovals: result.remainingApprovals,
            }) as any
        } catch (error: any) {
            const message = String(error?.message || 'Failed to process approval')
            const normalized = message.toLowerCase()
            const statusCode = normalized.includes('not found')
                ? 404
                : normalized.includes('not pending') || normalized.includes('already')
                    ? 409
                    : 400

            return c.json({
                ...buildErrorResponse(c, {
                    error: message,
                    message,
                    code: statusCode === 404 ? 'NOT_FOUND' : statusCode === 409 ? 'CONFLICT' : 'BAD_REQUEST',
                }),
            } as any, statusCode as any)
        }
    }
)

/**
 * POST /executions/:id/reject - Reject a pending job execution
 */
jobsRoutes.openapi(
    createRoute({
        method: 'post',
        path: '/executions/{id}/reject',
        tags: ['Jobs'],
        summary: 'Reject Job',
        security: [{ BearerAuth: [] }],
        request: {
            params: z.object({
                id: z.string().openapi({ param: { name: 'id', in: 'path' } }),
            }) as any,
            body: {
                content: {
                    'application/json': {
                        schema: z.object({
                            comment: z.string().trim().max(2000).optional(),
                        }) as any,
                    },
                },
            },
        },
        responses: {
            200: {
                content: {
                    'application/json': {
                        schema: z.object({
                            success: z.boolean(),
                            message: z.string(),
                            status: z.string().optional(),
                            queued: z.boolean().optional(),
                            approvalsRequired: z.number().optional(),
                            approvalsReceived: z.number().optional(),
                            remainingApprovals: z.number().optional(),
                        }) as any
                    }
                },
                description: 'Job rejected',
            },
            404: { description: 'Execution not found' }
        },
    }),
    async (c) => {
        if (!hasAnyRequiredPermission(c, JOB_PERMISSION_REQUIREMENTS.approve)) {
            return forbiddenForPermissions(c, JOB_PERMISSION_REQUIREMENTS.approve)
        }

        const id = c.req.param('id')!
        const userId = c.get('userId') || 'system'
        let body: { comment?: string } = {}
        try {
            const parsed = await c.req.json()
            if (parsed && typeof parsed === 'object' && typeof (parsed as any).comment === 'string') {
                body = { comment: String((parsed as any).comment).trim() }
            }
        } catch (_) {
            body = {}
        }

        const tenantId = c.get('tenantId')
        const [execution] = await getDatabase(tenantId)
            .select()
            .from(jobExecutions)
            .where(eq(jobExecutions.id, id))
            .limit(1)

        if (!execution) {
            return notFound(c, 'Execution not found')
        }

        if (execution.approvalStatus !== 'pending') {
            return badRequest(c, 'Execution is not pending approval')
        }

        if (!execution.approvalRequestId) {
            return badRequest(c, 'Approval request is missing for this execution')
        }

        const jobApprovalService = await import('../services/job-approval.service')
        try {
            const result = await jobApprovalService.handleJobApprovalComplete(
                execution.approvalRequestId!,
                'rejected',
                userId,
                {
                    comment: body?.comment,
                }
            )

            return c.json({
                success: true,
                message: 'Job execution rejected',
                status: result.status,
                queued: result.queued,
                approvalsRequired: result.approvalsRequired,
                approvalsReceived: result.approvalsReceived,
                remainingApprovals: result.remainingApprovals,
            }) as any
        } catch (error: any) {
            const message = String(error?.message || 'Failed to reject job execution')
            const normalized = message.toLowerCase()
            const statusCode = normalized.includes('not found')
                ? 404
                : normalized.includes('not pending') || normalized.includes('already')
                    ? 409
                    : 400

            return c.json({
                ...buildErrorResponse(c, {
                    error: message,
                    message,
                    code: statusCode === 404 ? 'NOT_FOUND' : statusCode === 409 ? 'CONFLICT' : 'BAD_REQUEST',
                }),
            } as any, statusCode as any)
        }
    }
)

// =============================================================================
// METRICS
// =============================================================================

/**
 * GET /metrics - Get system metrics
 */
jobsRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/metrics',
        tags: ['Jobs'],
        summary: 'Job Metrics',
        security: [{ BearerAuth: [] }],
        responses: {
            200: {
                content: {
                    'application/json': {
                        schema: MetricsSchema,
                    },
                },
                description: 'System metrics',
            },
        },
    }),
    async (c) => {
        if (!hasAnyRequiredPermission(c, JOB_PERMISSION_REQUIREMENTS.view)) {
            return forbiddenForPermissions(c, JOB_PERMISSION_REQUIREMENTS.view)
        }

        const tenantId = c.get('tenantId')
        const targetDb = getDatabase(tenantId)
        await reconcilePendingApprovals(targetDb, tenantId)

        const openExecutions = await targetDb
            .select()
            .from(jobExecutions)
            .where(sql`
                ${jobExecutions.endTime} is null
                and lower(${jobExecutions.status}) in ('pending', 'waiting', 'queued', 'pending_approval', 'active', 'running')
            `)
            .orderBy(desc(jobExecutions.startTime))
            .limit(200)

        await Promise.all(openExecutions.map((execution) => reconcileExecutionStatus(targetDb, execution)))

        const [activeJobs] = await targetDb
            .select({ count: sql<number>`count(*)` })
            .from(jobExecutions)
            .where(sql`
                lower(${jobExecutions.status}) in ('active', 'running')
                and ${jobExecutions.endTime} is null
            `)

        const [queuedJobs] = await targetDb
            .select({ count: sql<number>`count(*)` })
            .from(jobExecutions)
            .where(sql`
                lower(${jobExecutions.status}) in ('pending', 'waiting', 'queued', 'pending_approval')
                and ${jobExecutions.endTime} is null
            `)

        const [completedToday] = await targetDb
            .select({ count: sql<number>`count(*)` })
            .from(jobExecutions)
            .where(sql`
                lower(${jobExecutions.status}) = 'completed'
                and ${jobExecutions.endTime} >= CURRENT_DATE
            `)

        const [failedToday] = await targetDb
            .select({ count: sql<number>`count(*)` })
            .from(jobExecutions)
            .where(sql`
                lower(${jobExecutions.status}) = 'failed'
                and ${jobExecutions.endTime} >= CURRENT_DATE
            `)

        return c.json({
            activeJobs: Number(activeJobs.count) || 0,
            queuedJobs: Number(queuedJobs.count) || 0,
            completedJobsToday: Number(completedToday.count) || 0,
            failedJobsToday: Number(failedToday.count) || 0,
            cpuUsage: 0,
            memoryUsage: 0,
            diskUsage: 0,
            averageExecutionTime: 0,
            throughputPerHour: 0,
        }) as any
    }
)
