import { Effect } from 'effect'
import { NotificationRepository } from '@/repositories/notification.repository'
import { NotificationPreferencesRepository } from '@/repositories/notification-preferences.repository'
import { DatabaseError } from '@/lib/errors'
import { dbOperation } from '@/lib/effect'

export type NotificationCategory = 'approval' | 'workflow' | 'analytics' | 'system'
export type NotificationReadStatus = 'all' | 'read' | 'unread'

export interface NotificationPreferencesShape {
    muteAll: boolean
    mutedCategories: NotificationCategory[]
    quietHoursEnabled: boolean
    quietHoursStart: string
    quietHoursEnd: string
    timezone: string
}

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferencesShape = {
    muteAll: false,
    mutedCategories: [],
    quietHoursEnabled: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '07:00',
    timezone: 'Asia/Jakarta',
}

const ALLOWED_CATEGORIES = new Set<NotificationCategory>(['approval', 'workflow', 'analytics', 'system'])

const parseTimeToMinutes = (value: string): number => {
    const match = /^([01][0-9]|2[0-3]):([0-5][0-9])$/.exec(value)
    if (!match) return 0
    return Number(match[1]) * 60 + Number(match[2])
}

const getMinutesInTimezone = (date: Date, timezone: string): number => {
    try {
        const parts = new Intl.DateTimeFormat('en-GB', {
            timeZone: timezone,
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        }).formatToParts(date)
        const hour = Number(parts.find((part) => part.type === 'hour')?.value || '0')
        const minute = Number(parts.find((part) => part.type === 'minute')?.value || '0')
        return (hour * 60) + minute
    } catch {
        return (date.getUTCHours() * 60) + date.getUTCMinutes()
    }
}

export const deriveNotificationCategory = (type: string): NotificationCategory => {
    const normalized = String(type || '').toUpperCase()
    if (normalized.startsWith('APPROVAL_')) return 'approval'
    if (normalized.startsWith('WORKFLOW_')) return 'workflow'
    if (normalized.startsWith('ECL_') || normalized.startsWith('ANALYTICS_')) return 'analytics'
    return 'system'
}

const normalizeCategories = (categories: unknown): NotificationCategory[] => {
    if (!Array.isArray(categories)) return []

    return Array.from(
        new Set(
            categories
                .filter((value): value is string => typeof value === 'string')
                .map((value) => value.trim().toLowerCase())
                .filter((value): value is NotificationCategory => ALLOWED_CATEGORIES.has(value as NotificationCategory))
        )
    )
}

const normalizePreferences = (input?: Partial<NotificationPreferencesShape> | null): NotificationPreferencesShape => ({
    muteAll: Boolean(input?.muteAll ?? DEFAULT_NOTIFICATION_PREFERENCES.muteAll),
    mutedCategories: normalizeCategories(input?.mutedCategories ?? DEFAULT_NOTIFICATION_PREFERENCES.mutedCategories),
    quietHoursEnabled: Boolean(input?.quietHoursEnabled ?? DEFAULT_NOTIFICATION_PREFERENCES.quietHoursEnabled),
    quietHoursStart: typeof input?.quietHoursStart === 'string' && /^\d{2}:\d{2}$/.test(input.quietHoursStart)
        ? input.quietHoursStart
        : DEFAULT_NOTIFICATION_PREFERENCES.quietHoursStart,
    quietHoursEnd: typeof input?.quietHoursEnd === 'string' && /^\d{2}:\d{2}$/.test(input.quietHoursEnd)
        ? input.quietHoursEnd
        : DEFAULT_NOTIFICATION_PREFERENCES.quietHoursEnd,
    timezone: typeof input?.timezone === 'string' && input.timezone.trim().length > 0
        ? input.timezone.trim()
        : DEFAULT_NOTIFICATION_PREFERENCES.timezone,
})

const isInQuietHours = (now: Date, preferences: NotificationPreferencesShape): boolean => {
    if (!preferences.quietHoursEnabled) return false

    const nowMinutes = getMinutesInTimezone(now, preferences.timezone)
    const start = parseTimeToMinutes(preferences.quietHoursStart)
    const end = parseTimeToMinutes(preferences.quietHoursEnd)

    if (start === end) return true
    if (start < end) return nowMinutes >= start && nowMinutes < end
    return nowMinutes >= start || nowMinutes < end
}

