import { beforeEach, describe, expect, mock, test } from 'bun:test'
import { Effect } from 'effect'

const state = {
  dbCalls: [] as unknown[],
  findUsersByTenantCalls: [] as unknown[][],
  findUserByIdCalls: [] as unknown[][],
  findUserByEmailCalls: [] as unknown[][],
  getUserStatsCalls: [] as unknown[][],
  createUserCalls: [] as unknown[][],
  updateUserCalls: [] as unknown[][],
  updatePasswordCalls: [] as unknown[][],
  verifyEmailCalls: [] as unknown[][],
  findUsersByTenantResult: { data: [], total: 0 } as any,
  findUserByIdResult: null as any,
  findUserByEmailResult: null as any,
  getUserStatsResult: { totalUsers: 0, activeUsers: 0, inactiveUsers: 0 } as any,
  createUserResult: null as any,
  updateUserResult: null as any,
  updatePasswordResult: null as any,
  verifyEmailResult: true as any,
  throwOn: null as string | null,
}

const createBaseUser = (overrides: Record<string, unknown> = {}) => ({
  id: 'user-1',
  email: 'maker@iaf.co.id',
  username: 'maker',
  fullName: 'Maker User',
  passwordHash: '$2b$10$stub',
  tenantId: 'tenant-1',
  isActive: true,
  ...overrides,
})

mock.module('@/config/database', () => ({
  getDatabase: (tenantId?: string) => {
    state.dbCalls.push(tenantId)
    return { tenantId: tenantId || null }
  },
  db: { tenantId: null },
  platformDb: { tenantId: null },
  tenantDb: { tenantId: 'tenant' },
  legacyDb: { tenantId: 'legacy' },
  closeDatabase: async () => undefined,
  platformConnection: { end: async () => undefined },
  tenantConnection: { end: async () => undefined },
  legacyConnection: { end: async () => undefined },
}))

mock.module('@/repositories/auth.repository', () => ({
  AuthRepository: {
    findUsersByTenant: async (...args: unknown[]) => {
      state.findUsersByTenantCalls.push(args)
      if (state.throwOn === 'findUsersByTenant') throw new Error('findUsersByTenant failed')
      return state.findUsersByTenantResult
    },
    findUserById: async (...args: unknown[]) => {
      state.findUserByIdCalls.push(args)
      if (state.throwOn === 'findUserById') throw new Error('findUserById failed')
      return state.findUserByIdResult
    },
    findUserByEmail: async (...args: unknown[]) => {
      state.findUserByEmailCalls.push(args)
      if (state.throwOn === 'findUserByEmail') throw new Error('findUserByEmail failed')
      return state.findUserByEmailResult
    },
    getUserStats: async (...args: unknown[]) => {
      state.getUserStatsCalls.push(args)
      if (state.throwOn === 'getUserStats') throw new Error('getUserStats failed')
      return state.getUserStatsResult
    },
    createUser: async (...args: unknown[]) => {
      state.createUserCalls.push(args)
      if (state.throwOn === 'createUser') throw new Error('createUser failed')
      return state.createUserResult ?? createBaseUser()
    },
    updateUser: async (...args: unknown[]) => {
      state.updateUserCalls.push(args)
      if (state.throwOn === 'updateUser') throw new Error('updateUser failed')
      return state.updateUserResult ?? createBaseUser({ isActive: false })
    },
    updatePassword: async (...args: unknown[]) => {
      state.updatePasswordCalls.push(args)
      if (state.throwOn === 'updatePassword') throw new Error('updatePassword failed')
      return state.updatePasswordResult ?? createBaseUser()
    },
    verifyEmail: async (...args: unknown[]) => {
      state.verifyEmailCalls.push(args)
      if (state.throwOn === 'verifyEmail') throw new Error('verifyEmail failed')
      return state.verifyEmailResult
    },
  },
}))

const hashPasswordMock = async (password: string) => {
  if (typeof password !== 'string' || password.length === 0) {
    throw new Error('invalid password')
  }
  return `hashed:${password}`
}

mock.module('./auth.service', () => ({ hashPassword: hashPasswordMock }))
mock.module('@/services/auth.service', () => ({ hashPassword: hashPasswordMock }))

const usersService = await import('@/services/users.service')

