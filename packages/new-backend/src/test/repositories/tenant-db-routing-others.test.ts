import { jest } from '@jest/globals'

// Mock getDatabase to return a fake db with spies
const mockFindMany = jest.fn().mockResolvedValue([])
const mockSelect = jest.fn().mockResolvedValue([{ count: 0 }])
const mockInsert = jest.fn().mockReturnValue({ values: jest.fn().mockReturnValue({ returning: jest.fn().mockResolvedValue([]) }) })

jest.unstable_mockModule('@/config/database', () => ({
  getDatabase: (tenantId?: string | null) => ({
    query: {
      jobExecutions: { findMany: mockFindMany, findFirst: jest.fn() },
      jobDefinitions: { findMany: mockFindMany, findFirst: jest.fn() },
      approvalRequests: { findMany: mockFindMany, findFirst: jest.fn() },
    },
    select: mockSelect,
    insert: mockInsert,
    transaction: jest.fn().mockImplementation(async (cb: any) => cb({ insert: mockInsert, delete: jest.fn(), update: jest.fn() })),
  }),
}))

const { JobsRepository } = await import('@/repositories/jobs.repository')
const { ApprovalRepository } = await import('@/repositories/approval.repository')
const { getDatabase } = await import('@/config/database')

describe('tenant DB routing — jobs & approval repositories', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('JobsRepository.findExecutions uses tenant DB', async () => {
    await JobsRepository.findExecutions('tenant-xyz')
    expect(getDatabase).toHaveBeenCalledWith('tenant-xyz')
    expect(mockFindMany).toHaveBeenCalled()
  })

  test('JobsRepository.findAllDefinitions uses tenant DB', async () => {
    await JobsRepository.findAllDefinitions('tenant-xyz')
    expect(getDatabase).toHaveBeenCalledWith('tenant-xyz')
    expect(mockFindMany).toHaveBeenCalled()
  })

  test('ApprovalRepository.findPendingRequests uses tenant DB (service-level)', async () => {
    await ApprovalRepository.findPendingRequests('tenant-xyz')
    expect(getDatabase).toHaveBeenCalledWith('tenant-xyz')
    expect(mockFindMany).toHaveBeenCalled()
  })
})
