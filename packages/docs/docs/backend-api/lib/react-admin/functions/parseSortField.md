[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: parseSortField()

> **parseSortField**(`sort`): `object`

Defined in: [src/lib/react-admin.ts:188](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/lib/react-admin.ts#L188)

Parse sort field with optional direction prefix
Supports: "name", "-name" (desc), "+name" (asc)

## Parameters

### sort

`string`

## Returns

`object`

### direction

> **direction**: [`SortDirection`](../type-aliases/SortDirection.md)

### field

> **field**: `string`
