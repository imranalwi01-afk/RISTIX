[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: getPendingApprovalsForUser()

> **getPendingApprovalsForUser**(`userId`, `tenantId`): `Effect`\<`object`[], [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>

Defined in: [src/services/approval.service.ts:862](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/services/approval.service.ts#L862)

Get pending approvals for a user by checking their roles against matrix requirements.

## Parameters

### userId

`string`

The user ID

### tenantId

`string`

The tenant ID

## Returns

`Effect`\<`object`[], [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>

An Effect resolving to an array of pending requests available for the user to approve
