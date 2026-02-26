[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: getRoleById()

> **getRoleById**(`roleId`, `tenantId?`): `Effect`\<[`RoleWithPermissions`](../../../repositories/rbac.repository/type-aliases/RoleWithPermissions.md), [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md) \| [`NotFoundError`](../../../lib/errors/classes/NotFoundError.md), `never`\>

Defined in: [src/services/rbac.service.ts:65](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/services/rbac.service.ts#L65)

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
