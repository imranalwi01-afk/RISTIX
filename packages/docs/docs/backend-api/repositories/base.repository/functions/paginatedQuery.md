[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: paginatedQuery()

> **paginatedQuery**\<`T`\>(`queryFn`, `countFn`, `pagination`): `Promise`\<[`PaginatedResult`](../interfaces/PaginatedResult.md)\<`T`\>\>

Defined in: [src/repositories/base.repository.ts:104](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/repositories/base.repository.ts#L104)

Create a paginated query wrapper

## Type Parameters

### T

`T`

## Parameters

### queryFn

() => `Promise`\<`T`[]\>

### countFn

() => `Promise`\<`object`[]\>

### pagination

[`PaginationParams`](../../../lib/react-admin/interfaces/PaginationParams.md)

## Returns

`Promise`\<[`PaginatedResult`](../interfaces/PaginatedResult.md)\<`T`\>\>
