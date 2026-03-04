import { beforeEach, describe, expect, mock, test } from 'bun:test'
import { OpenAPIHono } from '@hono/zod-openapi'
import { Effect } from 'effect'

const notificationRow = {
  id: 'delivery-1',
  notificationId: 'notif-1',
  type: 'APPROVAL_REQUESTED',
  severity: 'info',
  title: 'Approval Needed',
  message: 'Please review the request.',
  actionUrl: '/banking/maintenance/approval',
  workflowId: null,
  approvalRequestId: 'approval-1',
  entityType: 'user',
  entityId: 'user-1',
  source: 'system',
  metadata: { module: 'users' },
  deliveryStatus: 'delivered',
  deliveredAt: new Date('2026-02-24T01:02:03.000Z'),
  readAt: null,
  createdAt: new Date('2026-02-24T00:00:00.000Z'),
}

const preferencePayload = {
  muteAll: false,
  mutedCategories: ['workflow'] as Array<'approval' | 'workflow' | 'analytics' | 'system'>,
  quietHoursEnabled: true,
  quietHoursStart: '22:00',
  quietHoursEnd: '07:00',
  timezone: 'Asia/Jakarta',
}

const getMyNotificationsMock = mock(() =>
  Effect.succeed({ rows: [notificationRow], total: 1 })
)

const getMyUnreadNotificationCountMock = mock(() => Effect.succeed(3))
const markManyNotificationsReadStatusMock = mock(() => Effect.succeed({ updatedCount: 2 }))
const getMyNotificationPreferencesMock = mock(() => Effect.succeed(preferencePayload))
const updateMyNotificationPreferencesMock = mock(() => Effect.succeed(preferencePayload))
const markNotificationAsReadMock = mock(() => Effect.succeed({ updated: true }))
const markAllNotificationsAsReadMock = mock(() => Effect.succeed({ updatedCount: 5 }))
const deriveNotificationCategoryMock = mock(() => 'approval' as const)

const passthroughMiddleware = async (c: any, next: any) => {
  c.set('tenantId', 'tenant-notif-1')
  c.set('userId', 'user-notif-1')
  await next()
}

mock.module('@/services/notifications.service', () => ({
  getMyNotifications: getMyNotificationsMock,
  getMyUnreadNotificationCount: getMyUnreadNotificationCountMock,
  markManyNotificationsReadStatus: markManyNotificationsReadStatusMock,
  getMyNotificationPreferences: getMyNotificationPreferencesMock,
  updateMyNotificationPreferences: updateMyNotificationPreferencesMock,
  markNotificationAsRead: markNotificationAsReadMock,
  markAllNotificationsAsRead: markAllNotificationsAsReadMock,
  deriveNotificationCategory: deriveNotificationCategoryMock,
}))

mock.module('../../services/notifications.service', () => ({
  getMyNotifications: getMyNotificationsMock,
  getMyUnreadNotificationCount: getMyUnreadNotificationCountMock,
  markManyNotificationsReadStatus: markManyNotificationsReadStatusMock,
  getMyNotificationPreferences: getMyNotificationPreferencesMock,
  updateMyNotificationPreferences: updateMyNotificationPreferencesMock,
  markNotificationAsRead: markNotificationAsReadMock,
  markAllNotificationsAsRead: markAllNotificationsAsReadMock,
  deriveNotificationCategory: deriveNotificationCategoryMock,
}))

mock.module('@/middleware', () => ({
  authMiddleware: passthroughMiddleware,
  tenantMiddleware: passthroughMiddleware,
  requirePermission: () => passthroughMiddleware,
  errorHandler: async (c: any) => c,
  auditMiddleware: passthroughMiddleware,
}))

mock.module('../../middleware', () => ({
  authMiddleware: passthroughMiddleware,
  tenantMiddleware: passthroughMiddleware,
  requirePermission: () => passthroughMiddleware,
  errorHandler: async (c: any) => c,
  auditMiddleware: passthroughMiddleware,
}))

const { notificationsRoutes } = await import('@/routes/notifications.routes')

