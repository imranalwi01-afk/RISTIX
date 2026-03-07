import { beforeEach, describe, expect, mock, test } from 'bun:test'
import { OpenAPIHono } from '@hono/zod-openapi'
import { getTableName } from 'drizzle-orm'

type QueueMap = Record<string, any[][]>
type ErrorQueueMap = Record<string, any[]>

const dequeue = (queueMap: QueueMap, tableName: string): any[] => {
  const queue = queueMap[tableName] || (queueMap[tableName] = [])
  return queue.length > 0 ? queue.shift()! : []
}

const enqueue = (queueMap: QueueMap, tableName: string, rows: any[]) => {
  const queue = queueMap[tableName] || (queueMap[tableName] = [])
  queue.push(rows)
}

const dequeueError = (queueMap: ErrorQueueMap, tableName: string): any => {
  const queue = queueMap[tableName] || (queueMap[tableName] = [])
  return queue.length > 0 ? queue.shift() : null
}

const enqueueError = (queueMap: ErrorQueueMap, tableName: string, error: any) => {
  const queue = queueMap[tableName] || (queueMap[tableName] = [])
  queue.push(error)
}

const state = {
  selectQueue: {} as QueueMap,
  insertReturningQueue: {} as QueueMap,
  updateReturningQueue: {} as QueueMap,
  updateExecuteErrorQueue: {} as ErrorQueueMap,
  insertCalls: [] as Array<{ table: string; payload: any }>,
  updateCalls: [] as Array<{ table: string; patch: any }>,
  addJobMode: 'success' as 'success' | 'throw',
  getJobMap: new Map<string, any>(),
  legacyUnsafeQueue: [] as any[][],
  jobApprovalAutoApprove: true,
  jobApprovalRequest: {
    id: 'approval-job-1',
    expiresAt: new Date('2026-02-25T10:00:00.000Z'),
  },
  handleJobApprovalResult: {
    status: 'approved',
    queued: true,
    completed: true,
    approvalsRequired: 2,
    approvalsReceived: 2,
    remainingApprovals: 0,
  } as any,
  handleJobApprovalError: null as string | null,
}

class SelectBuilder {
  private tableName = ''

  from(table: any) {
    this.tableName = getTableName(table)
    return this
  }

  where(..._args: any[]) {
    return this
  }

  orderBy(..._args: any[]) {
    return this
  }

  limit(..._args: any[]) {
    return this
  }

  offset(..._args: any[]) {
    return this
  }

  then(resolve: any, reject: any) {
    return Promise.resolve(dequeue(state.selectQueue, this.tableName)).then(resolve, reject)
  }
}

class InsertBuilder {
  private tableName: string
  private returningEnabled = false
  private payload: any

  constructor(table: any) {
    this.tableName = getTableName(table)
  }

  values(payload: any) {
    this.payload = payload
    state.insertCalls.push({ table: this.tableName, payload })
    return this
  }

  returning() {
    this.returningEnabled = true
    return this
  }

  then(resolve: any, reject: any) {
    const result = this.returningEnabled
      ? dequeue(state.insertReturningQueue, this.tableName)
      : []

    return Promise.resolve(result).then(resolve, reject)
  }
}

class UpdateBuilder {
  private tableName: string
  private returningEnabled = false
  private patch: any

  constructor(table: any) {
    this.tableName = getTableName(table)
  }

  set(patch: any) {
    this.patch = patch
    state.updateCalls.push({ table: this.tableName, patch })
    return this
  }

  where(..._args: any[]) {
    return this
  }

  returning() {
    this.returningEnabled = true
    return this
  }

  execute() {
    const queuedError = dequeueError(state.updateExecuteErrorQueue, this.tableName)
    if (queuedError) {
      return Promise.reject(queuedError)
    }
    return Promise.resolve([])
  }

  then(resolve: any, reject: any) {
    const result = this.returningEnabled
      ? dequeue(state.updateReturningQueue, this.tableName)
      : []

    return Promise.resolve(result).then(resolve, reject)
  }
}

const createFakeDb = () => ({
  select: (..._args: any[]) => new SelectBuilder(),
  insert: (table: any) => new InsertBuilder(table),
  update: (table: any) => new UpdateBuilder(table),
  query: {
    userRoles: {
      findMany: async () => [],
    },
  },
})

