import { describe, expect, mock, test } from 'bun:test'
import { OpenAPIHono } from '@hono/zod-openapi'
import { Effect } from 'effect'

const passthroughMiddleware = async (c: any, next: any) => {
  c.set('tenantId', 'tenant-config-1')
  c.set('userId', 'user-config-1')
  c.set('permissions', ['banking.parameter.bucket.manage', 'banking.parameter.pd.manage'])
  c.set('userPermissions', ['banking.parameter.bucket.manage', 'banking.parameter.pd.manage'])
  c.set('isSystemUser', false)
  await next()
}

mock.module('@/services/bucket-parameters.service', () => ({
  BucketParametersService: {
    listHeaders: () => Effect.succeed([]),
    getHeader: () => Effect.succeed({}),
    createHeader: () => Effect.succeed({}),
  },
}))

mock.module('../../services/bucket-parameters.service', () => ({
  BucketParametersService: {
    listHeaders: () => Effect.succeed([]),
    getHeader: () => Effect.succeed({}),
    createHeader: () => Effect.succeed({}),
  },
}))

mock.module('@/services/pd-configurations.service', () => ({
  PdConfigurationsService: {
    list: () => Effect.succeed([]),
    get: () => Effect.succeed({}),
    create: () => Effect.succeed({}),
  },
}))

mock.module('../../services/pd-configurations.service', () => ({
  PdConfigurationsService: {
    list: () => Effect.succeed([]),
    get: () => Effect.succeed({}),
    create: () => Effect.succeed({}),
  },
}))

mock.module('@/middleware/approval-interceptor.middleware', () => ({
  interceptCreate: (
    _tenantId: string,
    _userId: string,
    _permissions: string[],
    _entityType: string,
    _payload: unknown,
    executeCreate: () => Effect.Effect<unknown, unknown>
  ) => executeCreate(),
  interceptUpdate: () => Effect.succeed({ success: true }),
  interceptDelete: () => Effect.succeed({ success: true }),
}))

mock.module('../../middleware/approval-interceptor.middleware', () => ({
  interceptCreate: (
    _tenantId: string,
    _userId: string,
    _permissions: string[],
    _entityType: string,
    _payload: unknown,
    executeCreate: () => Effect.Effect<unknown, unknown>
  ) => executeCreate(),
  interceptUpdate: () => Effect.succeed({ success: true }),
  interceptDelete: () => Effect.succeed({ success: true }),
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

const { bucketParametersRoutes } = await import('@/routes/bucket-parameters.routes')
const { pdConfigurationsRoutes } = await import('@/routes/pd-configurations.routes')

describe('bucket and PD validation response contracts', () => {
  test('POST /api/v1/banking/collective/bucket returns detailed 400 validation payload', async () => {
    const app = new OpenAPIHono()
    app.route('/api/v1/banking/collective/bucket', bucketParametersRoutes)

    const response = await app.request('/api/v1/banking/collective/bucket', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        bucket_group_desc: 'Missing group',
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
        expect.objectContaining({ path: 'bucket_group' }),
      ])
    )
  })

  test('POST /api/v1/banking/parameters/pd-configurations returns detailed 400 validation payload', async () => {
    const app = new OpenAPIHono()
    app.route('/api/v1/banking/parameters/pd-configurations', pdConfigurationsRoutes)

    const response = await app.request('/api/v1/banking/parameters/pd-configurations', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        model_name: 'PD Model',
        population_segment_id: 10,
        selected_method: 'ROLL_RATE',
        fl_flag: true,
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
        expect.objectContaining({ path: 'fl_scalar_id' }),
      ])
    )
  })
})
