import { beforeEach, describe, expect, mock, test } from 'bun:test'
import { OpenAPIHono } from '@hono/zod-openapi'
import { Effect } from 'effect'

const headerRows: Array<Record<string, any>> = []
const detailRows: Array<Record<string, any>> = []

const frs9ParamSegmenth = {
  __table: 'segmenth',
  pkid: 'pkid',
  groupSegment: 'groupSegment',
  segment: 'segment',
  subSegment: 'subSegment',
  segmentType: 'segmentType',
  seq: 'seq',
  activeFlag: 'activeFlag',
  createdby: 'createdby',
  createddate: 'createddate',
  createdhost: 'createdhost',
  updatedby: 'updatedby',
  updateddate: 'updateddate',
  updatedhost: 'updatedhost',
}

const frs9ParamSegmentd = {
  __table: 'segmentd',
  pkid: 'pkid',
  segmentId: 'segmentId',
  queryGroup: 'queryGroup',
  seq: 'seq',
  tableName: 'tableName',
  columnName: 'columnName',
  dataType: 'dataType',
  operator: 'operator',
  value1: 'value1',
  value2: 'value2',
  condition: 'condition',
  createdby: 'createdby',
  createddate: 'createddate',
  createdhost: 'createdhost',
  updatedby: 'updatedby',
  updateddate: 'updateddate',
  updatedhost: 'updatedhost',
}

const fakeDb: any = {
  select: () => ({
    from: (table: { __table: string }) => ({
      where: async () => (table.__table === 'segmenth' ? [...headerRows] : [...detailRows]),
      orderBy: async () => (table.__table === 'segmenth' ? [...headerRows] : [...detailRows]),
    }),
  }),
  insert: () => ({
    values: () => ({
      returning: async () => [{ id: 999 }],
    }),
  }),
  update: () => ({
    set: () => ({
      where: () => ({
        returning: async () => [{ id: 999 }],
      }),
    }),
  }),
  delete: () => ({
    where: async () => undefined,
  }),
  transaction: async (fn: (tx: typeof fakeDb) => Promise<unknown>) => fn(fakeDb),
}

const passthroughMiddleware = async (c: any, next: any) => {
  c.set('tenantId', 'tenant-seg-1')
  c.set('userId', 'user-seg-1')
  c.set('permissions', ['banking.parameter.segmentation.manage'])
  c.set('userPermissions', ['banking.parameter.segmentation.manage'])
  c.set('isSystemUser', false)
  await next()
}

mock.module('@/config', () => ({
  legacyDb: fakeDb,
}))

mock.module('../../config', () => ({
  legacyDb: fakeDb,
}))

mock.module('@/db/schema', () => ({
  frs9ParamSegmenth,
  frs9ParamSegmentd,
  frs9ParamCommond: { value1: 'value1', paramdesc: 'paramdesc', paramCode: 'paramCode', paramSeq: 'paramSeq' },
}))

mock.module('../../db/schema', () => ({
  frs9ParamSegmenth,
  frs9ParamSegmentd,
  frs9ParamCommond: { value1: 'value1', paramdesc: 'paramdesc', paramCode: 'paramCode', paramSeq: 'paramSeq' },
}))

mock.module('@/middleware', () => ({
  authMiddleware: passthroughMiddleware,
}))

mock.module('../../middleware', () => ({
  authMiddleware: passthroughMiddleware,
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
  interceptUpdate: (
    _tenantId: string,
    _userId: string,
    _permissions: string[],
    _entityType: string,
    _entityId: string,
    _payload: unknown,
    executeUpdate: () => Effect.Effect<unknown, unknown>
  ) => executeUpdate(),
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
  interceptUpdate: (
    _tenantId: string,
    _userId: string,
    _permissions: string[],
    _entityType: string,
    _entityId: string,
    _payload: unknown,
    executeUpdate: () => Effect.Effect<unknown, unknown>
  ) => executeUpdate(),
  interceptDelete: () => Effect.succeed({ success: true }),
}))

const { segmentationRoutes } = await import('@/routes/segmentation.routes')

describe('segmentation routes duplicate sequence protection', () => {
  beforeEach(() => {
    headerRows.length = 0
    detailRows.length = 0
  })

  test('POST /api/v1/banking/collective/segmentation returns 409 for duplicate header seq in same segment type', async () => {
    headerRows.push({
      id: 10,
      group_segment: 'Test003',
      segment: 'Test',
      seq: 26,
    })

    const app = new OpenAPIHono()
    app.route('/api/v1/banking/collective/segmentation', segmentationRoutes)

    const response = await app.request('/api/v1/banking/collective/segmentation', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        group_segment: 'Test003',
        segment: 'Another',
        segment_type: 'CORPORATE',
        seq: 26,
        active_flag: true,
      }),
    })
    const body = await response.json()

    expect(response.status).toBe(409)
    expect(body).toMatchObject({
      success: false,
      code: 'CONFLICT',
      error: 'Sequence 26 already exists for segment type CORPORATE',
      details: expect.objectContaining({
        field: 'seq',
        value: 26,
        segmentType: 'CORPORATE',
      }),
    })
  })

  test('POST /api/v1/banking/collective/segmentation/{id}/details returns 409 for duplicate detail seq in same query group', async () => {
    detailRows.push({
      id: 44,
      query_group: 1,
    })

    const app = new OpenAPIHono()
    app.route('/api/v1/banking/collective/segmentation', segmentationRoutes)

    const response = await app.request('/api/v1/banking/collective/segmentation/300/details', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        query_group: 1,
        seq: 2,
        table_name: 'FRS9_MASTER_ACCOUNT',
        column_name: 'DPD',
        data_type: 'NUMBER',
        operator: '>',
        value1: '30',
        condition: 'AND',
      }),
    })
    const body = await response.json()

    expect(response.status).toBe(409)
    expect(body).toMatchObject({
      success: false,
      code: 'CONFLICT',
      error: 'Sequence 2 already exists for query group 1',
      details: expect.objectContaining({
        field: 'seq',
        value: 2,
        segmentId: 300,
        queryGroup: 1,
      }),
    })
  })
})
