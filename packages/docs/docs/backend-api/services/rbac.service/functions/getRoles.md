[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: getRoles()

> **getRoles**(`tenantId`, `options?`): `Effect`\<[`PaginatedResult`](../../../repositories/base.repository/interfaces/PaginatedResult.md)\<[`RoleWithPermissions`](../../../repositories/rbac.repository/type-aliases/RoleWithPermissions.md)\>, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

Defined in: [src/services/rbac.service.ts:34](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/services/rbac.service.ts#L34)

Retrieve all roles for a given tenant.

## Parameters

### tenantId

`string`

The unique identifier of the tenant

### options?

Optional filters (includeInactive, bankingType)

#### bankingType?

`string`

#### includeInactive?

`boolean`

#### level?

`string`

#### search?

`string`

#### type?

`string`

## Returns

`Effect`\<[`PaginatedResult`](../../../repositories/base.repository/interfaces/PaginatedResult.md)\<[`RoleWithPermissions`](../../../repositories/rbac.repository/type-aliases/RoleWithPermissions.md)\>, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

An Effect that succeeds with an array of Roles
