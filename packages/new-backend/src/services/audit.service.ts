import { Effect, pipe } from 'effect'
import { eq, and, asc, desc, gte, lte, sql, count } from 'drizzle-orm'
import { db } from '@/config'
import { AuditRepository } from '@/repositories/audit.repository'
import {
    auditLogs,
    type NewUserActivityLog,
    type NewDataAccessLog,
    type NewCalculationAuditLog,
} from '@/db/schema'
import { DatabaseError, NotFoundError } from '@/lib/errors'
import { dbOperation } from '@/lib/effect'

// =============================================================================
// AUDIT LOG OPERATIONS
// =============================================================================

export interface CreateAuditLogInput {
    userId?: string
    sessionId?: string
    eventType: string
    action: string
    description?: string
    entityType?: string
    entityId?: string
    entityName?: string
    oldValues?: Record<string, unknown>
    newValues?: Record<string, unknown>
    changedFields?: string[]
    ipAddress?: string
    userAgent?: string
    requestPath?: string
    requestMethod?: string
    applicationName?: string
    moduleName?: string
    functionName?: string
    businessDate?: Date
    riskLevel?: 'low' | 'medium' | 'high' | 'critical'
    complianceCategory?: string
    executionTimeMs?: number
    tenantId?: string
}

/**
 * Create an audit log entry
 */
export const createAuditLog = (input: CreateAuditLogInput) =>
    dbOperation('insert', () => {
        const changedFields = input.changedFields || extractChangedFields(input.oldValues, input.newValues)
        const oldValues = maskSensitiveData(input.oldValues)
        const newValues = maskSensitiveData(input.newValues)

        return AuditRepository.createAuditLog({
            ...input,
            oldValues,
            newValues,
            changedFields,
            correlationId: crypto.randomUUID(),
            timestamp: new Date(),
            createdAt: new Date(),
        })
    })

/**
 * Generate a compliance report (Placeholder)
 */
export const generateComplianceReport = (
    tenantId: string,
    reportType: 'GDPR' | 'SOX' | 'BASEL' | 'AAOIFI',
    startDate: Date,
    endDate: Date
): Effect.Effect<any, DatabaseError> =>
    dbOperation('query', async () => {
        console.log(`[AuditService] Generating ${reportType} report for tenant ${tenantId}`)
        return {
            reportType,
            generatedAt: new Date(),
            period: { startDate, endDate },
            data: [], // Actual query would go here
            summary: { status: 'mock' }
        }
    })

/**
 * Query audit logs with filters
 */
export interface QueryAuditLogsOptions {
    tenantId?: string
    userId?: string
    eventType?: string
    action?: string
    entityType?: string
    entityId?: string
    riskLevel?: string
    startDate?: Date
    endDate?: Date
    limit?: number
    offset?: number
}

export const queryAuditLogs = (options: QueryAuditLogsOptions) =>
    dbOperation('query', () =>
        AuditRepository.findAuditLogs(options)
    )

/**
 * Get audit log by ID
 */
export const getAuditLogById = (logId: string) =>
    pipe(
        dbOperation('query', () =>
            AuditRepository.findAuditLogById(logId)
        ),
        Effect.flatMap((log) =>
            log
                ? Effect.succeed(log)
                : Effect.fail(new NotFoundError({ resource: 'AuditLog', id: logId }))
        )
    )

// =============================================================================
// USER ACTIVITY LOG OPERATIONS
// =============================================================================

/**
 * Log user activity
 */
export const logUserActivity = (input: NewUserActivityLog) =>
    dbOperation('insert', () =>
        AuditRepository.createUserActivityLog({
            ...input,
            timestamp: new Date(),
        })
    )

/**
 * Get user activity logs
 */
export const getUserActivityLogs = (
    userId: string,
    options?: { tenantId?: string; limit?: number; offset?: number; startDate?: Date; endDate?: Date }
) =>
    dbOperation('query', () =>
        AuditRepository.findUserActivityLogs({
            userId,
            ...options,
            activityType: undefined // or pass if needed
        })
    )

// =============================================================================
// DATA ACCESS LOG OPERATIONS
// =============================================================================

/**
 * Log data access
 */
export const logDataAccess = (input: NewDataAccessLog) =>
    dbOperation('insert', () =>
        AuditRepository.createDataAccessLog({
            ...input,
            timestamp: new Date(),
        })
    )

// =============================================================================
// CALCULATION AUDIT LOG OPERATIONS
// =============================================================================

/**
 * Log calculation audit
 */
export const logCalculationAudit = (input: NewCalculationAuditLog) =>
    dbOperation('insert', () =>
        AuditRepository.createCalculationAuditLog({
            ...input,
            timestamp: new Date(),
        })
    )

// =============================================================================
// AUDIT STATISTICS
// =============================================================================

export interface AuditStatistics {
    totalLogs: number
    todayLogs: number
    highRiskEvents: number
    criticalEvents: number
    eventTypeBreakdown: Record<string, number>
}

/**
 * Get audit statistics for a tenant
 */
export const getAuditStatistics = (tenantId: string) =>
    dbOperation('query', async () => {
        const summary = await AuditRepository.getAuditSummary(tenantId)
        const activityStats = await AuditRepository.getActivityStats(tenantId, 30)

        const eventTypeBreakdown: Record<string, number> = {}
        for (const stat of activityStats) {
            if (stat.action) {
                eventTypeBreakdown[stat.action] = stat.count
            }
        }

        return {
            totalLogs: summary.totalLogs,
            todayLogs: summary.todayLogs,
            highRiskEvents: summary.highRiskEvents,
            criticalEvents: summary.criticalEvents,
            eventTypeBreakdown,
        }
    })

// =============================================================================
// AUDIT MIDDLEWARE HELPER
// =============================================================================

/**
 * Helper to create common audit context from request
 */
export interface AuditContext {
    userId?: string
    tenantId?: string
    sessionId?: string
    ipAddress?: string
    userAgent?: string
    requestPath?: string
    requestMethod?: string
}

export const createAuditFromContext = (
    context: AuditContext,
    eventType: string,
    action: string,
    details?: Partial<CreateAuditLogInput>
) =>
    createAuditLog({
        ...context,
        eventType,
        action,
        applicationName: 'ifrs9-new-backend',
        ...details,
    })
// =============================================================================
// INTERNAL HELPERS
// =============================================================================

/**
 * Mask sensitive data fields (PII protection)
 */
function maskSensitiveData(data: Record<string, any> | undefined | null): Record<string, any> | undefined | null {
    if (!data) return data

    const sensitiveFields = [
        'password', 'ssn', 'account_number', 'card_number',
        'phone', 'email', 'national_id', 'passport', 'secret', 'token'
    ]

    const masked = { ...data }
    sensitiveFields.forEach(field => {
        if (masked[field]) {
            masked[field] = '***MASKED***'
        }
    })

    return masked
}

/**
 * Extract list of changed fields between two objects
 */
function extractChangedFields(
    oldValues: Record<string, any> | undefined | null,
    newValues: Record<string, any> | undefined | null
): string[] {
    if (!oldValues || !newValues) return []

    const changedFields: string[] = []
    const allKeys = new Set([...Object.keys(oldValues), ...Object.keys(newValues)])

    allKeys.forEach(key => {
        // Simple comparison, could be deep if needed
        if (JSON.stringify(oldValues[key]) !== JSON.stringify(newValues[key])) {
            changedFields.push(key)
        }
    })

    return changedFields
}
