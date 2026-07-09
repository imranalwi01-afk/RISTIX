import { beforeEach, describe, expect, mock, test } from 'bun:test'
import { OpenAPIHono } from '@hono/zod-openapi'
import { Effect } from 'effect'
import { fileURLToPath } from 'node:url'

const approvalRepositoryPath = '@/repositories/approval.repository'
const rbacRepositoryPath = '@/repositories/rbac.repository'
const configDatabaseAliasPath = '@/config/database'
const dbSchemaAliasPath = '@/db/schema'
const approvalHelpersPath = '@/lib/approval-helpers'
const notificationSocketPath = '@/socket/notification.socket'
const notificationRepositoryPath = '@/repositories/notification.repository'
const notificationsServicePath = '@/services/notifications.service'
const middlewareAliasPath = '@/middleware'
const middlewareIndexPath = fileURLToPath(new URL('../../middleware/index.ts', import.meta.url))
const auditServiceAliasPath = '@/services/audit.service'
const auditServicePath = fileURLToPath(new URL('../../services/audit.service.ts', import.meta.url))
const configIndexPath = fileURLToPath(new URL('../../config/index.ts', import.meta.url))
const dbSchemaIndexPath = fileURLToPath(new URL('../../db/schema/index.ts', import.meta.url))
const productParametersServicePath = fileURLToPath(new URL('../../services/product-parameters.service.ts', import.meta.url))

const stores = {
  productParameters: new Map<number, Record<string, any>>(),
  eadConfigurations: [] as Array<Record<string, any>>,
  segmentationHeaders: [] as Array<Record<string, any>>,
  segmentationDetails: [] as Array<Record<string, any>>,
}

const counters = {
  ead: 200,
  segmentHeader: 300,
  segmentDetail: 400,
}

let currentRequest: any
let currentUserId = 'approver-1'
let currentIsSystemUser = false
let currentRoleCode = 'ACCOUNTING_APPROVER'
let currentPermissions = ['approval.requests.approve']
const actionRows: any[] = []
const updateRequestCalls: Array<Record<string, any>> = []
const auditApprovedCalls: Array<Record<string, any>> = []
const auditRejectedCalls: Array<Record<string, any>> = []
const auditInfoRequestedCalls: Array<Record<string, any>> = []
const auditDelegatedCalls: Array<Record<string, any>> = []
const auditCancelledCalls: Array<Record<string, any>> = []

const table = <T extends string>(name: T, columns: string[]) =>
  Object.assign({ __table: name }, Object.fromEntries(columns.map((column) => [column, column])))

const schema = {
  approvalRequests: table('approvalRequests', ['id', 'tenantId', 'status', 'entityType', 'completedAt', 'createdAt']),
  userRoles: table('userRoles', ['userId']),
  frs9ImpCaEadConfig: table('eadConfigurations', ['pkid']),
  frs9ParamSegmenth: table('segmentationHeaders', ['pkid']),
  frs9ParamSegmentd: table('segmentationDetails', ['pkid', 'segmentId']),
}

function resetState() {
  stores.productParameters.clear()
  stores.eadConfigurations = []
  stores.segmentationHeaders = []
  stores.segmentationDetails = []
  counters.ead = 200
  counters.segmentHeader = 300
  counters.segmentDetail = 400
  actionRows.length = 0
  updateRequestCalls.length = 0
  auditApprovedCalls.length = 0
  auditRejectedCalls.length = 0
  auditInfoRequestedCalls.length = 0
  auditDelegatedCalls.length = 0
  auditCancelledCalls.length = 0
  currentUserId = 'approver-1'
  currentIsSystemUser = false
  currentRoleCode = 'ACCOUNTING_APPROVER'
  currentPermissions = ['approval.requests.approve']
  currentRequest = null
}

function mapStore(tableName: string): Array<Record<string, any>> {
  switch (tableName) {
    case 'eadConfigurations':
      return stores.eadConfigurations
    case 'segmentationHeaders':
      return stores.segmentationHeaders
    case 'segmentationDetails':
      return stores.segmentationDetails
    default:
      throw new Error(`Unknown table ${tableName}`)
  }
}

