import { Server as Engine } from '@socket.io/bun-engine'
import { Server as SocketIOServer, Socket } from 'socket.io'
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import * as schema from '../db/schema'
import { withRequestIds } from '../lib/logger'
import { env } from '../config/env'
import { verifyToken } from '../services/auth.service'
import { NotificationRepository } from '../repositories/notification.repository'
import {
    deriveNotificationCategory,
    filterNotificationRecipientsByPreferences,
    type NotificationCategory,
} from '../services/notifications.service'

/**
 * Socket.IO server for real-time notifications
 * Handles approval workflow updates, ECL calculations, compliance checks
 */

export interface NotificationPayload {
    id: string
    type: 'APPROVAL_PENDING' | 'APPROVAL_APPROVED' | 'APPROVAL_REJECTED' | 'ECL_STARTED' | 'ECL_COMPLETED' | 'ECL_FAILED' | 'COMPLIANCE_ALERT'
    category?: 'approval' | 'workflow' | 'analytics' | 'system'
    workflowId: string
    tenantId: string
    title: string
    message: string
    severity: 'info' | 'warning' | 'success' | 'error'
    timestamp: string
    data?: Record<string, unknown>
    actionUrl?: string
}

const resolveSocketAllowedOrigins = (): string[] => {
    const configured = String(env.CORS_ORIGINS || '')
        .split(',')
        .map((origin) => origin.trim())
        .filter((origin) => origin.length > 0)

    if (env.NODE_ENV === 'development') {
        configured.push('http://localhost:4231', 'http://127.0.0.1:4231')
    }

    return Array.from(new Set(configured))
}

const isSocketOriginAllowed = (origin: string | undefined, allowedOrigins: string[]): boolean => {
    if (!origin) return true
    return allowedOrigins.includes(origin)
}

export class NotificationSocket {
    private io: SocketIOServer
    private connectedAdmins: Map<string, Set<string>> = new Map() // tenantId -> Set of socketIds

    constructor(engine: Engine) {
        const allowedOrigins = resolveSocketAllowedOrigins()
        this.io = new SocketIOServer({
            cors: {
                origin: allowedOrigins,
                credentials: true,
                methods: ['GET', 'POST', 'OPTIONS'],
                allowedHeaders: [
                    'Authorization',
                    'Content-Type',
                    'X-Tenant-ID',
                    'X-Tenant-Slug',
                    'X-Request-Time',
                    'X-Client',
                ],
            },
            allowRequest: (req, callback) => {
                const originHeader = req.headers.origin
                const origin = Array.isArray(originHeader) ? originHeader[0] : originHeader
                const allowed = isSocketOriginAllowed(origin, allowedOrigins)

                if (!allowed) {
                    withRequestIds({}).warn({ origin, allowedOrigins }, 'Socket.IO CORS origin rejected')
                }

                callback(allowed ? null : 'origin not allowed', allowed)
            },
        })
        
        // Bind Socket.IO to Bun engine
        this.io.bind(engine)

        this.setupMiddleware()
        this.setupNamespaces()
    }

