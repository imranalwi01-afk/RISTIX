import { beforeEach, describe, expect, mock, test } from 'bun:test'
import { OpenAPIHono } from '@hono/zod-openapi'
import { Effect } from 'effect'
import { DatabaseError } from '@/lib/errors'

const state = {
  stats: {
    totalTenants: 4,
    activeTenants: 3,
    totalUsers: 18,
    activeUsers: 16,
    totalRoles: 22,
    activeSessionsLast24h: 8,
    auditLogsLast24h: 44,
  },
  health: {
    database: 'healthy',
    memory: {
      used: 128,
      total: 512,
      percentage: 25,
    },
    uptime: 3600,
    version: '1.0.0',
  },
  tenantsOverview: [
    {
      id: 'tenant-1',
      name: 'IAF Tenant',
      code: 'IAF',
      bankingMode: 'conventional',
      userCount: 10,
      isActive: true,
      createdAt: new Date('2026-02-24T00:00:00.000Z'),
    },
    {
      id: 'tenant-2',
      name: 'Syariah Tenant',
      code: 'SYR',
      bankingMode: 'syariah',
      userCount: 8,
      isActive: true,
      createdAt: new Date('2026-02-24T00:00:00.000Z'),
    },
  ],
  recentActivity: [
    {
      id: 'act-1',
      action: 'LOGIN',
      entityType: 'user',
      entityId: 'user-1',
      userId: 'maker-1',
      createdAt: new Date('2026-02-25T00:00:00.000Z'),
    },
  ],
  shouldFailStats: false,
  recentActivityCalls: [] as number[],
}

const getPlatformStatsMock = mock(() => {
  if (state.shouldFailStats) {
    return Effect.fail(new DatabaseError({ message: 'stats query failed', operation: 'query' }))
  }
  return Effect.succeed(state.stats)
})

const getSystemHealthMock = mock(() => Effect.succeed(state.health))
const getTenantOverviewMock = mock(() => Effect.succeed(state.tenantsOverview))
const getRecentActivityMock = mock((limit: number) => {
  state.recentActivityCalls.push(limit)
  return Effect.succeed(state.recentActivity.slice(0, limit))
})

const authMiddleware = async (_c: any, next: any) => {
  await next()
}

mock.module('@/services/platform-admin.service', () => ({
  getPlatformStats: getPlatformStatsMock,
  getSystemHealth: getSystemHealthMock,
  getTenantOverview: getTenantOverviewMock,
  getRecentActivity: getRecentActivityMock,
}))

mock.module('../../services/platform-admin.service', () => ({
  getPlatformStats: getPlatformStatsMock,
  getSystemHealth: getSystemHealthMock,
  getTenantOverview: getTenantOverviewMock,
  getRecentActivity: getRecentActivityMock,
}))

mock.module('@/middleware', () => ({
  authMiddleware,
  tenantMiddleware: authMiddleware,
  requirePermission: () => authMiddleware,
  errorHandler: async (c: any) => c,
  auditMiddleware: authMiddleware,
}))

mock.module('../../middleware', () => ({
  authMiddleware,
  tenantMiddleware: authMiddleware,
  requirePermission: () => authMiddleware,
  errorHandler: async (c: any) => c,
  auditMiddleware: authMiddleware,
}))

const { platformAdminRoutes } = await import('@/routes/platform-admin.routes')

