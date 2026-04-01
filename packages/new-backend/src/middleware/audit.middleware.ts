import type { Context, Next } from 'hono'
import type { AppContext } from '../app'
import { logAuditEvent } from '../services/audit.service'

/**
 * Audit middleware - logs all API requests
 * Should be applied after auth/tenant middleware to capture user context
 */
export const auditMiddleware = async (c: Context<AppContext>, next: Next) => {
    const startTime = Date.now()
    const requestId = crypto.randomUUID()

    // Get request details
    const method = c.req.method
    const path = c.req.path
    const ipAddress = c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown'
    const userAgent = c.req.header('user-agent')
    const requestBody = await captureRequestBody(c)

    try {
        // Execute the request
        await next()

        const duration = Date.now() - startTime
        const statusCode = c.res.status

        // Determine if this request should be audited
        const shouldAudit = shouldAuditRequest(method, path, statusCode)

        if (shouldAudit) {
            const tenantId = c.get('tenantId')
            const userId = c.get('userId')
            const { eventType, action, entityType, entityId } = classifyRequest(method, path)

            // Log successful request
            await logAuditEvent({
                tenantId,
                userId,
                eventType,
                action,
                entityType,
                entityId,
                description: `${method} ${path}`,
                newValues: requestBody ?? undefined,
                ipAddress,
                userAgent,
                metadata: {
                    correlationId: requestId,
                    requestMethod: method,
                    requestPath: path,
                    statusCode,
                    executionTimeMs: duration,
                    riskLevel: getRiskLevel(method, path, statusCode),
                },
            }).catch(err => {
                // Don't throw - audit logging should never break the main flow
                console.error('[Audit Middleware] Failed to log request:', err)
            })
        }
    } catch (error: any) {
        const duration = Date.now() - startTime
        const tenantId = c.get('tenantId')
        const userId = c.get('userId')
        const { eventType, action, entityType, entityId } = classifyRequest(method, path)

        // Log failed request
        await logAuditEvent({
            tenantId,
            userId,
            eventType,
            action: `${action}_failed`,
            entityType,
            entityId,
            description: `${method} ${path} - Error: ${error.message}`,
            newValues: requestBody ?? undefined,
            ipAddress,
            userAgent,
            metadata: {
                correlationId: requestId,
                requestMethod: method,
                requestPath: path,
                executionTimeMs: duration,
                riskLevel: 'high',
                error: error.message,
                stack: error.stack,
            },
        }).catch(err => {
            console.error('[Audit Middleware] Failed to log error:', err)
        })

        // Re-throw the error
        throw error
    }
}

/**
 * Determine if a request should be audited
 * Skip health checks, static assets, etc.
 */
function shouldAuditRequest(method: string, path: string, statusCode: number): boolean {
    // Skip health checks
    if (path === '/health' || path === '/ping') return false

    // Skip static assets
    if (path.startsWith('/static/') || path.startsWith('/assets/')) return false

    // Skip auth and audit endpoints to avoid duplicate or self-referential logs
    if (path.startsWith('/api/v1/auth/')) return false
    if (path.startsWith('/api/v1/audit/')) return false

    // Skip OPTIONS requests (CORS preflight)
    if (method === 'OPTIONS') return false

    // Always audit write operations
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) return true

    // Audit failed requests
    if (statusCode >= 400) return true

    return false
}

/**
 * Extract logical event/action/entity from path
 */
function classifyRequest(method: string, path: string): {
    eventType: string
    action: string
    entityType: string
    entityId?: string
} {
    const parts = path
        .split('/')
        .filter(Boolean)
        .filter(part => !part.match(/^(api|v\d+)$/i))

    const entityId = [...parts].reverse().find(isUuid)
    const semanticParts = parts.filter(part => !isUuid(part))
    const lastPart = semanticParts[semanticParts.length - 1] || 'unknown'
    const actionKeywords = new Set(['approve', 'reject', 'cancel', 'delegate', 'assign', 'export', 'import', 'run', 'execute'])
    const action = actionKeywords.has(lastPart)
        ? lastPart
        : method.toLowerCase()

    const entitySegment = actionKeywords.has(lastPart)
        ? semanticParts[semanticParts.length - 2]
        : semanticParts[semanticParts.length - 1]

    const eventType = resolveEventType(semanticParts)

    return {
        eventType,
        action,
        entityType: entitySegment || 'unknown',
        entityId,
    }
}

/**
 * Determine risk level based on request
 */
function getRiskLevel(method: string, path: string, statusCode: number): 'low' | 'medium' | 'high' | 'critical' {
    // Failed requests are high risk
    if (statusCode >= 400) return 'high'

    // Critical paths
    if (path.includes('/permissions') || path.includes('/roles')) return 'critical'
    if (path.includes('/system') || path.includes('/config')) return 'critical'

    // High risk operations
    if (method === 'DELETE') return 'high'
    if (path.includes('/approval') || path.includes('/jobs')) return 'high'

    // Medium risk operations
    if (['POST', 'PUT', 'PATCH'].includes(method)) return 'medium'

    // Low risk (GET requests)
    return 'low'
}

function resolveEventType(parts: string[]): string {
    if (parts.includes('approvals') || parts.includes('approval')) return 'approval'
    if (parts.includes('roles') || parts.includes('rbac') || parts.includes('permissions')) return 'permission'
    if (parts.includes('jobs')) return 'job'
    if (parts.includes('system') || parts.includes('settings') || parts.includes('config')) return 'system'
    return 'data'
}

function isUuid(value: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}

async function captureRequestBody(c: Context<AppContext>): Promise<Record<string, unknown> | undefined> {
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(c.req.method)) return undefined

    const contentType = c.req.header('content-type') || ''
    if (!contentType.includes('application/json')) return undefined

    try {
        const payload = await c.req.raw.clone().json()
        if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return undefined
        return sanitizeAuditPayload(payload as Record<string, unknown>)
    } catch {
        return undefined
    }
}

function sanitizeAuditPayload(payload: Record<string, unknown>): Record<string, unknown> {
    const SENSITIVE_KEYS = new Set([
        'password',
        'confirmPassword',
        'currentPassword',
        'newPassword',
        'token',
        'accessToken',
        'refreshToken',
        'secret',
    ])

    return Object.fromEntries(
        Object.entries(payload).map(([key, value]) => {
            if (SENSITIVE_KEYS.has(key)) {
                return [key, '[REDACTED]']
            }
            return [key, value]
        })
    )
}
