import { OpenAPIHono } from '@hono/zod-openapi'
import { Scalar } from '@scalar/hono-api-reference'
import { cors } from 'hono/cors'
import { logger as honoLogger } from 'hono/logger'
import { nanoid } from 'nanoid'
import { logger, withRequestIds } from './lib/logger'
import type { Logger } from './lib/logger'
import { secureHeaders } from 'hono/secure-headers'
import { timing } from 'hono/timing'
import { prettyJSON } from 'hono/pretty-json'
import { env, isProduction } from './config'

// ============================================================================
// GLOBAL POLYFILLS & PATCHES
// ============================================================================

/**
 * Patch BigInt to be serializable by JSON.stringify
 * This prevents "JSON.stringify cannot serialize BigInt" errors
 */
(BigInt.prototype as any).toJSON = function () {
    return this.toString()
}
import { routes } from './routes'
import { businessSettingsRoutes } from './routes/business-settings.routes'
import { auditMiddleware } from './middleware'
import { individualImpairmentV2Routes } from './routes/individual-impairment-v2.routes'
import { initTelemetry } from './lib/telemetry'

// Initialize OpenTelemetry early
initTelemetry()
import { errorHandler } from './middleware/error-handler'
import { platformDb } from './config/database'

import type { User } from './db/schema'
import { buildErrorResponse } from './lib/http/error-response'

/**
 * Application context type
 */
export type AppContext = {
    Variables: {
        requestId?: string
        tenantId?: string
        userId?: string
        tokenId?: string
        permissions?: string[]
        userPermissions?: string[]
        isSystemUser?: boolean
        user?: User
        logger?: Logger
    }
}

/**
 * Create the Hono application
 */
export function createApp() {
    const app = new OpenAPIHono<AppContext>()

    // Attach request/trace IDs and structured logging early
    app.use('*', (c, next) => {
        const requestId = c.req.header('x-request-id') || nanoid()
        const tenantId = c.req.header('x-tenant-id') || c.req.header('x-tenant-slug')
        c.set('requestId', requestId)
        c.set('tenantId', tenantId)

        // Bind a child logger on context for handlers
        const requestLogger = withRequestIds({ requestId, tenantId })
        c.set('logger', requestLogger)

        return next()
    })

    // Lightweight request logging
    app.use('*', async (c, next) => {
        const start = performance.now()
        await next()
        const durationMs = Number((performance.now() - start).toFixed(2))
        const log = c.get('logger') || logger
        log.info(
            {
                method: c.req.method,
                path: c.req.path,
                status: c.res?.status,
                durationMs,
                tenantId: c.get('tenantId'),
                userId: c.get('userId'),
                requestId: c.get('requestId'),
            },
            'request.completed'
        )
    })

    // Global middleware
    app.use(
        '*',
        cors({
            origin: (origin) => {
                const allowedOrigins = env.CORS_ORIGINS.split(',')
                    .map((o) => o.trim().replace(/\/+$/, ''))
                    .filter(Boolean)

                // Always allow local frontend origins for local docker/frontend-dev workflows.
                allowedOrigins.push(
                    'http://127.0.0.1:4231',
                    'http://localhost:4231',
                    'http://[::1]:4231',
                    'http://host.docker.internal:4231'
                )
                const normalizedOrigins = Array.from(new Set(allowedOrigins))
                const normalizedOrigin = origin ? origin.trim().replace(/\/+$/, '') : origin

                // Debug logging only when LOG_LEVEL is 'debug'
                if (env.LOG_LEVEL === 'debug') {
                    logger.debug({
                        origin,
                        normalizedOrigin,
                        allowedOrigins: normalizedOrigins,
                        isAllowed: !!normalizedOrigin && normalizedOrigins.includes(normalizedOrigin),
                    }, 'CORS check')
                }

                // Allow requests with no origin (like mobile apps or curl requests)
                if (!normalizedOrigin) return normalizedOrigins[0]
                if (normalizedOrigins.includes(normalizedOrigin)) return normalizedOrigin
                return null
            },
            credentials: true,
            allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
            allowHeaders: [
                'Content-Type',
                'Authorization',
                'X-Tenant-ID',
                'X-Tenant-Slug',
                'X-Impersonation-Mode',
                'X-Request-Time',
                'X-Client',
                'x-tenant-id',
                'x-tenant-slug',
                'x-impersonation-mode',
                'x-request-time',
                'x-client',
            ],
            maxAge: 86400,
        })
    )

    app.use('*', timing())
    app.use('*', honoLogger())
    app.use(
        '*',
        secureHeaders({
            crossOriginResourcePolicy: 'cross-origin',
            crossOriginOpenerPolicy: 'same-origin-allow-popups',
        })
    )
    app.use('*', prettyJSON())

    // Error handling
    app.onError(errorHandler)

    // Health check endpoint
    app.get('/health', (c) =>
        c.json({
            status: 'ok',
            runtime: 'bun',
            version: '1.0.0',
            timestamp: new Date().toISOString(),
        })
    )

    // Audit all write API requests after downstream auth/tenant middleware resolve user context.
    app.use('/api/v1/*', auditMiddleware)
    app.use('/api/v2/*', auditMiddleware)

    // API routes
    app.route('/api/v2/individual-impairment', individualImpairmentV2Routes)
app.route('/api/v1/banking/business-settings', businessSettingsRoutes) // Explicit mount for business settings
app.route('/api/v1', routes)

    // OpenAPI Specification
    app.doc('/doc', {
        openapi: '3.0.0',
        info: {
            version: '1.0.0',
            title: 'IFRS 9 Islamic Banking Platform API',
            description: 'Multi-tenant backend services for IFRS 9 calculations and compliance.',
        },
        servers: [
            {
                url: isProduction ? 'https://api.your-domain.com' : `http://localhost:${env.PORT}`,
                description: isProduction ? 'Production' : 'Local Development',
            },
        ],
    })

    // Scalar API Reference UI
    app.get(
        '/reference',
        Scalar({
            // @ts-ignore - spec is valid but types might be mismatched
            spec: {
                url: '/doc',
            },
            theme: 'kepler',
            layout: 'modern',
            defaultHttpClient: {
                targetKey: 'node',
                clientKey: 'fetch',
            },
        })
    )

    // 404 handler
    app.notFound((c) =>
        c.json(
            buildErrorResponse(c, {
                error: 'Not Found',
                message: 'Not Found',
                code: 'NOT_FOUND',
                path: c.req.path,
            }),
            404
        )
    )

    return app
}

export const app = createApp()
