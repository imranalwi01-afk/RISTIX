[**Backend API Reference v1.0.0**](../../../README.md)

***

# Interface: PaginatedResult\<T\>

Defined in: [packages/new-backend/src/repositories/base.repository.ts:34](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/repositories/base.repository.ts#L34)

Structure of a paginated list of results.

## Type Parameters

### T

`T`

## Properties

### data

> **data**: `T`[]

Defined in: [packages/new-backend/src/repositories/base.repository.ts:36](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/repositories/base.repository.ts#L36)

The array of data for the current page

***

### limit

> **limit**: `number`

Defined in: [packages/new-backend/src/repositories/base.repository.ts:42](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/repositories/base.repository.ts#L42)

Number of items per page

***

### page

> **page**: `number`

Defined in: [packages/new-backend/src/repositories/base.repository.ts:40](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/repositories/base.repository.ts#L40)

Current page index

***

### total

> **total**: `number`

Defined in: [packages/new-backend/src/repositories/base.repository.ts:38](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/repositories/base.repository.ts#L38)

Total number of records matching the query
