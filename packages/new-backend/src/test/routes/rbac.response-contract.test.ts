import { beforeEach, describe, expect, mock, test } from 'bun:test'
import { OpenAPIHono } from '@hono/zod-openapi'
import { Effect } from 'effect'

const permissionCatalog = [
  {
    id: 'perm-users-view',
    code: 'admin.users.view',
    name: 'View Users',
    description: 'Allows viewing users',
    resource: 'users',
    action: 'view',
    module: 'admin',
    category: 'CORE',
  },
  {
    id: 'perm-users-manage',
    code: 'admin.users.manage',
    name: 'Manage Users',
    description: 'Allows managing users',
    resource: 'users',
    action: 'manage',
    module: 'admin',
    category: 'CORE',
  },
]

const roleRecord = {
  id: 'role-maker',
  roleName: 'ROLE_MAKER',
  roleCode: 'ROLE_MAKER',
  description: 'Maker role',
  hierarchyLevel: 3,
  isSystemRole: false,
  isActive: true,
  tenantId: 'tenant-rbac-1',
  complianceLevel: null,
  permissions: {
    users: ['view'],
  },
  rolePermissions: [
    {
      permission: {
        id: 'perm-users-view',
        code: 'admin.users.view',
        name: 'View Users',
        description: 'Allows viewing users',
        resource: 'users',
        action: 'view',
        module: 'admin',
        category: 'CORE',
      },
    },
  ],
}

const roleUsers = [
  {
    id: 'assignment-1',
    userId: 'user-1',
    roleId: 'role-maker',
    isActive: true,
    assignedAt: new Date('2026-02-24T00:00:00.000Z'),
    validFrom: null,
    validUntil: null,
    isTemporary: false,
    user: {
      id: 'user-1',
      username: 'maker_1',
      fullName: 'Maker One',
      email: 'maker.one@ifrspro.id',
    },
  },
]

const userRoles = [
  {
    id: 'assignment-user-role-1',
    roleId: 'role-maker',
    assignedAt: new Date('2026-02-24T00:00:00.000Z'),
    validFrom: null,
    validUntil: null,
    isTemporary: false,
    role: roleRecord,
  },
]

const state = {
  approvalCounter: 1,
}

const getRolesMock = mock(() =>
  Effect.succeed({
    data: [roleRecord],
    total: 1,
  })
)
const getRoleByIdMock = mock(() => Effect.succeed(roleRecord))
const getAvailablePermissionsMock = mock(() => Effect.succeed(permissionCatalog))
const getRoleUsersMock = mock(() => Effect.succeed(roleUsers as any[]))
const getUserRolesMock = mock(() => Effect.succeed(userRoles as any[]))
const hasPermissionMock = mock(() => Effect.succeed(true))

const createApprovalRequestMock = mock((input: any) =>
  Effect.succeed({
    id: `approval-${state.approvalCounter++}`,
    status: 'pending',
    title: input?.title ?? 'Approval Request',
  })
)

const logApprovalRequestedMock = mock(async () => undefined)
const buildDefaultFourEyesRoutingMock = mock(() => [{ level: 1, name: 'Checker', requiredCount: 1 }])

const authMiddleware = async (c: any, next: any) => {
  c.set('tenantId', 'tenant-rbac-1')
  c.set('userId', 'user-admin-1')
  c.set('userPermissions', ['admin.roles.manage', 'admin.super_admin'])
  c.set('isSystemUser', false)
  await next()
}

mock.module('@/services/rbac.service', () => ({
  getRoles: getRolesMock,
  getRoleById: getRoleByIdMock,
  getAvailablePermissions: getAvailablePermissionsMock,
  getRoleUsers: getRoleUsersMock,
  getUserRoles: getUserRolesMock,
  hasPermission: hasPermissionMock,
}))

mock.module('../../services/rbac.service', () => ({
  getRoles: getRolesMock,
  getRoleById: getRoleByIdMock,
  getAvailablePermissions: getAvailablePermissionsMock,
  getRoleUsers: getRoleUsersMock,
  getUserRoles: getUserRolesMock,
  hasPermission: hasPermissionMock,
}))

mock.module('@/services/approval.service', () => ({
  createApprovalRequest: createApprovalRequestMock,
}))

mock.module('../../services/approval.service', () => ({
  createApprovalRequest: createApprovalRequestMock,
}))

mock.module('@/services/audit.service', () => ({
  logApproval: {
    requested: logApprovalRequestedMock,
  },
}))

mock.module('../../services/audit.service', () => ({
  logApproval: {
    requested: logApprovalRequestedMock,
  },
}))

