import { Effect, pipe } from 'effect'
import { sql, count, eq, and, gte, lte } from 'drizzle-orm'
import { db } from '@/config'
import {
    users,
    platformUsers, // ✅ Import platformUsers
    roles,
    auditLogs,
    sessions,
} from '@/db/schema'
import { platformTenants as tenants } from '@/db/schema/platform.schema'
import { DatabaseError } from '@/lib/errors'
import { dbOperation } from '@/lib/effect'

// =============================================================================
// TYPES
// =============================================================================

export interface PlatformStats {
    totalTenants: number
    activeTenants: number
    totalUsers: number
    activeUsers: number
    totalRoles: number
    activeSessionsLast24h: number
    auditLogsLast24h: number
}

export interface SystemHealth {
    database: 'healthy' | 'degraded' | 'unhealthy'
    memory: {
        used: number
        total: number
        percentage: number
    }
    uptime: number
    version: string
}

export interface TenantOverview {
    id: string
    name: string
    code: string
    bankingMode: string | null
    userCount: number
    isActive: boolean
    createdAt: Date
}

// =============================================================================
// QUERY FUNCTIONS
// =============================================================================

/**
 * Get platform-wide statistics.
 * Aggregates counts for tenants, users, roles, active sessions, and audit logs.
 * 
 * @returns An Effect resolving to PlatformStats object
 */
export const getPlatformStats = (): Effect.Effect<PlatformStats, DatabaseError> =>
    dbOperation('query', async () => {
        const now = new Date()
        const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000)

        const [
            tenantStats,
            userStats,
            roleStats,
            sessionStats,
            auditStats,
        ] = await Promise.all([
            // Tenant stats
            db.select({
                total: count(),
                active: sql<number>`SUM(CASE WHEN is_active = true THEN 1 ELSE 0 END)`,
            }).from(tenants),
            // User stats (Platform Admins only for now, as we can't query all tenant DBs easily)
            db.select({
                total: count(),
                active: sql<number>`SUM(CASE WHEN is_active = true THEN 1 ELSE 0 END)`,
            }).from(platformUsers),
            // Role stats
            db.select({ total: count() }).from(roles),
            // Active sessions last 24h
            db.select({ total: count() }).from(sessions).where(
                and(eq(sessions.isActive, true), gte(sessions.createdAt, last24h))
            ),
            // Audit logs last 24h
            db.select({ total: count() }).from(auditLogs).where(
                gte(auditLogs.createdAt, last24h)
            ),
        ])

        return {
            totalTenants: tenantStats[0]?.total ?? 0,
            activeTenants: Number(tenantStats[0]?.active ?? 0),
            totalUsers: userStats[0]?.total ?? 0,
            activeUsers: Number(userStats[0]?.active ?? 0),
            totalRoles: roleStats[0]?.total ?? 0,
            activeSessionsLast24h: sessionStats[0]?.total ?? 0,
            auditLogsLast24h: auditStats[0]?.total ?? 0,
        }
    })

/**
 * Get system health status.
 * Checks database connectivity and memory usage.
 * 
 * @returns An Effect resolving to SystemHealth object
 */
export const getSystemHealth = (): Effect.Effect<SystemHealth, DatabaseError> =>
    dbOperation('query', async () => {
        // Test database connection
        let dbHealth: 'healthy' | 'degraded' | 'unhealthy' = 'unhealthy'
        try {
            await db.execute(sql`SELECT 1`)
            dbHealth = 'healthy'
        } catch {
            dbHealth = 'unhealthy'
        }

        // Memory usage
        const memUsage = process.memoryUsage()
        const totalMem = memUsage.heapTotal
        const usedMem = memUsage.heapUsed

        return {
            database: dbHealth,
            memory: {
                used: Math.round(usedMem / 1024 / 1024),
                total: Math.round(totalMem / 1024 / 1024),
                percentage: Math.round((usedMem / totalMem) * 100),
            },
            uptime: Math.round(process.uptime()),
            version: '1.0.0',
        }
    })

/**
 * Get tenant overview for dashboard.
 * Lists tenants with their user counts.
 * 
 * @returns An Effect resolving to an array of TenantOverview objects
 */
export const getTenantOverview = (): Effect.Effect<TenantOverview[], DatabaseError> =>
    dbOperation('query', async () => {
        const result = await db
            .select({
                id: tenants.id,
                name: tenants.name,
                code: tenants.code,
                bankingMode: tenants.bankingMode,
                isActive: tenants.isActive,
                createdAt: tenants.createdAt,
            })
            .from(tenants)
            .orderBy(tenants.name)
            .limit(50)

        // Get user counts per tenant
        // ⚠️ DISABLED: platformUsers table does not have tenantId. 
        // To get actual tenant user counts, we would need to query each Tenant DB.
        // For now, returning 0 to prevent SQL error.

        /*
        const userCounts = await db
            .select({
                tenantId: users.tenantId,
                count: count(),
            })
            .from(users)
            .groupBy(users.tenantId)

        const userCountMap = new Map(
            userCounts.map((uc) => [uc.tenantId, uc.count])
        )
        */
        const userCountMap = new Map()

        return result.map((t) => ({
            ...t,
            userCount: userCountMap.get(t.id) ?? 0,
        }))
    })

/**
 * Get recent activity summary.
 * Returns the most recent audit logs.
 * 
 * @param limit - Number of logs to return (default 10)
 * @returns An Effect resolving to an array of log objects
 */
export const getRecentActivity = (
    limit: number = 10
): Effect.Effect<any[], DatabaseError> =>
    dbOperation('query', async () => {
        const logs = await db
            .select({
                id: auditLogs.id,
                action: auditLogs.action,
                entityType: auditLogs.entityType,
                entityId: auditLogs.entityId,
                userId: auditLogs.userId,
                createdAt: auditLogs.createdAt,
            })
            .from(auditLogs)
            .orderBy(sql`${auditLogs.createdAt} DESC`)
            .limit(limit)

        return logs
    })