    /**
     * Setup authentication middleware
     */
    private setupMiddleware() {
        this.io.use(async (socket, next) => {
            const rawToken = socket.handshake.auth.token || socket.handshake.headers.authorization
            if (!rawToken) {
                return next(new Error('Missing authentication token'))
            }

            const token = String(rawToken).startsWith('Bearer ')
                ? String(rawToken).slice(7).trim()
                : String(rawToken).trim()

            try {
                const decoded = await verifyToken(token, 'access')
                const tokenRoles = Array.isArray(decoded.roles)
                    ? decoded.roles.filter((role): role is string => typeof role === 'string' && role.trim().length > 0)
                    : []
                const permissions = Array.isArray(decoded.permissions)
                    ? decoded.permissions.filter((permission): permission is string => typeof permission === 'string' && permission.trim().length > 0)
                    : []

                const normalizedRoleRooms = new Set(tokenRoles.map((role) => role.trim().toUpperCase()))
                if (permissions.includes('admin.super_admin') || permissions.includes('approval.all')) {
                    normalizedRoleRooms.add('SUPER_ADMIN')
                }

                const userId = typeof decoded.sub === 'string' ? decoded.sub : null
                if (!userId) {
                    return next(new Error('Invalid authentication token'))
                }

                socket.data.userId = userId
                socket.data.tenantId = typeof decoded.tenantId === 'string' ? decoded.tenantId : 'tenant'
                socket.data.roles = Array.from(normalizedRoleRooms)
                socket.data.permissions = permissions

                return next()
            } catch (error) {
                return next(new Error('Invalid authentication token'))
            }
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

            withRequestIds({ tenantId, userId }).info('Admin connected')

            // Track admin connection per tenant
            if (!this.connectedAdmins.has(tenantId)) {
                this.connectedAdmins.set(tenantId, new Set())
            }
            this.connectedAdmins.get(tenantId)?.add(socket.id)

            // Join tenant-specific room
            socket.join(`tenant:${tenantId}`)
            socket.join(`user:${userId}`)

            // Join role-specific rooms if admin/approver
            if (Array.isArray(roles)) {
                roles.forEach((role: string) => {
                    socket.join(`role:${String(role).toUpperCase()}:${tenantId}`)
                })
            }

            // Handle disconnect
            socket.on('disconnect', () => {
                withRequestIds({ tenantId, userId }).info('Admin disconnected')
                const admins = this.connectedAdmins.get(tenantId)
                if (admins) {
                    admins.delete(socket.id)
                }
            })

            // Handle subscription to specific notifications
            socket.on('subscribe:approval', (data) => {
                socket.join(`approval:${data.approvalRequestId}`)
                withRequestIds({ tenantId, userId }).info({ approvalRequestId: data.approvalRequestId }, 'Subscribed to approval updates')
            })

            socket.on('subscribe:ecl', (data) => {
                socket.join(`ecl:${data.workflowId}`)
                withRequestIds({ tenantId, userId }).info({ workflowId: data.workflowId }, 'Subscribed to ECL updates')
            })

            // Handle ACK (read notification)
            socket.on('notification:ack', async (notificationId) => {
                withRequestIds({ tenantId, userId }).info({ notificationId }, 'Notification read')
                if (typeof notificationId !== 'string' || !notificationId.trim()) {
                    return
                }

                try {
                    await NotificationRepository.markAsRead({
                        tenantId,
                        userId,
                        notificationId: notificationId.trim(),
                    })
                } catch (error) {
                    withRequestIds({ tenantId, userId }).warn({ notificationId, error }, 'Failed to mark notification as read')
                }
            })
        })

        withRequestIds({}).info('Socket.IO namespaces configured')
    }

    private normalizeUserIds(userIds: unknown[]): string[] {
        return Array.from(new Set(
            userIds
                .filter((userId): userId is string => typeof userId === 'string' && userId.trim().length > 0)
                .map((userId) => userId.trim())
        ))
    }

    private async getConnectedUserIdsFromRoom(room: string): Promise<string[]> {
        const sockets = await this.io.of('/admin/notifications').in(room).fetchSockets()
        return this.normalizeUserIds(
            sockets.map((socket) => (typeof socket.data?.userId === 'string' ? socket.data.userId : ''))
        )
    }

    private async deliverNotificationWithPreferences(
        tenantId: string,
        notification: NotificationPayload,
        options?: {
            directUserIds?: string[]
            rooms?: string[]
        }
    ): Promise<string[]> {
        const roomUserIds = options?.rooms && options.rooms.length > 0
            ? (
                await Promise.all(options.rooms.map((room) => this.getConnectedUserIdsFromRoom(room)))
            ).flat()
            : []

        const directUserIds = Array.isArray(options?.directUserIds) ? options.directUserIds : []
        const candidateUserIds = this.normalizeUserIds([...directUserIds, ...roomUserIds])
        if (candidateUserIds.length === 0) {
            return []
        }

        const category = (notification.category || deriveNotificationCategory(notification.type)) as NotificationCategory
        const payload: NotificationPayload = {
            ...notification,
            category,
        }

        let filteredUserIds = candidateUserIds
        try {
            filteredUserIds = await filterNotificationRecipientsByPreferences({
                tenantId,
                userIds: candidateUserIds,
                category,
                now: new Date(),
            })
        } catch (error) {
            // Fallback to unfiltered delivery if preference lookup fails.
            withRequestIds({ tenantId }).warn({ error }, 'Failed to filter notifications by user preferences')
        }

        filteredUserIds.forEach((userId) => {
            this.io.of('/admin/notifications').to(`user:${userId}`).emit('notification', payload)
        })

        return filteredUserIds
    }

