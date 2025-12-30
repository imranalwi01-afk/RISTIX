import { Effect, pipe } from 'effect'
import { TenantRepository } from '@/repositories/tenant.repository'
import { type Tenant, type NewTenant } from '@/db/schema'
import { DatabaseError, NotFoundError, ValidationError } from '@/lib/errors'

// =============================================================================
// TYPES
// =============================================================================

export interface CreateTenantInput {
    code: string
    name: string
    slug?: string
    description?: string
    type?: string
    bankingMode?: string
    settings?: Record<string, unknown>
}

export interface UpdateTenantInput {
    name?: string
    description?: string
    bankingMode?: string
    settings?: Record<string, unknown>
    isActive?: boolean
}

// =============================================================================
// QUERY FUNCTIONS (Read Operations)
// =============================================================================

/**
 * Get all tenants with pagination
 */
export const getTenants = (options?: any) =>
    Effect.tryPromise({
        try: () => TenantRepository.findAll(options),
        catch: (e) => new DatabaseError({ message: 'Failed to find tenants', operation: 'query' })
    })

/**
 * Get tenant by ID
 */
export const getTenantById = (id: string) =>
    Effect.tryPromise({
        try: () => TenantRepository.findById(id),
        catch: (e) => new DatabaseError({ message: 'Failed to find tenant', operation: 'query' })
    })

/**
 * Get tenant by code
 */
export const getTenantByCode = (code: string) =>
    Effect.tryPromise({
        try: () => TenantRepository.findByCode(code),
        catch: (e) => new DatabaseError({ message: 'Failed to find tenant params', operation: 'query' })
    })

/**
 * Get tenant by slug
 */
export const getTenantBySlug = (slug: string) =>
    Effect.tryPromise({
        try: () => TenantRepository.findBySlug(slug),
        catch: (e) => new DatabaseError({ message: 'Failed to find tenant by slug', operation: 'query' })
    })

// =============================================================================
// COMMAND FUNCTIONS (Write Operations)
// =============================================================================

/**
 * Create a new tenant
 */
export const createTenant = (
    input: CreateTenantInput
): Effect.Effect<Tenant, DatabaseError | ValidationError> =>
    pipe(
        // Check if code already exists
        Effect.tryPromise({
            try: () => TenantRepository.findByCode(input.code),
            catch: () => new DatabaseError({ message: 'Check failed', operation: 'query' })
        }),
        Effect.flatMap((existing) =>
            existing
                ? Effect.fail(
                    new ValidationError({
                        message: 'Tenant with this code already exists',
                        field: 'code',
                        errors: ['Code must be unique'],
                    })
                )
                : Effect.succeed(undefined)
        ),
        Effect.flatMap(() =>
            Effect.tryPromise({
                try: () => TenantRepository.create({
                    code: input.code,
                    name: input.name,
                    slug: input.slug ?? input.code.toLowerCase(),
                    description: input.description,
                    type: input.type ?? 'banking',
                    bankingMode: input.bankingMode ?? 'conventional',
                    settings: input.settings ?? {},
                    isActive: true,
                }),
                catch: (e) => new DatabaseError({ message: 'Create failed', operation: 'insert' })
            })
        )
    )

/**
 * Update a tenant
 */
export const updateTenant = (
    id: string,
    input: UpdateTenantInput
): Effect.Effect<Tenant, DatabaseError | NotFoundError> =>
    Effect.tryPromise({
        try: () => TenantRepository.update(id, input),
        catch: (e) => new DatabaseError({ message: 'Update failed', operation: 'update' })
    })

/**
 * Delete a tenant (soft delete)
 */
export const deleteTenant = (
    id: string
): Effect.Effect<void, DatabaseError | NotFoundError> =>
    Effect.tryPromise({
        try: async () => { await TenantRepository.delete(id) },
        catch: (e) => new DatabaseError({ message: 'Delete failed', operation: 'delete' })
    })

/**
 * Enable a tenant
 */
export const enableTenant = (id: string) =>
    Effect.tryPromise({
        try: async () => { await TenantRepository.enable(id) },
        catch: (e) => new DatabaseError({ message: 'Enable failed', operation: 'update' })
    })

/**
 * Disable a tenant
 */
export const disableTenant = (id: string) =>
    Effect.tryPromise({
        try: async () => { await TenantRepository.delete(id) }, // Reuse soft delete for disable
        catch: (e) => new DatabaseError({ message: 'Disable failed', operation: 'update' })
    })
