import { createMiddleware } from 'hono/factory'
import { verifyToken } from '../services/auth.service'
import { AuthRepository } from '../repositories/auth.repository'
import { TenantRepository } from '../repositories/tenant.repository'
import { AuthenticationError, AuthorizationError } from '@lib/errors'
import { Effect, pipe } from 'effect'
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

        // Contextual validation
        const session = await AuthRepository.findSessionByTokenId(payload.jti)

        if (!session || !session.isActive || new Date() > session.expiresAt) {
            console.warn(`⚠️ [AUTH] Session invalid or expired: ${payload.jti}`);
            throw new Error('Session invalid or expired')
        }

        // Load complete user context
        const user = await AuthRepository.findUserById(payload.sub)
        if (!user || !user.isActive) {
            console.warn(`⚠️ [AUTH] User not found or inactive: ${payload.sub}`);
            throw new Error('User not found or inactive')
        }

        const tenant = await TenantRepository.findById(user.tenantId)
        console.log(`✅ [AUTH] User context loaded: ${user.email} (Tenant: ${tenant?.name})`);

        // Set user context
        c.set('userId', user.id)
        c.set('user', user)
        c.set('tokenId', payload.jti)
        c.set('tenantId', user.tenantId)
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

    // Default case: No switching requested
    if (!requestedTenantId && !requestedTenantSlug) {
        await next()
        return
    }

    // Switching requested
    // Check if effective tenant changes (need to resolve slug first if used)
    let targetTenantId = requestedTenantId

    if (requestedTenantSlug) {
        // Resolve slug to ID
        const targetTenant = await TenantRepository.findBySlug(requestedTenantSlug)
        if (targetTenant) {
            targetTenantId = targetTenant.id
        } else if (!requestedTenantId) {
            // Slug provided but not found, and no ID fallback
            return c.json({ success: false, error: 'Target tenant slug not found', code: 'TENANT_NOT_FOUND' }, 404)
        }
    }

    if (targetTenantId && targetTenantId !== userTenantId) {
        if (isPlatformAdmin) {
            // Validate target tenant exists (if we haven't already from slug fetch)
            // If we resolved by slug, we know it exists. If passed by ID, verify.
            if (!requestedTenantSlug) {
                const targetTenant = await TenantRepository.findById(targetTenantId)
                if (!targetTenant) {
                    return c.json({ success: false, error: 'Target tenant not found', code: 'TENANT_NOT_FOUND' }, 404)
                }
            }

            // Switch context
            c.set('tenantId', targetTenantId)
            console.log(`🔄 [TENANT] Impersonating tenant: ${targetTenantId}`)
        } else {
            console.warn(`🛑 [TENANT] Unauthorized impersonation attempt by user ${c.get('userId')}`)
            return c.json(
                {
                    success: false,
                    error: 'Access denied to target tenant',
                    code: 'TENANT_ACCESS_DENIED',
                },
                403
            )
        }
    }

    await next()
})
