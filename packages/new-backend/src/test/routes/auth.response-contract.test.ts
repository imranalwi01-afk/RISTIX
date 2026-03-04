import { beforeEach, describe, expect, mock, test } from 'bun:test'
import { OpenAPIHono } from '@hono/zod-openapi'
import { Effect } from 'effect'
import { AuthenticationError } from '@/lib/errors'

type LoginMode = 'success' | 'failure'
type TenantLookupMode = 'success' | 'failure'

let loginMode: LoginMode = 'success'
let tenantLookupMode: TenantLookupMode = 'success'

const loginAuditMock = mock(() => Effect.succeed(void 0))
const loginFailedAuditMock = mock(() => Effect.succeed(void 0))
const logoutAuditMock = mock(() => Effect.succeed(void 0))

const makeMockAccessToken = (tenantId: string): string => {
  const payload = Buffer.from(JSON.stringify({ tenantId })).toString('base64')
  return `header.${payload}.signature`
}

const loginMock = mock(() => {
  if (loginMode === 'failure') {
    return Effect.fail(
      new AuthenticationError({
        message: 'Invalid credentials',
        reason: 'invalid_credentials',
      })
    )
  }

  return Effect.succeed({
    user: {
      id: 'user-auth-1',
      email: 'auth.user@ifrspro.id',
      fullName: 'Auth User',
      tenantId: 'tenant-auth-1',
      permissions: ['users.read', 'users.write'],
      roles: ['Admin'],
    },
    tokens: {
      accessToken: makeMockAccessToken('tenant-auth-1'),
      refreshToken: 'refresh-token-1',
      expiresIn: 3600,
      refreshExpiresIn: 604800,
    },
  })
})

const refreshTokensMock = mock(() =>
  Effect.succeed({
    accessToken: makeMockAccessToken('tenant-auth-1'),
    refreshToken: 'refresh-token-2',
    expiresIn: 3600,
    refreshExpiresIn: 604800,
  })
)

const logoutMock = mock(() => Effect.succeed(void 0))

const getTenantsMock = mock(() => {
  if (tenantLookupMode === 'failure') {
    return Effect.fail(new Error('tenant lookup failed') as any)
  }

  return Effect.succeed({
    data: [
      {
        id: 'tenant-auth-1',
        slug: 'tenant-auth',
        name: 'Tenant Auth (Local Development)',
        displayName: 'Tenant Auth (Development)',
        bankingMode: 'conventional',
        isActive: true,
      },
    ],
    total: 1,
  })
})

const getUserRolesMock = mock(() =>
  Effect.succeed([
    { role: { roleName: 'Maker' } },
    { role: { roleName: 'Approver' } },
  ])
)

const getUserPermissionCodesMock = mock(() =>
  Effect.succeed(['users.read', 'users.write'])
)

const authMiddlewareMock = async (c: any, next: any) => {
  if (c.req.header('x-test-auth') === 'missing') {
    await next()
    return
  }

  const tokenId = c.req.header('x-test-token-id')
  const tenantHeader = c.req.header('x-test-tenant')
  const permissionsHeader = c.req.header('x-test-permissions')
  const permissions = permissionsHeader
    ? permissionsHeader.split(',').map((p: any) => p.trim()).filter(Boolean)
    : ['token.permissions.read']

  c.set('userId', 'user-auth-1')
  c.set('permissions', permissions)
  c.set('tokenId', tokenId)
  c.set('user', {
    id: 'user-auth-1',
    email: 'auth.user@ifrspro.id',
    role: 'PLATFORM_ADMIN',
    roles: ['Platform Admin'],
  })

  if (tenantHeader !== 'none') {
    c.set('tenantId', tenantHeader || 'tenant-auth-1')
  }

  await next()
}

mock.module('@/services/auth.service', () => ({
  login: loginMock,
  refreshTokens: refreshTokensMock,
  logout: logoutMock,
  hashPassword: async () => 'mock-hash',
}))

mock.module('../../services/auth.service', () => ({
  login: loginMock,
  refreshTokens: refreshTokensMock,
  logout: logoutMock,
  hashPassword: async () => 'mock-hash',
}))

mock.module('@/services/tenants.service', () => ({
  getTenants: getTenantsMock,
}))

mock.module('../../services/tenants.service', () => ({
  getTenants: getTenantsMock,
}))

mock.module('@/services/rbac.service', () => ({
  getUserRoles: getUserRolesMock,
  getUserPermissionCodes: getUserPermissionCodesMock,
}))

mock.module('../../services/rbac.service', () => ({
  getUserRoles: getUserRolesMock,
  getUserPermissionCodes: getUserPermissionCodesMock,
}))

mock.module('@/services/audit.service', () => ({
  logAuth: {
    login: loginAuditMock,
    loginFailed: loginFailedAuditMock,
    logout: logoutAuditMock,
  },
}))

mock.module('../../services/audit.service', () => ({
  logAuth: {
    login: loginAuditMock,
    loginFailed: loginFailedAuditMock,
    logout: logoutAuditMock,
  },
}))

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

const { authRoutes } = await import('@/routes/auth.routes')

