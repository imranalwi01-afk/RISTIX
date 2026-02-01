[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: getUserPermissions()

> **getUserPermissions**(`userId`, `tenantId`): `Effect`\<`Record`\<`string`, `string`[]\>, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>

Defined in: [packages/new-backend/src/services/rbac.service.ts:316](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/services/rbac.service.ts#L316)

Aggregates and groups all permissions granted to a user across all their roles.

## Parameters

### userId

`string`

The unique identifier of the user

### tenantId

`string`

The unique identifier of the tenant

## Returns

`Effect`\<`Record`\<`string`, `string`[]\>, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>

An Effect that succeeds with a Record of resource-to-actions mappings
