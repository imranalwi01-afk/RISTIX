import { beforeEach, describe, expect, mock, test } from 'bun:test'
import { Effect } from 'effect'

const state = {
  ctorCalls: [] as unknown[],
  findByPermissionCalls: [] as unknown[][],
  requiresApprovalCalls: [] as unknown[][],
  findRequiringApprovalCalls: [] as unknown[][],
  upsertCalls: [] as unknown[][],
  getMinHierarchyLevelCalls: [] as unknown[][],
  softDeleteCalls: [] as unknown[][],

  findByPermissionResult: null as any,
  requiresApprovalResult: false,
  findRequiringApprovalResult: [] as any[],
  upsertResult: null as any,
  getMinHierarchyLevelResult: null as number | null,
  throwMap: new Map<string, string>(),
}

class PermissionApprovalPolicyRepositoryMock {
  constructor(db: unknown) {
    state.ctorCalls.push(db)
  }

  async findByPermission(...args: unknown[]) {
    state.findByPermissionCalls.push(args)
    const permissionId = String(args[1] ?? '')
    const throwMessage = state.throwMap.get(`findByPermission:${permissionId}`)
    if (throwMessage) {
      throw new Error(throwMessage)
    }
    return state.findByPermissionResult
  }

  async requiresApproval(...args: unknown[]) {
    state.requiresApprovalCalls.push(args)
    const throwMessage = state.throwMap.get('requiresApproval')
    if (throwMessage) throw new Error(throwMessage)
    return state.requiresApprovalResult
  }

  async findRequiringApproval(...args: unknown[]) {
    state.findRequiringApprovalCalls.push(args)
    const throwMessage = state.throwMap.get('findRequiringApproval')
    if (throwMessage) throw new Error(throwMessage)
    return state.findRequiringApprovalResult
  }

  async upsert(...args: unknown[]) {
    state.upsertCalls.push(args)
    const throwMessage = state.throwMap.get('upsert')
    if (throwMessage) throw new Error(throwMessage)
    return state.upsertResult ?? {
      id: 'policy-1',
      tenantId: String(args[0]),
      permissionId: String(args[1]),
      requiresApproval: true,
      minHierarchyLevel: 2,
      requiredApprovers: 1,
      description: null,
    }
  }

  async getMinHierarchyLevel(...args: unknown[]) {
    state.getMinHierarchyLevelCalls.push(args)
    const throwMessage = state.throwMap.get('getMinHierarchyLevel')
    if (throwMessage) throw new Error(throwMessage)
    return state.getMinHierarchyLevelResult
  }

  async softDelete(...args: unknown[]) {
    state.softDeleteCalls.push(args)
    const throwMessage = state.throwMap.get('softDelete')
    if (throwMessage) throw new Error(throwMessage)
    return undefined
  }
}

mock.module('../db/repositories/permission-approval-policy.repository', () => ({
  PermissionApprovalPolicyRepository: PermissionApprovalPolicyRepositoryMock,
}))
mock.module('@/db/repositories/permission-approval-policy.repository', () => ({
  PermissionApprovalPolicyRepository: PermissionApprovalPolicyRepositoryMock,
}))

const mod = await import('@/services/permission-approval.service')
const { PermissionApprovalService } = mod

