[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: parseFilterParams()

> **parseFilterParams**(`c`): [`FilterParams`](../interfaces/FilterParams.md)

Defined in: [src/lib/react-admin.ts:132](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/lib/react-admin.ts#L132)

Parse filter params from query string
Supports:
- Simple: ?name=John
- Contains: ?name_contains=John
- Greater/Less: ?age_gte=18, ?age_lte=65
- React-admin filter object: ?filter={"name":"John"}

## Parameters

### c

`Context`

## Returns

[`FilterParams`](../interfaces/FilterParams.md)
