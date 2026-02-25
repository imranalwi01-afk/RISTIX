import { beforeEach, describe, expect, mock, test } from 'bun:test'
import { Effect } from 'effect'

const state = {
  findDuplicatePendingRequestResult: null as any,
  findDuplicatePendingRequestError: null as Error | null,
  findMatrixByEntityTypeResult: null as any,
  findMatrixByEntityTypeError: null as Error | null,
  findMatricesByTenantResult: [] as any[],
  createRequestResult: {
    id: 'approval-1',
    tenantId: 'tenant-approval-1',
    entityType: 'user',
    entityId: 'user-1',
    title: 'Create User',
    description: 'Needs approval',
    requestedBy: 'maker-1',
    impactLevel: 'medium',
    approvalsRequired: 1,
    approvalsReceived: 0,
    currentLevel: 1,
    status: 'pending',
    requestData: { operation: 'create' },
    createdAt: new Date('2026-02-24T00:00:00.000Z'),
  } as any,
  findRequestByIdResult: null as any,
  findRequestByIdById: new Map<string, any>(),
  findPendingRequestsResult: [] as any[],
  findRequestsByEntityResult: [] as any[],
  findRequestsByTenantResult: [] as any[],
  createActionError: null as Error | null,
  updateRequestError: null as Error | null,
  createActionCalls: [] as unknown[][],
  updateRequestCalls: [] as unknown[][],
  createRequestCalls: [] as unknown[][],
  userRolesFindByUserResult: [] as any[],
  routingAssignments: [] as any[],
  notificationCreateCalls: [] as any[],
  notificationPersistError: null as Error | null,
  socketBroadcastToUsersCalls: [] as any[],
  socketBroadcastCalls: [] as any[],
  socketError: null as Error | null,
  filteredRecipients: null as string[] | null,
  derivedCategory: 'approval',
  fallbackRouting: [
    {
      level: 1,
      name: 'Checker',
      requiredRoleCodes: ['checker'],
      requiredPermissionCodes: ['approval.requests.approve'],
      roleMatchMode: 'ANY',
      permissionMatchMode: 'ANY',
      requiredCount: 1,
      timeoutHours: 24,
    },
  ] as any[],
}

mock.module('@/repositories/approval.repository', () => ({
  ApprovalRepository: {
    findDuplicatePendingRequest: async () => {
      if (state.findDuplicatePendingRequestError) {
        throw state.findDuplicatePendingRequestError
      }
      return state.findDuplicatePendingRequestResult
    },
    findMatrixByEntityType: async () => {
      if (state.findMatrixByEntityTypeError) {
        throw state.findMatrixByEntityTypeError
      }
      return state.findMatrixByEntityTypeResult
    },
    findMatricesByTenant: async () => state.findMatricesByTenantResult,
    createRequest: async (...args: unknown[]) => {
      state.createRequestCalls.push(args)
      return state.createRequestResult
    },
    findRequestById: async (requestId: string) => {
      if (state.findRequestByIdById.has(requestId)) {
        return state.findRequestByIdById.get(requestId)
      }
      return state.findRequestByIdResult
    },
    createAction: async (...args: unknown[]) => {
      if (state.createActionError) {
        throw state.createActionError
      }
      state.createActionCalls.push(args)
      return { id: 'action-1' }
    },
    updateRequest: async (...args: unknown[]) => {
      if (state.updateRequestError) {
        throw state.updateRequestError
      }
      state.updateRequestCalls.push(args)
      return { id: 'approval-1' }
    },
    findPendingRequests: async () => state.findPendingRequestsResult,
    findRequestsByEntity: async () => state.findRequestsByEntityResult,
    findRequestsByTenant: async () => state.findRequestsByTenantResult,
  },
}))

mock.module('@/repositories/rbac.repository', () => ({
  userRolesRepository: {
    findByUser: () => Effect.succeed(state.userRolesFindByUserResult),
  },
}))

mock.module('@/config/database', () => ({
  getDatabase: () => ({
    query: {
      userRoles: {
        findMany: async () => state.routingAssignments,
      },
    },
  }),
}))

