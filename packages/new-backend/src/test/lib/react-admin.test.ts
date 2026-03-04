import { describe, expect, test } from 'bun:test'
import {
  calculateOffset,
  createListResponse,
  createSingleResponse,
  parseFilterParams,
  parsePaginationParams,
  parseSortField,
  reactAdminHeaders,
  sendListResponse,
  sendSingleResponse,
} from '@/lib/react-admin'

const createQueryContext = (query: Record<string, string> = {}) =>
  ({
    req: {
      query: () => query,
    },
  }) as any

const createResponseContext = () => {
  const headers = new Headers()
  return {
    headers,
    context: {
      header: (key: string, value: string) => headers.set(key, value),
      json: (payload: unknown) =>
        new Response(JSON.stringify(payload), {
          status: 200,
          headers,
        }),
      res: new Response(null, { headers }),
    } as any,
  }
}

describe('react-admin utilities', () => {
  test('createListResponse and createSingleResponse shape payloads', () => {
    const list = createListResponse([{ id: 1 }], 10, { page: 2, limit: 5 })
    expect(list).toEqual({
      data: [{ id: 1 }],
      total: 10,
      page: 2,
      limit: 5,
    })

    const single = createSingleResponse({ id: 'u-1' })
    expect(single).toEqual({ data: { id: 'u-1' } })
  })

  test('sendListResponse sets pagination headers and response body', async () => {
    const { context, headers } = createResponseContext()
    const response = sendListResponse(context, [{ id: 1 }], 33, { page: 1, limit: 10 })
    const payload = await response.json()

    expect(headers.get('X-Total-Count')).toBe('33')
    expect(headers.get('Access-Control-Expose-Headers')).toContain('X-Total-Count')
    expect(payload).toEqual({
      data: [{ id: 1 }],
      total: 33,
      page: 1,
      limit: 10,
    })
  })

  test('sendSingleResponse returns wrapped data payload', async () => {
    const { context } = createResponseContext()
    const response = sendSingleResponse(context, { id: 'x' })
    const payload = await response.json()
    expect(payload).toEqual({ data: { id: 'x' } })
  })

  test('parsePaginationParams supports defaults, bounds and react-admin aliases', () => {
    const parsedDefault = parsePaginationParams(createQueryContext())
    expect(parsedDefault).toEqual({ page: 1, limit: 10, sort: undefined, order: 'asc' })

    const parsed = parsePaginationParams(
      createQueryContext({
        page: '-2',
        perPage: '250',
        _sort: 'createdAt',
        _order: 'DESC',
      })
    )
    expect(parsed).toEqual({
      page: 1,
      limit: 100,
      sort: 'createdAt',
      order: 'desc',
    })
  })

  test('calculateOffset computes offset from page and limit', () => {
    expect(calculateOffset(1, 10)).toBe(0)
    expect(calculateOffset(3, 25)).toBe(50)
  })

  test('parseFilterParams merges filter json and direct query params', () => {
    const parsed = parseFilterParams(
      createQueryContext({
        page: '1',
        limit: '10',
        filter: JSON.stringify({ status: 'ACTIVE', minScore: 80 }),
        search: 'maker',
        role: 'ADMIN',
        empty: '',
      })
    )

    expect(parsed).toEqual({
      status: 'ACTIVE',
      minScore: 80,
      search: 'maker',
      role: 'ADMIN',
    })
  })

  test('parseFilterParams ignores invalid filter json safely', () => {
    const parsed = parseFilterParams(
      createQueryContext({
        filter: '{invalid-json}',
        name: 'john',
      })
    )
    expect(parsed).toEqual({ name: 'john' })
  })

  test('reactAdminHeaders appends X-Total-Count when missing', async () => {
    const { context } = createResponseContext()
    context.res.headers.set('Access-Control-Expose-Headers', 'Content-Length')

    await reactAdminHeaders(context, async () => {
      // no-op
    })

    expect(context.res.headers.get('Access-Control-Expose-Headers')).toBe('Content-Length, X-Total-Count')
  })

  test('reactAdminHeaders does not duplicate X-Total-Count when already present', async () => {
    const { context } = createResponseContext()
    context.res.headers.set('Access-Control-Expose-Headers', 'X-Total-Count, Content-Length')

    await reactAdminHeaders(context, async () => {
      // no-op
    })

    expect(context.res.headers.get('Access-Control-Expose-Headers')).toBe('X-Total-Count, Content-Length')
  })

  test('parseSortField supports prefixed and plain sort syntax', () => {
    expect(parseSortField('-createdAt')).toEqual({ field: 'createdAt', direction: 'desc' })
    expect(parseSortField('+name')).toEqual({ field: 'name', direction: 'asc' })
    expect(parseSortField('email')).toEqual({ field: 'email', direction: 'asc' })
  })
})
