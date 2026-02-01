[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: buildOrderBy()

> **buildOrderBy**\<`TTable`\>(`table`, `sort?`, `order?`): `SQL`\<`unknown`\> \| `undefined`

Defined in: [packages/new-backend/src/repositories/base.repository.ts:77](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/repositories/base.repository.ts#L77)

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
