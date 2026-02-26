import { and, eq, inArray } from 'drizzle-orm'
import { getDatabase } from '@/config/database'
import {
    notificationPreferences,
    type NotificationPreference,
} from '@/db/schema'

export interface NotificationPreferencesInput {
    tenantId: string
    userId: string
    muteAll: boolean
    mutedCategories: string[]
    quietHoursEnabled: boolean
    quietHoursStart: string
    quietHoursEnd: string
    timezone: string
}

export const NotificationPreferencesRepository = {
    async getByUser(tenantId: string, userId: string): Promise<NotificationPreference | null> {
        const dbx = getDatabase(tenantId)
        const [row] = await dbx
            .select()
            .from(notificationPreferences)
            .where(
                and(
                    eq(notificationPreferences.tenantId, tenantId),
                    eq(notificationPreferences.userId, userId),
                )
            )
            .limit(1)

        return row ?? null
    },

    async listByUsers(tenantId: string, userIds: string[]): Promise<NotificationPreference[]> {
        if (!Array.isArray(userIds) || userIds.length === 0) return []

        const dbx = getDatabase(tenantId)
        const uniqueUserIds = Array.from(new Set(userIds.filter((id) => typeof id === 'string' && id.trim().length > 0)))
        if (uniqueUserIds.length === 0) return []

        return dbx
            .select()
            .from(notificationPreferences)
            .where(
                and(
                    eq(notificationPreferences.tenantId, tenantId),
                    inArray(notificationPreferences.userId, uniqueUserIds)
                )
            )
    },

    async upsert(input: NotificationPreferencesInput): Promise<NotificationPreference> {
        const dbx = getDatabase(input.tenantId)
        const now = new Date()

        const [row] = await dbx
            .insert(notificationPreferences)
            .values({
                tenantId: input.tenantId,
                userId: input.userId,
                muteAll: input.muteAll,
                mutedCategories: input.mutedCategories,
                quietHoursEnabled: input.quietHoursEnabled,
                quietHoursStart: input.quietHoursStart,
                quietHoursEnd: input.quietHoursEnd,
                timezone: input.timezone,
                createdAt: now,
                updatedAt: now,
            })
            .onConflictDoUpdate({
                target: [notificationPreferences.tenantId, notificationPreferences.userId],
                set: {
                    muteAll: input.muteAll,
                    mutedCategories: input.mutedCategories,
                    quietHoursEnabled: input.quietHoursEnabled,
                    quietHoursStart: input.quietHoursStart,
                    quietHoursEnd: input.quietHoursEnd,
                    timezone: input.timezone,
                    updatedAt: now,
                },
            })
            .returning()

        return row
    },
}
