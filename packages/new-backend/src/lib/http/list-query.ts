import type { Context } from 'hono'

export type ListSortDirection = 'asc' | 'desc'
export type PaginationMode = 'offset' | 'cursor'

export type ListSort = {
    field: string
    direction: ListSortDirection
}

export type ListFilterType = 'text' | 'date' | 'number' | 'enum' | 'boolean'
export type ListFilterOperator = 'contains' | 'equals' | 'from' | 'to' | 'min' | 'max'

export type ListFilterOption = {
    label: string
    value: string | number | boolean
}

export type ListFilterDefinition = {
    field: string
    label?: string
    type: ListFilterType
    operators?: ListFilterOperator[]
    options?: ListFilterOption[]
}

export type ListQuery = {
    page?: number
    offset?: number
    limit: number
    cursor?: string
    search?: string
    filters: Record<string, string | number | boolean | string[]>
    sort: ListSort[]
    paginationMode: PaginationMode
}

export type ListQueryConfig = {
    paginationMode?: PaginationMode
    defaultLimit?: number
    maxLimit?: number
    defaultSort?: ListSort[]
    searchableColumns?: string[]
    filterableColumns?: string[]
    filterDefinitions?: Record<string, ListFilterDefinition>
    sortableColumns?: string[]
    filterAliases?: Record<string, string>
}

export type ListPagination =
    | {
        mode: 'offset'
        limit: number
        total: number
        page: number
        offset: number
        totalPages: number
        hasNextPage: boolean
        hasPreviousPage: boolean
        nextCursor: null
        previousCursor: null
    }
    | {
        mode: 'cursor'
        limit: number
        total?: number
        page?: number
        offset?: number
        totalPages?: number
        nextCursor: string | null
        previousCursor: string | null
        hasNextPage: boolean
        hasPreviousPage: boolean
    }

export type ListResponse<T> = {
    success: true
    data: T[]
    pagination: ListPagination
    appliedQuery: {
        search?: string
        filters: Record<string, unknown>
        sort: ListSort[]
    }
    filterDefinitions?: Record<string, ListFilterDefinition>
}

export class ListQueryValidationError extends Error {
    details: Array<{ field: string; message: string; allowed?: string[] }>

    constructor(message: string, details: Array<{ field: string; message: string; allowed?: string[] }>) {
        super(message)
        this.name = 'ListQueryValidationError'
        this.details = details
    }
}

const DEFAULT_LIMIT = 25
const DEFAULT_MAX_LIMIT = 200

function firstValue(value: string | string[] | undefined): string | undefined {
    return Array.isArray(value) ? value[0] : value
}

function parsePositiveInt(value: string | undefined, fallback: number): number {
    const parsed = Number(value)
    if (!Number.isFinite(parsed) || parsed < 1) return fallback
    return Math.floor(parsed)
}

function parseOffset(value: string | undefined): number | undefined {
    if (value === undefined) return undefined
    const parsed = Number(value)
    if (!Number.isFinite(parsed) || parsed < 0) return undefined
    return Math.floor(parsed)
}

function coerceFilterValue(value: unknown): string | number | boolean | string[] {
    if (Array.isArray(value)) return value.map(String)
    if (typeof value === 'boolean' || typeof value === 'number') return value
    if (typeof value !== 'string') return String(value)
    if (value === 'true') return true
    if (value === 'false') return false
    if (value.toLowerCase() === 'yes') return true
    if (value.toLowerCase() === 'no') return false
    return value
}

