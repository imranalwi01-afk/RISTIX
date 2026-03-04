import { beforeEach, describe, expect, test, mock } from 'bun:test'
import { Effect } from 'effect'

type PreferenceRow = {
  userId: string
  muteAll: boolean
  mutedCategories: string[] | null
  quietHoursEnabled: boolean
  quietHoursStart: string
  quietHoursEnd: string
  timezone: string
}

const state = {
  getByUserResult: null as PreferenceRow | null,
  listByUsersResult: [] as PreferenceRow[],
  upsertResult: null as PreferenceRow | null,
  getByUserCalls: [] as unknown[][],
  listByUsersCalls: [] as unknown[][],
  upsertCalls: [] as unknown[][],
  listForUserResult: { rows: [], total: 0 } as { rows: unknown[]; total: number },
  unreadCountResult: 0,
  markAsReadResult: true,
  markAllAsReadResult: 0,
  markManyReadStatusResult: 0,
  listForUserCalls: [] as unknown[][],
  unreadCountCalls: [] as unknown[][],
  markAsReadCalls: [] as unknown[][],
  markAllAsReadCalls: [] as unknown[][],
  markManyReadStatusCalls: [] as unknown[][],
}

mock.module('@/repositories/notification-preferences.repository', () => ({
  NotificationPreferencesRepository: {
    getByUser: async (...args: unknown[]) => {
      state.getByUserCalls.push(args)
      return state.getByUserResult
    },
    listByUsers: async (...args: unknown[]) => {
      state.listByUsersCalls.push(args)
      return state.listByUsersResult
    },
    upsert: async (...args: unknown[]) => {
      state.upsertCalls.push(args)
      return state.upsertResult ?? {
        userId: 'user',
        muteAll: false,
        mutedCategories: [],
        quietHoursEnabled: false,
        quietHoursStart: '22:00',
        quietHoursEnd: '07:00',
        timezone: 'Asia/Jakarta',
      }
    },
  },
}))

mock.module('@/repositories/notification.repository', () => ({
  NotificationRepository: {
    listForUser: async (...args: unknown[]) => {
      state.listForUserCalls.push(args)
      return state.listForUserResult
    },
    getUnreadCount: async (...args: unknown[]) => {
      state.unreadCountCalls.push(args)
      return state.unreadCountResult
    },
    markAsRead: async (...args: unknown[]) => {
      state.markAsReadCalls.push(args)
      return state.markAsReadResult
    },
    markAllAsRead: async (...args: unknown[]) => {
      state.markAllAsReadCalls.push(args)
      return state.markAllAsReadResult
    },
    markManyReadStatus: async (...args: unknown[]) => {
      state.markManyReadStatusCalls.push(args)
      return state.markManyReadStatusResult
    },
  },
}))

const notificationsService = await import('@/services/notifications.service')

