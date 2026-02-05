/**
 * Server Initialization
 * Integrates Hono app with Socket.IO, Bull queues, and database
 * Uses Bun's native server with @socket.io/bun-engine
 */

import { Server as Engine } from '@socket.io/bun-engine'
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { app } from './app'
import { env, db, closeDatabase } from './config'
import { logger } from './lib/logger'
import { initializeNotificationSocket } from './socket/notification.socket'
import { setupQueues, closeQueues } from './queue/bull-setup'
import { setupAllWorkers } from './queue/workers'
import { createWorkflowRepository, createWorkflowEventHandler } from './repositories/workflows.repository'

/**
 * Start the server with all integrations
 */
export async function startServer() {
    logger.info('Starting IFRS9 Backend Server...')

    // ============================================================================
    // 1. DATABASE (already initialized from config)
    // ============================================================================
    logger.info('Database connection ready')
    // db is imported from config/database.ts

    // ============================================================================
    // 2. CREATE BUN ENGINE FOR SOCKET.IO
    // ============================================================================
    logger.info('Creating Bun engine...')
    const engine = new Engine()

    // ============================================================================
    // 3. INITIALIZE SOCKET.IO
    // ============================================================================
    logger.info('Initializing Socket.IO...')
    const notificationSocket = initializeNotificationSocket(engine)
    logger.info('Socket.IO initialized')

    // ============================================================================
    // 4. CONNECT TO REDIS (required for queues and sessions)
    // ============================================================================
    logger.info('Connecting to Redis...')
    const { redis: sessionRedis } = await import('./config/redis')
    await sessionRedis.connect()
    
    // ============================================================================
    // 5. SETUP BULL QUEUES & WORKERS
    // ============================================================================
    logger.info('Setting up Bull queues...')
    await setupQueues()
    const { approvalWorker, eclWorker } = await setupAllWorkers(db)
    logger.info('Bull queues and workers ready')

    // ============================================================================
    // 6. INITIALIZE WORKFLOW REPOSITORIES
    // ============================================================================
    logger.info('Initializing workflow repositories...')
    const workflowRepo = createWorkflowRepository(db)
    const eventHandler = createWorkflowEventHandler(workflowRepo, db)
    logger.info('Workflow system ready')

    // ============================================================================
    // 7. RETURN BUN SERVER CONFIGURATION
    // ============================================================================
    const port = env.PORT || 3001
    const { websocket } = engine.handler()

    logger.info({
        http: `http://localhost:${port}`,
        socket: `ws://localhost:${port}/socket.io`,
        reference: `http://localhost:${port}/reference`,
        openapi: `http://localhost:${port}/doc`,
        health: `http://localhost:${port}/health`,
        runtime: `Bun ${Bun.version}`,
        environment: env.NODE_ENV,
        tenantMode: 'Multi-tenant',
    }, 'IFRS9 Backend Server Ready')

    // Return Bun server configuration
    return {
        port,
        idleTimeout: 30, // Must be greater than Socket.IO pingInterval (default 25s)

        fetch(req: Request, server: any) {
            const url = new URL(req.url)

            // Route Socket.IO requests to the engine
            if (url.pathname.startsWith('/socket.io/')) {
                return engine.handleRequest(req, server)
            }

            // Route all other requests to Hono app
            return app.fetch(req, server)
        },

        websocket,
    }
}
