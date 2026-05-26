import { beforeEach, describe, expect, mock, test } from 'bun:test'
import { OpenAPIHono } from '@hono/zod-openapi'
import { Effect } from 'effect'

const watchlistMock = mock(() =>
  Promise.resolve({
    data: [
      {
        pkid: 1001,
        prc_date: '2023-12-31',
        cif_number: 'CIF-1',
        cif_name: 'Customer One',
        account_id: 501,
        account_number: 'ACC-501',
        currency: 'IDR',
        outstanding_balance: 1500000,
        dpd: 45,
        collectability: 3,
        rating_code: 'R3',
        stage: 2,
        assessment_status: 'PENDING',
        priority_level: 'MEDIUM',
      },
    ],
    total: 1,
  })
)

const reportsMock = mock(() =>
  Promise.resolve({
    data: [
      {
        pkid: 2001,
        ia_id: 901,
        download_date: '2023-12-31',
        customer_number: 'CIF-2',
        customer_name: 'Customer Two',
        account_id: 502,
        account_number: 'ACC-502',
        currency: 'IDR',
        outstanding: 2500000,
        day_past_due: 64,
        collectability: 4,
        rating: 'R4',
        ead_amt: 2500000,
        pv_dcf_amt: 1750000,
        ecl_ia_amt: 750000,
        status: 'PENDING',
      },
    ],
    total: 1,
  })
)

const createOverrideMock = mock((input: any) =>
  Promise.resolve([{ pkid: 3001, accountNumber: input.accountNumber, status: 0 }])
)

const createApprovalRequestMock = mock((input: any) =>
  Effect.succeed({
    id: 'approval-v2-override-1',
    status: 'pending',
    currentLevel: 1,
    approvalsRequired: 2,
    approvalsReceived: 0,
    ...input,
  })
)

const passthroughMiddleware = async (c: any, next: any) => {
  c.set('user', {
    id: 'user-individual-1',
    tenantId: 'tenant-individual-1',
    email: 'individual@ifrspro.id',
  })
  c.set('tenantId', 'tenant-individual-1')
  c.set('userId', 'user-individual-1')
  await next()
}

mock.module('@/services/individual-impairment.service', () => ({
  individualImpairmentService: {
    getWatchlist: watchlistMock,
    getReports: reportsMock,
    createOverride: createOverrideMock,
  },
}))

mock.module('../../services/individual-impairment.service', () => ({
  individualImpairmentService: {
    getWatchlist: watchlistMock,
    getReports: reportsMock,
    createOverride: createOverrideMock,
  },
}))

mock.module('@/services/individual-impairment-v2.service', () => ({
  individualImpairmentV2Service: {
    getWatchlist: watchlistMock,
    getReports: reportsMock,
    createOverride: createOverrideMock,
  },
}))

mock.module('../../services/individual-impairment-v2.service', () => ({
  individualImpairmentV2Service: {
    getWatchlist: watchlistMock,
    getReports: reportsMock,
    createOverride: createOverrideMock,
  },
}))

mock.module('@/services/approval.service', () => ({
  createApprovalRequest: createApprovalRequestMock,
}))

