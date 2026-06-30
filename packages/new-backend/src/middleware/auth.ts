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
import { buildErrorResponse } from '../lib/http/error-response'

type RoutePermissionRule = {
    prefix: string
    base?: string
    fixed?: string[]
}

const ROUTE_PERMISSION_RULES: RoutePermissionRule[] = [
    { prefix: '/api/v1/banking/setup/application', base: 'banking.setup.application' },
    { prefix: '/api/v1/banking/setup/business', base: 'banking.setup.business' },
    { prefix: '/api/v1/banking/business-settings', base: 'banking.setup.business' },

    { prefix: '/api/v1/banking/parameters/product', base: 'banking.parameter.product' },
    { prefix: '/api/v1/banking/parameters/journal', base: 'banking.parameter.journal' },
    { prefix: '/api/v1/banking/parameters/app-settings', base: 'banking.setup.application' },
    { prefix: '/api/v1/banking/parameters/segmentation', base: 'banking.parameter.segmentation' },
    { prefix: '/api/v1/banking/parameters/population-segments', base: 'banking.parameter.segmentation' },
    { prefix: '/api/v1/banking/parameters/product-segments', base: 'banking.parameter.segmentation' },
    { prefix: '/api/v1/banking/parameters', base: 'banking.parameter' },

    { prefix: '/api/v1/banking/collective/rule-base', base: 'banking.collective.rule_base' },
    { prefix: '/api/v1/banking/collective/bucket', base: 'banking.collective.bucket' },
    { prefix: '/api/v1/banking/collective/pd-configurations', base: 'banking.collective.pd' },
    { prefix: '/api/v1/banking/collective/lgd-configurations', base: 'banking.collective.lgd' },
    { prefix: '/api/v1/banking/collective/ead-configurations', base: 'banking.collective.ead' },
    { prefix: '/api/v1/banking/collective/ecl-config', base: 'banking.collective.ecl' },
        { prefix: '/api/v1/banking/collective', base: 'banking.collective' },
    { prefix: '/api/v1/banking/individual', base: 'banking.individual' },
    { prefix: '/api/v1/banking/ifrs9', base: 'banking.processing' },
    { prefix: '/api/v1/banking/dashboard', base: 'banking.dashboard' },
    { prefix: '/api/v1/banking', base: 'banking.processing' },

    { prefix: '/api/v1/ifrs9/reports/debug-config', fixed: ['admin.system.manage', 'admin.maintenance.access', 'admin.super_admin'] },
    { prefix: '/api/v1/reports/debug-config', fixed: ['admin.system.manage', 'admin.maintenance.access', 'admin.super_admin'] },
    { prefix: '/api/v1/ifrs9/reports', base: 'banking.reports.ifrs9' },
    { prefix: '/api/v1/reports', base: 'banking.reports.ifrs9' },
    { prefix: '/api/v1/ifrs9', base: 'banking.processing' },
    { prefix: '/api/v1/r-analytics', base: 'banking.analytics.r' },

    { prefix: '/api/v1/users/profile' },
    { prefix: '/api/v1/users', base: 'admin.users' },
    { prefix: '/api/v1/user', fixed: [] }, // We will implement authorization inside the /user routes
    { prefix: '/api/v1/rbac', base: 'admin.roles' },
    { prefix: '/api/v1/roles', base: 'admin.roles' },
    { prefix: '/api/v1/approvals', fixed: ['approval.requests.approve', 'approval.all'] },
    { prefix: '/api/v1/approval', fixed: ['approval.requests.approve', 'approval.all'] },
    { prefix: '/api/v1/notifications/preferences', fixed: ['notifications.preferences.manage', 'notifications.manage', 'notifications.view', 'banking.processing.view', 'admin.super_admin', 'approval.all'] },
    { prefix: '/api/v1/notifications/read-status', fixed: ['notifications.manage', 'notifications.view', 'banking.processing.view', 'approval.requests.approve', 'approval.all', 'admin.super_admin'] },
    { prefix: '/api/v1/notifications', fixed: ['notifications.view', 'notifications.manage', 'banking.processing.view', 'approval.requests.approve', 'approval.all', 'admin.super_admin'] },
    { prefix: '/api/v1/workflow', fixed: ['approval.requests.approve', 'approval.all'] },
    { prefix: '/api/v1/forms', base: 'admin.system' },
    { prefix: '/api/v1/security', base: 'admin.system' },
    { prefix: '/api/v1/security-config', base: 'admin.system' },
    { prefix: '/api/v1/portfolio-management', base: 'banking.portfolio' },
    { prefix: '/api/v1/banking-resource', base: 'banking.processing' },
    { prefix: '/api/v1/user-activity', base: 'admin.system' },
    { prefix: '/api/v1/user-registration', base: 'admin.users' },

    { prefix: '/api/v1/audit', base: 'admin.system' },
    // Jobs route does action-level authorization inside handlers (jobs.view/jobs.run/jobs.approve/etc.).
    { prefix: '/api/v1/jobs' },
    { prefix: '/api/v1/platform-admin', base: 'admin.system' },
    { prefix: '/api/v1/platform-users', base: 'admin.system' },
    { prefix: '/api/v1/tenants/current' },
    { prefix: '/api/v1/tenants', base: 'admin.system' },
    { prefix: '/api/v1/consultants', base: 'admin.system' },
    { prefix: '/api/v1/admin-dashboard', base: 'admin.system' },
    { prefix: '/api/v1/tenant-registry', base: 'admin.system' },
    { prefix: '/api/v1/platform-infrastructure', base: 'admin.system' },
]

