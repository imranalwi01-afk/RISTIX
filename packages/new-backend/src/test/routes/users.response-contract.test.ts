import { describe, test, expect, beforeEach, mock } from 'bun:test'
import { OpenAPIHono } from '@hono/zod-openapi'
import { Effect, pipe } from 'effect'

type CreateMode = 'direct' | 'approval'
let createMode: CreateMode = 'direct'

const fakeUser = {
  id: '00000000-0000-4000-8000-000000000123',
  email: 'new.user@ifrspro.id',
  fullName: 'New User',
  username: 'new_user',
  phone: null,
  department: 'IT',
  position: 'Analyst',
  tenantId: 'tenant-test',
  isVerified: false,
  emailVerifiedAt: null,
  lastLoginAt: null,
  isActive: true,
}

const createUserMock = mock(() => Effect.succeed(fakeUser))
const getUsersMock = mock(() =>
  Effect.succeed({
    data: [fakeUser],
    total: 1,
  })
)

const interceptCreateMock = mock(
  (
    _tenantId: string,
    _userId: string,
    _userPermissions: string[],
    _entityType: string,
    _payload: unknown,
    executeCreate: () => ReturnType<typeof createUserMock>
  ) => {
    if (createMode === 'approval') {
      return Effect.succeed({
        success: true,
        approvalRequired: true,
        message: 'Approval required',
        approvalId: 'approval-123',
      })
    }

    return pipe(
      executeCreate(),
      Effect.map((user) => ({
        success: true,
        approvalRequired: false,
        data: user,
      }))
    )
  }
)

const passthroughMiddleware = async (c: any, next: any) => {
  c.set('tenantId', 'tenant-test')
  c.set('userId', 'user-test')
  c.set('isSystemUser', false)
  c.set('userPermissions', ['admin.users.manage'])
  await next()
}

mock.module('@/services/users.service', () => ({
  createUser: createUserMock,
  getUsers: getUsersMock,
}))

mock.module('../../services/users.service', () => ({
  createUser: createUserMock,
  getUsers: getUsersMock,
}))

mock.module('@/middleware/approval-interceptor.middleware', () => ({
  interceptCreate: interceptCreateMock,
  interceptUpdate: () => Effect.succeed({ success: true, approvalRequired: true }),
  interceptDelete: () => Effect.succeed({ success: true, approvalRequired: true }),
}))

mock.module('../../middleware/approval-interceptor.middleware', () => ({
  interceptCreate: interceptCreateMock,
  interceptUpdate: () => Effect.succeed({ success: true, approvalRequired: true }),
  interceptDelete: () => Effect.succeed({ success: true, approvalRequired: true }),
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

const { usersRoutes } = await import('@/routes/users.routes')

describe('users routes response contracts', () => {
  beforeEach(() => {
    createMode = 'direct'
    createUserMock.mockClear()
    getUsersMock.mockClear()
    interceptCreateMock.mockClear()
  })

  test('GET /api/v1/user returns list response contract for frontend alias route', async () => {
    const app = new OpenAPIHono()
    app.route('/api/v1/user', usersRoutes)

    const response = await app.request('/api/v1/user?page=1&limit=10')
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(response.headers.get('x-total-count')).toBe('1')
    expect(body.success).toBe(true)
    expect(Array.isArray(body.data?.users)).toBe(true)
    expect(body.data.users[0]?.id).toBe(fakeUser.id)
    expect(body.pagination?.total).toBe(1)
    expect(getUsersMock).toHaveBeenCalledTimes(1)
  })

  test('POST /api/v1/user returns 201 with success payload for direct create', async () => {
    const app = new OpenAPIHono()
    app.route('/api/v1/user', usersRoutes)

    const response = await app.request('/api/v1/user', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        email: fakeUser.email,
        password: 'StrongPass123!',
        fullName: fakeUser.fullName,
        username: fakeUser.username,
        department: fakeUser.department,
      }),
    })

    const body = await response.json()

    expect(response.status).toBe(201)
    expect(body.success).toBe(true)
    expect(body.approvalRequired).toBe(false)
    expect(body.data?.id).toBe(fakeUser.id)
    expect(createUserMock).toHaveBeenCalledTimes(1)
  })

  test('POST /api/v1/user returns 202 with approval payload when approval is required', async () => {
    createMode = 'approval'
    const app = new OpenAPIHono()
    app.route('/api/v1/user', usersRoutes)

    const response = await app.request('/api/v1/user', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        email: fakeUser.email,
        password: 'StrongPass123!',
        fullName: fakeUser.fullName,
        username: fakeUser.username,
      }),
    })

    const body = await response.json()

    expect(response.status).toBe(202)
    expect(body.success).toBe(true)
    expect(body.approvalRequired).toBe(true)
    expect(body.approvalId).toBe('approval-123')
    expect(createUserMock).toHaveBeenCalledTimes(0)
  })
})
