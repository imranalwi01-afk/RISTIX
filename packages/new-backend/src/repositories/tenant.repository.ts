import { eq, and, or, asc, desc, count, ilike, sql } from 'drizzle-orm'
import { db } from '@/config'
import { tenants, type Tenant, type NewTenant } from '@/db/schema'

// =============================================================================
// TENANT REPOSITORY - Domain: Multi-Tenancy
// =============================================================================
// Handles: tenants (future: tenant_settings, tenant_features)
// =============================================================================

export const TenantRepository = {
    // ---------------------------------------------------------------------------
    // TENANT OPERATIONS
    // ---------------------------------------------------------------------------

    findById: (id: string) =>
        db.query.tenants.findFirst({
            where: eq(tenants.id, id),
        }),

    findByCode: (code: string) =>
        db.query.tenants.findFirst({
            where: eq(tenants.code, code),
        }),

    findBySlug: (slug: string) =>
        db.query.tenants.findFirst({
            where: eq(tenants.slug, slug),
        }),

    findAll: async (options?: {
        search?: string
        isActive?: boolean
        limit?: number
        offset?: number
        sort?: string
        order?: 'asc' | 'desc'
    }) => {
        const conditions = []

        if (options?.isActive !== undefined) {
            conditions.push(eq(tenants.isActive, options.isActive))
        }
        if (options?.search) {
            conditions.push(
                or(
                    ilike(tenants.name, `%${options.search}%`),
                    ilike(tenants.code, `%${options.search}%`),
                    ilike(tenants.slug, `%${options.search}%`)
                )!
            )
        }

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined
        const orderColumn = options?.sort ? (tenants as any)[options.sort] : tenants.name
        const orderDir = options?.order === 'desc' ? desc : asc

        const [data, countResult] = await Promise.all([
            db.query.tenants.findMany({
                where: whereClause,
                limit: options?.limit ?? 50,
                offset: options?.offset ?? 0,
                orderBy: [orderDir(orderColumn)],
            }),
            db.select({ count: count() }).from(tenants).where(whereClause),
        ])

        return { data, total: countResult[0]?.count ?? 0 }
    },

    create: async (data: NewTenant) => {
        const [tenant] = await db.insert(tenants).values({
            ...data,
            createdAt: new Date(),
            updatedAt: new Date(),
        }).returning()
        return tenant
    },

    update: async (id: string, data: Partial<NewTenant>) => {
        const [tenant] = await db.update(tenants).set({
            ...data,
            updatedAt: new Date(),
        }).where(eq(tenants.id, id)).returning()
        return tenant
    },

    delete: (id: string) =>
        db.update(tenants).set({
            isActive: false,
            updatedAt: new Date(),
        }).where(eq(tenants.id, id)),

    enable: (id: string) =>
        db.update(tenants).set({
            isActive: true,
            updatedAt: new Date(),
        }).where(eq(tenants.id, id)),

    // ---------------------------------------------------------------------------
    // AGGREGATE QUERIES
    // ---------------------------------------------------------------------------

    getStats: async () => {
        const result = await db
            .select({
                total: count(),
                active: sql<number>`SUM(CASE WHEN is_active = true THEN 1 ELSE 0 END)`,
                inactive: sql<number>`SUM(CASE WHEN is_active = false THEN 1 ELSE 0 END)`,
            })
            .from(tenants)

        return {
            total: result[0]?.total ?? 0,
            active: Number(result[0]?.active ?? 0),
            inactive: Number(result[0]?.inactive ?? 0),
        }
    },

    countByBankingType: async () => {
        const result = await db
            .select({
                bankingMode: tenants.bankingMode,
                count: count(),
            })
            .from(tenants)
            .where(eq(tenants.isActive, true))
            .groupBy(tenants.bankingMode)

        return result
    },
}

export type TenantRepositoryType = typeof TenantRepository
