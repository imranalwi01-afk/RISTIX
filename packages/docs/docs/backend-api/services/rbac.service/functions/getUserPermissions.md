[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: getUserPermissions()

> **getUserPermissions**(`userId`, `tenantId`): `Effect`\<`Record`\<`string`, `string`[]\>, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>

Defined in: [src/services/rbac.service.ts:316](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/services/rbac.service.ts#L316)

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