const shouldSuppressNotification = (preferences: NotificationPreferencesShape, category: NotificationCategory, now: Date): boolean => {
    if (preferences.muteAll) return true
    if (preferences.mutedCategories.includes(category)) return true
    if (isInQuietHours(now, preferences)) return true
    return false
}

export const getMyNotifications = (input: {
    tenantId: string
    userId: string
    unreadOnly?: boolean
    readStatus?: NotificationReadStatus
    category?: NotificationCategory
    search?: string
    dateFrom?: Date
    dateTo?: Date
    limit?: number
    offset?: number
}): Effect.Effect<{ rows: any[]; total: number }, DatabaseError> =>
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

export const markManyNotificationsReadStatus = (input: {
    tenantId: string
    userId: string
    notificationIds: string[]
    read: boolean
}): Effect.Effect<{ updatedCount: number }, DatabaseError> =>
    dbOperation('update', async () => {
        const updatedCount = await NotificationRepository.markManyReadStatus(input)
        return { updatedCount }
    })

export const getMyNotificationPreferences = (
    tenantId: string,
    userId: string
): Effect.Effect<NotificationPreferencesShape, DatabaseError> =>
    dbOperation('query', async () => {
        const row = await NotificationPreferencesRepository.getByUser(tenantId, userId)
        return normalizePreferences(row ? {
            muteAll: row.muteAll,
            mutedCategories: (row.mutedCategories as NotificationCategory[] | null) || [],
            quietHoursEnabled: row.quietHoursEnabled,
            quietHoursStart: row.quietHoursStart,
            quietHoursEnd: row.quietHoursEnd,
            timezone: row.timezone,
        } : null)
    })

export const updateMyNotificationPreferences = (input: {
    tenantId: string
    userId: string
    preferences: Partial<NotificationPreferencesShape>
}): Effect.Effect<NotificationPreferencesShape, DatabaseError> =>
    dbOperation('update', async () => {
        const current = await NotificationPreferencesRepository.getByUser(input.tenantId, input.userId)
        const merged = normalizePreferences({
            ...(current ? {
                muteAll: current.muteAll,
                mutedCategories: (current.mutedCategories as NotificationCategory[] | null) || [],
                quietHoursEnabled: current.quietHoursEnabled,
                quietHoursStart: current.quietHoursStart,
                quietHoursEnd: current.quietHoursEnd,
                timezone: current.timezone,
            } : DEFAULT_NOTIFICATION_PREFERENCES),
            ...input.preferences,
        })

        await NotificationPreferencesRepository.upsert({
            tenantId: input.tenantId,
            userId: input.userId,
            muteAll: merged.muteAll,
            mutedCategories: merged.mutedCategories,
            quietHoursEnabled: merged.quietHoursEnabled,
            quietHoursStart: merged.quietHoursStart,
            quietHoursEnd: merged.quietHoursEnd,
            timezone: merged.timezone,
        })

        return merged
    })

export async function filterNotificationRecipientsByPreferences(input: {
    tenantId: string
    userIds: string[]
    category: NotificationCategory
    now?: Date
}): Promise<string[]> {
    const uniqueUserIds = Array.from(new Set((input.userIds || []).filter(Boolean)))
    if (uniqueUserIds.length === 0) return []

    const now = input.now || new Date()
    const preferencesRows = await NotificationPreferencesRepository.listByUsers(input.tenantId, uniqueUserIds)
    const preferenceByUser = new Map(
        preferencesRows.map((row) => [row.userId, normalizePreferences({
            muteAll: row.muteAll,
            mutedCategories: (row.mutedCategories as NotificationCategory[] | null) || [],
            quietHoursEnabled: row.quietHoursEnabled,
            quietHoursStart: row.quietHoursStart,
            quietHoursEnd: row.quietHoursEnd,
            timezone: row.timezone,
        })])
    )

    return uniqueUserIds.filter((userId) => {
        const prefs = preferenceByUser.get(userId) || DEFAULT_NOTIFICATION_PREFERENCES
        return !shouldSuppressNotification(prefs, input.category, now)
    })
}