mock.module('@/lib/approval-helpers', () => ({
  buildDefaultFourEyesRouting: buildDefaultFourEyesRoutingMock,
}))

mock.module('../../lib/approval-helpers', () => ({
  buildDefaultFourEyesRouting: buildDefaultFourEyesRoutingMock,
}))

mock.module('@/middleware', () => ({
  authMiddleware,
  tenantMiddleware: authMiddleware,
  requirePermission: () => authMiddleware,
  errorHandler: async (c: any) => c,
  auditMiddleware: authMiddleware,
}))

mock.module('../../middleware', () => ({
  authMiddleware,
  tenantMiddleware: authMiddleware,
  requirePermission: () => authMiddleware,
  errorHandler: async (c: any) => c,
  auditMiddleware: authMiddleware,
}))

const { rbacRoutes } = await import('@/routes/rbac.routes')

describe('rbac routes response contracts', () => {
  beforeEach(() => {
    state.approvalCounter = 1
    getRolesMock.mockClear()
    getRoleByIdMock.mockClear()
    getAvailablePermissionsMock.mockClear()
    getRoleUsersMock.mockClear()
    getUserRolesMock.mockClear()
    hasPermissionMock.mockClear()
    createApprovalRequestMock.mockClear()
    logApprovalRequestedMock.mockClear()
    buildDefaultFourEyesRoutingMock.mockClear()
  })

  test('GET /api/v1/roles returns list envelope', async () => {
    const app = new OpenAPIHono()
    app.route('/api/v1/roles', rbacRoutes)

    const response = await app.request('/api/v1/roles?page=1&limit=25&search=maker')
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(Array.isArray(body.data?.data)).toBe(true)
    expect(body.data?.data?.[0]?.id).toBe('role-maker')
    expect(getRolesMock).toHaveBeenCalledTimes(1)
  })

  test('GET /api/v1/roles/permissions returns normalized permission list', async () => {
    const app = new OpenAPIHono()
    app.route('/api/v1/roles', rbacRoutes)

    const response = await app.request('/api/v1/roles/permissions')
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data).toHaveLength(2)
    expect(getAvailablePermissionsMock).toHaveBeenCalledWith('tenant-rbac-1')
  })

  test('GET /api/v1/roles/{id} returns role detail envelope', async () => {
    const app = new OpenAPIHono()
    app.route('/api/v1/roles', rbacRoutes)

    const response = await app.request('/api/v1/roles/role-maker')
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data.id).toBe('role-maker')
    expect(getRoleByIdMock).toHaveBeenCalledWith('role-maker', 'tenant-rbac-1')
  })

  test('GET /api/v1/roles/{id}/permissions resolves role in tenant scope', async () => {
    const app = new OpenAPIHono()
    app.route('/api/v1/roles', rbacRoutes)

    const response = await app.request('/api/v1/roles/role-maker/permissions')
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data.roleId).toBe('role-maker')
    expect(getRoleByIdMock).toHaveBeenCalledWith('role-maker', 'tenant-rbac-1')
  })

  test('POST /api/v1/roles creates approval request and returns 202', async () => {
    const app = new OpenAPIHono()
    app.route('/api/v1/roles', rbacRoutes)

    const response = await app.request('/api/v1/roles', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        name: 'Role Analyst',
        description: 'Analyst role',
      }),
    })
    const body = await response.json()

    expect(response.status).toBe(202)
    expect(body.success).toBe(true)
    expect(body.approvalRequired).toBe(true)
    expect(createApprovalRequestMock).toHaveBeenCalledTimes(1)
    expect(logApprovalRequestedMock).toHaveBeenCalledTimes(1)
  })

  test('POST /api/v1/roles returns 200 with auto-approved metadata when request is immediately approved', async () => {
    createApprovalRequestMock.mockImplementationOnce((input: any) =>
      Effect.succeed({
        id: `approval-${state.approvalCounter++}`,
        status: 'approved',
        title: input?.title ?? 'Approval Request',
      })
    )

    const app = new OpenAPIHono()
    app.route('/api/v1/roles', rbacRoutes)

    const response = await app.request('/api/v1/roles', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        name: 'Role Auto Approved',
        description: 'Auto approved role',
      }),
    })
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.approvalRequired).toBe(false)
    expect(body.autoApproved).toBe(true)
    expect(body.requestId).toBe('approval-1')
  })

  test('PUT /api/v1/roles/{id} submits role update for approval', async () => {
    const app = new OpenAPIHono()
    app.route('/api/v1/roles', rbacRoutes)

    const response = await app.request('/api/v1/roles/role-maker', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        description: 'Updated description',
      }),
    })
    const body = await response.json()

    expect(response.status).toBe(202)
    expect(body.success).toBe(true)
    expect(body.approvalRequired).toBe(true)
    expect(getRoleByIdMock).toHaveBeenCalledWith('role-maker', 'tenant-rbac-1')
  })

  test('DELETE /api/v1/roles/{id} submits role delete for approval', async () => {
    const app = new OpenAPIHono()
    app.route('/api/v1/roles', rbacRoutes)

    const response = await app.request('/api/v1/roles/role-maker', {
      method: 'DELETE',
    })
    const body = await response.json()

    expect(response.status).toBe(202)
    expect(body.success).toBe(true)
    expect(body.approvalRequired).toBe(true)
  })

  test('POST /api/v1/roles/{id}/toggle submits status change for approval', async () => {
    const app = new OpenAPIHono()
    app.route('/api/v1/roles', rbacRoutes)

    const response = await app.request('/api/v1/roles/role-maker/toggle', {
      method: 'POST',
    })
    const body = await response.json()

    expect(response.status).toBe(202)
    expect(body.success).toBe(true)
    expect(body.approvalRequired).toBe(true)
  })

  test('GET /api/v1/roles/{id}/users returns assigned user list', async () => {
    const app = new OpenAPIHono()
    app.route('/api/v1/roles', rbacRoutes)

    const response = await app.request('/api/v1/roles/role-maker/users')
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data.roleId).toBe('role-maker')
    expect(body.data.users[0].userId).toBe('user-1')
    expect(getRoleUsersMock).toHaveBeenCalledWith('role-maker', 'tenant-rbac-1')
  })

  test('PUT /api/v1/roles/{id}/permissions returns 400 for unknown permission ids', async () => {
    const app = new OpenAPIHono()
    app.route('/api/v1/roles', rbacRoutes)

    const response = await app.request('/api/v1/roles/role-maker/permissions', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        permissions: ['unknown.permission.code'],
      }),
    })
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.success).toBe(false)
    expect(body.code).toBe('INVALID_PERMISSION')
  })

  test('PUT /api/v1/roles/{id}/permissions submits approval request when permissions are valid', async () => {
    const app = new OpenAPIHono()
    app.route('/api/v1/roles', rbacRoutes)

    const response = await app.request('/api/v1/roles/role-maker/permissions', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        permissions: ['perm-users-view', 'admin.users.manage'],
        approvalReason: 'Need broader support access',
      }),
    })
    const body = await response.json()

    expect(response.status).toBe(202)
    expect(body.success).toBe(true)
    expect(body.approvalRequired).toBe(true)
    expect(body.diff).toBeDefined()
    expect(createApprovalRequestMock).toHaveBeenCalledTimes(1)
  })

  test('GET /api/v1/roles/users/{userId}/roles returns user role assignments', async () => {
    const app = new OpenAPIHono()
    app.route('/api/v1/roles', rbacRoutes)

    const response = await app.request('/api/v1/roles/users/user-1/roles')
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data.userId).toBe('user-1')
    expect(Array.isArray(body.data.roles)).toBe(true)
    expect(getUserRolesMock).toHaveBeenCalledWith('user-1', 'tenant-rbac-1')
  })

  test('POST and DELETE /api/v1/roles/users/{userId}/roles/{roleId} submit approval requests', async () => {
    const app = new OpenAPIHono()
    app.route('/api/v1/roles', rbacRoutes)

    const assignResponse = await app.request('/api/v1/roles/users/user-1/roles/role-maker', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({}),
    })
    const removeResponse = await app.request('/api/v1/roles/users/user-1/roles/role-maker', {
      method: 'DELETE',
    })

    const assignBody = await assignResponse.json()
    const removeBody = await removeResponse.json()

    expect(assignResponse.status).toBe(202)
    expect(removeResponse.status).toBe(202)
    expect(assignBody.success).toBe(true)
    expect(removeBody.success).toBe(true)
    expect(assignBody.approvalRequired).toBe(true)
    expect(removeBody.approvalRequired).toBe(true)
  })

  test('POST /api/v1/roles/users/{userId}/permissions/check returns permission decision', async () => {
    const app = new OpenAPIHono()
    app.route('/api/v1/roles', rbacRoutes)

    const response = await app.request('/api/v1/roles/users/user-1/permissions/check', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ resource: 'users', action: 'view' }),
    })
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data.hasPermission).toBe(true)
    expect(hasPermissionMock).toHaveBeenCalledWith('user-1', 'tenant-rbac-1', 'users', 'view')
  })
})
