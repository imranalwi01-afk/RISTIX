import { beforeEach, describe, expect, mock, test } from 'bun:test'

const state = {
  getDatabaseCalls: [] as Array<string | undefined>,
  jobsFindManyCalls: [] as unknown[][],
  approvalFindManyCalls: [] as unknown[][],
  jobsSelectCalls: [] as unknown[][],
}

const dbStub = {
  query: {
    jobExecutions: {
      findMany: async (...args: unknown[]) => {
        state.jobsFindManyCalls.push(args)
        return [{ id: 'exec-1' }]
      },
      findFirst: async () => ({ id: 'exec-1' }),
    },
    jobDefinitions: {
      findMany: async (...args: unknown[]) => {
        state.jobsFindManyCalls.push(args)
        return [{ id: 'def-1' }]
      },
      findFirst: async () => ({ id: 'def-1' }),
    },
    approvalRequests: {
      findMany: async (...args: unknown[]) => {
        state.approvalFindManyCalls.push(args)
        return [{ id: 'apr-1' }]
      },
      findFirst: async () => ({ id: 'apr-1', tenantId: 'tenant-xyz' }),
    },
    approvalActions: {
      findMany: async () => [],
    },
    approvalMatrices: {
      findFirst: async () => null,
      findMany: async () => [],
    },
  },
  select: (...args: unknown[]) => {
    state.jobsSelectCalls.push(args)
    return {
      from: () => ({
        where: () => ({
          orderBy: async () => [{ id: 'def-1' }],
          limit: async () => [{ id: 'def-1' }],
        }),
      }),
    }
  },
}

mock.module('@/config/database', () => ({
  db: dbStub,
  getDatabase: (tenantId?: string | null) => {
    state.getDatabaseCalls.push(tenantId ?? undefined)
    return dbStub
  },
}))

const { JobsRepository } = await import('@/repositories/jobs.repository')
const { ApprovalRepository } = await import('@/repositories/approval.repository')

describe('tenant DB routing — jobs & approval repositories', () => {
  beforeEach(() => {
    state.getDatabaseCalls = []
    state.jobsFindManyCalls = []
    state.approvalFindManyCalls = []
    state.jobsSelectCalls = []
  })

  test('JobsRepository.findAllDefinitions routes through getDatabase(tenantId)', async () => {
    const rows = await JobsRepository.findAllDefinitions('tenant-xyz')
    expect(state.getDatabaseCalls).toEqual(['tenant-xyz'])
    expect(state.jobsSelectCalls.length).toBe(1)
    expect(rows.length).toBe(1)
  })

  test('JobsRepository.findDefinitionById routes through getDatabase(tenantId)', async () => {
    const row = await JobsRepository.findDefinitionById('def-1', 'tenant-xyz')
    expect(state.getDatabaseCalls).toEqual(['tenant-xyz'])
    expect(state.jobsSelectCalls.length).toBe(1)
    expect(row?.id).toBe('def-1')
  })

  test('ApprovalRepository.findPendingRequests routes through getDatabase(tenantId)', async () => {
    const rows = await ApprovalRepository.findPendingRequests('tenant-xyz')
    expect(state.getDatabaseCalls).toEqual(['tenant-xyz'])
    expect(state.approvalFindManyCalls.length).toBe(1)
    expect(rows.length).toBe(1)
  })
})
