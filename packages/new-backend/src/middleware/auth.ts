import { createMiddleware } from 'hono/factory'
import { verifyToken } from '../services/auth.service'
import { AuthRepository } from '../repositories/auth.repository'
import { TenantRepository } from '../repositories/tenant.repository'
import { AuthenticationError, AuthorizationError } from '../lib/errors'
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
        c.set('isSystemUser', tenant?.code === 'SYSTEM')

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

/**
 * Tenant context middleware
 * Handles multi-tenancy and Super Admin switching
 */
export const tenantMiddleware = createMiddleware<AppContext>(async (c, next) => {
    const requestedTenantId = c.req.header('X-Tenant-ID')
    const userTenantId = c.get('tenantId') // This is currently the user's home tenant ID
    const isSystemUser = c.get('isSystemUser')

    if (!requestedTenantId) {
        await next()
        return
    }

    if (requestedTenantId !== userTenantId) {
        if (isSystemUser) {
            const targetTenant = await TenantRepository.findById(requestedTenantId)
            if (!targetTenant) {
                return c.json({ success: false, error: 'Target tenant not found', code: 'TENANT_NOT_FOUND' }, 404)
            }
            c.set('tenantId', requestedTenantId)
        } else {
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
