import { db } from '../config/database'
import { consultants, NewConsultant } from '../db/schema'
import { eq, desc, asc, ilike, and, sql } from 'drizzle-orm'
import { Effect } from 'effect'
import { DatabaseError, NotFoundError } from '@lib/errors'

// =============================================================================
// CONSULTANT SERVICE
// =============================================================================

/**
 * Get all consultants with pagination and filtering
 */
export const getConsultants = (options: {
    limit: number
    offset: number
    search?: string
    status?: string
}) =>
    Effect.tryPromise({
        try: async () => {
            const conditions = []

            if (options.search) {
                const searchLower = `%${options.search.toLowerCase()}%`
                conditions.push(
                    sql`lower(${consultants.fullName}) LIKE ${searchLower} OR lower(${consultants.firmName}) LIKE ${searchLower}`
                )
            }

            if (options.status) {
                conditions.push(eq(consultants.status, options.status))
            }

            const whereClause = conditions.length > 0 ? and(...conditions) : undefined

            const [data, totalResult] = await Promise.all([
                db
                    .select()
                    .from(consultants)
                    .where(whereClause)
                    .limit(options.limit)
                    .offset(options.offset)
                    .orderBy(desc(consultants.createdAt)),
                db
                    .select({ count: sql<number>`count(*)` })
                    .from(consultants)
                    .where(whereClause),
            ])

            return {
                data,
                total: Number(totalResult[0]?.count || 0),
            }
        },
        catch: (e) => new DatabaseError({ operation: 'query', message: 'Failed to fetch consultants', cause: e }),
    })

/**
 * Get consultant by ID
 */
export const getConsultantById = (id: string) =>
    Effect.tryPromise({
        try: async () => {
            const result = await db.select().from(consultants).where(eq(consultants.id, id)).execute()
            if (result.length === 0) {
                throw new NotFoundError({ resource: 'Consultant', id })
            }
            return result[0]
        },
        catch: (e) =>
            e instanceof NotFoundError
                ? e
                : new DatabaseError({ operation: 'query', message: 'Failed to fetch consultant', cause: e }),
    })

/**
 * Create new consultant
 */
export const createConsultant = (data: NewConsultant) =>
    Effect.tryPromise({
        try: async () => {
            const result = await db.insert(consultants).values(data).returning().execute()
            return result[0]
        },
        catch: (e) => new DatabaseError({ operation: 'insert', message: 'Failed to create consultant', cause: e }),
    })

/**
 * Update consultant
 */
export const updateConsultant = (id: string, data: Partial<NewConsultant>) =>
    Effect.tryPromise({
        try: async () => {
            const result = await db
                .update(consultants)
                .set({ ...data, updatedAt: new Date() })
                .where(eq(consultants.id, id))
                .returning()
                .execute()

            if (result.length === 0) {
                throw new NotFoundError({ resource: 'Consultant', id })
            }
            return result[0]
        },
        catch: (e) =>
            e instanceof NotFoundError
                ? e
                : new DatabaseError({ operation: 'update', message: 'Failed to update consultant', cause: e }),
    })

/**
 * Delete consultant
 */
export const deleteConsultant = (id: string) =>
    Effect.tryPromise({
        try: async () => {
            const result = await db
                .delete(consultants)
                .where(eq(consultants.id, id))
                .returning()
                .execute()

            if (result.length === 0) {
                throw new NotFoundError({ resource: 'Consultant', id })
            }
            return result[0]
        },
        catch: (e) =>
            e instanceof NotFoundError
                ? e
                : new DatabaseError({ operation: 'delete', message: 'Failed to delete consultant', cause: e }),
    })
