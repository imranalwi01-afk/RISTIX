# ADR-0004: React-Admin API Format

**Status:** Accepted  
**Date:** 2025-12-29  
**Decision Makers:** Development Team

---

## Context

The frontend uses [react-admin](https://marmelab.com/react-admin/) for admin interfaces. React-admin's data provider expects specific response formats from the backend API.

## Decision

Implement API responses compatible with react-admin's default data provider expectations.

### Response Formats

```typescript
// List response
{
  data: Item[],
  total: number  // Total count for pagination
}

// Single item response
{
  data: Item
}
```

### Headers

- `X-Total-Count`: Total record count (required for pagination)
- `Access-Control-Expose-Headers: X-Total-Count` (CORS)

### Query Parameters

| Parameter | Description | Example |
|-----------|-------------|---------|
| `page` | Page number (1-indexed) | `?page=1` |
| `limit` / `perPage` | Items per page | `?limit=10` |
| `sort` / `_sort` | Sort field | `?sort=name` |
| `order` / `_order` | Sort direction | `?order=asc` |
| `filter` | JSON filter object | `?filter={"status":"active"}` |

### Implementation

```typescript
// Response helper
export function sendListResponse<T>(
  c: Context,
  data: T[],
  total: number
) {
  c.header('X-Total-Count', total.toString())
  return c.json({ data, total })
}
```

## Consequences

### Positive
- Seamless integration with existing react-admin frontend
- Consistent API format across all resources
- Standard pagination and filtering

### Negative
- Slightly verbose response wrapper (`{data: ...}`)
- Need to maintain compatibility as react-admin evolves

## Related Files

- [react-admin.ts](file:///Users/antoniusjoshua/PARA/Project/personal/ifrs9-iaf/packages/new-backend/src/lib/react-admin.ts)
- [dataProvider.ts](file:///Users/antoniusjoshua/PARA/Project/personal/ifrs9-iaf/packages/frontend/src/admin/providers/data/dataProvider.ts)