describe('users.service', () => {
  beforeEach(() => {
    state.dbCalls = []
    state.findUsersByTenantCalls = []
    state.findUserByIdCalls = []
    state.findUserByEmailCalls = []
    state.getUserStatsCalls = []
    state.createUserCalls = []
    state.updateUserCalls = []
    state.updatePasswordCalls = []
    state.verifyEmailCalls = []
    state.findUsersByTenantResult = { data: [], total: 0 }
    state.findUserByIdResult = null
    state.findUserByEmailResult = null
    state.getUserStatsResult = { totalUsers: 0, activeUsers: 0, inactiveUsers: 0 }
    state.createUserResult = null
    state.updateUserResult = null
    state.updatePasswordResult = null
    state.verifyEmailResult = true
    state.throwOn = null
  })

  test('getUsers returns paginated users from repository', async () => {
    state.findUsersByTenantResult = {
      data: [createBaseUser()],
      total: 1,
    }
    const options = { search: 'maker', limit: 10, offset: 0, sort: 'createdAt', order: 'desc' as const }

    const result = await Effect.runPromise(usersService.getUsers('tenant-1', options))
    expect(result.total).toBe(1)
    expect(state.findUsersByTenantCalls[0][1]).toBe('tenant-1')
    expect(state.findUsersByTenantCalls[0][2]).toEqual(options)
  })

  test('getUsers maps repository errors to DatabaseError', async () => {
    state.throwOn = 'findUsersByTenant'
    const exit = await Effect.runPromiseExit(usersService.getUsers('tenant-1'))
    expect(exit._tag).toBe('Failure')
    expect(String(exit.cause)).toContain('DatabaseError')
  })

  test('getUserById returns user when found', async () => {
    state.findUserByIdResult = createBaseUser({ id: 'u-99' })
    const result = await Effect.runPromise(usersService.getUserById('u-99', 'tenant-1'))

    expect(result.id).toBe('u-99')
    expect(state.findUserByIdCalls[0][1]).toBe('u-99')
  })

  test('getUserById fails with NotFoundError when missing', async () => {
    state.findUserByIdResult = null
    const exit = await Effect.runPromiseExit(usersService.getUserById('missing-user', 'tenant-1'))

    expect(exit._tag).toBe('Failure')
    expect(String(exit.cause)).toContain('NotFoundError')
  })

  test('getUserByEmail and getUserStats delegate to repository', async () => {
    state.findUserByEmailResult = createBaseUser({ email: 'checker@iaf.co.id' })
    state.getUserStatsResult = { totalUsers: 4, activeUsers: 3, inactiveUsers: 1 }

    const byEmail = await Effect.runPromise(usersService.getUserByEmail('checker@iaf.co.id', 'tenant-1'))
    const stats = await Effect.runPromise(usersService.getUserStats('tenant-1'))

    expect(byEmail?.email).toBe('checker@iaf.co.id')
    expect(stats).toEqual({ totalUsers: 4, activeUsers: 3, inactiveUsers: 1 })
  })

  test('createUser creates new user with normalized username/fullName and hashed password', async () => {
    const result = await Effect.runPromise(
      usersService.createUser({
        email: 'new.user@iaf.co.id',
        password: 'SuperSecret123',
        phone: '0811',
        department: 'Risk',
        position: 'Maker',
        tenantId: 'tenant-1',
      })
    )

    expect(result.email).toBe('maker@iaf.co.id')
    expect(state.createUserCalls.length).toBe(1)
    const createPayload = state.createUserCalls[0][1] as any
    expect(createPayload.email).toBe('new.user@iaf.co.id')
    expect(createPayload.username).toBe('new.user')
    expect(createPayload.fullName).toBe('new.user')
    expect(typeof createPayload.passwordHash).toBe('string')
    expect(createPayload.passwordHash).not.toBe('SuperSecret123')
  })

  test('createUser fails with ValidationError when email already exists', async () => {
    state.findUserByEmailResult = createBaseUser({ email: 'existing@iaf.co.id' })
    const exit = await Effect.runPromiseExit(
      usersService.createUser({
        email: 'existing@iaf.co.id',
        password: 'Secret123',
        tenantId: 'tenant-1',
      } as any)
    )

    expect(exit._tag).toBe('Failure')
    expect(String(exit.cause)).toContain('ValidationError')
    expect(String(exit.cause)).toContain('email')
  })

  test('createUser maps hashing and insert failures to DatabaseError', async () => {
    const hashFail = await Effect.runPromiseExit(
      usersService.createUser({
        email: 'hash.fail@iaf.co.id',
        password: '',
        tenantId: 'tenant-1',
      } as any)
    )
    expect(hashFail._tag).toBe('Failure')
    expect(String(hashFail.cause)).toContain('DatabaseError')
    expect(String(hashFail.cause)).toContain('Failed to hash password')

    state.throwOn = 'createUser'
    const insertFail = await Effect.runPromiseExit(
      usersService.createUser({
        email: 'insert.fail@iaf.co.id',
        password: 'Secret123',
        tenantId: 'tenant-1',
      } as any)
    )
    expect(insertFail._tag).toBe('Failure')
    expect(String(insertFail.cause)).toContain('DatabaseError')
  })

  test('updateUser/deleteUser/enableUser/disableUser call repository with expected payload', async () => {
    await Effect.runPromise(usersService.updateUser('u-1', { department: 'Finance', tenantId: 'tenant-1' }))
    await Effect.runPromise(usersService.deleteUser('u-1', 'tenant-1'))
    await Effect.runPromise(usersService.enableUser('u-1', 'tenant-1'))
    await Effect.runPromise(usersService.disableUser('u-1', 'tenant-1'))

    expect((state.updateUserCalls[0][2] as any).department).toBe('Finance')
    expect((state.updateUserCalls[1][2] as any)).toEqual({ isActive: false })
    expect((state.updateUserCalls[2][2] as any)).toEqual({ isActive: true })
    expect((state.updateUserCalls[3][2] as any)).toEqual({ isActive: false })
  })

  test('updatePassword resets hash and returns refreshed user', async () => {
    state.findUserByIdResult = createBaseUser({ id: 'u-1', email: 'after.update@iaf.co.id' })
    const result = await Effect.runPromise(usersService.updatePassword('u-1', 'NewPass#123', 'tenant-1'))

    expect(result.email).toBe('after.update@iaf.co.id')
    expect(state.updatePasswordCalls.length).toBe(1)
    expect(state.findUserByIdCalls.length).toBe(1)
  })

  test('updatePassword maps hash failures to DatabaseError', async () => {
    const exit = await Effect.runPromiseExit(usersService.updatePassword('u-1', '', 'tenant-1'))
    expect(exit._tag).toBe('Failure')
    expect(String(exit.cause)).toContain('DatabaseError')
    expect(String(exit.cause)).toContain('Failed to hash password')
  })

  test('resetPassword sets forcePasswordChange default and override before reading user', async () => {
    state.findUserByIdResult = createBaseUser({ id: 'u-2' })

    await Effect.runPromise(usersService.resetPassword('u-2', 'Reset#123', 'tenant-1'))
    const defaultPayload = state.updateUserCalls[0][2] as any
    expect(defaultPayload.forcePasswordChange).toBe(true)
    expect(defaultPayload.failedLoginAttempts).toBe(0)
    expect(defaultPayload.passwordChangedAt instanceof Date).toBe(true)

    await Effect.runPromise(
      usersService.resetPassword('u-2', 'Reset#123', 'tenant-1', { forcePasswordChange: false })
    )
    const overridePayload = state.updateUserCalls[1][2] as any
    expect(overridePayload.forcePasswordChange).toBe(false)
  })

  test('resetPassword maps hash failures to DatabaseError', async () => {
    const exit = await Effect.runPromiseExit(usersService.resetPassword('u-2', '', 'tenant-1'))
    expect(exit._tag).toBe('Failure')
    expect(String(exit.cause)).toContain('DatabaseError')
    expect(String(exit.cause)).toContain('Failed to hash password')
  })

  test('verifyEmail updates and returns fresh user', async () => {
    state.findUserByIdResult = createBaseUser({ id: 'verified-user', isVerified: true })
    const result = await Effect.runPromise(usersService.verifyEmail('verified-user', 'tenant-1'))

    expect(state.verifyEmailCalls.length).toBe(1)
    expect(result.id).toBe('verified-user')
  })
})
