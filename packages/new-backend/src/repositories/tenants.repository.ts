import { Effect, pipe } from 'effect'
import { eq, and, asc, desc, count, ilike } from 'drizzle-orm'
import { db } from '@/config'
import { tenants, type Tenant, type NewTenant } from '@/db/schema'
import { DatabaseError, NotFoundError } from '@/lib/errors'
import { dbOperation } from '@/lib/effect'
import type { PaginationParams } from '@/lib/react-admin'
import {
    type IRepository,
    type QueryOptions,
    type PaginatedResult,
    queryEffect,
    insertEffect,
    updateEffect,
    withNotFound,
    calculateOffset,
} from './base.repository'

// =============================================================================
// TENANTS REPOSITORY
// =============================================================================

export interface TenantsQueryOptions extends QueryOptions {
    search?: string
    isActive?: boolean
    bankingMode?: string
}

export class TenantsRepository implements IRepository<Tenant, NewTenant> {
    /**
     * Find tenant by ID
     */
    findById(id: string): Effect.Effect<Tenant, DatabaseError | NotFoundError> {
        return pipe(
            queryEffect(() =>
                db.query.tenants.findFirst({
                    where: eq(tenants.id, id),
                })
            ),
            withNotFound<Tenant>('Tenant', id)
        )
    }

    /**
     * Find tenant by code
     */
    findByCode(code: string): Effect.Effect<Tenant | undefined, DatabaseError> {
        return queryEffect(() =>
            db.query.tenants.findFirst({
                where: eq(tenants.code, code),
            })
        )
    }

    /**
     * Find tenant by slug
     */
    findBySlug(slug: string): Effect.Effect<Tenant | undefined, DatabaseError> {
        return queryEffect(() =>
            db.query.tenants.findFirst({
                where: eq(tenants.slug, slug),
            })
        )
    }

    /**
     * Find all tenants with pagination
     */
    findAll(options?: TenantsQueryOptions): Effect.Effect<PaginatedResult<Tenant>, DatabaseError> {
        return queryEffect(async () => {
            const pagination = options?.pagination ?? { page: 1, limit: 50 }
            const offset = calculateOffset(pagination.page, pagination.limit)

            const conditions = []
            if (!options?.includeInactive) {
                conditions.push(eq(tenants.isActive, true))
            }
            if (options?.search) {
                conditions.push(ilike(tenants.name, `%${options.search}%`))
            }
            if (options?.bankingMode) {
                conditions.push(eq(tenants.bankingMode, options.bankingMode))
            }

            const whereClause = conditions.length > 0 ? and(...conditions) : undefined

            // Build order by
            let orderBy: any = [asc(tenants.name)]
            if (pagination.sort) {
                const column = (tenants as any)[pagination.sort]
                if (column) {
                    orderBy = pagination.order === 'desc' ? [desc(column)] : [asc(column)]
                }
            }

            const [data, countResult] = await Promise.all([
                db.query.tenants.findMany({
                    where: whereClause,
                    limit: pagination.limit,
                    offset,
                    orderBy,
                }),
                db.select({ count: count() }).from(tenants).where(whereClause),
            ])

            return {
                data,
                total: countResult[0]?.count ?? 0,
                page: pagination.page,
                limit: pagination.limit,
            }
        })
    }

    /**
     * Create a new tenant
     */
    create(data: NewTenant): Effect.Effect<Tenant, DatabaseError> {
        return insertEffect(() =>
            db
                .insert(tenants)
                .values({
                    ...data,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                })
                .returning()
        )
    }

    /**
     * Update an existing tenant
     */
    update(
        id: string,
        data: Partial<NewTenant>
    ): Effect.Effect<Tenant, DatabaseError | NotFoundError> {
        return pipe(
            this.findById(id),
            Effect.flatMap(() =>
                updateEffect(() =>
                    db
                        .update(tenants)
                        .set({
                            ...data,
                            updatedAt: new Date(),
                        })
                        .where(eq(tenants.id, id))
                        .returning()
                )
            )
        )
    }

    /**
     * Soft delete a tenant
     */
    delete(id: string): Effect.Effect<Tenant, DatabaseError | NotFoundError> {
        return this.update(id, { isActive: false })
    }
}

// =============================================================================
// SINGLETON EXPORT
// =============================================================================

export const tenantsRepository = new TenantsRepository()
