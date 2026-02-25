[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: getUserRoles()

> **getUserRoles**(`userId`, `tenantId`): `Effect`\<`object` & `object`[], [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

Defined in: [src/services/rbac.service.ts:191](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/services/rbac.service.ts#L191)

Retrieve all active roles currently assigned to a user.

## Parameters

### userId

`string`

The unique identifier of the user

### tenantId

`string`

The unique identifier of the tenant

## Returns

`Effect`\<`object` & `object`[], [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

An Effect that succeeds with an array of active UserRole assignments
