'use client'

import React, { createContext, useContext, ReactNode } from 'react'
import { useNotificationSocket, NotificationPayload } from '@/hooks/useNotificationSocket'

interface NotificationContextValue {
    notifications: NotificationPayload[]
    unreadCount: number
    isConnected: boolean
    subscribeToApproval: (approvalRequestId: string) => void
    subscribeToECL: (workflowId: string) => void
    acknowledgeNotification: (notificationId: string) => void
    clearNotifications: () => void
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined)

export function NotificationProvider({ children }: { children: ReactNode }) {
    const socket = useNotificationSocket()

    return (
        <NotificationContext.Provider
            value={{
                notifications: socket.notifications,
                unreadCount: socket.unreadCount,
                isConnected: socket.isConnected,
                subscribeToApproval: socket.subscribeToApproval,
                subscribeToECL: socket.subscribeToECL,
                acknowledgeNotification: socket.acknowledgeNotification,
                clearNotifications: socket.clearNotifications,
            }}
        >
            {children as any}
        </NotificationContext.Provider>
    )
}

export function useNotifications() {
    const context = useContext(NotificationContext)
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider')
    }
    return context
}