const addJobMock = mock(async () => {
  if (state.addJobMode === 'throw') {
    throw new Error('queue unavailable')
  }

  return { id: 'queue-job-1' }
})

const getJobMock = mock(async (id: string) => state.getJobMap.get(id) || null)
const legacyUnsafeMock = mock(async () => {
  return state.legacyUnsafeQueue.length > 0 ? state.legacyUnsafeQueue.shift()! : []
})

const checkAutoApprovalConditionsMock = mock(async () => state.jobApprovalAutoApprove)
const createJobApprovalRequestMock = mock(async () => state.jobApprovalRequest)
const handleJobApprovalCompleteMock = mock(async () => {
  if (state.handleJobApprovalError) {
    throw new Error(state.handleJobApprovalError)
  }

  return state.handleJobApprovalResult
})

const passthroughMiddleware = async (c: any, next: any) => {
  const permissionsHeader = c.req.header('x-test-permissions')
  const permissions = typeof permissionsHeader === 'string'
    ? permissionsHeader.split(',').map((entry) => entry.trim()).filter(Boolean)
    : ['jobs.manage', 'admin.system.manage', 'jobs.approve', 'jobs.runtime.view']

  c.set('tenantId', c.req.header('x-test-tenant') || 'tenant-jobs-1')
  c.set('userId', c.req.header('x-test-user') || 'user-jobs-1')
  c.set('permissions', permissions)
  c.set('userPermissions', permissions)
  c.set('isSystemUser', c.req.header('x-test-system-user') === 'true')
  await next()
}

mock.module('@/config/database', () => ({
  getDatabase: () => createFakeDb(),
  legacyConnection: {
    unsafe: legacyUnsafeMock,
  },
}))

mock.module('../../config/database', () => ({
  getDatabase: () => createFakeDb(),
  legacyConnection: {
    unsafe: legacyUnsafeMock,
  },
}))

mock.module('@/services/queue.service', () => ({
  addJob: addJobMock,
  getJob: getJobMock,
}))

mock.module('../../services/queue.service', () => ({
  addJob: addJobMock,
  getJob: getJobMock,
}))

mock.module('@/services/job-approval.service', () => ({
  checkAutoApprovalConditions: checkAutoApprovalConditionsMock,
  createJobApprovalRequest: createJobApprovalRequestMock,
  handleJobApprovalComplete: handleJobApprovalCompleteMock,
}))

mock.module('../../services/job-approval.service', () => ({
  checkAutoApprovalConditions: checkAutoApprovalConditionsMock,
  createJobApprovalRequest: createJobApprovalRequestMock,
  handleJobApprovalComplete: handleJobApprovalCompleteMock,
}))

mock.module('@/middleware', () => ({
  authMiddleware: passthroughMiddleware,
  tenantMiddleware: passthroughMiddleware,
  requirePermission: () => passthroughMiddleware,
  errorHandler: async (c: any) => c,
  auditMiddleware: passthroughMiddleware,
}))

mock.module('../../middleware', () => ({
  authMiddleware: passthroughMiddleware,
  tenantMiddleware: passthroughMiddleware,
  requirePermission: () => passthroughMiddleware,
  errorHandler: async (c: any) => c,
  auditMiddleware: passthroughMiddleware,
}))

const { jobsRoutes } = await import('@/routes/jobs.routes')