describe('platform-admin routes response contracts', () => {
  beforeEach(() => {
    state.stats = {
      totalTenants: 4,
      activeTenants: 3,
      totalUsers: 18,
      activeUsers: 16,
      totalRoles: 22,
      activeSessionsLast24h: 8,
      auditLogsLast24h: 44,
    }
    state.health = {
      database: 'healthy',
      memory: {
        used: 128,
        total: 512,
        percentage: 25,
      },
      uptime: 3600,
      version: '1.0.0',
    }
    state.tenantsOverview = [
      {
        id: 'tenant-1',
        name: 'IAF Tenant',
        code: 'IAF',
        bankingMode: 'conventional',
        userCount: 10,
        isActive: true,
        createdAt: new Date('2026-02-24T00:00:00.000Z'),
      },
      {
        id: 'tenant-2',
        name: 'Syariah Tenant',
        code: 'SYR',
        bankingMode: 'syariah',
        userCount: 8,
        isActive: true,
        createdAt: new Date('2026-02-24T00:00:00.000Z'),
      },
    ]
    state.recentActivity = [
      {
        id: 'act-1',
        action: 'LOGIN',
        entityType: 'user',
        entityId: 'user-1',
        userId: 'maker-1',
        createdAt: new Date('2026-02-25T00:00:00.000Z'),
      },
    ]
    state.shouldFailStats = false
    state.recentActivityCalls = []

    getPlatformStatsMock.mockClear()
    getSystemHealthMock.mockClear()
    getTenantOverviewMock.mockClear()
    getRecentActivityMock.mockClear()
  })

  test('GET /api/v1/platform-admin/stats returns platform stats payload', async () => {
    const app = new OpenAPIHono()
    app.route('/api/v1/platform-admin', platformAdminRoutes)

    const response = await app.request('/api/v1/platform-admin/stats')
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data.totalTenants).toBe(4)
    expect(getPlatformStatsMock).toHaveBeenCalledTimes(1)
  })

  test('GET /api/v1/platform-admin/stats maps database failures to 500', async () => {
    state.shouldFailStats = true

    const app = new OpenAPIHono()
    app.route('/api/v1/platform-admin', platformAdminRoutes)

    const response = await app.request('/api/v1/platform-admin/stats')
    const body = await response.json()

    expect(response.status).toBe(500)
    expect(body.success).toBe(false)
    expect(body.code).toBe('DB_ERROR')
  })

  test('GET /api/v1/platform-admin/health returns system health payload', async () => {
    const app = new OpenAPIHono()
    app.route('/api/v1/platform-admin', platformAdminRoutes)

    const response = await app.request('/api/v1/platform-admin/health')
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data.database).toBe('healthy')
    expect(getSystemHealthMock).toHaveBeenCalledTimes(1)
  })

  test('GET /api/v1/platform-admin/tenants-overview returns list with total', async () => {
    const app = new OpenAPIHono()
    app.route('/api/v1/platform-admin', platformAdminRoutes)

    const response = await app.request('/api/v1/platform-admin/tenants-overview')
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.total).toBe(2)
    expect(body.data[0].id).toBe('tenant-1')
    expect(getTenantOverviewMock).toHaveBeenCalledTimes(1)
  })

  test('GET /api/v1/platform-admin/recent-activity parses query limit and forwards it', async () => {
    state.recentActivity = [
      {
        id: 'act-1',
        action: 'LOGIN',
        entityType: 'user',
        entityId: 'user-1',
        userId: 'maker-1',
        createdAt: new Date('2026-02-25T00:00:00.000Z'),
      },
      {
        id: 'act-2',
        action: 'LOGOUT',
        entityType: 'user',
        entityId: 'user-2',
        userId: 'checker-1',
        createdAt: new Date('2026-02-25T01:00:00.000Z'),
      },
    ]

    const app = new OpenAPIHono()
    app.route('/api/v1/platform-admin', platformAdminRoutes)

    const response = await app.request('/api/v1/platform-admin/recent-activity?limit=1')
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.total).toBe(1)
    expect(state.recentActivityCalls[0]).toBe(1)
  })

  test('GET /api/v1/platform-admin/dashboard combines all service sections', async () => {
    const app = new OpenAPIHono()
    app.route('/api/v1/platform-admin', platformAdminRoutes)

    const response = await app.request('/api/v1/platform-admin/dashboard')
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data.stats.totalUsers).toBe(18)
    expect(body.data.health.database).toBe('healthy')
    expect(body.data.tenantsOverview).toHaveLength(2)
    expect(state.recentActivityCalls).toContain(5)
  })

  test('GET /api/v1/platform-admin/infrastructure enriches health with service details', async () => {
    const app = new OpenAPIHono()
    app.route('/api/v1/platform-admin', platformAdminRoutes)

    const response = await app.request('/api/v1/platform-admin/infrastructure')
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data.services).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'API Server', status: 'running' }),
        expect.objectContaining({ name: 'Database', status: 'healthy' }),
      ])
    )
  })
})
