import { describe, expect, test } from 'bun:test'
import { handleEffectError } from '@/lib/effect/runtime'
import { buildErrorResponse } from '@/lib/http/error-response'
import {
  AuthenticationError,
  AuthorizationError,
  BusinessError,
  ConflictError,
  DatabaseError,
  NotFoundError,
  ValidationError,
} from '@/lib/errors'

const createMockContext = () =>
  ({
    req: {
      path: '/api/v1/test',
      method: 'POST',
    },
    get: (key: string) => (key === 'requestId' ? 'req-contract-456' : undefined),
    json: (payload: unknown, status?: number) =>
      new Response(JSON.stringify(payload), {
        status: status ?? 200,
        headers: { 'content-type': 'application/json' },
      }),
  }) as any

const readJson = async (response: Response) => response.json()

describe('error response contract', () => {
  test('buildErrorResponse attaches envelope metadata', () => {
    const payload = buildErrorResponse(createMockContext(), {
      error: 'Nope',
      message: 'Nope',
      code: 'BAD_REQUEST',
      details: { field: 'name' },
    })

    expect(payload).toMatchObject({
      success: false,
      error: 'Nope',
      message: 'Nope',
      code: 'BAD_REQUEST',
      requestId: 'req-contract-456',
      details: { field: 'name' },
    })
    expect(typeof payload.timestamp).toBe('string')
    expect(Number.isNaN(Date.parse(String(payload.timestamp)))).toBe(false)
  })

  test('maps 400/401/403/404/409/422/500 with consistent payload shape', async () => {
    const c = createMockContext()

    const cases: Array<{
      label: string
      status: number
      cause: unknown
      expectedCode: string
      expectedMessage: string
    }> = [
      {
        label: '400 validation',
        status: 400,
        cause: { _tag: 'Fail', error: new ValidationError({ message: 'Invalid field', field: 'email', errors: ['email is invalid'] }) },
        expectedCode: 'VALIDATION_ERROR',
        expectedMessage: 'Invalid field',
      },
      {
        label: '401 auth',
        status: 401,
        cause: { _tag: 'Fail', error: new AuthenticationError({ message: 'Missing token', reason: 'missing_token' }) },
        expectedCode: 'UNAUTHENTICATED',
        expectedMessage: 'Missing token',
      },
      {
        label: '403 authz',
        status: 403,
        cause: { _tag: 'Fail', error: new AuthorizationError({ message: 'Denied', requiredPermission: 'users.read' }) },
        expectedCode: 'UNAUTHORIZED',
        expectedMessage: 'Denied',
      },
      {
        label: '404 not found',
        status: 404,
        cause: { _tag: 'Fail', error: new NotFoundError({ message: 'Role not found', resource: 'Role', id: 'r-1' }) },
        expectedCode: 'NOT_FOUND',
        expectedMessage: 'Role with id r-1 not found',
      },
      {
        label: '409 conflict',
        status: 409,
        cause: { _tag: 'Fail', error: new ConflictError({ message: 'Duplicate role', resource: 'Role', field: 'role_code' }) },
        expectedCode: 'CONFLICT',
        expectedMessage: 'Duplicate role',
      },
      {
        label: '422 business',
        status: 422,
        cause: { _tag: 'Fail', error: new BusinessError({ message: 'Rule violation', code: 'RULE_VIOLATION' }) },
        expectedCode: 'RULE_VIOLATION',
        expectedMessage: 'Rule violation',
      },
      {
        label: '500 database',
        status: 500,
        cause: { _tag: 'Fail', error: new DatabaseError({ message: 'DB offline', operation: 'query' }) },
        expectedCode: 'DB_ERROR',
        expectedMessage: 'DB offline',
      },
    ]

    for (const item of cases) {
      const response = handleEffectError(c, item.cause)
      const payload = await readJson(response)

      expect(response.status, item.label).toBe(item.status)
      expect(payload, item.label).toMatchObject({
        success: false,
        code: item.expectedCode,
        error: item.expectedMessage,
        message: item.expectedMessage,
        requestId: 'req-contract-456',
      })
      expect(typeof payload.timestamp, item.label).toBe('string')
      expect(Number.isNaN(Date.parse(payload.timestamp)), item.label).toBe(false)
    }
  })
})