function nextId(tableName: string): number {
  switch (tableName) {
    case 'eadConfigurations':
      return counters.ead++
    case 'segmentationHeaders':
      return counters.segmentHeader++
    case 'segmentationDetails':
      return counters.segmentDetail++
    default:
      throw new Error(`Unknown id source ${tableName}`)
  }
}

function buildQuery<T>(executor: () => T | Promise<T>) {
  let hasRun = false
  let cached: Promise<T> | null = null
  const run = () => {
    if (!hasRun) {
      cached = Promise.resolve(executor())
      hasRun = true
    }
    return cached as Promise<T>
  }

  return {
    then<TResult1 = T, TResult2 = never>(
      onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null,
      onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
    ) {
      return run().then(onfulfilled ?? undefined, onrejected ?? undefined)
    },
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | null) {
      return run().catch(onrejected ?? undefined)
    },
    returning(selection?: Record<string, string>) {
      return run().then((rows: any) => {
        if (!Array.isArray(rows)) return rows
        if (!selection) return rows
        return rows.map((row) =>
          Object.fromEntries(Object.entries(selection).map(([key, column]) => [key, row[column]]))
        )
      })
    },
  }
}

function createLegacyDb() {
  const db: any = {
    insert(tableRef: Record<string, any>) {
      return {
        values(payload: Record<string, any> | Array<Record<string, any>>) {
          return buildQuery(() => {
            const rows = Array.isArray(payload) ? payload : [payload]
            const store = mapStore(String(tableRef.__table))
            const inserted = rows.map((row) => {
              const nextRow = { ...row }
              if ('pkid' in tableRef && (nextRow.pkid === undefined || nextRow.pkid === null)) {
                nextRow.pkid = nextId(String(tableRef.__table))
              }
              store.push(nextRow)
              return nextRow
            })
            return inserted
          })
        },
      }
    },
    update(tableRef: Record<string, any>) {
      return {
        set(payload: Record<string, any>) {
          return {
            where(condition: { column: string; value: unknown }) {
              return buildQuery(() => {
                const store = mapStore(String(tableRef.__table))
                const updated: Array<Record<string, any>> = []
                for (const row of store) {
                  if (row[condition.column] === condition.value) {
                    Object.assign(row, payload)
                    updated.push({ ...row })
                  }
                }
                return updated
              })
            },
          }
        },
      }
    },
    delete(tableRef: Record<string, any>) {
      return {
        where(condition: { column: string; value: unknown }) {
          return buildQuery(() => {
            const store = mapStore(String(tableRef.__table))
            const removed: Array<Record<string, any>> = []
            for (let index = store.length - 1; index >= 0; index -= 1) {
              if (store[index][condition.column] === condition.value) {
                removed.push(...store.splice(index, 1))
              }
            }
            return removed
          })
        },
      }
    },
    transaction: async (callback: (tx: any) => Promise<void>) => {
      await callback(db)
    },
  }
  return db
}

const fakeLegacyDb = createLegacyDb()

const passthroughMiddleware = async (c: any, next: any) => {
  c.set('tenantId', 'tenant-1')
  c.set('userId', currentUserId)
  c.set('isSystemUser', currentIsSystemUser)
  await next()
}

mock.module('drizzle-orm', () => ({
  and: (...parts: unknown[]) => parts,
  or: (...parts: unknown[]) => parts,
  gte: (...parts: unknown[]) => parts,
  lte: (...parts: unknown[]) => parts,
  isNull: (...parts: unknown[]) => parts,
  eq: (column: string, value: unknown) => ({ column, value }),
}))

mock.module(approvalRepositoryPath, () => ({
  ApprovalRepository: {
    findRequestById: async () => currentRequest,
    createAction: async (payload: any) => {
      actionRows.push(payload)
      currentRequest.actions = [...(currentRequest.actions ?? []), payload]
      return { id: `action-${actionRows.length}` }
    },
    updateRequest: async (_requestId: string, payload: any) => {
      updateRequestCalls.push(payload)
      currentRequest = { ...currentRequest, ...payload }
      return currentRequest
    },
  },
}))

mock.module(rbacRepositoryPath, () => ({
  userRolesRepository: {
    findByUser: () =>
      Effect.succeed([
        {
          role: {
            roleCode: currentRoleCode,
            roleName: 'Approver',
            rolePermissions: currentPermissions.map((code) => ({ permission: { code } })),
          },
        },
      ]),
  },
}))

