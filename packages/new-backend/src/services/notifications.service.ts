import { Effect } from 'effect'
import { NotificationRepository } from '@/repositories/notification.repository'
import { DatabaseError } from '@/lib/errors'
import { dbOperation } from '@/lib/effect'

export const getMyNotifications = (input: {
    tenantId: string
    userId: string
    unreadOnly?: boolean
    limit?: number
    offset?: number
}): Effect.Effect<any[], DatabaseError> =>
    dbOperation('query', async () =>
        NotificationRepository.listForUser(input)
    )

export const getMyUnreadNotificationCount = (
    tenantId: string,
    userId: string
): Effect.Effect<number, DatabaseError> =>
    dbOperation('query', async () =>
        NotificationRepository.getUnreadCount(tenantId, userId)
    )

export const markNotificationAsRead = (input: {
    tenantId: string
    userId: string
    notificationId: string
}): Effect.Effect<{ updated: boolean }, DatabaseError> =>
    dbOperation('update', async () => {
        const updated = await NotificationRepository.markAsRead(input)
        return { updated }
    })

export const markAllNotificationsAsRead = (input: {
    tenantId: string
    userId: string
}): Effect.Effect<{ updatedCount: number }, DatabaseError> =>
    dbOperation('update', async () => {
        const updatedCount = await NotificationRepository.markAllAsRead(input)
        return { updatedCount }
    })