describe('permission-approval.service', () => {
  beforeEach(() => {
    state.ctorCalls = []
    state.findByPermissionCalls = []
    state.requiresApprovalCalls = []
    state.findRequiringApprovalCalls = []
    state.upsertCalls = []
    state.getMinHierarchyLevelCalls = []
    state.softDeleteCalls = []
    state.findByPermissionResult = null
    state.requiresApprovalResult = false
    state.findRequiringApprovalResult = []
    state.upsertResult = null
    state.getMinHierarchyLevelResult = null
    state.throwMap = new Map<string, string>()
  })

  test('getApprovalRequirement returns defaults when no policy exists', async () => {
    const service = new PermissionApprovalService({} as any)
    const result = await Effect.runPromise(service.getApprovalRequirement('tenant-1', 'perm-1'))

    expect(result).toEqual({
      requiresApproval: false,
      minHierarchyLevel: null,
      requiredApprovers: 1,
      description: undefined,
    })
    expect(state.findByPermissionCalls[0]).toEqual(['tenant-1', 'perm-1'])
  })

  test('getApprovalRequirement returns mapped values when policy exists', async () => {
    state.findByPermissionResult = {
      requiresApproval: true,
      minHierarchyLevel: 3,
      requiredApprovers: 2,
      description: 'Need checker+approver',
    }

    const service = new PermissionApprovalService({} as any)
    const result = await Effect.runPromise(service.getApprovalRequirement('tenant-1', 'perm-2'))

    expect(result).toEqual({
      requiresApproval: true,
      minHierarchyLevel: 3,
      requiredApprovers: 2,
      description: 'Need checker+approver',
    })
  })

  test('requiresApproval/getPermissionsRequiringApproval/upsert/getEligibleApproverLevel delegate correctly', async () => {
    state.requiresApprovalResult = true
    state.findRequiringApprovalResult = [{ id: 'p1' }]
    state.upsertResult = { id: 'policy-2', requiresApproval: true } as any
    state.getMinHierarchyLevelResult = 4

    const service = new PermissionApprovalService({} as any)

    expect(await Effect.runPromise(service.requiresApproval('tenant-1', 'perm-1'))).toBe(true)
    expect(await Effect.runPromise(service.getPermissionsRequiringApproval('tenant-1'))).toMatchObject([{ id: 'p1' }])
    expect(
      await Effect.runPromise(
        service.upsertPolicy('tenant-1', 'perm-1', {
          requiresApproval: true,
          minHierarchyLevel: 2,
          requiredApprovers: 2,
        })
      )
    ).toMatchObject({ id: 'policy-2', requiresApproval: true })
    expect(await Effect.runPromise(service.getEligibleApproverLevel('tenant-1', 'perm-1'))).toBe(4)
  })

  test('canUserApprove enforces min hierarchy threshold', () => {
    const service = new PermissionApprovalService({} as any)
    expect(service.canUserApprove(1, null)).toBe(true)
    expect(service.canUserApprove(2, 2)).toBe(true)
    expect(service.canUserApprove(1, 2)).toBe(false)
  })

  test('validateApprovalRequest returns needsApproval=false when policy is not required', async () => {
    state.findByPermissionResult = { requiresApproval: false }
    const service = new PermissionApprovalService({} as any)
    const result = await Effect.runPromise(service.validateApprovalRequest('tenant-1', 'perm-1'))

    expect(result).toEqual({
      needsApproval: false,
      requirement: null,
    })
  })

  test('validateApprovalRequest returns requirement when policy requires approval', async () => {
    state.findByPermissionResult = {
      requiresApproval: true,
      minHierarchyLevel: 2,
      requiredApprovers: 2,
      description: 'critical',
    }

    const service = new PermissionApprovalService({} as any)
    const result = await Effect.runPromise(service.validateApprovalRequest('tenant-1', 'perm-2'))

    expect(result).toEqual({
      needsApproval: true,
      requirement: {
        requiresApproval: true,
        minHierarchyLevel: 2,
        requiredApprovers: 2,
        description: 'critical',
      },
    })
  })

  test('getBulkApprovalRequirements returns empty map for empty inputs', async () => {
    const service = new PermissionApprovalService({} as any)
    const result = await Effect.runPromise(service.getBulkApprovalRequirements('tenant-1', []))
    expect(result.size).toBe(0)
    expect(state.findByPermissionCalls.length).toBe(0)
  })

  test('getBulkApprovalRequirements maps policies and falls back per-permission on repository error', async () => {
    state.throwMap.set(
      'findByPermission:perm-missing-table',
      'relation permission_approval_policies does not exist'
    )
    state.throwMap.set('findByPermission:perm-generic-error', 'db timeout')

    const prevWarn = console.warn
    const warnCalls: unknown[][] = []
    console.warn = (...args: unknown[]) => {
      warnCalls.push(args)
    }

    try {
      const service = new PermissionApprovalService({} as any)
      const result = await Effect.runPromise(
        service.getBulkApprovalRequirements('tenant-1', [
          'perm-ok',
          'perm-missing-table',
          'perm-generic-error',
        ])
      )

      const ok = result.get('perm-ok')
      const missingTable = result.get('perm-missing-table')
      const genericError = result.get('perm-generic-error')

      expect(ok).toEqual({
        requiresApproval: false,
        minHierarchyLevel: null,
        requiredApprovers: 1,
        description: undefined,
      })
      expect(missingTable).toEqual({
        requiresApproval: false,
        minHierarchyLevel: null,
        requiredApprovers: 1,
        description: undefined,
      })
      expect(genericError).toEqual({
        requiresApproval: false,
        minHierarchyLevel: null,
        requiredApprovers: 1,
        description: undefined,
      })

      expect(warnCalls.length).toBe(1)
      expect(String(warnCalls[0][0])).toContain('fallback to no-approval policy')
    } finally {
      console.warn = prevWarn
    }
  })

  test('service methods map repository failures into DatabaseError', async () => {
    state.throwMap.set('requiresApproval', 'explode')
    const service = new PermissionApprovalService({} as any)
    const exit = await Effect.runPromiseExit(service.requiresApproval('tenant-1', 'perm-1'))
    expect(exit._tag).toBe('Failure')
    if (exit._tag === 'Failure') {
      expect(String(exit.cause)).toContain('DatabaseError')
    }
  })

  test('deletePolicy calls repository softDelete', async () => {
    const service = new PermissionApprovalService({} as any)
    await Effect.runPromise(service.deletePolicy('policy-9'))
    expect(state.softDeleteCalls).toEqual([['policy-9']])
  })
})
