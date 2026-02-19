import { createMiddleware } from 'hono/factory'
import { verifyToken } from '../services/auth.service'
import { AuthRepository } from '../repositories/auth.repository'
import { TenantRepository } from '../repositories/tenant.repository'
import { AuthenticationError, AuthorizationError } from '@lib/errors'
import { Effect, pipe } from 'effect'
import { env, isDevelopment, maskDatabaseUrl, getPlatformDatabaseUrl, getDatabaseUrl } from '@/config/env'
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

    // ✅ Handle demo tokens for development
    if (token.startsWith('demo_token_')) {
        console.log('🎭 [AUTH] Using demo token authentication:', token)
        const userRole = token.replace('demo_token_', '')
        
        // Define mock user
        const mockUser = {
            id: '550e8400-e29b-41d4-a716-446655440001', // Standard platform-super-admin ID
            username: 'admin',
            email: 'admin@ifrspro.id',
            fullName: 'Platform Administrator',
            tenantId: 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be',
            isActive: true,
            isPlatformAdmin: userRole === 'PLATFORM_SUPER_ADMIN' || userRole === 'ADMIN',
            role: userRole,
            permissions: ['*'],
            createdAt: new Date(),
            updatedAt: new Date()
        }

        c.set('userId', mockUser.id)
        c.set('user', mockUser as any)
        c.set('tokenId', 'demo-token-jti')
        c.set('tenantId', 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be') 
        c.set('isSystemUser', mockUser.isPlatformAdmin)

        await next()
        return
    }

    try {
        // Verify JWT signature
        const payload = await verifyToken(token)
        baseLogger.info({ sub: payload.sub, jti: payload.jti }, '[AUTH] Token verified')

        // Check session in Redis
        const sessionKey = `session:access:${payload.jti}`
        const sessionData = await redis.get(sessionKey)
        if (!sessionData) {
            console.warn(`[AUTH DEBUG] Session not found in Redis: ${sessionKey}`)
            baseLogger.warn({ jti: payload.jti, sessionKey }, '[AUTH] Session not found in Redis')
            throw new Error('Session not found or expired')
        }

        // Contextual validation
        const tenantId = (payload as any).tenantId as string | undefined
        const tenantDb = getDatabase(tenantId)
        
        console.log(`[AUTH DEBUG] Resolving user: sub=${payload.sub}, tenantId=${tenantId}`)

        // Load complete user context - try tenant DB first, then platform DB as fallback
        let user = await AuthRepository.findUserById(tenantDb, payload.sub)
        let db = tenantDb

        if (!user) {
            baseLogger.debug({ sub: payload.sub, tenantId }, '[AUTH] User not found in tenant DB, checking platform DB...')
            const platformDb = getDatabase(null)
            user = await AuthRepository.findUserById(platformDb, payload.sub)
            if (user) {
                db = platformDb
                baseLogger.debug({ sub: payload.sub }, '[AUTH] User found in platform DB')
            }
        }

        if (!user || !user.isActive) {
            const dbUrl = maskDatabaseUrl(getDatabaseUrl(user ? (db === tenantDb ? tenantId : null) : tenantId))
            const dbContext = db === tenantDb ? 'Tenant DB' : 'Platform DB'
            
            baseLogger.warn({ sub: payload.sub, dbContext, dbUrl }, '[AUTH] User not found or inactive')
            
            const errorMsg = isDevelopment
                ? `User not found or inactive (${dbContext}: ${dbUrl})`
                : 'User not found or inactive'
            throw new Error(errorMsg)
        }


        // Resolve tenant - try ID first, then fallback to Slug
        let tenant = null
        if (user.tenantId) {
            try {
                // First try looking up by ID (UUID)
                tenant = await TenantRepository.findById(user.tenantId)
            } catch (e) {
                // If ID lookup fails (e.g. invalid UUID format), ignore and try slug
                baseLogger.debug({ tenantId: user.tenantId }, '[AUTH] ID lookup failed or invalid format, trying slug')
            }

            // Fallback to slug if not found by ID
            if (!tenant) {
                tenant = await TenantRepository.findBySlug(user.tenantId)
            }
        }

        if (!tenant) {
            const dbUrl = maskDatabaseUrl(getPlatformDatabaseUrl())
            const errorMsg = isDevelopment
                ? `Tenant not found (Target: ${user.tenantId}, Database: ${dbUrl})`
                : 'Tenant not found'
            
            baseLogger.warn({ email: user.email, tenantId: user.tenantId, dbUrl }, '[AUTH] Tenant not found for user')
            throw new Error(errorMsg)
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
        const dbUrl = maskDatabaseUrl(getPlatformDatabaseUrl())
        const message = isDevelopment
            ? `Invalid or expired token (${error.message}, Database: ${dbUrl})`
            : 'Invalid or expired token'
            
        baseLogger.error({ err: error, dbUrl }, '[AUTH] authentication error')
        return c.json(
            {
                success: false,
                error: message,
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
