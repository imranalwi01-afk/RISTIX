import { Server as Engine } from '@socket.io/bun-engine'
import { Server as SocketIOServer, Socket } from 'socket.io'
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import * as schema from '../db/schema'

/**
 * Socket.IO server for real-time notifications
 * Handles approval workflow updates, ECL calculations, compliance checks
 */

export interface NotificationPayload {
    id: string
    type: 'APPROVAL_PENDING' | 'APPROVAL_APPROVED' | 'APPROVAL_REJECTED' | 'ECL_STARTED' | 'ECL_COMPLETED' | 'ECL_FAILED' | 'COMPLIANCE_ALERT'
    workflowId: string
    tenantId: string
    title: string
    message: string
    severity: 'info' | 'warning' | 'success' | 'error'
    timestamp: string
    data?: Record<string, unknown>
    actionUrl?: string
}

export class NotificationSocket {
    private io: SocketIOServer
    private connectedAdmins: Map<string, Set<string>> = new Map() // tenantId -> Set of socketIds

    constructor(engine: Engine) {
        this.io = new SocketIOServer()
        
        // Bind Socket.IO to Bun engine
        this.io.bind(engine)

        this.setupMiddleware()
        this.setupNamespaces()
    }

    /**
     * Setup authentication middleware
     */
    private setupMiddleware() {
        this.io.use((socket, next) => {
            const token = socket.handshake.auth.token || socket.handshake.headers.authorization

            if (!token) {
                return next(new Error('Missing authentication token'))
            }

            // TODO: Validate JWT token, extract userId, tenantId
            // const decoded = jwt.verify(token, process.env.JWT_SECRET)
            // socket.data.userId = decoded.userId
            // socket.data.tenantId = decoded.tenantId
            // socket.data.roles = decoded.roles

            // For now, mock data
            socket.data.userId = 'admin-user-id'
            socket.data.tenantId = 'tenant-id'
            socket.data.roles = ['ADMIN', 'APPROVER']

            next()
        })
    }

    /**
     * Setup Socket.IO namespaces
     */
    private setupNamespaces() {
        // Admin notifications namespace
        const adminNs = this.io.of('/admin/notifications')

        adminNs.on('connection', (socket: Socket) => {
            const { userId, tenantId, roles } = socket.data

            console.log(`📱 Admin connected: ${userId} (tenant: ${tenantId})`)

            // Track admin connection per tenant
            if (!this.connectedAdmins.has(tenantId)) {
                this.connectedAdmins.set(tenantId, new Set())
            }
            this.connectedAdmins.get(tenantId)?.add(socket.id)

            // Join tenant-specific room
            socket.join(`tenant:${tenantId}`)
            socket.join(`user:${userId}`)

            // Join role-specific rooms if admin/approver
            if (roles.includes('ADMIN')) {
                socket.join(`role:ADMIN:${tenantId}`)
            }
            if (roles.includes('APPROVER')) {
                socket.join(`role:APPROVER:${tenantId}`)
            }

            // Handle disconnect
            socket.on('disconnect', () => {
                console.log(`📴 Admin disconnected: ${userId}`)
                const admins = this.connectedAdmins.get(tenantId)
                if (admins) {
                    admins.delete(socket.id)
                }
            })

            // Handle subscription to specific notifications
            socket.on('subscribe:approval', (data) => {
                socket.join(`approval:${data.approvalRequestId}`)
                console.log(`✅ Subscribed to approval updates: ${data.approvalRequestId}`)
            })

            socket.on('subscribe:ecl', (data) => {
                socket.join(`ecl:${data.workflowId}`)
                console.log(`✅ Subscribed to ECL updates: ${data.workflowId}`)
            })

            // Handle ACK (read notification)
            socket.on('notification:ack', (notificationId) => {
                console.log(`✓ Notification read: ${notificationId}`)
                // TODO: Mark notification as read in DB
            })
        })

        console.log('✅ Socket.IO namespaces configured')
    }

    /**
     * Broadcast approval notification to admins/approvers
     */
    broadcastApprovalNotification(
        tenantId: string,
        notification: NotificationPayload,
        roles?: string[]
    ) {
        const rooms = [`tenant:${tenantId}`]

        if (roles && roles.length > 0) {
            roles.forEach((role) => {
                rooms.push(`role:${role}:${tenantId}`)
            })
        }

        rooms.forEach((room) => {
            this.io.of('/admin/notifications').to(room).emit('notification', notification)
        })

        console.log(`📢 Approval notification broadcast to ${rooms.join(', ')}`)
    }

