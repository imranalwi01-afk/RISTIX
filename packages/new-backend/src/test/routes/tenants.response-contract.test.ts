import { beforeEach, describe, expect, mock, test } from 'bun:test'
import { OpenAPIHono } from '@hono/zod-openapi'
import { Effect } from 'effect'

const makeTenant = (overrides: Record<string, unknown> = {}) => ({
  id: 'tenant-1',
  code: 'IAF',
  name: 'IAF Tenant',
  slug: 'iaf',
  description: 'IAF conventional tenant',
  type: 'banking',
  bankingMode: 'conventional',
  settings: { locale: 'id-ID' },
  isActive: true,
  createdAt: new Date('2026-02-24T00:00:00.000Z'),
  updatedAt: new Date('2026-02-25T00:00:00.000Z'),
  ...overrides,
})

const state = {
  getTenantsResult: {
    data: [makeTenant()],
    total: 1,
  },
  createTenantResult: makeTenant({ id: 'tenant-created', code: 'NEW', name: 'New Tenant', slug: 'new' }),
  getTenantByIdResult: makeTenant(),
  getTenantBySlugResult: makeTenant(),
  updateTenantResult: makeTenant({ name: 'IAF Tenant Updated' }),
  getTenantsCalls: [] as any[],
  createTenantCalls: [] as any[],
  getTenantByIdCalls: [] as any[],
  getTenantBySlugCalls: [] as any[],
  updateTenantCalls: [] as any[],
  deleteTenantCalls: [] as any[],
  enableTenantCalls: [] as any[],
  disableTenantCalls: [] as any[],
}

const getTenantsMock = mock((input: any) => {
  state.getTenantsCalls.push(input)
  return Effect.succeed(state.getTenantsResult)
})

const createTenantMock = mock((input: any) => {
  state.createTenantCalls.push(input)
  return Effect.succeed(state.createTenantResult)
})

const getTenantByIdMock = mock((id: string) => {
  state.getTenantByIdCalls.push(id)
  return Effect.succeed(state.getTenantByIdResult)
})

const getTenantBySlugMock = mock((slug: string) => {
  state.getTenantBySlugCalls.push(slug)
  return Effect.succeed(state.getTenantBySlugResult)
})

const updateTenantMock = mock((id: string, input: any) => {
  state.updateTenantCalls.push({ id, input })
  return Effect.succeed(state.updateTenantResult)
})

const deleteTenantMock = mock((id: string) => {
  state.deleteTenantCalls.push(id)
  return Effect.succeed(undefined)
})

const enableTenantMock = mock((id: string) => {
  state.enableTenantCalls.push(id)
  return Effect.succeed(undefined)
})

const disableTenantMock = mock((id: string) => {
  state.disableTenantCalls.push(id)
  return Effect.succeed(undefined)
})

const authMiddleware = async (c: any, next: any) => {
  const tenantHeader = c.req.header('x-test-tenant-id')
  if (tenantHeader !== 'none') {
    c.set('tenantId', tenantHeader || 'tenant-context-1')
  }
  c.set('userId', 'platform-user-1')
  c.set('isSystemUser', c.req.header('x-test-system-user') === 'true')
  await next()
}

mock.module('@/services/tenants.service', () => ({
  getTenants: getTenantsMock,
  createTenant: createTenantMock,
  getTenantById: getTenantByIdMock,
  getTenantBySlug: getTenantBySlugMock,
  updateTenant: updateTenantMock,
  deleteTenant: deleteTenantMock,
  enableTenant: enableTenantMock,
  disableTenant: disableTenantMock,
}))

