import { eq, and, or, asc, desc, count, ilike, gte, lte, sql } from 'drizzle-orm'
import { tenantDb as db } from '@/config'
import {
    auditLogs,
    userActivityLogs,
    dataAccessLogs,
    calculationAuditLogs,
    type AuditLog,
    type NewAuditLog,
    type UserActivityLog,
    type NewUserActivityLog,
    type DataAccessLog,
    type NewDataAccessLog,
    type CalculationAuditLog,
    type NewCalculationAuditLog,
} from '@/db/schema'

// =============================================================================
// AUDIT REPOSITORY - Domain: Audit & Compliance Logging
// =============================================================================
// Handles: audit_logs, user_activity_logs, data_access_logs, calculation_audit_logs
// =============================================================================

export const AuditRepository = {
    // ---------------------------------------------------------------------------
    // AUDIT LOG OPERATIONS
    // ---------------------------------------------------------------------------

    findAuditLogs: async (options: {
        tenantId?: string
        userId?: string
        entityType?: string
        action?: string
        startDate?: Date
        endDate?: Date
        limit?: number
        offset?: number
    }) => {
        const conditions = []

        if (options.tenantId) conditions.push(eq(auditLogs.tenantId, options.tenantId))
        if (options.userId) conditions.push(eq(auditLogs.userId, options.userId))
        if (options.entityType) conditions.push(eq(auditLogs.entityType, options.entityType))
        if (options.action) conditions.push(eq(auditLogs.action, options.action))
        if (options.startDate) conditions.push(gte(auditLogs.createdAt, options.startDate))
        if (options.endDate) conditions.push(lte(auditLogs.createdAt, options.endDate))

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined

        const [data, countResult] = await Promise.all([
            db.query.auditLogs.findMany({
                where: whereClause,
                limit: options.limit ?? 100,
                offset: options.offset ?? 0,
                orderBy: [desc(auditLogs.createdAt)],
            }),
            db.select({ count: count() }).from(auditLogs).where(whereClause),
        ])

        return { data, total: countResult[0]?.count ?? 0 }
    },

    findAuditLogById: (id: string) =>
        db.query.auditLogs.findFirst({
            where: eq(auditLogs.id, id),
        }),

    createAuditLog: async (data: NewAuditLog) => {
        const [log] = await db.insert(auditLogs).values(data).returning()
        return log
    },

    // ---------------------------------------------------------------------------
    // USER ACTIVITY LOG OPERATIONS
    // ---------------------------------------------------------------------------

    findUserActivityLogs: async (options: {
        tenantId?: string
        userId?: string
        activityType?: string
        limit?: number
        offset?: number
    }) => {
        const conditions = []

        if (options.tenantId) conditions.push(eq(userActivityLogs.tenantId, options.tenantId))
        if (options.userId) conditions.push(eq(userActivityLogs.userId, options.userId))
        if (options.activityType) conditions.push(eq(userActivityLogs.activityType, options.activityType))

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined

        return db.query.userActivityLogs.findMany({
            where: whereClause,
            limit: options.limit ?? 100,
            offset: options.offset ?? 0,
            orderBy: [desc(userActivityLogs.timestamp)],
        })
    },

    createUserActivityLog: async (data: NewUserActivityLog) => {
        const [log] = await db.insert(userActivityLogs).values({ ...data, timestamp: new Date() }).returning()
        return log
    },

    // ---------------------------------------------------------------------------
    // DATA ACCESS LOG OPERATIONS
    // ---------------------------------------------------------------------------

    findDataAccessLogs: async (options: {
        tenantId?: string
        userId?: string
        resourceType?: string
        limit?: number
        offset?: number
    }) => {
        const conditions = []

        if (options.tenantId) conditions.push(eq(dataAccessLogs.tenantId, options.tenantId))
        if (options.userId) conditions.push(eq(dataAccessLogs.userId, options.userId))
        if (options.resourceType) conditions.push(eq(dataAccessLogs.resourceType, options.resourceType))

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined

        return db.query.dataAccessLogs.findMany({
            where: whereClause,
            limit: options.limit ?? 100,
            offset: options.offset ?? 0,
            orderBy: [desc(dataAccessLogs.timestamp)],
        })
    },

    createDataAccessLog: async (data: NewDataAccessLog) => {
        const [log] = await db.insert(dataAccessLogs).values(data).returning()
        return log
    },

    // ---------------------------------------------------------------------------
    // CALCULATION AUDIT LOG OPERATIONS
    // ---------------------------------------------------------------------------

    findCalculationAuditLogs: async (options: {
        tenantId?: string
        calculationType?: string
        status?: string
        limit?: number
        offset?: number
    }) => {
        const conditions = []

        if (options.tenantId) conditions.push(eq(calculationAuditLogs.tenantId, options.tenantId))
        if (options.calculationType) conditions.push(eq(calculationAuditLogs.calculationType, options.calculationType))
        if (options.status) conditions.push(eq(calculationAuditLogs.status, options.status))

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined

        return db.query.calculationAuditLogs.findMany({
            where: whereClause,
            limit: options.limit ?? 100,
            offset: options.offset ?? 0,
            orderBy: [desc(calculationAuditLogs.timestamp)],
        })
    },

    createCalculationAuditLog: async (data: NewCalculationAuditLog) => {
        const [log] = await db.insert(calculationAuditLogs).values(data).returning()
        return log
    },

    // ---------------------------------------------------------------------------
    // AGGREGATE QUERIES
    // ---------------------------------------------------------------------------

    getRecentActivity: async (tenantId: string, limit: number = 10) =>
        db.query.auditLogs.findMany({
            where: eq(auditLogs.tenantId, tenantId),
            limit,
            orderBy: [desc(auditLogs.createdAt)],
        }),

    getActivityStats: async (tenantId: string, days: number = 7) => {
        const startDate = new Date()
        startDate.setDate(startDate.getDate() - days)

        const result = await db
            .select({
                action: auditLogs.action,
                count: count(),
            })
            .from(auditLogs)
            .where(and(
                eq(auditLogs.tenantId, tenantId),
                gte(auditLogs.createdAt, startDate)
            ))
            .groupBy(auditLogs.action)

        return result
    },

    getAuditSummary: async (tenantId: string) => {
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const [totalLogs, todayLogs, criticalLogs, highRiskLogs] = await Promise.all([
            db.select({ count: count() }).from(auditLogs).where(eq(auditLogs.tenantId, tenantId)),
            db.select({ count: count() }).from(auditLogs).where(and(eq(auditLogs.tenantId, tenantId), gte(auditLogs.createdAt, today))),
            db.select({ count: count() }).from(auditLogs).where(and(eq(auditLogs.tenantId, tenantId), eq(auditLogs.riskLevel, 'critical'))),
            db.select({ count: count() }).from(auditLogs).where(and(eq(auditLogs.tenantId, tenantId), eq(auditLogs.riskLevel, 'high'))),
        ])

        return {
            totalLogs: totalLogs[0].count,
            todayLogs: todayLogs[0].count,
            criticalEvents: criticalLogs[0].count,
            highRiskEvents: highRiskLogs[0].count,
        }
    },
}

export type AuditRepositoryType = typeof AuditRepository
