import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { Effect, pipe } from 'effect'
import type { AppContext } from '../app'
import { authMiddleware } from '../middleware'
import { runEffect } from '../lib/effect'
import { sendListResponse, parsePaginationParams, parseFilterParams } from '../lib/react-admin'
import * as tenantsService from '../services/tenants.service'

export const tenantsRoutes = new Hono<AppContext>()

// Apply auth middleware
tenantsRoutes.use('*', authMiddleware)

/**
 * Middleware to check if user is platform admin
 */
const requirePlatformAdmin = async (c: any, next: any) => {
    const isPlatformAdmin = c.get('isSystemUser')
    if (!isPlatformAdmin) {
        return c.json({ success: false, error: 'Unauthorized: Platform Admin access required' }, 403)
    }
    await next()
}

// =============================================================================
// SCHEMA DEFINITIONS
// =============================================================================

const createTenantSchema = z.object({
    code: z.string().min(2).max(50),
    name: z.string().min(2).max(255),
    slug: z.string().min(2).max(100).optional(),
    description: z.string().optional(),
    type: z.enum(['banking', 'fintech', 'insurance']).optional(),
    bankingMode: z.enum(['conventional', 'syariah', 'dual']).optional(),
    settings: z.record(z.unknown()).optional(),
})

const updateTenantSchema = z.object({
    name: z.string().min(2).max(255).optional(),
    description: z.string().optional(),
    bankingMode: z.enum(['conventional', 'syariah', 'dual']).optional(),
    settings: z.record(z.unknown()).optional(),
    isActive: z.boolean().optional(),
})

// =============================================================================
// ROUTES
// =============================================================================

/**
 * GET /tenants - List all tenants (react-admin compatible)
 * Restricted to Platform Admins
 */
tenantsRoutes.get('/', requirePlatformAdmin, async (c) => {
    const pagination = parsePaginationParams(c)
    const filters = parseFilterParams(c)

    // Platform admins can request system tenant
    const includeSystem = filters.includeSystem === 'true' || c.req.query('mode') === 'admin'

    const effect = tenantsService.getTenants({
        pagination,
        search: filters.q as string | undefined,
        bankingMode: filters.bankingMode as string | undefined,
        includeInactive: filters.includeInactive === 'true',
        includeSystem
    })

    const result = await Effect.runPromise(effect)
    return sendListResponse(c, result.data, result.total, pagination)
})

/**
 * POST /tenants - Create a new tenant
 * Restricted to Platform Admins
 */
tenantsRoutes.post('/', requirePlatformAdmin, zValidator('json', createTenantSchema), async (c) => {
    const body = c.req.valid('json')

    const effect = pipe(
        tenantsService.createTenant(body),
        Effect.map((tenant) => ({
            success: true,
            data: tenant,
        }))
    )

    return runEffect(c, effect)
})

/**
 * GET /tenants/current - Get current tenant context
 */
tenantsRoutes.get('/current', async (c) => {
    const tenantId = c.get('tenantId')
    if (!tenantId) {
        return c.json({ success: false, error: 'No tenant context' }, 400)
    }

    const effect = tenantsService.getTenantById(tenantId)

    return runEffect(c, effect)
})

/**
 * GET /tenants/slug/:slug - Get tenant by slug
 */
tenantsRoutes.get('/slug/:slug', async (c) => {
    const { slug } = c.req.param()

    const tenant = await Effect.runPromise(tenantsService.getTenantBySlug(slug))
    if (!tenant) {
        return c.json({ success: false, error: 'Tenant not found' }, 404)
    }
    return c.json({ success: true, data: tenant })
})

/**
 * GET /tenants/:id - Get tenant by ID
 */
tenantsRoutes.get('/:id', async (c) => {
    const { id } = c.req.param()

    const effect = tenantsService.getTenantById(id)

    return runEffect(c, effect)
})

/**
 * PUT /tenants/:id - Update tenant
 * Restricted to Platform Admins
 */
tenantsRoutes.put('/:id', requirePlatformAdmin, zValidator('json', updateTenantSchema), async (c) => {
    const { id } = c.req.param()
    const body = c.req.valid('json')

    const effect = tenantsService.updateTenant(id, body)

    return runEffect(c, effect)
})

/**
 * DELETE /tenants/:id - Delete tenant (soft delete)
 * Restricted to Platform Admins
 */
tenantsRoutes.delete('/:id', requirePlatformAdmin, async (c) => {
    const { id } = c.req.param()

    const effect = tenantsService.deleteTenant(id)

    return runEffect(c, effect)
})

/**
 * POST /tenants/:id/enable - Enable tenant
 */
tenantsRoutes.post('/:id/enable', async (c) => {
    const { id } = c.req.param()

    const effect = pipe(
        tenantsService.enableTenant(id),
        Effect.map(() => ({ success: true, message: 'Tenant enabled' }))
    )

    return runEffect(c, effect)
})

/**
 * POST /tenants/:id/disable - Disable tenant
 */
tenantsRoutes.post('/:id/disable', async (c) => {
    const { id } = c.req.param()

    const effect = pipe(
        tenantsService.disableTenant(id),
        Effect.map(() => ({ success: true, message: 'Tenant disabled' }))
    )

    return runEffect(c, effect)
})
