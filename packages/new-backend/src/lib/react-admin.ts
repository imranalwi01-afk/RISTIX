import type { Context, MiddlewareHandler } from 'hono'

/**
 * React-Admin compatible response format
 * 
 * React-Admin data provider expects:
 * - getList: { data: Item[], total: number }
 * - getOne: { data: Item }
 * - create/update: { data: Item }
 * - delete: { data: Item }
 * 
 * Additionally, X-Total-Count header for pagination
 */

// =============================================================================
// RESPONSE TYPES
// =============================================================================

export interface ListResponse<T> {
    data: T[]
    total: number
    page?: number
    limit?: number
}

export interface SingleResponse<T> {
    data: T
}

export interface PaginationParams {
    page: number
    limit: number
    sort?: string
    order?: 'asc' | 'desc'
}

export interface FilterParams {
    [key: string]: string | number | boolean | undefined
}

// =============================================================================
// RESPONSE HELPERS
// =============================================================================

/**
 * Create a list response compatible with react-admin
 */
export function createListResponse<T>(
    data: T[],
    total: number,
    pagination?: Partial<PaginationParams>
): ListResponse<T> {
    return {
        data,
        total,
        page: pagination?.page,
        limit: pagination?.limit,
    }
}

/**
 * Create a single item response compatible with react-admin
 */
export function createSingleResponse<T>(data: T): SingleResponse<T> {
    return { data }
}

/**
 * Send a list response with proper headers
 */
export function sendListResponse<T>(
    c: Context,
    data: T[],
    total: number,
    pagination?: Partial<PaginationParams>
) {
    // Set X-Total-Count header for react-admin pagination
    c.header('X-Total-Count', total.toString())
    c.header('Access-Control-Expose-Headers', 'X-Total-Count')

    return c.json(createListResponse(data, total, pagination))
}

/**
 * Send a single item response
 */
export function sendSingleResponse<T>(c: Context, data: T) {
    return c.json(createSingleResponse(data))
}

// =============================================================================
// PAGINATION HELPERS
// =============================================================================

/**
 * Parse pagination params from query string
 * Supports both react-admin format and standard format
 */
export function parsePaginationParams(c: Context): PaginationParams {
    const query = c.req.query()

    // React-admin sends: page (1-indexed), perPage
    // Also support: limit, offset
    const page = parseInt(query.page || '1', 10)
    const limit = parseInt(query.limit || query.perPage || '10', 10)
    const sort = query.sort || query._sort
    const order = (query.order || query._order || 'asc').toLowerCase() as 'asc' | 'desc'

    return {
        page: Math.max(1, page),
        limit: Math.min(100, Math.max(1, limit)),
        sort,
        order,
    }
}

/**
 * Calculate offset from page and limit
 */
export function calculateOffset(page: number, limit: number): number {
    return (page - 1) * limit
}

/**
 * Parse filter params from query string
 * Supports:
 * - Simple: ?name=John
 * - Contains: ?name_contains=John
 * - Greater/Less: ?age_gte=18, ?age_lte=65
 * - React-admin filter object: ?filter={"name":"John"}
 */
export function parseFilterParams(c: Context): FilterParams {
    const query = c.req.query()
    const filters: FilterParams = {}

    // Parse react-admin filter JSON
    if (query.filter) {
        try {
            const filterObj = JSON.parse(query.filter)
            Object.assign(filters, filterObj)
        } catch {
            // Invalid JSON, ignore
        }
    }

    // Parse individual filter params
    const excludeParams = ['page', 'limit', 'perPage', 'sort', 'order', '_sort', '_order', 'filter']

    for (const [key, value] of Object.entries(query)) {
        if (!excludeParams.includes(key) && value !== undefined && value !== '') {
            filters[key] = value
        }
    }

    return filters
}

// =============================================================================
// MIDDLEWARE
// =============================================================================

/**
 * Middleware to set common headers for react-admin compatibility
 */
export const reactAdminHeaders: MiddlewareHandler = async (c, next) => {
    await next()

    // Ensure CORS exposes required headers
    const exposedHeaders = c.res.headers.get('Access-Control-Expose-Headers') || ''
    if (!exposedHeaders.includes('X-Total-Count')) {
        c.res.headers.set(
            'Access-Control-Expose-Headers',
            exposedHeaders ? `${exposedHeaders}, X-Total-Count` : 'X-Total-Count'
        )
    }
}

// =============================================================================
// SORT HELPERS
// =============================================================================

export type SortDirection = 'asc' | 'desc'

/**
 * Parse sort field with optional direction prefix
 * Supports: "name", "-name" (desc), "+name" (asc)
 */
export function parseSortField(sort: string): { field: string; direction: SortDirection } {
    if (sort.startsWith('-')) {
        return { field: sort.slice(1), direction: 'desc' }
    }
    if (sort.startsWith('+')) {
        return { field: sort.slice(1), direction: 'asc' }
    }
    return { field: sort, direction: 'asc' }
}
