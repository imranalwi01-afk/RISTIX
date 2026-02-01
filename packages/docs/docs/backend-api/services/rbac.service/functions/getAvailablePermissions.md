[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: getAvailablePermissions()

> **getAvailablePermissions**(`tenantId`): `Effect`\<`object`[], [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

Defined in: [packages/new-backend/src/services/rbac.service.ts:372](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/services/rbac.service.ts#L372)

Get all available permissions with approval metadata

## Parameters

### tenantId

`string`

The unique identifier of the tenant

## Returns

`Effect`\<`object`[], [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

An Effect that succeeds with an array of Permissions with approval info