mock.module('@/socket/notification.socket', () => ({
  getNotificationSocket: () => ({
    broadcastApprovalNotificationToUsers: (...args: any[]) => {
      if (state.socketError) {
        throw state.socketError
      }
      state.socketBroadcastToUsersCalls.push(args)
      return undefined
    },
    broadcastApprovalNotification: (...args: any[]) => {
      if (state.socketError) {
        throw state.socketError
      }
      state.socketBroadcastCalls.push(args)
      return undefined
    },
  }),
}))

mock.module('@/repositories/notification.repository', () => ({
  NotificationRepository: {
    createWithDeliveries: async (payload: any) => {
      if (state.notificationPersistError) {
        throw state.notificationPersistError
      }
      state.notificationCreateCalls.push(payload)
      return { id: 'notif-1' }
    },
  },
}))

mock.module('@/services/notifications.service', () => ({
  deriveNotificationCategory: () => state.derivedCategory,
  filterNotificationRecipientsByPreferences: async ({ userIds }: any) => {
    if (state.filteredRecipients) {
      return state.filteredRecipients
    }
    return userIds
  },
}))

mock.module('@/lib/approval-helpers', () => ({
  buildDefaultFourEyesRouting: () => state.fallbackRouting,
}))

const approvalService = await import('@/services/approval.service')