describe('notifications routes response contracts', () => {
  beforeEach(() => {
    getMyNotificationsMock.mockClear()
    getMyUnreadNotificationCountMock.mockClear()
    markManyNotificationsReadStatusMock.mockClear()
    getMyNotificationPreferencesMock.mockClear()
    updateMyNotificationPreferencesMock.mockClear()
    markNotificationAsReadMock.mockClear()
    markAllNotificationsAsReadMock.mockClear()
    deriveNotificationCategoryMock.mockClear()
  })

  test('GET /api/v1/notifications returns normalized envelope and mapped query', async () => {
    const app = new OpenAPIHono()
    app.route('/api/v1/notifications', notificationsRoutes)

    const response = await app.request('/api/v1/notifications?unreadOnly=true&readStatus=unread&category=approval&search=maker&dateFrom=2026-02-20T00:00:00.000Z&dateTo=2026-02-21T00:00:00.000Z&limit=25&offset=5')
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data?.[0]?.category).toBe('approval')
    expect(body.data?.[0]?.createdAt).toBe('2026-02-24T00:00:00.000Z')
    expect(body.meta?.unreadCount).toBe(3)
    expect(body.meta?.total).toBe(1)

    const input = (getMyNotificationsMock.mock.calls as any[])[0]?.[0]
    expect(input.tenantId).toBe('tenant-notif-1')
    expect(input.userId).toBe('user-notif-1')
    expect(input.unreadOnly).toBe(true)
    expect(input.readStatus).toBe('unread')
    expect(input.category).toBe('approval')
    expect(input.search).toBe('maker')
    expect(input.limit).toBe(25)
    expect(input.offset).toBe(5)
    expect(input.dateFrom).toBeInstanceOf(Date)
    expect(input.dateTo).toBeInstanceOf(Date)
    expect(getMyUnreadNotificationCountMock).toHaveBeenCalledWith('tenant-notif-1', 'user-notif-1')
    expect(deriveNotificationCategoryMock).toHaveBeenCalledWith('APPROVAL_REQUESTED')
  })

  test('GET /api/v1/notifications/unread-count returns unread count payload', async () => {
    const app = new OpenAPIHono()
    app.route('/api/v1/notifications', notificationsRoutes)

    const response = await app.request('/api/v1/notifications/unread-count')
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data?.unreadCount).toBe(3)
  })

  test('POST /api/v1/notifications/read-status updates multiple notifications', async () => {
    const app = new OpenAPIHono()
    app.route('/api/v1/notifications', notificationsRoutes)

    const response = await app.request('/api/v1/notifications/read-status', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        notificationIds: ['00000000-0000-4000-8000-000000000001'],
        read: true,
      }),
    })

    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data?.updatedCount).toBe(2)
    expect(markManyNotificationsReadStatusMock).toHaveBeenCalledWith({
      tenantId: 'tenant-notif-1',
      userId: 'user-notif-1',
      notificationIds: ['00000000-0000-4000-8000-000000000001'],
      read: true,
    })
  })

  test('POST /api/v1/notifications/read-status returns 400 for invalid payload', async () => {
    const app = new OpenAPIHono()
    app.route('/api/v1/notifications', notificationsRoutes)

    const response = await app.request('/api/v1/notifications/read-status', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        notificationIds: ['not-a-uuid'],
        read: true,
      }),
    })

    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.success).toBe(false)
    expect(markManyNotificationsReadStatusMock).toHaveBeenCalledTimes(0)
  })

  test('GET /api/v1/notifications/preferences returns preferences envelope', async () => {
    const app = new OpenAPIHono()
    app.route('/api/v1/notifications', notificationsRoutes)

    const response = await app.request('/api/v1/notifications/preferences')
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data?.quietHoursEnabled).toBe(true)
    expect(getMyNotificationPreferencesMock).toHaveBeenCalledWith('tenant-notif-1', 'user-notif-1')
  })

  test('PUT /api/v1/notifications/preferences updates preferences', async () => {
    const app = new OpenAPIHono()
    app.route('/api/v1/notifications', notificationsRoutes)

    const response = await app.request('/api/v1/notifications/preferences', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        muteAll: true,
        quietHoursStart: '23:00',
      }),
    })

    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(updateMyNotificationPreferencesMock).toHaveBeenCalledWith({
      tenantId: 'tenant-notif-1',
      userId: 'user-notif-1',
      preferences: {
        muteAll: true,
        quietHoursStart: '23:00',
      },
    })
  })

  test('POST /api/v1/notifications/{id}/read marks one notification as read', async () => {
    const app = new OpenAPIHono()
    app.route('/api/v1/notifications', notificationsRoutes)

    const response = await app.request('/api/v1/notifications/notif-1/read', {
      method: 'POST',
    })

    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data?.updated).toBe(true)
    expect(markNotificationAsReadMock).toHaveBeenCalledWith({
      tenantId: 'tenant-notif-1',
      userId: 'user-notif-1',
      notificationId: 'notif-1',
    })
  })

  test('POST /api/v1/notifications/read-all marks all as read', async () => {
    const app = new OpenAPIHono()
    app.route('/api/v1/notifications', notificationsRoutes)

    const response = await app.request('/api/v1/notifications/read-all', {
      method: 'POST',
    })

    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data?.updatedCount).toBe(5)
    expect(markAllNotificationsAsReadMock).toHaveBeenCalledWith({
      tenantId: 'tenant-notif-1',
      userId: 'user-notif-1',
    })
  })
})