    /**
     * Broadcast ECL calculation event
     */
    broadcastECLEvent(
        tenantId: string,
        workflowId: string,
        eventType: 'started' | 'progress' | 'completed' | 'failed',
        data: Record<string, unknown>
    ) {
        const notification: NotificationPayload = {
            id: `ecl-${workflowId}-${Date.now()}`,
            type: eventType === 'completed' ? 'ECL_COMPLETED' : eventType === 'failed' ? 'ECL_FAILED' : 'ECL_STARTED',
            workflowId,
            tenantId,
            title: {
                started: '🧮 ECL Calculation Started',
                progress: '⏳ ECL Calculation In Progress',
                completed: '✅ ECL Calculation Completed',
                failed: '❌ ECL Calculation Failed',
            }[eventType],
            message: (data.message as string) || `ECL calculation ${eventType}`,
            severity: eventType === 'failed' ? 'error' : eventType === 'completed' ? 'success' : 'info',
            timestamp: new Date().toISOString(),
            data,
            actionUrl: `/workflows/${workflowId}`,
        }

        this.io.of('/admin/notifications').to(`ecl:${workflowId}`).emit('notification', notification)
        this.io.of('/admin/notifications').to(`tenant:${tenantId}`).emit('notification', notification)

        console.log(`📢 ECL event broadcast: ${eventType}`)
    }

    /**
     * Broadcast workflow state transition
     */
    broadcastWorkflowTransition(
        tenantId: string,
        workflowId: string,
        fromState: string,
        toState: string,
        data?: Record<string, unknown>
    ) {
        const notification: NotificationPayload = {
            id: `workflow-${workflowId}-${Date.now()}`,
            type: toState === 'COMPLETED' ? 'APPROVAL_APPROVED' : toState === 'REJECTED' ? 'APPROVAL_REJECTED' : 'APPROVAL_PENDING',
            workflowId,
            tenantId,
            title: `Workflow Transition: ${fromState} → ${toState}`,
            message: `Workflow state changed to ${toState}`,
            severity: toState === 'REJECTED' ? 'warning' : toState === 'FAILED' ? 'error' : 'info',
            timestamp: new Date().toISOString(),
            data: { fromState, toState, ...data },
            actionUrl: `/approvals/${workflowId}`,
        }

        this.io.of('/admin/notifications').to(`tenant:${tenantId}`).emit('notification', notification)
        this.io.of('/admin/notifications').to(`approval:${workflowId}`).emit('notification', notification)

        console.log(`📢 Workflow transition broadcast: ${fromState} → ${toState}`)
    }

    /**
     * Broadcast compliance alert
     */
    broadcastComplianceAlert(
        tenantId: string,
        severity: 'warning' | 'error',
        message: string,
        data?: Record<string, unknown>
    ) {
        const notification: NotificationPayload = {
            id: `compliance-${Date.now()}`,
            type: 'COMPLIANCE_ALERT',
            workflowId: '',
            tenantId,
            title: severity === 'error' ? '🚨 Compliance Alert' : '⚠️ Compliance Warning',
            message,
            severity,
            timestamp: new Date().toISOString(),
            data,
        }

        this.io.of('/admin/notifications').to(`role:ADMIN:${tenantId}`).emit('notification', notification)

        console.log(`📢 Compliance alert broadcast: ${severity}`)
    }

    /**
     * Get connected admins count for a tenant
     */
    getConnectedAdminsCount(tenantId: string): number {
        return this.connectedAdmins.get(tenantId)?.size || 0
    }

    /**
     * Get Socket.IO instance
     */
    getIO(): SocketIOServer {
        return this.io
    }
}

/**
 * Singleton instance
 */
let notificationSocket: NotificationSocket

export function initializeNotificationSocket(engine: Engine): NotificationSocket {
    notificationSocket = new NotificationSocket(engine)
    return notificationSocket
}

export function getNotificationSocket(): NotificationSocket {
    if (!notificationSocket) {
        throw new Error('Notification socket not initialized. Call initializeNotificationSocket first.')
    }
    return notificationSocket
}
