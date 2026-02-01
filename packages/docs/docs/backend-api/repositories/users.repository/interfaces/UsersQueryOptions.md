[**Backend API Reference v1.0.0**](../../../README.md)

***

# Interface: UsersQueryOptions

Defined in: [packages/new-backend/src/repositories/users.repository.ts:24](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/repositories/users.repository.ts#L24)

Common query options for repository methods.

## Extends

- [`QueryOptions`](../../base.repository/interfaces/QueryOptions.md)

## Properties

### filters?

> `optional` **filters**: [`FilterParams`](../../../lib/react-admin/interfaces/FilterParams.md)

Defined in: [packages/new-backend/src/repositories/base.repository.ts:26](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/repositories/base.repository.ts#L26)

Filter parameters for searching and narrowing results

#### Inherited from

[`QueryOptions`](../../base.repository/interfaces/QueryOptions.md).[`filters`](../../base.repository/interfaces/QueryOptions.md#filters)

***

### includeInactive?

> `optional` **includeInactive**: `boolean`

Defined in: [packages/new-backend/src/repositories/base.repository.ts:28](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/repositories/base.repository.ts#L28)

Whether to include inactive/deleted records in the results

#### Inherited from

[`QueryOptions`](../../base.repository/interfaces/QueryOptions.md).[`includeInactive`](../../base.repository/interfaces/QueryOptions.md#includeinactive)

***

### isActive?

> `optional` **isActive**: `boolean`

Defined in: [packages/new-backend/src/repositories/users.repository.ts:26](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/repositories/users.repository.ts#L26)

***

### pagination?

> `optional` **pagination**: [`PaginationParams`](../../../lib/react-admin/interfaces/PaginationParams.md)

Defined in: [packages/new-backend/src/repositories/base.repository.ts:24](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/repositories/base.repository.ts#L24)

Pagination parameters (page and limit)

#### Inherited from

[`QueryOptions`](../../base.repository/interfaces/QueryOptions.md).[`pagination`](../../base.repository/interfaces/QueryOptions.md#pagination)

***

### search?

> `optional` **search**: `string`

Defined in: [packages/new-backend/src/repositories/users.repository.ts:25](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/repositories/users.repository.ts#L25)
