import { beforeEach, describe, expect, mock, test } from 'bun:test'
import { OpenAPIHono } from '@hono/zod-openapi'
import { Effect } from 'effect'
import { AuthorizationError, BusinessError, ConflictError, DatabaseError } from '@/lib/errors'

const baseRequest = {
  id: 'approval-request-1',
  entityType: 'user',
  entityId: 'user-1',
  title: 'Create User',
  description: null,
  status: 'PENDING',
  requestedBy: 'maker-1',
  createdAt: new Date('2026-02-24T00:00:00.000Z'),
}

const getPendingApprovalsForUserMock = mock(() =>
  Effect.succeed([
    {
      ...baseRequest,
      updatedAt: undefined,
    },
  ])
)

const cancelApprovalRequestMock = mock(() =>
  Effect.succeed({ cancelled: true })
)

const getApprovalHistoryMock = mock(() =>
  Effect.succeed([
    {
      ...baseRequest,
      description: 'Requested by maker',
      completedAt: new Date('2026-02-24T10:00:00.000Z'),
    },
  ])
)

const createApprovalRequestMock = mock(() =>
  Effect.succeed({
    ...baseRequest,
    description: 'Approval for create user',
    createdAt: new Date('2026-02-24T08:00:00.000Z'),
    completedAt: null,
  })
)

const getApprovalRequestMock = mock(() =>
  Effect.succeed({
    ...baseRequest,
    description: 'Request detail',
    createdAt: new Date('2026-02-23T00:00:00.000Z'),
    completedAt: new Date('2026-02-24T11:00:00.000Z'),
  })
)

let processActionMode: 'success' | 'authorization_error' | 'conflict_error' | 'business_error' | 'database_error' = 'success'

const processApprovalActionMock = mock((input: any) => {
  switch (processActionMode) {
    case 'authorization_error':
      return Effect.fail(
        new AuthorizationError({
          message: 'You are not eligible to approve level 1',
          requiredPermission: 'approval.requests.approve',
          details: {
            requiredRoleCodes: ['CHECKER', 'IAF_IFRS_MANAGER'],
            currentLevel: 1,
          },
        })
      )
    case 'conflict_error':
      return Effect.fail(
        new ConflictError({
          message: 'A similar approval request is already pending.',
          resource: 'approval_request',
        })
      )
    case 'business_error':
      return Effect.fail(
        new BusinessError({
          message: 'Approval rule violation',
          code: 'RULE_VIOLATION',
          details: {
            field: 'riskScore',
          },
        })
      )
    case 'database_error':
      return Effect.fail(
        new DatabaseError({
          message: 'Approval storage unavailable',
          operation: 'query',
        })
      )
    default:
      return Effect.succeed({
        requestId: input.requestId,
        action: input.action,
        ok: true,
      })
  }
})

const getApprovalRoutingOverviewMock = mock(() =>
  Effect.succeed([
    {
      entityType: 'user',
      operationType: 'create',
      matrixId: 'matrix-1',
      matrixName: 'User Matrix',
      isActive: true,
      levels: [],
    },
  ])
)

const getApprovalMatricesMock = mock(() =>
  Effect.succeed([
    {
      id: 'matrix-1',
      name: 'Default Matrix',
      entityType: 'user',
      levels: [],
      createdAt: new Date('2026-02-20T00:00:00.000Z'),
    },
  ])
)

const createApprovalMatrixMock = mock(() =>
  Effect.succeed({
    id: 'matrix-2',
    name: 'Created Matrix',
    entityType: 'user',
    levels: [],
    createdAt: new Date('2026-02-25T00:00:00.000Z'),
  })
)

const updateApprovalMatrixMock = mock(() =>
  Effect.succeed({
    id: 'matrix-1',
    name: 'Updated Matrix',
    entityType: 'user',
    levels: [],
    createdAt: new Date('2026-02-20T00:00:00.000Z'),
  })
)

