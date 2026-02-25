import { beforeEach, describe, expect, mock, test } from 'bun:test'
import { Effect } from 'effect'

const state = {
  dbCalls: [] as Array<string | undefined>,
  throwOn: null as string | null,

  findByTenantCalls: [] as unknown[][],
  findByIdCalls: [] as unknown[][],
  findByNameCalls: [] as unknown[][],
  createCalls: [] as unknown[][],
  updateCalls: [] as unknown[][],
  deleteCalls: [] as unknown[][],

  findByUserCalls: [] as unknown[][],
  assignCalls: [] as unknown[][],
  removeCalls: [] as unknown[][],

  permissionsFindAllCalls: [] as unknown[][],
  rolePermissionsSetCalls: [] as unknown[][],

  approvalCtorCalls: [] as unknown[],
  approvalBulkCalls: [] as unknown[][],

  findByTenantResult: [] as any[],
  findByIdResult: null as any,
  findByNameResult: null as any,
  createResult: null as any,
  updateResult: null as any,
  deleteResult: null as any,

  findByUserResult: [] as any[],
  assignResult: null as any,
  removeResult: true as any,

  permissionsFindAllResult: [] as any[],
  rolePermissionsSetResult: true as any,
  approvalMap: new Map<string, any>(),
}

const createRole = (overrides: Record<string, unknown> = {}) => ({
  id: 'role-1',
  roleName: 'Maker',
  tenantId: 'tenant-1',
  isSystemRole: false,
  isActive: true,
  ...overrides,
})

const createUserRole = (overrides: Record<string, unknown> = {}) => ({
  roleId: 'role-1',
  isActive: true,
  validFrom: null,
  validUntil: null,
  role: {
    rolePermissions: [],
  },
  ...overrides,
})

mock.module('@/config/database', () => ({
  getDatabase: (tenantId?: string) => {
    if (state.throwOn === 'getDatabase') {
      throw new Error('getDatabase failed')
    }
    state.dbCalls.push(tenantId)
    return { tenantId: tenantId ?? null }
  },
}))

mock.module('@/repositories/rbac.repository', () => ({
  rolesRepository: {
    findByTenant: (...args: unknown[]) => {
      state.findByTenantCalls.push(args)
      if (state.throwOn === 'findByTenant') return Effect.fail(new Error('findByTenant failed'))
      return Effect.succeed(state.findByTenantResult)
    },
    findById: (...args: unknown[]) => {
      state.findByIdCalls.push(args)
      if (state.throwOn === 'findById') return Effect.fail(new Error('findById failed'))
      return Effect.succeed(state.findByIdResult)
    },
    findByName: (...args: unknown[]) => {
      state.findByNameCalls.push(args)
      if (state.throwOn === 'findByName') return Effect.fail(new Error('findByName failed'))
      return Effect.succeed(state.findByNameResult)
    },
    create: (...args: unknown[]) => {
      state.createCalls.push(args)
      if (state.throwOn === 'create') return Effect.fail(new Error('create failed'))
      return Effect.succeed(state.createResult ?? createRole({ id: 'role-created' }))
    },
    update: (...args: unknown[]) => {
      state.updateCalls.push(args)
      if (state.throwOn === 'update') return Effect.fail(new Error('update failed'))
      return Effect.succeed(state.updateResult ?? createRole({ id: String(args[1] || 'role-1') }))
    },
    delete: (...args: unknown[]) => {
      state.deleteCalls.push(args)
      if (state.throwOn === 'delete') return Effect.fail(new Error('delete failed'))
      return Effect.succeed(state.deleteResult ?? createRole({ id: String(args[1] || 'role-1'), isActive: false }))
    },
  },
  userRolesRepository: {
    findByUser: (...args: unknown[]) => {
      state.findByUserCalls.push(args)
      if (state.throwOn === 'findByUser') return Effect.fail(new Error('findByUser failed'))
      return Effect.succeed(state.findByUserResult)
    },
    assign: (...args: unknown[]) => {
      state.assignCalls.push(args)
      if (state.throwOn === 'assign') return Effect.fail(new Error('assign failed'))
      return Effect.succeed(state.assignResult ?? createUserRole())
    },
    remove: (...args: unknown[]) => {
      state.removeCalls.push(args)
      if (state.throwOn === 'remove') return Effect.fail(new Error('remove failed'))
      return Effect.succeed(state.removeResult)
    },
  },
  permissionsRepository: {
    findAll: (...args: unknown[]) => {
      state.permissionsFindAllCalls.push(args)
      if (state.throwOn === 'permissionsFindAll') return Effect.fail(new Error('permissionsFindAll failed'))
      return Effect.succeed(state.permissionsFindAllResult)
    },
  },
  rolePermissionsRepository: {
    set: (...args: unknown[]) => {
      state.rolePermissionsSetCalls.push(args)
      if (state.throwOn === 'rolePermissionsSet') return Effect.fail(new Error('rolePermissionsSet failed'))
      return Effect.succeed(state.rolePermissionsSetResult)
    },
  },
}))

