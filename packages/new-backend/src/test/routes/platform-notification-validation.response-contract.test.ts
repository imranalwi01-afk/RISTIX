import { describe, expect, mock, test } from 'bun:test'
import { OpenAPIHono } from '@hono/zod-openapi'
import { Effect } from 'effect'

const authMiddlewareMock = async (c: any, next: any) => {
  c.set('userId', 'platform-user-1')
  c.set('tenantId', 'tenant-platform-1')
  c.set('permissions', ['admin.super_admin'])
  c.set('isSystemUser', true)
  await next()
}

mock.module('@/middleware', () => ({
  authMiddleware: authMiddlewareMock,
  tenantMiddleware: authMiddlewareMock,
  requirePermission: () => authMiddlewareMock,
  errorHandler: async (c: any) => c,
  auditMiddleware: authMiddlewareMock,
}))

mock.module('../../middleware', () => ({
  authMiddleware: authMiddlewareMock,
  tenantMiddleware: authMiddlewareMock,
  requirePermission: () => authMiddlewareMock,
  errorHandler: async (c: any) => c,
  auditMiddleware: authMiddlewareMock,
}))

mock.module('@/services/notifications.service', () => ({
  listNotifications: () => Effect.succeed({ items: [], total: 0 }),
  getUnreadNotificationsCount: () => Effect.succeed({ total: 0 }),
  getMyNotificationPreferences: () => Effect.succeed({}),
  updateMyNotificationPreferences: () => Effect.succeed({}),
  markNotificationRead: () => Effect.succeed({}),
  markManyNotificationsReadStatus: () => Effect.succeed({ updatedCount: 0 }),
  markAllNotificationsRead: () => Effect.succeed({ updatedCount: 0 }),
}))

mock.module('../../services/notifications.service', () => ({
  listNotifications: () => Effect.succeed({ items: [], total: 0 }),
  getUnreadNotificationsCount: () => Effect.succeed({ total: 0 }),
  getMyNotificationPreferences: () => Effect.succeed({}),
  updateMyNotificationPreferences: () => Effect.succeed({}),
  markNotificationRead: () => Effect.succeed({}),
  markManyNotificationsReadStatus: () => Effect.succeed({ updatedCount: 0 }),
  markAllNotificationsRead: () => Effect.succeed({ updatedCount: 0 }),
}))

mock.module('@/config/database', () => ({
  db: {
    select: () => ({ from: () => ({ where: () => ({ limit: async () => [] }) }) }),
    insert: () => ({ values: () => ({ returning: async () => [] }) }),
    update: () => ({ set: () => ({ where: async () => [] }) }),
  },
}))

mock.module('../../config/database', () => ({
  db: {
    select: () => ({ from: () => ({ where: () => ({ limit: async () => [] }) }) }),
    insert: () => ({ values: () => ({ returning: async () => [] }) }),
    update: () => ({ set: () => ({ where: async () => [] }) }),
  },
}))

mock.module('@/db/schema', () => ({
  platformUsers: {
    email: 'email',
  },
}))

mock.module('../../db/schema', () => ({
  platformUsers: {
    email: 'email',
  },
}))

mock.module('@/services/tenants.service', () => ({
  getTenants: () => Effect.succeed({ data: [], total: 0 }),
}))

mock.module('../../services/tenants.service', () => ({
  getTenants: () => Effect.succeed({ data: [], total: 0 }),
}))

const { notificationsRoutes } = await import('@/routes/notifications.routes')
const { platformUsersRoutes } = await import('@/routes/platform-users.routes')

describe('platform and notification validation response contracts', () => {
  test('PUT /api/v1/notifications/preferences returns detailed 400 validation payload', async () => {
    const app = new OpenAPIHono()
    app.route('/api/v1/notifications', notificationsRoutes)

    const response = await app.request('/api/v1/notifications/preferences', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        muteAll: false,
        mutedCategories: [],
        quietHoursEnabled: true,
        quietHoursStart: '25:99',
        quietHoursEnd: '07:00',
        timezone: '',
      }),
    })
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body).toMatchObject({
      success: false,
      code: 'VALIDATION_ERROR',
      error: 'Validation failed',
      message: 'Validation failed',
    })
    expect(body.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: 'quietHoursStart' }),
        expect.objectContaining({ path: 'timezone' }),
      ])
    )
  })

  test('POST /api/v1/platform-users returns detailed 400 validation payload', async () => {
    const app = new OpenAPIHono()
    app.route('/api/v1/platform-users', platformUsersRoutes)

    const response = await app.request('/api/v1/platform-users', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        email: 'not-an-email',
        password: '123',
        fullName: 'A',
        username: 'b',
      }),
    })
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body).toMatchObject({
      success: false,
      code: 'VALIDATION_ERROR',
      error: 'Validation failed',
      message: 'Validation failed',
    })
    expect(body.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: 'email' }),
        expect.objectContaining({ path: 'password' }),
        expect.objectContaining({ path: 'fullName' }),
        expect.objectContaining({ path: 'username' }),
      ])
    )
  })
})