const logApprovalRequestedMock = mock(async () => undefined)
const logApprovalApprovedMock = mock(async () => undefined)
const logApprovalRejectedMock = mock(async () => undefined)
const logApprovalCancelledMock = mock(async () => undefined)
const logApprovalDelegatedMock = mock(async () => undefined)
const logDataChangeCreateMock = mock(async () => undefined)
const logDataChangeUpdateMock = mock(async () => undefined)

const passthroughMiddleware = async (c: any, next: any) => {
  c.set('tenantId', 'tenant-approval-1')
  c.set('userId', 'user-approval-1')
  c.set('isSystemUser', c.req.header('x-test-system-user') === 'true')
  await next()
}

mock.module('@/services/approval.service', () => ({
  getPendingApprovalsForUser: getPendingApprovalsForUserMock,
  cancelApprovalRequest: cancelApprovalRequestMock,
  getApprovalHistory: getApprovalHistoryMock,
  createApprovalRequest: createApprovalRequestMock,
  getApprovalRequest: getApprovalRequestMock,
  processApprovalAction: processApprovalActionMock,
  getApprovalRoutingOverview: getApprovalRoutingOverviewMock,
  getApprovalMatrices: getApprovalMatricesMock,
  createApprovalMatrix: createApprovalMatrixMock,
  updateApprovalMatrix: updateApprovalMatrixMock,
}))

mock.module('../../services/approval.service', () => ({
  getPendingApprovalsForUser: getPendingApprovalsForUserMock,
  cancelApprovalRequest: cancelApprovalRequestMock,
  getApprovalHistory: getApprovalHistoryMock,
  createApprovalRequest: createApprovalRequestMock,
  getApprovalRequest: getApprovalRequestMock,
  processApprovalAction: processApprovalActionMock,
  getApprovalRoutingOverview: getApprovalRoutingOverviewMock,
  getApprovalMatrices: getApprovalMatricesMock,
  createApprovalMatrix: createApprovalMatrixMock,
  updateApprovalMatrix: updateApprovalMatrixMock,
}))

mock.module('@/services/audit.service', () => ({
  logApproval: {
    requested: logApprovalRequestedMock,
    approved: logApprovalApprovedMock,
    rejected: logApprovalRejectedMock,
    cancelled: logApprovalCancelledMock,
    delegated: logApprovalDelegatedMock,
  },
  logDataChange: {
    create: logDataChangeCreateMock,
    update: logDataChangeUpdateMock,
  },
}))

