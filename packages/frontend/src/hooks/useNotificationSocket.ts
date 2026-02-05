'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import io, { Socket } from 'socket.io-client'

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

export function useNotificationSocket() {
    const socketRef = useRef<Socket | null>(null)
    const [isConnected, setIsConnected] = useState(false)
    const [notifications, setNotifications] = useState<NotificationPayload[]>([])

    useEffect(() => {
        // Get auth token from localStorage or session
        const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken')

        if (!token) {
            console.warn('No auth token found for Socket.IO connection')
            return
        }

        // Initialize Socket.IO connection
        const socket = io(`${window.location.origin}`, {
            path: '/admin/notifications',
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
            setNotifications((prev) => [notification, ...prev.slice(0, 49)]) // Keep last 50
        })

        return () => {
            socket.disconnect()
        }
    }, [])

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
    }, [])

    /**
     * Clear notifications
     */
    const clearNotifications = useCallback(() => {
        setNotifications([])
    }, [])

    return {
        isConnected,
        notifications,
        subscribeToApproval,
        subscribeToECL,
        acknowledgeNotification,
        clearNotifications,
    }
}

/**
 * Hook to get current notification state from context/store
 */
export function useNotifications() {
    const [notifications, setNotifications] = useState<NotificationPayload[]>([])
    const [unreadCount, setUnreadCount] = useState(0)

    const socket = useNotificationSocket()

    useEffect(() => {
        setNotifications(socket.notifications)
        setUnreadCount(socket.notifications.length)
    }, [socket.notifications])

    return {
        notifications,
        unreadCount,
        isConnected: socket.isConnected,
        subscribeToApproval: socket.subscribeToApproval,
        subscribeToECL: socket.subscribeToECL,
        acknowledgeNotification: socket.acknowledgeNotification,
        clearNotifications: socket.clearNotifications,
    }
}
