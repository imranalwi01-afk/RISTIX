'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import io, { Socket } from 'socket.io-client'
import { notificationAPI } from '@/services/api/notification.api'
import { getNotificationCategory } from '@/utils/notification-utils'
import { getErrorMessage } from '@/utils/error-message'

export interface NotificationPayload {
    id: string
    type: 'APPROVAL_PENDING' | 'APPROVAL_APPROVED' | 'APPROVAL_REJECTED' | 'ECL_STARTED' | 'ECL_COMPLETED' | 'ECL_FAILED' | 'COMPLIANCE_ALERT'
    category: 'approval' | 'workflow' | 'analytics' | 'system'
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

const trimTrailingSlashes = (value: string) => value.replace(/\/+$/, '')

const normalizeSocketBaseFromApi = (rawUrl?: string | null): string => {
    if (!rawUrl) return ''

    let normalized = trimTrailingSlashes(String(rawUrl).trim())
    if (!normalized) return ''

    while (/\/api(?:\/v1)?$/i.test(normalized)) {
        normalized = normalized.replace(/\/api(?:\/v1)?$/i, '')
    }

    return normalized
}

const normalizeLocalSocketPort = (rawUrl: string): string => {
    if (typeof window === 'undefined' || !rawUrl) return rawUrl

    try {
        const url = new URL(rawUrl)
        const isLocalHost = url.hostname === 'localhost' || url.hostname === '127.0.0.1'
        if (isLocalHost && url.port === '4231') {
            url.port = '5232'
            return trimTrailingSlashes(url.toString())
        }
    } catch {
        return rawUrl
    }

    return rawUrl
}

const resolveSocketBaseUrl = (): string => {
    const explicitWsUrl = normalizeLocalSocketPort(normalizeSocketBaseFromApi(process.env.NEXT_PUBLIC_WS_URL || ''))
    if (explicitWsUrl) {
        return explicitWsUrl
    }

    const backendBase =
        process.env.NEXT_PUBLIC_BACKEND_URL ||
        process.env.NEXT_PUBLIC_BACKEND_API_URL ||
        process.env.NEXT_PUBLIC_API_BASE_URL ||
        ''

    const normalizedBackend = normalizeLocalSocketPort(normalizeSocketBaseFromApi(backendBase))
    if (normalizedBackend) {
        return normalizedBackend
    }

    if (typeof window !== 'undefined') {
        return normalizeLocalSocketPort(window.location.origin)
    }

    return ''
}

const mapPersistedNotification = (row: any): NotificationPayload => ({
    id: String(row.notificationId || row.id),
    type: String(row.type || 'APPROVAL_PENDING') as NotificationPayload['type'],
    category: (['approval', 'workflow', 'analytics', 'system'].includes(String(row.category || ''))
        ? row.category
        : getNotificationCategory(String(row.type || 'APPROVAL_PENDING'))) as NotificationPayload['category'],
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
    const [isLoading, setIsLoading] = useState(true)
    const [loadError, setLoadError] = useState<string | null>(null)
    const persistedDisabledUntilRef = useRef(0)
    const lastPersistedErrorAtRef = useRef(0)

    const loadPersistedNotifications = useCallback(async (force?: boolean) => {
        const now = Date.now()
        if (!force && persistedDisabledUntilRef.current > now) {
            setIsLoading(false)
            return
        }
        setIsLoading(true)
        setLoadError(null)
        try {
            const response = await notificationAPI.list({ limit: 50, offset: 0 })
            const rows = Array.isArray(response?.data) ? response.data : []
            const mapped = rows.map(mapPersistedNotification)
            setNotifications(mapped)
            const unread = Number(response?.meta?.unreadCount)
            setUnreadCount(Number.isFinite(unread) ? unread : mapped.filter((item) => !item.readAt).length)
        } catch (error) {
            const status = (error as any)?.response?.status
            const message = error instanceof Error ? error.message : 'Failed to load notifications'
            setLoadError(message)

            if (typeof status === 'number' && status >= 500) {
                lastPersistedErrorAtRef.current = now
                persistedDisabledUntilRef.current = now + 60_000
                return
            }

            if (now - lastPersistedErrorAtRef.current > 10_000) {
                lastPersistedErrorAtRef.current = now
            }
        } finally {
            setIsLoading(false)
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

        // Initialize Socket.IO connection against backend URL (not frontend host)
        const socketBaseUrl = resolveSocketBaseUrl()
        const socket = io(`${socketBaseUrl}/admin/notifications`, {
            auth: { token },
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: 5,
        })

        socketRef.current = socket

        // Connection handlers
        socket.on('connect', () => {
            setIsConnected(true)
        })

        socket.on('disconnect', () => {
            setIsConnected(false)
        })

        socket.on('connect_error', (error) => {
            console.error('❌ Socket connection error:', error)
        })

        // Notification listener
        socket.on('notification', (notification: NotificationPayload) => {
            const normalizedNotification: NotificationPayload = {
                ...notification,
                category: notification.category || getNotificationCategory(notification.type),
            }

            void loadPersistedNotifications()

            // Keep temporary in-memory entry for immediate UI feedback while DB state refreshes.
            setNotifications((prev) => {
                if (prev.some((item) => item.id === normalizedNotification.id)) return prev
                return [normalizedNotification, ...prev].slice(0, 50)
            })
            if (!normalizedNotification.readAt) {
                setUnreadCount((prev) => prev + 1)
            }
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

        let wasUnread = false
        setNotifications((prev) =>
            prev.map((item) => {
                if (item.id !== notificationId) return item
                if (!item.readAt) wasUnread = true
                return { ...item, readAt: item.readAt || new Date().toISOString(), deliveryStatus: 'read' }
            })
        )
        if (wasUnread) {
            setUnreadCount((prev) => Math.max(0, prev - 1))
        }
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
        isLoading,
        loadError,
        notifications,
        unreadCount,
        subscribeToApproval,
        subscribeToECL,
        acknowledgeNotification,
        clearNotifications,
        refreshNotifications: () => loadPersistedNotifications(true),
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
        isLoading: socket.isLoading,
        loadError: socket.loadError,
        subscribeToApproval: socket.subscribeToApproval,
        subscribeToECL: socket.subscribeToECL,
        acknowledgeNotification: socket.acknowledgeNotification,
        clearNotifications: socket.clearNotifications,
        refreshNotifications: socket.refreshNotifications,
    }
}