class PermissionApprovalServiceMock {
  constructor(db: unknown) {
    state.approvalCtorCalls.push(db)
  }

  getBulkApprovalRequirements(...args: unknown[]) {
    state.approvalBulkCalls.push(args)
    if (state.throwOn === 'approvalBulk') return Effect.fail(new Error('approvalBulk failed'))
    return Effect.succeed(state.approvalMap)
  }
}

mock.module('./permission-approval.service', () => ({
  PermissionApprovalService: PermissionApprovalServiceMock,
}))
mock.module('@/services/permission-approval.service', () => ({
  PermissionApprovalService: PermissionApprovalServiceMock,
}))

const rbacService = await import('@/services/rbac.service')

describe('rbac.service', () => {
  beforeEach(() => {
    state.dbCalls = []
    state.throwOn = null

    state.findByTenantCalls = []
    state.findByIdCalls = []
    state.findByNameCalls = []
    state.createCalls = []
    state.updateCalls = []
    state.deleteCalls = []
    state.findByUserCalls = []
    state.assignCalls = []
    state.removeCalls = []
    state.permissionsFindAllCalls = []
    state.rolePermissionsSetCalls = []
    state.approvalCtorCalls = []
    state.approvalBulkCalls = []

    state.findByTenantResult = []
    state.findByIdResult = createRole()
    state.findByNameResult = null
    state.createResult = null
    state.updateResult = null
    state.deleteResult = null
    state.findByUserResult = []
    state.assignResult = null
    state.removeResult = true
    state.permissionsFindAllResult = []
    state.rolePermissionsSetResult = true
    state.approvalMap = new Map<string, any>()
  })

  test('getRoles maps options and delegates to rolesRepository.findByTenant', async () => {
    state.findByTenantResult = [createRole({ id: 'role-a' })]

    const result = await Effect.runPromise(
      rbacService.getRoles('tenant-1', {
        includeInactive: true,
        bankingType: 'conventional',
        search: 'maker',
        type: 'SYSTEM',
      })
    )

    expect(result.length).toBe(1)
    expect(state.findByTenantCalls.length).toBe(1)
    expect(state.findByTenantCalls[0][1]).toBe('tenant-1')
    expect(state.findByTenantCalls[0][2]).toEqual({
      includeInactive: true,
      bankingType: 'conventional',
      search: 'maker',
      systemRolesOnly: true,
    })
  })

  test('getRoles maps getDatabase failures to DatabaseError', async () => {
    state.throwOn = 'getDatabase'
    const exit = await Effect.runPromiseExit(rbacService.getRoles('tenant-1'))
    expect(exit._tag).toBe('Failure')
    expect(String(exit.cause)).toContain('DatabaseError')
  })

  test('getRoleById returns role from repository', async () => {
    state.findByIdResult = createRole({ id: 'role-99' })
    const result = await Effect.runPromise(rbacService.getRoleById('role-99', 'tenant-1'))

    expect(result.id).toBe('role-99')
    expect(state.findByIdCalls.length).toBe(1)
    expect(state.findByIdCalls[0][1]).toBe('role-99')
  })

  test('createRole fails with ValidationError when role name exists', async () => {
    state.findByNameResult = createRole({ id: 'role-existing', roleName: 'Maker' })
    const exit = await Effect.runPromiseExit(
      rbacService.createRole({
        roleName: 'Maker',
        tenantId: 'tenant-1',
      } as any)
    )

    expect(exit._tag).toBe('Failure')
    expect(String(exit.cause)).toContain('ValidationError')
  })

  test('createRole creates role when no duplicate exists', async () => {
    state.findByNameResult = null
    state.createResult = createRole({ id: 'role-created', roleName: 'Checker' })

    const result = await Effect.runPromise(
      rbacService.createRole({
        roleName: 'Checker',
        tenantId: 'tenant-1',
      } as any)
    )

    expect(result.id).toBe('role-created')
    expect(state.createCalls.length).toBe(1)
    expect((state.createCalls[0][1] as any).roleName).toBe('Checker')
  })

  test('updateRole blocks renaming system roles', async () => {
    state.findByIdResult = createRole({
      id: 'system-role',
      roleName: 'System Admin',
      isSystemRole: true,
    })

    const exit = await Effect.runPromiseExit(
      rbacService.updateRole('system-role', {
        tenantId: 'tenant-1',
        roleName: 'Renamed Admin',
      } as any)
    )

    expect(exit._tag).toBe('Failure')
    expect(String(exit.cause)).toContain('BusinessError')
  })

  test('updateRole updates when role is mutable', async () => {
    state.findByIdResult = createRole({ id: 'role-2', roleName: 'Approver', isSystemRole: false })
    state.updateResult = createRole({ id: 'role-2', roleName: 'Approver', isActive: false })

    const result = await Effect.runPromise(
      rbacService.updateRole('role-2', {
        tenantId: 'tenant-1',
        isActive: false,
      } as any)
    )

    expect(result.id).toBe('role-2')
    expect(state.updateCalls.length).toBe(1)
    expect(state.updateCalls[0][1]).toBe('role-2')
  })

  test('deleteRole blocks system roles and soft-deletes mutable roles', async () => {
    state.findByIdResult = createRole({ id: 'sys-1', isSystemRole: true })
    const blocked = await Effect.runPromiseExit(rbacService.deleteRole('sys-1', 'tenant-1'))
    expect(blocked._tag).toBe('Failure')
    expect(String(blocked.cause)).toContain('BusinessError')

    state.findByIdResult = createRole({ id: 'role-3', isSystemRole: false })
    const deleted = await Effect.runPromise(rbacService.deleteRole('role-3', 'tenant-1'))
    expect(deleted.id).toBe('role-3')
    expect(state.deleteCalls.length).toBe(1)
    expect(state.deleteCalls[0][1]).toBe('role-3')
  })

  test('getUserRoles filters out inactive, future, and expired assignments', async () => {
    const now = new Date()
    state.findByUserResult = [
      createUserRole({ roleId: 'active-ok', isActive: true, validFrom: null, validUntil: null }),
      createUserRole({ roleId: 'inactive', isActive: false }),
      createUserRole({ roleId: 'future', validFrom: new Date(now.getTime() + 60_000) }),
      createUserRole({ roleId: 'expired', validUntil: new Date(now.getTime() - 60_000) }),
    ]

    const result = await Effect.runPromise(rbacService.getUserRoles('user-1', 'tenant-1'))

    expect(result).toHaveLength(1)
    expect(result[0].roleId).toBe('active-ok')
  })

  test('assignRole fails on duplicate assignment and succeeds otherwise', async () => {
    state.findByIdResult = createRole({ id: 'role-4' })
    state.findByUserResult = [createUserRole({ roleId: 'role-4' })]

    const duplicate = await Effect.runPromiseExit(
      rbacService.assignRole({
        userId: 'user-1',
        roleId: 'role-4',
        tenantId: 'tenant-1',
      })
    )
    expect(duplicate._tag).toBe('Failure')
    expect(String(duplicate.cause)).toContain('ValidationError')

    state.findByUserResult = []
    const assigned = await Effect.runPromise(
      rbacService.assignRole({
        userId: 'user-1',
        roleId: 'role-4',
        tenantId: 'tenant-1',
        assignedBy: 'admin-1',
        isTemporary: true,
        temporaryReason: 'Temporary elevation',
      })
    )

    expect(assigned.roleId).toBe('role-1')
    expect(state.assignCalls.length).toBe(1)
    expect((state.assignCalls[0][1] as any).userId).toBe('user-1')
    expect((state.assignCalls[0][1] as any).assignedBy).toBe('admin-1')
  })

  test('removeRole delegates to repository remove', async () => {
    const result = await Effect.runPromise(rbacService.removeRole('user-9', 'role-9', 'tenant-1'))
    expect(result).toBe(true)
    expect(state.removeCalls.length).toBe(1)
    expect(state.removeCalls[0].slice(1)).toEqual(['user-9', 'role-9'])
  })

  test('getUserPermissions and hasPermission resolve direct and wildcard grants', async () => {
    state.findByUserResult = [
      createUserRole({
        role: {
          rolePermissions: [
            { permission: { resource: 'users', action: 'read', code: 'users.read' } },
            { permission: { resource: 'users', action: 'write', code: 'users.write' } },
            { permission: { resource: '*', action: 'read', code: '*.read' } },
            { permission: { resource: '*', action: '*', code: '*.*' } },
          ],
        },
      }),
    ]

    const permissions = await Effect.runPromise(rbacService.getUserPermissions('user-1', 'tenant-1'))
    expect(permissions.users).toEqual(['read', 'write'])
    expect(permissions['*']).toEqual(['read', '*'])

    const canWriteUsers = await Effect.runPromise(
      rbacService.hasPermission('user-1', 'tenant-1', 'users', 'write')
    )
    const canDeleteReports = await Effect.runPromise(
      rbacService.hasPermission('user-1', 'tenant-1', 'reports', 'delete')
    )

    expect(canWriteUsers).toBe(true)
    expect(canDeleteReports).toBe(true)
  })

  test('getUserPermissionCodes returns unique normalized codes', async () => {
    state.findByUserResult = [
      createUserRole({
        role: {
          rolePermissions: [
            { permission: { code: ' users.read ' } },
            { permission: { code: 'users.read' } },
            { permission: { code: 'users.write' } },
            { permission: { code: '' } },
            { permission: { code: null } },
          ],
        },
      }),
    ]

    const result = await Effect.runPromise(rbacService.getUserPermissionCodes('user-2', 'tenant-1'))
    expect(result.sort()).toEqual(['users.read', 'users.write'])
  })

  test('updateRolePermissions persists set and returns refreshed role', async () => {
    state.findByIdResult = createRole({ id: 'role-5', roleName: 'Reviewer' })

    const result = await Effect.runPromise(
      rbacService.updateRolePermissions('role-5', ['perm-1', 'perm-2'], 'tenant-1')
    )

    expect(state.rolePermissionsSetCalls.length).toBe(1)
    expect(state.rolePermissionsSetCalls[0][1]).toBe('role-5')
    expect(state.rolePermissionsSetCalls[0][2]).toEqual(['perm-1', 'perm-2'])
    expect(result.id).toBe('role-5')
  })

  test('getAvailablePermissions enriches permissions with approval metadata', async () => {
    state.permissionsFindAllResult = [
      { id: 'perm-1', code: 'users.create' },
      { id: 'perm-2', code: 'users.view' },
    ]
    state.approvalMap = new Map<string, any>([
      ['perm-1', { requiresApproval: true, minHierarchyLevel: 2, requiredApprovers: 2 }],
    ])

    const result = await Effect.runPromise(rbacService.getAvailablePermissions('tenant-1'))

    expect(state.permissionsFindAllCalls.length).toBe(1)
    expect(state.approvalCtorCalls.length).toBe(1)
    expect(state.approvalBulkCalls[0]).toEqual(['tenant-1', ['perm-1', 'perm-2']])
    expect(result).toEqual([
      {
        id: 'perm-1',
        code: 'users.create',
        requiresApproval: true,
        requiredApprovalLevel: 2,
        requiredApprovers: 2,
      },
      {
        id: 'perm-2',
        code: 'users.view',
        requiresApproval: false,
        requiredApprovalLevel: null,
        requiredApprovers: 1,
      },
    ])
  })
})