const routePermissionRules = [...ROUTE_PERMISSION_RULES].sort(
    (a, b) => b.prefix.length - a.prefix.length
)

const toPermissionAction = (method: string): 'view' | 'create' | 'update' | 'delete' => {
    switch (method.toUpperCase()) {
        case 'POST':
            return 'create'
        case 'PUT':
        case 'PATCH':
            return 'update'
        case 'DELETE':
            return 'delete'
        case 'GET':
        default:
            return 'view'
    }
}

const normalizePermissions = (permissions: string[]): string[] =>
    Array.from(new Set(permissions))

const getRequiredPermissionCandidates = (path: string, method: string): string[] => {
    const matchedRule = routePermissionRules.find(
        (rule) => path === rule.prefix || path.startsWith(`${rule.prefix}/`)
    )
    if (!matchedRule) return []

    if (matchedRule.fixed && matchedRule.fixed.length > 0) {
        return matchedRule.fixed
    }

    if (!matchedRule.base) return []

    const action = toPermissionAction(method)
    const candidates = new Set<string>([
        `${matchedRule.base}.${action}`,
        `${matchedRule.base}.manage`,
        `${matchedRule.base}.access`,
        matchedRule.base,
    ])

    return Array.from(candidates)
}

const hasAnyPermission = (permissions: string[], candidates: string[]): boolean => {
    if (permissions.includes('admin.super_admin')) return true
    if (permissions.includes('*')) return true
    return candidates.some((candidate) => permissions.includes(candidate))
}

/**
 * JWT verification middleware
 * Extracts and validates JWT token from Authorization header
 */
