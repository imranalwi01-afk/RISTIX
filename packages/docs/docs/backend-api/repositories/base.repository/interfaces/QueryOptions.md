[**Backend API Reference v1.0.0**](../../../README.md)

***

# Interface: QueryOptions

Defined in: [src/repositories/base.repository.ts:22](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/repositories/base.repository.ts#L22)

Common query options for repository methods.

## Extended by

- [`RolesQueryOptions`](../../rbac.repository/interfaces/RolesQueryOptions.md)
- [`PermissionsQueryOptions`](../../rbac.repository/interfaces/PermissionsQueryOptions.md)
- [`UserRolesQueryOptions`](../../rbac.repository/interfaces/UserRolesQueryOptions.md)
- [`TenantsQueryOptions`](../../tenants.repository/interfaces/TenantsQueryOptions.md)
- [`UsersQueryOptions`](../../users.repository/interfaces/UsersQueryOptions.md)

## Properties

### filters?

> `optional` **filters**: [`FilterParams`](../../../lib/react-admin/interfaces/FilterParams.md)

Defined in: [src/repositories/base.repository.ts:26](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/repositories/base.repository.ts#L26)

Filter parameters for searching and narrowing results

***

### includeInactive?

> `optional` **includeInactive**: `boolean`

Defined in: [src/repositories/base.repository.ts:28](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/repositories/base.repository.ts#L28)

Whether to include inactive/deleted records in the results

***

### pagination?

> `optional` **pagination**: [`PaginationParams`](../../../lib/react-admin/interfaces/PaginationParams.md)

Defined in: [src/repositories/base.repository.ts:24](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/repositories/base.repository.ts#L24)

Pagination parameters (page and limit)
