[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: getRoleById()

> **getRoleById**(`roleId`, `tenantId?`): `Effect`\<[`RoleWithPermissions`](../../../repositories/rbac.repository/type-aliases/RoleWithPermissions.md), [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md) \| [`NotFoundError`](../../../lib/errors/classes/NotFoundError.md), `never`\>

Defined in: [src/services/rbac.service.ts:65](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/services/rbac.service.ts#L65)

Retrieve a single role by its unique ID.

## Parameters

### roleId

`string`

The unique identifier of the role

### tenantId?

`string`

Optional tenant ID to resolve the database

## Returns

`Effect`\<[`RoleWithPermissions`](../../../repositories/rbac.repository/type-aliases/RoleWithPermissions.md), [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md) \| [`NotFoundError`](../../../lib/errors/classes/NotFoundError.md), `never`\>

An Effect that succeeds with the Role if found
