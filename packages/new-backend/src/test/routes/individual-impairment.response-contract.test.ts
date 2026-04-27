import { beforeEach, describe, expect, mock, test } from 'bun:test'
import { OpenAPIHono } from '@hono/zod-openapi'

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
  },
}))

mock.module('../../services/individual-impairment.service', () => ({
  individualImpairmentService: {
    getWatchlist: watchlistMock,
    getReports: reportsMock,
  },
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

describe('individual impairment route response contracts', () => {
  beforeEach(() => {
    watchlistMock.mockClear()
    reportsMock.mockClear()
  })

  test('GET /watchlist returns master-account list contract with debug source metadata', async () => {
    const app = new OpenAPIHono()
    app.route('/api/v1/banking/individual/impairment', individualImpairmentRoutes)

    const response = await app.request(
      '/api/v1/banking/individual/impairment/watchlist?page=2&limit=25&search=ACC&dateFrom=2023-12-31&dateTo=2023-12-31&sortField=outstanding&sortOrder=desc'
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

  test('GET /reports returns IA header list contract with techspec debug metadata', async () => {
    const app = new OpenAPIHono()
    app.route('/api/v1/banking/individual/impairment', individualImpairmentRoutes)

    const response = await app.request(
      '/api/v1/banking/individual/impairment/reports?page=1&limit=10&search=Customer&dateFrom=2023-12-31&dateTo=2023-12-31&sortField=accountNumber&sortOrder=asc'
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
    app.route('/api/v1/banking/individual/impairment', individualImpairmentRoutes)

    const response = await app.request('/api/v1/banking/individual/impairment/reports?sortField=unsafe')
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body).toMatchObject({
      success: false,
      code: 'INVALID_LIST_QUERY',
      details: [expect.objectContaining({ field: 'sort.unsafe' })],
    })
    expect(reportsMock).toHaveBeenCalledTimes(0)
  })
})
