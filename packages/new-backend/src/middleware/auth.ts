import { createMiddleware } from 'hono/factory'
import { verifyToken } from '../services/auth.service'
import { AuthRepository } from '../repositories/auth.repository'
import { TenantRepository } from '../repositories/tenant.repository'
import { AuthenticationError, AuthorizationError } from '@lib/errors'
import { Effect, pipe } from 'effect'
import { getDatabase } from '@/config/database'
import { redis } from '@/config/redis'
import type { AppContext } from '../app'

/**
 * JWT verification middleware
 * Extracts and validates JWT token from Authorization header
 */
export const authMiddleware = createMiddleware<AppContext>(async (c, next) => {
    const authHeader = c.req.header('Authorization')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.warn('⚠️ [AUTH] Missing or invalid authorization header:', {
            authHeader: authHeader ? `${authHeader.substring(0, 15)}...` : 'null'
        });
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
        console.log(`✅ [AUTH] Token verified for sub: ${payload.sub}, jti: ${payload.jti}`);

        // Check session in Redis
        const sessionData = await redis.get(`session:access:${payload.jti}`)
        if (!sessionData) {
            console.warn(`⚠️ [AUTH] Session not found in Redis: ${payload.jti}`);
            throw new Error('Session not found or expired')
        }

        // Contextual validation
        const tenantId = (payload as any).tenantId as string | undefined
        const db = getDatabase(tenantId)

        // Load complete user context
        const user = await AuthRepository.findUserById(db, payload.sub)
        if (!user || !user.isActive) {
            console.warn(`⚠️ [AUTH] User not found or inactive: ${payload.sub}`);
            throw new Error('User not found or inactive')
        }


        // Resolve tenant - user.tenantId might be UUID or slug depending on data migration state
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
        const tenant = uuidRegex.test(user.tenantId)
            ? await TenantRepository.findById(user.tenantId)
            : await TenantRepository.findBySlug(user.tenantId)

        if (!tenant) {
            console.warn(`⚠️ [AUTH] Tenant not found for user: ${user.email}, tenantId: ${user.tenantId}`);
            throw new Error('Tenant not found')
        }

        console.log(`✅ [AUTH] User context loaded: ${user.email} (Tenant: ${tenant.name})`);

        // Set user context - ALWAYS use the resolved UUID from tenant object
        c.set('userId', user.id)
        c.set('user', user)
        c.set('tokenId', payload.jti)
        c.set('tenantId', tenant.id) // Use resolved UUID, not user.tenantId which might be a slug
        c.set('isSystemUser', !!user.isPlatformAdmin) // Use the flag

        await next()
    } catch (error: any) {
        console.error('❌ [AUTH] authentication error:', error.message);
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
    const requestedTenantId = c.req.header('X-Tenant-ID')
    const requestedTenantSlug = c.req.header('X-Tenant-Slug')

    const userTenantId = c.get('tenantId') // This is currently the user's home tenant ID
    const isPlatformAdmin = c.get('isSystemUser') // This is now user.isPlatformAdmin

    console.log(`[TENANT] requestedTenantId=${requestedTenantId}, requestedTenantSlug=${requestedTenantSlug}, userTenantId=${userTenantId}, isPlatformAdmin=${isPlatformAdmin}`);

    // Default case: No switching requested
    if (!requestedTenantId && !requestedTenantSlug) {
        console.log(`[TENANT] No tenant switch requested, passing through`);
        await next()
        return
    }

    console.log(`[TENANT] Tenant switch requested!`);

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
            console.log(`🔄 [TENANT] Impersonating tenant: ${targetTenantId}`)
        } else {
            console.warn(`🛑 [TENANT] Unauthorized impersonation attempt by user ${c.get('userId')} (user tenant: ${userTenantId}, requested: ${targetTenantId})`)
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
        console.log(`[TENANT] Same tenant request, passing through`)
    }

    await next()
})
