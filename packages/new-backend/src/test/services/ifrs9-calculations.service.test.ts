import { beforeEach, describe, expect, mock, test } from 'bun:test'

const state = {
  resultRows: [] as any[],
  masterRows: [] as any[],
  resultWhereCalls: [] as unknown[],
  masterWhereCalls: [] as unknown[],
}

const frs9ImpCaResultH = {
  __table: 'result',
  prcDate: 'result.prcDate',
  stage: 'result.stage',
  eclAmount: 'result.eclAmount',
  outstanding: 'result.outstanding',
}

const frs9MasterAccount = {
  __table: 'master',
  prcDate: 'master.prcDate',
  outstanding: 'master.outstanding',
}

const createQuery = (kind: 'result' | 'master') => {
  const query = {
    from: () => query,
    where: (condition: unknown) => {
      if (kind === 'result') {
        state.resultWhereCalls.push(condition)
      } else {
        state.masterWhereCalls.push(condition)
      }
      return query
    },
    groupBy: () => query,
    orderBy: () => query,
    limit: async () => kind === 'result' ? state.resultRows : state.masterRows,
  }

  return query
}

mock.module('../config/database', () => ({
  getDatabase: () => ({}),
  legacyDb: {
    select: () => ({
      from: (table: { __table: 'result' | 'master' }) => createQuery(table.__table),
    }),
  },
}))
mock.module('@/config/database', () => ({
  getDatabase: () => ({}),
  legacyDb: {
    select: () => ({
      from: (table: { __table: 'result' | 'master' }) => createQuery(table.__table),
    }),
  },
}))

mock.module('../db/schema', () => ({
  frs9ImpCaResultH,
  jobExecutions: {},
  frs9MasterAccount,
  frs9PrcDate: {},
  frs9ImpCaEclConfigh: {},
  frs9ParamSegmenth: {},
}))
mock.module('@/db/schema', () => ({
  frs9ImpCaResultH,
  jobExecutions: {},
  frs9MasterAccount,
  frs9PrcDate: {},
  frs9ImpCaEclConfigh: {},
  frs9ParamSegmenth: {},
}))

mock.module('drizzle-orm', () => ({
  sql: (_strings: TemplateStringsArray, ...values: unknown[]) => ({ values }),
  eq: (...values: unknown[]) => ({ values }),
  inArray: (...values: unknown[]) => ({ values }),
  desc: (value: unknown) => value,
  and: (...values: unknown[]) => values,
  relations: () => ({}),
}))

mock.module('../repositories/jobs.repository', () => ({
  JobsRepository: {},
}))
mock.module('@/repositories/jobs.repository', () => ({
  JobsRepository: {},
}))

mock.module('./queue.service', () => ({
  addJob: async () => undefined,
}))
mock.module('@/services/queue.service', () => ({
  addJob: async () => undefined,
}))

const { ifrs9CalculationsService } = await import('@/services/ifrs9-calculations.service')

describe('ifrs9-calculations.service getPortfolioTrend', () => {
  beforeEach(() => {
    state.resultRows = []
    state.masterRows = []
    state.resultWhereCalls = []
    state.masterWhereCalls = []
  })

  test('returns chronological result-table trend for date=all without applying a date filter', async () => {
    state.resultRows = [
      {
        date: '2026-02-28',
        stage1: 300,
        stage2: 200,
        stage3: 100,
        totalECL: 600,
        totalPortfolio: 2000,
      },
      {
        date: '2026-01-31',
        stage1: 150,
        stage2: 100,
        stage3: 50,
        totalECL: 300,
        totalPortfolio: 1200,
      },
    ]

    const trend = await ifrs9CalculationsService.getPortfolioTrend('tenant-1', 'all')

    expect(state.resultWhereCalls).toHaveLength(0)
    expect(state.masterWhereCalls).toHaveLength(0)
    expect(trend).toHaveLength(2)
    expect(trend[0]).toMatchObject({
      month: 'Jan',
      stage1: 150,
      stage2: 100,
      stage3: 50,
      totalECL: 300,
      totalPortfolio: 1200,
      fullDate: '2026-01-31',
    })
    expect(trend[1]).toMatchObject({
      month: 'Feb',
      stage1: 300,
      stage2: 200,
      stage3: 100,
      totalECL: 600,
      totalPortfolio: 2000,
      fullDate: '2026-02-28',
    })
  })

  test('falls back to master-account trend and applies the date filter when a bounded date is requested', async () => {
    state.resultRows = []
    state.masterRows = [
      {
        date: '2026-02-28',
        value: 1750,
      },
    ]

    const trend = await ifrs9CalculationsService.getPortfolioTrend('tenant-1', '2026-02-28')

    expect(state.resultWhereCalls).toHaveLength(1)
    expect(state.masterWhereCalls).toHaveLength(1)
    expect(trend).toHaveLength(1)
    expect(trend[0]).toMatchObject({
      month: 'Feb',
      stage1: 0,
      stage2: 0,
      stage3: 0,
      totalECL: 0,
      totalPortfolio: 1750,
      fullDate: '2026-02-28',
    })
  })
})
