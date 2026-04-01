import { beforeEach, describe, expect, mock, test } from 'bun:test'
import { OpenAPIHono } from '@hono/zod-openapi'
import { Effect, pipe } from 'effect'

const fakeProduct = {
  id: 11,
  pkid: 11,
  dataSource: 'SRC',
  prdGroup: 'GRP',
  prdType: 'TYPE',
  prdCode: 'PRD001',
  prdDesc: 'Product 001',
  currency: 'IDR',
  activeFlag: true,
}

const fakeJournal = {
  id: 21,
  glGroup: 'GL-GRP',
  currency: 'IDR',
  glType: 'TYPE',
  glCode: 'GL001',
  glNumber: '1001',
  dbcr: 'D',
  glDesc: 'Journal 001',
  activeFlag: true,
}

type CreateMode = 'direct' | 'approval'
let productCreateMode: CreateMode = 'approval'
let journalCreateMode: CreateMode = 'approval'

const productListMock = mock(() =>
  Effect.succeed({
    products: [fakeProduct],
    pagination: { total: 1, page: 1, limit: 10, pages: 1 },
  })
)
const productCreateMock = mock(() => Effect.succeed(fakeProduct))

const journalListMock = mock(() => Effect.succeed([fakeJournal]))
const journalCreateMock = mock(() => Effect.succeed(fakeJournal))

const interceptCreateMock = mock(
  (
    _tenantId: string,
    _userId: string,
    _userPermissions: string[],
    entityType: string,
    _payload: unknown,
    executeCreate: () => any
  ) => {
    if (entityType === 'product_parameter' && productCreateMode === 'approval') {
      return Effect.succeed({
        success: true,
        approvalRequired: true,
        requestId: 'REQ-PROD-001',
        message: 'Product parameter submitted for approval',
      })
    }

    if (entityType === 'journal_parameter' && journalCreateMode === 'approval') {
      return Effect.succeed({
        success: true,
        approvalRequired: true,
        requestId: 'REQ-JRN-001',
        message: 'Journal parameter submitted for approval',
      })
    }

    return pipe(
      executeCreate(),
      Effect.map((data: unknown) => ({
        success: true,
        approvalRequired: false,
        data,
      }))
    )
  }
)

const passthroughMiddleware = async (c: any, next: any) => {
  c.set('tenantId', 'tenant-params-1')
  c.set('userId', 'user-params-1')
  c.set('permissions', ['banking.parameters.product.manage', 'banking.parameters.journal.manage'])
  c.set('userPermissions', ['banking.parameters.product.manage', 'banking.parameters.journal.manage'])
  c.set('isSystemUser', false)
  await next()
}

mock.module('@/services/product-parameters.service', () => ({
  ProductParametersService: {
    list: productListMock,
    create: productCreateMock,
  },
}))

mock.module('../../services/product-parameters.service', () => ({
  ProductParametersService: {
    list: productListMock,
    create: productCreateMock,
  },
}))

mock.module('@/services/journal-parameters.service', () => ({
  JournalParametersService: {
    list: journalListMock,
    create: journalCreateMock,
  },
}))

mock.module('../../services/journal-parameters.service', () => ({
  JournalParametersService: {
    list: journalListMock,
    create: journalCreateMock,
  },
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

const { productParameterRoutes } = await import('@/routes/product-parameters.routes')
const { journalParameterRoutes } = await import('@/routes/journal-parameters.routes')

describe('product and journal parameter routes response contracts', () => {
  beforeEach(() => {
    productCreateMode = 'approval'
    journalCreateMode = 'approval'
    productListMock.mockClear()
    productCreateMock.mockClear()
    journalListMock.mockClear()
    journalCreateMock.mockClear()
    interceptCreateMock.mockClear()
  })

  test('GET /api/v1/banking/collective/product/{id} returns standardized 400 for invalid id', async () => {
    const app = new OpenAPIHono()
    app.route('/api/v1/banking/collective/product', productParameterRoutes)

    const response = await app.request('/api/v1/banking/collective/product/not-a-number')
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body).toMatchObject({
      success: false,
      code: 'BAD_REQUEST',
      error: 'Invalid ID',
      message: 'Invalid ID',
    })
    expect(body).toHaveProperty('requestId')
    expect(typeof body.timestamp).toBe('string')
  })

  test('POST /api/v1/banking/collective/product returns 202 approval envelope', async () => {
    const app = new OpenAPIHono()
    app.route('/api/v1/banking/collective/product', productParameterRoutes)

    const response = await app.request('/api/v1/banking/collective/product', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        mode: 'conventional',
        dataSource: 'SRC',
        prdGroup: 'GRP',
        prdType: 'TYPE',
        prdCode: 'PRD001',
        prdDesc: 'Product 001',
        currency: 'IDR',
      }),
    })
    const body = await response.json()

    expect(response.status).toBe(202)
    expect(body).toMatchObject({
      success: true,
      approvalRequired: true,
      requestId: 'REQ-PROD-001',
      message: 'Product parameter submitted for approval',
    })
    expect(productCreateMock).toHaveBeenCalledTimes(0)
  })

  test('POST /api/v1/banking/collective/product returns detailed 400 validation payload', async () => {
    const app = new OpenAPIHono()
    app.route('/api/v1/banking/collective/product', productParameterRoutes)

    const response = await app.request('/api/v1/banking/collective/product', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        mode: 'conventional',
        dataSource: 'SRC',
        prdGroup: 'GRP',
        prdType: 'TYPE',
        prdCode: 'PRD001',
        prdDesc: 'Product 001',
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
    expect(Array.isArray(body.details)).toBe(true)
    expect(body.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: 'currency',
        }),
      ])
    )
  })

  test('GET /api/v1/banking/collective/journal/{id} returns standardized 400 for invalid id', async () => {
    const app = new OpenAPIHono()
    app.route('/api/v1/banking/collective/journal', journalParameterRoutes)

    const response = await app.request('/api/v1/banking/collective/journal/not-a-number')
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body).toMatchObject({
      success: false,
      code: 'BAD_REQUEST',
      error: 'Invalid ID',
      message: 'Invalid ID',
    })
    expect(body).toHaveProperty('requestId')
    expect(typeof body.timestamp).toBe('string')
  })

  test('POST /api/v1/banking/collective/journal returns 202 approval envelope', async () => {
    const app = new OpenAPIHono()
    app.route('/api/v1/banking/collective/journal', journalParameterRoutes)

    const response = await app.request('/api/v1/banking/collective/journal', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        glGroup: 'GL-GRP',
        currency: 'IDR',
        glType: 'TYPE',
        glCode: 'GL001',
        glNumber: '1001',
        dbcr: 'D',
        glDesc: 'Journal 001',
      }),
    })
    const body = await response.json()

    expect(response.status).toBe(202)
    expect(body).toMatchObject({
      success: true,
      approvalRequired: true,
      requestId: 'REQ-JRN-001',
      message: 'Journal parameter submitted for approval',
    })
    expect(journalCreateMock).toHaveBeenCalledTimes(0)
  })
})
