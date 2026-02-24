[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: hasPermission()

> **hasPermission**(`userId`, `tenantId`, `resource`, `action`): `Effect`\<`boolean`, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>

Defined in: [src/services/rbac.service.ts:294](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/services/rbac.service.ts#L294)

Check if a user possesses a specific permission for a resource and action.

## Parameters

### userId

`string`

The unique identifier of the user

### tenantId

`string`

The unique identifier of the tenant

### resource

`string`

The resource identifier (e.g., 'users', 'roles')

### action

`string`

The action identifier (e.g., 'read', 'write', '*')

## Returns

`Effect`\<`boolean`, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>

An Effect that succeeds with a boolean flag