mock.module('../../services/approval.service', () => ({
  createApprovalRequest: createApprovalRequestMock,
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

const { individualImpairmentRoutes } = await import('@/routes/individual-impairment.routes')
const { individualImpairmentV2Routes } = await import('@/routes/individual-impairment-v2.routes')

describe('individual impairment route response contracts', () => {
  beforeEach(() => {
    watchlistMock.mockClear()
    reportsMock.mockClear()
    createOverrideMock.mockClear()
    createApprovalRequestMock.mockClear()
  })

  test('v1 and v2 route instances are separate objects', () => {
    expect(individualImpairmentV2Routes).not.toBe(individualImpairmentRoutes)
  })

  test('GET /watchlist returns master-account list contract with debug source metadata', async () => {
    const app = new OpenAPIHono()
    app.route('/api/v2/individual-impairment', individualImpairmentV2Routes)

    const response = await app.request(
      '/api/v2/individual-impairment/watchlist?page=2&limit=25&search=ACC&dateFrom=2023-12-31&dateTo=2023-12-31&sortField=outstanding&sortOrder=desc'
    )
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toMatchObject({
      success: true,
      pagination: {
        mode: 'offset',
        page: 2,
        limit: 25,
        total: 1,
      },
      meta: {
        debug: {
          selectedSource: 'FRS9_MASTER_ACCOUNT',
          sourceTables: ['public.frs9_master_account', 'public.frs9_imp_ia_header'],
        },
      },
    })
    expect(body.data[0]).toMatchObject({
      account_number: 'ACC-501',
      dpd: 45,
      outstanding_balance: 1500000,
    })
    expect(body.appliedQuery).toMatchObject({
      search: 'ACC',
      filters: {
        dateFrom: '2023-12-31',
        dateTo: '2023-12-31',
      },
      sort: [{ field: 'outstanding', direction: 'desc' }],
    })
    expect(watchlistMock).toHaveBeenCalledWith('tenant-individual-1', expect.objectContaining({
      search: 'ACC',
      dateFrom: '2023-12-31',
      dateTo: '2023-12-31',
      limit: 25,
      offset: 25,
      sort: [{ field: 'outstanding', direction: 'desc' }],
    }))
  })

  test('GET /watchlist passes assessment_status filter (Approved) to service', async () => {
    const app = new OpenAPIHono()
    app.route('/api/v2/individual-impairment', individualImpairmentV2Routes)

    const response = await app.request(
      '/api/v2/individual-impairment/watchlist?page=1&limit=10&search=000373200118&assessment_status=Approved'
    )
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toMatchObject({
      success: true,
      appliedQuery: {
        search: '000373200118',
        filters: {
          assessment_status: 'Approved',
        },
      },
    })

    expect(watchlistMock).toHaveBeenCalledWith(
      'tenant-individual-1',
      expect.objectContaining({
        search: '000373200118',
        status: 'Approved',
        limit: 10,
        offset: 0,
      })
    )
  })

  test('GET /reports returns IA header list contract with techspec debug metadata', async () => {
    const app = new OpenAPIHono()
    app.route('/api/v2/individual-impairment', individualImpairmentV2Routes)

    const response = await app.request(
      '/api/v2/individual-impairment/reports?page=1&limit=10&search=Customer&dateFrom=2023-12-31&dateTo=2023-12-31&sortField=accountNumber&sortOrder=asc'
    )
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toMatchObject({
      success: true,
      pagination: {
        mode: 'offset',
        page: 1,
        limit: 10,
        total: 1,
      },
      meta: {
        debug: {
          selectedSource: 'FRS9_IMP_IA_HEADER',
          sourceTables: ['public.frs9_imp_ia_header'],
        },
      },
    })
    expect(body.data[0]).toMatchObject({
      account_number: 'ACC-502',
      ecl_ia_amt: 750000,
      status: 'PENDING',
    })
    expect(reportsMock).toHaveBeenCalledWith('tenant-individual-1', expect.objectContaining({
      search: 'Customer',
      dateFrom: '2023-12-31',
      dateTo: '2023-12-31',
      limit: 10,
      offset: 0,
      sort: [{ field: 'accountNumber', direction: 'asc' }],
    }))
  })

  test('GET /reports rejects invalid sort field with detailed list-query 400', async () => {
    const app = new OpenAPIHono()
    app.route('/api/v2/individual-impairment', individualImpairmentV2Routes)

    const response = await app.request('/api/v2/individual-impairment/reports?sortField=unsafe')
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body).toMatchObject({
      success: false,
      code: 'INVALID_LIST_QUERY',
      details: [expect.objectContaining({ field: 'sort.unsafe' })],
    })
    expect(reportsMock).toHaveBeenCalledTimes(0)
  })

  test('legacy v1 individual impairment path remains mounted for compatibility', async () => {
    const app = new OpenAPIHono()
    app.route('/api/v1/banking/individual/impairment', individualImpairmentRoutes)

    const response = await app.request('/api/v1/banking/individual/impairment/watchlist?page=1&limit=10')
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toMatchObject({
      success: true,
      meta: {
        debug: {
          endpoint: 'GET /api/v1/banking/individual/impairment/watchlist',
          selectedSource: 'FRS9_MASTER_ACCOUNT',
        },
      },
    })
  })

  test('POST /api/v2/individual-impairment/overrides creates approval request instead of live override', async () => {
    const app = new OpenAPIHono()
    app.route('/api/v2/individual-impairment', individualImpairmentV2Routes)

    const response = await app.request('/api/v2/individual-impairment/overrides', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        accountNumber: 'ACC-501',
        customerName: 'Customer One',
        overrideStage: 2,
        justification: 'Needs manual v2 review',
      }),
    })
    const body = await response.json()

    expect(response.status).toBe(202)
    expect(body).toMatchObject({
      success: true,
      approvalRequired: true,
      requestId: 'approval-v2-override-1',
    })
    expect(createOverrideMock).toHaveBeenCalledTimes(0)
    expect(createApprovalRequestMock).toHaveBeenCalledWith(expect.objectContaining({
      tenantId: 'tenant-individual-1',
      entityType: 'individual_impairment_v2',
      entityId: 'ACC-501',
      requestedBy: 'user-individual-1',
      impactLevel: 'high',
      requestData: expect.objectContaining({
        operation: 'create',
        entityType: 'individual_impairment_v2',
        subtype: 'override',
        apiVersion: 'v2',
        sourceApi: '/api/v2/individual-impairment',
        data: expect.objectContaining({
          accountNumber: 'ACC-501',
          requestedBy: 'user-individual-1',
          createdBy: 'user-individual-1',
        }),
      }),
    }))
  })

  test('POST legacy v1 /overrides still executes live override directly', async () => {
    const app = new OpenAPIHono()
    app.route('/api/v1/banking/individual/impairment', individualImpairmentRoutes)

    const response = await app.request('/api/v1/banking/individual/impairment/overrides', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        accountNumber: 'ACC-501',
        customerName: 'Customer One',
        overrideStage: 2,
        justification: 'Legacy direct override',
      }),
    })
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toMatchObject({
      success: true,
      data: {
        accountNumber: 'ACC-501',
      },
    })
    expect(createApprovalRequestMock).toHaveBeenCalledTimes(0)
    expect(createOverrideMock).toHaveBeenCalledWith(expect.objectContaining({
      accountNumber: 'ACC-501',
      tenantId: 'tenant-individual-1',
      requestedBy: 'user-individual-1',
      createdBy: 'user-individual-1',
    }))
  })
})
