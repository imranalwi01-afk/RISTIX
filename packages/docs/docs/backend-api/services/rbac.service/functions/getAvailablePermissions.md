[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: getAvailablePermissions()

> **getAvailablePermissions**(`tenantId`): `Effect`\<`object`[], [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

Defined in: [src/services/rbac.service.ts:399](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/services/rbac.service.ts#L399)

Get all available permissions with approval metadata

## Parameters

### tenantId

`string`

The unique identifier of the tenant

## Returns

`Effect`\<`object`[], [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

An Effect that succeeds with an array of Permissions with approval info
