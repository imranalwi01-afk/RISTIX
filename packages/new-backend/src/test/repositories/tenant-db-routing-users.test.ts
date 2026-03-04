import { beforeEach, describe, expect, mock, test } from 'bun:test'
import { Effect } from 'effect'

const state = {
  getDatabaseCalls: [] as Array<string | undefined>,
  platformFindFirstCalls: [] as unknown[][],
  tenantFindFirstCalls: [] as unknown[][],
  platformInsertCalls: [] as unknown[][],
  tenantInsertCalls: [] as unknown[][],
  platformSelectCalls: [] as unknown[][],
  tenantSelectCalls: [] as unknown[][],
}

const createUser = (overrides: Record<string, unknown> = {}) => ({
  id: 'user-1',
  email: 'maker@iaf.co.id',
  tenantId: 'tenant-abc',
  ...overrides,
})

const makeDb = (scope: 'platform' | 'tenant') => ({
  query: {
    users: {
      findFirst: async (...args: unknown[]) => {
        if (scope === 'platform') state.platformFindFirstCalls.push(args)
        if (scope === 'tenant') state.tenantFindFirstCalls.push(args)
        return createUser({ scope })
      },
      findMany: async () => [],
    },
  },
  insert: (...args: unknown[]) => {
    if (scope === 'platform') state.platformInsertCalls.push(args)
    if (scope === 'tenant') state.tenantInsertCalls.push(args)
    return {
      values: () => ({
        returning: async () => [createUser({ scope })],
      }),
    }
  },
  select: (...args: unknown[]) => {
    if (scope === 'platform') state.platformSelectCalls.push(args)
    if (scope === 'tenant') state.tenantSelectCalls.push(args)
    return {
      from: () => ({
        where: async () => [{ total: 3, active: 2, inactive: 1, verifiedEmail: 1 }],
      }),
    }
  },
})

const platformDb = makeDb('platform')
const tenantDb = makeDb('tenant')

mock.module('@/config', () => ({
  db: platformDb,
}))

mock.module('@/config/database', () => ({
  getDatabase: (tenantId?: string | null) => {
    state.getDatabaseCalls.push(tenantId ?? undefined)
    return tenantDb
  },
}))

const { usersRepository } = await import('@/repositories/users.repository')

describe('tenant DB routing — users.repository', () => {
  beforeEach(() => {
    state.getDatabaseCalls = []
    state.platformFindFirstCalls = []
    state.tenantFindFirstCalls = []
    state.platformInsertCalls = []
    state.tenantInsertCalls = []
    state.platformSelectCalls = []
    state.tenantSelectCalls = []
  })

  test('findByEmail routes to tenant DB when tenantId is provided', async () => {
    await Effect.runPromise(usersRepository.findByEmail('maker@iaf.co.id', 'tenant-abc'))
    expect(state.getDatabaseCalls).toEqual(['tenant-abc'])
    expect(state.tenantFindFirstCalls.length).toBe(1)
    expect(state.platformFindFirstCalls.length).toBe(0)
  })

  test('findByEmail uses platform DB when tenantId is not provided', async () => {
    await Effect.runPromise(usersRepository.findByEmail('maker@iaf.co.id'))
    expect(state.getDatabaseCalls.length).toBe(0)
    expect(state.platformFindFirstCalls.length).toBe(1)
    expect(state.tenantFindFirstCalls.length).toBe(0)
  })

  test('create routes to tenant DB when payload includes tenantId', async () => {
    await Effect.runPromise(
      usersRepository.create({
        email: 'checker@iaf.co.id',
        username: 'checker',
        fullName: 'Checker',
        passwordHash: 'hash',
        tenantId: 'tenant-abc',
      } as any)
    )

    expect(state.getDatabaseCalls).toEqual(['tenant-abc'])
    expect(state.tenantInsertCalls.length).toBe(1)
    expect(state.platformInsertCalls.length).toBe(0)
  })

  test('getStats routes aggregation query to tenant DB', async () => {
    const stats = await Effect.runPromise(usersRepository.getStats('tenant-abc'))
    expect(state.getDatabaseCalls).toEqual(['tenant-abc'])
    expect(state.tenantSelectCalls.length).toBe(1)
    expect(stats).toEqual({ total: 3, active: 2, inactive: 1, verifiedEmail: 1 })
  })
})