mock.module(configDatabaseAliasPath, () => ({
  getDatabase: () => ({
    query: {
      userRoles: {
        findMany: async () => [],
      },
    },
  }),
}))

mock.module(dbSchemaAliasPath, () => ({
  userRoles: schema.userRoles,
  approvalRequests: schema.approvalRequests,
}))

mock.module(approvalHelpersPath, () => ({}))

mock.module(notificationSocketPath, () => ({
  getNotificationSocket: () => ({
    broadcastApprovalNotificationToUsers: () => undefined,
    broadcastApprovalNotification: () => undefined,
  }),
}))

mock.module(notificationRepositoryPath, () => ({
  NotificationRepository: {
    createWithDeliveries: async () => ({ id: 'notif-1' }),
  },
}))

mock.module(notificationsServicePath, () => ({
  deriveNotificationCategory: () => 'approval',
  filterNotificationRecipientsByPreferences: async ({ userIds }: { userIds: string[] }) => userIds,
}))

mock.module(middlewareAliasPath, () => ({
  authMiddleware: passthroughMiddleware,
  tenantMiddleware: passthroughMiddleware,
  requirePermission: () => passthroughMiddleware,
  errorHandler: async (c: any) => c,
  auditMiddleware: passthroughMiddleware,
}))

mock.module(middlewareIndexPath, () => ({
  authMiddleware: passthroughMiddleware,
  tenantMiddleware: passthroughMiddleware,
  requirePermission: () => passthroughMiddleware,
  errorHandler: async (c: any) => c,
  auditMiddleware: passthroughMiddleware,
}))

mock.module(auditServiceAliasPath, () => ({
  logApproval: {
    approved: async (...args: any[]) => {
      auditApprovedCalls.push({ args })
    },
    rejected: async (...args: any[]) => {
      auditRejectedCalls.push({ args })
    },
    infoRequested: async (...args: any[]) => {
      auditInfoRequestedCalls.push({ args })
    },
    delegated: async (...args: any[]) => {
      auditDelegatedCalls.push({ args })
    },
    cancelled: async (...args: any[]) => {
      auditCancelledCalls.push({ args })
    },
  },
}))

mock.module(auditServicePath, () => ({
  logApproval: {
    approved: async (...args: any[]) => {
      auditApprovedCalls.push({ args })
    },
    rejected: async (...args: any[]) => {
      auditRejectedCalls.push({ args })
    },
    infoRequested: async (...args: any[]) => {
      auditInfoRequestedCalls.push({ args })
    },
    delegated: async (...args: any[]) => {
      auditDelegatedCalls.push({ args })
    },
    cancelled: async (...args: any[]) => {
      auditCancelledCalls.push({ args })
    },
  },
}))

mock.module(configIndexPath, () => ({
  legacyDb: fakeLegacyDb,
  tenantDb: {},
  closeDatabase: async () => undefined,
}))

mock.module(dbSchemaIndexPath, () => ({
  userRoles: schema.userRoles,
  approvalRequests: schema.approvalRequests,
  frs9ImpCaEadConfig: schema.frs9ImpCaEadConfig,
  frs9ParamSegmenth: schema.frs9ParamSegmenth,
  frs9ParamSegmentd: schema.frs9ParamSegmentd,
}))

mock.module(productParametersServicePath, () => ({
  ProductParametersService: {
    create: (payload: any, actorId: string) =>
      Effect.sync(() => {
        const id = Number(payload.id)
        stores.productParameters.set(id, { ...payload, id, createdby: actorId, updatedby: actorId })
        return { id }
      }),
    update: (id: number, payload: any, actorId: string) =>
      Effect.sync(() => {
        const existing = stores.productParameters.get(id) ?? { id }
        stores.productParameters.set(id, { ...existing, ...payload, id, updatedby: actorId })
        return { id }
      }),
    delete: (id: number) =>
      Effect.sync(() => {
        stores.productParameters.delete(id)
      }),
  },
}))

const { approvalRoutes } = await import('@/routes/approval.routes')

