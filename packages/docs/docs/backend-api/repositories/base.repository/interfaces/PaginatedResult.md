[**Backend API Reference v1.0.0**](../../../README.md)

***

# Interface: PaginatedResult\<T\>

Defined in: [src/repositories/base.repository.ts:34](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/repositories/base.repository.ts#L34)

Structure of a paginated list of results.

## Type Parameters

### T

`T`

## Properties

### data

> **data**: `T`[]

Defined in: [src/repositories/base.repository.ts:36](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/repositories/base.repository.ts#L36)

The array of data for the current page

***

### limit

> **limit**: `number`

Defined in: [src/repositories/base.repository.ts:42](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/repositories/base.repository.ts#L42)

Number of items per page

***

### page

> **page**: `number`

Defined in: [src/repositories/base.repository.ts:40](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/repositories/base.repository.ts#L40)

Current page index

***

### total

> **total**: `number`

Defined in: [src/repositories/base.repository.ts:38](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/repositories/base.repository.ts#L38)

Total number of records matching the query
