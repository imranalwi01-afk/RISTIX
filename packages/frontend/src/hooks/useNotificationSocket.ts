'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import io, { Socket } from 'socket.io-client'
import { notificationAPI } from '@/services/api/notification.api'

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
    readAt?: string | null
    deliveryStatus?: string
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

const mapPersistedNotification = (row: any): NotificationPayload => ({
    id: String(row.notificationId || row.id),
    type: String(row.type || 'APPROVAL_PENDING') as NotificationPayload['type'],
    workflowId: String(row.workflowId || ''),
    tenantId: String(row.tenantId || ''),
    title: String(row.title || 'Notification'),
    message: String(row.message || ''),
    severity: (['info', 'warning', 'success', 'error'].includes(String(row.severity))
        ? row.severity
        : 'info') as NotificationPayload['severity'],
    timestamp: String(row.createdAt || new Date().toISOString()),
    data: (row.metadata && typeof row.metadata === 'object' ? row.metadata : undefined) as Record<string, unknown> | undefined,
    actionUrl: row.actionUrl ? String(row.actionUrl) : undefined,
    readAt: row.readAt || null,
    deliveryStatus: row.deliveryStatus ? String(row.deliveryStatus) : undefined,
})

export function useNotificationSocket() {
    const socketRef = useRef<Socket | null>(null)
    const [isConnected, setIsConnected] = useState(false)
    const [notifications, setNotifications] = useState<NotificationPayload[]>([])
    const [unreadCount, setUnreadCount] = useState(0)

    const loadPersistedNotifications = useCallback(async () => {
        try {
            const response = await notificationAPI.list({ limit: 50, offset: 0 })
            const rows = Array.isArray(response?.data) ? response.data : []
            const mapped = rows.map(mapPersistedNotification)
            setNotifications(mapped)
            const unread = Number(response?.meta?.unreadCount)
            setUnreadCount(Number.isFinite(unread) ? unread : mapped.filter((item) => !item.readAt).length)
        } catch (error) {
            console.warn('Failed to load persisted notifications:', error)
        }
    }, [])

    useEffect(() => {
        void loadPersistedNotifications()

        // Get auth token from localStorage or session
        const token =
            localStorage.getItem('auth_token') ||
            sessionStorage.getItem('auth_token') ||
            localStorage.getItem('authToken') ||
            sessionStorage.getItem('authToken')

        if (!token) {
            console.warn('No auth token found for Socket.IO connection')
            return
        }

        // Initialize Socket.IO connection
        const socket = io(`${window.location.origin}/admin/notifications`, {
            auth: { token },
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: 5,
        })

        socketRef.current = socket

        // Connection handlers
        socket.on('connect', () => {
            console.log('📱 Connected to notification socket')
            setIsConnected(true)
        })

        socket.on('disconnect', () => {
            console.log('📴 Disconnected from notification socket')
            setIsConnected(false)
        })

        socket.on('connect_error', (error) => {
            console.error('❌ Socket connection error:', error)
        })

        // Notification listener
        socket.on('notification', (notification: NotificationPayload) => {
            console.log('🔔 Notification received:', notification)
            void loadPersistedNotifications()

            // Keep temporary in-memory entry for immediate UI feedback while DB state refreshes.
            setNotifications((prev) => {
                if (prev.some((item) => item.id === notification.id)) return prev
                return [notification, ...prev].slice(0, 50)
            })
            setUnreadCount((prev) => prev + 1)
        })

        return () => {
            socket.disconnect()
        }
    }, [loadPersistedNotifications])

    /**
     * Subscribe to approval updates
     */
    const subscribeToApproval = useCallback((approvalRequestId: string) => {
        if (socketRef.current) {
            socketRef.current.emit('subscribe:approval', { approvalRequestId })
        }
    }, [])

    /**
     * Subscribe to ECL calculation updates
     */
    const subscribeToECL = useCallback((workflowId: string) => {
        if (socketRef.current) {
            socketRef.current.emit('subscribe:ecl', { workflowId })
        }
    }, [])

    /**
     * Acknowledge notification (mark as read)
     */
    const acknowledgeNotification = useCallback((notificationId: string) => {
        if (socketRef.current) {
            socketRef.current.emit('notification:ack', notificationId)
        }
        if (UUID_PATTERN.test(notificationId)) {
            void notificationAPI.markRead(notificationId)
                .catch((error) => console.warn('Failed to mark notification as read:', error))
        }

        setNotifications((prev) =>
            prev.map((item) =>
                item.id === notificationId
                    ? { ...item, readAt: item.readAt || new Date().toISOString(), deliveryStatus: 'read' }
                    : item
            )
        )
        setUnreadCount((prev) => Math.max(0, prev - 1))
    }, [])

    /**
     * Clear notifications
     */
    const clearNotifications = useCallback(() => {
        void notificationAPI.markAllRead()
            .catch((error) => console.warn('Failed to mark all notifications as read:', error))
        setNotifications((prev) => prev.map((item) => ({ ...item, readAt: item.readAt || new Date().toISOString(), deliveryStatus: 'read' })))
        setUnreadCount(0)
    }, [])

    return {
        isConnected,
        notifications,
        unreadCount,
        subscribeToApproval,
        subscribeToECL,
        acknowledgeNotification,
        clearNotifications,
        refreshNotifications: loadPersistedNotifications,
    }
}

/**
 * Hook to get current notification state from context/store
 */
export function useNotifications() {
    const socket = useNotificationSocket()

    return {
        notifications: socket.notifications,
        unreadCount: socket.unreadCount,
        isConnected: socket.isConnected,
        subscribeToApproval: socket.subscribeToApproval,
        subscribeToECL: socket.subscribeToECL,
        acknowledgeNotification: socket.acknowledgeNotification,
        clearNotifications: socket.clearNotifications,
        refreshNotifications: socket.refreshNotifications,
    }
}
