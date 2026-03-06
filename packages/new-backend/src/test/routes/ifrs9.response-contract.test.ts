import { beforeEach, describe, expect, mock, test } from 'bun:test'
import { OpenAPIHono } from '@hono/zod-openapi'

const getSummaryMock = mock((c: any) => c.json({ success: true, data: { totalEcl: 123 } }))
const getPortfolioTrendMock = mock((c: any) => c.json({ success: true, data: [{ period: '2026-01', ecl: 10 }] }))
const getAvailableDatesMock = mock((c: any) => c.json({ success: true, data: ['2026-01-31', '2026-02-29'] }))
const getBatchesMock = mock((c: any) => c.json({ success: true, data: [{ batchId: 'batch-1' }] }))
const runCalculationMock = mock((c: any) => c.json({ success: true, data: { executionId: 'exec-1' } }))
const runPreviewCalculationMock = mock((c: any) => c.json({ success: true, data: { executionId: 'preview-1' } }))
const getBatchResultsMock = mock((c: any) => c.json({ success: true, data: [{ calculationId: 'calc-1' }] }))

mock.module('@/controllers/ifrs9-calculations.controller', () => ({
  ifrs9CalculationsController: {
    getSummary: getSummaryMock,
    getPortfolioTrend: getPortfolioTrendMock,
    getAvailableDates: getAvailableDatesMock,
    getBatches: getBatchesMock,
    runCalculation: runCalculationMock,
    runPreviewCalculation: runPreviewCalculationMock,
    getBatchResults: getBatchResultsMock,
  },
}))

mock.module('../../controllers/ifrs9-calculations.controller', () => ({
  ifrs9CalculationsController: {
    getSummary: getSummaryMock,
    getPortfolioTrend: getPortfolioTrendMock,
    getAvailableDates: getAvailableDatesMock,
    getBatches: getBatchesMock,
    runCalculation: runCalculationMock,
    runPreviewCalculation: runPreviewCalculationMock,
    getBatchResults: getBatchResultsMock,
  },
}))

mock.module('@/controllers/ifrs9-reports.controller', () => ({
  ifrs9ReportsController: {},
}))

mock.module('../../controllers/ifrs9-reports.controller', () => ({
  ifrs9ReportsController: {},
}))

const { ifrs9Routes } = await import('@/routes/ifrs9.routes')

describe('ifrs9 routes response contracts', () => {
  beforeEach(() => {
    getSummaryMock.mockClear()
    getPortfolioTrendMock.mockClear()
    getAvailableDatesMock.mockClear()
    getBatchesMock.mockClear()
    runCalculationMock.mockClear()
    runPreviewCalculationMock.mockClear()
    getBatchResultsMock.mockClear()
  })

  test('controller-backed IFRS9 endpoints return delegated payloads', async () => {
    const app = new OpenAPIHono()
    app.route('/api/v1/ifrs9', ifrs9Routes)

    const summaryResponse = await app.request('/api/v1/ifrs9/calculations/summary?date=2026-02-29')
    const trendResponse = await app.request('/api/v1/ifrs9/calculations/portfolio-trend')
    const datesResponse = await app.request('/api/v1/ifrs9/available-dates')
    const batchesResponse = await app.request('/api/v1/ifrs9/calculation-batches')
    const eclResponse = await app.request('/api/v1/ifrs9/calculations/ecl', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ segment: 'retail' }),
    })
    const previewResponse = await app.request('/api/v1/ifrs9/calculations/ecl/preview', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ segment: 'retail' }),
    })

    expect(summaryResponse.status).toBe(200)
    expect((await summaryResponse.json()).data.totalEcl).toBe(123)

    expect(trendResponse.status).toBe(200)
    expect((await trendResponse.json()).data[0].period).toBe('2026-01')

    expect(datesResponse.status).toBe(200)
    expect((await datesResponse.json()).data).toContain('2026-01-31')

    expect(batchesResponse.status).toBe(200)
    expect((await batchesResponse.json()).data[0].batchId).toBe('batch-1')

    expect(eclResponse.status).toBe(200)
    expect((await eclResponse.json()).data.executionId).toBe('exec-1')
    expect(previewResponse.status).toBe(200)
    expect((await previewResponse.json()).data.executionId).toBe('preview-1')

    expect(getSummaryMock).toHaveBeenCalledTimes(1)
    expect(getPortfolioTrendMock).toHaveBeenCalledTimes(1)
    expect(getAvailableDatesMock).toHaveBeenCalledTimes(1)
    expect(getBatchesMock).toHaveBeenCalledTimes(1)
    expect(runCalculationMock).toHaveBeenCalledTimes(1)
    expect(runPreviewCalculationMock).toHaveBeenCalledTimes(1)
  })

  test('GET /api/v1/ifrs9/calculations returns stub list envelope', async () => {
    const app = new OpenAPIHono()
    app.route('/api/v1/ifrs9', ifrs9Routes)

    const response = await app.request('/api/v1/ifrs9/calculations')
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(Array.isArray(body.data)).toBe(true)
    expect(body.message).toContain('stub implementation')
  })

  test('GET /api/v1/ifrs9/calculations/batch-results resolves before /calculations/{id}', async () => {
    const app = new OpenAPIHono()
    app.route('/api/v1/ifrs9', ifrs9Routes)

    const response = await app.request('/api/v1/ifrs9/calculations/batch-results?date=2026-02-29')
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data[0].calculationId).toBe('calc-1')
    expect(getBatchResultsMock).toHaveBeenCalledTimes(1)
  })

  test('GET /api/v1/ifrs9/calculations/{id} returns stub detail payload', async () => {
    const app = new OpenAPIHono()
    app.route('/api/v1/ifrs9', ifrs9Routes)

    const response = await app.request('/api/v1/ifrs9/calculations/calc-123')
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data.calculationId).toBe('calc-123')
    expect(body.data.status).toBe('completed')
  })

  test('POST /api/v1/ifrs9/calculate returns queued stub payload', async () => {
    const app = new OpenAPIHono()
    app.route('/api/v1/ifrs9', ifrs9Routes)

    const response = await app.request('/api/v1/ifrs9/calculate', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ modelId: 'model-1' }),
    })
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data.status).toBe('queued')
    expect(String(body.data.calculationId)).toContain('calc-')
  })
})
