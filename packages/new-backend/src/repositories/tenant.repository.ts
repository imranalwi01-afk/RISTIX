import { eq, and, or, asc, desc, count, ilike, sql } from 'drizzle-orm'
import { db } from '@/config'
import {
    platformTenants as tenants,
    type PlatformTenant as Tenant,
    type NewPlatformTenant as NewTenant,
} from '@/db/schema/platform.schema'

// =============================================================================
// TENANT REPOSITORY - Domain: Multi-Tenancy
// =============================================================================
// Handles: tenants (future: tenant_settings, tenant_features)
// =============================================================================

/**
 * @module TenantRepository
 * @description Data access layer for Multi-Tenancy.
 * Handles database operations for tenant records and metadata.
 */

/**
 * Repository object containing all tenant-related data operations.
 */
export const TenantRepository = {
    // ---------------------------------------------------------------------------
    // TENANT OPERATIONS
    // ---------------------------------------------------------------------------

    /**
     * Find a tenant by its unique record ID.
     * 
     * @param id - The tenant UUID or record ID
     * @returns A promise that resolves to the Tenant record or undefined
     */
    findById: (id: string) => {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
        if (!uuidRegex.test(id)) return Promise.resolve(undefined)
        return db
            .select()
            .from(tenants)
            .where(eq(tenants.id, id))
            .limit(1)
            .then((rows) => rows[0])
    },

    /**
     * Find a tenant by its unique business code.
     * 
     * @param code - The short code identifier for the tenant
     * @returns A promise that resolves to the Tenant record or undefined
     */
    findByCode: (code: string) =>
        db
            .select()
            .from(tenants)
            .where(eq(tenants.code, code))
            .limit(1)
            .then((rows) => rows[0]),

    /**
     * Find a tenant by its URL-friendly slug.
     * 
     * @param slug - The unique slug used for split authentication
     * @returns A promise that resolves to the Tenant record or undefined
     */
    findBySlug: (slug: string) =>
        db
            .select()
            .from(tenants)
            .where(eq(tenants.slug, slug))
            .limit(1)
            .then((rows) => rows[0]),

    /**
     * Find all tenants matching criteria with search and sorting.
     * 
     * @param options - Query options including search, isActive, pagination, and sort
     * @returns A paginated result of Tenant records
     */
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
            db
                .select()
                .from(tenants)
                .where(whereClause)
                .orderBy(orderDir(orderColumn))
                .limit(options?.limit ?? 50)
                .offset(options?.offset ?? 0),
            db.select({ count: count() }).from(tenants).where(whereClause),
        ])

        return { data, total: countResult[0]?.count ?? 0 }
    },

    /**
     * Create a new tenant record.
     * 
     * @param data - The tenant data to insert
     * @returns The newly created Tenant record
     */
    create: async (data: NewTenant) => {
        const normalizedSettings =
            typeof data.settings === 'string' || data.settings == null
                ? data.settings
                : JSON.stringify(data.settings)

        const [tenant] = await db.insert(tenants).values({
            ...data,
            settings: normalizedSettings,
            createdAt: new Date(),
            updatedAt: new Date(),
        }).returning()
        return tenant
    },

    /**
     * Update an existing tenant record.
     * 
     * @param id - The tenant ID to update
     * @param data - Partial tenant data containing updates
     * @returns The updated Tenant record
     */
    update: async (id: string, data: Partial<NewTenant>) => {
        const normalizedSettings =
            typeof data.settings === 'string' || data.settings == null
                ? data.settings
                : JSON.stringify(data.settings)

        const [tenant] = await db.update(tenants).set({
            ...data,
            settings: normalizedSettings,
            updatedAt: new Date(),
        }).where(eq(tenants.id, id)).returning()
        return tenant
    },

    /**
     * Soft delete a tenant by setting isActive to false.
     * 
     * @param id - The ID of the tenant to deactivate
     * @returns The updated Tenant record (implicitly via query update)
     */
    delete: (id: string) =>
        db.update(tenants).set({
            isActive: false,
            updatedAt: new Date(),
        }).where(eq(tenants.id, id)),

    /**
     * Reactivate a tenant by setting isActive to true.
     * 
     * @param id - The ID of the tenant to activate
     * @returns The updated Tenant record (implicitly via query update)
     */
    enable: (id: string) =>
        db.update(tenants).set({
            isActive: true,
            updatedAt: new Date(),
        }).where(eq(tenants.id, id)),

    // ---------------------------------------------------------------------------
    // AGGREGATE QUERIES
    // ---------------------------------------------------------------------------

    /**
     * Aggregate statistics for tenants (total, active, inactive).
     * 
     * @returns A promise resolving to an object with statistical counts
     */
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

    /**
     * Group and count tenants by their banking mode (type).
     * 
     * @returns A promise resolving to an array of counts grouped by banking mode
     */
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