function safeJsonParse(value: string | undefined): unknown {
    if (!value) return undefined
    try {
        return JSON.parse(value)
    } catch {
        return undefined
    }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
    return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function parseSortFromString(value: string | undefined): ListSort[] {
    if (!value) return []
    const parsed = safeJsonParse(value)
    if (Array.isArray(parsed)) {
        return parsed
            .map((item) => {
                if (!item || typeof item !== 'object') return undefined
                const field = String((item as any).field ?? '')
                const direction = String((item as any).direction ?? (item as any).sort ?? '').toLowerCase()
                if (!field || (direction !== 'asc' && direction !== 'desc')) return undefined
                return { field, direction: direction as ListSortDirection }
            })
            .filter(Boolean) as ListSort[]
    }

    return value
        .split(',')
        .map((chunk) => {
            const [field, rawDirection = 'asc'] = chunk.split(':').map((part) => part.trim())
            const direction = rawDirection.toLowerCase()
            if (!field || (direction !== 'asc' && direction !== 'desc')) return undefined
            return { field, direction: direction as ListSortDirection }
        })
        .filter(Boolean) as ListSort[]
}

function parseFilters(rawQuery: Record<string, string | string[]>, config: ListQueryConfig) {
    const filters: Record<string, string | number | boolean | string[]> = {}
    const aliases = config.filterAliases ?? {}

    const jsonFilters = safeJsonParse(firstValue(rawQuery.filters) ?? firstValue(rawQuery.filter))
    if (isPlainObject(jsonFilters)) {
        for (const [rawKey, value] of Object.entries(jsonFilters as Record<string, unknown>)) {
            if (isPlainObject(value)) {
                for (const [operator, nestedValue] of Object.entries(value)) {
                    const nestedKey = `${rawKey}.${operator}`
                    const key = aliases[nestedKey] ?? nestedKey
                    filters[key] = coerceFilterValue(nestedValue)
                }
                continue
            }
            const key = aliases[rawKey] ?? rawKey
            filters[key] = coerceFilterValue(value)
        }
    }

    for (const [rawKey, rawValue] of Object.entries(rawQuery)) {
        const nestedMatch = rawKey.match(/^filter\[([^\]]+)]\[([^\]]+)]$/)
        const bracketMatch = rawKey.match(/^filter\[([^\]]+)]$/)
        const rawFilterKey = nestedMatch ? `${nestedMatch[1]}.${nestedMatch[2]}` : bracketMatch?.[1]
        if (!rawFilterKey) continue
        const key = aliases[rawFilterKey] ?? rawFilterKey
        const value = firstValue(rawValue)
        if (value !== undefined && value !== '') {
            filters[key] = coerceFilterValue(value)
        }
    }

    const directFilterKeys = new Set([
        ...(config.filterableColumns ?? []),
        ...Object.keys(config.filterDefinitions ?? {}).filter((key) => !key.includes('.')),
    ])

    for (const key of directFilterKeys) {
        const rawValue = firstValue(rawQuery[key])
        if (rawValue !== undefined && rawValue !== '') {
            filters[key] = coerceFilterValue(rawValue)
        }
    }

    for (const [rawKey, canonicalKey] of Object.entries(aliases)) {
        const rawValue = firstValue(rawQuery[rawKey])
        if (rawValue !== undefined && rawValue !== '') {
            filters[canonicalKey] = coerceFilterValue(rawValue)
        }
    }

    return filters
}

function getFilterDefinition(config: ListQueryConfig, filterKey: string) {
    const definitions = config.filterDefinitions ?? {}
    const [baseField] = filterKey.split('.')
    return definitions[filterKey] ?? definitions[baseField]
}

function getAllowedRangeOperators(type: ListFilterType): ListFilterOperator[] {
    if (type === 'date') return ['equals', 'from', 'to']
    if (type === 'number') return ['equals', 'min', 'max']
    if (type === 'enum' || type === 'boolean') return ['equals']
    return ['contains', 'equals']
}

function validateFilterDefinitions(
    filters: Record<string, string | number | boolean | string[]>,
    config: ListQueryConfig,
) {
    const details: Array<{ field: string; message: string; allowed?: string[] }> = []
    if (!config.filterDefinitions) return details

    for (const [key, value] of Object.entries(filters)) {
        const definition = getFilterDefinition(config, key)
        if (!definition) continue

        const operator = key.includes('.') ? key.split('.').at(-1)! as ListFilterOperator : 'equals'
        const allowedOperators = definition.operators ?? getAllowedRangeOperators(definition.type)
        if (!allowedOperators.includes(operator)) {
            details.push({
                field: `filters.${key}`,
                message: `Operator ${operator} is not valid for ${definition.type} filter`,
                allowed: allowedOperators,
            })
            continue
        }

        if (definition.type === 'date') {
            const values = Array.isArray(value) ? value : [value]
            for (const item of values) {
                const text = String(item)
                if (!/^\d{4}-\d{2}-\d{2}$/.test(text) || Number.isNaN(Date.parse(text))) {
                    details.push({ field: `filters.${key}`, message: 'Date filter must use YYYY-MM-DD format' })
                    break
                }
            }
        }

        if (definition.type === 'number') {
            const values = Array.isArray(value) ? value : [value]
            for (const item of values) {
                if (!Number.isFinite(Number(item))) {
                    details.push({ field: `filters.${key}`, message: 'Number filter must be numeric' })
                    break
                }
            }
        }

        if (definition.type === 'boolean' && typeof value !== 'boolean') {
            details.push({ field: `filters.${key}`, message: 'Boolean filter must be true/false or yes/no', allowed: ['true', 'false', 'yes', 'no'] })
        }

        if (definition.type === 'enum' && definition.options?.length) {
            const allowed = definition.options.map((option) => String(option.value))
            const values = Array.isArray(value) ? value : [value]
            const invalid = values.find((item) => !allowed.includes(String(item)))
            if (invalid !== undefined) {
                details.push({ field: `filters.${key}`, message: 'Enum filter value is not allowed', allowed })
            }
        }
    }

    return details
}