mock.module('../../services/audit.service', () => ({
  logApproval: {
    requested: logApprovalRequestedMock,
    approved: logApprovalApprovedMock,
    rejected: logApprovalRejectedMock,
    cancelled: logApprovalCancelledMock,
    delegated: logApprovalDelegatedMock,
  },
  logDataChange: {
    create: logDataChangeCreateMock,
    update: logDataChangeUpdateMock,
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

const { approvalRoutes } = await import('@/routes/approval.routes')

describe('approval routes response contracts', () => {
  beforeEach(() => {
    processActionMode = 'success'
    getPendingApprovalsForUserMock.mockClear()
    cancelApprovalRequestMock.mockClear()
    getApprovalHistoryMock.mockClear()
    createApprovalRequestMock.mockClear()
    getApprovalRequestMock.mockClear()
    processApprovalActionMock.mockClear()
    getApprovalRoutingOverviewMock.mockClear()
    getApprovalMatricesMock.mockClear()
    createApprovalMatrixMock.mockClear()
    updateApprovalMatrixMock.mockClear()
    logApprovalRequestedMock.mockClear()
    logApprovalApprovedMock.mockClear()
    logApprovalRejectedMock.mockClear()
    logApprovalCancelledMock.mockClear()
    logApprovalDelegatedMock.mockClear()
    logDataChangeCreateMock.mockClear()
    logDataChangeUpdateMock.mockClear()
  })

  test('GET /api/v1/approvals/pending returns pending approval list envelope', async () => {
    const app = new OpenAPIHono()
    app.route('/api/v1/approvals', approvalRoutes)

    const response = await app.request('/api/v1/approvals/pending')
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data?.[0]?.id).toBe('approval-request-1')
    expect(body.data?.[0]?.description).toBeNull()
    expect(body.data?.[0]?.createdAt).toBe('2026-02-24T00:00:00.000Z')
    expect(getPendingApprovalsForUserMock).toHaveBeenCalledWith('user-approval-1', 'tenant-approval-1')
  })

  test('POST /api/v1/approvals/requests/{id}/cancel forwards cancel payload and actor context', async () => {
    const app = new OpenAPIHono()
    app.route('/api/v1/approvals', approvalRoutes)

    const response = await app.request('/api/v1/approvals/requests/approval-request-1/cancel', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-test-system-user': 'true',
      },
      body: JSON.stringify({ reason: 'No longer needed' }),
    })

    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(cancelApprovalRequestMock).toHaveBeenCalledWith({
      requestId: 'approval-request-1',
      cancelledBy: 'user-approval-1',
      isSystemUser: true,
      reason: 'No longer needed',
    })
  })

  test('GET /api/v1/approvals/requests passes through query filters', async () => {
    const app = new OpenAPIHono()
    app.route('/api/v1/approvals', approvalRoutes)

    const response = await app.request('/api/v1/approvals/requests?entityType=user&entityId=user-1')
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(getApprovalHistoryMock).toHaveBeenCalledWith('tenant-approval-1', 'user', 'user-1')
    expect(body.data?.[0]?.updatedAt).toBe('2026-02-24T10:00:00.000Z')
  })

  test('POST /api/v1/approvals/requests creates request with tenant and requester context', async () => {
    const app = new OpenAPIHono()
    app.route('/api/v1/approvals', approvalRoutes)

    const response = await app.request('/api/v1/approvals/requests', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        entityType: 'user',
        entityId: 'user-1',
        title: 'Create User',
        description: 'Needs checker approval',
        impactLevel: 'medium',
      }),
    })

    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(createApprovalRequestMock).toHaveBeenCalledWith(expect.objectContaining({
      entityType: 'user',
      entityId: 'user-1',
      title: 'Create User',
      description: 'Needs checker approval',
      impactLevel: 'medium',
      tenantId: 'tenant-approval-1',
      requestedBy: 'user-approval-1',
    }))
  })

  test('GET /api/v1/approvals/requests/{id} returns request detail envelope', async () => {
    const app = new OpenAPIHono()
    app.route('/api/v1/approvals', approvalRoutes)

    const response = await app.request('/api/v1/approvals/requests/approval-request-1')
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data?.id).toBe('approval-request-1')
    expect(body.data?.updatedAt).toBe('2026-02-24T11:00:00.000Z')
    expect(getApprovalRequestMock).toHaveBeenCalledWith('approval-request-1')
  })

  test('POST /api/v1/approvals/requests/{id}/approve sends approve action payload', async () => {
    const app = new OpenAPIHono()
    app.route('/api/v1/approvals', approvalRoutes)

    const response = await app.request('/api/v1/approvals/requests/approval-request-1/approve', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        comment: 'Looks good',
        conditions: 'Monitor for 30 days',
        riskScore: 4,
      }),
    })

    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(processApprovalActionMock).toHaveBeenCalledWith({
      requestId: 'approval-request-1',
      approverId: 'user-approval-1',
      action: 'approve',
      comment: 'Looks good',
      conditions: 'Monitor for 30 days',
      riskScore: 4,
    })
  })

  test('POST /api/v1/approvals/requests/{id}/approve returns 403 envelope on eligibility failure', async () => {
    processActionMode = 'authorization_error'
    const app = new OpenAPIHono()
    app.route('/api/v1/approvals', approvalRoutes)

    const response = await app.request('/api/v1/approvals/requests/approval-request-1/approve', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ comment: 'Approve' }),
    })
    const body = await response.json()

    expect(response.status).toBe(403)
    expect(body).toMatchObject({
      success: false,
      code: 'UNAUTHORIZED',
      error: 'You are not eligible to approve level 1',
      message: 'You are not eligible to approve level 1',
      details: {
        requiredRoleCodes: ['CHECKER', 'IAF_IFRS_MANAGER'],
        currentLevel: 1,
      },
    })
    expect(body).toHaveProperty('requestId')
    expect(typeof body.timestamp).toBe('string')
  })

  test('POST /api/v1/approvals/requests/{id}/approve returns 409 envelope on duplicate conflict', async () => {
    processActionMode = 'conflict_error'
    const app = new OpenAPIHono()
    app.route('/api/v1/approvals', approvalRoutes)

    const response = await app.request('/api/v1/approvals/requests/approval-request-1/approve', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ comment: 'Approve' }),
    })
    const body = await response.json()

    expect(response.status).toBe(409)
    expect(body).toMatchObject({
      success: false,
      code: 'CONFLICT',
      error: 'A similar approval request is already pending.',
      message: 'A similar approval request is already pending.',
    })
    expect(body).toHaveProperty('requestId')
    expect(typeof body.timestamp).toBe('string')
  })

  test('POST /api/v1/approvals/requests/{id}/approve returns 422 envelope on business rule error', async () => {
    processActionMode = 'business_error'
    const app = new OpenAPIHono()
    app.route('/api/v1/approvals', approvalRoutes)

    const response = await app.request('/api/v1/approvals/requests/approval-request-1/approve', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ comment: 'Approve' }),
    })
    const body = await response.json()

    expect(response.status).toBe(422)
    expect(body).toMatchObject({
      success: false,
      code: 'RULE_VIOLATION',
      error: 'Approval rule violation',
      message: 'Approval rule violation',
      details: {
        field: 'riskScore',
      },
    })
    expect(body).toHaveProperty('requestId')
    expect(typeof body.timestamp).toBe('string')
  })

  test('POST /api/v1/approvals/requests/{id}/approve returns 500 envelope on database error', async () => {
    processActionMode = 'database_error'
    const app = new OpenAPIHono()
    app.route('/api/v1/approvals', approvalRoutes)

    const response = await app.request('/api/v1/approvals/requests/approval-request-1/approve', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ comment: 'Approve' }),
    })
    const body = await response.json()

    expect(response.status).toBe(500)
    expect(body).toMatchObject({
      success: false,
      code: 'DB_ERROR',
      error: 'Approval storage unavailable',
      message: 'Approval storage unavailable',
      details: {
        operation: 'query',
      },
    })
    expect(body).toHaveProperty('requestId')
    expect(typeof body.timestamp).toBe('string')
  })

  test('POST /api/v1/approvals/requests/{id}/reject sends reject action payload', async () => {
    const app = new OpenAPIHono()
    app.route('/api/v1/approvals', approvalRoutes)

    const response = await app.request('/api/v1/approvals/requests/approval-request-1/reject', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        comment: 'Data is incomplete',
      }),
    })

    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(processApprovalActionMock).toHaveBeenCalledWith({
      requestId: 'approval-request-1',
      approverId: 'user-approval-1',
      action: 'reject',
      comment: 'Data is incomplete',
    })
  })

  test('POST /api/v1/approvals/requests/{id}/delegate sends delegate action payload', async () => {
    const app = new OpenAPIHono()
    app.route('/api/v1/approvals', approvalRoutes)

    const response = await app.request('/api/v1/approvals/requests/approval-request-1/delegate', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        delegatedTo: '00000000-0000-4000-8000-000000000321',
        reason: 'Handled by another approver',
      }),
    })

    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(processApprovalActionMock).toHaveBeenCalledWith({
      requestId: 'approval-request-1',
      approverId: 'user-approval-1',
      action: 'delegate',
      delegatedTo: '00000000-0000-4000-8000-000000000321',
      comment: 'Handled by another approver',
    })
  })

  test('POST /api/v1/approvals/requests/{id}/delegate rejects invalid uuid payload', async () => {
    const app = new OpenAPIHono()
    app.route('/api/v1/approvals', approvalRoutes)

    const response = await app.request('/api/v1/approvals/requests/approval-request-1/delegate', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        delegatedTo: 'not-a-uuid',
      }),
    })

    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.success).toBe(false)
  })

  test('GET /api/v1/approvals/routing returns routing overview envelope', async () => {
    const app = new OpenAPIHono()
    app.route('/api/v1/approvals', approvalRoutes)

    const response = await app.request('/api/v1/approvals/routing?entityType=user&operation=create&department=risk&bankingMode=conventional')
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data?.[0]?.matrixId).toBe('matrix-1')
    expect(getApprovalRoutingOverviewMock).toHaveBeenCalledWith({
      tenantId: 'tenant-approval-1',
      entityType: 'user',
      operation: 'create',
      department: 'risk',
      bankingMode: 'conventional',
    })
  })

  test('GET /api/v1/approvals/matrices returns matrix list envelope', async () => {
    const app = new OpenAPIHono()
    app.route('/api/v1/approvals', approvalRoutes)

    const response = await app.request('/api/v1/approvals/matrices')
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data?.[0]?.createdAt).toBe('2026-02-20T00:00:00.000Z')
    expect(getApprovalMatricesMock).toHaveBeenCalledWith('tenant-approval-1')
  })

  test('POST /api/v1/approvals/matrices normalizes legacy level roles before create', async () => {
    const app = new OpenAPIHono()
    app.route('/api/v1/approvals', approvalRoutes)

    const response = await app.request('/api/v1/approvals/matrices', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        name: 'User Create Matrix',
        description: 'Used for user onboarding',
        entityType: 'user',
        operationType: 'create',
        bankingMode: 'conventional',
        levels: [
          {
            level: 1,
            name: 'Checker Level',
            requiredRoles: ['checker', 'approval.requests.approve'],
            requiredCount: 1,
          },
          {
            level: 2,
            name: 'Approver Level',
            requiredRoles: ['approver'],
            requiredCount: 1,
          },
        ],
      }),
    })

    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)

    const createArgs = createApprovalMatrixMock.mock.calls[0] as any[]
    expect(createArgs[0]).toEqual({
      tenantId: 'tenant-approval-1',
      name: 'User Create Matrix',
      description: 'Used for user onboarding',
      entityType: 'user',
      operationType: 'create',
      bankingMode: 'conventional',
    })

    expect(createArgs[1]?.[0]).toEqual(expect.objectContaining({
      level: 1,
      name: 'Checker Level',
      requiredRoleCodes: ['checker'],
      requiredPermissionCodes: ['approval.requests.approve'],
      roleMatchMode: 'ANY',
      permissionMatchMode: 'ANY',
    }))

    expect(createArgs[1]?.[1]).toEqual(expect.objectContaining({
      level: 2,
      name: 'Approver Level',
      requiredRoleCodes: ['approver'],
      requiredPermissionCodes: ['approval.requests.approve'],
      roleMatchMode: 'ANY',
      permissionMatchMode: 'ANY',
    }))
  })

  test('PUT /api/v1/approvals/matrices/{id} updates matrix and levels', async () => {
    const app = new OpenAPIHono()
    app.route('/api/v1/approvals', approvalRoutes)

    const response = await app.request('/api/v1/approvals/matrices/matrix-1', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        name: 'Updated Matrix',
        description: 'Updated desc',
        isActive: true,
        levels: [
          {
            level: 1,
            name: 'Checker Review',
            requiredRoles: ['checker', 'approval.requests.approve'],
            requiredCount: 2,
            timeoutHours: 24,
          },
        ],
      }),
    })

    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(updateApprovalMatrixMock).toHaveBeenCalledTimes(1)

    const updateArgs = updateApprovalMatrixMock.mock.calls[0] as any[]
    expect(updateArgs[0]).toBe('tenant-approval-1')
    expect(updateArgs[1]).toBe('matrix-1')
    expect(updateArgs[2]).toEqual(expect.objectContaining({
      name: 'Updated Matrix',
      description: 'Updated desc',
      isActive: true,
    }))
    expect(updateArgs[3]?.[0]).toEqual(expect.objectContaining({
      level: 1,
      name: 'Checker Review',
      requiredRoleCodes: ['checker'],
      requiredPermissionCodes: ['approval.requests.approve'],
      requiredCount: 2,
      roleMatchMode: 'ANY',
      permissionMatchMode: 'ANY',
    }))
  })
})