describe('notifications.service', () => {
  beforeEach(() => {
    state.getByUserResult = null
    state.listByUsersResult = []
    state.upsertResult = null
    state.getByUserCalls = []
    state.listByUsersCalls = []
    state.upsertCalls = []
    state.listForUserResult = { rows: [], total: 0 }
    state.unreadCountResult = 0
    state.markAsReadResult = true
    state.markAllAsReadResult = 0
    state.markManyReadStatusResult = 0
    state.listForUserCalls = []
    state.unreadCountCalls = []
    state.markAsReadCalls = []
    state.markAllAsReadCalls = []
    state.markManyReadStatusCalls = []
  })

  test('deriveNotificationCategory maps notification types correctly', () => {
    expect(notificationsService.deriveNotificationCategory('APPROVAL_PENDING')).toBe('approval')
    expect(notificationsService.deriveNotificationCategory('WORKFLOW_STARTED')).toBe('workflow')
    expect(notificationsService.deriveNotificationCategory('ECL_COMPLETED')).toBe('analytics')
    expect(notificationsService.deriveNotificationCategory('UNKNOWN')).toBe('system')
  })

  test('getMyNotificationPreferences returns defaults when user has no saved preferences', async () => {
    const result = await Effect.runPromise(
      notificationsService.getMyNotificationPreferences('tenant-1', 'user-1')
    )

    expect(result).toEqual({
      muteAll: false,
      mutedCategories: [],
      quietHoursEnabled: false,
      quietHoursStart: '22:00',
      quietHoursEnd: '07:00',
      timezone: 'Asia/Jakarta',
    })
    expect(state.getByUserCalls.length).toBe(1)
    expect(state.getByUserCalls[0]).toEqual(['tenant-1', 'user-1'])
  })

  test('getMyNotificationPreferences returns normalized persisted preferences', async () => {
    state.getByUserResult = {
      userId: 'user-1',
      muteAll: true,
      mutedCategories: ['approval', 'approval', 'workflow', 'unknown'],
      quietHoursEnabled: true,
      quietHoursStart: '08:00',
      quietHoursEnd: '18:00',
      timezone: 'UTC',
    }

    const result = await Effect.runPromise(
      notificationsService.getMyNotificationPreferences('tenant-1', 'user-1')
    )

    expect(result).toEqual({
      muteAll: true,
      mutedCategories: ['approval', 'workflow'],
      quietHoursEnabled: true,
      quietHoursStart: '08:00',
      quietHoursEnd: '18:00',
      timezone: 'UTC',
    })
  })

  test('updateMyNotificationPreferences normalizes muted categories and persists merged data', async () => {
    state.getByUserResult = {
      userId: 'user-1',
      muteAll: false,
      mutedCategories: ['approval'],
      quietHoursEnabled: false,
      quietHoursStart: '22:00',
      quietHoursEnd: '07:00',
      timezone: 'Asia/Jakarta',
    }

    const result = await Effect.runPromise(
      notificationsService.updateMyNotificationPreferences({
        tenantId: 'tenant-1',
        userId: 'user-1',
        preferences: {
          mutedCategories: ['approval', 'workflow', 'workflow' as any],
          quietHoursEnabled: true,
          quietHoursStart: '23:00',
          quietHoursEnd: '06:00',
        },
      })
    )

    expect(result).toEqual({
      muteAll: false,
      mutedCategories: ['approval', 'workflow'],
      quietHoursEnabled: true,
      quietHoursStart: '23:00',
      quietHoursEnd: '06:00',
      timezone: 'Asia/Jakarta',
    })

    expect(state.upsertCalls.length).toBe(1)
    expect(state.upsertCalls[0][0]).toEqual({
      tenantId: 'tenant-1',
      userId: 'user-1',
      muteAll: false,
      mutedCategories: ['approval', 'workflow'],
      quietHoursEnabled: true,
      quietHoursStart: '23:00',
      quietHoursEnd: '06:00',
      timezone: 'Asia/Jakarta',
    })
  })

  test('filterNotificationRecipientsByPreferences excludes muted and quiet-hour users', async () => {
    state.listByUsersResult = [
      {
        userId: 'user-muted',
        muteAll: false,
        mutedCategories: ['approval'],
        quietHoursEnabled: false,
        quietHoursStart: '22:00',
        quietHoursEnd: '07:00',
        timezone: 'UTC',
      },
      {
        userId: 'user-quiet',
        muteAll: false,
        mutedCategories: [],
        quietHoursEnabled: true,
        quietHoursStart: '00:00',
        quietHoursEnd: '23:59',
        timezone: 'UTC',
      },
      {
        userId: 'user-mute-all',
        muteAll: true,
        mutedCategories: [],
        quietHoursEnabled: false,
        quietHoursStart: '22:00',
        quietHoursEnd: '07:00',
        timezone: 'UTC',
      },
    ]

    const targets = await notificationsService.filterNotificationRecipientsByPreferences({
      tenantId: 'tenant-1',
      userIds: ['user-default', 'user-muted', 'user-quiet', 'user-mute-all'],
      category: 'approval',
      now: new Date('2026-02-24T01:00:00.000Z'),
    })

    expect(targets).toEqual(['user-default'])
    expect(state.listByUsersCalls.length).toBe(1)
    expect(state.listByUsersCalls[0]).toEqual([
      'tenant-1',
      ['user-default', 'user-muted', 'user-quiet', 'user-mute-all'],
    ])
  })

  test('getMyNotifications delegates filter params and returns repository payload', async () => {
    const expected = {
      rows: [{ id: 'row-1', title: 'Hello' }],
      total: 1,
    }
    state.listForUserResult = expected

    const input = {
      tenantId: 'tenant-1',
      userId: 'user-1',
      readStatus: 'unread' as const,
      category: 'approval' as const,
      search: 'pending',
      dateFrom: new Date('2026-02-01T00:00:00.000Z'),
      dateTo: new Date('2026-02-28T23:59:59.999Z'),
      limit: 20,
      offset: 0,
    }

    const result = await Effect.runPromise(notificationsService.getMyNotifications(input))

    expect(result).toEqual(expected)
    expect(state.listForUserCalls.length).toBe(1)
    expect(state.listForUserCalls[0]).toEqual([input])
  })

  test('getMyUnreadNotificationCount returns repository unread count', async () => {
    state.unreadCountResult = 7
    const result = await Effect.runPromise(
      notificationsService.getMyUnreadNotificationCount('tenant-1', 'user-1')
    )

    expect(result).toBe(7)
    expect(state.unreadCountCalls[0]).toEqual(['tenant-1', 'user-1'])
  })

  test('markNotificationAsRead maps repository boolean response', async () => {
    state.markAsReadResult = false
    const input = { tenantId: 'tenant-1', userId: 'user-1', notificationId: 'notif-1' }
    const result = await Effect.runPromise(notificationsService.markNotificationAsRead(input))

    expect(result).toEqual({ updated: false })
    expect(state.markAsReadCalls[0]).toEqual([input])
  })

  test('markAllNotificationsAsRead returns updated count', async () => {
    state.markAllAsReadResult = 12
    const input = { tenantId: 'tenant-1', userId: 'user-1' }
    const result = await Effect.runPromise(notificationsService.markAllNotificationsAsRead(input))

    expect(result).toEqual({ updatedCount: 12 })
    expect(state.markAllAsReadCalls[0]).toEqual([input])
  })

  test('markManyNotificationsReadStatus returns updated count', async () => {
    state.markManyReadStatusResult = 3
    const input = {
      tenantId: 'tenant-1',
      userId: 'user-1',
      notificationIds: ['n1', 'n2', 'n3'],
      read: true,
    }
    const result = await Effect.runPromise(notificationsService.markManyNotificationsReadStatus(input))

    expect(result).toEqual({ updatedCount: 3 })
    expect(state.markManyReadStatusCalls[0]).toEqual([input])
  })

  test('quiet hours fallback handles invalid timezone and full-day window suppression', async () => {
    state.listByUsersResult = [
      {
        userId: 'full-day-quiet',
        muteAll: false,
        mutedCategories: [],
        quietHoursEnabled: true,
        quietHoursStart: '09:00',
        quietHoursEnd: '09:00',
        timezone: 'Invalid/Timezone',
      },
      {
        userId: 'not-quiet',
        muteAll: false,
        mutedCategories: [],
        quietHoursEnabled: false,
        quietHoursStart: '22:00',
        quietHoursEnd: '07:00',
        timezone: 'UTC',
      },
    ]

    const targets = await notificationsService.filterNotificationRecipientsByPreferences({
      tenantId: 'tenant-1',
      userIds: ['full-day-quiet', 'not-quiet'],
      category: 'system',
      now: new Date('2026-02-24T11:30:00.000Z'),
    })

    expect(targets).toEqual(['not-quiet'])
  })
})