export function parseListQuery(c: Context, config: ListQueryConfig = {}): ListQuery {
    const rawQuery = c.req.query() as Record<string, string | string[]>
    const defaultLimit = config.defaultLimit ?? DEFAULT_LIMIT
    const maxLimit = config.maxLimit ?? DEFAULT_MAX_LIMIT
    const requestedLimit = parsePositiveInt(firstValue(rawQuery.limit), defaultLimit)
    const limit = Math.min(requestedLimit, maxLimit)
    const page = parsePositiveInt(firstValue(rawQuery.page), 1)
    const explicitOffset = parseOffset(firstValue(rawQuery.offset))
    const offset = explicitOffset ?? ((page - 1) * limit)
    const cursor = firstValue(rawQuery.cursor)
    const requestedMode = firstValue(rawQuery.paginationMode)
    const paginationMode: PaginationMode = requestedMode === 'cursor' || cursor
        ? 'cursor'
        : config.paginationMode ?? 'offset'
    const search = firstValue(rawQuery.search)?.trim() || undefined

    const sort = parseSortFromString(firstValue(rawQuery.sort))
    const sortField = firstValue(rawQuery.sortField) ?? firstValue(rawQuery._sort)
    const sortOrder = (firstValue(rawQuery.sortOrder) ?? firstValue(rawQuery.order) ?? firstValue(rawQuery._order) ?? 'asc').toLowerCase()
    if (sort.length === 0 && sortField) {
        sort.push({
            field: sortField,
            direction: sortOrder === 'desc' ? 'desc' : 'asc',
        })
    }
    if (sort.length === 0 && config.defaultSort?.length) {
        sort.push(...config.defaultSort)
    }

    const filters = parseFilters(rawQuery, config)
    const details: Array<{ field: string; message: string; allowed?: string[] }> = []

    if (requestedMode && requestedMode !== 'offset' && requestedMode !== 'cursor') {
        details.push({ field: 'paginationMode', message: 'Unsupported pagination mode', allowed: ['offset', 'cursor'] })
    }

    if (paginationMode !== (config.paginationMode ?? paginationMode) && config.paginationMode && !cursor) {
        details.push({ field: 'paginationMode', message: `Endpoint only supports ${config.paginationMode} pagination`, allowed: [config.paginationMode] })
    }

    const sortable = new Set(config.sortableColumns ?? [])
    if (sortable.size > 0) {
        for (const item of sort) {
            if (!sortable.has(item.field)) {
                details.push({ field: `sort.${item.field}`, message: 'Field is not sortable', allowed: [...sortable] })
            }
        }
    }

    const filterable = new Set([
        ...(config.filterableColumns ?? []),
        ...Object.keys(config.filterDefinitions ?? {}),
    ])
    if (filterable.size > 0) {
        for (const key of Object.keys(filters)) {
            const baseKey = key.split('.')[0]
            if (!filterable.has(key) && !filterable.has(baseKey)) {
                details.push({ field: `filters.${key}`, message: 'Field is not filterable', allowed: [...filterable] })
            }
        }
    }

    details.push(...validateFilterDefinitions(filters, config))

    if (details.length > 0) {
        throw new ListQueryValidationError('Invalid list query', details)
    }

    return {
        page,
        offset,
        limit,
        cursor,
        search,
        filters,
        sort,
        paginationMode,
    }
}

export function buildOffsetPagination(query: ListQuery, total: number): ListPagination {
    const page = query.page ?? Math.floor((query.offset ?? 0) / query.limit) + 1
    const offset = query.offset ?? ((page - 1) * query.limit)
    const totalPages = Math.ceil(total / query.limit)

    return {
        mode: 'offset',
        limit: query.limit,
        total,
        page,
        offset,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
        nextCursor: null,
        previousCursor: null,
    }
}

export function buildCursorPagination(query: ListQuery, meta: {
    nextCursor?: string | null
    previousCursor?: string | null
    hasNextPage?: boolean
    hasPreviousPage?: boolean
    total?: number
}): ListPagination {
    return {
        mode: 'cursor',
        limit: query.limit,
        total: meta.total,
        nextCursor: meta.nextCursor ?? null,
        previousCursor: meta.previousCursor ?? null,
        hasNextPage: meta.hasNextPage ?? Boolean(meta.nextCursor),
        hasPreviousPage: meta.hasPreviousPage ?? Boolean(meta.previousCursor),
    }
}

export function buildListResponse<T>(
    data: T[],
    query: ListQuery,
    pagination: ListPagination,
    metadata?: { filterDefinitions?: Record<string, ListFilterDefinition> },
): ListResponse<T> {
    return {
        success: true,
        data,
        pagination,
        appliedQuery: {
            search: query.search,
            filters: query.filters,
            sort: query.sort,
        },
        ...(metadata?.filterDefinitions ? { filterDefinitions: metadata.filterDefinitions } : {}),
    }
}

export function encodeCursor(payload: Record<string, unknown>): string {
    return Buffer.from(JSON.stringify(payload)).toString('base64url')
}

export function decodeCursor<T extends Record<string, unknown> = Record<string, unknown>>(cursor?: string): T | null {
    if (!cursor) return null
    try {
        const raw = Buffer.from(cursor, 'base64url').toString('utf8')
        const parsed = JSON.parse(raw)
        return parsed && typeof parsed === 'object' ? parsed as T : null
    } catch {
        throw new ListQueryValidationError('Invalid cursor', [
            { field: 'cursor', message: 'Cursor must be an opaque cursor returned by the previous response' },
        ])
    }
}
