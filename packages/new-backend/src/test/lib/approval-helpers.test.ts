import { afterEach, beforeEach, describe, expect, test } from 'bun:test'

import {
  buildApprovalDescription,
  buildApprovalPermission,
  buildApprovalTitle,
  buildDefaultFourEyesRouting,
  buildOperationPermission,
  calculateApprovalProgress,
  canProcessApproval,
  extractPendingData,
  formatApprovalRequiredResponse,
  formatDirectExecutionResponse,
  getApprovalStatusColor,
  getApprovalStatusLabel,
  getRequiredApprovalLevel,
  hasApprovalPermission,
  hasOperationPermission,
  isApprovalExpired,
  requiresStrictFourEyes,
  shouldAutoApprove,
  validateApproverNotRequester,
} from '@/lib/approval-helpers'

const createRequest = (overrides: Record<string, unknown> = {}) =>
  ({
    id: 'apr-1',
    status: 'pending',
    currentLevel: 1,
    approvalsRequired: 2,
    approvalsReceived: 1,
    requestData: { id: 'x', value: 1 },
    expiresAt: null,
    ...overrides,
  } as any)

describe('approval-helpers', () => {
  const prevStrictMode = process.env.APPROVAL_STRICT_FOUR_EYES
  const prevConsoleError = console.error
  const errorCalls: unknown[][] = []

  beforeEach(() => {
    process.env.APPROVAL_STRICT_FOUR_EYES = prevStrictMode
    errorCalls.length = 0
    console.error = (...args: unknown[]) => {
      errorCalls.push(args)
    }
  })

  afterEach(() => {
    process.env.APPROVAL_STRICT_FOUR_EYES = prevStrictMode
    console.error = prevConsoleError
  })

  test('status label and color map known and fallback statuses', () => {
    expect(getApprovalStatusLabel('pending')).toBe('Pending Approval')
    expect(getApprovalStatusLabel('approved')).toBe('Approved')
    expect(getApprovalStatusLabel('custom-status')).toBe('custom-status')

    expect(getApprovalStatusColor('approved')).toBe('success')
    expect(getApprovalStatusColor('rejected')).toBe('error')
    expect(getApprovalStatusColor('custom-status')).toBe('default')
  })

  test('calculateApprovalProgress handles empty and standard cases', () => {
    expect(calculateApprovalProgress(createRequest({ approvalsRequired: 0 }))).toBe(0)
    expect(calculateApprovalProgress(createRequest({ approvalsRequired: 3, approvalsReceived: 1 }))).toBe(33)
    expect(calculateApprovalProgress(createRequest({ approvalsRequired: 4, approvalsReceived: 3 }))).toBe(75)
  })

  test('formatApprovalRequiredResponse includes derived progress fields', () => {
    const request = createRequest({ approvalsRequired: 4, approvalsReceived: 2 })
    const response = formatApprovalRequiredResponse(request)

    expect(response.success).toBe(true)
    expect(response.approvalRequired).toBe(true)
    expect(response.requestId).toBe('apr-1')
    expect(response.data?.progress).toBe(50)
    expect(String(response.message)).toContain('Requires 4 approval(s)')
  })

  test('formatApprovalRequiredResponse marks approved requests as auto-approved completion', () => {
    const request = createRequest({
      status: 'approved',
      approvalsRequired: 2,
      approvalsReceived: 2,
    })

    const response = formatApprovalRequiredResponse(request)

    expect(response.success).toBe(true)
    expect(response.approvalRequired).toBe(false)
    expect(response.autoApproved).toBe(true)
    expect(response.requestId).toBe('apr-1')
    expect(response.data?.status).toBe('approved')
    expect(String(response.message)).toContain('auto-approved')
  })

  test('formatDirectExecutionResponse returns default and custom messages', () => {
    expect(formatDirectExecutionResponse({ ok: true })).toEqual({
      success: true,
      approvalRequired: false,
      data: { ok: true },
      message: 'Operation completed successfully',
    })

    expect(formatDirectExecutionResponse({ ok: true }, 'Done')).toEqual({
      success: true,
      approvalRequired: false,
      data: { ok: true },
      message: 'Done',
    })
  })

  test('extractPendingData returns payload and null on getter failure', () => {
    expect(extractPendingData<{ id: string }>(createRequest({ requestData: { id: 'abc' } }))).toEqual({ id: 'abc' })

    const requestWithThrowingGetter: Record<string, unknown> = createRequest()
    Object.defineProperty(requestWithThrowingGetter, 'requestData', {
      get() {
        throw new Error('boom')
      },
    })

    expect(extractPendingData(requestWithThrowingGetter as any)).toBeNull()
    expect(errorCalls.length).toBe(1)
  })

  test('build approval title/description and permission codes', () => {
    expect(buildApprovalTitle('create', 'user')).toBe('Create User')
    expect(buildApprovalTitle('update', 'role', 'Approver')).toBe('Update Role: Approver')

    const description = buildApprovalDescription('update', 'user', {
      email: 'user@iaf.co.id',
      password: 'secret',
      passwordHash: 'hash',
      mfaSecret: 'mfa',
      role: 'MAKER',
      active: true,
      department: 'Risk',
      position: 'Officer',
      phone: '0811',
      extra: 'x',
    })
    expect(description).toContain('update user with changes:')
    expect(description).toContain('email')
    expect(description).not.toContain('password')
    expect(description).not.toContain('passwordHash')
    expect(description).not.toContain('mfaSecret')

    expect(buildApprovalPermission('Role Assignment', 'delete')).toBe('approval.role_assignment.delete')
    expect(buildOperationPermission('product_parameter', 'create')).toBe('banking.parameter.product.create')
    expect(buildOperationPermission('my_custom_entity', 'update')).toBe('banking.my.custom.entity.update')
  })

  test('hasApprovalPermission and hasOperationPermission support canonical and legacy matching', () => {
    expect(hasApprovalPermission(['approval.role.create'], 'role', 'create')).toBe(true)
    expect(hasApprovalPermission(['approval.all'], 'role', 'create')).toBe(true)
    expect(hasApprovalPermission(['approval.user.update'], 'role', 'create')).toBe(false)

    expect(hasOperationPermission(['banking.parameter.product.create'], 'product_parameter', 'create')).toBe(true)
    expect(hasOperationPermission(['operation.product_parameter.create'], 'product_parameter', 'create')).toBe(true)
    expect(hasOperationPermission(['banking.parameter.product.update'], 'product_parameter', 'create')).toBe(false)
  })

  test('validation and expiration guards work correctly', () => {
    expect(validateApproverNotRequester('u-1', 'u-2')).toBe(true)
    expect(validateApproverNotRequester('u-1', 'u-1')).toBe(false)

    expect(isApprovalExpired(createRequest({ expiresAt: null }))).toBe(false)
    expect(isApprovalExpired(createRequest({ expiresAt: new Date(Date.now() - 10_000) }))).toBe(true)
    expect(isApprovalExpired(createRequest({ expiresAt: new Date(Date.now() + 10_000) }))).toBe(false)

    expect(canProcessApproval(createRequest())).toEqual({ canProcess: true })
    expect(canProcessApproval(createRequest({ status: 'approved' }))).toEqual({
      canProcess: false,
      reason: 'Request is already approved',
    })
    expect(canProcessApproval(createRequest({ expiresAt: new Date(Date.now() - 10_000) }))).toEqual({
      canProcess: false,
      reason: 'Request has expired',
    })
  })

  test('strict four-eyes defaults and env override behavior', () => {
    process.env.APPROVAL_STRICT_FOUR_EYES = undefined
    expect(requiresStrictFourEyes('role')).toBe(true)
    expect(requiresStrictFourEyes('parameter')).toBe(false)

    process.env.APPROVAL_STRICT_FOUR_EYES = 'false'
    expect(requiresStrictFourEyes('role')).toBe(false)
  })

  test('default strict routing contains expected checker and approver levels', () => {
    const routing = buildDefaultFourEyesRouting('role')
    expect(routing.length).toBe(2)
    expect(routing[0].requiredRoleCodes).toContain('CHECKER')
    expect(routing[1].requiredRoleCodes).toContain('APPROVER')
  })

  test('shouldAutoApprove respects strict mode, matrix rules, bypass and approval permissions', () => {
    process.env.APPROVAL_STRICT_FOUR_EYES = 'true'
    expect(shouldAutoApprove({} as any, ['approval.all'], 'user', 'create')).toBe(false)

    process.env.APPROVAL_STRICT_FOUR_EYES = 'false'
    expect(shouldAutoApprove(null as any, [], 'parameter', 'create')).toBe(true)

    const matrixWithBypass = {
      autoApprovalRules: { bypassPermissions: ['approval.bypass'] },
    } as any
    expect(shouldAutoApprove(matrixWithBypass, ['approval.bypass'], 'parameter', 'create')).toBe(true)

    const matrixWithImpact = {
      autoApprovalRules: { autoApproveImpactLevels: ['low', 'medium'] },
    } as any
    expect(shouldAutoApprove(matrixWithImpact, [], 'parameter', 'update', 'low')).toBe(true)
    expect(shouldAutoApprove(matrixWithImpact, [], 'parameter', 'update', 'high')).toBe(false)

    expect(shouldAutoApprove({ autoApprovalRules: {} } as any, ['approval.parameter.delete'], 'parameter', 'delete')).toBe(true)
    expect(shouldAutoApprove({ autoApprovalRules: {} } as any, [], 'parameter', 'delete')).toBe(false)
  })

  test('getRequiredApprovalLevel resolves from matrix levels and impact mapping', () => {
    expect(getRequiredApprovalLevel(null as any)).toBe(1)
    expect(getRequiredApprovalLevel({ levels: [] } as any)).toBe(1)

    const matrix = { levels: [{ level: 1 }, { level: 2 }, { level: 3 }] } as any
    expect(getRequiredApprovalLevel(matrix)).toBe(3)
    expect(getRequiredApprovalLevel(matrix, 'low')).toBe(1)
    expect(getRequiredApprovalLevel(matrix, 'medium')).toBe(2)
    expect(getRequiredApprovalLevel(matrix, 'high')).toBe(3)
    expect(getRequiredApprovalLevel(matrix, 'critical')).toBe(3)
    expect(getRequiredApprovalLevel(matrix, 'unknown')).toBe(2)
  })
})
