import { describe, expect, it } from 'bun:test'
import {
    ListQueryValidationError,
    buildCursorPagination,
    buildListResponse,
    buildOffsetPagination,
    decodeCursor,
    encodeCursor,
    parseListQuery,
} from '@/lib/http/list-query'

function contextFromQuery(query: Record<string, string>) {
    return {
        req: {
            query: (key?: string) => key ? query[key] : query,
        },
    } as any
}

describe('list query contract', () => {
    it('parses offset pagination, filters, sort, and clamps limit', () => {
        const query = parseListQuery(contextFromQuery({
            page: '2',
            limit: '999',
            search: 'CF',
            filters: JSON.stringify({ stage: '2' }),
            sort: JSON.stringify([{ field: 'accountNumber', direction: 'asc' }]),
        }), {
            maxLimit: 100,
            filterableColumns: ['stage'],
            sortableColumns: ['accountNumber'],
        })

        expect(query).toMatchObject({
            page: 2,
            offset: 100,
            limit: 100,
            search: 'CF',
            filters: { stage: '2' },
            sort: [{ field: 'accountNumber', direction: 'asc' }],
            paginationMode: 'offset',
        })
    })

    it('rejects invalid filter and sort fields with field-level details', () => {
        expect(() => parseListQuery(contextFromQuery({
            filters: JSON.stringify({ unsafe: 'x' }),
            sort: JSON.stringify([{ field: 'unsafe', direction: 'desc' }]),
        }), {
            filterableColumns: ['stage'],
            sortableColumns: ['accountNumber'],
        })).toThrow(ListQueryValidationError)

        try {
            parseListQuery(contextFromQuery({
                filters: JSON.stringify({ unsafe: 'x' }),
                sort: JSON.stringify([{ field: 'unsafe', direction: 'desc' }]),
            }), {
                filterableColumns: ['stage'],
                sortableColumns: ['accountNumber'],
            })
        } catch (error) {
            expect(error).toBeInstanceOf(ListQueryValidationError)
            expect((error as ListQueryValidationError).details).toEqual([
                expect.objectContaining({ field: 'sort.unsafe' }),
                expect.objectContaining({ field: 'filters.unsafe' }),
            ])
        }
    })

    it('round-trips opaque cursors and builds standard cursor response shape', () => {
        const cursor = encodeCursor({ field: 'pkid', direction: 'asc', sortValue: 10, pkid: '10' })
        expect(decodeCursor(cursor)).toEqual({ field: 'pkid', direction: 'asc', sortValue: 10, pkid: '10' })

        const query = parseListQuery(contextFromQuery({
            paginationMode: 'cursor',
            cursor,
            limit: '10',
        }), {
            sortableColumns: ['pkid'],
        })
        const response = buildListResponse([{ id: 1 }], query, buildCursorPagination(query, {
            nextCursor: cursor,
            hasNextPage: true,
        }))

        expect(response).toMatchObject({
            success: true,
            data: [{ id: 1 }],
            pagination: {
                mode: 'cursor',
                limit: 10,
                nextCursor: cursor,
                hasNextPage: true,
                hasPreviousPage: false,
            },
        })
    })

    it('builds offset pagination with total and totalPages', () => {
        const query = parseListQuery(contextFromQuery({ page: '3', limit: '10' }))
        const pagination = buildOffsetPagination(query, 25)

        expect(pagination).toMatchObject({
            mode: 'offset',
            limit: 10,
            page: 3,
            offset: 20,
            total: 25,
            totalPages: 3,
            hasNextPage: false,
            hasPreviousPage: true,
        })
    })

    it('supports typed date, number, enum, and boolean filters', () => {
        const query = parseListQuery(contextFromQuery({
            filters: JSON.stringify({
                createdAt: { from: '2026-04-01', to: '2026-04-22' },
                amount: { min: '1000', max: '5000' },
                status: 'pending',
                active: 'yes',
            }),
        }), {
            filterDefinitions: {
                createdAt: { field: 'createdAt', type: 'date', operators: ['from', 'to'] },
                amount: { field: 'amount', type: 'number', operators: ['min', 'max'] },
                status: {
                    field: 'status',
                    type: 'enum',
                    options: [{ label: 'Pending', value: 'pending' }],
                },
                active: { field: 'active', type: 'boolean' },
            },
        })

        expect(query.filters).toEqual({
            'createdAt.from': '2026-04-01',
            'createdAt.to': '2026-04-22',
            'amount.min': '1000',
            'amount.max': '5000',
            status: 'pending',
            active: true,
        })
    })

    it('rejects invalid typed filter operators and values', () => {
        expect(() => parseListQuery(contextFromQuery({
            filters: JSON.stringify({
                createdAt: { min: 'not-a-date' },
                amount: { min: 'abc' },
                status: 'unknown',
            }),
        }), {
            filterDefinitions: {
                createdAt: { field: 'createdAt', type: 'date', operators: ['from', 'to'] },
                amount: { field: 'amount', type: 'number', operators: ['min', 'max'] },
                status: {
                    field: 'status',
                    type: 'enum',
                    options: [{ label: 'Pending', value: 'pending' }],
                },
            },
        })).toThrow(ListQueryValidationError)
    })
})
