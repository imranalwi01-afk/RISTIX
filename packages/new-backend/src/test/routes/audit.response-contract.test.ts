import { beforeEach, describe, expect, mock, test } from 'bun:test'
import { OpenAPIHono } from '@hono/zod-openapi'

const authMiddleware = async (c: any, next: any) => {
  c.set('tenantId', 'tenant-audit-1')
  c.set('userId', 'user-audit-1')
  await next()
}

const getDatabaseMock = mock(() => ({
  select: () => ({
    from: () => ({
      where: () => ({
        limit: async () => [],
      }),
    }),
  }),
}))

mock.module('@/config/database', () => ({
  db: {},
  getDatabase: getDatabaseMock,
}))

mock.module('../../config/database', () => ({
  db: {},
  getDatabase: getDatabaseMock,
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

const { auditRoutes } = await import('@/routes/audit.routes')

describe('audit routes response contracts', () => {
  beforeEach(() => {
    getDatabaseMock.mockClear()
  })

  test('GET /api/v1/audit/logs/{id} returns standardized 404 envelope', async () => {
    const app = new OpenAPIHono()
    app.route('/api/v1/audit', auditRoutes)

    const response = await app.request('/api/v1/audit/logs/missing-log-id')
    const body = await response.json()

    expect(response.status).toBe(404)
    expect(body).toMatchObject({
      success: false,
      code: 'NOT_FOUND',
      error: 'Audit log not found',
      message: 'Audit log not found',
    })
    expect(typeof body.requestId === 'string' || body.requestId === null).toBe(true)
    expect(typeof body.timestamp).toBe('string')
  })
})
