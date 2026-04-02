import { describe, expect, test } from 'bun:test'
import { OpenAPIHono } from '@hono/zod-openapi'

const { workflowRoutes } = await import('@/routes/workflow.routes')
const { formsRoutes } = await import('@/routes/forms.routes')

describe('workflow and forms validation response contracts', () => {
  test('POST /api/v1/workflow returns detailed 400 validation payload', async () => {
    const app = new OpenAPIHono()
    app.route('/api/v1/workflow', workflowRoutes)

    const response = await app.request('/api/v1/workflow', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        name: '',
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
        expect.objectContaining({ path: 'name' }),
      ])
    )
  })

  test('POST /api/v1/forms returns detailed 400 validation payload', async () => {
    const app = new OpenAPIHono()
    app.route('/api/v1/forms', formsRoutes)

    const response = await app.request('/api/v1/forms', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({}),
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
        expect.objectContaining({ path: 'name' }),
      ])
    )
  })
})
