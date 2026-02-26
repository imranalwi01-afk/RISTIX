[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: updateRolePermissions()

> **updateRolePermissions**(`roleId`, `permissionIds`, `tenantId?`): `Effect`\<[`RoleWithPermissions`](../../../repositories/rbac.repository/type-aliases/RoleWithPermissions.md), [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md) \| [`NotFoundError`](../../../lib/errors/classes/NotFoundError.md), `never`\>

Defined in: [src/services/rbac.service.ts:379](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/services/rbac.service.ts#L379)

Update permissions for a specific role by replacing all existing role-permission associations.

## Parameters

### roleId

`string`

The unique identifier of the role

### permissionIds

`string`[]

Array of permission IDs to assign to the role

### tenantId?

`string`

Optional tenant ID for database resolution

## Returns

`Effect`\<[`RoleWithPermissions`](../../../repositories/rbac.repository/type-aliases/RoleWithPermissions.md), [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md) \| [`NotFoundError`](../../../lib/errors/classes/NotFoundError.md), `never`\>

An Effect that succeeds with the updated Role