describe('auth routes response contracts', () => {
  beforeEach(() => {
    loginMode = 'success'
    tenantLookupMode = 'success'

    loginMock.mockClear()
    refreshTokensMock.mockClear()
    logoutMock.mockClear()
    getTenantsMock.mockClear()
    getUserRolesMock.mockClear()
    getUserPermissionCodesMock.mockClear()
    loginAuditMock.mockClear()
    loginFailedAuditMock.mockClear()
    logoutAuditMock.mockClear()
  })

  test('POST /api/v1/auth/login returns success envelope with user and tokens', async () => {
    const app = new OpenAPIHono()
    app.route('/api/v1/auth', authRoutes)

    const response = await app.request('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        email: 'auth.user@ifrspro.id',
        password: 'StrongPass123!',
      }),
    })

    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data?.user?.email).toBe('auth.user@ifrspro.id')
    expect(body.data?.tokens?.accessToken).toBeTruthy()
    expect(loginAuditMock).toHaveBeenCalledTimes(1)
    expect(loginFailedAuditMock).toHaveBeenCalledTimes(0)
  })

  test('POST /api/v1/auth/login returns 401 envelope on invalid credentials', async () => {
    loginMode = 'failure'
    const app = new OpenAPIHono()
    app.route('/api/v1/auth', authRoutes)

    const response = await app.request('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        email: 'auth.user@ifrspro.id',
        password: 'wrong',
      }),
    })

    const body = await response.json()

    expect(response.status).toBe(401)
    expect(body.success).toBe(false)
    expect(body.code).toBe('UNAUTHENTICATED')
    expect(loginFailedAuditMock).toHaveBeenCalledTimes(1)
  })

  test('POST /api/v1/auth/refresh returns wrapped token payload', async () => {
    const app = new OpenAPIHono()
    app.route('/api/v1/auth', authRoutes)

    const response = await app.request('/api/v1/auth/refresh', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ refreshToken: 'refresh-token-1' }),
    })

    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data?.tokens?.refreshToken).toBe('refresh-token-2')
    expect(body.data?.token).toBe(body.data?.tokens?.accessToken)
  })

  test('GET /api/v1/auth/login-data returns tenant list envelope', async () => {
    const app = new OpenAPIHono()
    app.route('/api/v1/auth', authRoutes)

    const response = await app.request('/api/v1/auth/login-data')
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data?.total).toBe(1)
    expect(body.data?.tenants?.[0]?.name).toBe('Tenant Auth')
  })

  test('GET /api/v1/auth/login-data falls back when tenant lookup fails', async () => {
    tenantLookupMode = 'failure'
    const app = new OpenAPIHono()
    app.route('/api/v1/auth', authRoutes)

    const response = await app.request('/api/v1/auth/login-data')
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(Array.isArray(body.data?.tenants)).toBe(true)
    expect(body.data?.total).toBeGreaterThan(0)
  })

  test('GET /api/v1/auth/verify returns token validation payload', async () => {
    const app = new OpenAPIHono()
    app.route('/api/v1/auth', authRoutes)

    const response = await app.request('/api/v1/auth/verify')
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.message).toBe('Token is valid')
  })

  test('GET /api/v1/auth/me returns 401 when user context is missing', async () => {
    const app = new OpenAPIHono()
    app.route('/api/v1/auth', authRoutes)

    const response = await app.request('/api/v1/auth/me', {
      headers: { 'x-test-auth': 'missing' },
    })
    const body = await response.json()

    expect(response.status).toBe(401)
    expect(body.success).toBe(false)
    expect(body.code).toBe('UNAUTHORIZED')
  })

  test('GET /api/v1/auth/me returns tenant-scoped profile with role list', async () => {
    const app = new OpenAPIHono()
    app.route('/api/v1/auth', authRoutes)

    const response = await app.request('/api/v1/auth/me')
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data?.tenantId).toBe('tenant-auth-1')
    expect(body.data?.roles).toEqual(['Maker', 'Approver'])
    expect(getUserRolesMock).toHaveBeenCalledTimes(1)
  })

  test('GET /api/v1/auth/me returns platform payload when tenant context is absent', async () => {
    const app = new OpenAPIHono()
    app.route('/api/v1/auth', authRoutes)

    const response = await app.request('/api/v1/auth/me', {
      headers: { 'x-test-tenant': 'none' },
    })
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data?.tenantId).toBeUndefined()
    expect(body.data?.roles).toEqual(['Platform Admin'])
  })

  test('GET /api/v1/auth/me/permissions returns tenant permissions via rbac service', async () => {
    const app = new OpenAPIHono()
    app.route('/api/v1/auth', authRoutes)

    const response = await app.request('/api/v1/auth/me/permissions')
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data?.permissions).toEqual(['users.read', 'users.write'])
    expect(getUserPermissionCodesMock).toHaveBeenCalledTimes(1)
  })

  test('GET /api/v1/auth/me/permissions returns token permissions for platform sessions', async () => {
    const app = new OpenAPIHono()
    app.route('/api/v1/auth', authRoutes)

    const response = await app.request('/api/v1/auth/me/permissions', {
      headers: {
        'x-test-tenant': 'none',
        'x-test-permissions': 'platform.users.read,platform.users.write',
      },
    })
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data?.permissions).toEqual(['platform.users.read', 'platform.users.write'])
  })

  test('POST /api/v1/auth/logout handles missing token id with immediate success', async () => {
    const app = new OpenAPIHono()
    app.route('/api/v1/auth', authRoutes)

    const response = await app.request('/api/v1/auth/logout', {
      method: 'POST',
    })
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.message).toBe('Logged out')
    expect(logoutMock).toHaveBeenCalledTimes(0)
  })

  test('POST /api/v1/auth/logout revokes token and returns success envelope', async () => {
    const app = new OpenAPIHono()
    app.route('/api/v1/auth', authRoutes)

    const response = await app.request('/api/v1/auth/logout', {
      method: 'POST',
      headers: { 'x-test-token-id': 'token-123' },
    })
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.message).toBe('Logged out successfully')
    expect(logoutMock).toHaveBeenCalledTimes(1)
    expect(logoutAuditMock).toHaveBeenCalledTimes(1)
  })
})