mock.module('../../services/tenants.service', () => ({
  getTenants: getTenantsMock,
  createTenant: createTenantMock,
  getTenantById: getTenantByIdMock,
  getTenantBySlug: getTenantBySlugMock,
  updateTenant: updateTenantMock,
  deleteTenant: deleteTenantMock,
  enableTenant: enableTenantMock,
  disableTenant: disableTenantMock,
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

const { tenantsRoutes } = await import('@/routes/tenants.routes')

describe('tenants routes response contracts', () => {
  beforeEach(() => {
    state.getTenantsResult = { data: [makeTenant()], total: 1 }
    state.createTenantResult = makeTenant({ id: 'tenant-created', code: 'NEW', name: 'New Tenant', slug: 'new' })
    state.getTenantByIdResult = makeTenant()
    state.getTenantBySlugResult = makeTenant()
    state.updateTenantResult = makeTenant({ name: 'IAF Tenant Updated' })

    state.getTenantsCalls = []
    state.createTenantCalls = []
    state.getTenantByIdCalls = []
    state.getTenantBySlugCalls = []
    state.updateTenantCalls = []
    state.deleteTenantCalls = []
    state.enableTenantCalls = []
    state.disableTenantCalls = []

    getTenantsMock.mockClear()
    createTenantMock.mockClear()
    getTenantByIdMock.mockClear()
    getTenantBySlugMock.mockClear()
    updateTenantMock.mockClear()
    deleteTenantMock.mockClear()
    enableTenantMock.mockClear()
    disableTenantMock.mockClear()
  })

  test('GET /api/v1/tenants returns 403 for non-platform users', async () => {
    const app = new OpenAPIHono()
    app.route('/api/v1/tenants', tenantsRoutes)

    const response = await app.request('/api/v1/tenants')
    const body = await response.json()

    expect(response.status).toBe(403)
    expect(body.success).toBe(false)
    expect(body.error).toContain('Platform Admin')
  })

  test('GET /api/v1/tenants returns list and passes parsed filters/pagination', async () => {
    const app = new OpenAPIHono()
    app.route('/api/v1/tenants', tenantsRoutes)

    const response = await app.request(
      '/api/v1/tenants?page=2&perPage=5&sort=name&order=DESC&filter=%7B%22q%22%3A%22iaf%22%2C%22includeInactive%22%3A%22true%22%7D&mode=admin',
      { headers: { 'x-test-system-user': 'true' } }
    )
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.total).toBe(1)
    expect(body.data[0].id).toBe('tenant-1')
    expect(response.headers.get('X-Total-Count')).toBe('1')
    expect(state.getTenantsCalls[0]).toEqual({
      pagination: { page: 2, limit: 5, sort: 'name', order: 'desc' },
      search: 'iaf',
      bankingMode: undefined,
      includeInactive: true,
      includeSystem: true,
    })
  })

  test('POST /api/v1/tenants creates tenant for platform users', async () => {
    const app = new OpenAPIHono()
    app.route('/api/v1/tenants', tenantsRoutes)

    const response = await app.request('/api/v1/tenants', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-test-system-user': 'true',
      },
      body: JSON.stringify({
        code: 'NEW',
        name: 'New Tenant',
        slug: 'new',
        type: 'banking',
        bankingMode: 'conventional',
      }),
    })
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data.id).toBe('tenant-created')
    expect(state.createTenantCalls[0]).toMatchObject({
      code: 'NEW',
      name: 'New Tenant',
      slug: 'new',
    })
  })

  test('GET /api/v1/tenants/current returns 400 when tenant context is missing', async () => {
    const app = new OpenAPIHono()
    app.route('/api/v1/tenants', tenantsRoutes)

    const response = await app.request('/api/v1/tenants/current', {
      headers: { 'x-test-tenant-id': 'none' },
    })
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.success).toBe(false)
    expect(body.error).toContain('No tenant context')
  })

  test('GET /api/v1/tenants/current resolves tenant from context', async () => {
    const app = new OpenAPIHono()
    app.route('/api/v1/tenants', tenantsRoutes)

    const response = await app.request('/api/v1/tenants/current', {
      headers: { 'x-test-tenant-id': 'tenant-context-123' },
    })
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data.id).toBe('tenant-1')
    expect(state.getTenantByIdCalls).toContain('tenant-context-123')
  })

  test('GET /api/v1/tenants/slug/{slug} returns 404 when tenant does not exist', async () => {
    state.getTenantBySlugResult = null as any

    const app = new OpenAPIHono()
    app.route('/api/v1/tenants', tenantsRoutes)

    const response = await app.request('/api/v1/tenants/slug/missing')
    const body = await response.json()

    expect(response.status).toBe(404)
    expect(body.success).toBe(false)
    expect(state.getTenantBySlugCalls[0]).toBe('missing')
  })

  test('GET /api/v1/tenants/{id} returns success envelope', async () => {
    const app = new OpenAPIHono()
    app.route('/api/v1/tenants', tenantsRoutes)

    const response = await app.request('/api/v1/tenants/tenant-1')
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data.id).toBe('tenant-1')
    expect(state.getTenantByIdCalls).toContain('tenant-1')
  })

  test('PUT /api/v1/tenants/{id} updates tenant for platform users', async () => {
    const app = new OpenAPIHono()
    app.route('/api/v1/tenants', tenantsRoutes)

    const response = await app.request('/api/v1/tenants/tenant-1', {
      method: 'PUT',
      headers: {
        'content-type': 'application/json',
        'x-test-system-user': 'true',
      },
      body: JSON.stringify({
        name: 'IAF Tenant Updated',
        isActive: true,
      }),
    })
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data.name).toBe('IAF Tenant Updated')
    expect(state.updateTenantCalls[0]).toEqual({
      id: 'tenant-1',
      input: { name: 'IAF Tenant Updated', isActive: true },
    })
  })

  test('DELETE /api/v1/tenants/{id} returns deleted id', async () => {
    const app = new OpenAPIHono()
    app.route('/api/v1/tenants', tenantsRoutes)

    const response = await app.request('/api/v1/tenants/tenant-1', {
      method: 'DELETE',
      headers: { 'x-test-system-user': 'true' },
    })
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data).toEqual({ id: 'tenant-1' })
    expect(state.deleteTenantCalls[0]).toBe('tenant-1')
  })

  test('POST /api/v1/tenants/{id}/enable and /disable return success messages', async () => {
    const app = new OpenAPIHono()
    app.route('/api/v1/tenants', tenantsRoutes)

    const enableResponse = await app.request('/api/v1/tenants/tenant-1/enable', {
      method: 'POST',
      headers: { 'x-test-system-user': 'true' },
    })
    const disableResponse = await app.request('/api/v1/tenants/tenant-1/disable', {
      method: 'POST',
      headers: { 'x-test-system-user': 'true' },
    })

    const enableBody = await enableResponse.json()
    const disableBody = await disableResponse.json()

    expect(enableResponse.status).toBe(200)
    expect(disableResponse.status).toBe(200)
    expect(enableBody.success).toBe(true)
    expect(disableBody.success).toBe(true)
    expect(enableBody.message).toBe('Tenant enabled')
    expect(disableBody.message).toBe('Tenant disabled')
    expect(state.enableTenantCalls[0]).toBe('tenant-1')
    expect(state.disableTenantCalls[0]).toBe('tenant-1')
  })
})
