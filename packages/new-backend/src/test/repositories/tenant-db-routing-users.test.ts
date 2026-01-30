import { jest } from '@jest/globals'

const mockFindMany = jest.fn().mockResolvedValue([])
const mockSelect = jest.fn().mockResolvedValue([{ count: 0 }])
const mockInsert = jest.fn().mockReturnValue({ values: jest.fn().mockReturnValue({ returning: jest.fn().mockResolvedValue([]) }) })

jest.unstable_mockModule('@/config/database', () => ({
  getDatabase: (tenantId?: string | null) => ({
    query: { users: { findMany: mockFindMany, findFirst: jest.fn() } },
    select: mockSelect,
    insert: mockInsert,
  }),
}))

const { usersRepository } = await import('@/repositories/users.repository')
const { getDatabase } = await import('@/config/database')

describe('tenant DB routing — users.repository', () => {
  beforeEach(() => jest.clearAllMocks())

  test('findByTenant routes to tenant DB', async () => {
    await usersRepository.findByTenant('tenant-abc')
    expect(getDatabase).toHaveBeenCalledWith('tenant-abc')
    expect(mockFindMany).toHaveBeenCalled()
  })

  test('create writes to tenant DB when tenantId supplied', async () => {
    const payload = { id: 'u1', email: 'x@y', tenantId: 'tenant-abc' } as any
    await usersRepository.create(payload)
    expect(getDatabase).toHaveBeenCalledWith('tenant-abc')
    expect(mockInsert).toHaveBeenCalled()
  })
})
