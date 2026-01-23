/**
 * Example main server setup with Socket.IO + Bull + Workflows
 * This shows how to wire everything together
 */

import { Hono } from 'hono'
import { createServer } from 'http'
import { cors } from 'hono/cors'
import type { Context } from 'hono'
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'

// Import all the pieces
import { initializeNotificationSocket } from './socket/notification.socket'
import { setupQueues, closeQueues } from './queue/bull-setup'
import { setupAllWorkers } from './queue/workers'
import { createWorkflowRepository, createWorkflowEventHandler } from './repositories/workflows.repository'
import { PermissionApprovalService } from './services/permission-approval.service'

/**
 * Main server initialization
 */
export async function createAppServer(db: PostgresJsDatabase<any>, port: number = 3001) {
    // Create Hono app
    const app = new Hono()

    // Middleware
    app.use('*', cors())

    // Create HTTP server using @hono/node-server (needed for Socket.IO)
    const httpServer = createServer((req, res) => {
        ;(async () => {
            const response = await app.fetch(req as any)
            res.statusCode = response.status
            response.headers.forEach((value: string, key: string) => res.setHeader(key, value))
            response.body?.pipeTo(new WritableStream({
                write(chunk) {
                    res.write(chunk)
                }
            }))
        })().catch(err => {
            console.error('Error handling request', err)
            res.statusCode = 500
            res.end('Internal Server Error')
        })
    })

    // ============================================================================
    // INITIALIZE SOCKET.IO
    // ============================================================================
    console.log('📱 Initializing Socket.IO...')
    const notificationSocket = initializeNotificationSocket(httpServer)

    // ============================================================================
    // INITIALIZE BULL QUEUES & WORKERS
    // ============================================================================
    console.log('🔧 Setting up Bull queues...')
    await setupQueues()
    const { approvalWorker, eclWorker } = await setupAllWorkers(db)

    // ============================================================================
    // INITIALIZE WORKFLOW REPOSITORIES
    // ============================================================================
    console.log('⚙️ Initializing workflow repositories...')
    const workflowRepo = createWorkflowRepository(db)
    const eventHandler = createWorkflowEventHandler(workflowRepo, db)

    // ============================================================================
    // SETUP EXAMPLE ROUTES
    // ============================================================================

    // Health check
    app.get('/health', (c: Context) => {
        return c.json({
            status: 'ok',
            socket_io: notificationSocket.getIO().engine.clientsCount > 0 ? 'connected' : 'ready',
            timestamp: new Date().toISOString(),
        })
    })

    // Example: Approval endpoint that triggers workflow + Socket.IO
    app.post('/api/approvals/:approvalId/approve', async (c: Context) => {
        const approvalId = c.req.param('approvalId')
        const { userId, tenantId } = c.req.query() // from auth middleware

        try {
            // Get approval details (mock)
            const approval = {
                id: approvalId,
                tenantId,
                workflowId: 'workflow-' + approvalId,
                workflowName: 'Permission Update Request',
                requestedById: 'user-123',
                requestedByEmail: 'john@example.com',
                requestedByName: 'John Requester',
                approverName: 'Jane Approver',
            }

            // Trigger approval event
            await eventHandler.handleApprovalCompleted(
                approval.workflowId,
                tenantId,
                'APPROVED', // or 'REJECTED'
                userId,
                approval.approverName,
                approval.requestedById,
                approval.requestedByEmail,
                approval.workflowName,
                { /* ECL params if applicable */ }
            )

            // Socket.IO broadcast already triggered by event handler
            // Admin dashboard receives real-time notification

            return c.json({ success: true, approvalId, workflowId: approval.workflowId })
        } catch (err) {
            console.error('Approval error:', err)
            return c.json({ error: 'Approval failed' }, 500)
        }
    })

    // Example: Get workflows for dashboard
    app.get('/api/workflows', async (c: Context) => {
        const { tenantId } = c.req.query() // from auth middleware

        try {
            const workflows = await workflowRepo.getWorkflowsByTenant(tenantId)
            return c.json({ workflows })
        } catch (err) {
            return c.json({ error: 'Failed to fetch workflows' }, 500)
        }
    })

    // Example: Subscribe to workflow updates (used by dashboard)
    app.post('/api/notifications/subscribe/:workflowId', async (c: Context) => {
        const workflowId = c.req.param('workflowId')
        // Client-side Socket.IO already handles subscription
        // This just confirms subscription on server
        return c.json({ subscribed: true, workflowId })
    })

    // ============================================================================
    // GRACEFUL SHUTDOWN
    // ============================================================================
    const server = httpServer.listen(port, () => {
        console.log(`✅ Server running on http://localhost:${port}`)
        console.log(`📱 Socket.IO available at ws://localhost:${port}/admin/notifications`)
        console.log(`🔧 Bull UI available at http://localhost:${port}/admin/queues (if configured)`)
    })

    // Handle graceful shutdown
    process.on('SIGTERM', async () => {
        console.log('🛑 Received SIGTERM, shutting down gracefully...')

        // Close all connections
        await closeQueues()
        notificationSocket.getIO().close()

        server.close(() => {
            console.log('✅ Server shut down')
            process.exit(0)
        })

        // Force shutdown after 30s
        setTimeout(() => {
            console.error('❌ Force shutdown after timeout')
            process.exit(1)
        }, 30000)
    })

    return { app, httpServer, notificationSocket, workflowRepo, eventHandler }
}

/**
 * Example usage in main.ts or index.ts
 */
async function main() {
    // Initialize database connection (replace with your actual DB setup)
    // const db = await initializeDatabase()
    // For now, pass a mock DB instance:
    const db: any = null // TODO: Replace with actual database instance

    // Create and start server
    const { httpServer } = await createAppServer(db, 3001)

    // Server is now running with:
    // - Socket.IO for real-time notifications
    // - Bull queues for async jobs
    // - Workflow state machine
    // - Event handlers triggering on approval/ECL completion
}

// Export for import in other files
export type AppServer = Awaited<ReturnType<typeof createAppServer>>