describe('approval.service behavior', () => {
  beforeEach(() => {
    state.findDuplicatePendingRequestResult = null
    state.findDuplicatePendingRequestError = null
    state.findMatrixByEntityTypeResult = null
    state.findMatrixByEntityTypeError = null
    state.findMatricesByTenantResult = []
    state.createRequestResult = {
      id: 'approval-1',
      tenantId: 'tenant-approval-1',
      entityType: 'user',
      entityId: 'user-1',
      title: 'Create User',
      description: 'Needs approval',
      requestedBy: 'maker-1',
      impactLevel: 'medium',
      approvalsRequired: 1,
      approvalsReceived: 0,
      currentLevel: 1,
      status: 'pending',
      requestData: { operation: 'create' },
      createdAt: new Date('2026-02-24T00:00:00.000Z'),
    }
    state.findRequestByIdResult = null
    state.findRequestByIdById = new Map<string, any>()
    state.findPendingRequestsResult = []
    state.findRequestsByEntityResult = []
    state.findRequestsByTenantResult = []
    state.createActionError = null
    state.updateRequestError = null
    state.createActionCalls = []
    state.updateRequestCalls = []
    state.createRequestCalls = []
    state.userRolesFindByUserResult = []
    state.routingAssignments = []
    state.notificationCreateCalls = []
    state.notificationPersistError = null
    state.socketBroadcastToUsersCalls = []
    state.socketBroadcastCalls = []
    state.socketError = null
    state.filteredRecipients = null
    state.derivedCategory = 'approval'
    state.fallbackRouting = [
      {
        level: 1,
        name: 'Checker',
        requiredRoleCodes: ['checker'],
        requiredPermissionCodes: ['approval.requests.approve'],
        roleMatchMode: 'ANY',
        permissionMatchMode: 'ANY',
        requiredCount: 1,
        timeoutHours: 24,
      },
    ]
  })

  test('createApprovalRequest blocks duplicate pending requests with ConflictError', async () => {
    state.findDuplicatePendingRequestResult = { id: 'existing-pending' }

    const exit = await Effect.runPromiseExit(
      approvalService.createApprovalRequest({
        tenantId: 'tenant-approval-1',
        entityType: 'user',
        entityId: 'user-1',
        title: 'Create User',
        requestedBy: 'maker-1',
        requestData: { operation: 'create' },
      })
    )

    expect(exit._tag).toBe('Failure')
    expect(String(exit.cause)).toContain('ConflictError')
  })

  test('createApprovalRequest calculates approvals from matrix levels', async () => {
    state.findMatrixByEntityTypeResult = {
      id: 'matrix-1',
      levels: [
        { level: 1, requiredCount: 2 },
        { level: 2, requiredCount: 1 },
      ],
    }

    const result = await Effect.runPromise(
      approvalService.createApprovalRequest({
        tenantId: 'tenant-approval-1',
        entityType: 'user',
        entityId: 'user-1',
        title: 'Create User',
        requestedBy: 'maker-1',
      })
    )

    expect(result.id).toBe('approval-1')

    const payload = state.createRequestCalls[0]?.[0] as any
    expect(payload.tenantId).toBe('tenant-approval-1')
    expect(payload.approvalsRequired).toBe(3)
    expect(payload.impactLevel).toBe('medium')
    expect(payload.expiresAt instanceof Date).toBe(true)
  })

  test('processApprovalAction returns NotFoundError when request is missing', async () => {
    state.findRequestByIdResult = null

    const exit = await Effect.runPromiseExit(
      approvalService.processApprovalAction({
        requestId: 'missing-request',
        approverId: 'checker-1',
        action: 'approve',
      })
    )

    expect(exit._tag).toBe('Failure')
    expect(String(exit.cause)).toContain('NotFoundError')
  })

  test('processApprovalAction enforces no self-approval', async () => {
    state.findRequestByIdResult = {
      id: 'approval-1',
      status: 'pending',
      requestedBy: 'maker-1',
      tenantId: 'tenant-approval-1',
      approvalsRequired: 1,
      approvalsReceived: 0,
      currentLevel: 1,
      actions: [],
      requestData: { operation: 'create', entityType: 'user', data: {} },
    }

    const exit = await Effect.runPromiseExit(
      approvalService.processApprovalAction({
        requestId: 'approval-1',
        approverId: 'maker-1',
        action: 'approve',
      })
    )

    expect(exit._tag).toBe('Failure')
    expect(String(exit.cause)).toContain('You cannot approve your own request')
  })

  test('cancelApprovalRequest prevents non-requester cancellation', async () => {
    state.findRequestByIdResult = {
      id: 'approval-1',
      status: 'pending',
      requestedBy: 'maker-1',
      currentLevel: 1,
    }

    const exit = await Effect.runPromiseExit(
      approvalService.cancelApprovalRequest({
        requestId: 'approval-1',
        cancelledBy: 'checker-1',
        isSystemUser: false,
      })
    )

    expect(exit._tag).toBe('Failure')
    expect(String(exit.cause)).toContain('Only the original requester can cancel this request')
  })

  test('getPendingApprovalsForUser filters by role/permission and strict SoD', async () => {
    state.userRolesFindByUserResult = [
      {
        role: {
          roleCode: 'checker',
          roleName: 'Checker',
          rolePermissions: [
            {
              permission: {
                code: 'approval.requests.approve',
              },
            },
          ],
        },
      },
    ]

    state.findPendingRequestsResult = [
      {
        id: 'request-1',
        currentLevel: 1,
        actions: [],
        matrix: {
          levels: [
            {
              level: 1,
              name: 'Checker',
              requiredRoleCodes: ['checker'],
              requiredPermissionCodes: ['approval.requests.approve'],
              requiredCount: 1,
            },
          ],
        },
      },
      {
        id: 'request-2',
        currentLevel: 1,
        actions: [
          {
            action: 'approve',
            approverId: 'checker-1',
            level: 1,
          },
        ],
        matrix: {
          levels: [
            {
              level: 1,
              name: 'Checker',
              requiredRoleCodes: ['checker'],
              requiredPermissionCodes: ['approval.requests.approve'],
              requiredCount: 1,
            },
          ],
        },
      },
      {
        id: 'request-3',
        currentLevel: 1,
        actions: [],
        matrix: {
          levels: [
            {
              level: 1,
              name: 'Approver',
              requiredRoleCodes: ['approver'],
              requiredPermissionCodes: ['approval.requests.approve'],
              requiredCount: 1,
            },
          ],
        },
      },
    ]

    const result = await Effect.runPromise(
      approvalService.getPendingApprovalsForUser('checker-1', 'tenant-approval-1')
    )

    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('request-1')
  })

  test('getApprovalRoutingOverview returns fallback routing with approver candidates', async () => {
    state.findMatrixByEntityTypeResult = null
    state.routingAssignments = [
      {
        user: {
          id: 'checker-1',
          fullName: 'Checker One',
          email: 'checker@iaf.co.id',
          department: 'Risk',
          position: 'Checker',
          isActive: true,
        },
        role: {
          roleCode: 'checker',
          roleName: 'Checker',
          rolePermissions: [
            {
              permission: {
                code: 'approval.requests.approve',
              },
            },
          ],
        },
      },
    ]

    const overview = await Effect.runPromise(
      approvalService.getApprovalRoutingOverview({
        tenantId: 'tenant-approval-1',
        entityType: 'user',
        operation: 'create',
      })
    )

    expect(overview).toHaveLength(1)
    expect(overview[0].matrixName).toBe('Strict 4-Eyes Fallback')
    expect(overview[0].levels[0].candidateCount).toBe(1)
    expect(overview[0].levels[0].candidates[0].userId).toBe('checker-1')
  })

  test('createApprovalRequest maps repository failures to DatabaseError', async () => {
    state.findMatrixByEntityTypeError = new Error('database unavailable')

    const exit = await Effect.runPromiseExit(
      approvalService.createApprovalRequest({
        tenantId: 'tenant-approval-1',
        entityType: 'user',
        entityId: 'user-1',
        title: 'Create User',
        requestedBy: 'maker-1',
      })
    )

    expect(exit._tag).toBe('Failure')
    expect(String(exit.cause)).toContain('DatabaseError')
  })

  test('createApprovalRequest emits notifications to first-level approvers when request hydration succeeds', async () => {
    state.findRequestByIdById.set('approval-1', {
      id: 'approval-1',
      tenantId: 'tenant-approval-1',
      entityType: 'user',
      entityId: 'user-1',
      title: 'Create User',
      requestedBy: 'maker-1',
      currentLevel: 1,
      matrix: {
        levels: [
          {
            level: 1,
            name: 'Checker',
            requiredRoleCodes: ['checker'],
            requiredPermissionCodes: ['approval.requests.approve'],
            requiredCount: 1,
          },
        ],
      },
    })
    state.routingAssignments = [
      {
        user: {
          id: 'checker-1',
          fullName: 'Checker One',
          email: 'checker@iaf.co.id',
          department: 'Risk',
          position: 'Checker',
          isActive: true,
        },
        role: {
          roleCode: 'checker',
          roleName: 'Checker',
          rolePermissions: [
            {
              permission: {
                code: 'approval.requests.approve',
              },
            },
          ],
        },
      },
    ]

    const result = await Effect.runPromise(
      approvalService.createApprovalRequest({
        tenantId: 'tenant-approval-1',
        entityType: 'user',
        entityId: 'user-1',
        title: 'Create User',
        requestedBy: 'maker-1',
      })
    )

    expect(result.id).toBe('approval-1')
    expect(state.socketBroadcastToUsersCalls.length).toBeGreaterThan(0)
    expect(state.notificationCreateCalls.length).toBeGreaterThan(0)
    expect(state.notificationCreateCalls[0].deliveryStatus).toBe('sent')
  })

  test('processApprovalAction returns BusinessError when request status is not pending', async () => {
    state.findRequestByIdResult = {
      id: 'approval-closed',
      status: 'approved',
      requestedBy: 'maker-1',
      currentLevel: 1,
      approvalsRequired: 1,
      approvalsReceived: 1,
      actions: [],
    }

    const exit = await Effect.runPromiseExit(
      approvalService.processApprovalAction({
        requestId: 'approval-closed',
        approverId: 'checker-1',
        action: 'approve',
      })
    )

    expect(exit._tag).toBe('Failure')
    expect(String(exit.cause)).toContain('Request is already approved')
  })

  test('processApprovalAction rejects approver who already approved earlier stage', async () => {
    state.findRequestByIdResult = {
      id: 'approval-1',
      status: 'pending',
      requestedBy: 'maker-1',
      tenantId: 'tenant-approval-1',
      approvalsRequired: 2,
      approvalsReceived: 1,
      currentLevel: 2,
      actions: [{ action: 'approve', approverId: 'checker-1', level: 1 }],
    }

    const exit = await Effect.runPromiseExit(
      approvalService.processApprovalAction({
        requestId: 'approval-1',
        approverId: 'checker-1',
        action: 'approve',
      })
    )

    expect(exit._tag).toBe('Failure')
    expect(String(exit.cause)).toContain('already approved this request')
  })

  test('processApprovalAction returns AuthorizationError for ineligible matrix approver', async () => {
    state.findRequestByIdResult = {
      id: 'approval-authz',
      status: 'pending',
      requestedBy: 'maker-1',
      tenantId: 'tenant-approval-1',
      approvalsRequired: 1,
      approvalsReceived: 0,
      currentLevel: 1,
      actions: [],
      matrix: {
        levels: [
          {
            level: 1,
            name: 'Checker',
            requiredRoleCodes: ['checker'],
            requiredPermissionCodes: ['approval.requests.approve'],
            requiredCount: 1,
          },
        ],
      },
    }
    state.userRolesFindByUserResult = []

    const exit = await Effect.runPromiseExit(
      approvalService.processApprovalAction({
        requestId: 'approval-authz',
        approverId: 'approver-without-role',
        action: 'approve',
      })
    )

    expect(exit._tag).toBe('Failure')
    expect(String(exit.cause)).toContain('AuthorizationError')
  })

  test('processApprovalAction in matrix flow advances to next level when current level is complete', async () => {
    state.findRequestByIdResult = {
      id: 'approval-matrix-step',
      status: 'pending',
      requestedBy: 'maker-1',
      tenantId: 'tenant-approval-1',
      approvalsRequired: 2,
      approvalsReceived: 0,
      currentLevel: 1,
      actions: [],
      matrix: {
        levels: [
          {
            level: 1,
            name: 'Checker',
            requiredRoleCodes: ['checker'],
            requiredPermissionCodes: ['approval.requests.approve'],
            requiredCount: 1,
          },
          {
            level: 2,
            name: 'Approver',
            requiredRoleCodes: ['approver'],
            requiredPermissionCodes: ['approval.requests.approve'],
            requiredCount: 1,
          },
        ],
      },
    }
    state.userRolesFindByUserResult = [
      {
        role: {
          roleCode: 'checker',
          roleName: 'Checker',
          rolePermissions: [{ permission: { code: 'approval.requests.approve' } }],
        },
      },
    ]
    state.routingAssignments = [
      {
        user: {
          id: 'approver-1',
          fullName: 'Approver One',
          email: 'approver@iaf.co.id',
          department: 'Risk',
          position: 'Approver',
          isActive: true,
        },
        role: {
          roleCode: 'approver',
          roleName: 'Approver',
          rolePermissions: [{ permission: { code: 'approval.requests.approve' } }],
        },
      },
    ]

    const result = await Effect.runPromise(
      approvalService.processApprovalAction({
        requestId: 'approval-matrix-step',
        approverId: 'checker-1',
        action: 'approve',
      })
    )

    expect(result.completed).toBe(false)
    expect(result.status).toBe('pending')
    expect(state.updateRequestCalls[0]?.[1]?.currentLevel).toBe(2)
  })

  test('processApprovalAction completes matrix approval and executes configuration handler', async () => {
    state.findRequestByIdResult = {
      id: 'approval-config-final',
      status: 'pending',
      requestedBy: 'maker-1',
      tenantId: 'tenant-approval-1',
      approvalsRequired: 1,
      approvalsReceived: 0,
      currentLevel: 1,
      actions: [],
      matrix: {
        levels: [
          {
            level: 1,
            name: 'Checker',
            requiredRoleCodes: ['checker'],
            requiredPermissionCodes: ['approval.requests.approve'],
            requiredCount: 1,
          },
        ],
      },
      requestData: {
        operation: 'update',
        entityType: 'pd_configuration',
        data: { segment: 'retail' },
      },
    }
    state.userRolesFindByUserResult = [
      {
        role: {
          roleCode: 'checker',
          roleName: 'Checker',
          rolePermissions: [{ permission: { code: 'approval.requests.approve' } }],
        },
      },
    ]

    const result = await Effect.runPromise(
      approvalService.processApprovalAction({
        requestId: 'approval-config-final',
        approverId: 'checker-1',
        action: 'approve',
      })
    )

    expect(result.completed).toBe(true)
    expect(result.status).toBe('approved')
    expect(state.updateRequestCalls[0]?.[1]?.status).toBe('approved')
    expect(
      state.notificationCreateCalls.some((payload) => payload.type === 'APPROVAL_APPROVED')
    ).toBe(true)
  })

  test('processApprovalAction maps executeApprovedAction failures to DatabaseError', async () => {
    state.findRequestByIdResult = {
      id: 'approval-user-status',
      status: 'pending',
      requestedBy: 'maker-1',
      tenantId: 'tenant-approval-1',
      approvalsRequired: 1,
      approvalsReceived: 0,
      currentLevel: 1,
      actions: [],
      requestData: {
        operation: 'update',
        entityType: 'user_status',
        data: {},
      },
    }

    const exit = await Effect.runPromiseExit(
      approvalService.processApprovalAction({
        requestId: 'approval-user-status',
        approverId: 'checker-1',
        action: 'approve',
      })
    )

    expect(exit._tag).toBe('Failure')
    expect(String(exit.cause)).toContain('DatabaseError')
    expect(String(exit.cause)).toContain('Missing user id')
  })

  test('processApprovalAction handles reject, request_info, delegate, and unknown actions', async () => {
    state.findRequestByIdResult = {
      id: 'approval-actions',
      status: 'pending',
      requestedBy: 'maker-1',
      tenantId: 'tenant-approval-1',
      approvalsRequired: 2,
      approvalsReceived: 0,
      currentLevel: 1,
      actions: [],
      requestData: {
        operation: 'create',
        entityType: 'role_permission',
        data: {},
      },
    }

    const rejectResult = await Effect.runPromise(
      approvalService.processApprovalAction({
        requestId: 'approval-actions',
        approverId: 'checker-1',
        action: 'reject',
      })
    )
    expect(rejectResult.status).toBe('rejected')

    const infoResult = await Effect.runPromise(
      approvalService.processApprovalAction({
        requestId: 'approval-actions',
        approverId: 'checker-1',
        action: 'request_info',
        comment: 'Need more detail',
      })
    )
    expect(infoResult.status).toBe('pending')

    const delegateErrorExit = await Effect.runPromiseExit(
      approvalService.processApprovalAction({
        requestId: 'approval-actions',
        approverId: 'checker-1',
        action: 'delegate',
      } as any)
    )
    expect(delegateErrorExit._tag).toBe('Failure')
    expect(String(delegateErrorExit.cause)).toContain('Delegation target user ID is required')

    const delegateResult = await Effect.runPromise(
      approvalService.processApprovalAction({
        requestId: 'approval-actions',
        approverId: 'checker-1',
        action: 'delegate',
        delegatedTo: 'approver-2',
      })
    )
    expect(delegateResult.status).toBe('pending')

    const unknownResult = await Effect.runPromise(
      approvalService.processApprovalAction({
        requestId: 'approval-actions',
        approverId: 'checker-1',
        action: 'noop',
      } as any)
    )
    expect(unknownResult.status).toBe('pending')
  })

  test('processApprovalAction maps repository action insert failures to DatabaseError', async () => {
    state.findRequestByIdResult = {
      id: 'approval-action-fail',
      status: 'pending',
      requestedBy: 'maker-1',
      tenantId: 'tenant-approval-1',
      approvalsRequired: 1,
      approvalsReceived: 0,
      currentLevel: 1,
      actions: [],
    }
    state.createActionError = new Error('insert failed')

    const exit = await Effect.runPromiseExit(
      approvalService.processApprovalAction({
        requestId: 'approval-action-fail',
        approverId: 'checker-1',
        action: 'reject',
      })
    )

    expect(exit._tag).toBe('Failure')
    expect(String(exit.cause)).toContain('DatabaseError')
  })

  test('processApprovalAction persists failed notification when socket broadcast fails', async () => {
    state.findRequestByIdResult = {
      id: 'approval-request-info-socket-fail',
      status: 'pending',
      requestedBy: 'maker-1',
      tenantId: 'tenant-approval-1',
      approvalsRequired: 1,
      approvalsReceived: 0,
      currentLevel: 1,
      actions: [],
    }
    state.socketError = new Error('socket unavailable')

    const result = await Effect.runPromise(
      approvalService.processApprovalAction({
        requestId: 'approval-request-info-socket-fail',
        approverId: 'checker-1',
        action: 'request_info',
        comment: 'Need clarification',
      })
    )

    expect(result.status).toBe('pending')
    expect(state.notificationCreateCalls.length).toBe(1)
    expect(state.notificationCreateCalls[0].deliveryStatus).toBe('failed')
  })

  test('cancelApprovalRequest supports system-user cancellation and not-found/not-cancellable guards', async () => {
    state.findRequestByIdResult = null
    const missingExit = await Effect.runPromiseExit(
      approvalService.cancelApprovalRequest({
        requestId: 'missing-request',
        cancelledBy: 'admin-1',
        isSystemUser: true,
      })
    )
    expect(missingExit._tag).toBe('Failure')
    expect(String(missingExit.cause)).toContain('NotFoundError')

    state.findRequestByIdResult = {
      id: 'approval-complete',
      status: 'approved',
      requestedBy: 'maker-1',
      currentLevel: 1,
    }
    const closedExit = await Effect.runPromiseExit(
      approvalService.cancelApprovalRequest({
        requestId: 'approval-complete',
        cancelledBy: 'admin-1',
        isSystemUser: true,
      })
    )
    expect(closedExit._tag).toBe('Failure')
    expect(String(closedExit.cause)).toContain('already approved')

    state.findRequestByIdResult = {
      id: 'approval-pending-system-cancel',
      status: 'pending',
      requestedBy: 'maker-1',
      currentLevel: 2,
    }
    const result = await Effect.runPromise(
      approvalService.cancelApprovalRequest({
        requestId: 'approval-pending-system-cancel',
        cancelledBy: 'admin-1',
        isSystemUser: true,
        reason: 'Operational rollback',
      })
    )

    expect(result.status).toBe('cancelled')
    const lastActionCall = state.createActionCalls[state.createActionCalls.length - 1] as any
    expect(lastActionCall?.[0]?.approverRole).toBe('SYSTEM')
  })

  test('getApprovalRequest and getApprovalHistory handle success and not-found branches', async () => {
    state.findRequestByIdResult = {
      id: 'approval-detail-1',
      status: 'pending',
      actions: [],
    }
    const detail = await Effect.runPromise(
      approvalService.getApprovalRequest('approval-detail-1')
    )
    expect(detail.id).toBe('approval-detail-1')

    state.findRequestByIdResult = null
    const detailExit = await Effect.runPromiseExit(
      approvalService.getApprovalRequest('approval-detail-missing')
    )
    expect(detailExit._tag).toBe('Failure')
    expect(String(detailExit.cause)).toContain('NotFoundError')

    state.findRequestsByTenantResult = [{ id: 'tenant-history-1' }]
    state.findRequestsByEntityResult = [{ id: 'entity-history-1' }]

    const tenantHistory = await Effect.runPromise(
      approvalService.getApprovalHistory('tenant-approval-1')
    )
    const entityHistory = await Effect.runPromise(
      approvalService.getApprovalHistory('tenant-approval-1', 'user', 'user-1')
    )

    expect(tenantHistory).toHaveLength(1)
    expect(tenantHistory[0].id).toBe('tenant-history-1')
    expect(entityHistory).toHaveLength(1)
    expect(entityHistory[0].id).toBe('entity-history-1')
  })

  test('getApprovalRoutingOverview uses matrix filtering and returns empty result when no entityType fallback is allowed', async () => {
    state.findMatricesByTenantResult = [
      {
        id: 'matrix-create',
        name: 'Create Matrix',
        entityType: 'user',
        operationType: 'create',
        isActive: true,
        levels: [
          {
            level: 1,
            name: 'Checker',
            requiredRoleCodes: ['checker'],
            requiredPermissionCodes: ['approval.requests.approve'],
            requiredCount: 1,
          },
        ],
      },
      {
        id: 'matrix-delete',
        name: 'Delete Matrix',
        entityType: 'user',
        operationType: 'delete',
        isActive: true,
        levels: [],
      },
    ]
    state.routingAssignments = [
      {
        user: {
          id: 'checker-1',
          fullName: 'Checker One',
          email: 'checker@iaf.co.id',
          department: 'Risk',
          position: 'Checker',
          isActive: true,
        },
        role: {
          roleCode: 'checker',
          roleName: 'Checker',
          rolePermissions: [{ permission: { code: 'approval.requests.approve' } }],
        },
      },
    ]

    const filtered = await Effect.runPromise(
      approvalService.getApprovalRoutingOverview({
        tenantId: 'tenant-approval-1',
        operation: 'create',
      })
    )
    expect(filtered).toHaveLength(1)
    expect(filtered[0].matrixId).toBe('matrix-create')

    state.findMatricesByTenantResult = []
    const empty = await Effect.runPromise(
      approvalService.getApprovalRoutingOverview({
        tenantId: 'tenant-approval-1',
      })
    )
    expect(empty).toHaveLength(0)
  })

  test('getPendingApprovalsForUser includes requests without explicit routing levels', async () => {
    state.userRolesFindByUserResult = []
    state.findPendingRequestsResult = [
      {
        id: 'request-without-levels',
        currentLevel: 1,
        actions: [],
      },
    ]

    const result = await Effect.runPromise(
      approvalService.getPendingApprovalsForUser('checker-1', 'tenant-approval-1')
    )

    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('request-without-levels')
  })

  test('createApprovalRequest applies impact-level fallback approvals when no matrix exists', async () => {
    await Effect.runPromise(
      approvalService.createApprovalRequest({
        tenantId: 'tenant-approval-1',
        entityType: 'user',
        entityId: 'user-low',
        title: 'Low Impact',
        requestedBy: 'maker-1',
        impactLevel: 'low',
      })
    )
    await Effect.runPromise(
      approvalService.createApprovalRequest({
        tenantId: 'tenant-approval-1',
        entityType: 'user',
        entityId: 'user-high',
        title: 'High Impact',
        requestedBy: 'maker-1',
        impactLevel: 'high',
      })
    )
    await Effect.runPromise(
      approvalService.createApprovalRequest({
        tenantId: 'tenant-approval-1',
        entityType: 'user',
        entityId: 'user-critical',
        title: 'Critical Impact',
        requestedBy: 'maker-1',
        impactLevel: 'critical',
      })
    )

    const lowPayload = state.createRequestCalls[0]?.[0] as any
    const highPayload = state.createRequestCalls[1]?.[0] as any
    const criticalPayload = state.createRequestCalls[2]?.[0] as any

    expect(lowPayload.approvalsRequired).toBe(1)
    expect(highPayload.approvalsRequired).toBe(2)
    expect(criticalPayload.approvalsRequired).toBe(2)
  })

  test('processApprovalAction approve path handles no-op and invalid executor payloads safely', async () => {
    state.findRequestByIdResult = {
      id: 'approval-invalid-payload',
      status: 'pending',
      requestedBy: 'maker-1',
      tenantId: 'tenant-approval-1',
      approvalsRequired: 1,
      approvalsReceived: 0,
      currentLevel: 1,
      actions: [],
      requestData: {},
    }

    const invalidPayloadResult = await Effect.runPromise(
      approvalService.processApprovalAction({
        requestId: 'approval-invalid-payload',
        approverId: 'checker-1',
        action: 'approve',
      })
    )
    expect(invalidPayloadResult.status).toBe('approved')

    state.findRequestByIdResult = {
      id: 'approval-user-status-create',
      status: 'pending',
      requestedBy: 'maker-1',
      tenantId: 'tenant-approval-1',
      approvalsRequired: 1,
      approvalsReceived: 0,
      currentLevel: 1,
      actions: [],
      requestData: {
        operation: 'create',
        entityType: 'user_status',
        data: { id: 'user-1' },
      },
    }

    const userStatusNoop = await Effect.runPromise(
      approvalService.processApprovalAction({
        requestId: 'approval-user-status-create',
        approverId: 'checker-1',
        action: 'approve',
      })
    )
    expect(userStatusNoop.status).toBe('approved')

    state.findRequestByIdResult = {
      id: 'approval-role-permission-create',
      status: 'pending',
      requestedBy: 'maker-1',
      tenantId: 'tenant-approval-1',
      approvalsRequired: 1,
      approvalsReceived: 0,
      currentLevel: 1,
      actions: [],
      requestData: {
        operation: 'create',
        entityType: 'role_permission',
        data: { roleId: 'role-1' },
      },
    }

    const rolePermissionNoop = await Effect.runPromise(
      approvalService.processApprovalAction({
        requestId: 'approval-role-permission-create',
        approverId: 'checker-1',
        action: 'approve',
      })
    )
    expect(rolePermissionNoop.status).toBe('approved')
  })

  test('cancelApprovalRequest maps update failures to DatabaseError', async () => {
    state.findRequestByIdResult = {
      id: 'approval-cancel-failure',
      status: 'pending',
      requestedBy: 'maker-1',
      currentLevel: 1,
    }
    state.updateRequestError = new Error('update failed')

    const exit = await Effect.runPromiseExit(
      approvalService.cancelApprovalRequest({
        requestId: 'approval-cancel-failure',
        cancelledBy: 'maker-1',
        isSystemUser: false,
      })
    )

    expect(exit._tag).toBe('Failure')
    expect(String(exit.cause)).toContain('DatabaseError')
  })
})