describe('jobs routes response contracts', () => {
  beforeEach(() => {
    state.selectQueue = {}
    state.insertReturningQueue = {}
    state.updateReturningQueue = {}
    state.updateExecuteErrorQueue = {}
    state.insertCalls = []
    state.updateCalls = []
    state.addJobMode = 'success'
    state.getJobMap = new Map<string, any>()
    state.legacyUnsafeQueue = []
    state.jobApprovalAutoApprove = true
    state.jobApprovalRequest = {
      id: 'approval-job-1',
      expiresAt: new Date('2026-02-25T10:00:00.000Z'),
    }
    state.handleJobApprovalResult = {
      status: 'approved',
      queued: true,
      completed: true,
      approvalsRequired: 2,
      approvalsReceived: 2,
      remainingApprovals: 0,
    }
    state.handleJobApprovalError = null

    addJobMock.mockClear()
    getJobMock.mockClear()
    legacyUnsafeMock.mockClear()
    checkAutoApprovalConditionsMock.mockClear()
    createJobApprovalRequestMock.mockClear()
    handleJobApprovalCompleteMock.mockClear()
  })

  test('returns 403 when required jobs permissions are missing', async () => {
    const app = new OpenAPIHono()
    app.route('/api/v1/jobs', jobsRoutes)

    const response = await app.request('/api/v1/jobs/definitions', {
      headers: { 'x-test-permissions': '' },
    })

    const body = await response.json()

    expect(response.status).toBe(403)
    expect(body.success).toBe(false)
    expect(body.code).toBe('UNAUTHORIZED')
  })

  test('GET /api/v1/jobs/definitions returns enabled job definitions', async () => {
    enqueue(state.selectQueue, 'job_definitions', [
      {
        id: 'job-def-1',
        name: 'Daily ECL Run',
        description: null,
        jobType: 'SQL_SP',
        cronExpression: null,
        defaultParameters: { targetDatabase: 'LEGACY' },
        priority: 'HIGH',
        timeout: null,
        maxRetries: null,
        requiresApproval: true,
        isEnabled: true,
        tenantId: 'tenant-jobs-1',
        createdBy: 'user-jobs-1',
        createdAt: new Date('2026-02-24T00:00:00.000Z'),
        updatedAt: new Date('2026-02-24T01:00:00.000Z'),
      },
    ])

    const app = new OpenAPIHono()
    app.route('/api/v1/jobs', jobsRoutes)

    const response = await app.request('/api/v1/jobs/definitions')
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body[0].id).toBe('job-def-1')
    expect(body[0].createdAt).toBe('2026-02-24T00:00:00.000Z')
    expect(body[0].updatedAt).toBe('2026-02-24T01:00:00.000Z')
  })

  test('GET /api/v1/jobs/definitions/{id} returns 404 for missing definition', async () => {
    enqueue(state.selectQueue, 'job_definitions', [])

    const app = new OpenAPIHono()
    app.route('/api/v1/jobs', jobsRoutes)

    const response = await app.request('/api/v1/jobs/definitions/missing-id')
    const body = await response.json()

    expect(response.status).toBe(404)
    expect(body.error).toBe('Definition not found')
  })

  test('POST /api/v1/jobs/definitions validates supported job type', async () => {
    const app = new OpenAPIHono()
    app.route('/api/v1/jobs', jobsRoutes)

    const response = await app.request('/api/v1/jobs/definitions', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        name: 'Invalid Job',
        jobType: 'UNKNOWN',
      }),
    })

    const body = await response.json()

    expect(response.status).toBe(400)
    expect(String(body.error)).toContain('Unsupported job type')
  })

  test('POST /api/v1/jobs/definitions creates job definition and returns 201', async () => {
    enqueue(state.insertReturningQueue, 'job_definitions', [
      {
        id: 'job-def-created',
        name: 'Nightly SQL',
        description: 'Nightly run',
        jobType: 'SQL_SP',
        cronExpression: '0 0 * * *',
        defaultParameters: { schema: 'frs9' },
        priority: 'HIGH',
        timeout: 3600,
        maxRetries: 1,
        requiresApproval: false,
        isEnabled: true,
        tenantId: 'tenant-jobs-1',
        createdBy: 'user-jobs-1',
        createdAt: new Date('2026-02-24T02:00:00.000Z'),
        updatedAt: new Date('2026-02-24T02:00:00.000Z'),
      },
    ])

    const app = new OpenAPIHono()
    app.route('/api/v1/jobs', jobsRoutes)

    const response = await app.request('/api/v1/jobs/definitions', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        name: 'Nightly SQL',
        description: 'Nightly run',
        jobType: 'sql_sp',
        cronExpression: '0 0 * * *',
      }),
    })

    const body = await response.json()

    expect(response.status).toBe(201)
    expect(body.id).toBe('job-def-created')
    expect(body.jobType).toBe('SQL_SP')
    expect(state.insertCalls[0]?.table).toBe('job_definitions')
  })

  test('POST /api/v1/jobs/{id}/run returns 404 when definition is missing', async () => {
    enqueue(state.selectQueue, 'job_definitions', [])

    const app = new OpenAPIHono()
    app.route('/api/v1/jobs', jobsRoutes)

    const response = await app.request('/api/v1/jobs/job-def-missing/run', {
      method: 'POST',
    })
    const body = await response.json()

    expect(response.status).toBe(404)
    expect(body.error).toBe('Job definition not found')
  })

  test('POST /api/v1/jobs/{id}/run returns pending_approval when approval is required', async () => {
    state.jobApprovalAutoApprove = false

    enqueue(state.selectQueue, 'job_definitions', [
      {
        id: 'job-def-approval',
        name: 'Legacy SQL Execution',
        jobType: 'SQL_SP',
        defaultParameters: { targetDatabase: 'LEGACY' },
        priority: 'HIGH',
        maxRetries: 0,
        timeout: 3600,
        requiresApproval: true,
        isEnabled: true,
      },
    ])
    enqueue(state.selectQueue, 'job_executions', [])

    const app = new OpenAPIHono()
    app.route('/api/v1/jobs', jobsRoutes)

    const response = await app.request('/api/v1/jobs/job-def-approval/run', {
      method: 'POST',
    })

    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.status).toBe('pending_approval')
    expect(body.approvalRequestId).toBe('approval-job-1')
    expect(createJobApprovalRequestMock).toHaveBeenCalledTimes(1)
    expect(addJobMock).toHaveBeenCalledTimes(0)
  })

  test('POST /api/v1/jobs/{id}/run enqueues and starts job when approval not required', async () => {
    enqueue(state.selectQueue, 'job_definitions', [
      {
        id: 'job-def-run',
        name: 'Standard Job',
        jobType: 'INTERNAL_SCRIPT',
        defaultParameters: { feature: 'ecl' },
        priority: 'NORMAL',
        maxRetries: 1,
        timeout: 300,
        requiresApproval: false,
        isEnabled: true,
      },
    ])
    enqueue(state.selectQueue, 'job_executions', [])

    const app = new OpenAPIHono()
    app.route('/api/v1/jobs', jobsRoutes)

    const response = await app.request('/api/v1/jobs/job-def-run/run', {
      method: 'POST',
    })

    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.status).toBe('RUNNING')
    expect(body.jobId).toBe('queue-job-1')
    expect(addJobMock).toHaveBeenCalledTimes(1)
  })

  test('POST /api/v1/jobs/{id}/control returns 404 when job instance is missing', async () => {
    const app = new OpenAPIHono()
    app.route('/api/v1/jobs', jobsRoutes)

    const response = await app.request('/api/v1/jobs/execution-missing/control', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ action: 'stop' }),
    })

    const body = await response.json()

    expect(response.status).toBe(404)
    expect(body.error).toBe('Job not found')
  })

  test('POST /api/v1/jobs/{id}/control returns success when queue job exists', async () => {
    state.getJobMap.set('execution-1', {
      getState: async () => 'active',
    })

    const app = new OpenAPIHono()
    app.route('/api/v1/jobs', jobsRoutes)

    const response = await app.request('/api/v1/jobs/execution-1/control', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ action: 'pause' }),
    })

    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.message).toContain('pause')
  })

  test('POST /api/v1/jobs/{id}/toggle flips enabled flag and returns latest value', async () => {
    enqueue(state.selectQueue, 'job_definitions', [
      {
        id: 'job-def-toggle',
        isEnabled: true,
      },
    ])
    enqueue(state.updateReturningQueue, 'job_definitions', [
      {
        id: 'job-def-toggle',
        isEnabled: false,
      },
    ])

    const app = new OpenAPIHono()
    app.route('/api/v1/jobs', jobsRoutes)

    const response = await app.request('/api/v1/jobs/job-def-toggle/toggle', {
      method: 'POST',
    })

    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.isEnabled).toBe(false)
  })

  test('GET /api/v1/jobs/executions returns normalized execution payload with runtime diagnostics', async () => {
    enqueue(state.selectQueue, 'job_executions', [])
    enqueue(state.selectQueue, 'job_executions', [
      {
        id: 'execution-runtime-1',
        jobDefinitionId: 'job-def-runtime-1',
        jobName: 'Legacy Runtime Job',
        jobType: 'SQL_SP',
        status: 'running',
        progress: 25,
        parameters: { targetDatabase: 'LEGACY' },
        tags: { dbBackendPid: 777 },
        triggeredBy: 'maker-1',
        approvalRequestId: null,
        approvalStatus: 'not_required',
        startTime: new Date('2026-02-25T01:00:00.000Z'),
        endTime: null,
        tenantId: 'tenant-jobs-1',
        error: null,
        result: null,
      },
    ])
    state.getJobMap.set('execution-runtime-1', {
      getState: async () => 'active',
      finishedOn: null,
      failedReason: null,
    })
    state.legacyUnsafeQueue.push([
      {
        pid: 777,
        state: 'active',
        waitEventType: null,
        waitEvent: null,
        runtimeSeconds: 120,
        blockedByPids: '{11,12}',
        dbSessionStart: new Date('2026-02-25T00:58:00.000Z'),
        queryStart: new Date('2026-02-25T01:00:00.000Z'),
      },
    ])

    const app = new OpenAPIHono()
    app.route('/api/v1/jobs', jobsRoutes)

    const response = await app.request('/api/v1/jobs/executions')
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toHaveLength(1)
    expect(body[0].id).toBe('execution-runtime-1')
    expect(body[0].status).toBe('active')
    expect(body[0].runtime.available).toBe(true)
    expect(body[0].runtime.pid).toBe(777)
    expect(body[0].runtime.blockedByPids).toEqual([11, 12])
    expect(getJobMock).toHaveBeenCalledTimes(1)
  })

  test('GET /api/v1/jobs/executions/{id} returns 404 when execution is missing', async () => {
    enqueue(state.selectQueue, 'job_executions', [])
    enqueue(state.selectQueue, 'job_executions', [])

    const app = new OpenAPIHono()
    app.route('/api/v1/jobs', jobsRoutes)

    const response = await app.request('/api/v1/jobs/executions/execution-missing')
    const body = await response.json()

    expect(response.status).toBe(404)
    expect(body.error).toBe('Execution not found')
  })

  test('GET /api/v1/jobs/executions/pending-approval returns pending approval rows', async () => {
    enqueue(state.selectQueue, 'job_executions', [])
    enqueue(state.selectQueue, 'job_executions', [
      {
        id: 'execution-pending-1',
        jobDefinitionId: 'job-def-approval',
        jobName: 'Approval Job',
        jobType: 'SQL_SP',
        status: 'pending_approval',
        progress: 0,
        parameters: { targetDatabase: 'LEGACY' },
        triggeredBy: 'maker-2',
        approvalRequestId: 'approval-2',
        approvalStatus: 'pending',
        startTime: new Date('2026-02-25T03:00:00.000Z'),
        endTime: null,
        result: null,
        error: 'Approval pending',
        tenantId: 'tenant-jobs-1',
      },
    ])

    const app = new OpenAPIHono()
    app.route('/api/v1/jobs', jobsRoutes)

    const response = await app.request('/api/v1/jobs/executions/pending-approval')
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toHaveLength(1)
    expect(body[0].id).toBe('execution-pending-1')
    expect(body[0].approvalStatus).toBe('pending')
  })

  test('GET /api/v1/jobs/executions/{id}/runtime returns 403 without runtime permission', async () => {
    const app = new OpenAPIHono()
    app.route('/api/v1/jobs', jobsRoutes)

    const response = await app.request('/api/v1/jobs/executions/execution-1/runtime', {
      headers: { 'x-test-permissions': 'jobs.view' },
    })
    const body = await response.json()

    expect(response.status).toBe(403)
    expect(body.code).toBe('UNAUTHORIZED')
  })

  test('GET /api/v1/jobs/executions/{id}/runtime returns 404 when execution is missing', async () => {
    enqueue(state.selectQueue, 'job_executions', [])

    const app = new OpenAPIHono()
    app.route('/api/v1/jobs', jobsRoutes)

    const response = await app.request('/api/v1/jobs/executions/execution-1/runtime')
    const body = await response.json()

    expect(response.status).toBe(404)
    expect(body.error).toBe('Execution not found')
  })

  test('GET /api/v1/jobs/executions/{id}/runtime returns reason when SQL legacy procedure name is missing', async () => {
    enqueue(state.selectQueue, 'job_executions', [
      {
        id: 'execution-runtime-2',
        jobType: 'SQL_SP',
        status: 'active',
        parameters: { targetDatabase: 'LEGACY' },
        tags: {},
        endTime: null,
      },
    ])

    const app = new OpenAPIHono()
    app.route('/api/v1/jobs', jobsRoutes)

    const response = await app.request('/api/v1/jobs/executions/execution-runtime-2/runtime')
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.available).toBe(false)
    expect(body.reason).toBe('missing_procedure_name')
  })

  test('POST /api/v1/jobs/{id}/run returns 400 when definition is disabled', async () => {
    enqueue(state.selectQueue, 'job_definitions', [
      {
        id: 'job-def-disabled',
        name: 'Disabled Job',
        jobType: 'INTERNAL_SCRIPT',
        isEnabled: false,
      },
    ])

    const app = new OpenAPIHono()
    app.route('/api/v1/jobs', jobsRoutes)

    const response = await app.request('/api/v1/jobs/job-def-disabled/run', {
      method: 'POST',
    })
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.error).toBe('Job is disabled')
  })

  test('POST /api/v1/jobs/{id}/run returns 400 for unsupported definition job type', async () => {
    enqueue(state.selectQueue, 'job_definitions', [
      {
        id: 'job-def-bad-type',
        name: 'Bad Type Job',
        jobType: 'UNSUPPORTED',
        isEnabled: true,
      },
    ])

    const app = new OpenAPIHono()
    app.route('/api/v1/jobs', jobsRoutes)

    const response = await app.request('/api/v1/jobs/job-def-bad-type/run', {
      method: 'POST',
    })
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(String(body.error)).toContain('Unsupported job type')
  })

  test('POST /api/v1/jobs/{id}/run returns 409 when active execution already exists', async () => {
    enqueue(state.selectQueue, 'job_definitions', [
      {
        id: 'job-def-conflict',
        name: 'Conflict Job',
        jobType: 'INTERNAL_SCRIPT',
        defaultParameters: {},
        priority: 'NORMAL',
        maxRetries: 1,
        timeout: 300,
        requiresApproval: false,
        isEnabled: true,
      },
    ])
    const activeExecution = {
      id: 'execution-active-1',
      startTime: new Date('2026-02-25T02:00:00.000Z'),
    }
    enqueue(state.selectQueue, 'job_executions', [
      activeExecution,
    ])
    enqueue(state.selectQueue, 'job_executions', [
      activeExecution,
    ])
    state.getJobMap.set('execution-active-1', {
      getState: async () => 'active',
      finishedOn: null,
      failedReason: null,
    })

    const app = new OpenAPIHono()
    app.route('/api/v1/jobs', jobsRoutes)

    const response = await app.request('/api/v1/jobs/job-def-conflict/run', {
      method: 'POST',
    })
    const body = await response.json()

    expect(response.status).toBe(409)
    expect(body.status).toBe('CONFLICT')
    expect(body.activeExecutionId).toBe('execution-active-1')
  })

  test('POST /api/v1/jobs/{id}/run returns 500 when queue enqueue fails', async () => {
    state.addJobMode = 'throw'
    enqueue(state.selectQueue, 'job_definitions', [
      {
        id: 'job-def-queue-fail',
        name: 'Queue Fail Job',
        jobType: 'INTERNAL_SCRIPT',
        defaultParameters: {},
        priority: 'NORMAL',
        maxRetries: 1,
        timeout: 300,
        requiresApproval: false,
        isEnabled: true,
      },
    ])
    enqueue(state.selectQueue, 'job_executions', [])

    const app = new OpenAPIHono()
    app.route('/api/v1/jobs', jobsRoutes)

    const response = await app.request('/api/v1/jobs/job-def-queue-fail/run', {
      method: 'POST',
    })
    const body = await response.json()

    expect(response.status).toBe(500)
    expect(body.success).toBe(false)
    expect(String(body.message)).toContain('Queue enqueue failed')
    expect(
      state.updateCalls.some((entry) => entry.table === 'job_executions' && entry.patch?.status === 'failed')
    ).toBe(true)
  })

  test('POST /api/v1/jobs/{id}/run returns 409 when active-state update hits unique-violation guard', async () => {
    enqueue(state.selectQueue, 'job_definitions', [
      {
        id: 'job-def-unique-conflict',
        name: 'Unique Conflict Job',
        jobType: 'INTERNAL_SCRIPT',
        defaultParameters: {},
        priority: 'NORMAL',
        maxRetries: 1,
        timeout: 300,
        requiresApproval: false,
        isEnabled: true,
      },
    ])
    enqueue(state.selectQueue, 'job_executions', [])
    enqueue(state.selectQueue, 'job_executions', [])
    enqueueError(state.updateExecuteErrorQueue, 'job_executions', { code: '23505' })
    enqueue(state.selectQueue, 'job_executions', [
      {
        id: 'execution-active-existing',
        startTime: new Date('2026-02-25T02:10:00.000Z'),
      },
    ])

    const app = new OpenAPIHono()
    app.route('/api/v1/jobs', jobsRoutes)

    const response = await app.request('/api/v1/jobs/job-def-unique-conflict/run', {
      method: 'POST',
    })
    const body = await response.json()

    expect(response.status).toBe(409)
    expect(body.status).toBe('CONFLICT')
    expect(String(body.message)).toContain('already running')
    expect(
      state.updateCalls.some((entry) => entry.table === 'job_executions' && entry.patch?.status === 'cancelled')
    ).toBe(true)
  })

  test('POST /api/v1/jobs/executions/{id}/approve blocks self-approval', async () => {
    enqueue(state.selectQueue, 'job_executions', [
      {
        id: 'execution-approve-self',
        approvalStatus: 'pending',
        approvalRequestId: 'approval-self',
        triggeredBy: 'user-jobs-1',
      },
    ])

    const app = new OpenAPIHono()
    app.route('/api/v1/jobs', jobsRoutes)

    const response = await app.request('/api/v1/jobs/executions/execution-approve-self/approve', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ comment: 'approve' }),
    })
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.error).toBe('You cannot approve your own job execution')
  })

  test('POST /api/v1/jobs/executions/{id}/approve requires approval request id', async () => {
    enqueue(state.selectQueue, 'job_executions', [
      {
        id: 'execution-approve-missing-request',
        approvalStatus: 'pending',
        approvalRequestId: null,
        triggeredBy: 'maker-2',
      },
    ])

    const app = new OpenAPIHono()
    app.route('/api/v1/jobs', jobsRoutes)

    const response = await app.request('/api/v1/jobs/executions/execution-approve-missing-request/approve', {
      method: 'POST',
    })
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.error).toBe('Approval request is missing for this execution')
  })

  test('POST /api/v1/jobs/executions/{id}/approve returns waiting message when additional approvers are needed', async () => {
    state.handleJobApprovalResult = {
      status: 'pending',
      queued: false,
      completed: false,
      approvalsRequired: 2,
      approvalsReceived: 1,
      remainingApprovals: 1,
    }
    enqueue(state.selectQueue, 'job_executions', [
      {
        id: 'execution-approve-waiting',
        approvalStatus: 'pending',
        approvalRequestId: 'approval-waiting',
        triggeredBy: 'maker-2',
      },
    ])

    const app = new OpenAPIHono()
    app.route('/api/v1/jobs', jobsRoutes)

    const response = await app.request('/api/v1/jobs/executions/execution-approve-waiting/approve', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ comment: 'checked' }),
    })
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(String(body.message)).toContain('Waiting for 1 more approver')
    expect(body.status).toBe('pending')
  })

  test('POST /api/v1/jobs/executions/{id}/approve maps approval service not-found errors to 404', async () => {
    state.handleJobApprovalError = 'approval request not found'
    enqueue(state.selectQueue, 'job_executions', [
      {
        id: 'execution-approve-not-found',
        approvalStatus: 'pending',
        approvalRequestId: 'approval-missing',
        triggeredBy: 'maker-2',
      },
    ])

    const app = new OpenAPIHono()
    app.route('/api/v1/jobs', jobsRoutes)

    const response = await app.request('/api/v1/jobs/executions/execution-approve-not-found/approve', {
      method: 'POST',
    })
    const body = await response.json()

    expect(response.status).toBe(404)
    expect(body.success).toBe(false)
  })

  test('POST /api/v1/jobs/executions/{id}/approve maps not-pending errors to 409', async () => {
    state.handleJobApprovalError = 'request is not pending anymore'
    enqueue(state.selectQueue, 'job_executions', [
      {
        id: 'execution-approve-conflict',
        approvalStatus: 'pending',
        approvalRequestId: 'approval-conflict',
        triggeredBy: 'maker-2',
      },
    ])

    const app = new OpenAPIHono()
    app.route('/api/v1/jobs', jobsRoutes)

    const response = await app.request('/api/v1/jobs/executions/execution-approve-conflict/approve', {
      method: 'POST',
    })
    const body = await response.json()

    expect(response.status).toBe(409)
    expect(body.success).toBe(false)
  })

  test('POST /api/v1/jobs/executions/{id}/reject maps errors to 404/409 and returns success on valid rejection', async () => {
    const app = new OpenAPIHono()
    app.route('/api/v1/jobs', jobsRoutes)

    state.handleJobApprovalError = 'approval request not found'
    enqueue(state.selectQueue, 'job_executions', [
      {
        id: 'execution-reject-not-found',
        approvalStatus: 'pending',
        approvalRequestId: 'approval-not-found',
        triggeredBy: 'maker-3',
      },
    ])
    const notFoundResponse = await app.request('/api/v1/jobs/executions/execution-reject-not-found/reject', {
      method: 'POST',
    })
    expect(notFoundResponse.status).toBe(404)

    state.handleJobApprovalError = 'request already approved and not pending'
    enqueue(state.selectQueue, 'job_executions', [
      {
        id: 'execution-reject-conflict',
        approvalStatus: 'pending',
        approvalRequestId: 'approval-conflict',
        triggeredBy: 'maker-3',
      },
    ])
    const conflictResponse = await app.request('/api/v1/jobs/executions/execution-reject-conflict/reject', {
      method: 'POST',
    })
    expect(conflictResponse.status).toBe(409)

    state.handleJobApprovalError = null
    state.handleJobApprovalResult = {
      status: 'rejected',
      queued: false,
      completed: true,
      approvalsRequired: 2,
      approvalsReceived: 1,
      remainingApprovals: 0,
    }
    enqueue(state.selectQueue, 'job_executions', [
      {
        id: 'execution-reject-success',
        approvalStatus: 'pending',
        approvalRequestId: 'approval-success',
        triggeredBy: 'maker-3',
      },
    ])
    const successResponse = await app.request('/api/v1/jobs/executions/execution-reject-success/reject', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ comment: 'rejected' }),
    })
    const successBody = await successResponse.json()

    expect(successResponse.status).toBe(200)
    expect(successBody.success).toBe(true)
    expect(successBody.message).toBe('Job execution rejected')
  })

  test('GET /api/v1/jobs/metrics returns aggregated counters', async () => {
    enqueue(state.selectQueue, 'job_executions', [])
    enqueue(state.selectQueue, 'job_executions', [])
    enqueue(state.selectQueue, 'job_executions', [{ count: 2 }])
    enqueue(state.selectQueue, 'job_executions', [{ count: 3 }])
    enqueue(state.selectQueue, 'job_executions', [{ count: 4 }])
    enqueue(state.selectQueue, 'job_executions', [{ count: 1 }])

    const app = new OpenAPIHono()
    app.route('/api/v1/jobs', jobsRoutes)

    const response = await app.request('/api/v1/jobs/metrics')
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.activeJobs).toBe(2)
    expect(body.queuedJobs).toBe(3)
    expect(body.completedJobsToday).toBe(4)
    expect(body.failedJobsToday).toBe(1)
  })
})
