[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: getUserRoles()

> **getUserRoles**(`userId`, `tenantId`): `Effect`\<`object` & `object`[], [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

Defined in: [packages/new-backend/src/services/rbac.service.ts:191](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/services/rbac.service.ts#L191)

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
