[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: parseSortField()

> **parseSortField**(`sort`): `object`

Defined in: [src/lib/react-admin.ts:188](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/lib/react-admin.ts#L188)

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
