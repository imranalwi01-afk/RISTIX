[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: getUserRoles()

> **getUserRoles**(`userId`, `tenantId`): `Effect`\<`object` & `object`[], [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

Defined in: [src/services/rbac.service.ts:191](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/services/rbac.service.ts#L191)

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
