[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: updateRolePermissions()

> **updateRolePermissions**(`roleId`, `permissionIds`, `tenantId?`): `Effect`\<[`RoleWithPermissions`](../../../repositories/rbac.repository/type-aliases/RoleWithPermissions.md), [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md) \| [`NotFoundError`](../../../lib/errors/classes/NotFoundError.md), `never`\>

Defined in: [packages/new-backend/src/services/rbac.service.ts:352](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/services/rbac.service.ts#L352)

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