    /**
     * Broadcast approval notification to admins/approvers
     */
    broadcastApprovalNotification(
        tenantId: string,
        notification: NotificationPayload,
        roles?: string[]
    ) {
        const normalizedRoles = Array.isArray(roles)
            ? Array.from(new Set(
                roles
                    .filter((role): role is string => typeof role === 'string' && role.trim().length > 0)
                    .map((role) => role.trim().toUpperCase())
            ))
            : []

        const rooms = normalizedRoles.length > 0
            ? normalizedRoles.map((role) => `role:${role}:${tenantId}`)
            : [`tenant:${tenantId}`]

        void this.deliverNotificationWithPreferences(tenantId, notification, { rooms })
            .then((targets) => {
                withRequestIds({ tenantId }).info({ rooms, userCount: targets.length }, 'Approval notification broadcast')
            })
            .catch((error) => {
                withRequestIds({ tenantId }).warn({ rooms, error }, 'Approval notification broadcast failed')
            })
    }

    /**
     * Broadcast approval notifications directly to specific users.
     */
    broadcastApprovalNotificationToUsers(
        tenantId: string,
        notification: NotificationPayload,
        userIds: string[]
    ) {
        const targets = Array.from(new Set(userIds.filter((userId) => typeof userId === 'string' && userId.trim().length > 0)))
        void this.deliverNotificationWithPreferences(tenantId, notification, { directUserIds: targets })
            .then((filteredTargets) => {
                withRequestIds({ tenantId }).info({ userCount: filteredTargets.length }, 'Approval notification broadcast to users')
            })
            .catch((error) => {
                withRequestIds({ tenantId }).warn({ userCount: targets.length, error }, 'Approval notification broadcast to users failed')
            })
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
            category: 'analytics',
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

        void this.deliverNotificationWithPreferences(tenantId, notification, {
            rooms: [`ecl:${workflowId}`, `tenant:${tenantId}`],
        })
            .then((targets) => {
                withRequestIds({ tenantId }).info({ workflowId, eventType, userCount: targets.length }, 'ECL event broadcast')
            })
            .catch((error) => {
                withRequestIds({ tenantId }).warn({ workflowId, eventType, error }, 'ECL event broadcast failed')
            })
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
            category: 'workflow',
            workflowId,
            tenantId,
            title: `Workflow Transition: ${fromState} → ${toState}`,
            message: `Workflow state changed to ${toState}`,
            severity: toState === 'REJECTED' ? 'warning' : toState === 'FAILED' ? 'error' : 'info',
            timestamp: new Date().toISOString(),
            data: { fromState, toState, ...data },
            actionUrl: `/approvals/${workflowId}`,
        }

        void this.deliverNotificationWithPreferences(tenantId, notification, {
            rooms: [`approval:${workflowId}`, `tenant:${tenantId}`],
        })
            .then((targets) => {
                withRequestIds({ tenantId }).info({ workflowId, fromState, toState, userCount: targets.length }, 'Workflow transition broadcast')
            })
            .catch((error) => {
                withRequestIds({ tenantId }).warn({ workflowId, fromState, toState, error }, 'Workflow transition broadcast failed')
            })
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
            category: 'system',
            workflowId: '',
            tenantId,
            title: severity === 'error' ? '🚨 Compliance Alert' : '⚠️ Compliance Warning',
            message,
            severity,
            timestamp: new Date().toISOString(),
            data,
        }

        void this.deliverNotificationWithPreferences(tenantId, notification, {
            rooms: [`role:ADMIN:${tenantId}`],
        })
            .then((targets) => {
                withRequestIds({ tenantId }).warn({ severity, message, data, userCount: targets.length }, 'Compliance alert broadcast')
            })
            .catch((error) => {
                withRequestIds({ tenantId }).warn({ severity, message, data, error }, 'Compliance alert broadcast failed')
            })
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
