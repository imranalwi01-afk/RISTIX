import { createMiddleware } from 'hono/factory'
import { verifyToken } from '../services/auth.service'
import { AuthRepository } from '../repositories/auth.repository'
import { TenantRepository } from '../repositories/tenant.repository'
import { AuthenticationError, AuthorizationError } from '@lib/errors'
import { Effect, pipe } from 'effect'
import { getDatabase } from '@/config/database'
import { redis } from '@/config/redis'
import type { AppContext } from '../app'
import { withRequestIds } from '../lib/logger'

/**
 * JWT verification middleware
 * Extracts and validates JWT token from Authorization header
 */
export const authMiddleware = createMiddleware<AppContext>(async (c, next) => {
    const baseLogger = c.get('logger') || withRequestIds({ requestId: c.get('requestId'), tenantId: c.get('tenantId') })
    const authHeader = c.req.header('Authorization')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        baseLogger.warn({
            authHeader: authHeader ? `${authHeader.substring(0, 15)}...` : 'null'
        }, '[AUTH] Missing or invalid authorization header')
        return c.json(
            {
                success: false,
                error: 'Missing or invalid authorization header',
                code: 'UNAUTHENTICATED',
            },
            401
        )
    }

    const token = authHeader.substring(7)

    try {
        // Verify JWT signature
        const payload = await verifyToken(token)
        baseLogger.info({ sub: payload.sub, jti: payload.jti }, '[AUTH] Token verified')

        // Check session in Redis
        const sessionData = await redis.get(`session:access:${payload.jti}`)
        if (!sessionData) {
            baseLogger.warn({ jti: payload.jti }, '[AUTH] Session not found in Redis')
            throw new Error('Session not found or expired')
        }

        // Contextual validation
        const tenantId = (payload as any).tenantId as string | undefined
        const db = getDatabase(tenantId)

        // Load complete user context
        const user = await AuthRepository.findUserById(db, payload.sub)
        if (!user || !user.isActive) {
            baseLogger.warn({ sub: payload.sub }, '[AUTH] User not found or inactive')
            throw new Error('User not found or inactive')
        }


        // Resolve tenant - user.tenantId might be UUID or slug depending on data migration state
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
        const tenant = user.tenantId && uuidRegex.test(user.tenantId)
            ? await TenantRepository.findById(user.tenantId)
            : await TenantRepository.findBySlug(user.tenantId || '')

        if (!tenant) {
            baseLogger.warn({ email: user.email, tenantId: user.tenantId }, '[AUTH] Tenant not found for user')
            throw new Error('Tenant not found')
        }

        baseLogger.info({ email: user.email, tenantName: tenant.name }, '[AUTH] User context loaded')

        // Set user context - ALWAYS use the resolved UUID from tenant object
        c.set('userId', user.id)
        c.set('user', user)
        c.set('tokenId', payload.jti)
        c.set('tenantId', tenant.id) // Use resolved UUID, not user.tenantId which might be a slug
        c.set('isSystemUser', !!(user as any).isPlatformAdmin) // Use the flag

        await next()
    } catch (error: any) {
        baseLogger.error({ err: error }, '[AUTH] authentication error')
        return c.json(
            {
                success: false,
                error: 'Invalid or expired token',
                code: 'INVALID_TOKEN',
            },
            401
        )
    }
})

/**
 * Permission check middleware factory
 * Use as: requirePermission('users', 'read')
 */
export function requirePermission(resource: string, action: string) {
    return createMiddleware<AppContext>(async (c, next) => {
        const user = c.get('user')
        const tenantId = c.get('tenantId')
        const isPlatformAdmin = c.get('isSystemUser') // Mapped from user.isPlatformAdmin

        // Platform Admins bypass permission checks
        if (isPlatformAdmin) {
            await next()
            return
        }

        if (!user || !tenantId) {
            return c.json({ success: false, error: 'Unauthorized', code: 'UNAUTHORIZED' }, 401)
        }

        const { hasPermission } = await import('../services/rbac.service')

        const authorized = await Effect.runPromise(
            hasPermission(user.id, tenantId, resource, action)
        )

        if (!authorized) {
            return c.json(
                {
                    success: false,
                    error: `Missing required permission: ${resource}:${action}`,
                    code: 'UNAUTHORIZED',
                },
                403
            )
        }

        await next()
    })
}

// Tenant context middleware
export const tenantMiddleware = createMiddleware<AppContext>(async (c, next) => {
    const log = c.get('logger') || withRequestIds({ requestId: c.get('requestId'), tenantId: c.get('tenantId') })
    const requestedTenantId = c.req.header('X-Tenant-ID')
    const requestedTenantSlug = c.req.header('X-Tenant-Slug')

    const userTenantId = c.get('tenantId') // This is currently the user's home tenant ID
    const isPlatformAdmin = c.get('isSystemUser') // This is now user.isPlatformAdmin

    log.info({ requestedTenantId, requestedTenantSlug, userTenantId, isPlatformAdmin }, '[TENANT] switch check')

    // Default case: No switching requested
    if (!requestedTenantId && !requestedTenantSlug) {
        log.info('[TENANT] No tenant switch requested, passing through')
        await next()
        return
    }

    log.info('[TENANT] Tenant switch requested')

    // Switching requested - resolve to UUID for comparison
    let targetTenantId: string | undefined = requestedTenantId

    // If slug is provided, resolve it to UUID
    if (requestedTenantSlug) {
        const targetTenant = await TenantRepository.findBySlug(requestedTenantSlug)
        if (targetTenant) {
            targetTenantId = targetTenant.id
        } else if (!requestedTenantId) {
            // Slug provided but not found, and no ID fallback
            return c.json({ success: false, error: 'Target tenant slug not found', code: 'TENANT_NOT_FOUND' }, 404)
        }
    }

    // If requestedTenantId looks like a slug (not a UUID), try to resolve it
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (targetTenantId && !uuidRegex.test(targetTenantId)) {
        const targetTenant = await TenantRepository.findBySlug(targetTenantId)
        if (targetTenant) {
            targetTenantId = targetTenant.id
        } else {
            return c.json({ success: false, error: 'Target tenant not found', code: 'TENANT_NOT_FOUND' }, 404)
        }
    }

    // Check if this is actually a tenant switch (comparing UUIDs now)
    if (targetTenantId && targetTenantId !== userTenantId) {
        // User is trying to switch to a different tenant
        if (isPlatformAdmin) {
            // Validate target tenant exists (if we haven't already from slug fetch)
            if (!requestedTenantSlug && uuidRegex.test(requestedTenantId || '')) {
                const targetTenant = await TenantRepository.findById(targetTenantId)
                if (!targetTenant) {
                    return c.json({ success: false, error: 'Target tenant not found', code: 'TENANT_NOT_FOUND' }, 404)
                }
            }

            // Switch context
            c.set('tenantId', targetTenantId)
            log.info({ targetTenantId }, '[TENANT] Impersonating tenant')
        } else {
            log.warn({ userId: c.get('userId'), userTenantId, targetTenantId }, '[TENANT] Unauthorized impersonation attempt')
            return c.json(
                {
                    success: false,
                    error: 'Access denied to target tenant',
                    code: 'TENANT_ACCESS_DENIED',
                },
                403
            )
        }
    } else {
        // Same tenant or no valid target - just pass through
        log.info('[TENANT] Same tenant request, passing through')
    }

    await next()
})