export const authMiddleware = createMiddleware<AppContext>(async (c, next) => {
    const baseLogger = c.get('logger') || withRequestIds({ requestId: c.get('requestId'), tenantId: c.get('tenantId') })
    const authHeader = c.req.header('Authorization')
    let authStage: 'header' | 'token' | 'session' | 'user' | 'tenant' = 'header'
    let payloadTenantId: string | undefined

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        baseLogger.warn({
            authHeader: authHeader ? `${authHeader.substring(0, 15)}...` : 'null'
        }, '[AUTH] Missing or invalid authorization header')
        return c.json(
            buildErrorResponse(c, {
                error: 'Missing or invalid authorization header',
                message: 'Missing or invalid authorization header',
                code: 'UNAUTHENTICATED',
            }),
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
        c.set('permissions', ['*'])
        c.set('userPermissions', ['*'])

        await next()
        return
    }

    try {
        authStage = 'token'
        // Verify JWT signature
        const payload = await verifyToken(token, 'access')
        baseLogger.info({ sub: payload.sub, jti: payload.jti }, '[AUTH] Token verified')

        payloadTenantId = (payload as any).tenantId as string | undefined

        // Check session in Redis
        authStage = 'session'
        const sessionKey = `session:access:${payload.jti}`
        const sessionData = await redis.get(sessionKey)
        if (!sessionData) {
            console.warn(`[AUTH DEBUG] Session not found in Redis: ${sessionKey}`)
            baseLogger.warn({ jti: payload.jti, sessionKey }, '[AUTH] Session not found in Redis')
            return c.json(
                buildErrorResponse(c, {
                    error: 'Session not found or expired',
                    message: 'Session not found or expired',
                    code: 'SESSION_EXPIRED',
                }),
                401
            )
        }

        // Contextual validation
        const tenantId = payloadTenantId
        const stakeholderType = (payload as any).stakeholderType as string | undefined
        const isPlatformSession = !tenantId || stakeholderType === 'platform'
        authStage = 'user'

        console.log(`[AUTH DEBUG] Resolving user: sub=${payload.sub}, tenantId=${tenantId}, stakeholderType=${stakeholderType}`)

        let user: any = null
        let db = getDatabase(isPlatformSession ? null : tenantId)
        let dbContext: 'Tenant DB' | 'Platform DB' = isPlatformSession ? 'Platform DB' : 'Tenant DB'

        if (isPlatformSession) {
            // Platform session must resolve against platform_admin.users.
            user = await AuthRepository.findPlatformUserById(db, payload.sub)
        } else {
            // Tenant/banking session resolves against tenant core.users first.
            user = await AuthRepository.findUserById(db, payload.sub)
            if (!user) {
                // Compatibility fallback for tokens that might reference platform users.
                baseLogger.debug({ sub: payload.sub, tenantId }, '[AUTH] User not found in tenant DB, checking platform DB...')
                const platformDb = getDatabase(null)
                user = await AuthRepository.findPlatformUserById(platformDb, payload.sub)
                if (user) {
                    db = platformDb
                    dbContext = 'Platform DB'
                    baseLogger.debug({ sub: payload.sub }, '[AUTH] User found in platform DB')
                }
            }
        }

        if (!user || !user.isActive) {
            const dbUrl = maskDatabaseUrl(getDatabaseUrl(dbContext === 'Tenant DB' ? tenantId : null))
            
            baseLogger.warn({ sub: payload.sub, dbContext, dbUrl }, '[AUTH] User not found or inactive')
            
            const errorMsg = isDevelopment
                ? `User not found or inactive (${dbContext}: ${dbUrl})`
                : 'User not found or inactive'
            throw new Error(errorMsg)
        }


        // Resolve tenant only for tenant-scoped sessions
        authStage = 'tenant'
        let tenant: any = null
        if (!isPlatformSession) {
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
        } else {
            baseLogger.info({ email: user.email }, '[AUTH] Platform user context loaded')
        }

        // Set user context - load full permissions from Redis session (JWT only carries meta perms)
        let session: any
        try { session = JSON.parse(sessionData) } catch { session = {} }
        const sessionPermissions = Array.isArray(session?.permissions)
            ? session.permissions.filter((p: unknown): p is string => typeof p === 'string')
            : []
        const sessionRoles = Array.isArray(session?.roles)
            ? session.roles.filter((r: unknown): r is string => typeof r === 'string')
            : []
            
        const payloadPermissions = Array.isArray((payload as any).permissions)
            ? ((payload as any).permissions as unknown[]).filter((permission): permission is string => typeof permission === 'string')
            : []
        const resolvedPermissions = normalizePermissions(
            sessionPermissions.length > 0 ? sessionPermissions : payloadPermissions
        )

        const isSystemUser =
            resolvedPermissions.includes('admin.super_admin') ||
            isPlatformSession ||
            !!(user as any).isPlatformAdmin

        c.set('userId', user.id)
        c.set('user', user)
        c.set('tokenId', payload.jti)
        c.set('tenantId', tenant?.id) // Platform sessions intentionally have no tenant context.
        c.set('isSystemUser', isSystemUser)
        c.set('permissions', resolvedPermissions)
        c.set('userPermissions', resolvedPermissions)
        c.set('roles', sessionRoles)

        const requiredPermissions = getRequiredPermissionCandidates(c.req.path, c.req.method)
        const hasRouteAccess =
            c.get('isSystemUser') ||
            requiredPermissions.length === 0 ||
            hasAnyPermission(resolvedPermissions, requiredPermissions)

        if (!hasRouteAccess) {
            baseLogger.warn(
                {
                    path: c.req.path,
                    method: c.req.method,
                    requiredPermissions,
                    userPermissions: resolvedPermissions,
                },
                '[AUTHZ] Missing required permission for route'
            )
            return c.json(
                buildErrorResponse(c, {
                    error: `Missing required permission for ${c.req.method} ${c.req.path}`,
                    message: `Missing required permission for ${c.req.method} ${c.req.path}`,
                    requiredPermissions,
                    code: 'UNAUTHORIZED',
                }),
                403
            )
        }

        await next()
    } catch (error: any) {
        const includeDbContext = authStage === 'user' || authStage === 'tenant'
        const dbUrl = includeDbContext
            ? maskDatabaseUrl(getDatabaseUrl(payloadTenantId ?? null))
            : undefined
        const message = isDevelopment
            ? includeDbContext
                ? `Invalid or expired token (${error.message}, Database: ${dbUrl})`
                : `Invalid or expired token (${error.message})`
            : 'Invalid or expired token'
            
        baseLogger.error({ err: error, dbUrl, authStage, payloadTenantId }, '[AUTH] authentication error')
        return c.json(
            buildErrorResponse(c, {
                error: message,
                message,
                code: 'INVALID_TOKEN',
            }),
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
            return c.json(buildErrorResponse(c, { error: 'Unauthorized', message: 'Unauthorized', code: 'UNAUTHORIZED' }), 401)
        }

        const { hasPermission } = await import('../services/rbac.service')

        const authorized = await Effect.runPromise(
            hasPermission(user.id, tenantId, resource, action)
        )

        if (!authorized) {
            return c.json(
                buildErrorResponse(c, {
                    error: `Missing required permission: ${resource}:${action}`,
                    message: `Missing required permission: ${resource}:${action}`,
                    code: 'UNAUTHORIZED',
                }),
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
            return c.json(buildErrorResponse(c, { error: 'Target tenant slug not found', message: 'Target tenant slug not found', code: 'TENANT_NOT_FOUND' }), 404)
        }
    }

    // If requestedTenantId looks like a slug (not a UUID), try to resolve it
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (targetTenantId && !uuidRegex.test(targetTenantId)) {
        const targetTenant = await TenantRepository.findBySlug(targetTenantId)
        if (targetTenant) {
            targetTenantId = targetTenant.id
        } else {
            return c.json(buildErrorResponse(c, { error: 'Target tenant not found', message: 'Target tenant not found', code: 'TENANT_NOT_FOUND' }), 404)
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
                    return c.json(buildErrorResponse(c, { error: 'Target tenant not found', message: 'Target tenant not found', code: 'TENANT_NOT_FOUND' }), 404)
                }
            }

            // Switch context
            c.set('tenantId', targetTenantId)
            log.info({ targetTenantId }, '[TENANT] Impersonating tenant')
        } else {
            log.warn({ userId: c.get('userId'), userTenantId, targetTenantId }, '[TENANT] Unauthorized impersonation attempt')
            return c.json(
                buildErrorResponse(c, {
                    error: 'Access denied to target tenant',
                    message: 'Access denied to target tenant',
                    code: 'TENANT_ACCESS_DENIED',
                }),
                403
            )
        }
    } else {
        // Same tenant or no valid target - just pass through
        log.info('[TENANT] Same tenant request, passing through')
    }

    await next()
})
