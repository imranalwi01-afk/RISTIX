[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: getPendingApprovalsForUser()

> **getPendingApprovalsForUser**(`userId`, `tenantId`): `Effect`\<`object`[], [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>

Defined in: [packages/new-backend/src/services/approval.service.ts:282](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/services/approval.service.ts#L282)

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
