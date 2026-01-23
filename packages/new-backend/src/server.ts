/**
 * Server Initialization
 * Integrates Hono app with Socket.IO, Bull queues, and database
 * Uses Bun's native server with @socket.io/bun-engine
 */

import { Server as Engine } from '@socket.io/bun-engine'
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { app } from './app'
import { env, db, closeDatabase } from './config'
import { initializeNotificationSocket } from './socket/notification.socket'
import { setupQueues, closeQueues } from './queue/bull-setup'
import { setupAllWorkers } from './queue/workers'
import { createWorkflowRepository, createWorkflowEventHandler } from './repositories/workflows.repository'

/**
 * Start the server with all integrations
 */
export async function startServer() {
    console.log('🚀 Starting IFRS9 Backend Server...')

    // ============================================================================
    // 1. DATABASE (already initialized from config)
    // ============================================================================
    console.log('📊 Database connection ready')
    // db is imported from config/database.ts

    // ============================================================================
    // 2. CREATE BUN ENGINE FOR SOCKET.IO
    // ============================================================================
    console.log('🌐 Creating Bun engine...')
    const engine = new Engine()

    // ============================================================================
    // 3. INITIALIZE SOCKET.IO
    // ============================================================================
    console.log('📱 Initializing Socket.IO...')
    const notificationSocket = initializeNotificationSocket(engine)
    console.log('✅ Socket.IO initialized')

    // ============================================================================
    // 4. SETUP BULL QUEUES & WORKERS
    // ============================================================================
    console.log('🔧 Setting up Bull queues...')
    await setupQueues()
    const { approvalWorker, eclWorker } = await setupAllWorkers(db)
    console.log('✅ Bull queues and workers ready')

    // ============================================================================
    // 5. INITIALIZE WORKFLOW REPOSITORIES
    // ============================================================================
    console.log('⚙️  Initializing workflow repositories...')
    const workflowRepo = createWorkflowRepository(db)
    const eventHandler = createWorkflowEventHandler(workflowRepo, db)
    console.log('✅ Workflow system ready')

    // ============================================================================
    // 6. RETURN BUN SERVER CONFIGURATION
    // ============================================================================
    const port = env.PORT || 3001
    const { websocket } = engine.handler()

    console.log('')
    console.log('┌─────────────────────────────────────────────────────────┐')
    console.log('│  ✅ IFRS9 Backend Server Ready                          │')
    console.log('├─────────────────────────────────────────────────────────┤')
    console.log(`│  🌐 HTTP Server:     http://localhost:${port}`)
    console.log(`│  📱 Socket.IO:       ws://localhost:${port}/socket.io`)
    console.log(`│  📚 API Reference:   http://localhost:${port}/reference`)
    console.log(`│  📖 OpenAPI Spec:    http://localhost:${port}/doc`)
    console.log(`│  ❤️  Health Check:    http://localhost:${port}/health`)
    console.log('├─────────────────────────────────────────────────────────┤')
    console.log(`│  Runtime: Bun ${Bun.version}`)
    console.log(`│  Environment: ${env.NODE_ENV}`)
    console.log(`│  Tenant Mode: Multi-tenant`)
    console.log('└─────────────────────────────────────────────────────────┘')
    console.log('')

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
