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

    // Get user context (if authenticated)
    const userId = c.get('userId')
    const tenantId = c.get('tenantId')
    const user = c.get('user')
    const userEmail = user?.email

    // Get request details
    const method = c.req.method
    const path = c.req.path
    const ipAddress = c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown'
    const userAgent = c.req.header('user-agent')

    try {
        // Execute the request
        await next()

        const duration = Date.now() - startTime
        const statusCode = c.res.status

        // Determine if this request should be audited
        const shouldAudit = shouldAuditRequest(method, path, statusCode)

        if (shouldAudit) {
            // Log successful request
            await logAuditEvent({
                tenantId,
                userId,
                correlationId: requestId,
                eventType: 'api',
                action: `${method.toLowerCase()}_${getResourceFromPath(path)}`,
                description: `${method} ${path}`,
                requestMethod: method,
                requestPath: path,
                ipAddress,
                userAgent,
                executionTimeMs: duration,
                riskLevel: getRiskLevel(method, path, statusCode)
            }).catch(err => {
                // Don't throw - audit logging should never break the main flow
                console.error('[Audit Middleware] Failed to log request:', err)
            })
        }
    } catch (error: any) {
        const duration = Date.now() - startTime

        // Log failed request
        await logAuditEvent({
            tenantId,
            userId,
            correlationId: requestId,
            eventType: 'api',
            action: `${method.toLowerCase()}_${getResourceFromPath(path)}_failed`,
            description: `${method} ${path} - Error: ${error.message}`,
            requestMethod: method,
            requestPath: path,
            ipAddress,
            userAgent,
            executionTimeMs: duration,
            riskLevel: 'high',
            newValues: { error: error.message, stack: error.stack }
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

    // Skip OPTIONS requests (CORS preflight)
    if (method === 'OPTIONS') return false

    // Always audit write operations
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) return true

    // Audit GET requests that return data (2xx status)
    if (method === 'GET' && statusCode >= 200 && statusCode < 300) {
        // Skip list endpoints with no results
        // You can add more specific logic here
        return true
    }

    // Audit failed requests
    if (statusCode >= 400) return true

    return false
}

/**
 * Extract resource name from path
 * e.g., /api/v1/users/123 -> users
 */
function getResourceFromPath(path: string): string {
    const parts = path.split('/').filter(Boolean)

    // Skip 'api', 'v1', etc.
    const resourcePart = parts.find(part =>
        !part.match(/^(api|v\d+)$/i) &&
        !part.match(/^[0-9a-f-]{36}$/i) // Skip UUIDs
    )

    return resourcePart || 'unknown'
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
