[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: buildOrderBy()

> **buildOrderBy**\<`TTable`\>(`table`, `sort?`, `order?`): `SQL`\<`unknown`\> \| `undefined`

Defined in: [src/repositories/base.repository.ts:77](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/repositories/base.repository.ts#L77)

Build a Drizzle-ORM orderBy clause from sorting parameters.

## Type Parameters

### TTable

`TTable` *extends* `PgTable`\<`TableConfig`\>

## Parameters

### table

`TTable`

The Drizzle table object

### sort?

`string`

Column name to sort by

### order?

Sort direction ('asc' or 'desc')

`"asc"` | `"desc"`

## Returns

`SQL`\<`unknown`\> \| `undefined`

A Drizzle SQL ordering expression or undefined if sort is missing/invalid
