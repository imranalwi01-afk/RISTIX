import { beforeEach, describe, expect, mock, test } from 'bun:test'
import { Effect } from 'effect'

const state = {
  findDuplicatePendingRequestResult: null as any,
  findDuplicatePendingRequestError: null as Error | null,
  findMatrixByEntityTypeResult: null as any,
  findMatrixByEntityTypeError: null as Error | null,
  findMatricesByTenantResult: [] as any[],
  createMatrixResult: { id: 'matrix-created' } as any,
  createMatrixError: null as Error | null,
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
  createMatrixCalls: [] as unknown[][],
  userRolesFindByUserResult: [] as any[],
  routingAssignments: [] as any[],
  notificationCreateCalls: [] as any[],
  notificationPersistError: null as Error | null,
  socketBroadcastToUsersCalls: [] as any[],
  socketBroadcastCalls: [] as any[],
  socketError: null as Error | null,
  filteredRecipients: null as string[] | null,
  derivedCategory: 'approval',
  userServiceCalls: {
    create: [] as any[],
    update: [] as any[],
    delete: [] as any[],
    enable: [] as any[],
    disable: [] as any[],
  },
  rbacServiceCalls: {
    createRole: [] as any[],
    updateRole: [] as any[],
    deleteRole: [] as any[],
    assignRole: [] as any[],
    removeRole: [] as any[],
    updateRolePermissions: [] as any[],
  },
  parametersServiceCalls: {
    create: [] as any[],
    update: [] as any[],
    delete: [] as any[],
  },
  availablePermissions: [
    { id: 'perm-approval', code: 'approval.requests.approve' },
    { id: 'perm-users-create', code: 'users.create' },
  ] as Array<{ id: string; code: string }>,
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
    createMatrix: async (...args: unknown[]) => {
      if (state.createMatrixError) {
        throw state.createMatrixError
      }
      state.createMatrixCalls.push(args)
      return state.createMatrixResult
    },
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

mock.module('@/services/users.service', () => ({
  createUser: (payload: any) => {
    state.userServiceCalls.create.push(payload)
    return Effect.succeed({ id: payload?.id || 'user-created' })
  },
  updateUser: (userId: string, payload: any) => {
    state.userServiceCalls.update.push({ userId, payload })
    return Effect.succeed({ id: userId })
  },
  deleteUser: (userId: string, tenantId: string) => {
    state.userServiceCalls.delete.push({ userId, tenantId })
    return Effect.succeed(undefined)
  },
  enableUser: (userId: string, tenantId: string) => {
    state.userServiceCalls.enable.push({ userId, tenantId })
    return Effect.succeed(undefined)
  },
  disableUser: (userId: string, tenantId: string) => {
    state.userServiceCalls.disable.push({ userId, tenantId })
    return Effect.succeed(undefined)
  },
}))

mock.module('@/services/rbac.service', () => ({
  createRole: (payload: any) => {
    state.rbacServiceCalls.createRole.push(payload)
    return Effect.succeed({ id: payload?.id || 'role-created' })
  },
  updateRole: (roleId: string, payload: any) => {
    state.rbacServiceCalls.updateRole.push({ roleId, payload })
    return Effect.succeed({ id: roleId })
  },
  deleteRole: (roleId: string, tenantId: string) => {
    state.rbacServiceCalls.deleteRole.push({ roleId, tenantId })
    return Effect.succeed(undefined)
  },
  assignRole: (payload: any) => {
    state.rbacServiceCalls.assignRole.push(payload)
    return Effect.succeed(undefined)
  },
  removeRole: (userId: string, roleId: string, tenantId: string) => {
    state.rbacServiceCalls.removeRole.push({ userId, roleId, tenantId })
    return Effect.succeed(undefined)
  },
  getAvailablePermissions: (_tenantId: string) => Effect.succeed(state.availablePermissions),
  updateRolePermissions: (roleId: string, permissionIds: string[], tenantId: string) => {
    state.rbacServiceCalls.updateRolePermissions.push({ roleId, permissionIds, tenantId })
    return Effect.succeed(undefined)
  },
}))

mock.module('@/services/parameters.service', () => ({
  ParametersService: {
    createAppSetting: (payload: any, scope: string) => {
      state.parametersServiceCalls.create.push({ payload, scope })
      return Effect.succeed(undefined)
    },
    updateAppSetting: (paramCode: string, payload: any, scope: string) => {
      state.parametersServiceCalls.update.push({ paramCode, payload, scope })
      return Effect.succeed(undefined)
    },
    deleteAppSetting: (paramCode: string) => {
      state.parametersServiceCalls.delete.push({ paramCode })
      return Effect.succeed(undefined)
    },
  },
}))

const approvalService = await import('@/services/approval.service')

describe('approval.service behavior', () => {
  beforeEach(() => {
    state.findDuplicatePendingRequestResult = null
    state.findDuplicatePendingRequestError = null
    state.findMatrixByEntityTypeResult = null
    state.findMatrixByEntityTypeError = null
    state.findMatricesByTenantResult = []
    state.createMatrixResult = { id: 'matrix-created' }
    state.createMatrixError = null
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
    state.createMatrixCalls = []
    state.userRolesFindByUserResult = []
    state.routingAssignments = []
    state.notificationCreateCalls = []
    state.notificationPersistError = null
    state.socketBroadcastToUsersCalls = []
    state.socketBroadcastCalls = []
    state.socketError = null
    state.filteredRecipients = null
    state.derivedCategory = 'approval'
    state.userServiceCalls = {
      create: [],
      update: [],
      delete: [],
      enable: [],
      disable: [],
    }
    state.rbacServiceCalls = {
      createRole: [],
      updateRole: [],
      deleteRole: [],
      assignRole: [],
      removeRole: [],
      updateRolePermissions: [],
    }
    state.parametersServiceCalls = {
      create: [],
      update: [],
      delete: [],
    }
    state.availablePermissions = [
      { id: 'perm-approval', code: 'approval.requests.approve' },
      { id: 'perm-users-create', code: 'users.create' },
    ]
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

  const makePendingApprovalRequest = (overrides: Record<string, any> = {}) => ({
    id: 'approval-exec',
    status: 'pending',
    requestedBy: 'maker-1',
    tenantId: 'tenant-approval-1',
    approvalsRequired: 1,
    approvalsReceived: 0,
    currentLevel: 1,
    actions: [],
    requestData: {
      operation: 'create',
      entityType: 'user',
      data: {},
    },
    ...overrides,
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

  test('matrix query helpers return repository-backed data and map create errors', async () => {
    state.findMatrixByEntityTypeResult = { id: 'matrix-lookup' }
    state.findMatricesByTenantResult = [{ id: 'matrix-a' }, { id: 'matrix-b' }]
    state.createMatrixResult = { id: 'matrix-created' }

    const byEntity = await Effect.runPromise(
      approvalService.getApprovalMatrix('tenant-approval-1', 'user', 'conventional')
    )
    const all = await Effect.runPromise(
      approvalService.getApprovalMatrices('tenant-approval-1')
    )
    const created = await Effect.runPromise(
      approvalService.createApprovalMatrix(
        { tenantId: 'tenant-approval-1', entityType: 'user' } as any,
        [{ level: 1, name: 'Checker', requiredCount: 1 } as any]
      )
    )

    expect(byEntity.id).toBe('matrix-lookup')
    expect(all).toHaveLength(2)
    expect(created.id).toBe('matrix-created')
    expect(state.createMatrixCalls).toHaveLength(1)

    state.createMatrixError = new Error('matrix insert failed')
    const createExit = await Effect.runPromiseExit(
      approvalService.createApprovalMatrix(
        { tenantId: 'tenant-approval-1', entityType: 'user' } as any,
        [{ level: 1, name: 'Checker', requiredCount: 1 } as any]
      )
    )

    expect(createExit._tag).toBe('Failure')
    expect(String(createExit.cause)).toContain('DatabaseError')
  })

  test('processApprovalAction executes user and user_status branches', async () => {
    state.findRequestByIdResult = makePendingApprovalRequest({
      id: 'approval-user-create',
      requestData: {
        operation: 'create',
        entityType: 'user',
        data: { username: 'maker_a' },
      },
    })
    await Effect.runPromise(
      approvalService.processApprovalAction({
        requestId: 'approval-user-create',
        approverId: 'checker-1',
        action: 'approve',
      })
    )

    state.findRequestByIdResult = makePendingApprovalRequest({
      id: 'approval-user-update',
      entityId: 'user-updated-1',
      requestData: {
        operation: 'update',
        entityType: 'user',
        data: { fullName: 'Updated Name' },
      },
    })
    await Effect.runPromise(
      approvalService.processApprovalAction({
        requestId: 'approval-user-update',
        approverId: 'checker-1',
        action: 'approve',
      })
    )

    state.findRequestByIdResult = makePendingApprovalRequest({
      id: 'approval-user-delete',
      requestData: {
        operation: 'delete',
        entityType: 'user',
        data: { id: 'user-delete-1' },
      },
    })
    await Effect.runPromise(
      approvalService.processApprovalAction({
        requestId: 'approval-user-delete',
        approverId: 'checker-1',
        action: 'approve',
      })
    )

    state.findRequestByIdResult = makePendingApprovalRequest({
      id: 'approval-user-status-enable',
      requestData: {
        operation: 'update',
        entityType: 'user_status',
        data: { id: 'user-enable-1', isActive: true },
      },
    })
    await Effect.runPromise(
      approvalService.processApprovalAction({
        requestId: 'approval-user-status-enable',
        approverId: 'checker-1',
        action: 'approve',
      })
    )

    state.findRequestByIdResult = makePendingApprovalRequest({
      id: 'approval-user-status-disable',
      requestData: {
        operation: 'update',
        entityType: 'user_status',
        data: { id: 'user-disable-1', isActive: false },
      },
    })
    await Effect.runPromise(
      approvalService.processApprovalAction({
        requestId: 'approval-user-status-disable',
        approverId: 'checker-1',
        action: 'approve',
      })
    )

    expect(state.userServiceCalls.create).toHaveLength(1)
    expect(state.userServiceCalls.update).toHaveLength(1)
    expect(state.userServiceCalls.update[0].userId).toBe('user-updated-1')
    expect(state.userServiceCalls.delete).toHaveLength(1)
    expect(state.userServiceCalls.enable).toHaveLength(1)
    expect(state.userServiceCalls.disable).toHaveLength(1)
  })

  test('processApprovalAction executes role and role_assignment branches', async () => {
    state.findRequestByIdResult = makePendingApprovalRequest({
      id: 'approval-role-create',
      requestData: {
        operation: 'create',
        entityType: 'role',
        data: { roleName: 'Analyst' },
      },
    })
    await Effect.runPromise(
      approvalService.processApprovalAction({
        requestId: 'approval-role-create',
        approverId: 'checker-1',
        action: 'approve',
      })
    )

    state.findRequestByIdResult = makePendingApprovalRequest({
      id: 'approval-role-update',
      requestData: {
        operation: 'update',
        entityType: 'role',
        data: { id: 'role-update-1', roleName: 'Senior Analyst' },
      },
    })
    await Effect.runPromise(
      approvalService.processApprovalAction({
        requestId: 'approval-role-update',
        approverId: 'checker-1',
        action: 'approve',
      })
    )

    state.findRequestByIdResult = makePendingApprovalRequest({
      id: 'approval-role-delete',
      requestData: {
        operation: 'delete',
        entityType: 'role',
        data: { id: 'role-delete-1' },
      },
    })
    await Effect.runPromise(
      approvalService.processApprovalAction({
        requestId: 'approval-role-delete',
        approverId: 'checker-1',
        action: 'approve',
      })
    )

    state.findRequestByIdResult = makePendingApprovalRequest({
      id: 'approval-role-assignment-create',
      requestData: {
        operation: 'create',
        entityType: 'role_assignment',
        data: {
          userId: 'user-assign-1',
          roleId: 'role-assign-1',
          assignedBy: 'checker-1',
          validFrom: '2026-02-25T00:00:00.000Z',
          validUntil: '2026-03-25T00:00:00.000Z',
          isTemporary: true,
          temporaryReason: 'Project assignment',
        },
      },
    })
    await Effect.runPromise(
      approvalService.processApprovalAction({
        requestId: 'approval-role-assignment-create',
        approverId: 'checker-1',
        action: 'approve',
      })
    )

    state.findRequestByIdResult = makePendingApprovalRequest({
      id: 'approval-role-assignment-delete',
      requestData: {
        operation: 'delete',
        entityType: 'role_assignment',
        data: { userId: 'user-assign-1', roleId: 'role-assign-1' },
      },
    })
    await Effect.runPromise(
      approvalService.processApprovalAction({
        requestId: 'approval-role-assignment-delete',
        approverId: 'checker-1',
        action: 'approve',
      })
    )

    const beforeUnsupported = state.rbacServiceCalls.assignRole.length + state.rbacServiceCalls.removeRole.length
    state.findRequestByIdResult = makePendingApprovalRequest({
      id: 'approval-role-assignment-update-unsupported',
      requestData: {
        operation: 'update',
        entityType: 'role_assignment',
        data: { userId: 'user-assign-2', roleId: 'role-assign-2' },
      },
    })
    await Effect.runPromise(
      approvalService.processApprovalAction({
        requestId: 'approval-role-assignment-update-unsupported',
        approverId: 'checker-1',
        action: 'approve',
      })
    )

    expect(state.rbacServiceCalls.createRole).toHaveLength(1)
    expect(state.rbacServiceCalls.updateRole).toHaveLength(1)
    expect(state.rbacServiceCalls.deleteRole).toHaveLength(1)
    expect(state.rbacServiceCalls.assignRole).toHaveLength(1)
    expect(state.rbacServiceCalls.removeRole).toHaveLength(1)
    expect(state.rbacServiceCalls.assignRole[0].validFrom instanceof Date).toBe(true)
    expect(state.rbacServiceCalls.assignRole.length + state.rbacServiceCalls.removeRole.length).toBe(beforeUnsupported)
  })

  test('processApprovalAction maps role and role_assignment payload validation errors', async () => {
    state.findRequestByIdResult = makePendingApprovalRequest({
      id: 'approval-role-update-missing-id',
      requestData: {
        operation: 'update',
        entityType: 'role',
        data: {},
      },
    })
    const roleUpdateExit = await Effect.runPromiseExit(
      approvalService.processApprovalAction({
        requestId: 'approval-role-update-missing-id',
        approverId: 'checker-1',
        action: 'approve',
      })
    )
    expect(roleUpdateExit._tag).toBe('Failure')
    expect(String(roleUpdateExit.cause)).toContain('Missing role id')

    state.findRequestByIdResult = makePendingApprovalRequest({
      id: 'approval-role-delete-missing-id',
      requestData: {
        operation: 'delete',
        entityType: 'role',
        data: {},
      },
    })
    const roleDeleteExit = await Effect.runPromiseExit(
      approvalService.processApprovalAction({
        requestId: 'approval-role-delete-missing-id',
        approverId: 'checker-1',
        action: 'approve',
      })
    )
    expect(roleDeleteExit._tag).toBe('Failure')
    expect(String(roleDeleteExit.cause)).toContain('Missing role id')

    state.findRequestByIdResult = makePendingApprovalRequest({
      id: 'approval-role-assignment-missing-user-role',
      requestData: {
        operation: 'create',
        entityType: 'role_assignment',
        data: { userId: 'user-only' },
      },
    })
    const roleAssignmentExit = await Effect.runPromiseExit(
      approvalService.processApprovalAction({
        requestId: 'approval-role-assignment-missing-user-role',
        approverId: 'checker-1',
        action: 'approve',
      })
    )
    expect(roleAssignmentExit._tag).toBe('Failure')
    expect(String(roleAssignmentExit.cause)).toContain('Missing userId/roleId')
  })

  test('processApprovalAction executes parameter-setting branches', async () => {
    state.findRequestByIdResult = makePendingApprovalRequest({
      id: 'approval-setting-create',
      requestData: {
        operation: 'create',
        entityType: 'app_setting',
        data: { paramCode: 'ALLOW_EXPORT', value: true },
      },
    })
    await Effect.runPromise(
      approvalService.processApprovalAction({
        requestId: 'approval-setting-create',
        approverId: 'checker-1',
        action: 'approve',
      })
    )

    state.findRequestByIdResult = makePendingApprovalRequest({
      id: 'approval-setting-update',
      requestData: {
        operation: 'update',
        entityType: 'business_setting',
        data: { paramCode: 'ALLOW_EXPORT', value: false },
      },
    })
    await Effect.runPromise(
      approvalService.processApprovalAction({
        requestId: 'approval-setting-update',
        approverId: 'checker-1',
        action: 'approve',
      })
    )

    state.findRequestByIdResult = makePendingApprovalRequest({
      id: 'approval-setting-delete',
      requestData: {
        operation: 'delete',
        entityType: 'parameter',
        data: { paramCode: 'ALLOW_EXPORT' },
      },
    })
    await Effect.runPromise(
      approvalService.processApprovalAction({
        requestId: 'approval-setting-delete',
        approverId: 'checker-1',
        action: 'approve',
      })
    )

    expect(state.parametersServiceCalls.create).toHaveLength(1)
    expect(state.parametersServiceCalls.update).toHaveLength(1)
    expect(state.parametersServiceCalls.delete).toHaveLength(1)
    expect(state.parametersServiceCalls.update[0].paramCode).toBe('ALLOW_EXPORT')
  })

  test('processApprovalAction executes role-permission update branch with id/code resolution', async () => {
    state.availablePermissions = [
      { id: 'perm-approval', code: 'approval.requests.approve' },
      { id: 'perm-users-create', code: 'users.create' },
      { id: 'perm-jobs-run', code: 'jobs.run' },
    ]

    state.findRequestByIdResult = makePendingApprovalRequest({
      id: 'approval-role-perm-role-id',
      requestData: {
        operation: 'update',
        entityType: 'role_permission',
        data: {
          roleId: 'role-perm-1',
          permissionIds: ['perm-approval', 'users.create'],
        },
      },
    })
    await Effect.runPromise(
      approvalService.processApprovalAction({
        requestId: 'approval-role-perm-role-id',
        approverId: 'checker-1',
        action: 'approve',
      })
    )

    state.findRequestByIdResult = makePendingApprovalRequest({
      id: 'approval-role-perm-id-fallback',
      requestData: {
        operation: 'update',
        entityType: 'role_permissions',
        data: {
          id: 'role-perm-2',
          permissions: ['jobs.run'],
        },
      },
    })
    await Effect.runPromise(
      approvalService.processApprovalAction({
        requestId: 'approval-role-perm-id-fallback',
        approverId: 'checker-1',
        action: 'approve',
      })
    )

    state.findRequestByIdResult = makePendingApprovalRequest({
      id: 'approval-role-perm-entity-id-fallback',
      requestData: {
        operation: 'update',
        entityType: 'role_permissions',
        data: {
          entityId: 'role-perm-3',
          permissions: ['perm-jobs-run'],
        },
      },
    })
    await Effect.runPromise(
      approvalService.processApprovalAction({
        requestId: 'approval-role-perm-entity-id-fallback',
        approverId: 'checker-1',
        action: 'approve',
      })
    )

    expect(state.rbacServiceCalls.updateRolePermissions).toHaveLength(3)
    expect(state.rbacServiceCalls.updateRolePermissions[0].roleId).toBe('role-perm-1')
    expect(state.rbacServiceCalls.updateRolePermissions[0].permissionIds).toEqual(['perm-approval', 'perm-users-create'])
    expect(state.rbacServiceCalls.updateRolePermissions[1].roleId).toBe('role-perm-2')
    expect(state.rbacServiceCalls.updateRolePermissions[2].roleId).toBe('role-perm-3')
  })

  test('processApprovalAction maps role-permission payload validation errors', async () => {
    state.findRequestByIdResult = makePendingApprovalRequest({
      id: 'approval-role-perm-missing-role-id',
      requestData: {
        operation: 'update',
        entityType: 'role_permission',
        data: {},
      },
    })
    const missingRoleExit = await Effect.runPromiseExit(
      approvalService.processApprovalAction({
        requestId: 'approval-role-perm-missing-role-id',
        approverId: 'checker-1',
        action: 'approve',
      })
    )
    expect(missingRoleExit._tag).toBe('Failure')
    expect(String(missingRoleExit.cause)).toContain('Missing roleId')

    state.findRequestByIdResult = makePendingApprovalRequest({
      id: 'approval-role-perm-unknown-perm',
      requestData: {
        operation: 'update',
        entityType: 'role_permission',
        data: {
          roleId: 'role-perm-1',
          permissionIds: ['not-registered-permission'],
        },
      },
    })
    const unknownPermExit = await Effect.runPromiseExit(
      approvalService.processApprovalAction({
        requestId: 'approval-role-perm-unknown-perm',
        approverId: 'checker-1',
        action: 'approve',
      })
    )
    expect(unknownPermExit._tag).toBe('Failure')
    expect(String(unknownPermExit.cause)).toContain('Unknown role permissions')
  })
})