function makePendingRequest(entityType: string, operation: 'create' | 'update' | 'delete', data: any, entityId?: string) {
  currentRequest = {
    id: `request-${entityType}-${operation}`,
    tenantId: 'tenant-1',
    entityType,
    entityId,
    title: `Approval ${entityType}`,
    description: null,
    status: 'pending',
    requestedBy: 'maker-1',
    createdAt: new Date('2026-03-29T00:00:00.000Z'),
    approvalsRequired: 1,
    approvalsReceived: 0,
    currentLevel: 1,
    actions: [],
    requestData: {
      operation,
      entityType,
      data,
      oldValues: {},
    },
  }
  return currentRequest
}

function createTestApp() {
  const app = new OpenAPIHono()
  app.route('/api/v1/approvals', approvalRoutes)
  return app
}

describe('approval approve endpoint executes live side effects', () => {
  beforeEach(() => {
    resetState()
  })

  test('POST /api/v1/approvals/requests/:id/approve creates a product parameter row', async () => {
    const request = makePendingRequest('product_parameter', 'create', { id: 71, prdCode: 'PROD-71', prdName: 'Product 71' }, '71')
    const app = createTestApp()

    const response = await app.request(`/api/v1/approvals/requests/${request.id}/approve`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ comment: 'approve product' }),
    })

    expect(response.status).toBe(200)
    const payload = await response.json()
    expect(payload.success).toBe(true)
    expect(payload.result).toEqual(expect.objectContaining({ completed: true, status: 'approved' }))
    expect(stores.productParameters.get(71)).toEqual(expect.objectContaining({ prdCode: 'PROD-71', createdby: 'maker-1' }))
    expect(currentRequest.status).toBe('approved')
    expect(actionRows).toHaveLength(1)
    expect(auditApprovedCalls).toHaveLength(1)
  })

  test('POST /api/v1/approvals/requests/:id/approve updates an EAD configuration row in the live mock DB', async () => {
    stores.eadConfigurations.push({
      pkid: 200,
      eadModelName: 'Old EAD',
      segmentId: 1,
      eadMethod: 'OLD',
      calcMethod: 'OLD',
      activeFlag: 'Y',
    })
    const request = makePendingRequest(
      'ead_configuration',
      'update',
      { model_name: 'New EAD', segment_id: 7, ead_method: 'NEW', calc_method: 'CUR', is_active: 'N' },
      '200'
    )
    const app = createTestApp()

    const response = await app.request(`/api/v1/approvals/requests/${request.id}/approve`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ comment: 'approve ead update' }),
    })

    expect(response.status).toBe(200)
    expect(stores.eadConfigurations[0]).toEqual(expect.objectContaining({
      pkid: 200,
      eadModelName: 'New EAD',
      segmentId: 7,
      eadMethod: 'NEW',
      calcMethod: 'CUR',
      activeFlag: 'N',
      updatedby: 'maker-1',
    }))
    expect(currentRequest.status).toBe('approved')
  })

  test('POST /api/v1/approvals/requests/:id/approve deletes a segmentation header and details in the live mock DB', async () => {
    stores.segmentationHeaders.push({ pkid: 300, groupSegment: 'Corp', segment: 'SME' })
    stores.segmentationDetails.push({ pkid: 401, segmentId: 300, tableName: 'T1' })
    stores.segmentationDetails.push({ pkid: 402, segmentId: 300, tableName: 'T2' })

    const request = makePendingRequest('segmentation', 'delete', { id: 300 }, '300')
    const app = createTestApp()

    const response = await app.request(`/api/v1/approvals/requests/${request.id}/approve`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ comment: 'approve segmentation delete' }),
    })

    expect(response.status).toBe(200)
    expect(stores.segmentationHeaders).toHaveLength(0)
    expect(stores.segmentationDetails).toHaveLength(0)
    expect(currentRequest.status).toBe('approved')
  })

  test('POST /api/v1/approvals/requests/:id/reject marks request as rejected and records audit/action', async () => {
    const request = makePendingRequest('product_parameter', 'create', { id: 72, prdCode: 'PROD-72', prdName: 'Product 72' }, '72')
    const app = createTestApp()

    const response = await app.request(`/api/v1/approvals/requests/${request.id}/reject`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ comment: 'rejected due to invalid setup' }),
    })

    expect(response.status).toBe(200)
    const payload = await response.json()
    expect(payload.success).toBe(true)
    expect(payload.result).toEqual(expect.objectContaining({ completed: true, status: 'rejected' }))
    expect(currentRequest.status).toBe('rejected')
    expect(actionRows).toHaveLength(1)
    expect(actionRows[0]).toEqual(expect.objectContaining({
      requestId: request.id,
      approverId: 'approver-1',
      action: 'reject',
      comment: 'rejected due to invalid setup',
    }))
    expect(auditRejectedCalls).toHaveLength(1)
  })

  test('POST /api/v1/approvals/requests/:id/request-info marks request as info_requested and records audit/action', async () => {
    const request = makePendingRequest('bucket_parameter', 'update', { id: 81, bucket_group: 'MAX_DPD' }, '81')
    const app = createTestApp()

    const response = await app.request(`/api/v1/approvals/requests/${request.id}/request-info`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ comment: 'please attach basis justification' }),
    })

    expect(response.status).toBe(200)
    const payload = await response.json()
    expect(payload.success).toBe(true)
    expect(payload.result).toEqual(expect.objectContaining({ completed: false, status: 'info_requested' }))
    expect(currentRequest.status).toBe('info_requested')
    expect(actionRows).toHaveLength(1)
    expect(actionRows[0]).toEqual(expect.objectContaining({
      requestId: request.id,
      approverId: 'approver-1',
      action: 'request_info',
      comment: 'please attach basis justification',
    }))
    expect(auditInfoRequestedCalls).toHaveLength(1)
  })

  test('POST /api/v1/approvals/requests/:id/delegate records delegated action and keeps request pending', async () => {
    const request = makePendingRequest('rule_base_setting', 'update', { id: 91, rule_name: 'Stage Rule' }, '91')
    const app = createTestApp()
    const delegatedTo = '11111111-1111-4111-8111-111111111111'

    const response = await app.request(`/api/v1/approvals/requests/${request.id}/delegate`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ delegatedTo, reason: 'handled by alternate approver' }),
    })

    expect(response.status).toBe(200)
    const payload = await response.json()
    expect(payload.success).toBe(true)
    expect(payload.result).toEqual(expect.objectContaining({ completed: false, status: 'pending' }))
    expect(currentRequest.status).toBe('pending')
    expect(actionRows).toHaveLength(1)
    expect(actionRows[0]).toEqual(expect.objectContaining({
      requestId: request.id,
      approverId: 'approver-1',
      action: 'delegate',
      delegatedTo,
      comment: 'handled by alternate approver',
    }))
    expect(auditDelegatedCalls).toHaveLength(1)
  })

  test('POST /api/v1/approvals/requests/:id/cancel cancels requester-owned request and records audit/action', async () => {
    const request = makePendingRequest('product_parameter', 'create', { id: 73, prdCode: 'PROD-73', prdName: 'Product 73' }, '73')
    request.requestedBy = 'approver-1'
    const app = createTestApp()

    const response = await app.request(`/api/v1/approvals/requests/${request.id}/cancel`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ reason: 'submitted by mistake' }),
    })

    expect(response.status).toBe(200)
    const payload = await response.json()
    expect(payload.success).toBe(true)
    expect(payload.result).toEqual(expect.objectContaining({ completed: true, status: 'cancelled' }))
    expect(currentRequest.status).toBe('cancelled')
    expect(actionRows).toHaveLength(1)
    expect(actionRows[0]).toEqual(expect.objectContaining({
      requestId: request.id,
      approverId: 'approver-1',
      action: 'cancel',
      comment: 'submitted by mistake',
    }))
    expect(auditCancelledCalls).toHaveLength(1)
  })

  test('POST /api/v1/approvals/requests/:id/cancel rejects non-requester cancellation with 422', async () => {
    const request = makePendingRequest('product_parameter', 'create', { id: 74, prdCode: 'PROD-74', prdName: 'Product 74' }, '74')
    request.requestedBy = 'maker-1'
    const app = createTestApp()

    const response = await app.request(`/api/v1/approvals/requests/${request.id}/cancel`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ reason: 'not mine' }),
    })

    expect(response.status).toBe(422)
    const payload = await response.json()
    expect(payload.success).toBe(false)
    expect(payload.code).toBe('CANCEL_NOT_ALLOWED')
    expect(payload.message).toContain('Only the original requester can cancel this request')
    expect(currentRequest.status).toBe('pending')
    expect(actionRows).toHaveLength(0)
    expect(auditCancelledCalls).toHaveLength(0)
  })

  test('POST /api/v1/approvals/requests/:id/cancel allows system user to cancel another requester request', async () => {
    currentUserId = 'system-admin-1'
    currentIsSystemUser = true
    const request = makePendingRequest('product_parameter', 'create', { id: 77, prdCode: 'PROD-77', prdName: 'Product 77' }, '77')
    request.requestedBy = 'maker-1'
    const app = createTestApp()

    const response = await app.request(`/api/v1/approvals/requests/${request.id}/cancel`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ reason: 'system override' }),
    })

    expect(response.status).toBe(200)
    const payload = await response.json()
    expect(payload.success).toBe(true)
    expect(payload.result).toEqual(expect.objectContaining({ completed: true, status: 'cancelled' }))
    expect(currentRequest.status).toBe('cancelled')
    expect(actionRows).toHaveLength(1)
    expect(actionRows[0]).toEqual(expect.objectContaining({
      requestId: request.id,
      approverId: 'system-admin-1',
      action: 'cancel',
      approverRole: 'SYSTEM',
      comment: 'system override',
    }))
    expect(auditCancelledCalls).toHaveLength(1)
  })

  test('POST /api/v1/approvals/requests/:id/delegate rejects invalid body with 400', async () => {
    const request = makePendingRequest('rule_base_setting', 'update', { id: 92, rule_name: 'Rule 92' }, '92')
    const app = createTestApp()

    const response = await app.request(`/api/v1/approvals/requests/${request.id}/delegate`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ reason: 'missing target' }),
    })

    expect(response.status).toBe(400)
    const payload = await response.json()
    expect(payload.success).toBe(false)
    expect(actionRows).toHaveLength(0)
    expect(auditDelegatedCalls).toHaveLength(0)
  })

  test('POST /api/v1/approvals/requests/:id/approve rejects non-pending request with 409', async () => {
    const request = makePendingRequest('product_parameter', 'create', { id: 75, prdCode: 'PROD-75', prdName: 'Product 75' }, '75')
    request.status = 'approved'
    const app = createTestApp()

    const response = await app.request(`/api/v1/approvals/requests/${request.id}/approve`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ comment: 'approve stale request' }),
    })

    expect(response.status).toBe(409)
    const payload = await response.json()
    expect(payload.success).toBe(false)
    expect(payload.code).toBe('REQUEST_NOT_PENDING')
    expect(payload.message).toContain('Request is already approved')
    expect(stores.productParameters.has(75)).toBe(false)
    expect(actionRows).toHaveLength(0)
    expect(auditApprovedCalls).toHaveLength(0)
  })

  test('POST /api/v1/approvals/requests/:id/approve returns 403 when approver is not eligible for current level', async () => {
    currentRoleCode = 'VIEWER'
    currentPermissions = []
    const request = makePendingRequest('product_parameter', 'create', { id: 76, prdCode: 'PROD-76', prdName: 'Product 76' }, '76')
    request.matrixId = 'matrix-1'
    request.currentLevel = 1
    request.matrix = {
      levels: [
        {
          level: 1,
          requiredRoleCodes: ['ACCOUNTING_APPROVER'],
          requiredPermissionCodes: ['approval.requests.approve'],
          roleMatchMode: 'ANY',
          permissionMatchMode: 'ANY',
          requiredCount: 1,
        },
      ],
    }
    const app = createTestApp()

    const response = await app.request(`/api/v1/approvals/requests/${request.id}/approve`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ comment: 'try approve without eligibility' }),
    })

    expect(response.status).toBe(403)
    const payload = await response.json()
    expect(payload.success).toBe(false)
    expect(payload.code).toBe('UNAUTHORIZED')
    expect(payload.message).toContain('You are not eligible to approve level 1')
    expect(stores.productParameters.has(76)).toBe(false)
    expect(actionRows).toHaveLength(0)
    expect(auditApprovedCalls).toHaveLength(0)
  })
})
