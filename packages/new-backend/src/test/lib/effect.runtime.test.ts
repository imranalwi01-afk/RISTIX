import { describe, expect, test } from 'bun:test'
import { Effect } from 'effect'
import {
  runEffect,
  handleEffectError,
  dbOperation,
  validate,
} from '@/lib/effect/runtime'
import {
  AuthenticationError,
  AuthorizationError,
  BusinessError,
  ConflictError,
  DatabaseError,
  NotFoundError,
  RateLimitError,
  ValidationError,
} from '@/lib/errors'

const createMockContext = () =>
  ({
    json: (payload: unknown, status?: number) =>
      new Response(JSON.stringify(payload), {
        status: status ?? 200,
        headers: { 'content-type': 'application/json' },
      }),
  }) as any

const readJson = async (response: Response) => response.json()

describe('effect runtime helpers', () => {
  test('runEffect wraps plain success value in { success, data }', async () => {
    const c = createMockContext()
    const response = await runEffect(c, Effect.succeed({ id: 'u-1' }))
    const payload = await readJson(response)

    expect(response.status).toBe(200)
    expect(payload).toEqual({ success: true, data: { id: 'u-1' } })
  })

  test('runEffect preserves explicit success payload and status resolver', async () => {
    const c = createMockContext()
    const response = await runEffect(
      c,
      Effect.succeed({
        success: true,
        approvalRequired: true,
        requestId: 'req-1',
      }),
      (value: any) => (value.approvalRequired ? 202 : 201)
    )
    const payload = await readJson(response)

    expect(response.status).toBe(202)
    expect(payload).toEqual({
      success: true,
      approvalRequired: true,
      requestId: 'req-1',
    })
  })

  test('runEffect uses fixed status when provided', async () => {
    const c = createMockContext()
    const response = await runEffect(c, Effect.succeed('ok'), 201)
    const payload = await readJson(response)

    expect(response.status).toBe(201)
    expect(payload).toEqual({ success: true, data: 'ok' })
  })

  test('runEffect converts ValidationError to 400 response', async () => {
    const c = createMockContext()
    const response = await runEffect(
      c,
      Effect.fail(
        new ValidationError({
          message: 'Invalid input',
          field: 'email',
          errors: ['Email is required'],
        })
      )
    )
    const payload = await readJson(response)

    expect(response.status).toBe(400)
    expect(payload).toMatchObject({
      success: false,
      code: 'VALIDATION_ERROR',
      message: 'Invalid input',
      details: {
        field: 'email',
      },
    })
  })

  test('handleEffectError maps NotFoundError, auth and authz correctly', async () => {
    const c = createMockContext()

    const notFound = handleEffectError(
      c,
      { _tag: 'Fail', error: new NotFoundError({ resource: 'Role', id: 'r-1' }) } as any
    )
    const notFoundPayload = await readJson(notFound)
    expect(notFound.status).toBe(404)
    expect(notFoundPayload).toMatchObject({ success: false, code: 'NOT_FOUND' })

    const unauthenticated = handleEffectError(
      c,
      {
        _tag: 'Fail',
        error: new AuthenticationError({ message: 'No token', reason: 'missing_token' }),
      } as any
    )
    const unauthPayload = await readJson(unauthenticated)
    expect(unauthenticated.status).toBe(401)
    expect(unauthPayload).toMatchObject({ success: false, code: 'UNAUTHENTICATED' })

    const unauthorized = handleEffectError(
      c,
      {
        _tag: 'Fail',
        error: new AuthorizationError({
          message: 'Denied',
          requiredPermission: 'users.write',
          userId: 'u-1',
        }),
      } as any
    )
    const unauthzPayload = await readJson(unauthorized)
    expect(unauthorized.status).toBe(403)
    expect(unauthzPayload).toMatchObject({ success: false, code: 'UNAUTHORIZED' })
  })

  test('handleEffectError maps BusinessError conflict and non-conflict statuses', async () => {
    const c = createMockContext()

    const conflict = handleEffectError(
      c,
      {
        _tag: 'Fail',
        error: new BusinessError({
          message: 'Already acted',
          code: 'APPROVER_ALREADY_ACTED',
        }),
      } as any
    )
    const conflictPayload = await readJson(conflict)
    expect(conflict.status).toBe(409)
    expect(conflictPayload).toMatchObject({ success: false, code: 'APPROVER_ALREADY_ACTED' })

    const unprocessable = handleEffectError(
      c,
      {
        _tag: 'Fail',
        error: new BusinessError({
          message: 'Rule violation',
          code: 'RULE_VIOLATION',
        }),
      } as any
    )
    const unprocessablePayload = await readJson(unprocessable)
    expect(unprocessable.status).toBe(422)
    expect(unprocessablePayload).toMatchObject({ success: false, code: 'RULE_VIOLATION' })
  })

  test('handleEffectError maps rate limit, conflict and database errors', async () => {
    const c = createMockContext()

    const limited = handleEffectError(
      c,
      {
        _tag: 'Fail',
        error: new RateLimitError({ message: 'Too many requests', retryAfter: 60 }),
      } as any
    )
    const limitedPayload = await readJson(limited)
    expect(limited.status).toBe(429)
    expect(limitedPayload).toMatchObject({ success: false, code: 'RATE_LIMITED' })

    const conflict = handleEffectError(
      c,
      {
        _tag: 'Fail',
        error: new ConflictError({ message: 'Duplicate', resource: 'Role', field: 'name' }),
      } as any
    )
    const conflictPayload = await readJson(conflict)
    expect(conflict.status).toBe(409)
    expect(conflictPayload).toMatchObject({ success: false, code: 'CONFLICT', message: 'Duplicate' })

    const database = handleEffectError(
      c,
      {
        _tag: 'Fail',
        error: new DatabaseError({ message: 'boom', operation: 'query' }),
      } as any
    )
    const dbPayload = await readJson(database)
    expect(database.status).toBe(500)
    expect(dbPayload).toMatchObject({ success: false, code: 'DB_ERROR' })
  })

  test('handleEffectError handles unknown and direct-tag cause shapes', async () => {
    const c = createMockContext()

    const directTag = handleEffectError(
      c,
      new ValidationError({
        message: 'Bad request',
        errors: ['invalid'],
      }) as any
    )
    expect(directTag.status).toBe(400)

    const unknown = handleEffectError(c, 'unknown-cause')
    const unknownPayload = await readJson(unknown)
    expect(unknown.status).toBe(500)
    expect(unknownPayload).toEqual({ success: false, error: 'Internal server error' })
  })

  test('dbOperation returns success and wraps thrown errors', async () => {
    const success = await Effect.runPromise(dbOperation('query', async () => 42))
    expect(success).toBe(42)

    const failed = await Effect.runPromiseExit(
      dbOperation('insert', async () => {
        throw new Error('cannot insert')
      })
    )
    expect(failed._tag).toBe('Failure')
    expect(String(failed.cause)).toContain('cannot insert')
  })

  test('validate returns parsed value and ValidationError on invalid input', async () => {
    const schema = {
      safeParse: (data: unknown) => {
        const value = data as { name?: string }
        if (value?.name) return { success: true as const, data: value }
        return {
          success: false as const,
          error: { errors: [{ message: 'name required', path: ['name'] }] },
        }
      },
    }

    const parsed = await Effect.runPromise(validate(schema, { name: 'IAF' }))
    expect(parsed).toEqual({ name: 'IAF' })

    const failed = await Effect.runPromiseExit(validate(schema, {}))
    expect(failed._tag).toBe('Failure')
    expect(String(failed.cause)).toContain('ValidationError')
  })
})
