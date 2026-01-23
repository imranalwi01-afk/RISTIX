/**
 * Server Initialization
 * Integrates Hono app with Socket.IO, Bull queues, and database
 */

import { createServer } from 'http'
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
    // 2. CREATE HTTP SERVER (needed for Socket.IO)
    // ============================================================================
    console.log('🌐 Creating HTTP server...')
    const httpServer = createServer(async (req, res) => {
        // Bridge Node.js HTTP to Hono's fetch API
        const response = await app.fetch(req as any)
        
        res.statusCode = response.status
        response.headers.forEach((value: string, key: string) => {
            res.setHeader(key, value)
        })
        
        if (response.body) {
            response.body.pipeTo(
                new WritableStream({
                    write(chunk) {
                        res.write(chunk)
                    },
                    close() {
                        res.end()
                    },
                })
            )
        } else {
            res.end()
        }
    })

    // ============================================================================
    // 3. INITIALIZE SOCKET.IO
    // ============================================================================
    console.log('📱 Initializing Socket.IO...')
    const notificationSocket = initializeNotificationSocket(httpServer)
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
    // 6. START HTTP SERVER
    // ============================================================================
    const port = env.PORT || 3001

    httpServer.listen(port, () => {
        console.log('')
        console.log('┌─────────────────────────────────────────────────────────┐')
        console.log('│  ✅ IFRS9 Backend Server Running                        │')
        console.log('├─────────────────────────────────────────────────────────┤')
        console.log(`│  🌐 HTTP Server:     http://localhost:${port}`)
        console.log(`│  📱 Socket.IO:       ws://localhost:${port}/admin/notifications`)
        console.log(`│  📚 API Reference:   http://localhost:${port}/reference`)
        console.log(`│  📖 OpenAPI Spec:    http://localhost:${port}/doc`)
        console.log(`│  ❤️  Health Check:    http://localhost:${port}/health`)
        console.log('├─────────────────────────────────────────────────────────┤')
        console.log(`│  Runtime: Bun ${Bun.version}`)
        console.log(`│  Environment: ${env.NODE_ENV}`)
        console.log(`│  Tenant Mode: Multi-tenant`)
        console.log('└─────────────────────────────────────────────────────────┘')
        console.log('')
    })

    // ============================================================================
    // 7. GRACEFUL SHUTDOWN
    // ============================================================================
    const shutdown = async (signal: string) => {
        console.log(`\n🛑 Received ${signal}, shutting down gracefully...`)

        // Stop accepting new connections
        httpServer.close(() => {
            console.log('✅ HTTP server closed')
        })

        try {
            // Close Bull queues
            console.log('🔧 Closing Bull queues...')
            await closeQueues()
            console.log('✅ Bull queues closed')

            // Close Socket.IO
            console.log('📱 Closing Socket.IO...')
            notificationSocket.getIO().close()
            console.log('✅ Socket.IO closed')

            // Close workers
            console.log('👷 Closing workers...')
            await approvalWorker.close()
            await eclWorker.close()
            console.log('✅ Workers closed')

            // Close database
            console.log('📊 Closing database...')
            await closeDatabase()
            console.log('✅ Database closed')

            console.log('✅ Graceful shutdown complete')
            process.exit(0)
        } catch (error) {
            console.error('❌ Error during shutdown:', error)
            process.exit(1)
        }
    }

    // Handle shutdown signals
    process.on('SIGTERM', () => shutdown('SIGTERM'))
    process.on('SIGINT', () => shutdown('SIGINT'))

    // Handle uncaught errors
    process.on('uncaughtException', (error) => {
        console.error('❌ Uncaught Exception:', error)
        shutdown('UNCAUGHT_EXCEPTION')
    })

    process.on('unhandledRejection', (reason, promise) => {
        console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason)
        shutdown('UNHANDLED_REJECTION')
    })

    return {
        app,
        httpServer,
        notificationSocket,
        workflowRepo,
        eventHandler,
        db,
    }
}

// ============================================================================
// AUTO-START (if running this file directly)
// ============================================================================
if (import.meta.main) {
    startServer().catch((error) => {
        console.error('❌ Failed to start server:', error)
        process.exit(1)
    })
}
